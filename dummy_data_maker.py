import pandas as pd
import random
from datetime import datetime, timedelta

# ==========================================
# 1. KONFIGURASI THRESHOLD (Acuan Generate)
# ==========================================
# Kita simpan ini agar generator tau mana angka "bagus" dan "jelek"
THRESHOLDS = {
    'temp': {'min': 18, 'max': 27},
    'soil': {'min': 60, 'max': 80},
    'lux':  {'min': 19000, 'max': 40000},
    'air':  {'min': 70, 'max': 80}
}

# Batas Fisik Sensor (Range Maksimal/Minimal yang mungkin terbaca alat)
RANGES = {
    'temp': (0, 45),
    'soil': (0, 100),
    'lux':  (0, 100000), 
    'air':  (20, 100)
}

# ==========================================
# 2. FUNGSI GENERATOR NILAI
# ==========================================
def get_random_value(param, is_safe):
    """
    Menghasilkan satu nilai sensor.
    is_safe = True  -> Nilai pasti Normal (dalam threshold)
    is_safe = False -> Nilai pasti Error (di luar threshold)
    """
    t_min = THRESHOLDS[param]['min']
    t_max = THRESHOLDS[param]['max']
    r_min, r_max = RANGES[param]
    
    if is_safe:
        return random.uniform(t_min, t_max)
    else:
        # Acak: Error Bawah atau Error Atas
        if random.random() < 0.5:
            # Pastikan tidak minus jika range min 0
            val = random.uniform(r_min, t_min - 2)
        else:
            val = random.uniform(t_max + 2, r_max)
        return val

def generate_raw_reading(scenario_type):
    """
    Fungsi ini hanya meminjam logika skenario untuk memastikan
    data yang keluar bervariasi (tidak semuanya normal).
    """
    sensors = ['temp', 'soil', 'lux', 'air']
    
    # scenario_type hanyalah "seed" internal agar data bervariasi
    if scenario_type == 0: 
        # Tipe A: Semua sensor Aman (Calon data Normal)
        num_errors = 0
    elif scenario_type == 1:
        # Tipe B: 1-2 Sensor Error (Calon data Warning)
        num_errors = random.choice([1, 2])
    else: 
        # Tipe C: 3-4 Sensor Error (Calon data Critical)
        num_errors = random.choice([3, 4])

    # Pilih sensor mana yang akan dibuat nilainya ngaco
    error_sensors = random.sample(sensors, num_errors)
    
    # Generate nilai mentah
    vals = {}
    for sensor in sensors:
        # Jika sensor ada di list error, generate nilai ngaco. Jika tidak, nilai aman.
        is_safe = sensor not in error_sensors
        vals[sensor] = round(get_random_value(sensor, is_safe), 1)
        
    return vals

# ==========================================
# 3. EKSEKUSI GENERATE 300 DATA
# ==========================================
data_rows = []
start_time = datetime.now()

# Kita buat "Skenario Bayangan" agar data nanti pas di-labeling hasilnya imbang.
# 100 data potensi Normal, 100 data potensi Warning, 100 data potensi Critical
seeds = [0]*800 + [1]*600 + [2]*600
random.shuffle(seeds)

print("🔄 Sedang men-generate 300 data mentah...")

for i, seed in enumerate(seeds):
    current_time = start_time + timedelta(minutes=i*15)
    
    # Ambil nilai sensor
    readings = generate_raw_reading(seed)
    
    data_rows.append({
        'timestamp': current_time,
        'earth_humidity': readings['soil'],      
        'air_temperature': readings['temp'],    
        'air_humidity': readings['air'],       
        'luminance': readings['lux']
        # Tidak ada label, tidak ada violation_count
    })

# ==========================================
# 4. SIMPAN CSV
# ==========================================
df = pd.DataFrame(data_rows)
df = df.set_index('timestamp')

filename = 'raw_sensor_data.csv'
df.to_csv(filename)

print(f"✅ Selesai! File '{filename}' telah dibuat.")
print(f"📊 Dimensi Data: {df.shape} (300 Baris, 4 Kolom Sensor)")
print("\nContoh 5 Data Mentah Teratas:")
print(df.head())