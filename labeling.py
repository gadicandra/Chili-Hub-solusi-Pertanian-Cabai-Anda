import pandas as pd

# ==========================================
# 1. KONFIGURASI THRESHOLD (Sama dengan Generator)
# ==========================================
# Pastikan angka ini SAMA PERSIS dengan acuan saat generate data
THRESHOLDS = {
    'temp': {'min': 18, 'max': 27},         # Suhu Udara (Celcius)
    'soil': {'min': 60, 'max': 80},         # Kelembaban Tanah (%)
    'lux':  {'min': 19000, 'max': 40000},   # Cahaya (Lux)
    'air':  {'min': 70, 'max': 80}          # Kelembaban Udara (%)
}

def determine_label(row):
    """
    Fungsi untuk memeriksa satu baris data dan menentukan labelnya
    """
    violations = 0
    
    # 1. Cek Suhu (air_temperature)
    val_temp = row['air_temperature']
    if not (THRESHOLDS['temp']['min'] <= val_temp <= THRESHOLDS['temp']['max']):
        violations += 1
        
    # 2. Cek Tanah (earth_humidity)
    val_soil = row['earth_humidity']
    if not (THRESHOLDS['soil']['min'] <= val_soil <= THRESHOLDS['soil']['max']):
        violations += 1
        
    # 3. Cek Cahaya (luminance)
    val_lux = row['luminance']
    if not (THRESHOLDS['lux']['min'] <= val_lux <= THRESHOLDS['lux']['max']):
        violations += 1
        
    # 4. Cek Udara (air_humidity)
    val_air = row['air_humidity']
    if not (THRESHOLDS['air']['min'] <= val_air <= THRESHOLDS['air']['max']):
        violations += 1
    
    # --- LOGIKA PELABELAN ---
    if violations == 0:
        return 0  # Normal
    elif 1 <= violations <= 2:
        return 1  # Warning
    else:
        return 2  # Critical (3 atau lebih)

# ==========================================
# 2. EKSEKUSI LABELING
# ==========================================
filename_input = 'raw_sensor_data.csv'
filename_output = 'labeled_sensor_data_1.csv'

try:
    # Load data mentah
    print(f"📂 Membaca file '{filename_input}'...")
    df = pd.read_csv(filename_input)
    
    # Terapkan fungsi labeling ke setiap baris
    print("🏷️ Sedang melakukan labeling otomatis...")
    df['label'] = df.apply(determine_label, axis=1)
    
    # Simpan hasil
    df.to_csv(filename_output, index=False)
    
    # ==========================================
    # 3. LAPORAN HASIL
    # ==========================================
    print(f"\n✅ Berhasil! File '{filename_output}' telah disimpan.")
    print("-" * 30)
    print("Statistik Label yang Terbentuk:")
    print(df['label'].value_counts().sort_index().rename({0: '0 - Normal', 1: '1 - Warning', 2: '2 - Critical'}))
    
    print("\nContoh Data Hasil Labeling:")
    # Menampilkan data beserta labelnya
    print(df[['earth_humidity', 'air_temperature', 'luminance', 'label']].head(5))

except FileNotFoundError:
    print(f"❌ Error: File '{filename_input}' tidak ditemukan. Jalankan kode generate data dulu!")