/**
 * GeoWeather Explorer - MapTiler Geocoding & Weather API Integration
 * Tugas Pemrograman Web Service (PWS)
 * NIM: 217 | Nama Repo: 217_WeatherApi
 */

// Global State
const state = {
  apiKey: localStorage.getItem('maptiler_api_key') || 'get_your_own_key', // MapTiler Key
  map: null,
  marker: null,
  currentTileLayer: null,
  mapStyle: 'streets-v2',
  lastGeocodingData: null,
  lastWeatherData: null,
  searchTimeout: null,
  currentLocationName: 'Kebayoran Baru'
};

// Weather Code Interpretation Map (WMO Code standard)
const weatherCodeMap = {
  0: { label: 'Cerah', icon: 'fa-sun', color: '#f59e0b' },
  1: { label: 'Cerah Berawan', icon: 'fa-cloud-sun', color: '#f59e0b' },
  2: { label: 'Berawan Sebagian', icon: 'fa-cloud-sun', color: '#94a3b8' },
  3: { label: 'Mendung / Berawan', icon: 'fa-cloud', color: '#64748b' },
  45: { label: 'Berkabut', icon: 'fa-smog', color: '#94a3b8' },
  48: { label: 'Kabut Rime', icon: 'fa-smog', color: '#94a3b8' },
  51: { label: 'Gerimis Ringan', icon: 'fa-cloud-rain', color: '#38bdf8' },
  53: { label: 'Gerimis Sedang', icon: 'fa-cloud-rain', color: '#38bdf8' },
  55: { label: 'Gerimis Lebat', icon: 'fa-cloud-showers-heavy', color: '#0284c7' },
  61: { label: 'Hujan Ringan', icon: 'fa-cloud-rain', color: '#38bdf8' },
  63: { label: 'Hujan Sedang', icon: 'fa-cloud-showers-heavy', color: '#0284c7' },
  65: { label: 'Hujan Deras', icon: 'fa-cloud-showers-heavy', color: '#1d4ed8' },
  71: { label: 'Salju Ringan', icon: 'fa-snowflake', color: '#e2e8f0' },
  73: { label: 'Salju Sedang', icon: 'fa-snowflake', color: '#e2e8f0' },
  75: { label: 'Salju Lebat', icon: 'fa-snowflake', color: '#e2e8f0' },
  80: { label: 'Hujan Lokal Ringan', icon: 'fa-cloud-sun-rain', color: '#38bdf8' },
  81: { label: 'Hujan Lokal Sedang', icon: 'fa-cloud-showers-heavy', color: '#0284c7' },
  82: { label: 'Hujan Badai Lokal', icon: 'fa-cloud-bolt', color: '#4f46e5' },
  95: { label: 'Badai Petir', icon: 'fa-bolt', color: '#eab308' },
  96: { label: 'Badai Petir & Hujan Es', icon: 'fa-cloud-bolt', color: '#eab308' },
  99: { label: 'Badai Petir Hebat', icon: 'fa-burst', color: '#ef4444' }
};

