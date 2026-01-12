import streamlit as st
import pandas as pd
import numpy as np
import time
import joblib
import os
import json
import warnings
import paho.mqtt.client as mqtt
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier

# ==========================================
# 0. KONFIGURASI
# ==========================================
warnings.filterwarnings('ignore') 
st.set_page_config(page_title="ESP32 IoT & ML Dashboard", page_icon="📡", layout="wide")

# MQTT CONFIG
MQTT_BROKER = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC_PUB = "chilihub/predictions/class"

# ==========================================
# 1. SETUP MQTT CLIENT
# ==========================================
@st.cache_resource
def setup_mqtt_client():
    client = mqtt.Client()
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_start()
        return client
    except Exception as e:
        st.error(f"Gagal koneksi ke MQTT Broker: {e}")
        return None

mqtt_client = setup_mqtt_client()

# ==========================================
# 2. FUNGSI LOAD MODEL
# ==========================================
@st.cache_resource
def get_model():
    model_path = 'model_final.pkl'
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
# 3. FUNGSI BACA DATA + SENSOR HEALTH
# ==========================================
def get_sensor_data_esp32():
    try:
        if not os.path.exists("latest_data.json"): 
            return None 
        with open("latest_data.json", "r") as f:
            data = json.load(f)
        
        # Extract sensor health
        sensor_health = data.get('sensor_health', {})
        
        return {
            'timestamp': data.get('timestamp'),
            'temp': float(data.get('temp', 0)),
            'rh_air': float(data.get('rh_air', 0)),
            'rh_soil': float(data.get('rh_soil', 0)),
            'lux': float(data.get('lux', 0)),
            'dht_ok': sensor_health.get('dht_ok', False),
            'photo_ok': sensor_health.get('photo_ok', False),
            'soil_ok': sensor_health.get('soil_ok', False)
        }
    except Exception as e:
        st.sidebar.error(f"Error membaca data: {e}")
        return None

# ==========================================
# 4. FUNGSI ANALISIS & REKOMENDASI
# ==========================================
def get_recommendations(temp, rh_air, rh_soil, lux, status):
    """
    Memberikan rekomendasi berdasarkan HASIL PREDIKSI MODEL
    dan nilai sensor untuk konteks tambahan
    """
    recommendations = []
    
    if status == "CRITICAL":
        recommendations.append("⚠️ Lakukan pengecekan dan tindakan korektif segera")
    
    elif status == "WARNING":
        recommendations.append(" Monitor perkembangan dengan seksama")
    
    else:  # NORMAL
        recommendations.append(" Pertahankan kondisi ini")
    
    return recommendations

def get_sensor_status_summary(dht_ok, photo_ok, soil_ok):
    total = 3
    working = sum([dht_ok, photo_ok, soil_ok])
    
    if working == total:
        return "🟢 Semua Sensor Normal", "success"
    elif working >= 2:
        return "🟡 Ada Sensor Bermasalah", "warning"
    else:
        return "🔴 Banyak Sensor Error", "error"

# ==========================================
# 5. STATISTIK & ANALISIS
# ==========================================
def calculate_statistics(df):
    if len(df) == 0:
        return None
    
    stats = {
        'temp_avg': df['Suhu Udara'].mean(),
        'temp_max': df['Suhu Udara'].max(),
        'temp_min': df['Suhu Udara'].min(),
        'rh_air_avg': df['Kelembapan Udara'].mean(),
        'rh_soil_avg': df['Tanah'].mean(),
        'lux_avg': df['Cahaya'].mean(),
        'normal_count': (df['Prediksi'] == 'NORMAL').sum(),
        'warning_count': (df['Prediksi'] == 'WARNING').sum(),
        'critical_count': (df['Prediksi'] == 'CRITICAL').sum()
    }
    return stats

# ==========================================
# 6. INITIALIZE SESSION STATE
# ==========================================
COL_NAMES = ['Waktu', 'Tanah', 'Suhu Udara', 'Kelembapan Udara', 'Cahaya', 'Prediksi']

