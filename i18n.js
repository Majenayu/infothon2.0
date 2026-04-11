// ============================================================
//  EcoRoute — Internationalization (i18n) Module
//  Supports: English (en), Hindi (hi), Kannada (kn)
// ============================================================

const I18n = (() => {
  const LANG_KEY = 'eco_lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  // ── Translation Dictionaries ─────────────────────────────
  const translations = {
    // ════════════════════════════════════════════════════════
    //  ENGLISH
    // ════════════════════════════════════════════════════════
    en: {
      // Splash & Brand
      splash_tagline: 'Smart Waste. Smarter Cities.',

      // Login
      user_login: '🏠 User Login',
      driver_login: '🚛 Driver Login',
      login_tagline: 'Your smart waste collection companion',
      signin_hint: 'Home & Point users — sign in with your account',
      email_label: 'Email Address',
      password_label: 'Password',
      forgot_password: 'Forgot password?',
      sign_in: 'Sign In',
      demo_accounts: 'Demo Accounts',
      home_user: '🏠 Home User',
      point_user: '🗑 Point User',
      new_to_ecoroute: 'New to EcoRoute?',
      create_account_link: 'Create Account →',
      create_account_title: '🌱 Create your EcoRoute account',
      full_name: 'Full Name',
      confirm_password: 'Confirm Password',
      i_am_a: 'I am a…',
      home_user_label: 'Home User',
      point_user_label: 'Point User',
      home_user_desc: 'Direct pickup from my house',
      point_user_desc: 'I use community collection points',
      create_account: 'Create Account',
      already_have_account: 'Already have an account?',
      sign_in_link: 'Sign In →',
      employee_id: 'Employee ID',
      pin_label: 'PIN',
      access_driver_dashboard: 'Access Driver Dashboard',
      driver_admin_note: 'Driver accounts are created by administrators. Contact your supervisor for access credentials.',
      demo: 'Demo',
      demo_driver: '🚛 Demo Driver',

      // Top Bar
      notifications: 'Notifications',

      // Home Screen
      good_morning: 'Good Morning,',
      good_afternoon: 'Good Afternoon,',
      good_evening: 'Good Evening,',
      confirm_todays_pickup: "Confirm today's pickup",
      tap_to_confirm: 'Tap to let us know your bin is ready',
      youre_active_today: "You're Active Today!",
      bin_confirmed: 'Bin confirmed for pickup.',
      done: 'Done',
      not_available_today: 'Not Available Today',
      bin_not_collected: 'Bin will not be collected today.',
      change: 'Change',
      confirm: 'Confirm',
      next_pickup: 'Next Pickup',
      collections: 'Collections',
      points: 'Points',

      // Fill Panel
      how_full_bin: 'How full is your bin today?',
      empty: 'Empty',
      full: 'Full',
      tap_add_photo: 'Tap to add bin photo',
      optional_photo: 'Optional — helps verify fill level',
      tap_change_photo: 'Tap to change photo',
      submit_report: 'SUBMIT REPORT',
      find_nearest_bin: '📍 FIND NEAREST COMMUNITY BIN',
      earn_points_report: 'Earn 100 points for every report – Thank you for sustainable action!',

      // Driver Panel
      driver_mode: '🚛 Driver Mode',
      todays_route: "Today's Route",
      go_online: '📍 Go Online (Share Location)',
      go_offline: '🛑 Go Offline',
      block_pickups: '🔒 Block User Pickup Requests',
      unblock_pickups: '🔓 Unblock Pickups',
      send_morning_notif: '📢 Send Morning Notification to H-Users',
      active_stops: 'Active Stops',
      verified_today: 'Verified Today',
      pts_awarded: 'Pts Awarded',
      est_time: 'Est. Time',
      distance: 'Distance',
      open_route_map: '🗺 Open Route Map',
      open_map: '🗺 Open Map',
      report_issue: '🚩 Report Issue',
      declare_overload: '🚨 Declare Area Overload',

      // Map Screen
      live_view: 'Live View',
      community_map: 'Community Map',
      driver_view: 'Driver View',
      show_route_details: 'Show Route Details',
      active_legend: '≥70% Full (Active)',
      inactive_legend: '<70% (Inactive)',
      arriving_in: 'Arriving in',
      eta: 'ETA',
      start_collection_route: '🚛 Start Collection Route',
      on_the_way: 'On the way',
      active_route: 'Active Route',
      remaining_stops: 'Remaining Stops',
      start_route_to_see: 'Start the route to see stops',

      // History Screen
      collection_history: 'Collection History',
      calendar: 'Calendar',
      list_view: 'List View',
      collected: 'Collected',
      missed: 'Missed',
      april_summary: 'April Summary',
      loading_history: '⏳ Loading history...',
      loading_collection_list: '⏳ Loading collection list...',
      no_history_recorded: 'No collection history recorded yet.',
      no_past_collections: 'No past collections found.',
      shift_morning: 'Shift: Morning Session',
      pickups: 'Pickups',
      pts_given: 'Pts Given',
      points_earned: 'Points Earned',
      failed_load_history: 'Failed to load history tracking.',

      // Leaderboard / Rewards
      rewards_leaderboard: 'Rewards & Leaderboard',
      your_eco_score: 'Your eco score this month',
      next_gold: 'Next: 4,000 pts → Gold 🥇',
      leaderboard: '🏆 Leaderboard',
      your_badges: 'Your Badges',
      eco_warrior: 'Eco Warrior',
      route_reporter: 'Route Reporter',
      green_star: 'Green Star',
      speed_sorter: 'Speed Sorter',
      city_hero: 'City Hero',
      unlocked: 'UNLOCKED',
      locked: 'Locked',
      redeem_rewards: 'Redeem Rewards',
      see_all: 'See All',
      redeem: 'REDEEM',
      redeem_now: 'Redeem Now',
      maybe_later: 'Maybe Later',
      points_required: 'points required',
      balance: 'Balance',
      insufficient: 'Insufficient',

      // Chatbot
      waste_assistant: 'Waste Assistant',
      ai_waste_classification: 'AI-powered waste classification',
      ai_coming_soon: 'AI Model Coming Soon',
      ai_coming_desc: 'Our intelligent waste classification assistant is being trained and will be available shortly. It will help you identify if your waste is Wet, Dry, Hazardous, Recyclable, or E-Waste.',
      image_recognition: '📷 Image Recognition',
      text_classification: '💬 Text Classification',
      disposal_guidance: '♻️ Disposal Guidance',
      eco_tips: '🌍 Eco Tips',
      notify_when_ready: 'Notify Me When Ready',

      // Profile
      edit_profile: 'Edit Profile',
      total_points: 'Total Points',
      redeemed: 'Redeemed',
      preferences: 'Preferences',
      pickup_notifications: 'Pickup Notifications',
      pickup_schedule: 'Pickup Schedule',
      set_exact_location: '📍 Set Exact Location',
      my_routes: '🗺 My Routes',
      help_support: '💡 Help & Support',
      send_feedback: '📋 Send Feedback',
      about_ecoroute: 'ℹ️ About EcoRoute',
      logout: 'Logout',
      save_changes: 'Save Changes',
      nickname: 'Nickname',
      phone_number: 'Phone Number',
      address: 'Address',
      set_location_map: '📍 Set Exact Location on Map',

      // Driver Admin
      driver_admin_actions: 'Driver Admin Actions',
      reset_global_prefs: 'Reset Global Daily Preferences',
      reset_global_desc: 'Clears all "Yes/No" choices for the day',

      // Confirm Screen
      daily_pickup_confirm: 'Daily Pickup Confirmation',
      bin_ready_question: 'Is your bin ready for collection?',
      scheduled_today: 'Scheduled: Today 10:30 AM',
      pending_confirmation: '⏳ Pending Confirmation',
      yes_bin_ready: '✅ Yes, Bin is Ready',
      not_available_btn: '❌ Not Available Today',
      remind_later: 'Remind me later',

      // Bottom Nav
      nav_home: 'Home',
      nav_map: 'Map',
      nav_history: 'History',
      nav_rewards: 'Rewards',
      nav_chat: 'Chat',
      nav_profile: 'Profile',

      // Location Picker
      set_your_location: 'Set Your Location',
      delivery_location: 'Delivery Location',
      move_map_location: 'Move the map to set your location',
      confirm_location: 'Confirm Location',

      // PWA
      add_home_screen: 'Add to Home Screen',
      install_ecoroute: 'Install EcoRoute for quick access',
      install: 'Install',

      // Modals  
      bin_checkpoint: '🗑️ Bin Checkpoint',
      waste_at_point: 'Was there waste / dust at this collection point?',
      yes_waste_collected: '✅ Yes — Waste was collected',
      no_bin_empty: '❌ No — Bin was empty',
      user_earns_pts: 'User earns 10 pts if you confirm waste was collected',
      report_issue_title: '🚩 Report Issue',
      report_help_desc: 'Help us keep the route efficient by reporting obstacles or bin issues.',
      issue_type: 'Issue Type',
      bin_overflow: '🗑️ Bin Overflow / Damaged',
      road_block: '🚧 Road Block / Construction',
      user_complaint: '👤 User Complaint / Issue',
      other: '❓ Other',
      description: 'Description',
      describe_issue: 'Briefly describe the issue...',
      submit_report_btn: 'Submit Report',
      trip_complete: '🏁 Trip Complete!',
      great_job: 'Great job today!',
      collection_summary: 'Here is your collection summary',
      efficiency: 'Efficiency',
      done_for_today: 'Done for today',

      // Home content cards
      direct_house_collection: 'Direct House Collection',
      schedule_pickup: 'Schedule Pickup',
      nearby_collection_points: 'Nearby Collection Points',
      nearby_points_desc: '3 public points nearby · Backup option',
      find_nearest: 'Find Nearest',
      youre_late: "You're Late!",
      driver_locked_route: 'The driver has locked their route for today.',
      find_community_point: '📍 Find Nearest Community Point instead',

      // Toast Messages
      welcome_back: 'Welcome back',
      signed_out: 'Signed out',
      demo_mode_active: 'Demo mode active',
      location_not_supported: 'Location not supported by device.',
      location_permission_needed: 'Location permission needed to go online.',
      now_online: 'You are now online. Sharing location...',
      now_offline: 'You are now offline.',
      users_can_request: 'Users can now request pickups again.',
      pickups_blocked: 'Pickup requests blocked. Users will be directed to community points.',

      // Language selector
      language: 'Language',
      lang_en: 'English',
      lang_hi: 'हिंदी',
      lang_kn: 'ಕನ್ನಡ',
    },

    // ════════════════════════════════════════════════════════
    //  HINDI
    // ════════════════════════════════════════════════════════
    hi: {
      splash_tagline: 'स्मार्ट कचरा। स्मार्ट शहर।',
      user_login: '🏠 उपयोगकर्ता लॉगिन',
      driver_login: '🚛 ड्राइवर लॉगिन',
      login_tagline: 'आपका स्मार्ट कचरा संग्रहण साथी',
      signin_hint: 'होम और पॉइंट उपयोगकर्ता — अपने खाते से साइन इन करें',
      email_label: 'ईमेल पता',
      password_label: 'पासवर्ड',
      forgot_password: 'पासवर्ड भूल गए?',
      sign_in: 'साइन इन',
      demo_accounts: 'डेमो खाते',
      home_user: '🏠 होम उपयोगकर्ता',
      point_user: '🗑 पॉइंट उपयोगकर्ता',
      new_to_ecoroute: 'EcoRoute में नए हैं?',
      create_account_link: 'खाता बनाएं →',
      create_account_title: '🌱 अपना EcoRoute खाता बनाएं',
      full_name: 'पूरा नाम',
      confirm_password: 'पासवर्ड की पुष्टि करें',
      i_am_a: 'मैं हूँ…',
      home_user_label: 'होम उपयोगकर्ता',
      point_user_label: 'पॉइंट उपयोगकर्ता',
      home_user_desc: 'मेरे घर से सीधा पिकअप',
      point_user_desc: 'मैं सामुदायिक संग्रह बिंदुओं का उपयोग करता हूँ',
      create_account: 'खाता बनाएं',
      already_have_account: 'पहले से खाता है?',
      sign_in_link: 'साइन इन करें →',
      employee_id: 'कर्मचारी आईडी',
      pin_label: 'पिन',
      access_driver_dashboard: 'ड्राइवर डैशबोर्ड खोलें',
      driver_admin_note: 'ड्राइवर खाते प्रशासकों द्वारा बनाए जाते हैं। एक्सेस क्रेडेंशियल्स के लिए अपने पर्यवेक्षक से संपर्क करें।',
      demo: 'डेमो',
      demo_driver: '🚛 डेमो ड्राइवर',

      notifications: 'सूचनाएं',

      good_morning: 'सुप्रभात,',
      good_afternoon: 'शुभ दोपहर,',
      good_evening: 'शुभ संध्या,',
      confirm_todays_pickup: 'आज का पिकअप पुष्टि करें',
      tap_to_confirm: 'हमें बताएं कि आपका बिन तैयार है',
      youre_active_today: 'आप आज सक्रिय हैं!',
      bin_confirmed: 'बिन पिकअप के लिए पुष्टि हो गया।',
      done: 'हो गया',
      not_available_today: 'आज उपलब्ध नहीं',
      bin_not_collected: 'आज बिन एकत्र नहीं किया जाएगा।',
      change: 'बदलें',
      confirm: 'पुष्टि करें',
      next_pickup: 'अगला पिकअप',
      collections: 'संग्रह',
      points: 'अंक',

      how_full_bin: 'आज आपका बिन कितना भरा है?',
      empty: 'खाली',
      full: 'भरा',
      tap_add_photo: 'बिन की फोटो जोड़ने के लिए टैप करें',
      optional_photo: 'वैकल्पिक — भराव स्तर सत्यापित करने में मदद करता है',
      tap_change_photo: 'फोटो बदलने के लिए टैप करें',
      submit_report: 'रिपोर्ट जमा करें',
      find_nearest_bin: '📍 निकटतम सामुदायिक बिन खोजें',
      earn_points_report: 'हर रिपोर्ट के लिए 100 अंक कमाएं – स्थायी कार्रवाई के लिए धन्यवाद!',

      driver_mode: '🚛 ड्राइवर मोड',
      todays_route: 'आज का मार्ग',
      go_online: '📍 ऑनलाइन जाएं (स्थान साझा करें)',
      go_offline: '🛑 ऑफ़लाइन जाएं',
      block_pickups: '🔒 उपयोगकर्ता पिकअप अनुरोध ब्लॉक करें',
      unblock_pickups: '🔓 पिकअप अनब्लॉक करें',
      send_morning_notif: '📢 होम-उपयोगकर्ताओं को सुबह की सूचना भेजें',
      active_stops: 'सक्रिय स्टॉप',
      verified_today: 'आज सत्यापित',
      pts_awarded: 'अंक दिए गए',
      est_time: 'अनु. समय',
      distance: 'दूरी',
      open_route_map: '🗺 मार्ग मानचित्र खोलें',
      open_map: '🗺 मानचित्र खोलें',
      report_issue: '🚩 समस्या रिपोर्ट करें',
      declare_overload: '🚨 क्षेत्र ओवरलोड घोषित करें',

      live_view: 'लाइव दृश्य',
      community_map: 'सामुदायिक मानचित्र',
      driver_view: 'ड्राइवर दृश्य',
      show_route_details: 'मार्ग विवरण दिखाएं',
      active_legend: '≥70% भरा (सक्रिय)',
      inactive_legend: '<70% (निष्क्रिय)',
      arriving_in: 'पहुँच रहा है',
      eta: 'ईटीए',
      start_collection_route: '🚛 संग्रह मार्ग शुरू करें',
      on_the_way: 'रास्ते में',
      active_route: 'सक्रिय मार्ग',
      remaining_stops: 'शेष स्टॉप',
      start_route_to_see: 'स्टॉप देखने के लिए मार्ग शुरू करें',

      collection_history: 'संग्रह इतिहास',
      calendar: 'कैलेंडर',
      list_view: 'सूची दृश्य',
      collected: 'एकत्रित',
      missed: 'छूटा',
      april_summary: 'अप्रैल सारांश',
      loading_history: '⏳ इतिहास लोड हो रहा है...',
      loading_collection_list: '⏳ संग्रह सूची लोड हो रही है...',
      no_history_recorded: 'अभी तक कोई संग्रह इतिहास दर्ज नहीं है।',
      no_past_collections: 'कोई पिछला संग्रह नहीं मिला।',
      shift_morning: 'शिफ्ट: सुबह का सत्र',
      pickups: 'पिकअप',
      pts_given: 'अंक दिए',
      points_earned: 'अर्जित अंक',
      failed_load_history: 'इतिहास ट्रैकिंग लोड करने में विफल।',

      rewards_leaderboard: 'पुरस्कार और लीडरबोर्ड',
      your_eco_score: 'इस महीने आपका इको स्कोर',
      next_gold: 'अगला: 4,000 अंक → गोल्ड 🥇',
      leaderboard: '🏆 लीडरबोर्ड',
      your_badges: 'आपके बैज',
      eco_warrior: 'इको योद्धा',
      route_reporter: 'मार्ग रिपोर्टर',
      green_star: 'ग्रीन स्टार',
      speed_sorter: 'स्पीड सॉर्टर',
      city_hero: 'सिटी हीरो',
      unlocked: 'अनलॉक',
      locked: 'लॉक',
      redeem_rewards: 'पुरस्कार रिडीम करें',
      see_all: 'सभी देखें',
      redeem: 'रिडीम',
      redeem_now: 'अभी रिडीम करें',
      maybe_later: 'शायद बाद में',
      points_required: 'अंक आवश्यक',
      balance: 'शेष',
      insufficient: 'अपर्याप्त',

      waste_assistant: 'कचरा सहायक',
      ai_waste_classification: 'AI-संचालित कचरा वर्गीकरण',
      ai_coming_soon: 'AI मॉडल जल्द आ रहा है',
      ai_coming_desc: 'हमारा बुद्धिमान कचरा वर्गीकरण सहायक प्रशिक्षित हो रहा है। यह पहचानने में मदद करेगा कि आपका कचरा गीला, सूखा, खतरनाक, पुनर्चक्रण योग्य या ई-कचरा है।',
      image_recognition: '📷 छवि पहचान',
      text_classification: '💬 टेक्स्ट वर्गीकरण',
      disposal_guidance: '♻️ निपटान मार्गदर्शन',
      eco_tips: '🌍 इको टिप्स',
      notify_when_ready: 'तैयार होने पर सूचित करें',

      edit_profile: 'प्रोफ़ाइल संपादित करें',
      total_points: 'कुल अंक',
      redeemed: 'रिडीम किए गए',
      preferences: 'प्राथमिकताएं',
      pickup_notifications: 'पिकअप सूचनाएं',
      pickup_schedule: 'पिकअप अनुसूची',
      set_exact_location: '📍 सटीक स्थान सेट करें',
      my_routes: '🗺 मेरे मार्ग',
      help_support: '💡 सहायता और समर्थन',
      send_feedback: '📋 फीडबैक भेजें',
      about_ecoroute: 'ℹ️ EcoRoute के बारे में',
      logout: 'लॉगआउट',
      save_changes: 'परिवर्तन सहेजें',
      nickname: 'उपनाम',
      phone_number: 'फ़ोन नंबर',
      address: 'पता',
      set_location_map: '📍 मानचित्र पर सटीक स्थान अंकित करें',

      driver_admin_actions: 'ड्राइवर प्रशासन कार्रवाइयां',
      reset_global_prefs: 'वैश्विक दैनिक प्राथमिकताएं रीसेट करें',
      reset_global_desc: 'दिन की सभी "हां/नहीं" चुनाव साफ़ करता है',

      daily_pickup_confirm: 'दैनिक पिकअप पुष्टि',
      bin_ready_question: 'क्या आपका बिन संग्रह के लिए तैयार है?',
      scheduled_today: 'निर्धारित: आज सुबह 10:30',
      pending_confirmation: '⏳ पुष्टि लंबित',
      yes_bin_ready: '✅ हां, बिन तैयार है',
      not_available_btn: '❌ आज उपलब्ध नहीं',
      remind_later: 'बाद में याद दिलाएं',

      nav_home: 'होम',
      nav_map: 'मानचित्र',
      nav_history: 'इतिहास',
      nav_rewards: 'पुरस्कार',
      nav_chat: 'चैट',
      nav_profile: 'प्रोफ़ाइल',

      set_your_location: 'अपना स्थान सेट करें',
      delivery_location: 'डिलीवरी स्थान',
      move_map_location: 'अपना स्थान सेट करने के लिए मानचित्र खिसकाएं',
      confirm_location: 'स्थान पुष्टि करें',

      add_home_screen: 'होम स्क्रीन पर जोड़ें',
      install_ecoroute: 'त्वरित पहुंच के लिए EcoRoute इंस्टॉल करें',
      install: 'इंस्टॉल',

      bin_checkpoint: '🗑️ बिन चेकपॉइंट',
      waste_at_point: 'क्या इस संग्रह बिंदु पर कचरा/धूल था?',
      yes_waste_collected: '✅ हां — कचरा एकत्र किया गया',
      no_bin_empty: '❌ नहीं — बिन खाली था',
      user_earns_pts: 'यदि आप कचरा संग्रह की पुष्टि करते हैं तो उपयोगकर्ता को 10 अंक मिलते हैं',
      report_issue_title: '🚩 समस्या रिपोर्ट करें',
      report_help_desc: 'बाधाओं या बिन समस्याओं की रिपोर्ट करके मार्ग को कुशल बनाए रखने में मदद करें।',
      issue_type: 'समस्या का प्रकार',
      bin_overflow: '🗑️ बिन ओवरफ्लो / क्षतिग्रस्त',
      road_block: '🚧 सड़क ब्लॉक / निर्माण',
      user_complaint: '👤 उपयोगकर्ता शिकायत / समस्या',
      other: '❓ अन्य',
      description: 'विवरण',
      describe_issue: 'संक्षेप में समस्या का वर्णन करें...',
      submit_report_btn: 'रिपोर्ट जमा करें',
      trip_complete: '🏁 यात्रा पूरी!',
      great_job: 'आज बहुत अच्छा काम!',
      collection_summary: 'यहां आपका संग्रह सारांश है',
      efficiency: 'दक्षता',
      done_for_today: 'आज के लिए हो गया',

      direct_house_collection: 'सीधा घर संग्रह',
      schedule_pickup: 'पिकअप शेड्यूल करें',
      nearby_collection_points: 'निकटतम संग्रह बिंदु',
      nearby_points_desc: '3 सार्वजनिक बिंदु पास · बैकअप विकल्प',
      find_nearest: 'निकटतम खोजें',
      youre_late: 'आप देरी से हैं!',
      driver_locked_route: 'ड्राइवर ने आज के लिए अपना मार्ग लॉक कर दिया है।',
      find_community_point: '📍 बदले में निकटतम सामुदायिक बिंदु खोजें',

      welcome_back: 'वापसी पर स्वागत',
      signed_out: 'साइन आउट हो गया',
      demo_mode_active: 'डेमो मोड सक्रिय',
      location_not_supported: 'डिवाइस द्वारा स्थान समर्थित नहीं है।',
      location_permission_needed: 'ऑनलाइन जाने के लिए स्थान अनुमति आवश्यक है।',
      now_online: 'आप अब ऑनलाइन हैं। स्थान साझा कर रहे हैं...',
      now_offline: 'आप अब ऑफ़लाइन हैं।',
      users_can_request: 'उपयोगकर्ता अब पिकअप का अनुरोध फिर से कर सकते हैं।',
      pickups_blocked: 'पिकअप अनुरोध ब्लॉक किए गए। उपयोगकर्ताओं को सामुदायिक बिंदुओं पर भेजा जाएगा।',

      language: 'भाषा',
      lang_en: 'English',
      lang_hi: 'हिंदी',
      lang_kn: 'ಕನ್ನಡ',
    },

    // ════════════════════════════════════════════════════════
    //  KANNADA
    // ════════════════════════════════════════════════════════
    kn: {
      splash_tagline: 'ಸ್ಮಾರ್ಟ್ ತ್ಯಾಜ್ಯ. ಸ್ಮಾರ್ಟ್ ನಗರಗಳು.',
      user_login: '🏠 ಬಳಕೆದಾರ ಲಾಗಿನ್',
      driver_login: '🚛 ಚಾಲಕ ಲಾಗಿನ್',
      login_tagline: 'ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ತ್ಯಾಜ್ಯ ಸಂಗ್ರಹಣೆ ಸಂಗಾತಿ',
      signin_hint: 'ಹೋಮ್ ಮತ್ತು ಪಾಯಿಂಟ್ ಬಳಕೆದಾರರು — ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಸೈನ್ ಇನ್ ಮಾಡಿ',
      email_label: 'ಇಮೇಲ್ ವಿಳಾಸ',
      password_label: 'ಪಾಸ್‌ವರ್ಡ್',
      forgot_password: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
      sign_in: 'ಸೈನ್ ಇನ್',
      demo_accounts: 'ಡೆಮೊ ಖಾತೆಗಳು',
      home_user: '🏠 ಹೋಮ್ ಬಳಕೆದಾರ',
      point_user: '🗑 ಪಾಯಿಂಟ್ ಬಳಕೆದಾರ',
      new_to_ecoroute: 'EcoRoute ಗೆ ಹೊಸಬರೇ?',
      create_account_link: 'ಖಾತೆ ರಚಿಸಿ →',
      create_account_title: '🌱 ನಿಮ್ಮ EcoRoute ಖಾತೆ ರಚಿಸಿ',
      full_name: 'ಪೂರ್ಣ ಹೆಸರು',
      confirm_password: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
      i_am_a: 'ನಾನು…',
      home_user_label: 'ಹೋಮ್ ಬಳಕೆದಾರ',
      point_user_label: 'ಪಾಯಿಂಟ್ ಬಳಕೆದಾರ',
      home_user_desc: 'ನನ್ನ ಮನೆಯಿಂದ ನೇರ ಪಿಕಪ್',
      point_user_desc: 'ನಾನು ಸಮುದಾಯ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರಗಳನ್ನು ಬಳಸುತ್ತೇನೆ',
      create_account: 'ಖಾತೆ ರಚಿಸಿ',
      already_have_account: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
      sign_in_link: 'ಸೈನ್ ಇನ್ ಮಾಡಿ →',
      employee_id: 'ಉದ್ಯೋಗಿ ಐಡಿ',
      pin_label: 'ಪಿನ್',
      access_driver_dashboard: 'ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ',
      driver_admin_note: 'ಚಾಲಕ ಖಾತೆಗಳನ್ನು ನಿರ್ವಾಹಕರು ರಚಿಸುತ್ತಾರೆ. ಪ್ರವೇಶ ರುಜುವಾತುಗಳಿಗಾಗಿ ನಿಮ್ಮ ಮೇಲ್ವಿಚಾರಕರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      demo: 'ಡೆಮೊ',
      demo_driver: '🚛 ಡೆಮೊ ಚಾಲಕ',

      notifications: 'ಅಧಿಸೂಚನೆಗಳು',

      good_morning: 'ಶುಭೋದಯ,',
      good_afternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ,',
      good_evening: 'ಶುಭ ಸಂಜೆ,',
      confirm_todays_pickup: 'ಇಂದಿನ ಪಿಕಪ್ ದೃಢೀಕರಿಸಿ',
      tap_to_confirm: 'ನಿಮ್ಮ ಬಿನ್ ಸಿದ್ಧವಾಗಿದೆ ಎಂದು ನಮಗೆ ತಿಳಿಸಿ',
      youre_active_today: 'ನೀವು ಇಂದು ಸಕ್ರಿಯರಾಗಿದ್ದೀರಿ!',
      bin_confirmed: 'ಬಿನ್ ಪಿಕಪ್‌ಗೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ.',
      done: 'ಮುಗಿಯಿತು',
      not_available_today: 'ಇಂದು ಲಭ್ಯವಿಲ್ಲ',
      bin_not_collected: 'ಇಂದು ಬಿನ್ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.',
      change: 'ಬದಲಿಸಿ',
      confirm: 'ದೃಢೀಕರಿಸಿ',
      next_pickup: 'ಮುಂದಿನ ಪಿಕಪ್',
      collections: 'ಸಂಗ್ರಹಗಳು',
      points: 'ಅಂಕಗಳು',

      how_full_bin: 'ಇಂದು ನಿಮ್ಮ ಬಿನ್ ಎಷ್ಟು ತುಂಬಿದೆ?',
      empty: 'ಖಾಲಿ',
      full: 'ಭರ್ತಿ',
      tap_add_photo: 'ಬಿನ್ ಫೋಟೋ ಸೇರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
      optional_photo: 'ಐಚ್ಛಿಕ — ತುಂಬುವ ಮಟ್ಟವನ್ನು ಪರಿಶೀಲಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ',
      tap_change_photo: 'ಫೋಟೋ ಬದಲಾಯಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
      submit_report: 'ವರದಿ ಸಲ್ಲಿಸಿ',
      find_nearest_bin: '📍 ಹತ್ತಿರದ ಸಮುದಾಯ ಬಿನ್ ಹುಡುಕಿ',
      earn_points_report: 'ಪ್ರತಿ ವರದಿಗೆ 100 ಅಂಕಗಳನ್ನು ಗಳಿಸಿ – ಸುಸ್ಥಿರ ಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!',

      driver_mode: '🚛 ಚಾಲಕ ಮೋಡ್',
      todays_route: 'ಇಂದಿನ ಮಾರ್ಗ',
      go_online: '📍 ಆನ್‌ಲೈನ್ ಆಗಿ (ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ)',
      go_offline: '🛑 ಆಫ್‌ಲೈನ್ ಆಗಿ',
      block_pickups: '🔒 ಬಳಕೆದಾರ ಪಿಕಪ್ ವಿನಂತಿಗಳನ್ನು ನಿರ್ಬಂಧಿಸಿ',
      unblock_pickups: '🔓 ಪಿಕಪ್ ಅನ್‌ಬ್ಲಾಕ್ ಮಾಡಿ',
      send_morning_notif: '📢 ಮನೆ-ಬಳಕೆದಾರರಿಗೆ ಬೆಳಗಿನ ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಿ',
      active_stops: 'ಸಕ್ರಿಯ ನಿಲ್ದಾಣಗಳು',
      verified_today: 'ಇಂದು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
      pts_awarded: 'ಅಂಕಗಳು ನೀಡಲಾಗಿದೆ',
      est_time: 'ಅಂ. ಸಮಯ',
      distance: 'ದೂರ',
      open_route_map: '🗺 ಮಾರ್ಗ ನಕ್ಷೆ ತೆರೆಯಿರಿ',
      open_map: '🗺 ನಕ್ಷೆ ತೆರೆಯಿರಿ',
      report_issue: '🚩 ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      declare_overload: '🚨 ಪ್ರದೇಶ ಓವರ್‌ಲೋಡ್ ಘೋಷಿಸಿ',

      live_view: 'ಲೈವ್ ವೀಕ್ಷಣೆ',
      community_map: 'ಸಮುದಾಯ ನಕ್ಷೆ',
      driver_view: 'ಚಾಲಕ ವೀಕ್ಷಣೆ',
      show_route_details: 'ಮಾರ್ಗ ವಿವರಗಳನ್ನು ತೋರಿಸಿ',
      active_legend: '≥70% ತುಂಬಿದ (ಸಕ್ರಿಯ)',
      inactive_legend: '<70% (ನಿಷ್ಕ್ರಿಯ)',
      arriving_in: 'ಬರುತ್ತಿದ್ದಾರೆ',
      eta: 'ಇಟಿಎ',
      start_collection_route: '🚛 ಸಂಗ್ರಹಣಾ ಮಾರ್ಗ ಆರಂಭಿಸಿ',
      on_the_way: 'ದಾರಿಯಲ್ಲಿ',
      active_route: 'ಸಕ್ರಿಯ ಮಾರ್ಗ',
      remaining_stops: 'ಉಳಿದ ನಿಲ್ದಾಣಗಳು',
      start_route_to_see: 'ನಿಲ್ದಾಣಗಳನ್ನು ನೋಡಲು ಮಾರ್ಗ ಆರಂಭಿಸಿ',

      collection_history: 'ಸಂಗ್ರಹಣಾ ಇತಿಹಾಸ',
      calendar: 'ಕ್ಯಾಲೆಂಡರ್',
      list_view: 'ಪಟ್ಟಿ ವೀಕ್ಷಣೆ',
      collected: 'ಸಂಗ್ರಹಿಸಲಾಗಿದೆ',
      missed: 'ತಪ್ಪಿಸಲಾಗಿದೆ',
      april_summary: 'ಏಪ್ರಿಲ್ ಸಾರಾಂಶ',
      loading_history: '⏳ ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      loading_collection_list: '⏳ ಸಂಗ್ರಹಣಾ ಪಟ್ಟಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      no_history_recorded: 'ಇನ್ನೂ ಯಾವುದೇ ಸಂಗ್ರಹಣಾ ಇತಿಹಾಸ ದಾಖಲಾಗಿಲ್ಲ.',
      no_past_collections: 'ಯಾವುದೇ ಹಿಂದಿನ ಸಂಗ್ರಹಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      shift_morning: 'ಶಿಫ್ಟ್: ಬೆಳಗಿನ ಅವಧಿ',
      pickups: 'ಪಿಕಪ್‌ಗಳು',
      pts_given: 'ಅಂಕಗಳು ನೀಡಲಾಗಿದೆ',
      points_earned: 'ಗಳಿಸಿದ ಅಂಕಗಳು',
      failed_load_history: 'ಇತಿಹಾಸ ಟ್ರ್ಯಾಕಿಂಗ್ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.',

      rewards_leaderboard: 'ಬಹುಮಾನಗಳು ಮತ್ತು ಶ್ರೇಣಿ ಪಟ್ಟಿ',
      your_eco_score: 'ಈ ತಿಂಗಳ ನಿಮ್ಮ ಇಕೋ ಸ್ಕೋರ್',
      next_gold: 'ಮುಂದಿನ: 4,000 ಅಂಕಗಳು → ಗೋಲ್ಡ್ 🥇',
      leaderboard: '🏆 ಶ್ರೇಣಿ ಪಟ್ಟಿ',
      your_badges: 'ನಿಮ್ಮ ಬ್ಯಾಡ್ಜ್‌ಗಳು',
      eco_warrior: 'ಇಕೋ ಯೋಧ',
      route_reporter: 'ಮಾರ್ಗ ವರದಿಗಾರ',
      green_star: 'ಗ್ರೀನ್ ಸ್ಟಾರ್',
      speed_sorter: 'ಸ್ಪೀಡ್ ಸಾರ್ಟರ್',
      city_hero: 'ಸಿಟಿ ಹೀರೋ',
      unlocked: 'ಅನ್‌ಲಾಕ್',
      locked: 'ಲಾಕ್',
      redeem_rewards: 'ಬಹುಮಾನಗಳನ್ನು ರಿಡೀಮ್ ಮಾಡಿ',
      see_all: 'ಎಲ್ಲಾ ನೋಡಿ',
      redeem: 'ರಿಡೀಮ್',
      redeem_now: 'ಈಗ ರಿಡೀಮ್ ಮಾಡಿ',
      maybe_later: 'ಬಹುಶಃ ನಂತರ',
      points_required: 'ಅಂಕಗಳು ಅಗತ್ಯ',
      balance: 'ಬಾಕಿ',
      insufficient: 'ಸಾಕಾಗುವುದಿಲ್ಲ',

      waste_assistant: 'ತ್ಯಾಜ್ಯ ಸಹಾಯಕ',
      ai_waste_classification: 'AI-ಚಾಲಿತ ತ್ಯಾಜ್ಯ ವರ್ಗೀಕರಣ',
      ai_coming_soon: 'AI ಮಾದರಿ ಶೀಘ್ರದಲ್ಲೇ ಬರುತ್ತಿದೆ',
      ai_coming_desc: 'ನಮ್ಮ ಬುದ್ಧಿವಂತ ತ್ಯಾಜ್ಯ ವರ್ಗೀಕರಣ ಸಹಾಯಕವನ್ನು ತರಬೇತಿ ಮಾಡಲಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ತ್ಯಾಜ್ಯ ಹಸಿ, ಒಣ, ಅಪಾಯಕಾರಿ, ಮರುಬಳಕೆ ಮಾಡಬಹುದಾದ, ಅಥವಾ ಇ-ತ್ಯಾಜ್ಯ ಎಂದು ಗುರುತಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
      image_recognition: '📷 ಚಿತ್ರ ಗುರುತಿಸುವಿಕೆ',
      text_classification: '💬 ಪಠ್ಯ ವರ್ಗೀಕರಣ',
      disposal_guidance: '♻️ ವಿಲೇವಾರಿ ಮಾರ್ಗದರ್ಶನ',
      eco_tips: '🌍 ಇಕೋ ಸಲಹೆಗಳು',
      notify_when_ready: 'ಸಿದ್ಧವಾದಾಗ ಅಧಿಸೂಚಿಸಿ',

      edit_profile: 'ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ',
      total_points: 'ಒಟ್ಟು ಅಂಕಗಳು',
      redeemed: 'ರಿಡೀಮ್ ಮಾಡಲಾಗಿದೆ',
      preferences: 'ಆದ್ಯತೆಗಳು',
      pickup_notifications: 'ಪಿಕಪ್ ಅಧಿಸೂಚನೆಗಳು',
      pickup_schedule: 'ಪಿಕಪ್ ವೇಳಾಪಟ್ಟಿ',
      set_exact_location: '📍 ನಿಖರ ಸ್ಥಳ ಹೊಂದಿಸಿ',
      my_routes: '🗺 ನನ್ನ ಮಾರ್ಗಗಳು',
      help_support: '💡 ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
      send_feedback: '📋 ಪ್ರತಿಕ್ರಿಯೆ ಕಳುಹಿಸಿ',
      about_ecoroute: 'ℹ️ EcoRoute ಬಗ್ಗೆ',
      logout: 'ಲಾಗ್‌ಔಟ್',
      save_changes: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
      nickname: 'ಅಡ್ಡಹೆಸರು',
      phone_number: 'ಫೋನ್ ಸಂಖ್ಯೆ',
      address: 'ವಿಳಾಸ',
      set_location_map: '📍 ನಕ್ಷೆಯಲ್ಲಿ ನಿಖರ ಸ್ಥಳ ಗೊತ್ತುಪಡಿಸಿ',

      driver_admin_actions: 'ಚಾಲಕ ನಿರ್ವಾಹಕ ಕ್ರಮಗಳು',
      reset_global_prefs: 'ಜಾಗತಿಕ ದೈನಂದಿನ ಆದ್ಯತೆಗಳನ್ನು ಮರುಹೊಂದಿಸಿ',
      reset_global_desc: 'ದಿನದ ಎಲ್ಲಾ "ಹೌದು/ಇಲ್ಲ" ಆಯ್ಕೆಗಳನ್ನು ತೆರವುಗೊಳಿಸುತ್ತದೆ',

      daily_pickup_confirm: 'ದೈನಂದಿನ ಪಿಕಪ್ ದೃಢೀಕರಣ',
      bin_ready_question: 'ನಿಮ್ಮ ಬಿನ್ ಸಂಗ್ರಹಣೆಗೆ ಸಿದ್ಧವಾಗಿದೆಯೇ?',
      scheduled_today: 'ನಿಗದಿ: ಇಂದು ಬೆಳಿಗ್ಗೆ 10:30',
      pending_confirmation: '⏳ ದೃಢೀಕರಣ ಬಾಕಿ',
      yes_bin_ready: '✅ ಹೌದು, ಬಿನ್ ಸಿದ್ಧ',
      not_available_btn: '❌ ಇಂದು ಲಭ್ಯವಿಲ್ಲ',
      remind_later: 'ನಂತರ ನೆನಪಿಸಿ',

      nav_home: 'ಮುಖಪುಟ',
      nav_map: 'ನಕ್ಷೆ',
      nav_history: 'ಇತಿಹಾಸ',
      nav_rewards: 'ಬಹುಮಾನಗಳು',
      nav_chat: 'ಚಾಟ್',
      nav_profile: 'ಪ್ರೊಫೈಲ್',

      set_your_location: 'ನಿಮ್ಮ ಸ್ಥಳ ಹೊಂದಿಸಿ',
      delivery_location: 'ಡೆಲಿವರಿ ಸ್ಥಳ',
      move_map_location: 'ನಿಮ್ಮ ಸ್ಥಳ ಹೊಂದಿಸಲು ನಕ್ಷೆಯನ್ನು ಸರಿಸಿ',
      confirm_location: 'ಸ್ಥಳ ದೃಢೀಕರಿಸಿ',

      add_home_screen: 'ಮುಖಪುಟ ಪರದೆಗೆ ಸೇರಿಸಿ',
      install_ecoroute: 'ತ್ವರಿತ ಪ್ರವೇಶಕ್ಕಾಗಿ EcoRoute ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
      install: 'ಇನ್‌ಸ್ಟಾಲ್',

      bin_checkpoint: '🗑️ ಬಿನ್ ಚೆಕ್‌ಪಾಯಿಂಟ್',
      waste_at_point: 'ಈ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರದಲ್ಲಿ ತ್ಯಾಜ್ಯ/ಧೂಳು ಇತ್ತೇ?',
      yes_waste_collected: '✅ ಹೌದು — ತ್ಯಾಜ್ಯ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ',
      no_bin_empty: '❌ ಇಲ್ಲ — ಬಿನ್ ಖಾಲಿ ಇತ್ತು',
      user_earns_pts: 'ತ್ಯಾಜ್ಯ ಸಂಗ್ರಹಣೆಯನ್ನು ದೃಢೀಕರಿಸಿದರೆ ಬಳಕೆದಾರ 10 ಅಂಕಗಳನ್ನು ಗಳಿಸುತ್ತಾರೆ',
      report_issue_title: '🚩 ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      report_help_desc: 'ಅಡೆತಡೆಗಳು ಅಥವಾ ಬಿನ್ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡುವ ಮೂಲಕ ಮಾರ್ಗವನ್ನು ಸಮರ್ಥವಾಗಿ ಇರಿಸಲು ಸಹಾಯ ಮಾಡಿ.',
      issue_type: 'ಸಮಸ್ಯೆ ಪ್ರಕಾರ',
      bin_overflow: '🗑️ ಬಿನ್ ಓವರ್‌ಫ್ಲೋ / ಹಾನಿಗೊಳಗಾಗಿದೆ',
      road_block: '🚧 ರಸ್ತೆ ತಡೆ / ನಿರ್ಮಾಣ',
      user_complaint: '👤 ಬಳಕೆದಾರ ದೂರು / ಸಮಸ್ಯೆ',
      other: '❓ ಇತರೆ',
      description: 'ವಿವರಣೆ',
      describe_issue: 'ಸಮಸ್ಯೆಯನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ವಿವರಿಸಿ...',
      submit_report_btn: 'ವರದಿ ಸಲ್ಲಿಸಿ',
      trip_complete: '🏁 ಪ್ರಯಾಣ ಪೂರ್ಣ!',
      great_job: 'ಇಂದು ಅದ್ಭುತ ಕೆಲಸ!',
      collection_summary: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಸಂಗ್ರಹಣಾ ಸಾರಾಂಶ ಇದೆ',
      efficiency: 'ದಕ್ಷತೆ',
      done_for_today: 'ಇಂದಿಗೆ ಮುಗಿಯಿತು',

      direct_house_collection: 'ನೇರ ಮನೆ ಸಂಗ್ರಹಣೆ',
      schedule_pickup: 'ಪಿಕಪ್ ಶೆಡ್ಯೂಲ್ ಮಾಡಿ',
      nearby_collection_points: 'ಹತ್ತಿರದ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರಗಳು',
      nearby_points_desc: '3 ಸಾರ್ವಜನಿಕ ಕೇಂದ್ರಗಳು ಹತ್ತಿರ · ಬ್ಯಾಕಪ್ ಆಯ್ಕೆ',
      find_nearest: 'ಹತ್ತಿರದ್ದನ್ನು ಹುಡುಕಿ',
      youre_late: 'ನೀವು ತಡವಾಗಿದ್ದೀರಿ!',
      driver_locked_route: 'ಚಾಲಕ ಇಂದಿನ ಮಾರ್ಗವನ್ನು ಲಾಕ್ ಮಾಡಿದ್ದಾರೆ.',
      find_community_point: '📍 ಬದಲಿಗೆ ಹತ್ತಿರದ ಸಮುದಾಯ ಕೇಂದ್ರ ಹುಡುಕಿ',

      welcome_back: 'ಕುಶಲವೇ ಸ್ವಾಗತ',
      signed_out: 'ಸೈನ್ ಔಟ್ ಆಗಿದೆ',
      demo_mode_active: 'ಡೆಮೊ ಮೋಡ್ ಸಕ್ರಿಯ',
      location_not_supported: 'ಸಾಧನದಿಂದ ಸ್ಥಳ ಬೆಂಬಲಿತವಲ್ಲ.',
      location_permission_needed: 'ಆನ್‌ಲೈನ್ ಆಗಲು ಸ್ಥಳ ಅನುಮತಿ ಅಗತ್ಯ.',
      now_online: 'ನೀವು ಈಗ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ. ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ...',
      now_offline: 'ನೀವು ಈಗ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ.',
      users_can_request: 'ಬಳಕೆದಾರರು ಈಗ ಮತ್ತೆ ಪಿಕಪ್ ವಿನಂತಿಸಬಹುದು.',
      pickups_blocked: 'ಪಿಕಪ್ ವಿನಂತಿಗಳನ್ನು ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ. ಬಳಕೆದಾರರನ್ನು ಸಮುದಾಯ ಕೇಂದ್ರಗಳಿಗೆ ನಿರ್ದೇಶಿಸಲಾಗುವುದು.',

      language: 'ಭಾಷೆ',
      lang_en: 'English',
      lang_hi: 'हिंदी',
      lang_kn: 'ಕನ್ನಡ',
    }
  };

  // ── Core Functions ───────────────────────────────────────
  function t(key) {
    return (translations[currentLang] && translations[currentLang][key])
      || translations.en[key]
      || key;
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    applyTranslations();
    // Also re-render dynamic content if App is available
    if (typeof App !== 'undefined' && App.onLanguageChange) {
      App.onLanguageChange();
    }
  }

  function getLanguage() {
    return currentLang;
  }

  // ── Apply translations to all data-i18n elements ─────────
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translated;
      } else if (el.tagName === 'OPTION') {
        el.textContent = translated;
      } else {
        el.textContent = translated;
      }
    });

    // Update the language selector display
    const langLabel = document.getElementById('lang-current-label');
    if (langLabel) {
      const labels = { en: 'EN', hi: 'हि', kn: 'ಕ' };
      langLabel.textContent = labels[currentLang] || 'EN';
    }

    // Update HTML lang attribute
    document.documentElement.lang = currentLang === 'hi' ? 'hi' : currentLang === 'kn' ? 'kn' : 'en';
  }

  // ── Toggle dropdown visibility ────────────────────────
  function toggleLangDropdown() {
    const dd = document.getElementById('lang-dropdown');
    if (!dd) return;
    dd.classList.toggle('show');

    // Update active state
    dd.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === currentLang);
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('lang-dropdown');
    const selector = document.getElementById('lang-selector');
    if (dd && selector && !selector.contains(e.target)) {
      dd.classList.remove('show');
    }
  });

  // ── Init: apply on DOM load ──────────────────────────────
  function init() {
    applyTranslations();
  }

  return { t, setLanguage, getLanguage, applyTranslations, init, toggleLangDropdown };
})();