// DOM Elements
const elements = {
  // 6 Required Fields
  resLokasiInput: document.getElementById('resLokasiInput'),
  resFormattedAddress: document.getElementById('resFormattedAddress'),
  resNegara: document.getElementById('resNegara'),
  resKodeNegara: document.getElementById('resKodeNegara'),
  resProvinsi: document.getElementById('resProvinsi'),
  resKecamatan: document.getElementById('resKecamatan'),
  resLongitude: document.getElementById('resLongitude'),
  resLatitude: document.getElementById('resLatitude'),
  
  // Search
  searchForm: document.getElementById('searchForm'),
  locationInput: document.getElementById('locationInput'),
  btnSearch: document.getElementById('btnSearch'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  btnGeolocation: document.getElementById('btnGeolocation'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  
  // Weather Hero & Metrics
  weatherHeroCard: document.getElementById('weatherHeroCard'),
  weatherLocalTime: document.getElementById('weatherLocalTime'),
  weatherTemp: document.getElementById('weatherTemp'),
  weatherCondition: document.getElementById('weatherCondition'),
  weatherFeelsLike: document.getElementById('weatherFeelsLike'),
  weatherIconContainer: document.getElementById('weatherIconContainer'),
  weatherHighLow: document.getElementById('weatherHighLow'),
  metricHumidity: document.getElementById('metricHumidity'),
  metricWind: document.getElementById('metricWind'),
  metricUV: document.getElementById('metricUV'),
  metricPressure: document.getElementById('metricPressure'),
  metricVisibility: document.getElementById('metricVisibility'),
  metricRainChance: document.getElementById('metricRainChance'),
  
  // Forecasts & Sun
  hourlyForecastContainer: document.getElementById('hourlyForecastContainer'),
  dailyForecastContainer: document.getElementById('dailyForecastContainer'),
  sunSunrise: document.getElementById('sunSunrise'),
  sunSunset: document.getElementById('sunSunset'),
  
  // Map
  mapStyleSelect: document.getElementById('mapStyleSelect'),
  apiStatusBadge: document.getElementById('apiStatusBadge'),
  activeEndpointUrl: document.getElementById('activeEndpointUrl'),
  
  // Modals
  btnApiModal: document.getElementById('btnApiModal'),
  apiKeyModal: document.getElementById('apiKeyModal'),
  btnCloseApiModal: document.getElementById('btnCloseApiModal'),
  inputApiKey: document.getElementById('inputApiKey'),
  btnSaveApiKey: document.getElementById('btnSaveApiKey'),
  btnResetApiKey: document.getElementById('btnResetApiKey'),
  
  btnPostmanModal: document.getElementById('btnPostmanModal'),
  inspectorModal: document.getElementById('inspectorModal'),
  btnCloseInspectorModal: document.getElementById('btnCloseInspectorModal'),
  rawGeocodingJson: document.getElementById('rawGeocodingJson'),
  rawWeatherJson: document.getElementById('rawWeatherJson'),
  postmanUrlSample: document.getElementById('postmanUrlSample'),
  
  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupEventListeners();
  setupPillButtons();
  setupModals();
  
  // Initial search with default location (Kebayoran Baru - default showcase)
  searchLocation('Kebayoran Baru');
});

/**
 * Initialize Leaflet Map
 */
function initMap() {
  // Default coordinates (Jakarta / Kebayoran Baru: -6.2443, 106.7972)
  const initialLat = -6.2443;
  const initialLon = 106.7972;

  state.map = L.map('map', {
    zoomControl: true,
    attributionControl: true
  }).setView([initialLat, initialLon], 13);

  updateMapTileLayer(state.mapStyle);

  // Custom Pulsing Marker
  const customIcon = L.divIcon({
    className: 'custom-map-icon',
    html: '<div class="map-marker-pulse"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  state.marker = L.marker([initialLat, initialLon], { icon: customIcon }).addTo(state.map);
  state.marker.bindPopup('<b>Lokasi Terpilih</b><br>Kebayoran Baru, Jakarta').openPopup();

  // Click on map to reverse geocode & load weather
  state.map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    reverseGeocode(lat, lng);
  });
}

/**
 * Update Leaflet Map Tile Layer (MapTiler or OSM fallback)
 */
function updateMapTileLayer(styleKey) {
  if (state.currentTileLayer) {
    state.map.removeLayer(state.currentTileLayer);
  }

  let tileUrl = '';
  let attribution = '';

  const hasValidKey = state.apiKey && state.apiKey !== 'get_your_own_key';

  if (hasValidKey && styleKey !== 'osm') {
    if (styleKey === 'satellite') {
      tileUrl = `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${state.apiKey}`;
    } else if (styleKey === 'topo-v2') {
      tileUrl = `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${state.apiKey}`;
    } else if (styleKey === 'backdrop') {
      tileUrl = `https://api.maptiler.com/maps/backdrop/{z}/{x}/{y}.png?key=${state.apiKey}`;
    } else {
      tileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${state.apiKey}`;
    }
    attribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
  } else {
    // OpenStreetMap default / fallback
    tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  }

  state.currentTileLayer = L.tileLayer(tileUrl, {
    maxZoom: 19,
    attribution: attribution
  }).addTo(state.map);
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Search Form Submit
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = elements.locationInput.value.trim();
    if (query) {
      hideSuggestions();
      searchLocation(query);
    }
  });

  // Clear Search Button
  elements.btnClearSearch.addEventListener('click', () => {
    elements.locationInput.value = '';
    elements.btnClearSearch.style.display = 'none';
    hideSuggestions();
    elements.locationInput.focus();
  });

  // Input typing listener for autocomplete & clear button
  elements.locationInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    elements.btnClearSearch.style.display = val ? 'block' : 'none';

    clearTimeout(state.searchTimeout);
    if (val.length >= 3) {
      state.searchTimeout = setTimeout(() => {
        fetchSearchSuggestions(val);
      }, 350);
    } else {
      hideSuggestions();
    }
  });

  // Geolocation (GPS button)
  elements.btnGeolocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation tidak didukung pada browser ini', 'error');
      return;
    }
    showToast('Mendeteksi koordinat GPS kamu...', 'info');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude, 'Lokasi GPS Saya');
      },
      (error) => {
        showToast(`Gagal mendapatkan lokasi GPS: ${error.message}`, 'error');
      },
      { timeout: 10000 }
    );
  });

  // Map Style Selector
  elements.mapStyleSelect.addEventListener('change', (e) => {
    state.mapStyle = e.target.value;
    updateMapTileLayer(state.mapStyle);
    showToast(`Gaya peta diubah ke: ${e.target.options[e.target.selectedIndex].text}`, 'info');
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!elements.searchForm.contains(e.target) && !elements.searchSuggestions.contains(e.target)) {
      hideSuggestions();
    }
  });
}

/**
 * Setup Quick Search Pills
 */
function setupPillButtons() {
  const pills = document.querySelectorAll('.pill-btn');
  pills.forEach((btn) => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      elements.locationInput.value = query;
      elements.btnClearSearch.style.display = 'block';
      searchLocation(query);
    });
  });
}

/**
 * Setup Modals (API Key & Inspector)
 */
function setupModals() {
  // API Key Modal
  elements.btnApiModal.addEventListener('click', () => {
    elements.inputApiKey.value = state.apiKey === 'get_your_own_key' ? '' : state.apiKey;
    elements.apiKeyModal.classList.remove('hidden');
  });

  elements.btnCloseApiModal.addEventListener('click', () => {
    elements.apiKeyModal.classList.add('hidden');
  });

  elements.btnSaveApiKey.addEventListener('click', () => {
    const key = elements.inputApiKey.value.trim();
    if (key) {
      state.apiKey = key;
      localStorage.setItem('maptiler_api_key', key);
      showToast('API Key MapTiler berhasil disimpan!', 'success');
    } else {
      state.apiKey = 'get_your_own_key';
      localStorage.removeItem('maptiler_api_key');
      showToast('Menggunakan mode default/fallback.', 'info');
    }
    updateMapTileLayer(state.mapStyle);
    elements.apiKeyModal.classList.add('hidden');
  });

  elements.btnResetApiKey.addEventListener('click', () => {
    state.apiKey = 'get_your_own_key';
    localStorage.removeItem('maptiler_api_key');
    elements.inputApiKey.value = '';
    updateMapTileLayer(state.mapStyle);
    showToast('API Key direset ke default', 'info');
    elements.apiKeyModal.classList.add('hidden');
  });

  // Postman & API Inspector Modal
  elements.btnPostmanModal.addEventListener('click', () => {
    openInspectorModal();
  });

  elements.btnCloseInspectorModal.addEventListener('click', () => {
    elements.inspectorModal.classList.add('hidden');
  });

  // Inspector Tabs
  const tabBtns = document.querySelectorAll('.inspector-tabs .tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((tc) => tc.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Close modals when clicking overlay background
  [elements.apiKeyModal, elements.inspectorModal].forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

function openInspectorModal() {
  elements.inspectorModal.classList.remove('hidden');
}

/**
 * Fetch Search Suggestions for Autocomplete Dropdown
 */
async function fetchSearchSuggestions(query) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=id&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.results && data.results.length > 0) {
      renderSuggestions(data.results);
    } else {
      hideSuggestions();
    }
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    hideSuggestions();
  }
}

function renderSuggestions(results) {
  elements.searchSuggestions.innerHTML = '';
  results.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    const sub = [item.admin2, item.admin1, item.country].filter(Boolean).join(', ');
    div.innerHTML = `
      <i class="fa-solid fa-location-dot"></i>
      <div>
        <div class="suggestion-title">${item.name}</div>
        <div class="suggestion-sub">${sub}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      elements.locationInput.value = item.name;
      elements.btnClearSearch.style.display = 'block';
      hideSuggestions();
      processGeocodingResult({
        lokasiInput: item.name,
        formattedAddress: `${item.name}, ${sub}`,
        negara: item.country || 'Indonesia',
        kodeNegara: item.country_code || 'ID',
        provinsi: item.admin1 || item.country || '-',
        kecamatan: item.admin2 || item.name || '-',
        longitude: item.longitude,
        latitude: item.latitude,
        raw: item
      });
    });
    elements.searchSuggestions.appendChild(div);
  });
  elements.searchSuggestions.classList.remove('hidden');
}

