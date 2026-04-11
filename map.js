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
  let liveUserMarker = null;
  let mapGeneratedForObserver = false;

  function updateLiveUserMarker(lng, lat) {
    if (!map) return;
    if (!liveUserMarker) {
      const el = document.createElement('div');
      el.className = 'live-user-dot';
      el.innerHTML = '<div class="pulse"></div>';
      liveUserMarker = new mapboxgl.Marker({ element: el, pitchAlignment: 'map' })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      liveUserMarker.setLngLat([lng, lat]);
    }
  }

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

  function clearUserMarkers() {
    if (userMarkers && userMarkers.length > 0) {
      userMarkers.forEach(m => m.remove());
    }
    userMarkers = [];
  }

  function initMap() {
    const isDemo = localStorage.getItem('eco_demo') === 'true';
    const noToken = !ECOROUTE_CONFIG.MAPBOX_TOKEN || ECOROUTE_CONFIG.MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE';

    if (noToken && !isDemo) {
      document.getElementById('map-container').innerHTML = `
        <div style="
          height:100%;display:flex;flex-direction:column;
          align-items:center;justify-content:center;gap:16px;
          background:#111;color:#A3A3A3;padding:40px;text-align:center;
        ">
          <div style="font-size:3rem;">🗺️</div>
          <div style="font-family:'Syne',sans-serif;font-size:1.1rem;color:#F5F5F5;">${I18n.t('map_not_configured')}</div>
          <div style="font-size:0.85rem;line-height:1.6;">
            ${I18n.t('open_config_hint')}
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

    map.on('load', () => {
      addUserPins();
      addDepotPins();
    });

    return true;
  }

  async function addUserPins() {
    clearUserMarkers();
    
    let usersToShow = [];
    let isFallback = false;

    let currentRole = (window.App && typeof App.getCurrentRole === 'function') ? App.getCurrentRole() : 'home';
    const currentUser = (window.App && typeof App.getCurrentUser === 'function') ? App.getCurrentUser() : null;

    // AGGRESSIVE OVERRIDE: If the UI says "Driver View", we are a driver.
    const mapLabel = document.getElementById('map-mode-label');
    if (mapLabel && (mapLabel.textContent.includes('Driver') || (typeof I18n !== 'undefined' && mapLabel.textContent.includes(I18n.t('driver_view').replace('🚛 ', ''))))) {
       currentRole = 'driver';
    }

    try {
      const headers = {};
      if (window.ApiModule && ApiModule.getToken()) {
        headers['Authorization'] = `Bearer ${ApiModule.getToken()}`;
      }
      const res = await fetch('/api/users/active', { headers });
      if (res.ok) {
        usersToShow = await res.json();
      } else {
        throw new Error('API down');
      }
    } catch (err) {
      console.warn("Failed to fetch live users, using mock data", err);
      usersToShow = MOCK_USERS;
      isFallback = true;
    }

    if (!usersToShow || usersToShow.length === 0) return;

    usersToShow.forEach(user => {
      // DRIVER: Sees EVERYTHING in demo
      if (currentRole !== 'driver') {
         if ((user.role || '').toLowerCase() !== 'point' && (!currentUser || user.id !== currentUser.id)) {
           return;
         }
      }

      // Coordinate Audit
      const finalLat = Number(user.lat || (user.location && user.location.lat));
      const finalLng = Number(user.lng || (user.location && user.location.lng));

      if (!finalLat || !finalLng) return;

      const fill = user.fillLevel || 0;
      const isActiveReady = user.isActiveToday === true || (user.isActiveToday === null && fill >= 70);
      
      const isBin = (user.role || '').toLowerCase() === 'point';
      
      // HIGH VISIBILITY OVERHAUL:
      // Bins: Green/Red Teardrop with 🗑️
      // Houses: Golden Teardrop with ⭐ for High Visibility
      const color = isBin ? (isActiveReady ? '#22C55E' : '#EF4444') : '#FFD700'; 
      const icon  = isBin ? '🗑️' : '⭐';

      const el = document.createElement('div');
      el.className = 'eco-marker';
      el.innerHTML = pinSVG(color, icon);
      el.style.zIndex = isBin ? '10' : '999'; // Force houses to the very front
      if (!isBin) {
        el.style.transform = 'scale(1.05)'; // Refined scale
        el.style.filter = 'drop-shadow(0 0 10px rgba(255,215,0,0.8))'; // Glow effect
      }

      const popup = new mapboxgl.Popup({ offset: 30, closeButton: false, className: 'eco-popup' })
        .setHTML(`
          <div style="background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:12px 14px;min-width:180px;font-family:'DM Sans',sans-serif;">
            <div style="font-weight:700;font-size:0.9rem;color:#F5F5F5;margin-bottom:4px;">${user.name} ${isBin ? '('+I18n.t('bin_label')+')' : '('+I18n.t('house_label')+')'}</div>
            <div style="font-size:0.75rem;color:#A3A3A3;margin-bottom:8px;">${user.address || 'Mysuru'}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-size:0.78rem;color:#A3A3A3;">${I18n.t('fill_level_label')}</span>
              <span style="font-size:1rem;font-weight:700;color:${isActiveReady ? '#22C55E' : '#EF4444'}">${fill}%</span>
            </div>
            <div style="height:6px;background:#222;border-radius:4px;margin-top:6px;overflow:hidden;">
              <div style="height:100%;width:${fill}%;background:${isActiveReady ? '#22C55E' : '#EF4444'};border-radius:4px;"></div>
            </div>
          </div>
        `);

       const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
         .setLngLat([finalLng, finalLat])
         .setPopup(popup)
         .addTo(map);

       userMarkers.push(marker);
    });

    // Update Status Pill
    const hCount = usersToShow.filter(u => (u.role || '').toLowerCase() === 'home' || u.isHouse).length;
    const bCount = usersToShow.filter(u => (u.role || '').toLowerCase() === 'point' && !u.isHouse).length;
    const pill = document.getElementById('map-status-pill');
    if (pill) {
      pill.innerHTML = `🏠 ${hCount} ${I18n.t('houses_count')} | 🗑️ ${bCount} ${I18n.t('bins_count')} ${isFallback ? I18n.t('demo_mode_label') : ''}`;
      pill.style.display = 'block';
    }
    
    // AUTO-FIT: Zoom map to show all discovered markers across all regions
    if (userMarkers.length > 0) {
       const bounds = new mapboxgl.LngLatBounds();
       userMarkers.forEach(m => bounds.extend(m.getLngLat()));
       map.fitBounds(bounds, { padding: 100, maxZoom: 15, duration: 1000 });
    }

    // Draw driver bounding areas visually
    await drawDriverBoundaries();
  }

  const ZONE_POLYGONS = {
    'gokulam_north': [[76.600, 12.335], [76.620, 12.335], [76.620, 12.355], [76.600, 12.355], [76.600, 12.335]],
    'gokulam_south': [[76.620, 12.335], [76.645, 12.335], [76.645, 12.355], [76.620, 12.355], [76.620, 12.335]],
    'gokulam_east':  [[76.600, 12.315], [76.620, 12.315], [76.620, 12.335], [76.600, 12.335], [76.600, 12.315]],
    'gokulam_west':  [[76.620, 12.315], [76.645, 12.315], [76.645, 12.335], [76.620, 12.335], [76.620, 12.315]],
    'jayalakshmipuram': [[76.645, 12.315], [76.665, 12.315], [76.665, 12.355], [76.645, 12.355], [76.645, 12.315]]
  };

  async function drawDriverBoundaries() {
    if (!window.App || App.getCurrentRole() !== 'driver' || !window.ApiModule) return;
    try {
      const response = await ApiModule.getMe();
      if (!response.user || !response.user.assignedAreas) return;
      
      const areas = response.user.assignedAreas;
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

        // Add semi-transparent fill
        map.addLayer({
          'id': layerId,
          'type': 'fill',
          'source': sourceId,
          'paint': { 'fill-color': '#EF4444', 'fill-opacity': 0.08 }
        });
        
        // Add robust bounding box outline
        map.addLayer({
          'id': outlineId,
          'type': 'line',
          'source': sourceId,
          'paint': { 'line-color': '#EF4444', 'line-width': 2, 'line-dasharray': [4, 2] }
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
          App.showToast(I18n.t('driver_online_toast'), 'success');
          if ('Notification' in window && Notification.permission === 'granted') {
             new Notification(I18n.t('notif_driver_assigned_title'), {
               body: I18n.t('notif_driver_assigned_body')
             });
          }
        }
        driverWasOnline = true;
        updateDriverMarker(loc.location.lng, loc.location.lat);

        // Feature 6: Draw Live Street Route (Truck to House)
        const userLoc = (window.App && typeof App.getUserLocation === 'function') ? App.getUserLocation() : null;
        if (userLoc) {
          updateLiveStreetRoute(loc.location, userLoc);
          
          // Show Live "You" Marker if coordinates are available
          if (userLoc.lat && userLoc.lng) {
            updateLiveUserMarker(userLoc.lng, userLoc.lat);
          }

          // GENERATE VIEW: Auto-zoom once to show user and truck
          if (!mapGeneratedForObserver) {
             const bounds = new mapboxgl.LngLatBounds()
                .extend([loc.location.lng, loc.location.lat])
                .extend([userLoc.lng, userLoc.lat]);
             map.fitBounds(bounds, { padding: 90, duration: 2000 });
             mapGeneratedForObserver = true;
          }
        }

      } else {
        if (driverWasOnline) {
          App.showToast(I18n.t('driver_offline_toast'), 'info');
        }
        driverWasOnline = false;
        mapGeneratedForObserver = false; // Allow map to re-generate when driver comes back
        proximityNotifiedThisSession = false; // reset on driver offline
        if (truckMarker) { truckMarker.remove(); truckMarker = null; }
        removeLiveConnectionLine();
      }
    } catch(e) {}
  }

  // Feature 6: Real street-following route (Truck to House)
  let lastStreetRouteFetch = 0;
  async function updateLiveStreetRoute(driverLoc, userLoc) {
    if (!map) return;
    
    const now = Date.now();
    if (now - lastStreetRouteFetch < 10000) return; // Throttle to 10s
    lastStreetRouteFetch = now;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLoc.lng},${driverLoc.lat};${userLoc.lng},${userLoc.lat}?geometries=geojson&access_token=${ECOROUTE_CONFIG.MAPBOX_TOKEN}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.routes || !data.routes.length) return;

      const geojson = {
        'type': 'Feature',
        'geometry': data.routes[0].geometry
      };

      if (map.getSource('connection-line')) {
        map.getSource('connection-line').setData(geojson);
      } else {
        map.addSource('connection-line', { 'type': 'geojson', 'data': geojson });
        map.addLayer({
          'id': 'connection-line',
          'type': 'line',
          'source': 'connection-line',
          'layout': { 'line-join': 'round', 'line-cap': 'round' },
          'paint': {
            'line-color': '#FF6B00',
            'line-width': 5,
            'line-opacity': 0.8
          }
        }, 'truck-marker-layer'); // Ensure it's under markers
      }
    } catch (e) { console.warn('Live street route fetch failed', e); }
  }

  function removeLiveConnectionLine() {
    if (!map) return;
    try {
      if (map.getLayer('connection-line')) map.removeLayer('connection-line');
      if (map.getSource('connection-line')) map.removeSource('connection-line');
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
        App.showToast(I18n.t('proximity_alert'), 'success');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(I18n.t('notif_driver_nearby_title'), {
            body: I18n.t('notif_driver_nearby_body'),
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

    function step() {
      if (!isAnimating || routeStep >= routeCoords.length - 1) {
        isAnimating = false;
        if (routeStep >= routeCoords.length - 1 && currentTripId) {
          currentTripId = null;
        }
        return;
      }
      const cur  = routeCoords[routeStep];
      const next = routeCoords[Math.min(routeStep + 1, routeCoords.length - 1)];

      const bearing = turf.bearing(
        turf.point(cur),
        turf.point(next)
      );

      if (truckMarker) {
        truckMarker.setLngLat(cur);
        const el = document.getElementById('truck-el');
        if (el) el.style.transform = `rotate(${bearing}deg)`;
      }

      const remaining = routeCoords.length - routeStep;
      const etaMins = Math.max(1, Math.round(remaining / 60));
      const etaEl = document.getElementById('eta-mins');
      if (etaEl) etaEl.textContent = `${etaMins} mins`;

      routeStep += 1;
      routeAnimFrame = requestAnimationFrame(step);
    }
    step();
  }

  async function startCollectionRoute() {
    if (!map) return;
    App.showToast(I18n.t('fetching_route_msg'), 'info');

    let usersToShow = [];
    try {
      const res = await fetch('/api/users/active');
      if (res.ok) {
        usersToShow = await res.json();
      } else {
        throw new Error('API down');
      }
    } catch (err) {
      console.warn('Fallback to MOCK_USERS for routing', err);
      usersToShow = MOCK_USERS;
    }
    
    try {
      const usersToVisit = usersToShow.filter(u => {
        const fill = u.fillLevel || 0;
        return u.isActiveToday === true || (u.isActiveToday === null && fill >= ECOROUTE_CONFIG.ACTIVE_THRESHOLD);
      });

      if (usersToVisit.length === 0) {
        App.showToast(I18n.t('no_active_locations'), 'info');
        return;
      }

      // Build waypoints: depot → active users → dump yard
      const waypoints = [
        ECOROUTE_CONFIG.DEPOT,
        ...usersToVisit.map(u => ({ 
           lng: Number(u.lng || (u.location && u.location.lng)), 
           lat: Number(u.lat || (u.location && u.location.lat)) 
        })).filter(w => w.lat && w.lng),
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

  async function routeToNearestPoint(forcedLng, forcedLat) {
    if (!map) return;

    let userLng = Number(forcedLng);
    let userLat = Number(forcedLat);

    if (!userLng || !userLat) {
        const userLoc = (window.App && typeof App.getUserLocation === 'function') ? App.getUserLocation() : null;
        if (!userLoc) {
          App.showToast(I18n.t('location_error'), 'error');
          return;
        }
        userLng = Number(userLoc.lng);
        userLat = Number(userLoc.lat);
    }

    const points = MOCK_USERS.filter(u => u.role === 'point');
    if (points.length === 0) return;

    // Use turf to find nearest
    const userPt = turf.point([userLng, userLat]);
    const pointFeatures = points.map(p => turf.point([Number(p.lng), Number(p.lat)], { ...p }));
    const featuresCollection = turf.featureCollection(pointFeatures);
    
    // Nearest point
    const nearest = turf.nearestPoint(userPt, featuresCollection);
    if (!nearest || !nearest.geometry) {
      console.warn('[MapModule] No nearest point found');
      return;
    }
    const dest = nearest.geometry.coordinates;

    updateLiveUserMarker(userLng, userLat);

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLng},${userLat};${dest[0]},${dest[1]}?geometries=geojson&overview=full&access_token=${ECOROUTE_CONFIG.MAPBOX_TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Mapbox API error: ${res.status}`);
      
      const data = await res.json();
      if (!data.routes || !data.routes.length) {
        App.showToast(I18n.t('route_fetch_failed'), 'error');
        return;
      }

      drawRoute(data.routes[0].geometry);
      
      const distance = Math.round(data.routes[0].distance);
      const minutes  = Math.ceil(data.routes[0].duration / 60);

      const bounds = new mapboxgl.LngLatBounds([userLng, userLat], [userLng, userLat]);
      bounds.extend(dest);
      map.fitBounds(bounds, { padding: 80, duration: 1000 });
      
      const msg = I18n.t('walking_route_gen', { 
        name: nearest.properties.name || 'Point',
        dist: distance || 0,
        time: minutes || 0
      });
      App.showToast(msg, 'success');
      
    } catch(e) {
      console.error('[MapModule] Routing Error:', e);
      App.showToast(I18n.t('route_fetch_failed'), 'error');
    }
  }

  function startTrackingPolling() {
    if (trackingInterval) clearInterval(trackingInterval);
    pollDriverLocation(); // Immediate fetch
    addUserPins(); // Immediate fetch
    trackingInterval = setInterval(() => {
      pollDriverLocation();
      addUserPins();
    }, 5000); // 5 sec interval
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
    updateLiveUserMarker,
    routeToNearestPoint,
    startTrackingPolling,
    stopTrackingPolling,
    toggleStyle,
    // Feature 3 reset (called externally if needed)
    resetProximityAlert: () => { proximityNotifiedThisSession = false; }
  };
})();
