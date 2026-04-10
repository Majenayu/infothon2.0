
let currentRole = localStorage.getItem('eco_role');
let demoMode = localStorage.getItem('eco_demo') === 'true';

if (!localStorage.getItem('eco_jwt')) {
  window.location.href = '/index.html';
}
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

  // Catch the install prompt early before DOMContentLoaded
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
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
  }

  // ════════════════════════════════════════════════════════
  //  GREETING
  // ════════════════════════════════════════════════════════
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning,';
    if (h < 17) return 'Good Afternoon,';
    return 'Good Evening,';
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
      showToast('Home User demo filled', 'info');
    } else if (role === 'point') {
      document.getElementById('user-email').value    = 'community@ecoroute.app';
      document.getElementById('user-password').value = 'demo123';
      showToast('Point User demo filled', 'info');
    } else if (role === 'driver') {
      document.getElementById('driver-empid').value = 'EMP-00421';
      document.getElementById('driver-pin').value   = '4421';
      showToast('Driver demo filled', 'info');
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
      showToast('Please fill in all fields', 'error'); return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error'); return;
    }

    btn.textContent = 'Creating account…';
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
      btn.textContent = 'Create Account';
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
      showToast('Please enter email and password', 'error'); return;
    }

    btn.textContent = 'Signing in…';
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
      btn.textContent = 'Sign In';
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
      showToast('Enter Employee ID and PIN', 'error'); return;
    }

    btn.textContent = 'Verifying…';
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
      btn.textContent = 'Access Driver Dashboard';
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

    showToast(`Welcome back, ${user.nickname || user.name.split(' ')[0]}! 👋`, 'success');
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

    document.getElementById('topbar').style.display     = 'none';
    document.getElementById('bottom-nav').style.display = 'none';
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-login').classList.add('active');
    switchLoginTab('user');
    showSigninView();
    showToast('Signed out', 'info');
  }

  // ════════════════════════════════════════════════════════
  //  NAVIGATION
  // ════════════════════════════════════════════════════════
  function navigate(tab) {
    currentTab = tab;
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
    if (tab === 'history')     renderHistory('all');
    if (tab === 'leaderboard') renderLeaderboard();
    if (tab === 'profile')     renderProfile();
  }

  // ════════════════════════════════════════════════════════
  //  HOME SCREEN
  // ════════════════════════════════════════════════════════
  function renderHome() {
    document.getElementById('greeting-text').textContent = getGreeting();
    document.getElementById('greeting-name').innerHTML =
      `${user.nickname || user.name.split(' ')[0]} <span>✨</span>`;

    document.getElementById('stat-next-pickup').textContent  = user.nextPickup || 'Today 10:30';
    document.getElementById('stat-collections').textContent  = user.collectionsThisMonth || 0;
    document.getElementById('stat-points').textContent       = (user.points || 0).toLocaleString();

    renderGauge(fillLevel, 'home-gauge');
    renderStatusBanner();
    renderRoleHomeContent();
  }

  // ── Role-locked home content (no switcher) ────────────────
  async function renderRoleHomeContent() {
    const area       = document.getElementById('home-content-area');
    const fillPanel  = document.getElementById('fill-panel');
    const driverPane = document.getElementById('driver-panel');
    const mapLabel   = document.getElementById('map-mode-label');
    const routeBtn   = document.getElementById('route-start-btn');

    // UI elements to hide for driver
    const statusBanner = document.getElementById('status-banner');
    const statsRow     = document.querySelector('.stats-row');
    const rewardsTab   = document.querySelector('.nav-item[data-tab="leaderboard"]');

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
      if (statusBanner) statusBanner.style.display = 'none';
      if (statsRow)     statsRow.style.display     = 'none';
      if (rewardsTab)   rewardsTab.style.display   = 'none';

      if (area)       area.innerHTML = '';
      if (fillPanel)  fillPanel.style.display  = 'none';
      if (driverPane) driverPane.style.display = 'block';
      if (routeBtn)   routeBtn.style.display   = 'flex';
      if (mapLabel)   mapLabel.textContent      = 'Driver View';
      
      const el = document.getElementById('driver-active-count');
      if (el) el.textContent = MOCK_USERS.filter(u => u.fillLevel >= ECOROUTE_CONFIG.ACTIVE_THRESHOLD).length;

    } else if (currentRole === 'point' || (currentRole === 'home' && isBlocked && user.isActiveToday !== true)) {
      if (statusBanner) {
        if (currentRole === 'point') statusBanner.style.display = 'flex';
        else statusBanner.style.display = 'none'; // hide confirm banner for blocked unconfirmed home user
      }
      if (statsRow)     statsRow.style.display     = 'flex';
      if (rewardsTab)   rewardsTab.style.display   = 'flex';

      if (driverPane) driverPane.style.display = 'none';
      if (fillPanel)  fillPanel.style.display  = 'flex';
      if (routeBtn)   routeBtn.style.display   = 'none';
      if (mapLabel)   mapLabel.textContent      = 'Community Map';

      let messageSub = '3 community points within 500m of you';
      if (currentRole === 'home' && isBlocked) {
        messageSub = 'Route locked. Use community points.';
      }

      if (area) area.innerHTML = `
        <div class="home-hero-card card-point" onclick="App.navigate('map')">
          <div class="home-hero-icon">🗺️</div>
          <div class="home-hero-body">
            <div class="home-hero-title">Find Collection Points</div>
            <div class="home-hero-sub">${messageSub}</div>
            <button class="home-hero-btn green" onclick="event.stopPropagation(); App.findNearestPoint();">Find Nearest</button>
          </div>
        </div>
        <div class="home-hero-card card-home" onclick="App.navigate('history')" style="margin-top:10px;">
          <div class="home-hero-icon">📅</div>
          <div class="home-hero-body">
            <div class="home-hero-title">Collection Schedule</div>
            <div class="home-hero-sub">Next drop-off window: Tomorrow</div>
            <button class="home-hero-btn orange">View Schedule</button>
          </div>
        </div>
      `;

    } else {
      // Home user (default)
      if (statusBanner) statusBanner.style.display = 'flex';
      if (statsRow)     statsRow.style.display     = 'flex';
      if (rewardsTab)   rewardsTab.style.display   = 'flex';

      if (driverPane) driverPane.style.display = 'none';
      if (fillPanel)  fillPanel.style.display  = 'flex';
      if (routeBtn)   routeBtn.style.display   = 'none';
      if (mapLabel)   mapLabel.textContent      = 'Community Map';
      
      const addr = user.address || 'Tap to set your location';
      if (area) area.innerHTML = `
        <div class="home-hero-card card-home" onclick="App.navigate('confirm')">
          <div class="home-hero-icon">🏠</div>
          <div class="home-hero-body">
            <div class="home-hero-title">Direct House Collection</div>
            <div class="home-hero-sub">${addr}</div>
            <button class="home-hero-btn orange">Schedule Pickup</button>
          </div>
        </div>
        <div class="home-hero-card card-point" onclick="App.navigate('map')" style="margin-top:10px;">
          <div class="home-hero-icon">🗑️</div>
          <div class="home-hero-body">
            <div class="home-hero-title">Nearby Collection Points</div>
            <div class="home-hero-sub">3 public points nearby · Backup option</div>
            <button class="home-hero-btn green" onclick="event.stopPropagation(); App.findNearestPoint();">Find Nearest</button>
          </div>
        </div>
      `;
    }
  }

  function findNearestPoint() {
    if (!user.location) {
      showToast('Please set your location first.', 'error');
      openLocationPicker();
      return;
    }
    navigate('map');
    // Give map time to init
    setTimeout(() => {
      MapModule.routeToNearestPoint(user.location.lng, user.location.lat);
    }, 500);
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
      label.textContent = "You're Active Today!";
      sub.textContent   = 'Bin confirmed for pickup.';
      btn.textContent   = 'Done';
      btn.className     = 'status-confirm-btn done';
      btn.onclick       = null;
    } else if (user.isActiveToday === false) {
      banner.className  = 'status-banner status-inactive';
      icon.textContent  = '❌';
      label.textContent = 'Not Available Today';
      sub.textContent   = 'Bin will not be collected today.';
      btn.textContent   = 'Change';
      btn.className     = 'status-confirm-btn';
      btn.onclick       = () => navigate('confirm');
    } else {
      banner.className  = 'status-banner status-pending';
      icon.textContent  = '⏳';
      label.textContent = "Confirm today's pickup";
      sub.textContent   = 'Let us know your bin is ready.';
      btn.textContent   = 'Confirm';
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
    fillLevel = parseInt(val);
    renderGauge(fillLevel, 'home-gauge');
    const lbl = document.getElementById('fill-slider-label');
    if (lbl) {
      const cls = fillLevel >= 70 ? 'fill-high' : fillLevel >= 40 ? 'fill-mid' : 'fill-low';
      lbl.className   = cls;
      lbl.textContent = fillLevel + '%';
    }
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
    if (fillLevel >= ECOROUTE_CONFIG.ACTIVE_THRESHOLD) {
      user.isActiveToday = true;
      user.points        = (user.points || 0) + ECOROUTE_CONFIG.POINTS.REPORT_FILL;
      showToast(`Reported! +${ECOROUTE_CONFIG.POINTS.REPORT_FILL} pts 🎉`, 'success');
      renderStatusBanner();
      document.getElementById('stat-points').textContent = user.points.toLocaleString();
      // Sync to DB
      if (!demoMode) {
        const payload = { isActiveToday: true, points: user.points };
        if (selectedLocation) payload.location = selectedLocation;
        ApiModule.updateMe(payload).catch(() => {});
      }
    } else {
      showToast('Fill level below 70% — not queued for pickup.', 'info');
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
            <div class="home-hero-title" style="color:var(--red);">You're Late!</div>
            <div class="home-hero-sub">The driver has locked their route for today.</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-full" onclick="App.navigate('map')" style="border-color:var(--red);color:var(--red);">
          📍 Find Nearest Community Point instead
        </button>
      </div>
    `;
  }

  async function confirmPickup(isActive) {
    user.isActiveToday = isActive;
    const pill = document.getElementById('confirm-status-pill');
    
    if (isActive) {
      if (pill) {
        pill.textContent = '⏳ Waiting for Location...';
        pill.style.color = '#FFA500';
      }
      
      if (!navigator.geolocation) {
        showToast('Geolocation not supported.', 'error');
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
              showToast("Driver has already locked the route.", "error");
              if (pill) {
                pill.textContent = '🚫 Route Locked';
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
          }
          
          if (pill) {
            pill.textContent = '✅ Confirmed — Bin is Ready';
            pill.style.color = 'var(--green)';
          }
          showToast(`Confirmed! +${ECOROUTE_CONFIG.POINTS.CONFIRM_PICKUP} pts 🎉`, 'success');
          setTimeout(() => navigate('home'), 1200);
          
        } catch (err) {
          showToast(err.message || 'Server error', 'error');
        }
      }, (err) => {
        showToast('Please enable location access to schedule pickup.', 'error');
      });
      
    } else {
      if (pill) {
        pill.textContent = '❌ Marked as Not Available';
        pill.style.color = 'var(--red)';
      }
      showToast('Marked as not available. See you next time! 👋', 'info');
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
  
  async function toggleDriverBlock() {
    const btn = document.getElementById('driver-block-btn');
    if (!btn) return;
    try {
      const status = await ApiModule.getBlockStatus();
      if (status.isBlocked) {
        await ApiModule.unblockLocationUpdates();
        btn.textContent = '🔒 Block User Pickup Requests';
        btn.style.background = '';
        btn.style.color = '#EF4444';
        showToast('Users can now request pickups again.', 'success');
      } else {
        await ApiModule.blockLocationUpdates();
        btn.textContent = '🔓 Unblock Pickups';
        btn.style.background = '#EF4444';
        btn.style.color = '#FFF';
        showToast('Pickup requests blocked. Users will be directed to community points.', 'info');
      }
    } catch (err) {
      showToast('Error syncing block status', 'error');
    }
  }

  async function toggleDriverOnline() {
    const btn = document.getElementById('driver-online-btn');
    if (!btn) return;

    if (user.isOnline) {
      user.isOnline = false;
      if (!demoMode) await ApiModule.setDriverOnline(false, null).catch(()=>{});
      if (locationWatchId) navigator.geolocation.clearWatch(locationWatchId);
      btn.textContent = '📍 Go Online (Share Location)';
      btn.style.background = '#22C55E';
      showToast('You are now offline.', 'info');
    } else {
      if (!navigator.geolocation) {
        showToast('Location not supported by device.', 'error');
        return;
      }
      user.isOnline = true;
      btn.textContent = '🛑 Go Offline';
      btn.style.background = '#EF4444';
      
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!demoMode) await ApiModule.setDriverOnline(true, loc).catch(()=>{});
        showToast('You are now online. Sharing location...', 'success');
        
        locationWatchId = navigator.geolocation.watchPosition(async (newPos) => {
          const newLoc = { lat: newPos.coords.latitude, lng: newPos.coords.longitude };
          if (!demoMode) ApiModule.setDriverOnline(true, newLoc).catch(()=>{});
          user.location = newLoc;
        });
      }, err => {
        showToast('Location permission needed to go online.', 'error');
        user.isOnline = false;
        btn.textContent = '📍 Go Online (Share Location)';
        btn.style.background = '#22C55E';
      }, { enableHighAccuracy: true });
    }
  }

  // ════════════════════════════════════════════════════════
  //  HISTORY (CALENDAR)
  // ════════════════════════════════════════════════════════
  async function renderHistory(filter = 'calendar') {
    const screenCal = document.getElementById('view-calendar');
    const screenList = document.getElementById('view-list');
    
    if (filter === 'calendar') {
      if (screenCal) screenCal.style.display = 'block';
      if (screenList) screenList.style.display = 'none';
      
      let logs = [];
      if (!demoMode) {
        try { logs = await ApiModule.getCollectionLog(); } catch(e){}
      }
      
      const grid = document.getElementById('calendar-grid');
      const monthName = document.getElementById('calendar-month-name');
      if (!grid || !monthName) return;
      
      const today = new Date();
      monthName.textContent = today.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
      
      const dayNames = ['S','M','T','W','T','F','S'];
      let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');
      
      for(let i=0; i<firstDay; i++) {
        html += `<div class="calendar-day empty"></div>`;
      }
      
      for(let day=1; day<=daysInMonth; day++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const log = logs.find(l => l.date === dateStr);
        let cls = '', dot = '';
        if (log) {
          cls = log.status === 'collected' ? 'collected' : 'missed';
          dot = log.status === 'collected' ? '<div class="calendar-dot green"></div>' : '<div class="calendar-dot red"></div>';
        }
        
        const isToday = day === today.getDate();
        html += `
          <div class="calendar-day ${cls}">
            <span class="calendar-day-date">${day}</span>
            ${dot}
            ${isToday ? '<div style="position:absolute;bottom:-12px;font-size:0.6rem;color:var(--orange);font-weight:700;">Today</div>' : ''}
          </div>
        `;
      }
      grid.innerHTML = html;
    } else {
      if (screenCal) screenCal.style.display = 'none';
      if (screenList) screenList.style.display = 'block';
      const list = document.getElementById('history-list');
      if (list) list.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text3);font-size:0.85rem;">No past collections found.</div>';
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
          <span class="lb-name">${u.name}${u.isMe ? ' (You)' : ''}</span>
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
        <div class="redeem-modal-cost">🪙 ${item.cost} points required</div>
      </div>
      <div class="redeem-modal-actions">
        <div style="font-size:0.82rem;color:var(--text2);text-align:center;">
          Balance: <strong style="color:var(--orange);">${(user.points||0).toLocaleString()} pts</strong>
          ${(user.points||0) < item.cost ? ' — <span style="color:var(--red);">Insufficient</span>' : ''}
        </div>
        <button class="btn btn-primary btn-full" onclick="App.confirmRedeem('${item.id}')"
          ${(user.points||0) < item.cost ? 'disabled style="opacity:0.5;"' : ''}>
          Redeem Now
        </button>
        <button class="btn btn-secondary btn-full" onclick="App.closeModal()">Maybe Later</button>
      </div>`;
    openModal('redeem-modal');
  }

  function confirmRedeem(itemId) {
    const item = REDEEM_CATALOG.find(r => r.id === itemId);
    if (!item || (user.points||0) < item.cost) return;
    user.points       -= item.cost;
    user.totalRedeemed = (user.totalRedeemed || 0) + 1;
    closeModal();
    showToast(`🎉 ${item.name} redeemed! Check your email.`, 'success');
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

    if (!name) { showToast('Name cannot be empty', 'error'); return; }

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
    showToast('Profile updated! ✅', 'success');
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
    showToast('Location saved! 📍', 'success');
  }

  // ════════════════════════════════════════════════════════
  //  PROFILE
  // ════════════════════════════════════════════════════════
  function renderProfile() {
    const roleLabels = { home: 'Home User', point: 'Point User', driver: 'Driver / Admin' };
    const el = id => document.getElementById(id);
    if (el('profile-name'))         el('profile-name').textContent         = user.name || '—';
    if (el('profile-phone'))        el('profile-phone').textContent        = user.phone || '—';
    if (el('profile-role-tag'))     el('profile-role-tag').textContent     = roleLabels[user.role] || 'Home User';
    if (el('profile-total-points')) el('profile-total-points').textContent = (user.points || 0).toLocaleString();
    if (el('profile-collections'))  el('profile-collections').textContent  = user.collectionsThisMonth || 0;
    if (el('profile-redeemed'))     el('profile-redeemed').textContent     = user.totalRedeemed || 0;
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
  function init() {
    hideSplash();
    setupPWA();
    setupImageUpload();

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

    // Check for existing JWT session (page refresh)
    if (ApiModule.hasSession()) {
      ApiModule.getMe().then(dbUser => {
        if (dbUser) {
          user = dbUser;
          completeLogin(user.role);
        }
      }).catch(() => { /* no valid session — show login */ });
    }
  }

  return {
    init, navigate, showToast,
    renderGauge, updateFill,
    switchLoginTab, showSigninView, showSignupView,
    selectSignupRole, fillDemo,
    loginUser, loginDriver, signUpUser, logout,
    togglePasswordVisibility,
    confirmPickup, submitReport,
    toggleDriverBlock, toggleDriverOnline,
    findNearestPoint,
    openModal, closeModal,
    openRedeemModal, confirmRedeem,
    openProfileEdit, saveProfile,
    openNotifModal,
    openLocationPicker, closeLocationPicker, confirmLocation
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