function hideSuggestions() {
  elements.searchSuggestions.classList.add('hidden');
  elements.searchSuggestions.innerHTML = '';
}

/**
 * Search Location using MapTiler Geocoding API (with intelligent fallbacks)
 */
async function searchLocation(query) {
  setApiStatus('Memuat...', 'loading');
  state.currentLocationName = query;

  const hasValidKey = state.apiKey && state.apiKey !== 'get_your_own_key';
  const maptilerUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${hasValidKey ? state.apiKey : 'DEMO_KEY'}&language=id`;
  
  elements.activeEndpointUrl.textContent = maptilerUrl;
  elements.postmanUrlSample.textContent = maptilerUrl;

  try {
    let geocodedData = null;

    // 1. Try MapTiler Geocoding API if key is available
    if (hasValidKey) {
      try {
        const res = await fetch(maptilerUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            geocodedData = parseMapTilerFeature(data.features[0], query, data);
          }
        }
      } catch (err) {
        console.warn('MapTiler API failed, switching to fallback:', err);
      }
    }

    // 2. Fallback to OpenStreetMap Nominatim Geocoding API (rich Indonesian administrative structure)
    if (!geocodedData) {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
      const res = await fetch(osmUrl, {
        headers: { 'Accept-Language': 'id, en' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const addr = item.address || {};

        geocodedData = {
          lokasiInput: query,
          formattedAddress: item.display_name,
          negara: addr.country || 'Indonesia',
          kodeNegara: (addr.country_code || 'ID').toUpperCase(),
          provinsi: addr.state || addr.region || addr.province || addr.city || 'DKI Jakarta',
          kecamatan: addr.suburb || addr.city_district || addr.district || addr.village || addr.municipality || query,
          longitude: parseFloat(item.lon),
          latitude: parseFloat(item.lat),
          raw: item
        };
      }
    }

    // 3. Fallback to Open-Meteo Geocoding
    if (!geocodedData) {
      const omUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=id&format=json`;
      const res = await fetch(omUrl);
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const item = data.results[0];
        geocodedData = {
          lokasiInput: query,
          formattedAddress: `${item.name}, ${item.admin1 || ''}, ${item.country || ''}`,
          negara: item.country || 'Indonesia',
          kodeNegara: item.country_code || 'ID',
          provinsi: item.admin1 || 'Provinsi',
          kecamatan: item.admin2 || item.name || 'Kecamatan',
          longitude: item.longitude,
          latitude: item.latitude,
          raw: item
        };
      }
    }

    if (geocodedData) {
      processGeocodingResult(geocodedData);
      setApiStatus('Berhasil Terhubung (200 OK)', 'success');
      showToast(`Lokasi ditemukan: ${geocodedData.lokasiInput}`, 'success');
    } else {
      throw new Error(`Lokasi "${query}" tidak ditemukan.`);
    }
  } catch (error) {
    console.error('Search error:', error);
    setApiStatus('Error', 'error');
    showToast(error.message || 'Gagal mencari lokasi', 'error');
  }
}

