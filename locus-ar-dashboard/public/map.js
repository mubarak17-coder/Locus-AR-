/**
 * Locus AR — Interactive Map (Marokh)
 * Uses Mapbox GL JS to display user location + Locus AR sticker points of interest.
 * Dark theme, GPS tracking, and "Activate AR" popups.
 */

// ============================================================
// API KEY — Replace with your Mapbox access token
// Get one at: https://account.mapbox.com/access-tokens/
// ============================================================
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';

// Fallback center (Marokh / Morocco) if geolocation fails
const FALLBACK_CENTER = { lng: -7.0926, lat: 31.7917 };
const DEFAULT_ZOOM = 14;

// Locus AR sticker locations (points of interest)
const LOCUS_POINTS = [
  { id: 1, name: 'Keys', lng: -7.093, lat: 31.792, description: 'Tracked keys with Locus sticker' },
  { id: 2, name: 'Wallet', lng: -7.091, lat: 31.791, description: 'Wallet with Locus sticker' },
  { id: 3, name: 'Car', lng: -7.094, lat: 31.793, description: 'Vehicle with Locus sticker' },
  { id: 4, name: 'Backpack', lng: -7.092, lat: 31.790, description: 'Backpack with Locus sticker' },
];

// Initialize map with dark theme
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: FALLBACK_CENTER,
  zoom: DEFAULT_ZOOM,
});

// Add zoom and compass controls
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// Custom blue marker element for user location
function createUserMarker() {
  const el = document.createElement('div');
  el.className = 'user-marker';
  el.style.cssText = `
    width: 24px; height: 24px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
    cursor: pointer;
  `;
  return el;
}

// Add user location marker (updated when GPS returns)
let userMarker = null;

function setUserLocation(lng, lat) {
  if (userMarker) userMarker.remove();

  userMarker = new mapboxgl.Marker({
    element: createUserMarker(),
    anchor: 'center',
  })
    .setLngLat([lng, lat])
    .addTo(map);

  map.flyTo({ center: [lng, lat], zoom: DEFAULT_ZOOM, duration: 1500 });
}

// Add Locus AR points of interest
function addLocusPoints() {
  LOCUS_POINTS.forEach((point) => {
    const el = document.createElement('div');
    el.className = 'locus-marker';
    el.style.cssText = `
      width: 20px; height: 20px;
      background: #6366f1;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
      cursor: pointer;
    `;

    const popup = new mapboxgl.Popup({ offset: 15, closeButton: true })
      .setHTML(`
        <div class="locus-popup">
          <h3>${point.name}</h3>
          <p>${point.description}</p>
          <button class="btn-ar" data-id="${point.id}">Activate AR</button>
        </div>
      `);

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'center',
    })
      .setLngLat([point.lng, point.lat])
      .setPopup(popup)
      .addTo(map);

    // Attach "Activate AR" handler when popup opens
    popup.on('open', () => {
      const btn = popup.getElement().querySelector('.btn-ar');
      if (btn) {
        btn.onclick = () => {
          alert(`Activate AR for "${point.name}" — AR view would open here.`);
        };
      }
    });
  });
}

// Get user's current GPS location
function initGeolocation() {
  const loading = document.getElementById('loading');

  if (!navigator.geolocation) {
    loading.textContent = 'Geolocation not supported. Using fallback center.';
    loading.classList.add('show');
    setTimeout(() => {
      loading.classList.remove('show');
    }, 2000);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { longitude, latitude } = pos.coords;
      setUserLocation(longitude, latitude);
      loading.classList.remove('show');
    },
    (err) => {
      loading.textContent = `Location unavailable (${err.message}). Using Marokh center.`;
      loading.classList.add('show');
      setTimeout(() => loading.classList.remove('show'), 3000);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

// Run when map is loaded
map.on('load', () => {
  addLocusPoints();
  initGeolocation();
});
