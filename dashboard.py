import streamlit as st
import pandas as pd
import numpy as np
import time
import joblib
import os
import json
import warnings
import paho.mqtt.client as mqtt  # <--- WAJIB IMPORT INI
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier

# ==========================================
# 0. KONFIGURASI
# ==========================================
warnings.filterwarnings('ignore') 
st.set_page_config(page_title="ESP32 IoT & ML Dashboard", page_icon="📡", layout="wide")

# === TAMBAHAN MQTT CONFIG ===
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC_PUB = "chilihub/predictions/class" # Topik untuk kirim hasil prediksi

# ==========================================
# 1. SETUP MQTT CLIENT
# ==========================================
@st.cache_resource
def setup_mqtt_client():
    client = mqtt.Client()
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start() # Jalan di background
        return client
    except Exception as e:
        st.error(f"Gagal koneksi ke MQTT Broker: {e}")
        return None

# Inisialisasi MQTT Client sekali saja
mqtt_client = setup_mqtt_client()

# ==========================================
# 2. FUNGSI LOAD MODEL
# ==========================================
@st.cache_resource
def get_model():
    model_path = 'model_sensor_final.pkl'
    expected_features = ['earth_humidity', 'air_temperature', 'air_humidity', 'luminance']
    
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            return model, "asli"
        except: pass 
    
    # Dummy Model
    X_dummy = pd.DataFrame(
        [[20, 30, 60, 5000], [50, 34, 55, 4000], [10, 40, 40, 1000], [80, 25, 80, 10000]],
        columns=expected_features
    )
    y_dummy = np.array([0, 0, 2, 0]) 
    model = RandomForestClassifier()
    model.fit(X_dummy, y_dummy)
    return model, "dummy"

model, status_model = get_model()

# ==========================================
# 3. FUNGSI BACA DATA
# ==========================================
def get_sensor_data_esp32():
    try:
        if not os.path.exists("latest_data.json"): return None 
        with open("latest_data.json", "r") as f:
            data = json.load(f)
        return (data.get('timestamp'), float(data.get('temp', 0)), 
                float(data.get('rh_air', 0)), float(data.get('rh_soil', 0)), 
                float(data.get('lux', 0)))
    except: return None

# ==========================================
# 4. UI & LOGIKA UTAMA
# ==========================================
st.title("📡 Dashboard Monitoring + MQTT Publish")

if status_model == "dummy":
    st.warning("⚠️ Menggunakan Model Simulasi.")
else:
    if 'model_notified' not in st.session_state:
        st.toast("Model Final Siap!", icon="✅")
        st.session_state['model_notified'] = True

st.markdown("---")

# Sidebar
st.sidebar.header("🎛️ Panel Kontrol")
is_running = st.sidebar.toggle("🔴 Mulai Monitoring & Publish", value=False)
refresh_rate = st.sidebar.slider("Kecepatan Refresh (detik)", 1.0, 5.0, 2.0)

COL_NAMES = ['Waktu', 'Tanah', 'Suhu Udara', 'Kelembapan Udara', 'Cahaya', 'Prediksi']
if 'data_history' not in st.session_state:
    st.session_state.data_history = pd.DataFrame(columns=COL_NAMES)

placeholder = st.empty()

while is_running:
    sensor_data = get_sensor_data_esp32()
    
    if sensor_data is None:
        time.sleep(1)
        continue 
        
    timestamp, temp, rh_air, rh_soil, lux = sensor_data
    
    # --- PREDIKSI ---
    input_df = pd.DataFrame(
        [[rh_soil, temp, rh_air, lux]], 
        columns=['earth_humidity', 'air_temperature', 'air_humidity', 'luminance']
    )
    
    try:
        prediksi_label = model.predict(input_df)[0]
    except:
        prediksi_label = 0 

    label_map = {0: "NORMAL", 1: "WARNING", 2: "CRITICAL"}
    status_text = label_map.get(prediksi_label, "UNKNOWN")
    
    # === TAMBAHAN MQTT PUBLISH ===
    if mqtt_client:
        try:
            # Buat payload JSON
            payload_kirim = json.dumps({
                "status": status_text,     # String: NORMAL/WARNING/CRITICAL
                "code": int(prediksi_label), # Integer: 0/1/2
                "timestamp": timestamp,
            })
            
            # Publish ke topik "chilihub/data/prediction"
            mqtt_client.publish(MQTT_TOPIC_PUB, payload_kirim)
            
            # Tampilkan indikator di Sidebar (biar user tahu dashboard sedang mengirim)
            st.sidebar.caption(f"📤 Terkirim ke MQTT: {status_text}")
            
        except Exception as e:
            st.sidebar.error(f"Gagal Publish: {e}")
    # ==============================

    # --- SIMPAN HISTORY ---
    new_row = pd.DataFrame({
        'Waktu': [timestamp],
        'Tanah': [rh_soil],
        'Suhu Udara': [temp],
        'Kelembapan Udara': [rh_air],
        'Cahaya': [lux],
        'Prediksi': [status_text]
    })
    
    st.session_state.data_history = pd.concat([st.session_state.data_history, new_row], ignore_index=True)
    if len(st.session_state.data_history) > 50:
        st.session_state.data_history = st.session_state.data_history.tail(50)

    # --- UI UPDATE ---
    with placeholder.container():
        kpi1, kpi2, kpi3, kpi4 = st.columns(4)
        kpi1.metric("Suhu", f"{temp:.1f} °C")
        kpi2.metric("Udara", f"{rh_air:.1f} %")
        kpi3.metric("Tanah", f"{rh_soil:.1f} %")
        
        if prediksi_label == 0: kpi4.success(f"{status_text}")
        elif prediksi_label == 1: kpi4.warning(f"{status_text}")
        else: kpi4.error(f"{status_text}")

        st.subheader("Grafik Real-time")
        col1, col2 = st.columns(2)
        col1.line_chart(st.session_state.data_history.set_index('Waktu')[['Suhu Udara', 'Kelembapan Udara', 'Tanah']])
        col2.line_chart(st.session_state.data_history.set_index('Waktu')[['Cahaya']], color="#FFA500")
    
    time.sleep(refresh_rate)