/**
 * Reverse Geocode coordinates to location data
 */
async function reverseGeocode(lat, lon, label = null) {
  setApiStatus('Reverse Geocoding...', 'loading');
  const hasValidKey = state.apiKey && state.apiKey !== 'get_your_own_key';
  const maptilerUrl = `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${hasValidKey ? state.apiKey : 'DEMO_KEY'}&language=id`;
  
  elements.activeEndpointUrl.textContent = maptilerUrl;

  try {
    let geocodedData = null;

    if (hasValidKey) {
      try {
        const res = await fetch(maptilerUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            geocodedData = parseMapTilerFeature(data.features[0], label || data.features[0].text, data);
          }
        }
      } catch (e) {
        console.warn('MapTiler reverse failed:', e);
      }
    }

    if (!geocodedData) {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const res = await fetch(osmUrl, { headers: { 'Accept-Language': 'id, en' } });
      const item = await res.json();

      if (item && item.address) {
        const addr = item.address;
        const locName = label || addr.village || addr.suburb || addr.city_district || addr.city || 'Koordinat Peta';
        geocodedData = {
          lokasiInput: locName,
          formattedAddress: item.display_name,
          negara: addr.country || 'Indonesia',
          kodeNegara: (addr.country_code || 'ID').toUpperCase(),
          provinsi: addr.state || addr.region || addr.province || '-',
          kecamatan: addr.suburb || addr.city_district || addr.district || addr.village || locName,
          longitude: parseFloat(lon),
          latitude: parseFloat(lat),
          raw: item
        };
      }
    }

    if (geocodedData) {
      processGeocodingResult(geocodedData);
      setApiStatus('Reverse Geocoding Selesai', 'success');
      showToast(`Peta dipindahkan ke: ${geocodedData.lokasiInput}`, 'info');
    }
  } catch (err) {
    console.error('Reverse geocode error:', err);
    setApiStatus('Error', 'error');
  }
}

