import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, f1_score, confusion_matrix
import joblib

# ---------------------------------------------------------
# BAGIAN 1: PERSIAPAN DATA (Load data yang sudah dilabeli)
# ---------------------------------------------------------
try:
    df = pd.read_csv('data_sensor.csv')
except FileNotFoundError:
    print("❌ Error: File 'labeled_sensor_data.csv' tidak ditemukan. Jalankan script generate data dulu.")
    exit()

# Pisahkan Fitur (X) dan Target/Label (y)
# Fitur: Data sensor yang akan dipelajari
X = df[['earth_humidity', 'air_temperature', 'air_humidity', 'luminance']]

# Target: Hasil klasifikasi (0=Normal, 1=Warning, 2=Critical)
y = df['label']

# Split Data: 80% untuk Latihan (Train), 20% untuk Ujian (Test)
# stratify=y memastikan proporsi kelas (Normal/Warning/Critical) seimbang di kedua set
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"📊 Data Latih: {len(X_train)} baris")
print(f"📊 Data Uji: {len(X_test)} baris")

# ---------------------------------------------------------
# BAGIAN 2: TRAINING MODEL
# ---------------------------------------------------------
print("\n🤖 Sedang melatih model Random Forest...")

# Inisialisasi Model
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Proses Training (Fit)
model.fit(X_train, y_train)

# ---------------------------------------------------------
# BAGIAN 3: EVALUASI (TESTING)
# ---------------------------------------------------------
print("\n📝 Melakukan evaluasi...")

# Minta model memprediksi data ujian (X_test)
y_pred = model.predict(X_test)

# Hitung Skor Evaluasi
# F1 Score sangat penting jika data tidak seimbang (imbalanced data)
f1 = f1_score(y_test, y_pred, average='weighted')

print(f"✅ Weighted F1 Score: {f1:.4f} (Semakin dekat ke 1.0 semakin bagus)")
print("\n--- Detail Laporan Klasifikasi ---")
print(classification_report(y_test, y_pred, target_names=['Normal', 'Warning', 'Critical']))

print("\n--- Confusion Matrix (Kebenaran Prediksi) ---")
# Baris = Kunci Jawaban (Asli), Kolom = Jawaban Model (Prediksi)
print(confusion_matrix(y_test, y_pred))

# ---------------------------------------------------------
# BAGIAN 4: SIMPAN MODEL JADI
# ---------------------------------------------------------
joblib.dump(model, 'model_final.pkl')
print("\n💾 Model berhasil disimpan sebagai 'model_final.pkl'")