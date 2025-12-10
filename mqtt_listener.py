import paho.mqtt.client as mqtt
import json
import time

# --- KONFIGURASI ---
# Kita pakai broker gratisan publik untuk tes
BROKER = "broker.emqx.io"
PORT = 1883
TOPIC = "chilihub/data/sensors"
DATA_FILE = "latest_data.json"

def on_connect(client, userdata, flags, rc):
    print(f"✅ Terhubung ke MQTT Broker! (Code: {rc})")
    client.subscribe(TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        print(f"📩 Terima Data: {payload}")
        
        # Parse data JSON
        data = json.loads(payload)
        
        # Tambahkan waktu terima
        data['timestamp'] = time.strftime("%H:%M:%S")
        
        # Simpan ke file agar bisa dibaca Dashboard
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f)
            
    except Exception as e:
        print(f"❌ Error: {e}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

print("📡 Sedang mendengarkan data dari MQTT...")
client.connect(BROKER, PORT, 60)
client.loop_forever()