/**
 * Parse MapTiler Feature Object into Unified Location Structure
 */
function parseMapTilerFeature(feature, queryName, fullJson) {
  const coords = feature.center || (feature.geometry && feature.geometry.coordinates) || [0, 0];
  let country = 'Indonesia';
  let countryCode = 'ID';
  let province = '-';
  let kecamatan = feature.text || queryName;

  if (feature.context && Array.isArray(feature.context)) {
    feature.context.forEach((ctx) => {
      const id = ctx.id || '';
      if (id.startsWith('country')) {
        country = ctx.text || ctx.text_id || country;
        if (ctx.country_code) countryCode = ctx.country_code.toUpperCase();
      } else if (id.startsWith('region') || id.startsWith('state') || id.startsWith('province')) {
        province = ctx.text || ctx.text_id || province;
      } else if (id.startsWith('municipality') || id.startsWith('district') || id.startsWith('subregion')) {
        kecamatan = ctx.text || ctx.text_id || kecamatan;
      }
    });
  }

  return {
    lokasiInput: queryName,
    formattedAddress: feature.place_name || feature.text,
    negara: country,
    kodeNegara: countryCode,
    provinsi: province !== '-' ? province : (feature.place_name.split(',')[1] || 'Provinsi'),
    kecamatan: kecamatan,
    longitude: coords[0],
    latitude: coords[1],
    raw: fullJson || feature
  };
}

/**
 * Process Geocoding Result & Update DOM (6 Mandatory Fields + Map + Weather)
 */
