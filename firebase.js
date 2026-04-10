// ============================================================
//  EcoRoute — Firebase Module
//  Auth (email/password) + Firestore user profiles
//  Falls back to demo mode if FIREBASE.ENABLED = false
// ============================================================

const FirebaseModule = (() => {
  const cfg = ECOROUTE_CONFIG.FIREBASE;

  // ── Demo / Not-configured fallback ───────────────────────
  if (!cfg || !cfg.ENABLED) {
    console.info('EcoRoute: Firebase not configured — running in demo mode.');
    return {
      initialized: false,
      signUp:       async () => { throw new Error('DEMO_MODE'); },
      signIn:       async () => { throw new Error('DEMO_MODE'); },
      driverSignIn: async () => { throw new Error('DEMO_MODE'); },
      signOut:      async () => {},
      getUser:      async () => null,
      updateUser:   async () => {},
      onAuthChange: ()       => () => {}
    };
  }

  // ── Initialize Firebase ───────────────────────────────────
  firebase.initializeApp({
    apiKey:            cfg.apiKey,
    authDomain:        cfg.authDomain,
    projectId:         cfg.projectId,
    storageBucket:     cfg.storageBucket,
    messagingSenderId: cfg.messagingSenderId,
    appId:             cfg.appId
  });

  const auth = firebase.auth();
  const db   = firebase.firestore();

  // ── Sign Up (Home / Point users only) ────────────────────
  async function signUp(email, password, profile) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid  = cred.user.uid;

    const doc = {
      name:                 profile.name,
      nickname:             profile.nickname || profile.name.split(' ')[0],
      role:                 profile.role || 'home',    // 'home' | 'point'
      phone:                '',
      address:              '',
      location:             {
        lat: ECOROUTE_CONFIG.DEFAULT_CENTER[1],
        lng: ECOROUTE_CONFIG.DEFAULT_CENTER[0]
      },
      points:               0,
      collectionsThisMonth: 0,
      totalRedeemed:        0,
      isActiveToday:        null,
      fcmToken:             null,
      nextPickup:           'TBD',
      createdAt:            firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(uid).set(doc);
    return { uid, ...doc };
  }

  // ── Sign In (Home / Point users) ─────────────────────────
  async function signIn(email, password) {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const snap = await db.collection('users').doc(cred.user.uid).get();
    if (!snap.exists) throw new Error('Profile not found. Please sign up first.');
    return { uid: cred.user.uid, ...snap.data() };
  }

  // ── Driver Sign In (Employee ID + PIN) ───────────────────
  // Drivers are stored in Firestore: /users/{uid} with role='driver', empId, pin
  async function driverSignIn(empId, pin) {
    const snap = await db.collection('users')
      .where('empId', '==', empId.toUpperCase())
      .where('role',  '==', 'driver')
      .limit(1)
      .get();

    if (snap.empty) throw new Error('Employee ID not found.');

    const doc  = snap.docs[0];
    const data = doc.data();

    // PIN check — store hashed in production!
    if (String(data.pin) !== String(pin)) throw new Error('Incorrect PIN. Try again.');

    return { uid: doc.id, ...data };
  }

  // ── Sign Out ─────────────────────────────────────────────
  async function signOut() {
    await auth.signOut();
  }

  // ── Get User ─────────────────────────────────────────────
  async function getUser(uid) {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? { uid, ...snap.data() } : null;
  }

  // ── Update User ──────────────────────────────────────────
  async function updateUser(uid, data) {
    await db.collection('users').doc(uid).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  // ── Auth state observer ───────────────────────────────────
  function onAuthChange(callback) {
    return auth.onAuthStateChanged(callback);
  }

  return {
    initialized: true,
    auth, db,
    signUp, signIn, driverSignIn, signOut, getUser, updateUser, onAuthChange
  };
})();
