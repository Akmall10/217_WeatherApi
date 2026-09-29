# 217_WeatherApi 🌦️🗺️

> **Tugas Praktikum Pemrograman Web Service (PWS)**  
> **Nama Repository:** `217_WeatherApi`  
> **Identitas Mahasiswa:** NIM Belakang **217**

---

## 📌 Deskripsi Proyek
**GeoWeather Explorer** adalah aplikasi antarmuka berbasis web (HTML5, Vanilla CSS3 Modern Glassmorphism, dan JavaScript) yang mengintegrasikan **MapTiler Geocoding API** ([https://api.maptiler.com/](https://api.maptiler.com/)) dan **Weather Forecast API** untuk melakukan pencarian lokasi geografis serta menampilkan informasi cuaca terkini secara *real-time*.

Aplikasi dirancang secara interaktif dan responsif, dilengkapi peta interaktif (Leaflet.js + MapTiler Map Tiles), visualisasi siklus matahari, grafik prakiraan cuaca 24 jam & 7 hari, serta panel inspeksi JSON / Postman Assistant.

---

## 🎯 Data Wajib yang Ditampilkan
Sesuai dengan ketentuan tugas, aplikasi mengekstrak dan menampilkan 6 parameter utama:

| No | Parameter Data | Deskripsi | Contoh Output |
|:---|:---|:---|:---|
| 1 | **Lokasi: `<Input>`** | Nama lokasi yang dicari / dipilih pengguna | `Kebayoran Baru` |
| 2 | **Negara** | Nama negara hasil geocoding | `Indonesia` (ID) |
| 3 | **Provinsi** | Wilayah administratif tingkat 1 | `Daerah Khusus Ibukota Jakarta` |
| 4 | **Kecamatan** | Wilayah administratif tingkat 2/3 (Distrik/Kecamatan) | `Kebayoran Baru` |
| 5 | **Longitude** | Koordinat garis bujur (Sumbu X) | `106.797232° E` |
| 6 | **Latitude** | Koordinat garis lintang (Sumbu Y) | `-6.249779° S` |

---

## 🌟 Fitur Unggulan (Tampilan Kreatif)
1. **Glassmorphism Dark UI**: Desain modern dengan efek blur, gradasi luminous, dan animasi interaktif.
2. **Interactive Map (MapTiler Tiles & Leaflet)**:
   - Visualisasi pin lokasi dengan animasi detak (*pulsing ripple*).
   - Dukungan *layer switcher* (Streets, Satellite, Topographic, Dark Mode).
   - **Click to Reverse-Geocode**: Klik di titik mana saja pada peta untuk mendeteksi nama kecamatan, provinsi, negara, serta cuaca lokasi tersebut secara instan.
3. **Prakiraan Cuaca Real-time**:
   - Suhu aktual (°C), suhu terasa (*apparent temperature*), kelembapan, kecepatan angin, indeks UV, tekanan udara, dan jarak pandang.
   - Ikon cuaca dinamis berdasarkan standar WMO (*World Meteorological Organization*).
   - Slider prakiraan per jam (24 Jam) dan kartu prakiraan 7 hari ke depan.
4. **Pencarian Cepat & GPS Geolocation**:
   - Tombol *quick-pill* kota/kecamatan populer (Kebayoran Baru, Sleman, Coblong, Yogyakarta, Surabaya, Denpasar, Tokyo, London).
   - Tombol **GPS Saya** untuk mendeteksi koordinat perangkat secara langsung (*HTML5 Geolocation API*).
5. **API Inspector & Postman Collection**:
   - Panel *Raw JSON Viewer* untuk melihat respons data mentah dari API.
   - Tombol *One-click copy* untuk URL cURL dan Postman.
   - File `postman_collection.json` siap di-import ke Postman.

---

## 📸 Bukti Hasil Data GET (Screenshots)

### 1. Screenshot Hasil Data GET di Browser
> *Antarmuka GeoWeather Explorer menampilkan ke-6 data wajib (Lokasi, Negara, Provinsi, Kecamatan, Longitude, Latitude) dan peta interaktif.*

![Browser Screenshot](screenshots/browser_screenshot.png)

*(Ganti file `screenshots/browser_screenshot.png` dengan screenshot layar browser kamu)*

---

### 2. Screenshot Hasil Data GET di Postman
> *Pengujian request GET ke endpoint MapTiler Geocoding API melalui Postman dengan respons status `200 OK`.*

![Postman Screenshot](screenshots/postman_screenshot.png)

*(Ganti file `screenshots/postman_screenshot.png` dengan screenshot aplikasi Postman kamu)*

---

## 🛠️ Endpoint API yang Digunakan

### 1. MapTiler Geocoding API (Direct Search)
- **Method:** `GET`
- **URL:** `https://api.maptiler.com/geocoding/{query}.json?key={YOUR_API_KEY}&language=id`
- **Parameter:**
  - `{query}`: Nama lokasi pencarian (contoh: `Kebayoran Baru`, `Sleman`, dll.)
  - `key`: API Key MapTiler
  - `language`: `id` (Bahasa Indonesia)

### 2. MapTiler Reverse Geocoding API (Peta / GPS)
- **Method:** `GET`
- **URL:** `https://api.maptiler.com/geocoding/{longitude},{latitude}.json?key={YOUR_API_KEY}&language=id`

### 3. Open-Meteo Weather Forecast API
- **Method:** `GET`
- **URL:** `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`

---

## 🚀 Cara Menjalankan Project

### 1. Menggunakan Live Server di VS Code (Disarankan)
1. Buka folder project di VS Code.
2. Pastikan ekstensi **Live Server** telah terpasang.
3. Klik kanan pada file `index.html` -> Pilih **"Open with Live Server"** (atau klik *Go Live* di status bar bawah).
4. Browser akan terbuka di `http://127.0.0.1:5500`.

### 2. Menggunakan Postman untuk Pengujian API
1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di kiri atas -> Pilih file [`postman_collection.json`](postman_collection.json).
3. Jalankan request **"1. MapTiler Geocoding - Cari Lokasi (Kebayoran Baru)"**.
4. Ambil screenshot layar Postman untuk dokumentasi.

---

## 📦 Struktur Folder
```text
217_WeatherApi/
├── index.html               # Struktur HTML5 antarmuka aplikasi
├── style.css                # Styling modern glassmorphism & responsive CSS
├── app.js                   # Logika integrasi API, parsing data, peta Leaflet & cuaca
├── postman_collection.json  # File koleksi request Postman
├── README.md                # Dokumentasi lengkap tugas
└── screenshots/             # Folder penyimpanan screenshot browser & Postman
    ├── browser_screenshot.png
    └── postman_screenshot.png
```

---

## 💡 Ekstensi VS Code yang Direkomendasikan
Untuk pengalaman pengembangan dan pengujian terbaik, pasang ekstensi berikut di VS Code:
1. **Live Server** (`ritwickdey.liveserver`) – Menjalankan local development server dengan hot reload otomatis.
2. **Postman** (`Postman.postman-for-vscode`) atau **Thunder Client** – Melakukan pengujian API langsung di dalam editor.
3. **GitLens** (`eamodio.gitlens`) & **Git Graph** – Memantau riwayat dan visualisasi commit Git.
4. **Prettier - Code Formatter** (`esbenp.prettier-vscode`) – Merapikan format kode secara otomatis.
5. **HTML CSS Support** & **Auto Rename Tag** – Mempercepat penulisan tag HTML dan selector CSS.

---

## 📝 Riwayat Commit Git (Minimal 5 Commits)
1. `feat: setup HTML5 boilerplate, semantic layout, and project structure`
2. `feat: implement modern glassmorphism UI design system and responsive styles`
3. `feat: implement MapTiler geocoding API integration and location extraction (country, province, district, coordinates)`
4. `feat: add postman collection for API testing and grading verification`
5. `feat: add screenshots directory and placeholder guides`
6. `docs: add comprehensive README.md with NIM 217 details, API documentation, and screenshot guidelines`

---

*Disusun untuk memenuhi tugas praktikum mata kuliah Pemrograman Web Service (PWS).*