function processGeocodingResult(geo) {
  state.lastGeocodingData = geo;

  // 1. Lokasi Input
  elements.resLokasiInput.textContent = geo.lokasiInput;
  elements.resFormattedAddress.textContent = geo.formattedAddress;

  // 2. Negara
  elements.resNegara.textContent = geo.negara;
  elements.resKodeNegara.textContent = `Kode: ${geo.kodeNegara}`;

  // 3. Provinsi
  elements.resProvinsi.textContent = geo.provinsi;

  // 4. Kecamatan
  elements.resKecamatan.textContent = geo.kecamatan;

  // 5. Longitude
  const lonFormatted = geo.longitude >= 0 ? `${geo.longitude.toFixed(6)}° E` : `${Math.abs(geo.longitude).toFixed(6)}° W`;
  elements.resLongitude.textContent = lonFormatted;
  elements.resLongitude.setAttribute('data-raw', geo.longitude.toFixed(6));

  // 6. Latitude
  const latFormatted = geo.latitude >= 0 ? `${geo.latitude.toFixed(6)}° N` : `${Math.abs(geo.latitude).toFixed(6)}° S`;
  elements.resLatitude.textContent = latFormatted;
  elements.resLatitude.setAttribute('data-raw', geo.latitude.toFixed(6));

  // Update Inspector Raw JSON
  elements.rawGeocodingJson.textContent = JSON.stringify(geo.raw || geo, null, 2);

  // Update Leaflet Map Position
  if (state.map && state.marker) {
    state.map.setView([geo.latitude, geo.longitude], 13);
    state.marker.setLatLng([geo.latitude, geo.longitude]);
    state.marker.setPopupContent(`
      <div style="font-family: 'Plus Jakarta Sans', sans-serif;">
        <strong style="color:#38bdf8; font-size:1.05em;">${geo.lokasiInput}</strong><br>
        <span style="font-size:0.85em; color:#94a3b8;">${geo.kecamatan}, ${geo.provinsi}</span><br>
        <span style="font-size:0.8em; color:#cbd5e1;">Lat: ${geo.latitude.toFixed(4)}, Lon: ${geo.longitude.toFixed(4)}</span>
      </div>
    `).openPopup();
  }

  // Fetch Live Weather Forecast for coordinates
  fetchWeatherData(geo.latitude, geo.longitude);
}

/**
 * Fetch Live Weather Data from Open-Meteo API
 */
async function fetchWeatherData(lat, lon) {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    
    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error('Gagal mengambil data cuaca');
    const data = await res.json();
    state.lastWeatherData = data;

    // Update Raw Weather Inspector
    elements.rawWeatherJson.textContent = JSON.stringify(data, null, 2);

    renderWeatherData(data);
  } catch (error) {
    console.error('Weather fetch error:', error);
    elements.weatherCondition.textContent = 'Gagal memuat cuaca';
    showToast('Gagal memuat data cuaca real-time', 'error');
  }
}

/**
 * Render Weather Dashboard & Forecasts
 */
function renderWeatherData(data) {
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  const wCode = current.weather_code || 0;
  const weatherInfo = weatherCodeMap[wCode] || { label: 'Cerah Berawan', icon: 'fa-cloud-sun', color: '#f59e0b' };

  // Current Temperature & Condition
  elements.weatherTemp.textContent = Math.round(current.temperature_2m);
  elements.weatherCondition.textContent = weatherInfo.label;
  elements.weatherFeelsLike.textContent = `Terasa seperti: ${Math.round(current.apparent_temperature)}°C`;
  
  // Weather Animated Icon
  elements.weatherIconContainer.innerHTML = `<i class="fa-solid ${weatherInfo.icon}" style="color: ${weatherInfo.color}"></i>`;

  // Local Time
  if (current.time) {
    const timeStr = current.time.split('T')[1] || '--:--';
    elements.weatherLocalTime.textContent = `Waktu Lokal: ${timeStr} (${data.timezone_abbreviation || 'WIB'})`;
  }

  // High & Low Today
  if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
    const maxT = Math.round(daily.temperature_2m_max[0]);
    const minT = Math.round(daily.temperature_2m_min[0]);
    elements.weatherHighLow.innerHTML = `
      <span><i class="fa-solid fa-arrow-up"></i> Max: ${maxT}°C</span>
      <span><i class="fa-solid fa-arrow-down"></i> Min: ${minT}°C</span>
    `;
  }

  // Metrics
  elements.metricHumidity.textContent = `${current.relative_humidity_2m}%`;
  elements.metricWind.textContent = `${current.wind_speed_10m} km/h`;
  elements.metricPressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
  elements.metricVisibility.textContent = `10 km`;
  elements.metricUV.textContent = daily && daily.uv_index_max ? daily.uv_index_max[0].toFixed(1) : '3.5';
  elements.metricRainChance.textContent = daily && daily.precipitation_probability_max ? `${daily.precipitation_probability_max[0]}%` : `${current.precipitation || 0}%`;

  // Sun Cycle
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseTime = daily.sunrise[0].split('T')[1] || '--:--';
    const sunsetTime = daily.sunset[0].split('T')[1] || '--:--';
    elements.sunSunrise.textContent = `${sunriseTime} WIB`;
    elements.sunSunset.textContent = `${sunsetTime} WIB`;
  }

  // Render 24-Hour Hourly Forecast
  renderHourlyForecast(hourly);

  // Render 7-Day Daily Forecast
  renderDailyForecast(daily);
}

