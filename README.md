# Proyek ASCON IoT 🔒

Proyek ini adalah implementasi sistem keamanan *end-to-end* pada perangkat Internet of Things (IoT) menggunakan algoritma kriptografi ringan **ASCON**. Sistem ini menghubungkan mikrokontroler ESP32 dengan Dashboard Monitoring berbasis Web React melalui protokol MQTT yang aman.

## 📂 Struktur Direktori

Berikut adalah penjelasan singkat mengenai file-file utama dalam proyek ini:

| File / Folder             | Deskripsi                                                                  |
| :------------------------ | :------------------------------------------------------------------------- |
| `ascon.py`              | Library Python untuk algoritma enkripsi/dekripsi ASCON.                    |
| `main.py`               | Script utama yang dijalankan oleh ESP32 (koneksi WiFi, MQTT, loop sensor). |
| `wifimgr.py`            | Modul untuk menangani koneksi WiFi secara otomatis pada ESP32.             |
| `Publisher_Example.py`  | Contoh script sederhana untuk mengirim data terenkripsi.                   |
| `Subscriber2.py`        | Script python untuk menerima dan mendekripsi data (testing tanpa web).     |
| `storage_check.py`      | Utilitas untuk mengecek sisa memori flash pada ESP32.                      |
| `ESP32_GENERIC-....bin` | Firmware MicroPython versi 1.26.1 yang digunakan.                          |
| `dashboard/react/`      | Source code aplikasi Web Dashboard (menggunakan React & Vite).             |
| `dashboard/bootstrap/`  | Template aset desain UI/UX.                                                |

## 🛠️ Prasyarat

Sebelum memulai, pastikan memiliki:

1. **Hardware:** Development board ESP32.
2. **Software:**
   * [Adafruit-ampy](https://github.com/adafruit/ampy) (untuk upload code ke ESP32).
   * [Node.js](https://nodejs.org/) (untuk menjalankan dashboard).
   * MQTT Broker.

## Cara Instalasi & Penggunaan

### Bagian 1: Perangkat Keras (ESP32)

1. **Flash Firmware:**
   Flash file `ESP32_GENERIC-20250911-v1.26.1.bin` ke ESP32.
2. **Upload Kode:**
   Upload file berikut ke dalam ESP32:

   * `ascon.py`
   * `wifimgr.py`
   * `main.py`
3. **Konfigurasi:**
   Buka `main.py` dan sesuaikan kredensial WiFi serta alamat MQTT Broker. Pastikan `KEY` dan `NONCE` untuk enkripsi diset dengan benar (16 bytes).

### Bagian 2: Web Dashboard `thepantauair.web.app`

Dashboard digunakan untuk memantau data sensor secara *real-time*.

1. Buka terminal dan masuk ke folder react:

   ```bash
   cd dashboard/react
   ```
2. Install dependensi:

   ```bash
   npm install
   ```
3. Jalankan server development:

   ```bash
   npm start
   ```
4. Buka browser dan akses `http://localhost:5173`.

5. Atau cukup akses `thepantauair.web.app`. 
   Jangan gunakan password yang sama dengan password email untuk mengakses dashboard.
    
### Bagian 3: API 
API yang terdapat pada proyek ini merupakan API yang aman untuk di share dan diakses oleh siapapun.
Firebase yang digunakan adalah Firebase Spark plan yang gratis. 
Firebase Spark plan memiliki limit 1000 request per hari.

Untuk mengubah API key, silahkan mengubah pada folder `config`.

## 🔐 Konsep Keamanan (ASCON)

Data yang dikirim dari ESP32 tidak berupa *plaintext*, melainkan *ciphertext* yang telah dienkripsi menggunakan **ASCON-128**.

- **ESP32:** Melakukan enkripsi payload sensor -> Publish ke MQTT.
- **Dashboard:** Subscribe ke MQTT -> Melakukan dekripsi menggunakan Key yang sama -> Menampilkan data.

## 🤝 Kontribusi

Silakan lakukan *Fork* dan *Pull Request* jika ingin menambahkan fitur baru atau memperbaiki *bug*.

## Dibuat Oleh: 
##### Daffa Fawwaz Garibaldi	/	235150307111011
##### Gilang Shido Faizalhaq	/	235150300111011
##### Peter Abednego Wijaya	/	235150300111013
##### Muhfi Fawwaz Rizqullah	/	235150307111009

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).

---