if 'data_history' not in st.session_state:
    st.session_state.data_history = pd.DataFrame(columns=COL_NAMES)

if 'sensor_error_log' not in st.session_state:
    st.session_state.sensor_error_log = []

if 'total_predictions' not in st.session_state:
    st.session_state.total_predictions = 0

if 'mqtt_sent_count' not in st.session_state:
    st.session_state.mqtt_sent_count = 0

# ==========================================
# 7. UI HEADER
# ==========================================
st.title("📡 Dashboard Monitoring IoT & Machine Learning")
st.caption("Sistem monitoring real-time dengan analisis prediktif dan health check sensor")

if status_model == "dummy":
    st.warning("⚠️ Menggunakan Model Simulasi (Dummy Model)")
else:
    if 'model_notified' not in st.session_state:
        st.toast("✅ Model ML Siap Digunakan!", icon="✅")
        st.session_state['model_notified'] = True

st.markdown("---")

# ==========================================
# 8. SIDEBAR CONTROLS
# ==========================================
st.sidebar.header("🎛️ Panel Kontrol")

# Tabs di sidebar
tab_control, tab_settings, tab_info = st.sidebar.tabs(["Kontrol", "Pengaturan", "Info"])

with tab_control:
    is_running = st.toggle("🔴 Mulai Monitoring", value=False)
    
    if st.button("🗑️ Hapus Riwayat Data"):
        st.session_state.data_history = pd.DataFrame(columns=COL_NAMES)
        st.session_state.sensor_error_log = []
        st.success("Data direset!")
    
    if st.button("📥 Ekspor Data CSV"):
        if len(st.session_state.data_history) > 0:
            csv = st.session_state.data_history.to_csv(index=False)
            st.download_button("Download CSV", csv, "sensor_data.csv", "text/csv")
        else:
            st.warning("Tidak ada data untuk diekspor")

with tab_settings:
    refresh_rate = st.slider("Refresh Rate (detik)", 1.0, 10.0, 2.0, 0.5)
    max_history = st.slider("Maksimal Data Tersimpan", 20, 200, 50, 10)
    show_raw_data = st.checkbox("Tampilkan Data Mentah", value=False)
    show_stats = st.checkbox("Tampilkan Statistik", value=True)

with tab_info:
    st.metric("Total Prediksi", st.session_state.total_predictions)
    st.metric("MQTT Terkirim", st.session_state.mqtt_sent_count)
    st.caption(f"Broker: {MQTT_BROKER}")
    st.caption(f"Topik Pub: {MQTT_TOPIC_PUB}")

# ==========================================
# 9. MAIN DASHBOARD LOOP
# ==========================================
placeholder_main = st.empty()
placeholder_health = st.empty()
placeholder_recommendations = st.empty()
placeholder_charts = st.empty()
placeholder_stats = st.empty()
placeholder_raw = st.empty()