/**
 * Render 24-Hour Hourly Forecast
 */
function renderHourlyForecast(hourly) {
  if (!hourly || !hourly.time) return;

  elements.hourlyForecastContainer.innerHTML = '';
  const now = new Date();
  const currentHour = now.getHours();

  // Show next 24 hours
  const limit = Math.min(24, hourly.time.length);
  for (let i = 0; i < limit; i++) {
    const timeStr = hourly.time[i].split('T')[1];
    const hour = parseInt(timeStr.split(':')[0], 10);
    const temp = Math.round(hourly.temperature_2m[i]);
    const code = hourly.weather_code[i] || 0;
    const rain = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
    const info = weatherCodeMap[code] || { icon: 'fa-cloud-sun', color: '#f59e0b' };

    const isCurrent = i === 0 || hour === currentHour;

    const card = document.createElement('div');
    card.className = `hourly-card ${isCurrent ? 'active-hour' : ''}`;
    card.innerHTML = `
      <span class="hourly-time">${timeStr}</span>
      <i class="fa-solid ${info.icon} hourly-icon" style="color: ${info.color}"></i>
      <span class="hourly-temp">${temp}°</span>
      <span class="hourly-rain"><i class="fa-solid fa-droplet" style="font-size:0.6rem"></i> ${rain}%</span>
    `;
    elements.hourlyForecastContainer.appendChild(card);
  }
}

/**
 * Render 7-Day Forecast Cards
 */
function renderDailyForecast(daily) {
  if (!daily || !daily.time) return;

  elements.dailyForecastContainer.innerHTML = '';
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 0 ? 'Hari Ini' : (i === 1 ? 'Besok' : dayNames[date.getDay()]);
    const code = daily.weather_code[i] || 0;
    const info = weatherCodeMap[code] || { icon: 'fa-cloud-sun', color: '#f59e0b' };
    const maxT = Math.round(daily.temperature_2m_max[i]);
    const minT = Math.round(daily.temperature_2m_min[i]);

    const row = document.createElement('div');
    row.className = 'daily-row';
    row.innerHTML = `
      <span class="daily-day">${dayName}</span>
      <i class="fa-solid ${info.icon} daily-icon" style="color: ${info.color}"></i>
      <div class="daily-bar-container">
        <div class="temp-bar-track">
          <div class="temp-bar-fill" style="width: ${Math.min(100, Math.max(20, (maxT / 40) * 100))}%;"></div>
        </div>
      </div>
      <div class="daily-range">
        <span>${maxT}°</span><span class="min-temp">${minT}°</span>
      </div>
    `;
    elements.dailyForecastContainer.appendChild(row);
  }
}

/**
 * Status Badge Helper
 */
function setApiStatus(text, type) {
  elements.apiStatusBadge.className = `status-badge status-${type}`;
  let icon = 'fa-circle-check';
  if (type === 'loading') icon = 'fa-spinner fa-spin';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  elements.apiStatusBadge.innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;
}

/**
 * Copy Text Helper (Coordinates, Endpoints, JSON)
 */
window.copyText = function (elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.getAttribute('data-raw') || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Berhasil disalin: ${text}`, 'success');
  }).catch(() => {
    showToast('Gagal menyalin ke clipboard', 'error');
  });
};

window.copyActiveEndpoint = function () {
  const text = elements.activeEndpointUrl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('URL MapTiler API disalin untuk Postman!', 'success');
  });
};

window.copyPostmanUrl = function () {
  const text = elements.postmanUrlSample.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('URL Postman disalin ke clipboard!', 'success');
  });
};

window.copyJson = function (elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    showToast('JSON API response berhasil disalin!', 'success');
  });
};

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-xmark';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
