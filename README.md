# Chili-Hub: Sistem Pemantauan & Otomasi Pertanian Cabai Berbasis IoT
**Universitas Gadjah Mada - 2025**

Proyek "Chili-Hub" merancang sebuah prototipe **sistem IoT untuk pemantauan dan otomasi pertanian cabai** guna mengatasi tantangan budidaya seperti perubahan cuaca drastis dan pemantauan manual yang tidak efisien. Sistem ini menggunakan **ESP32** untuk mengumpulkan data lingkungan secara *real-time* dan mengirimkannya ke dasbor cloud, serta mengaktifkan aktuator secara otomatis.

---

## 🚀 Fitur Utama

* **Pemantauan Real-Time:** Membaca data suhu udara, kelembaban udara (`DHT22`), kelembaban tanah (`Soil Moisture Sensor`), dan intensitas cahaya (`Photoresistor`).
* **Otomasi Irigasi:** Pompa air (disimulasikan dengan `Motor Servo`) aktif secara otomatis berdasarkan ambang batas kelembaban tanah (kontrol histeresis).
* **Dasbor Cloud:** Visualisasi data *real-time* menggunakan **Node-RED** yang terhubung ke broker **MQTT**.
* **Peringatan Lokal:** Menampilkan status dan data sensor pada **OLED Display** serta notifikasi anomali via **Indikator LED**.

---

## 🛠️ Komponen & Teknologi

### Perangkat Keras (Hardware)
* Mikrokontroler: **ESP32**
* Sensor:
    * `DHT-22` (Suhu & Kelembaban Udara)
    * `Soil Moisture Sensor` (Kelembaban Tanah)
    * `Photoresistor / LDR` (Intensitas Cahaya)
* Aktuator & Output:
    * `Motor Servo` (Simulasi Pompa Air)
    * `OLED Display` (Tampilan data lokal)
    * `LED` (Indikator status)

### Perangkat Lunak (Software)
* **Arduino IDE / C++:** Untuk pemrograman firmware ESP32.
* **MQTT (Message Queuing Telemetry Transport):** Protokol komunikasi ringan untuk mengirim data sensor.
* **Node-RED:** Platform *flow-based* untuk visualisasi data dan pembuatan dasbor.

---

## ⚙️ Arsitektur & Logika Sistem

Sistem bekerja dengan alur sebagai berikut:
1.  **Akuisisi Data:** ESP32 membaca semua data sensor secara periodik.
2.  **Kontrol Lokal:** ESP32 memeriksa data terhadap ambang batas. Jika tanah kering (misal, < 60%), servo (pompa) akan `ON`. Servo akan `OFF` saat tanah sudah cukup basah (misal, > 80%).
3.  **Transmisi Data:** ESP32 mempublikasikan (publish) semua data sensor ke topik-topik spesifik di broker MQTT.
4.  **Visualisasi:** Node-RED berlangganan (subscribe) ke topik-topik tersebut, menerima data, dan menampilkannya dalam bentuk *gauges* dan grafik pada dasbor web.

![Flowchart Sistem](assets/gambar-05-flowchart.png)
*Gambar: Flowchart Logika Sistem*

---

## 📊 Dasbor Pemantauan (Node-RED)

Dasbor Node-RED menyediakan antarmuka visual untuk memantau semua parameter lingkungan dari jarak jauh.

### Alur Node-RED
![Alur Node-RED](assets/gambar-14-nodered-flow.png)
*Gambar: Alur Node-RED yang menerima data MQTT dan meneruskannya ke UI*

### Tampilan Dasbor
![Dasbor Node-RED](assets/gambar-19-dashboard.png)
*Gambar: Tampilan dasbor lengkap dengan gauge dan grafik untuk semua sensor*

---

## 💡 Pengembangan Lanjutan

Rencana pengembangan di masa depan meliputi:
1.  **Deteksi Penyakit:** Integrasi model **Computer Vision (CNN)** untuk mendeteksi penyakit daun cabai secara otomatis.
2.  **Kontrol pH:** Penambahan sensor pH dan aktuator *dosing pump* untuk menstabilkan pH tanah.
3.  **Manajemen Cahaya:** Kontrol otomatis *grow lights* dan *shading nets* (penutup) berdasarkan data sensor cahaya.

---

## 👥 Anggota Tim

* Arnold G. B. S.
* Garjita Adicandra
* Muhammad Nabil Fitriansyah Boernama
* Rian Prasetya Munaji
