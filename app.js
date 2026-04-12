// ============================================================
//  EcoRoute — App Logic v3
//  Auth via MongoDB/JWT (ApiModule), role-locked home screen,
//  Zomato-style location picker, PWA install popup
// ============================================================

const App = (() => {
  let currentTab   = 'home';
  let currentRole  = 'home';   // locked at login
  let fillLevel    = 85;
  let mapInitialized = false;
  let deferredInstallPrompt = null;
  let selectedSignupRole = 'home';
  let historyCache = { logs: null, summaries: null };

  // AI Assistant state
  let assistantImageBase64 = null;
  let isAssistantRecording = false;
  let assistantRecognition = null;

  // Catch the install prompt early before DOMContentLoaded
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // Show the custom install popup after a short delay
    setTimeout(showPWAPopup, 2500);
  });

  // Location picker state
  let locationPickerMap = null;
  let selectedLocation  = null;
  let lpMoveTimer       = null;

  // Mutable user object (synced from DB or demo)
  let user = { ...CURRENT_USER };

  // ── Demo mode check ───────────────────────────────────────
  // When MongoDB is not set up, API calls return 503. We fall
  // back gracefully and let the app run on local state.
  let demoMode = false;

  // ════════════════════════════════════════════════════════
  //  TOAST
  // ════════════════════════════════════════════════════════
  let toastTimer = null;
  function showToast(msg, type = 'info') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast ${type} show`;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);

    // TTS integration
    if (typeof I18n !== 'undefined' && typeof I18n.speak === 'function') {
      I18n.speak(msg);
    }
  }

  // ════════════════════════════════════════════════════════
  //  GREETING
  // ════════════════════════════════════════════════════════
  function getGreeting() {
    const h = new Date().getHours();
    if (typeof I18n !== 'undefined') {
      if (h < 12) return I18n.t('good_morning');
      if (h < 17) return I18n.t('good_afternoon');
      return I18n.t('good_evening');
    }
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  }

  // ════════════════════════════════════════════════════════
  //  SCREEN NARRATOR
  // ════════════════════════════════════════════════════════
  function readPageDescription() {
    if (typeof I18n === 'undefined' || typeof I18n.speak !== 'function') return;

    const descKeys = {
      home: 'page_desc_home',
      map: 'page_desc_map',
      history: 'page_desc_history',
      leaderboard: 'page_desc_leaderboard',
      chat: 'page_desc_chat',
      profile: 'page_desc_profile'
    };

    const key = descKeys[currentTab];
    if (key) {
      I18n.speak(I18n.t(key));
    }
  }

  // ════════════════════════════════════════════════════════
  //  LOGIN TAB SWITCHER
  // ════════════════════════════════════════════════════════
  function switchLoginTab(tab) {
    const userForm   = document.getElementById('user-login-form');
    const driverForm = document.getElementById('driver-login-form');
    const tabUser    = document.getElementById('login-tab-user');
    const tabDriver  = document.getElementById('login-tab-driver');

    if (tab === 'user') {
      userForm.style.display   = 'block';
      driverForm.style.display = 'none';
      tabUser.classList.add('active');
      tabDriver.classList.remove('active');
    } else {
      userForm.style.display   = 'none';
      driverForm.style.display = 'flex';
      tabDriver.classList.add('active');
      tabUser.classList.remove('active');
    }
  }

  // ── Toggle between Sign In / Sign Up views ────────────────
  function showSignupView() {
    document.getElementById('signin-view').style.display = 'none';
    document.getElementById('signup-view').style.display = 'flex';
  }
  function showSigninView() {
    document.getElementById('signup-view').style.display = 'none';
    document.getElementById('signin-view').style.display = 'flex';
  }

  function selectSignupRole(role) {
    selectedSignupRole = role;
    document.getElementById('role-opt-home').classList.toggle('active',  role === 'home');
    document.getElementById('role-opt-point').classList.toggle('active', role === 'point');
  }

  // ── Fill demo credentials ────────────────────────────────
  function fillDemo(role) {
    if (role === 'home') {
      document.getElementById('user-email').value    = 'ayush@ecoroute.app';
      document.getElementById('user-password').value = 'demo123';
      showToast(I18n.t('demo_home_filled'), 'info');
    } else if (role === 'point') {
      document.getElementById('user-email').value    = 'community@ecoroute.app';
      document.getElementById('user-password').value = 'demo123';
      showToast(I18n.t('demo_point_filled'), 'info');
    } else if (role === 'driver') {
      document.getElementById('driver-empid').value = 'D001';
      document.getElementById('driver-pin').value   = '1234';
      showToast(I18n.t('demo_driver_filled'), 'info');
    }
  }

  // ── Toggle password visibility ────────────────────────────
  function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const show = input.type === 'password';
    input.type  = show ? 'text' : 'password';
    btn.style.opacity = show ? '1' : '0.5';
  }

  // ════════════════════════════════════════════════════════
  //  SIGN UP  (new user)
  // ════════════════════════════════════════════════════════
  async function signUpUser() {
    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm  = document.getElementById('signup-confirm').value;
    const btn      = document.getElementById('user-signup-btn');

    if (!name || !email || !password) {
      showToast(I18n.t('fill_all_fields'), 'error'); return;
    }
    if (password.length < 6) {
      showToast(I18n.t('pw_min_6'), 'error'); return;
    }
    if (password !== confirm) {
      showToast(I18n.t('pw_mismatch'), 'error'); return;
    }

    btn.textContent = I18n.t('creating_account_btn');
    btn.disabled    = true;

    try {
      // Try MongoDB via API
      const newUser = await ApiModule.register(name, email, password, selectedSignupRole);
      user = { ...newUser, nickname: newUser.nickname || name.split(' ')[0] };
      showToast(`Welcome to EcoRoute, ${user.nickname}! 🌱`, 'success');
      completeLogin(user.role);
    } catch (err) {
      if (err.message === 'DEMO_MODE' || err.message.includes('503') || err.message.includes('Database not configured')) {
        // Demo fallback
        demoMode = true;
        user = {
          ...CURRENT_USER,
          name, email,
          nickname: name.split(' ')[0],
          role: selectedSignupRole,
          points: 0, collectionsThisMonth: 0
        };
        showToast(`Welcome, ${user.nickname}! (Demo mode) 🌱`, 'success');
        completeLogin(user.role);
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      btn.textContent = I18n.t('create_account');
      btn.disabled    = false;
    }
  }

  // ════════════════════════════════════════════════════════
  //  USER LOGIN
  // ════════════════════════════════════════════════════════
  async function loginUser() {
    const email    = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const btn      = document.getElementById('user-login-btn');

    if (!email || !password) {
      showToast(I18n.t('login_fields_req'), 'error'); return;
    }

    btn.textContent = I18n.t('signing_in_btn');
    btn.disabled    = true;

    try {
      const dbUser = await ApiModule.login(email, password);
      user = { ...dbUser };
      completeLogin(user.role);
    } catch (err) {
      if (err.message === 'DEMO_MODE' || err.message.includes('503') || err.message.includes('Database not configured')) {
        // Demo fallback: role guessed from email
        demoMode = true;
        user = {
          ...CURRENT_USER,
          role: email.includes('community') || email.includes('point') ? 'point' : 'home'
        };
        showToast(`Welcome back! (Demo mode)`, 'info');
        completeLogin(user.role);
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      btn.textContent = I18n.t('sign_in');
      btn.disabled    = false;
    }
  }

  // ════════════════════════════════════════════════════════
  //  DRIVER LOGIN
  // ════════════════════════════════════════════════════════
  async function loginDriver() {
    const empid = document.getElementById('driver-empid').value.trim();
    const pin   = document.getElementById('driver-pin').value.trim();
    const btn   = document.getElementById('driver-login-btn');

    if (!empid || !pin) {
      showToast(I18n.t('driver_login_fields'), 'error'); return;
    }

    btn.textContent = I18n.t('verifying_btn');
    btn.disabled    = true;

    try {
      const dbUser = await ApiModule.driverLogin(empid, pin);
      user = { ...dbUser };
      completeLogin('driver');
    } catch (err) {
      if (err.message === 'DEMO_MODE' || err.message.includes('503') || err.message.includes('Database not configured')) {
        demoMode = true;
        user = { ...CURRENT_USER, name: 'Rahul Kumar', nickname: 'Rahul', role: 'driver' };
        showToast('Driver demo mode active', 'info');
        completeLogin('driver');
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      btn.textContent = I18n.t('access_driver_dashboard');
      btn.disabled    = false;
    }
  }

  // ════════════════════════════════════════════════════════
  //  COMPLETE LOGIN (shared by all paths)
  // ════════════════════════════════════════════════════════
  function completeLogin(role) {
    currentRole = role;
    user.role   = role;

    // Show chrome
    document.getElementById('topbar').style.display     = 'flex';
    document.getElementById('bottom-nav').style.display = 'flex';

    // Hide login, navigate home
    document.getElementById('screen-login').classList.remove('active');
    navigate('home');
    updateNotifBadge();

    // Request notification permission (non-blocking)
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => Notification.requestPermission(), 3000);
    }

    // Show PWA install popup after 4s if prompt is ready
    setTimeout(showPWAPopup, 4000);

    const nickname = user.nickname || (user.name ? user.name.split(' ')[0] : 'User');
    showToast(I18n.t('welcome_user', { name: nickname }), 'success');
  }

  // ════════════════════════════════════════════════════════
  //  LOGOUT
  // ════════════════════════════════════════════════════════
  function logout() {
    ApiModule.logout();
    mapInitialized = false;
    locationPickerMap = null;
    user = { ...CURRENT_USER };
    currentRole = 'home';
    demoMode    = false;
    activePointBinId = null;
    historyCache = { logs: null, summaries: null };

    document.getElementById('topbar').style.display     = 'none';
    document.getElementById('bottom-nav').style.display = 'none';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-login').classList.add('active');
    switchLoginTab('user');
    showSigninView();
    showToast(I18n.t('signed_out'), 'info');
  }

  // ════════════════════════════════════════════════════════
  //  NAVIGATION
  // ════════════════════════════════════════════════════════
  function navigate(tab) {
    currentTab = tab;

    // Silence ongoing speech when changing screens
    if (typeof I18n !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const screen  = document.getElementById(`screen-${tab}`);
    const navItem = document.querySelector(`.nav-item[data-tab="${tab}"]`);
    if (screen)  screen.classList.add('active');
    if (navItem) navItem.classList.add('active');

    if (tab === 'map') {
      if (!mapInitialized) {
        mapInitialized = MapModule.init();
      } else {
        setTimeout(MapModule.resize, 100);
      }
      if (currentRole === 'home') {
        MapModule.startTrackingPolling();
      } else {
        MapModule.stopTrackingPolling();
      }
    } else {
      MapModule.stopTrackingPolling();
    }
    
    if (tab === 'home')        renderHome();
    if (tab === 'history')     renderHistory('calendar');
    if (tab === 'leaderboard') renderLeaderboard();
    if (tab === 'profile')     renderProfile();

    updateRoleGlobalUI();

    // TTS Integration
    if (typeof I18n !== 'undefined' && typeof I18n.speak === 'function') {
      const navKeys = {
        home: 'nav_home_speak',
        map: 'nav_map_speak',
        history: 'nav_history_speak',
        leaderboard: 'nav_rewards_speak',
        chat: 'nav_chat_speak',
        profile: 'nav_profile_speak'
      };
      if (navKeys[tab]) I18n.speak(I18n.t(navKeys[tab]));
    }
  }

  // ── Global role-based UI toggles (Map buttons, nav tabs, etc) ──
  function updateRoleGlobalUI() {
    const routeBtn   = document.getElementById('route-start-btn');
    const overloadBtn = document.getElementById('overload-btn');
    const statusBanner = document.getElementById('status-banner');
    const statsRow     = document.querySelector('.stats-row');
    const rewardsTab   = document.querySelector('.nav-item[data-tab="leaderboard"]');
    const fillPanel    = document.getElementById('fill-panel');
    const driverPane   = document.getElementById('driver-panel');
    const mapLabel     = document.getElementById('map-mode-label');

    if (currentRole === 'driver') {
      if (statusBanner) statusBanner.style.display = 'none';
      if (statsRow)     statsRow.style.display     = 'none';
      if (rewardsTab)   rewardsTab.style.display   = 'none';
      if (fillPanel)    fillPanel.style.display    = 'none';
      if (driverPane)   driverPane.style.display   = 'block';
      if (routeBtn)     routeBtn.style.display     = 'flex';
      if (overloadBtn)  overloadBtn.style.display    = 'block';
      if (mapLabel)     mapLabel.textContent       = I18n.t('driver_view');
    } else {
      if (statusBanner) statusBanner.style.display = 'flex';
      if (statsRow)     statsRow.style.display     = 'flex';
      if (rewardsTab)   rewardsTab.style.display   = 'flex';
      if (fillPanel)    fillPanel.style.display    = 'flex';
      if (driverPane)   driverPane.style.display   = 'none';
      if (routeBtn)     routeBtn.style.display     = 'none';
      if (overloadBtn)  overloadBtn.style.display    = 'none';
      if (mapLabel)     mapLabel.textContent       = I18n.t('community_map');
    }
  }

  // ════════════════════════════════════════════════════════
  //  HOME SCREEN
  // ════════════════════════════════════════════════════════
  function renderHome() {
    document.getElementById('greeting-text').textContent = getGreeting();
    const nickname = user.nickname || (user.name ? user.name.split(' ')[0] : 'User');
    document.getElementById('greeting-name').innerHTML =
      `${nickname} <span>✨</span>`;

    document.getElementById('stat-next-pickup').textContent  = user.nextPickup || 'Today 10:30';
    document.getElementById('stat-collections').textContent  = user.collectionsThisMonth || 0;
    document.getElementById('stat-points').textContent       = (user.points || 0).toLocaleString();

    renderGauge(fillLevel, 'home-gauge');
    renderStatusBanner();
    renderRoleHomeContent();
  }

  // ── Role-locked home content (no switcher) ────────────────
  async function renderRoleHomeContent() {
    // UI toggles are now handled by updateRoleGlobalUI()
    
    let isBlocked = false;
    if (currentRole === 'home') {
      try {
        if (!demoMode) {
          const state = await ApiModule.getBlockStatus();
          isBlocked = state.isBlocked;
        }
      } catch(e) {}
    }

    if (currentRole === 'driver') {
      const el = document.getElementById('driver-active-count');
      if (el) el.textContent = MOCK_USERS.filter(u => u.fillLevel >= ECOROUTE_CONFIG.ACTIVE_THRESHOLD).length;
      // Refresh today's bin-verify summary counts
      refreshDriverSummary();

    } else if (currentRole === 'point' || (currentRole === 'home' && isBlocked && user.isActiveToday !== true)) {
      if (statusBanner && currentRole !== 'point') {
         statusBanner.style.display = 'none'; // hide confirm banner for blocked unconfirmed home user
      }

      if (area) {
        renderPointUserDashboard(area, isBlocked);
      }
    } else {
      // Home user (default)
      const addr = user.address || I18n.t('set_location_first');
      area.innerHTML = `
        <div class="home-hero-card card-home" onclick="App.navigate('confirm')">
          <div class="home-hero-icon">🏠</div>
          <div class="home-hero-body">
            <div class="home-hero-title">${I18n.t('direct_house_collection')}</div>
            <div class="home-hero-sub">${addr}</div>
            <button class="home-hero-btn orange">${I18n.t('schedule_pickup')}</button>
          </div>
        </div>
        <div class="home-hero-card card-point" onclick="App.navigate('map')" style="margin-top:10px;">
          <div class="home-hero-icon">🗑️</div>
          <div class="home-hero-body">
            <div class="home-hero-title">${I18n.t('nearby_collection_points')}</div>
            <div class="home-hero-sub">${I18n.t('nearby_points_desc')}</div>
            <button class="home-hero-btn green" onclick="event.stopPropagation(); App.findNearestPoint();">${I18n.t('find_nearest')}</button>
          </div>
        </div>
      `;
    }
  }

  async function renderPointUserDashboard(container, isBlocked) {
    container.innerHTML = `<div style="padding:10px;text-align:center;color:var(--text3);">📍 Loading nearby bins...</div>`;
    
    try {
      const res = await fetch('/api/users/active');
      const allUsers = await res.json();
      const bins = allUsers.filter(u => u.role === 'point');

      // Sort by proximity to user
      const sorted = bins.map(b => {
        const dist = turf.distance(
          turf.point([user.lng, user.lat]),
          turf.point([b.lng, b.lat]),
          { units: 'meters' }
        );
        return { ...b, distance: Math.round(dist) };
      }).sort((a, b) => a.distance - b.distance);

      let title = isBlocked ? I18n.t('find_community_point').replace('📍 ', '') : I18n.t('nearby_collection_points');
      let sub   = isBlocked ? I18n.t('driver_locked_route') : I18n.t('bin_selected_msg');

      let html = `
        <div style="margin-bottom:16px;">
          <div style="font-size:1rem;font-weight:700;color:var(--text1);">${title}</div>
          <div style="font-size:0.75rem;color:var(--text3);">${sub}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;max-height:300px;overflow-y:auto;padding-right:4px;">
      `;

      html += sorted.map(b => `
        <div class="bin-card ${activePointBinId === b.id ? 'active' : ''}" 
             onclick="App.selectPointBin('${b.id}', ${b.fillLevel})"
             style="background:var(--bg2);border:1px solid ${activePointBinId === b.id ? 'var(--orange)' : 'var(--border)'};border-radius:14px;padding:12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all 0.2s;">
          <div style="font-size:1.5rem;background:var(--bg3);width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;">🗑️</div>
          <div style="flex:1;">
            <div style="font-size:0.85rem;font-weight:700;color:var(--text1);">${b.name || 'Public Bin'}</div>
            <div style="font-size:0.7rem;color:var(--text3);">${b.distance}m away · ${b.address || 'Smart Collection Point'}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.85rem;font-weight:700;color:${b.fillLevel > 80 ? 'var(--red)' : 'var(--green)'};">${b.fillLevel}%</div>
            <div style="font-size:0.6rem;color:var(--text3);">FILL</div>
          </div>
        </div>
      `).join('');

      html += `</div>`;
      container.innerHTML = html;
    } catch(e) {
      container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--red);">Error loading community bins.</div>`;
    }
  }

  function selectPointBin(id, fill) {
    activePointBinId = id;
    const slider = document.getElementById('fill-slider');
    if (slider) {
      slider.value = fill;
      updateFill(fill);
    }
    // Re-render home to show active state
    renderRoleHomeContent();
    showToast('Bin selected. Adjust slider to update fill level.', 'info');
  }

  function findNearestPoint() {
    if (!user.location) {
      showToast('Please set your location first.', 'error');
      openLocationPicker();
      return;
    }
    navigate('map');
    const loc = (typeof liveCoords !== 'undefined' && liveCoords) ? liveCoords : (user && user.location);
    if (!loc) return;
    
    // Give map time to init
    setTimeout(() => {
      if (typeof MapModule !== 'undefined' && typeof MapModule.routeToNearestPoint === 'function') {
        MapModule.routeToNearestPoint(loc.lng, loc.lat);
      }
    }, 800);
  }

  // ── Status Banner ─────────────────────────────────────────
  function renderStatusBanner() {
    const banner = document.getElementById('status-banner');
    const icon   = document.getElementById('status-icon');
    const label  = document.getElementById('status-label');
    const sub    = document.getElementById('status-sub');
    const btn    = document.getElementById('status-btn');
    if (!banner) return;

    if (user.isActiveToday === true) {
      banner.className  = 'status-banner status-active';
      icon.textContent  = '✅';
      label.textContent = I18n.t('youre_active_today');
      sub.textContent   = I18n.t('bin_confirmed');
      btn.textContent   = I18n.t('done');
      btn.className     = 'status-confirm-btn done';
      btn.onclick       = null;
    } else if (user.isActiveToday === false) {
      banner.className  = 'status-banner status-inactive';
      icon.textContent  = '❌';
      label.textContent = I18n.t('not_available_today');
      sub.textContent   = I18n.t('bin_not_collected');
      btn.textContent   = I18n.t('change');
      btn.className     = 'status-confirm-btn';
      btn.onclick       = () => navigate('confirm');
    } else {
      banner.className  = 'status-banner status-pending';
      icon.textContent  = '⏳';
      label.textContent = I18n.t('confirm_todays_pickup');
      sub.textContent   = I18n.t('tap_to_confirm');
      btn.textContent   = I18n.t('confirm');
      btn.className     = 'status-confirm-btn';
      btn.onclick       = () => navigate('confirm');
    }
  }

  // ── Gauge ─────────────────────────────────────────────────
  function renderGauge(level, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const pct    = Math.min(100, Math.max(0, level));
    const color  = pct >= 70 ? '#EF4444' : pct >= 40 ? '#FF6B00' : '#22C55E';
    const dash   = 2 * Math.PI * 54;
    const offset = dash * (1 - pct / 100);

    container.innerHTML = `
      <div class="gauge-wrap">
        <svg class="gauge-svg" width="150" height="150" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="54" fill="none" stroke="#222" stroke-width="10"/>
          <circle cx="80" cy="80" r="54" fill="none"
            stroke="${color}" stroke-width="10"
            stroke-linecap="round"
            stroke-dasharray="${dash}"
            stroke-dashoffset="${offset}"
            transform="rotate(-90 80 80)"
            style="transition:stroke-dashoffset .6s ease, stroke .4s ease;"/>
          <text x="80" y="72" text-anchor="middle" fill="${color}"
            font-family="Syne,sans-serif" font-size="28" font-weight="800">${pct}%</text>
          <text x="80" y="94" text-anchor="middle" fill="#A3A3A3"
            font-family="DM Sans,sans-serif" font-size="13">Full</text>
        </svg>
      </div>`;
  }

  function updateFill(val) {
    const sliderLabel = document.getElementById('fill-slider-label');
    const displayVal  = document.getElementById('fill-display-val');
    
    if (sliderLabel) {
      sliderLabel.textContent = val + '%';
      sliderLabel.className = val > 75 ? 'fill-high' : 'fill-low';
    }
    if (displayVal) displayVal.textContent = val + '%';
    
    renderGauge(val, 'home-gauge');
  }

  // ── Image Upload ─────────────────────────────────────────
  function setupImageUpload() {
    const input      = document.getElementById('bin-photo-input');
    const placeholder= document.getElementById('upload-placeholder');
    const preview    = document.getElementById('upload-preview');
    const img        = document.getElementById('bin-photo-img');
    if (!input) return;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        img.src                   = e.target.result;
        placeholder.style.display = 'none';
        preview.style.display     = 'block';
      };
      reader.readAsDataURL(file);
    });
  }

  // ── Submit Report ─────────────────────────────────────────
  async function submitReport() {
    const val = parseInt(document.getElementById('fill-slider').value);
    const btn = document.getElementById('submit-report-btn');
    if (btn) { btn.textContent = I18n.t('submitting_btn'); btn.disabled = true; }

    try {
      // If role is Point, we update the SELECTED bin, otherwise we update current user
      const targetId = currentRole === 'point' ? activePointBinId : null;
      
      if (!demoMode) {
        // We'll need a backend endpoint for this or update updateMe to accept an ID
        // For now, let's assume updateMe works on current user
        await ApiModule.updateMe({ fillLevel: val, targetId });
      }
      
      showToast(I18n.t('status_updated'), 'success');
      if (currentRole === 'point') renderRoleHomeContent();
    } catch(e) {
      showToast(I18n.t('update_failed'), 'error');
    } finally {
      if (btn) { btn.textContent = I18n.t('submit_report'); btn.disabled = false; }
    }
  }

  // ════════════════════════════════════════════════════════
  //  CONFIRM
  // ════════════════════════════════════════════════════════
  function renderBlockedBanner() {
    const area = document.getElementById('home-content-area');
    area.innerHTML = `
      <div class="home-hero-card" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);flex-direction:column;align-items:flex-start;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="home-hero-icon" style="font-size:2rem;">🚫</div>
          <div class="home-hero-body">
            <div class="home-hero-title" style="color:var(--red);">${I18n.t('youre_late')}</div>
            <div class="home-hero-sub">${I18n.t('driver_locked_route')}</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-full" onclick="App.navigate('map')" style="border-color:var(--red);color:var(--red);">
          ${I18n.t('find_community_point')}
        </button>
      </div>
    `;
  }

  async function confirmPickup(isActive) {
    user.isActiveToday = isActive;
    const pill = document.getElementById('confirm-status-pill');
    
    if (isActive) {
      if (pill) {
        pill.textContent = I18n.t('waiting_location');
        pill.style.color = '#FFA500';
      }
      
      if (!navigator.geolocation) {
        showToast(I18n.t('location_not_supported'), 'error');
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        user.location = { lat, lng };

        try {
          if (!demoMode) {
            const res = await ApiModule.confirmPickup(lat, lng);
            if (res.blocked) {
              showToast(I18n.t('route_locked_msg'), "error");
              if (pill) {
                pill.textContent = '🚫 ' + I18n.t('route_locked_msg');
                pill.style.color = 'var(--red)';
              }
              navigate('home');
              setTimeout(renderBlockedBanner, 500);
              return;
            }
            
            user.points = (user.points || 0) + ECOROUTE_CONFIG.POINTS.CONFIRM_PICKUP;
            await ApiModule.updateMe({ points: user.points });
            
            // Log for calendar
            const todayStr = new Date().toISOString().split('T')[0];
            await ApiModule.addCollectionLog(todayStr, 'collected', ECOROUTE_CONFIG.POINTS.CONFIRM_PICKUP);
            historyCache.logs = null; // Invalidate cache
          }
          
          if (pill) {
            pill.textContent = '✅ ' + I18n.t('bin_confirmed');
            pill.style.color = 'var(--green)';
          }
          showToast(I18n.t('confirmed_pts', { pts: ECOROUTE_CONFIG.POINTS.CONFIRM_PICKUP }), 'success');
          setTimeout(() => navigate('home'), 1200);
          
        } catch (err) {
          showToast(err.message || 'Server error', 'error');
        }
      }, (err) => {
        showToast(I18n.t('location_error'), 'error');
      });
      
    } else {
      if (pill) {
        pill.textContent = '❌ ' + I18n.t('not_available_today');
        pill.style.color = 'var(--red)';
      }
      showToast(I18n.t('not_available_toast'), 'info');
      try {
        if (!demoMode) {
          await ApiModule.updateMe({ isActiveToday: false });
          const todayStr = new Date().toISOString().split('T')[0];
          await ApiModule.addCollectionLog(todayStr, 'missed', 0);
        }
      } catch(e){}
      setTimeout(() => navigate('home'), 1200);
    }
  }

  // ════════════════════════════════════════════════════════
  //  DRIVER TOOLS
  // ════════════════════════════════════════════════════════
  let locationWatchId = null;

  // ─ Bin geo-fence state (Feature 1) ────────────────────────────
  // Tracks which user IDs have already triggered the popup today
  let verifiedBinIds = new Set();
  // Currently pending verification (userId + name)
  let pendingBinUser = null;
  
  async function toggleDriverBlock() {
    const btn = document.getElementById('driver-block-btn');
    if (!btn) return;
    try {
      const status = await ApiModule.getBlockStatus();
      if (status.isBlocked) {
        await ApiModule.unblockLocationUpdates();
        btn.textContent = I18n.t('block_pickups');
        btn.style.background = '';
        btn.style.color = '#EF4444';
        showToast(I18n.t('re_request_pickups_msg'), 'success');
      } else {
        await ApiModule.blockLocationUpdates();
        btn.textContent = I18n.t('unblock_pickups');
        btn.style.background = '#EF4444';
        btn.style.color = '#FFF';
        showToast(I18n.t('pickups_blocked_msg'), 'info');
      }
    } catch (err) {
      showToast(I18n.t('block_sync_err'), 'error');
    }
  }

  async function toggleDriverOnline() {
    const btn = document.getElementById('driver-online-btn');
    if (!btn) return;

    if (user.isOnline) {
      user.isOnline = false;
      if (!demoMode) await ApiModule.setDriverOnline(false, null).catch(()=>{});
      if (locationWatchId) navigator.geolocation.clearWatch(locationWatchId);
      btn.textContent = I18n.t('go_online');
      btn.style.background = '#22C55E';
      showToast(I18n.t('offline_msg'), 'info');
    } else {
      if (!navigator.geolocation) {
        showToast(I18n.t('not_supported_msg'), 'error');
        return;
      }
      user.isOnline = true;
      btn.textContent = I18n.t('go_offline');
      btn.style.background = '#EF4444';
      
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!demoMode) await ApiModule.setDriverOnline(true, loc).catch(()=>{});
        showToast(I18n.t('online_sharing_msg'), 'success');
        
        locationWatchId = navigator.geolocation.watchPosition(async (newPos) => {
          const newLoc = { lat: newPos.coords.latitude, lng: newPos.coords.longitude };
          if (!demoMode) ApiModule.setDriverOnline(true, newLoc).catch(()=>{});
          user.location = newLoc;
          // ─ Feature 1: check if driver arrived at a collection bin ─
          checkBinProximity(newLoc);
        });
      }, err => {
        showToast(I18n.t('permission_needed_msg'), 'error');
        user.isOnline = false;
        btn.textContent = '📍 Go Online (Share Location)';
        btn.style.background = '#22C55E';
      }, { enableHighAccuracy: true });
    }
  }

  // ─ Feature 1: Bin proximity geo-fence ────────────────────────
  // Checks if driver is within 30m of any confirmed H-User's location.
  // If so, and popup not already shown for that user today, triggers the
  // bin-verify modal.
  async function checkBinProximity(driverLoc) {
    // Don't trigger if a popup is already open
    if (pendingBinUser) return;
    try {
      const res = await fetch('/api/users/active');
      const users = await res.json();
      const confirmed = users.filter(u =>
        u.isActiveToday === true &&
        u.role === 'home' &&
        u.lat && u.lng &&
        !verifiedBinIds.has(String(u.id))
      );

      for (const u of confirmed) {
        const dist = turf.distance(
          turf.point([driverLoc.lng, driverLoc.lat]),
          turf.point([u.lng, u.lat]),
          { units: 'meters' }
        );
        if (dist <= 30) {
          showBinVerifyPopup(u);
          break;
        }
      }
    } catch(e) { /* silent */ }
  }

  function showBinVerifyPopup(u) {
    pendingBinUser = { id: u.id, name: u.name, address: u.address };
    const nameEl = document.getElementById('bin-verify-user-name');
    const addrEl = document.getElementById('bin-verify-user-addr');
    if (nameEl) nameEl.textContent = u.name || 'Resident';
    if (addrEl) addrEl.textContent = u.address || 'Collection point';
    openModal('bin-verify-modal');
  }

  async function verifyBin(hasDust) {
    if (!pendingBinUser) { closeModal(); return; }
    const { id, name } = pendingBinUser;
    verifiedBinIds.add(String(id));
    pendingBinUser = null;
    closeModal();

    try {
      if (!demoMode) {
        await ApiModule.verifyBin(id, name, hasDust);
      }
      if (hasDust) {
        showToast(I18n.t('bin_verified', { name }), 'success');
      } else {
        showToast(I18n.t('bin_empty_msg', { name }), 'info');
      }
      refreshDriverSummary();
      historyCache.summaries = null; // Invalidate cache
    } catch(e) {
      showToast(I18n.t('verify_error'), 'error');
    }
  }

  function skipBinVerify() {
    if (pendingBinUser) {
      // Mark as seen so popup doesn't keep re-appearing
      verifiedBinIds.add(String(pendingBinUser.id));
      pendingBinUser = null;
    }
    closeModal();
  }

  // Refresh driver's today stats in the driver panel
  async function refreshDriverSummary() {
    try {
      if (demoMode) return;
      const summary = await ApiModule.getDailySummary();
      const verEl = document.getElementById('driver-verified-count');
      const ptsEl = document.getElementById('driver-pts-given');
      if (verEl) verEl.textContent = summary.housePickups || 0;
      if (ptsEl) ptsEl.textContent = summary.pointsDistributed || 0;
    } catch(e) { /* silent */ }
  }

  // ─ Feature 2: Manual 6AM-style notification trigger ───────────
  async function triggerMorningNotification() {
    const btn = document.getElementById('driver-notify-btn');
    if (btn) { btn.textContent = '⏳ Sending...'; btn.disabled = true; }

    try {
      let count = 0;
      if (!demoMode) {
        const result = await ApiModule.triggerNotification();
        count = result.count || 0;
      } else {
        count = 3; // demo placeholder
      }

      // Fire a local browser notification as visual confirmation
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(I18n.t('notif_driver_nearby_title'), {
          body: I18n.t('morning_alert_sent', { count }),
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚛</text></svg>'
        });
      }

      showToast(I18n.t('morning_alert_sent', { count }), 'success');
    } catch(e) {
      showToast(I18n.t('notif_error'), 'error');
    } finally {
      if (btn) { btn.textContent = I18n.t('send_morning_notif'); btn.disabled = false; }
    }
  }

  // ─ Feature 6: Issue Reporting ───────────────────────────────
  function openIssueReportModal() {
    openModal('issue-report-modal');
  }

  async function submitDriverReport() {
    const type = document.getElementById('report-issue-type').value;
    const desc = document.getElementById('report-issue-desc').value;
    if (!desc) { showToast(I18n.t('enter_description'), 'error'); return; }

    try {
      if (!demoMode) {
        await ApiModule.submitDriverReport(type, desc, user.location);
      }
      showToast(I18n.t('issue_reported'), 'success');
      closeModal();
      document.getElementById('report-issue-desc').value = '';
    } catch (e) {
      showToast(I18n.t('report_error'), 'error');
    }
  }

  // ─ Feature 5: Trip Completion ───────────────────────────────
  async function handleTripComplete(tripId) {
    showToast(I18n.t('destination_reached'), 'success');
    try {
      if (!demoMode && tripId) {
        await ApiModule.completeTrip(tripId);
      }
      
      const summary = await ApiModule.getDailySummary();
      
      // Update summary modal
      const pEl = document.getElementById('summary-pickups');
      const ptsEl = document.getElementById('summary-points');
      if (pEl) pEl.textContent = summary.housePickups || 0;
      if (ptsEl) ptsEl.textContent = summary.pointsDistributed || 0;
      
      openModal('trip-summary-modal');
    } catch (e) {
      console.warn('Trip completion error:', e);
    }
  }

  // ════════════════════════════════════════════════════════
  //  HISTORY (CALENDAR)
  // ════════════════════════════════════════════════════════
  async function renderHistory(filter = 'calendar') {
    const screenCal = document.getElementById('view-calendar');
    const screenList = document.getElementById('view-list');
    
    // 1. Switch containers immediately for better perceived speed
    if (filter === 'calendar') {
      if (screenCal) screenCal.style.display = 'block';
      if (screenList) screenList.style.display = 'none';
    } else {
      if (screenCal) screenCal.style.display = 'none';
      if (screenList) screenList.style.display = 'block';
    }

    // 2. Determine target elements
    const grid = document.getElementById('calendar-grid');
    const monthName = document.getElementById('calendar-month-name');
    const list = document.getElementById('history-list');

    // 3. Local Caching Logic
    let logs = historyCache.logs;
    let summaries = historyCache.summaries;

    const needsFetch = (currentRole === 'driver') ? !summaries : !logs;

    if (needsFetch) {
      // Show loading indicator
      if (filter === 'calendar' && grid) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text3); font-size:0.85rem;">⏳ ${I18n.t('history_loading')}</div>`;
      } else if (filter !== 'calendar' && list) {
        list.innerHTML = `<div style="text-align:center; padding:40px; color:var(--text3); font-size:0.85rem;">⏳ ${I18n.t('history_loading')}</div>`;
      }

      try {
        if (currentRole === 'driver') {
          summaries = await ApiModule.getDriverHistory();
          historyCache.summaries = summaries;
        } else {
          logs = await ApiModule.getCollectionLog();
          historyCache.logs = logs;
        }
      } catch(e) { 
        console.warn('History fetch fail', e); 
        if (filter === 'calendar' && grid) grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--red);">${I18n.t('history_error')}</div>`;
        return;
      }
    }

    // 4. Render Calendar View
    if (filter === 'calendar') {
      if (!grid || !monthName) return;
      
      const today = new Date();
      monthName.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
      
      const dayNames = ['S','M','T','W','T','F','S'];
      let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');
      
      for (let i=0; i<firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
      }
      
      for (let day=1; day<=daysInMonth; day++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        let content = '';
        let dayClass = '';
        const isToday = (day === today.getDate());

        if (currentRole === 'driver') {
          const sum = (summaries || []).find(s => s.date === dateStr);
          if (sum) {
            content = `<div class="calendar-day-stat">${sum.housePickups || 0}</div>`;
            dayClass = 'active';
          }
        } else {
          const log = (logs || []).find(l => l.date === dateStr);
          if (log) {
            content = log.status === 'collected' 
              ? '<div class="calendar-dot green"></div>' 
              : '<div class="calendar-dot red"></div>';
            dayClass = log.status;
          }
        }
        
        html += `
          <div class="calendar-day ${dayClass} ${isToday ? 'today' : ''}">
            <span class="calendar-day-date">${day}</span>
            ${content}
          </div>
        `;
      }
      grid.innerHTML = html;
      grid.style.display = 'grid';
    } 
    // 5. Render List View
    else {
      if (!list) return;

      if (currentRole === 'driver') {
        if (!summaries || summaries.length === 0) {
          list.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text3);font-size:0.85rem;">${I18n.t('no_history')}</div>`;
          return;
        }

        list.innerHTML = summaries.map(h => {
          const dt = new Date(h.date);
          const dateStr = dt.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
          return `
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
               <div style="flex:1;">
                  <div style="font-size:0.95rem;font-weight:700;color:var(--text1);">${dateStr}</div>
                  <div style="font-size:0.75rem;color:var(--text3);margin-top:2px;">Shift: Morning Session</div>
               </div>
               <div style="display:flex;gap:15px;text-align:right;">
                  <div>
                     <div style="font-size:1rem;font-weight:700;color:var(--green);">${h.housePickups || 0}</div>
                     <div style="font-size:0.6rem;color:var(--text3);text-transform:uppercase;">Pickups</div>
                  </div>
                  <div>
                     <div style="font-size:1rem;font-weight:700;color:var(--orange);">${h.pointsDistributed || 0}</div>
                     <div style="font-size:0.6rem;color:var(--text3);text-transform:uppercase;">${I18n.t('pts_given')}</div>
                  </div>
               </div>
            </div>
          `;
        }).join('');
      } else {
        if (!logs || logs.length === 0) {
          list.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text3);font-size:0.85rem;">${I18n.t('no_collection_found')}</div>`;
          return;
        }

        list.innerHTML = logs.map(l => {
          const dt = new Date(l.date);
          const dateStr = dt.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
          const isCollected = l.status === 'collected';
          const dotStyle = isCollected ? 'background:var(--green); box-shadow:0 0 6px var(--green);' : 'background:var(--red); box-shadow:0 0 6px var(--red);';
          return `
            <div class="history-item">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:600; font-size:0.85rem;">${dateStr}</div>
                <div style="font-weight:600; font-size:0.85rem; color:${isCollected ? 'var(--green)' : 'var(--red)'}; text-transform:capitalize;">
                  ${l.status}
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:0.75rem; color:var(--text3);">
                <div style="display:flex; align-items:center; gap:6px;">
                  <div style="width:6px;height:6px;border-radius:50%;${dotStyle}"></div>
                  ${I18n.t('points_earned_label')}
                </div>
                <div style="color:var(--orange); font-weight:700;">+${l.points || 0}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // ════════════════════════════════════════════════════════
  //  LEADERBOARD
  // ════════════════════════════════════════════════════════
  function renderLeaderboard() {
    const sorted = [...LEADERBOARD].sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));
    const rankColors   = ['gold','silver','bronze','',''];
    const rankEmojis   = ['🏆','🌿','🚛','👤','😎'];
    const list = document.getElementById('lb-list');
    if (list) {
      list.innerHTML = sorted.map((u, i) => `
        <div class="lb-item ${u.isMe ? 'me' : ''}">
          <span class="lb-rank ${rankColors[i]}">${u.rank}</span>
          <div class="lb-avatar">${rankEmojis[i]}</div>
          <span class="lb-name">${u.name}${u.isMe ? ` (${I18n.t('you')})` : ''}</span>
          <span class="lb-pts">${u.points.toLocaleString()} pts</span>
        </div>`).join('');
    }

    const myPts = user.points || 0;
    const el = id => document.getElementById(id);
    if (el('lb-my-points')) el('lb-my-points').textContent = myPts.toLocaleString() + ' Points';
    if (el('lb-pts-current')) el('lb-pts-current').textContent = myPts.toLocaleString() + ' pts';
    if (el('lb-progress-fill')) el('lb-progress-fill').style.width = Math.min(100, (myPts / 4000) * 100) + '%';

    renderRedeemRow();
  }

  function renderRedeemRow() {
    const row = document.getElementById('redeem-row');
    if (!row) return;
    row.innerHTML = REDEEM_CATALOG.map(item => `
      <div class="redeem-card" onclick="App.openRedeemModal('${item.id}')">
        <div class="redeem-img">${item.icon}</div>
        <div class="redeem-foot">
          <div class="redeem-name">${item.name}</div>
          <div class="redeem-cost">🪙 ${item.cost} pts</div>
          <button class="btn btn-green btn-full" style="padding:6px;font-size:0.72rem;">REDEEM</button>
        </div>
      </div>`).join('');
  }

  // ════════════════════════════════════════════════════════
  //  MODALS
  // ════════════════════════════════════════════════════════
  function openModal(modalId) {
    document.getElementById('modal-overlay').classList.add('show');
    document.getElementById(modalId).classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('show');
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    document.body.style.overflow = '';
  }

  function openRedeemModal(itemId) {
    const item = REDEEM_CATALOG.find(r => r.id === itemId);
    if (!item) return;
    const content = document.getElementById('redeem-modal-content');
    content.innerHTML = `
      <div class="redeem-modal-hero">
        <div class="redeem-modal-icon">${item.icon}</div>
        <div class="redeem-modal-name">${item.name}</div>
        <div class="redeem-modal-desc">${item.desc}</div>
        <div class="redeem-modal-cost">🪙 ${item.cost} ${I18n.t('points_required')}</div>
      </div>
      <div class="redeem-modal-actions">
        <div style="font-size:0.82rem;color:var(--text2);text-align:center;">
          ${I18n.t('balance')}: <strong style="color:var(--orange);">${(user.points||0).toLocaleString()} pts</strong>
          ${(user.points||0) < item.cost ? ` — <span style="color:var(--red);">${I18n.t('insufficient')}</span>` : ''}
        </div>
        <button class="btn btn-primary btn-full" onclick="App.confirmRedeem('${item.id}')"
          ${(user.points||0) < item.cost ? 'disabled style="opacity:0.5;"' : ''}>
          ${I18n.t('redeem_now')}
        </button>
        <button class="btn btn-secondary btn-full" onclick="App.closeModal()">${I18n.t('maybe_later')}</button>
      </div>`;
    openModal('redeem-modal');
  }

  function confirmRedeem(itemId) {
    const item = REDEEM_CATALOG.find(r => r.id === itemId);
    if (!item || (user.points||0) < item.cost) return;
    user.points       -= item.cost;
    user.totalRedeemed = (user.totalRedeemed || 0) + 1;
    closeModal();
    showToast(I18n.t('item_redeemed', { name: item.name }), 'success');
    renderLeaderboard(); renderProfile();
    if (!demoMode) ApiModule.updateMe({ points: user.points, totalRedeemed: user.totalRedeemed }).catch(() => {});
  }

  // ── Profile edit modal ────────────────────────────────────
  function openProfileEdit() {
    document.getElementById('edit-name').value     = user.name || '';
    document.getElementById('edit-nickname').value = user.nickname || '';
    document.getElementById('edit-phone').value    = user.phone || '';
    document.getElementById('edit-address').value  = user.address || '';
    openModal('profile-edit-modal');
  }

  async function saveProfile() {
    const name     = document.getElementById('edit-name').value.trim();
    const nickname = document.getElementById('edit-nickname').value.trim();
    const phone    = document.getElementById('edit-phone').value.trim();
    const address  = document.getElementById('edit-address').value.trim();

    if (!name) { showToast(I18n.t('name_empty_err'), 'error'); return; }

    user.name     = name;
    user.nickname = nickname || name.split(' ')[0];
    user.phone    = phone;
    user.address  = address;

    if (!demoMode) {
      try {
        await ApiModule.updateMe({ name, nickname: user.nickname, phone, address });
      } catch { /* silent */ }
    }

    closeModal();
    renderProfile(); renderHome();
    showToast(I18n.t('profile_updated'), 'success');
  }

  // ── Notification modal ────────────────────────────────────
  function openNotifModal() {
    const list = document.getElementById('notif-modal-list');
    if (list) {
      list.innerHTML = MOCK_NOTIFICATIONS.length
        ? MOCK_NOTIFICATIONS.map(n => `
            <div class="notif-item">
              <div class="notif-dot-badge ${n.read ? 'read' : ''}"></div>
              <div>
                <div class="notif-text">${n.text}</div>
                <div class="notif-time">${n.time}</div>
              </div>
            </div>`).join('')
        : `<div style="padding:24px;text-align:center;color:var(--text3);">No notifications</div>`;
      MOCK_NOTIFICATIONS.forEach(n => n.read = true);
      updateNotifBadge();
    }
    openModal('notif-modal');
  }

  function updateNotifBadge() {
    const badge  = document.getElementById('notif-badge');
    const unread = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
    if (badge) badge.style.display = unread > 0 ? 'block' : 'none';
  }

  // ════════════════════════════════════════════════════════
  //  LOCATION PICKER  (Zomato-style)
  // ════════════════════════════════════════════════════════
  function openLocationPicker() {
    closeModal(); // close profile edit if open
    const modal = document.getElementById('location-picker-modal');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const startLng = user.location?.lng || ECOROUTE_CONFIG.DEFAULT_CENTER[0];
    const startLat = user.location?.lat || ECOROUTE_CONFIG.DEFAULT_CENTER[1];

    // ── Pre-set location IMMEDIATELY so Confirm works without needing to drag ──
    selectedLocation = { lng: startLng, lat: startLat };
    reverseGeocode(startLng, startLat);

    setTimeout(() => {
      try {
        if (!locationPickerMap) {
          mapboxgl.accessToken = ECOROUTE_CONFIG.MAPBOX_TOKEN;
          locationPickerMap = new mapboxgl.Map({
            container:  'location-picker-map',
            style:      ECOROUTE_CONFIG.MAP_STYLE,
            center:     [startLng, startLat],
            zoom:       16,
            attributionControl: false
          });

          locationPickerMap.on('movestart', () => {
            document.getElementById('lp-pin-wrap')?.classList.add('moving');
            if (lpMoveTimer) clearTimeout(lpMoveTimer);
          });

          locationPickerMap.on('moveend', () => {
            lpMoveTimer = setTimeout(() => {
              document.getElementById('lp-pin-wrap')?.classList.remove('moving');
              const c = locationPickerMap.getCenter();
              selectedLocation = { lng: c.lng, lat: c.lat };
              reverseGeocode(c.lng, c.lat);
            }, 150);
          });

        } else {
          locationPickerMap.resize();
          locationPickerMap.flyTo({ center: [startLng, startLat], zoom: 16 });
        }
      } catch (err) {
        console.warn('Map init failed:', err.message);
        // Fallback: show manual address input
        const addrEl = document.getElementById('lp-address-value');
        if (addrEl) addrEl.innerHTML = `
          <div style="font-size:0.78rem;color:#FF6B00;margin-bottom:8px;">⚠️ Map unavailable — enter address manually:</div>
          <input id="lp-manual-addr"
            style="width:100%;background:#1A1A1A;border:1px solid #333;border-radius:8px;padding:10px;color:#F5F5F5;font-size:0.88rem;outline:none;margin-top:4px;"
            placeholder="Gokulam 3rd Stage, Mysuru..."
            value="${user.address || 'Gokulam 3rd Stage, Mysuru, Karnataka'}"/>`;
        setTimeout(() => {
          document.getElementById('lp-manual-addr')?.addEventListener('input', e => {
            user.address = e.target.value;
          });
        }, 100);
      }
    }, 200);
  }

  async function reverseGeocode(lng, lat) {
    const coordEl = document.getElementById('lp-coords');
    if (coordEl) coordEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    const token = ECOROUTE_CONFIG.MAPBOX_TOKEN;
    if (!token || token === 'YOUR_MAPBOX_TOKEN_HERE') {
      const addrEl = document.getElementById('lp-address-value');
      if (addrEl) addrEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      return;
    }

    try {
      const url  = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,neighborhood,place&limit=1`;
      const res  = await fetch(url);
      const data = await res.json();
      const addr = data.features?.[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      const addrEl = document.getElementById('lp-address-value');
      if (addrEl) addrEl.textContent = addr;
    } catch {
      // silently fail
    }
  }

  function closeLocationPicker() {
    document.getElementById('location-picker-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  async function confirmLocation() {
    if (!selectedLocation) return;
    user.location = { lat: selectedLocation.lat, lng: selectedLocation.lng };
    const addrEl  = document.getElementById('lp-address-value');
    user.address  = addrEl?.textContent || '';

    // Sync to DB
    if (!demoMode) {
      ApiModule.updateMe({ location: user.location, address: user.address }).catch(() => {});
    }

    closeLocationPicker();
    renderProfile();
    renderHome(); // update address in home hero card
    showToast(I18n.t('location_saved'), 'success');
    
    if (typeof I18n !== 'undefined' && typeof I18n.speak === 'function') {
      I18n.speak(I18n.t('location_sharing_active'));
    }
  }

  // ════════════════════════════════════════════════════════
  //  PROFILE
  // ════════════════════════════════════════════════════════
  function renderProfile() {
    const roleLabels = { 
      home: I18n.t('home_user_label'), 
      point: I18n.t('point_user_label'), 
      driver: I18n.t('driver_mode').replace('🚛 ', '') 
    };
    const el = id => document.getElementById(id);
    if (el('profile-name'))         el('profile-name').textContent         = user.name || '—';
    if (el('profile-phone'))        el('profile-phone').textContent        = user.phone || '—';
    if (el('profile-role-tag'))     el('profile-role-tag').textContent     = roleLabels[user.role] || 'Home User';
    if (el('profile-total-points')) el('profile-total-points').textContent = (user.points || 0).toLocaleString();
    if (el('profile-collections'))  el('profile-collections').textContent  = user.collectionsThisMonth || 0;
    if (el('profile-redeemed'))     el('profile-redeemed').textContent     = user.totalRedeemed || 0;

    // Driver Admin section
    const adminSec = el('driver-admin-section');
    if (adminSec) {
      adminSec.style.display = (user.role === 'driver') ? 'block' : 'none';
    }
  }

  // ─ Admin: Global Reset ──────────────────────────────────────
  async function resetAllUserPreferences() {
    if (!confirm(I18n.t('reset_confirm'))) return;
    try {
      const res = await ApiModule.resetAllUserPreferences();
      showToast(I18n.t('reset_complete', { count: res.modifiedCount }), 'success');
    } catch (e) {
      showToast(I18n.t('reset_error'), 'error');
    }
  }

  // ════════════════════════════════════════════════════════
  //  PWA INSTALL POPUP
  // ════════════════════════════════════════════════════════
  function setupPWA() {

    document.getElementById('pwa-popup-install-btn')?.addEventListener('click', () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(() => {
          deferredInstallPrompt = null;
          hidePWAPopup();
        });
      } else {
        // iOS: no prompt available — show instructions
        showToast('Tap Share → "Add to Home Screen" to install 📱', 'info');
        hidePWAPopup();
      }
    });

    document.getElementById('pwa-popup-close-btn')?.addEventListener('click', hidePWAPopup);
  }

  function showPWAPopup() {
    // Show once per session
    if (sessionStorage.getItem('eco_pwa_shown')) return;
    // Dont show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    sessionStorage.setItem('eco_pwa_shown', '1');
    document.getElementById('pwa-install-popup')?.classList.add('show');
  }

  // ════════════════════════════════════════════════════════
  //  PANEL GESTURES (BOTTOM SHEET)
  // ════════════════════════════════════════════════════════
  let sheetY = 0;
  let startY = 0;
  let isDragging = false;
  let liveCoords = null;

  function startLiveTracking() {
    if (!navigator.geolocation) return;
    
    // Explicit prompt first
    navigator.geolocation.getCurrentPosition(
      (pos) => { liveCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
      (err) => console.warn('Location prompt denied/failed', err),
      { enableHighAccuracy: true }
    );

    navigator.geolocation.watchPosition(
      (pos) => {
        liveCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (window.MapModule && typeof MapModule.updateLiveUserMarker === 'function') {
           MapModule.updateLiveUserMarker(liveCoords.lng, liveCoords.lat);
        }
      },
      (err) => console.warn('Geolocation watch failed', err),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }

  function setupBottomSheet() {
    const handle = document.querySelector('.sheet-handle');
    const header = document.querySelector('.sheet-driver-row');
    const sheet  = document.querySelector('.bottom-sheet');
    const fab    = document.getElementById('show-route-fab');
    if (!sheet) return;

    const toggleFn = (e) => {
      // If clicking inside the stops list or active buttons, don't collapse
      if (e && e.target.closest('#route-stops')) return;
      
      const isMinimized = sheet.classList.contains('minimized');
      toggleBottomSheet(isMinimized); // If minimized, then show. Else hide.
    };

    if (handle) {
      handle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        sheet.classList.add('is-dragging');
        isDragging = true;
      }, { passive: true });
    }

    if (header) {
      header.style.cursor = 'pointer';
      header.addEventListener('click', toggleFn);
    }

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY < -20) return; 

      sheet.style.transform = `translateY(${Math.max(0, deltaY)}px)`;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      sheet.classList.remove('is-dragging');

      // Clear inline transform to allow class-based animation to take over
      const transformValue = sheet.style.transform;
      sheet.style.transform = '';

      const endY = transformValue.replace(/[^0-9.]/g, '') || 0;
      if (parseFloat(endY) > 100) {
        toggleBottomSheet(false); // Hide
      } else {
        toggleBottomSheet(true);  // Restore
      }
    });
  }

  function toggleBottomSheet(show) {
    const sheet = document.querySelector('.bottom-sheet');
    const fab   = document.getElementById('show-route-fab');
    if (!sheet) return;

    if (show) {
      sheet.classList.remove('minimized');
      sheet.classList.add('expanded');
      if (fab) fab.style.display = 'none';
    } else {
      sheet.classList.remove('expanded');
      sheet.classList.add('minimized');
      if (fab) fab.style.display = 'flex';
    }
  }

  function hidePWAPopup() {
    document.getElementById('pwa-install-popup')?.classList.remove('show');
  }

  // ════════════════════════════════════════════════════════
  //  SPLASH
  // ════════════════════════════════════════════════════════
  function hideSplash() {
    setTimeout(() => {
      const s = document.getElementById('splash');
      if (s) {
        s.style.transition = 'opacity .45s';
        s.style.opacity    = '0';
        setTimeout(() => s.remove(), 450);
      }
    }, 1600);
  }

  // ════════════════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════════════════
  async function init() {
    // Fetch public config from backend (e.g. Mapbox token from Env Var)
    try {
      const cfg = await ApiModule.getConfig();
      if (cfg && cfg.MAPBOX_TOKEN) {
        ECOROUTE_CONFIG.MAPBOX_TOKEN = cfg.MAPBOX_TOKEN;
      }
    } catch (e) { console.warn('PWA config fetch failed (offline/demo?)'); }

    hideSplash();
    setupPWA();
    setupImageUpload();
    setupBottomSheet();
    toggleBottomSheet(false); // Start hidden for full map view
    startLiveTracking();

    // Initialize i18n translations
    if (typeof I18n !== 'undefined') {
      I18n.init();
    }

    // Bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.tab));
    });

    // Fill slider
    document.getElementById('fill-slider')?.addEventListener('input', e => updateFill(e.target.value));

    // Report & confirm buttons
    document.getElementById('submit-report-btn')?.addEventListener('click', submitReport);
    document.getElementById('confirm-pickup-btn')?.addEventListener('click', () => confirmPickup(true));
    document.getElementById('confirm-notactive-btn')?.addEventListener('click', () => confirmPickup(false));

    // Route start (driver)
    document.getElementById('route-start-btn')?.addEventListener('click', () => MapModule.startRoute());

    // History tabs
    document.querySelectorAll('.history-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderHistory(tab.dataset.filter);
      });
    });

    // Voice Toggle
    const voiceToggle = document.getElementById('voice-toggle');
    if (voiceToggle && typeof I18n !== 'undefined') {
      voiceToggle.checked = I18n.isVoiceEnabled();
      voiceToggle.addEventListener('change', e => {
        I18n.setVoiceEnabled(e.target.checked);
        if (e.target.checked) I18n.speak(I18n.t('voice_feedback'));
      });
    }

    // Interaction bootstrap for TTS (bypass autoplay blocks)
    document.body.addEventListener('click', () => {
      if (typeof I18n !== 'undefined' && typeof I18n.captureClickForTTS === 'function') {
        I18n.captureClickForTTS();
      }
    }, { once: true });

    // Check for existing JWT session (page refresh)
    if (ApiModule.hasSession()) {
      ApiModule.getMe().then(dbUser => {
        if (dbUser) {
          user = dbUser;
          completeLogin(user.role);
          
          // Try to request notification permission after login
          setTimeout(requestNotificationPermission, 3000);
        }
      }).catch(() => { /* no valid session — show login */ });
    }

    // Start background polling for notifications
    setInterval(checkNotifications, 45000); // Check every 45s
  }

  // ─ Notifications: Permission & Check ────────────────────────
  async function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Notifications enabled! 🔔', 'success');
      }
    }
  }

  let lastNotifDate = null;
  async function checkNotifications() {
    if (!user || user.role === 'driver') return;
    try {
      const alerts = await ApiModule.getLatestNotifications();
      if (alerts && alerts.length > 0) {
        const latest = alerts[0];
        const alertTime = new Date(latest.timestamp).getTime();
        
        // If we haven't seen this specific alert before (or it's from the last minute)
        if (!lastNotifDate || alertTime > lastNotifDate) {
          lastNotifDate = alertTime;
          
          // Trigger System Notification
          if (Notification.permission === 'granted') {
            new Notification(latest.title, {
              body: latest.body,
              icon: '/icons/icon-192.png'
            });
          }
          
          // Force badge update if not on home
          const badge = document.getElementById('notif-badge');
          if (badge) badge.style.display = 'block';
        }
      }
    } catch (e) { console.warn('Polling check failed'); }
  }

  // ════════════════════════════════════════════════════════════
  //  AI ASSISTANT (ECOSCAN INTEGRATION)
  // ════════════════════════════════════════════════════════════

  function appendAssistantMessage(text, role, data = null) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.innerHTML = text;

    if (data) {
      const resultHtml = `
        <div class="waste-result">
          <div class="waste-cat-badge cat-${data.category.toLowerCase()}">${data.category}</div>
          <span class="waste-item">${data.item}</span>
          <div class="waste-instr">${data.instructions}</div>
          ${data.eco_tip ? `<div class="waste-tip">💡 ${data.eco_tip}</div>` : ''}
        </div>
      `;
      msg.innerHTML += resultHtml;
      
      // Points animation if added
      showToast(`+10 Eco Points! 🏆`, 'success');
      user.points = (user.points || 0) + 10;
      renderHome();
    }

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    
    if (role === 'bot' && text && !data) {
       speakAssistantResponse(text.replace(/<[^>]*>/g, ''));
    } else if (role === 'bot' && data) {
       speakAssistantResponse(`${data.item} is ${data.category}. ${data.instructions}`);
    }
  }

  async function sendAssistantMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text && !assistantImageBase64) return;

    appendAssistantMessage(text || "Analying image...", 'user');
    input.value = "";
    
    // Clear preview
    clearChatImage();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ApiModule.getToken()}`
        },
        body: JSON.stringify({
          message: text,
          image: assistantImageBase64,
          language: I18n.currentLang === 'hi' ? 'Hindi' : I18n.currentLang === 'kn' ? 'Kannada' : 'English'
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      appendAssistantMessage("", 'bot', data);
    } catch (err) {
      appendAssistantMessage(`Sorry, I couldn't process that: ${err.message}`, 'bot');
    } finally {
      assistantImageBase64 = null;
    }
  }

  function clearChatImage() {
    assistantImageBase64 = null;
    const preview = document.getElementById('chat-upload-preview');
    if (preview) preview.style.display = 'none';
  }

  function openAssistantCamera() {
    const modal = document.getElementById('asst-camera-modal');
    const video = document.getElementById('asst-camera-video');
    modal.style.display = 'flex';

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        showToast("Camera access denied", "error");
        closeAssistantCamera();
      });
  }

  function closeAssistantCamera() {
    const modal = document.getElementById('asst-camera-modal');
    const video = document.getElementById('asst-camera-video');
    modal.style.display = 'none';
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  }

  function takeAssistantPhoto() {
    const video = document.getElementById('asst-camera-video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    assistantImageBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    const preview = document.getElementById('chat-upload-preview');
    const previewImg = document.getElementById('chat-preview-img');
    if (preview && previewImg) {
      previewImg.src = assistantImageBase64;
      preview.style.display = 'block';
    }
    
    closeAssistantCamera();
  }

  function toggleAssistantVoice() {
    if (isAssistantRecording) {
      stopAssistantVoice();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Voice recognition not supported in this browser", "error");
      return;
    }

    assistantRecognition = new SpeechRecognition();
    assistantRecognition.lang = I18n.currentLang === 'hi' ? 'hi-IN' : I18n.currentLang === 'kn' ? 'kn-IN' : 'en-US';
    assistantRecognition.interimResults = false;

    assistantRecognition.onstart = () => {
      isAssistantRecording = true;
      document.getElementById('chat-voice-btn').classList.add('recording');
    };

    assistantRecognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      document.getElementById('chat-input').value = text;
      sendAssistantMessage();
    };

    assistantRecognition.onerror = () => stopAssistantVoice();
    assistantRecognition.onend = () => stopAssistantVoice();

    assistantRecognition.start();
  }

  function stopAssistantVoice() {
    isAssistantRecording = false;
    document.getElementById('chat-voice-btn').classList.remove('recording');
    if (assistantRecognition) assistantRecognition.stop();
  }

  function speakAssistantResponse(text) {
    if (!window.speechSynthesis) return;
    
    // Check if voice is enabled in profile settings
    const voiceEnabled = document.getElementById('voice-toggle')?.checked;
    if (voiceEnabled === false) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap = { 'en': 'en-US', 'hi': 'hi-IN', 'kn': 'kn-IN' };
    utterance.lang = langMap[I18n.currentLang] || 'en-US';
    
    window.speechSynthesis.speak(utterance);
  }

  return {
    init, navigate, showToast,
    renderGauge, updateFill,
    readPageDescription,
    switchLoginTab, showSigninView, showSignupView,
    selectSignupRole, fillDemo,
    loginUser, loginDriver, signUpUser, logout,
    togglePasswordVisibility,
    confirmPickup, submitReport,
    toggleDriverBlock, toggleDriverOnline,
    // Feature 1: Bin verification
    verifyBin, skipBinVerify,
    // Feature 2: Morning notification trigger
    triggerMorningNotification,
    findNearestPoint,
    toggleBottomSheet,
    openModal, closeModal,
    openRedeemModal, confirmRedeem,
    openProfileEdit, saveProfile,
    openNotifModal,
    openLocationPicker, closeLocationPicker, confirmLocation,
    // Feature 6: Issue reporting
    openIssueReportModal, submitDriverReport,
    // Feature 5: Trip completion summary
    handleTripComplete,
    // Admin
    resetAllUserPreferences,
    // ── Language change handler (called by I18n module) ──
    onLanguageChange: function() {
      // Re-apply greeting text
      const greetEl = document.getElementById('greeting-text');
      if (greetEl) greetEl.textContent = getGreeting();

      // Close language dropdown
      const dd = document.getElementById('lang-dropdown');
      if (dd) dd.classList.remove('show');

      // Re-render dynamic screens if visible
      if (currentTab === 'leaderboard') renderLeaderboard();
      if (currentTab === 'history') renderHistory();
    },
    // Expose for MapModule to call (Feature 3)
    getUserLocation: () => liveCoords || user?.location,
    getCurrentUser:  () => user,
    getCurrentRole:  () => currentRole,

    // Assistant methods
    sendAssistantMessage,
    openAssistantCamera,
    closeAssistantCamera,
    takeAssistantPhoto,
    toggleAssistantVoice,
    clearChatImage
  };
})();

// ════════════════════════════════════════════════════════════
//  OVERLOAD & COLLABORATION MODULE
// ════════════════════════════════════════════════════════════
const OverloadModule = (function() {
  async function declare() {
    try {
      if (!window.ApiModule) return;
      const res = await ApiModule.reportOverload();
      if (res && res.success) {
        App.showToast(res.message || `🚨 Area transferred successfully.`, 'success');
        const btn = document.getElementById('overload-btn');
        if (btn) btn.style.display = 'none';
        
        // Force map user reload so the current driver loses the pins
        if (window.MapModule && typeof MapModule.loadUsersAndRefresh === 'function') {
           await MapModule.loadUsersAndRefresh();
        } else {
           setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        App.showToast(res.message || 'Transfer completed.', 'info');
      }
    } catch(err) { App.showToast(err.message, 'error'); }
  }

  return { declare };
})();

document.addEventListener('DOMContentLoaded', App.init);
