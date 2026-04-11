// ============================================================
//  EcoRoute — Map Module
//  Handles Mapbox GL JS, Directions API routing, truck animation
// ============================================================

const MapModule = (() => {
  let map = null;
  let truckMarker = null;
  let userMarkers = [];
  let routeAnimFrame = null;
  let routeCoords = [];
  let routeStep = 0;
  let isAnimating = false;
  let currentTripId = null;
  let routeDrawnForObserver = false;
  let etaInterval = null;
  let trackingInterval = null;

  // SVG truck icon for the map
  const TRUCK_SVG = `
    <div style="font-size:28px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.8));transition:transform .1s;">🚛</div>
  `;

  // Pin SVG generator
  function pinSVG(color, icon = '🗑') {
    return `
      <div style="
        display:flex;flex-direction:column;align-items:center;cursor:pointer;
        filter:drop-shadow(0 2px 4px rgba(0,0,0,.6));
      ">
        <div style="
          width:34px;height:34px;border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${color};border:2px solid rgba(255,255,255,.3);
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:14px;">${icon}</span>
        </div>
      </div>
    `;
  }

  function initMap() {
    if (!ECOROUTE_CONFIG.MAPBOX_TOKEN || ECOROUTE_CONFIG.MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
      document.getElementById('map-container').innerHTML = `
        <div style="
          height:100%;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:16px;
          background:#111;color:#A3A3A3;padding:40px;text-align:center;
        ">
          <div style="font-size:3rem;">🗺️</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.1rem;color:#F5F5F5;">Map Not Configured</div>
          <div style="font-size:0.85rem;line-height:1.6;">
            Open <code style="color:#FF6B00;background:#1A1A1A;padding:2px 6px;border-radius:4px;">public/js/config.js</code>
            and replace <code style="color:#FF6B00;background:#1A1A1A;padding:2px 6px;border-radius:4px;">YOUR_MAPBOX_TOKEN_HERE</code>
            with your Mapbox public token.
          </div>
          <div style="font-size:0.78rem;color:#525252;">Get a free token at mapbox.com</div>
        </div>
      `;
      return false;
    }

    mapboxgl.accessToken = ECOROUTE_CONFIG.MAPBOX_TOKEN;

    map = new mapboxgl.Map({
      container: 'map-container',
      style: ECOROUTE_CONFIG.MAP_STYLE,
      center: ECOROUTE_CONFIG.DEFAULT_CENTER,
      zoom: ECOROUTE_CONFIG.DEFAULT_ZOOM,
      attributionControl: false
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', async () => {
      await addUserPins();
      addDepotPins();
      // Explicit second call after 1.5s to handle async auth race on first load
      setTimeout(drawDriverBoundaries, 1500);
    });

    return true;
  }

  async function addUserPins() {
    clearUserMarkers();
    
    try {
      // 1. Fetch Unified Active Users (Real + DB Mocks) securely with driver token
      const headers = {};
      if (window.ApiModule && ApiModule.getToken()) {
        headers['Authorization'] = `Bearer ${ApiModule.getToken()}`;
      }
      const res = await fetch('/api/users/active', { headers });
      const usersToShow = res.ok ? await res.json() : MOCK_USERS; 
      
      usersToShow.forEach(user => {
        const fill = user.fillLevel || 0;
        
        // Logical "Active" status:
        // Ready for collection (Green) if:
        // 1. Manually confirmed (isActiveToday === true)
        // 2. OR Pending choice and fill is high (isActiveToday === null && fill >= 70)
        // Red if: Manually declined (false) OR fill is low.
        const isActiveReady = user.isActiveToday === true || (user.isActiveToday === null && fill >= 70);

        const color = isActiveReady ? '#22C55E' : '#EF4444';
        const el = document.createElement('div');
        el.innerHTML = pinSVG(color, user.role === 'point' ? '🗑️' : '🏠');

        const popup = new mapboxgl.Popup({ offset: 30, closeButton: false, className: 'eco-popup' })
          .setHTML(`
            <div style="
              background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;
              padding:12px 14px;min-width:180px;font-family:'DM Sans',sans-serif;
            ">
              <div style="font-weight:700;font-size:0.9rem;color:#F5F5F5;margin-bottom:4px;">${user.name}</div>
              <div style="font-size:0.75rem;color:#A3A3A3;margin-bottom:8px;">${user.address || 'No address'}</div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.78rem;color:#A3A3A3;">Fill Level</span>
                <span style="font-size:1rem;font-weight:700;color:${isActiveReady ? '#22C55E' : '#EF4444'}">
                  ${fill}%
                </span>
              </div>
              <div style="
                height:6px;background:#222;border-radius:4px;margin-top:6px;overflow:hidden;
              ">
                <div style="
                  height:100%;width:${fill}%;
                  background:${isActiveReady ? '#22C55E' : '#EF4444'};
                  border-radius:4px;
                "></div>
              </div>
              <div style="font-size:0.65rem;color:${user.isActiveToday === true ? '#22C55E' : (user.isActiveToday === false ? '#EF4444' : '#A3A3A3')};margin-top:8px;text-align:center;font-weight:600;">
                 ${user.isActiveToday === true ? '✅ CONFIRMED READY' : (user.isActiveToday === false ? '❌ OPTED OUT' : '⌛ PENDING CHOICE')}
              </div>
            </div>
          `);

        const lng = user.lng || user.location?.lng;
        const lat = user.lat || user.location?.lat;
        
        if (lng && lat) {
          const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map);
          userMarkers.push(marker);
        }
      });

    } catch (err) {
      console.warn("Failed to fetch real users, using mock data", err);
      // fallback to mock
      MOCK_USERS.forEach(user => {
        const isActive = user.fillLevel >= ECOROUTE_CONFIG.ACTIVE_THRESHOLD;
        const color = isActive ? '#22C55E' : '#EF4444';
        const el = document.createElement('div');
        el.innerHTML = pinSVG(color, user.role === 'point' ? '🗑' : '🏠');

        const popup = new mapboxgl.Popup({ offset: 30, closeButton: false, className: 'eco-popup' })
          .setHTML(`
            <div style="
              background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;
              padding:12px 14px;min-width:180px;font-family:'DM Sans',sans-serif;
            ">
              <div style="font-weight:700;font-size:0.9rem;color:#F5F5F5;margin-bottom:4px;">${user.name}</div>
              <div style="font-size:0.75rem;color:#A3A3A3;margin-bottom:8px;">${user.address}</div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.78rem;color:#A3A3A3;">Fill Level</span>
                <span style="font-size:1rem;font-weight:700;color:${isActive ? '#EF4444' : '#22C55E'}">
                  ${user.fillLevel}%
                </span>
              </div>
              <div style="
                height:6px;background:#222;border-radius:4px;margin-top:6px;overflow:hidden;
              ">
                <div style="
                  height:100%;width:${user.fillLevel}%;
                  background:${isActive ? '#EF4444' : '#22C55E'};
                  border-radius:4px;
                "></div>
              </div>
              <div style="font-size:0.7rem;color:#525252;margin-top:6px;">
                Reported ${user.lastReported}
              </div>
            </div>
          `);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([user.lng, user.lat])
          .setPopup(popup)
          .addTo(map);

        userMarkers.push(marker);
      });
    }
    
    // Draw driver bounding areas visually
    await drawDriverBoundaries();
  }

  // Zone polygons are aligned to the ACTUAL coordinates of seeded mock users.
  // Each box is [lng_west, lat_south] → [lng_east, lat_south] → [lng_east, lat_north] → [lng_west, lat_north] → close
  const ZONE_POLYGONS = {
    // gokulam_north  — users U001 (76.608,12.326), U005 (76.614,12.350)
    'gokulam_north':    [[76.600, 12.318], [76.620, 12.318], [76.620, 12.358], [76.600, 12.358], [76.600, 12.318]],
    // gokulam_south  — users U002 (76.623,12.344), U007 (76.643,12.309)
    'gokulam_south':    [[76.618, 12.300], [76.650, 12.300], [76.650, 12.352], [76.618, 12.352], [76.618, 12.300]],
    // gokulam_east   — users U003 (76.636,12.331), U008 (76.620,12.298)
    'gokulam_east':     [[76.615, 12.290], [76.645, 12.290], [76.645, 12.340], [76.615, 12.340], [76.615, 12.290]],
    // gokulam_west   — users U004 (76.650,12.319), U010 (76.639,12.294)
    'gokulam_west':     [[76.630, 12.285], [76.660, 12.285], [76.660, 12.330], [76.630, 12.330], [76.630, 12.285]],
    // jayalakshmipuram — users U006 (76.662,12.339), U009 (76.655,12.306)
    'jayalakshmipuram': [[76.645, 12.295], [76.672, 12.295], [76.672, 12.350], [76.645, 12.350], [76.645, 12.295]]
  };

  async function drawDriverBoundaries() {
    if (!window.App || App.getCurrentRole() !== 'driver' || !window.ApiModule) return;
    try {
      // getMe() returns the flat user object directly (not { user: ... })
      const driverUser = await ApiModule.getMe();
      if (!driverUser || !driverUser.assignedAreas || driverUser.assignedAreas.length === 0) return;
      
      const areas = driverUser.assignedAreas;
      const allZones = Object.keys(ZONE_POLYGONS);
      
      allZones.forEach(zone => {
         const layerId = `zone-layer-${zone}`;
         const outlineId = `zone-outline-${zone}`;
         const sourceId = `zone-source-${zone}`;
         if (!areas.includes(zone)) {
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getLayer(outlineId)) map.removeLayer(outlineId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
         }
      });
      
      areas.forEach((areaStr) => {
        if (!ZONE_POLYGONS[areaStr]) return;
        const sourceId = `zone-source-${areaStr}`;
        const layerId = `zone-layer-${areaStr}`;
        const outlineId = `zone-outline-${areaStr}`;
        
        if (map.getSource(sourceId)) return; // Already exists

        map.addSource(sourceId, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': { 'type': 'Polygon', 'coordinates': [ZONE_POLYGONS[areaStr]] }
          }
        });

        // Semi-transparent red fill — visible on satellite
        map.addLayer({
          'id': layerId,
          'type': 'fill',
          'source': sourceId,
          'paint': { 'fill-color': '#FF0000', 'fill-opacity': 0.20 }
        });
        
        // Bold solid red outline
        map.addLayer({
          'id': outlineId,
          'type': 'line',
          'source': sourceId,
          'paint': { 'line-color': '#FF3333', 'line-width': 4, 'line-opacity': 1.0 }
        });
      });
    } catch(err) { console.warn('Could not draw boundaries', err); }
  }

  function addDepotPins() {
    // Depot
    const depotEl = document.createElement('div');
    depotEl.innerHTML = `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.8));">🏭</div>`;
    new mapboxgl.Marker({ element: depotEl })
      .setLngLat([ECOROUTE_CONFIG.DEPOT.lng, ECOROUTE_CONFIG.DEPOT.lat])
      .setPopup(new mapboxgl.Popup({ offset: 20, closeButton: false })
        .setHTML(`<div style="background:#1A1A1A;padding:8px 12px;border-radius:8px;font-size:0.8rem;color:#F5F5F5;">${ECOROUTE_CONFIG.DEPOT.name}</div>`))
      .addTo(map);

    // Dump yard
    const dumpEl = document.createElement('div');
    dumpEl.innerHTML = `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.8));">♻️</div>`;
    new mapboxgl.Marker({ element: dumpEl })
      .setLngLat([ECOROUTE_CONFIG.DUMP_YARD.lng, ECOROUTE_CONFIG.DUMP_YARD.lat])
      .setPopup(new mapboxgl.Popup({ offset: 20, closeButton: false })
        .setHTML(`<div style="background:#1A1A1A;padding:8px 12px;border-radius:8px;font-size:0.8rem;color:#F5F5F5;">${ECOROUTE_CONFIG.DUMP_YARD.name}</div>`))
      .addTo(map);
  }

  // Build Mapbox Directions API URL with multiple waypoints
  function buildDirectionsURL(waypoints) {
    const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';');
    return `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?geometries=geojson&overview=full&steps=true&access_token=${ECOROUTE_CONFIG.MAPBOX_TOKEN}`;
  }

  async function fetchRoute(waypoints) {
    const url = buildDirectionsURL(waypoints);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Directions API error: ${res.status}`);
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) throw new Error('No route found');
    return data.routes[0];
  }

  function drawRoute(geojson) {
    // Remove existing route layers
    ['eco-route-bg', 'eco-route'].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    if (map.getSource('eco-route')) map.removeSource('eco-route');

    map.addSource('eco-route', {
      type: 'geojson',
      lineMetrics: true,
      data: { type: 'Feature', geometry: geojson }
    });

    // Background (wider, darker)
    map.addLayer({
      id: 'eco-route-bg',
      type: 'line',
      source: 'eco-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#000',
        'line-width': 10,
        'line-opacity': 0.5
      }
    });

    // Gradient route (orange → cyan)
    map.addLayer({
      id: 'eco-route',
      type: 'line',
      source: 'eco-route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#1D4ED8',
        'line-width': 5,
        'line-opacity': 0.95,
        'line-gradient': [
          'interpolate', ['linear'],
          ['line-progress'],
          0, '#3B82F6',
          0.5, '#2563EB',
          1, '#1E3A8A'
        ]
      }
    });
  }

  function placeTruck(lngLat, bearing = 0) {
    if (truckMarker) { truckMarker.remove(); }
    const el = document.createElement('div');
    el.innerHTML = TRUCK_SVG;
    el.style.transform = `rotate(${bearing}deg)`;
    el.id = 'truck-el';
    truckMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(lngLat)
      .addTo(map);
  }

  function updateDriverMarker(lng, lat, bearing = 0) {
    if (!truckMarker) {
      placeTruck([lng, lat], bearing);
    } else {
      truckMarker.setLngLat([lng, lat]);
      const el = document.getElementById('truck-el');
      if (el) el.style.transform = `rotate(${bearing}deg)`;
    }
  }

  let driverWasOnline = false;
  // Feature 3: H-User proximity — only fire the 20m alert once per browser session
  let proximityNotifiedThisSession = false;

  async function pollDriverLocation() {
    try {
      const loc = await ApiModule.getDriverLocation();
      if (loc && loc.available && loc.location && loc.location.lng) {
        if (!driverWasOnline) {
          App.showToast('🚛 Driver is now Online! Tracking Live.', 'success');
          if ('Notification' in window && Notification.permission === 'granted') {
             new Notification('EcoRoute - Driver Assigned', {
               body: 'Your collection driver is on the route and heading to your area!'
             });
          }
        }
        driverWasOnline = true;
        updateDriverMarker(loc.location.lng, loc.location.lat);

        // Feature 4: Fetch and draw the active route for the H-User
        if (!routeDrawnForObserver) {
          try {
            const tripData = await ApiModule.getActiveTrip();
            if (tripData && tripData.available && tripData.trip.geometry) {
              drawRoute(tripData.trip.geometry);
              routeDrawnForObserver = true;
            }
          } catch (e) { /* silent */ }
        }

        // Feature 3: check 20m proximity for the current H-User
        checkProximityNotification(loc.location);
      } else {
        if (driverWasOnline) {
          App.showToast('Driver has gone offline.', 'info');
        }
        driverWasOnline = false;
        proximityNotifiedThisSession = false; // reset on driver offline
        if (truckMarker) { truckMarker.remove(); truckMarker = null; }
      }
    } catch(e) {}
  }

  // Feature 3: Fire a one-time browser notification when driver is within 20m
  function checkProximityNotification(driverLoc) {
    // Only relevant for H-Users, only fire once per session
    if (proximityNotifiedThisSession) return;
    if (App.getCurrentRole() !== 'home') return;

    const userLoc = App.getUserLocation();
    if (!userLoc || !userLoc.lat || !userLoc.lng) return;

    try {
      const distMeters = turf.distance(
        turf.point([driverLoc.lng, driverLoc.lat]),
        turf.point([userLoc.lng, userLoc.lat]),
        { units: 'meters' }
      );

      if (distMeters <= 20) {
        proximityNotifiedThisSession = true;
        App.showToast('🚛 Driver is 20m away! Get your bin ready 🗑️', 'success');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🚛 EcoRoute — Driver Nearby!', {
            body: 'Your collection driver is less than 20 meters away. Please keep your bin accessible.',
            icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚛</text></svg>'
          });
        }
      }
    } catch(e) { /* turf error — silent */ }
  }

  function animateTruck(coords) {
    if (routeAnimFrame) cancelAnimationFrame(routeAnimFrame);
    routeCoords = coords;
    routeStep = 0;
    isAnimating = true;
    let lastStep = 0;

    function step() {
      if (!isAnimating || routeStep >= routeCoords.length - 1) {
        isAnimating = false;
        // Feature 5: Trip completion trigger
        if (routeStep >= routeCoords.length - 1 && currentTripId) {
          App.handleTripComplete(currentTripId);
          currentTripId = null;
        }
        return;
      }
      const cur  = routeCoords[routeStep];
      const next = routeCoords[Math.min(routeStep + 1, routeCoords.length - 1)];

      // Bearing
      const bearing = turf.bearing(
        turf.point(cur),
        turf.point(next)
      );

      if (truckMarker) {
        truckMarker.setLngLat(cur);
        const el = document.getElementById('truck-el');
        if (el) el.style.transform = `rotate(${bearing}deg)`;
      }

      // Update ETA
      const remaining = routeCoords.length - routeStep;
      const etaMins = Math.max(1, Math.round(remaining / 60));
      const etaEl = document.getElementById('eta-mins');
      if (etaEl) etaEl.textContent = `${etaMins} mins`;

      routeStep += 1; // smooth animation (1 coord per frame)
      routeAnimFrame = requestAnimationFrame(step);
    }

    step();
  }

  // (Duplicate addUserPins removed — the correctly-authorized version at line 84 is used)

  async function startCollectionRoute() {
    if (!map) return;

    App.showToast('Fetching route...', 'info');

    try {
      // 1. Fetch Unified Active Users (Real + DB Mocks) — pass token so server filters by zone
      const routeHeaders = {};
      if (window.ApiModule && ApiModule.getToken()) {
        routeHeaders['Authorization'] = `Bearer ${ApiModule.getToken()}`;
      }
      const res = await fetch('/api/users/active', { headers: routeHeaders });
      const usersToShow = res.ok ? await res.json() : [];
      
      const usersToVisit = usersToShow.filter(u => {
        const fill = u.fillLevel || 0;
        // Logic: Visit if Confirmed or (Not Checked + > Threshold)
        return u.isActiveToday === true || (u.isActiveToday === null && fill >= ECOROUTE_CONFIG.ACTIVE_THRESHOLD);
      });

      if (usersToVisit.length === 0) {
        App.showToast('No active locations needing pickup today', 'info');
        return;
      }

      // Build waypoints: depot → active users → dump yard
      const waypoints = [
        ECOROUTE_CONFIG.DEPOT,
        ...usersToVisit.map(u => ({ lng: u.lng || u.location?.lng, lat: u.lat || u.location?.lat })),
        ECOROUTE_CONFIG.DUMP_YARD
      ];

      const route = await fetchRoute(waypoints);
      const coords = route.geometry.coordinates;
      const duration = route.duration; // seconds

      // Log trip in backend (Includes geometry for H-User visibility)
      try {
        const tripRes = await fetch('/api/trips', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + (localStorage.getItem('eco_jwt') || '')
          },
          body: JSON.stringify({
              waypoints: waypoints,
              duration: duration,
              geometry: route.geometry
          })
        });
        const tripData = await tripRes.json();
        currentTripId = tripData._id; 
      } catch (err) {
        console.warn('Silent trip logging error', err);
      }

      // Draw route
      drawRoute(route.geometry);

      // Fit map to route
      const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
      map.fitBounds(bounds, { padding: 60, duration: 1200 });

      // Place truck at start
      placeTruck(coords[0]);

      // Show ETA card
      const etaMins = Math.round(duration / 60);
      const etaEl = document.getElementById('eta-mins');
      if (etaEl) etaEl.textContent = `${etaMins} mins`;
      const etaCard = document.getElementById('eta-card');
      if (etaCard) etaCard.style.display = 'block';

      // Populate stop list
      populateStops(usersToVisit, route);

      // Show bottom sheet
      const bs = document.querySelector('.bottom-sheet');
      if (bs) bs.style.display = 'block';

      // Start animation after fit
      setTimeout(() => animateTruck(coords), 1500);

      App.showToast(`Route ready! ${usersToVisit.length} active stops`, 'success');

    } catch (err) {
      console.error('Route error:', err);
      App.showToast('Route fetch failed. Check token or network.', 'error');
    }
  }

  function populateStops(users, route) {
    const stopsEl = document.getElementById('route-stops');
    if (!stopsEl) return;

    const totalDuration = route.duration;
    stopsEl.innerHTML = users.map((u, i) => {
      const arrivalMins = Math.round((totalDuration / (users.length + 1)) * (i + 1) / 60);
      return `
        <div class="stop-item">
          <div class="stop-dot orange"></div>
          <div class="stop-info">
            <div class="stop-name">${u.name}</div>
            <div class="stop-addr">${u.address}</div>
          </div>
          <div class="stop-time">+${arrivalMins} min</div>
        </div>
      `;
    }).join('');
  }

  function stopAnimation() {
    isAnimating = false;
    if (routeAnimFrame) cancelAnimationFrame(routeAnimFrame);
    if (truckMarker) { truckMarker.remove(); truckMarker = null; }
  }

  function resize() {
    if (map) map.resize();
  }

  function recenter() {
    if (!map) return;
    map.flyTo({
      center: ECOROUTE_CONFIG.DEFAULT_CENTER,
      zoom: ECOROUTE_CONFIG.DEFAULT_ZOOM,
      duration: 800
    });
  }

  async function routeToNearestPoint(userLng, userLat) {
    const points = MOCK_USERS.filter(u => u.role === 'point');
    if (points.length === 0) return;

    // Use turf to find nearest
    const userPt = turf.point([userLng, userLat]);
    const pointFeatures = points.map(p => turf.point([p.lng, p.lat], { ...p }));
    const featuresCollection = turf.featureCollection(pointFeatures);
    
    // Nearest point
    const nearest = turf.nearestPoint(userPt, featuresCollection);
    const dest = nearest.geometry.coordinates;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLng},${userLat};${dest[0]},${dest[1]}?geometries=geojson&overview=full&access_token=${ECOROUTE_CONFIG.MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.routes || !data.routes.length) return;

      drawRoute(data.routes[0].geometry);
      
      const bounds = new mapboxgl.LngLatBounds([userLng, userLat], [userLng, userLat]);
      bounds.extend(dest);
      map.fitBounds(bounds, { padding: 80, duration: 1000 });
      
      App.showToast(`Walking route to ${nearest.properties.name} generated`, 'success');
      
    } catch(e) {
      console.warn('Failed to route to point', e);
    }
  }

  function startTrackingPolling() {
    if (trackingInterval) clearInterval(trackingInterval);
    pollDriverLocation(); // Immediate fetch
    trackingInterval = setInterval(pollDriverLocation, 5000); // 5 sec interval
  }

  function stopTrackingPolling() {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  }

  let currentMapStyle = ECOROUTE_CONFIG.MAP_STYLE;
  function toggleStyle() {
    currentMapStyle = currentMapStyle === 'mapbox://styles/mapbox/satellite-streets-v12' 
      ? 'mapbox://styles/mapbox/dark-v11' 
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    
    map.setStyle(currentMapStyle);
    map.once('style.load', () => {
      addUserPins();
      addDepotPins();
      if (routeCoords && routeCoords.length > 0) {
        // Redraw route if stored
        startCollectionRoute(); // Quick re-fetch approach as a fallback
      }
    });
  }

  return {
    init: initMap,
    startRoute: startCollectionRoute,
    stopAnimation,
    resize,
    recenter,
    addUserPins,
    updateDriverMarker,
    routeToNearestPoint,
    startTrackingPolling,
    stopTrackingPolling,
    toggleStyle,
    // Expose so app.js can trigger redraw after login
    refreshBoundaries: drawDriverBoundaries,
    loadUsersAndRefresh: async () => { await addUserPins(); addDepotPins(); },
    // Feature 3 reset (called externally if needed)
    resetProximityAlert: () => { proximityNotifiedThisSession = false; }
  };
})();
