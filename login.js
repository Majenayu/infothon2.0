// ============================================================
//  EcoRoute — Login Module
// ============================================================

let currentRole = 'home';
let demoMode = false;

window.addEventListener('DOMContentLoaded', () => {
  // Pre-fill demo credentials
  document.getElementById('emp-id').value = 'EMP-7821';
  document.getElementById('emp-pin').value = '4321';
  document.getElementById('home-email').value = 'rahul@example.com';
  document.getElementById('home-pass').value = 'password';

  // Check if already logged in
  const token = localStorage.getItem('eco_jwt');
  if (token) {
    const role = localStorage.getItem('eco_role');
    if (role === 'driver') window.location.href = '/driver.html';
    else if (role === 'point') window.location.href = '/point.html';
    else window.location.href = '/home.html';
  }
});

// UI toggles
function toggleLoginType(type) {
  const isDriver = type === 'driver';
  document.getElementById('btn-type-home').classList.toggle('active', !isDriver);
  document.getElementById('btn-type-driver').classList.toggle('active', isDriver);
  
  document.getElementById('driver-login-box').style.display = isDriver ? 'block' : 'none';
  document.getElementById('home-login-box').style.display   = isDriver ? 'none' : 'block';
  document.getElementById('signup-box').style.display       = 'none';
}

function showSignup() {
  document.getElementById('home-login-box').style.display = 'none';
  document.getElementById('signup-box').style.display = 'block';
}

function showLogin() {
  document.getElementById('signup-box').style.display = 'none';
  document.getElementById('home-login-box').style.display = 'block';
}

function togglePasswordVisibility(id) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
}

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('fade-out'); }, 2500);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2800);
}

// Global scope for HTML onclick
window.App = {
  toggleLoginType, showSignup, showLogin, togglePasswordVisibility
};

async function login() {
  const email = document.getElementById('home-email').value.trim();
  const pass  = document.getElementById('home-pass').value.trim();
  if (!email || !pass) return showToast('Please enter email and password', 'error');

  const btn = document.querySelector('#home-login-box button');
  const ogText = btn.textContent;
  btn.textContent = 'Signing in...';

  try {
    const res = await ApiModule.login(email, pass);
    localStorage.setItem('eco_jwt', res.token);
    localStorage.setItem('eco_role', res.user.role);
    
    if (res.user.role === 'point') window.location.href = '/point.html';
    else window.location.href = '/home.html';
  } catch (err) {
    console.error(err);
    if (email === 'rahul@example.com') {
      demoLogin('home');
    } else {
      showToast(err.message || 'Login failed', 'error');
    }
  } finally {
    btn.textContent = ogText;
  }
}

async function signup() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value.trim();
  const role  = document.querySelector('input[name="role"]:checked').value;
  if (!name || !email || !pass) return showToast('Please fill all fields', 'error');

  const btn = document.querySelector('#signup-box button');
  const ogText = btn.textContent;
  btn.textContent = 'Creating account...';

  try {
    const res = await ApiModule.signup({ name, email, password: pass, role });
    localStorage.setItem('eco_jwt', res.token);
    localStorage.setItem('eco_role', res.user.role);
    
    showToast('Account created successfully!', 'success');
    setTimeout(() => {
      if (res.user.role === 'point') window.location.href = '/point.html';
      else window.location.href = '/home.html';
    }, 1000);
  } catch (err) {
    showToast(err.message || 'Registration failed', 'error');
  } finally {
    btn.textContent = ogText;
  }
}

async function loginDriver() {
  const empId = document.getElementById('emp-id').value.trim();
  const pin   = document.getElementById('emp-pin').value.trim();
  if (!empId || !pin) return showToast('Please enter ID and PIN', 'error');

  const btn = document.querySelector('#driver-login-box button');
  const ogText = btn.textContent;
  btn.textContent = 'Connecting...';

  try {
    const res = await ApiModule.driverLogin(empId, pin);
    localStorage.setItem('eco_jwt', res.token);
    localStorage.setItem('eco_role', 'driver');
    window.location.href = '/driver.html';
  } catch (err) {
    if (empId === 'EMP-7821') {
      demoLogin('driver');
    } else {
      showToast(err.message || 'Driver authenticaton failed', 'error');
    }
  } finally {
    btn.textContent = ogText;
  }
}

function demoLogin(role) {
  demoMode = true;
  localStorage.setItem('eco_demo', 'true');
  localStorage.setItem('eco_role', role);
  
  if (role === 'driver') window.location.href = '/driver.html';
  else if (role === 'point') window.location.href = '/point.html';
  else window.location.href = '/home.html';
}

window.App.login = login;
window.App.signup = signup;
window.App.loginDriver = loginDriver;