while is_running:
    sensor_data = get_sensor_data_esp32()
    
    if sensor_data is None:
        with placeholder_main.container():
            st.error("❌ Tidak dapat membaca data sensor. Pastikan mqtt_subscriber.py berjalan!")
        time.sleep(refresh_rate)
        continue
    
    # Extract data
    timestamp = sensor_data['timestamp']
    temp = sensor_data['temp']
    rh_air = sensor_data['rh_air']
    rh_soil = sensor_data['rh_soil']
    lux = sensor_data['lux']
    dht_ok = sensor_data['dht_ok']
    photo_ok = sensor_data['photo_ok']
    soil_ok = sensor_data['soil_ok']
    
    # SENSOR HEALTH CHECK
    with placeholder_health.container():
        st.subheader("🔧 Status Kesehatan Sensor")
        col_s1, col_s2, col_s3, col_s4 = st.columns(4)
        
        # Individual sensor status
        col_s1.metric("DHT22 (Temp/Humidity)", "✅ OK" if dht_ok else "❌ ERROR", 
                     delta=None, delta_color="normal" if dht_ok else "inverse")
        col_s2.metric("BH1750 (Cahaya)", "✅ OK" if photo_ok else "❌ ERROR",
                     delta=None, delta_color="normal" if photo_ok else "inverse")
        col_s3.metric("Soil Moisture", "✅ OK" if soil_ok else "❌ ERROR",
                     delta=None, delta_color="normal" if soil_ok else "inverse")
        
        # Overall status
        overall_msg, overall_type = get_sensor_status_summary(dht_ok, photo_ok, soil_ok)
        if overall_type == "success":
            col_s4.success(overall_msg)
        elif overall_type == "warning":
            col_s4.warning(overall_msg)
        else:
            col_s4.error(overall_msg)
        
        # Log sensor errors
        if not (dht_ok and photo_ok and soil_ok):
            error_detail = []
            if not dht_ok: error_detail.append("DHT22")
            if not photo_ok: error_detail.append("BH1750")
            if not soil_ok: error_detail.append("Soil")
            
            error_entry = {
                'time': timestamp,
                'sensors': ', '.join(error_detail)
            }
            if error_entry not in st.session_state.sensor_error_log[-5:]:
                st.session_state.sensor_error_log.append(error_entry)
        
        # Show recent errors
        if len(st.session_state.sensor_error_log) > 0:
            with st.expander("📋 Riwayat Error Sensor (5 terakhir)"):
                for err in st.session_state.sensor_error_log[-5:]:
                    st.caption(f"⏰ {err['time']} - Sensor bermasalah: {err['sensors']}")
    
    st.markdown("---")
    
    # PREDICTION
    input_df = pd.DataFrame(
        [[rh_soil, temp, rh_air, lux]], 
        columns=['earth_humidity', 'air_temperature', 'air_humidity', 'luminance']
    )
    
    try:
        prediksi_label = model.predict(input_df)[0]
        st.session_state.total_predictions += 1
    except:
        prediksi_label = 0 

    label_map = {0: "NORMAL", 1: "WARNING", 2: "CRITICAL"}
    status_text = label_map.get(prediksi_label, "UNKNOWN")
    
    # MQTT PUBLISH
    if mqtt_client:
        try:
            payload_kirim = json.dumps({
                "status": status_text,
                "code": int(prediksi_label),
                "timestamp": timestamp,
                "sensors_ok": dht_ok and photo_ok and soil_ok
            })
            
            mqtt_client.publish(MQTT_TOPIC_PUB, payload_kirim)
            st.session_state.mqtt_sent_count += 1
            
        except Exception as e:
            st.sidebar.error(f"MQTT Error: {e}")
    
    # SAVE HISTORY
    new_row = pd.DataFrame({
        'Waktu': [timestamp],
        'Tanah': [rh_soil],
        'Suhu Udara': [temp],
        'Kelembapan Udara': [rh_air],
        'Cahaya': [lux],
        'Prediksi': [status_text]
    })
    
    st.session_state.data_history = pd.concat([st.session_state.data_history, new_row], ignore_index=True)
    if len(st.session_state.data_history) > max_history:
        st.session_state.data_history = st.session_state.data_history.tail(max_history)

    # MAIN KPI DISPLAY
    with placeholder_main.container():
        st.subheader("📊 Data Sensor Real-time")
        kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
        
        kpi1.metric("🌡️ Suhu", f"{temp:.1f} °C", 
                   delta=f"{temp - st.session_state.data_history['Suhu Udara'].mean():.1f}" if len(st.session_state.data_history) > 1 else None)
        kpi2.metric("💧 Kelembapan Udara", f"{rh_air:.1f} %",
                   delta=f"{rh_air - st.session_state.data_history['Kelembapan Udara'].mean():.1f}" if len(st.session_state.data_history) > 1 else None)
        kpi3.metric("🌱 Kelembapan Tanah", f"{rh_soil:.1f} %",
                   delta=f"{rh_soil - st.session_state.data_history['Tanah'].mean():.1f}" if len(st.session_state.data_history) > 1 else None)
        kpi4.metric("☀️ Intensitas Cahaya", f"{lux:.0f} lux",
                   delta=f"{lux - st.session_state.data_history['Cahaya'].mean():.0f}" if len(st.session_state.data_history) > 1 else None)
        
        # Status Prediksi dengan warna
        if prediksi_label == 0: 
            kpi5.success(f"✅ {status_text}")
        elif prediksi_label == 1: 
            kpi5.warning(f"⚠️ {status_text}")
        else: 
            kpi5.error(f"🚨 {status_text}")
        
        st.caption(f"⏰ Update terakhir: {timestamp}")
    
    # RECOMMENDATIONS
    with placeholder_recommendations.container():
        recommendations = get_recommendations(temp, rh_air, rh_soil, lux, status_text)
        
        st.subheader("💡 Rekomendasi & Analisis")
        for rec in recommendations:
            if "🚨" in rec or "🔴" in rec:
                st.error(rec)
            elif "⚠️" in rec or "🟡" in rec:
                st.warning(rec)
            else:
                st.info(rec)
    
    st.markdown("---")
    
    # CHARTS
    with placeholder_charts.container():
        st.subheader("📈 Grafik Monitoring Real-time")
        
        if len(st.session_state.data_history) > 0:
            chart_col1, chart_col2 = st.columns(2)
            
            with chart_col1:
                st.caption("Suhu & Kelembapan")
                st.line_chart(st.session_state.data_history.set_index('Waktu')[['Suhu Udara', 'Kelembapan Udara', 'Tanah']])
            
            with chart_col2:
                st.caption("Intensitas Cahaya")
                st.line_chart(st.session_state.data_history.set_index('Waktu')[['Cahaya']], color="#FFA500")
            
            # Distribution chart
            st.caption("📊 Distribusi Status Prediksi")
            status_counts = st.session_state.data_history['Prediksi'].value_counts()
            st.bar_chart(status_counts)
    
    # STATISTICS
    if show_stats:
        with placeholder_stats.container():
            st.markdown("---")
            st.subheader("📉 Statistik Sesi Monitoring")
            
            stats = calculate_statistics(st.session_state.data_history)
            if stats:
                stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)
                
                stat_col1.metric("Suhu Rata-rata", f"{stats['temp_avg']:.1f} °C")
                stat_col1.caption(f"Min: {stats['temp_min']:.1f} | Max: {stats['temp_max']:.1f}")
                
                stat_col2.metric("Kelembapan Udara Avg", f"{stats['rh_air_avg']:.1f} %")
                stat_col3.metric("Kelembapan Tanah Avg", f"{stats['rh_soil_avg']:.1f} %")
                stat_col4.metric("Cahaya Rata-rata", f"{stats['lux_avg']:.0f} lux")
                
                st.caption(f"Status: {stats['normal_count']} Normal | {stats['warning_count']} Warning | {stats['critical_count']} Critical")
    
    # RAW DATA TABLE
    if show_raw_data:
        with placeholder_raw.container():
            st.markdown("---")
            st.subheader("📋 Tabel Data Mentah")
            st.dataframe(st.session_state.data_history.tail(20), use_container_width=True)
    
    time.sleep(refresh_rate)

# ==========================================
# 10. INFO KETIKA TIDAK MONITORING
# ==========================================
if not is_running:
    st.info("👆 Aktifkan toggle 'Mulai Monitoring' di sidebar untuk memulai monitoring real-time")
    
    # Show last data if available
    if len(st.session_state.data_history) > 0:
        st.subheader("📊 Data Terakhir yang Tersimpan")
        st.dataframe(st.session_state.data_history.tail(10), use_container_width=True)