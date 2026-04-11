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

      // Dynamic Keys (Buttons)
      creating_account_btn: 'Creating account…',
      signing_in_btn: 'Signing in…',
      verifying_btn: 'Verifying…',
      submitting_btn: 'Submitting…',
      waiting_location: 'Waiting for Location...',
      
      // Dynamic Keys (Toasts)
      demo_home_filled: 'Home User demo filled',
      demo_point_filled: 'Point User demo filled',
      demo_driver_filled: 'Demo Driver credentials filled',
      fill_all_fields: 'Please fill in all fields',
      pw_min_6: 'Password must be at least 6 characters',
      pw_mismatch: 'Passwords do not match',
      welcome_user: 'Welcome back, {name}! 👋',
      login_fields_req: 'Please enter email and password',
      driver_login_fields: 'Enter Employee ID and PIN',
      bin_selected_msg: 'Bin selected. Adjust slider to update fill level.',
      set_location_first: 'Please set your location first.',
      status_updated: 'Status updated! +10 points earned.',
      update_failed: 'Update failed. Check connection.',
      route_locked_msg: 'Driver has already locked the route.',
      confirmed_pts: 'Confirmed! +{pts} pts 🎉',
      location_error: 'Please enable location access.',
      not_available_toast: 'Marked as not available. 👋',
      driver_online_toast: 'Driver is Online! Tracking Live. 🚛',
      driver_offline_toast: 'Driver has gone offline.',
      proximity_alert: 'Driver is 20m away! Get bin ready! 🗑️',
      fetching_route_msg: 'Fetching route...',
      route_ready_msg: 'Route ready! {count} active stops',
      route_fetch_failed: 'Route fetch failed. Check token or network.',
      walking_route_gen: 'Walking route to {name} generated',

      // Verification & Reporting
      bin_verified: 'Verified! {name}\'s bin collected. +10 pts awarded. 🎉',
      bin_empty_msg: 'Bin empty at {name}\'s location. No points awarded.',
      verify_error: 'Error submitting verification.',
      morning_alert_sent: 'Morning alert sent to {count} H-Users!',
      notif_error: 'Could not send notification. Check connection.',
      enter_description: 'Please enter a description.',
      issue_reported: 'Issue reported successfully. 🚩',
      report_error: 'Error submitting report.',
      destination_reached: 'Destination Reached! Trip Complete. 🏆',
      
      // History & Profile
      history_loading: 'Loading history...',
      no_history: 'No history recorded yet.',
      no_collection_found: 'No past collections found.',
      shift_morning: 'Shift: Morning Session',
      points_earned_label: 'Points Earned',
      item_redeemed: '{name} redeemed! Check your email. 🎉',
      name_empty_err: 'Name cannot be empty',
      profile_updated: 'Profile updated! ✅',
      location_saved: 'Location saved! 📍',
      reset_complete: 'Global Reset Complete! ({count} users reset)',
      reset_error: 'Error performing global reset.',
      reset_confirm: 'Are you sure you want to reset all user preferences for today?',
      history_error: 'Failed to load history tracking.',
      you: 'You',
      pts_given: 'Pts Given',
      points_required: 'points required',
      balance: 'Balance',
      insufficient: 'Insufficient',
      redeem_now: 'Redeem Now',
      maybe_later: 'Maybe Later',
      submit_report: 'SUBMIT REPORT',
      send_morning_notif: '📢 Send Morning Notification to H-Users',
      open_config_hint: 'Open public/js/config.js and replace token.',
      demo_mode_label: '(Demo Mode)',
      no_active_locations: 'No active locations needing pickup today',
      driver_view: 'Driver View',
      community_map: 'Community Map',
      youre_active_today: "You're Active Today!",
      bin_confirmed: 'Bin confirmed for pickup.',
      done: 'Done',
      not_available_today: 'Not Available Today',
      bin_not_collected: 'Bin will not be collected today.',
      change: 'Change',
      confirm_todays_pickup: "Confirm today's pickup",
      tap_to_confirm: 'Let us know your bin is ready.',
      confirm: 'Confirm',
      home_user_label: 'Home User',
      point_user_label: 'Point User',
      driver_mode: '🚛 Driver Mode',
      block_pickups: '🔒 Block User Pickup Requests',
      unblock_pickups: '🔓 Unblock Pickups',
      go_online: '📍 Go Online (Share Location)',
      go_offline: '🛑 Go Offline',

      // Verification Modals (Driver)
      bin_checkpoint_title: '🗑️ Bin Checkpoint',
      waste_question: 'Was there waste / dust at this collection point?',
      waste_yes_btn: '✅ Yes — Waste was collected',
      waste_no_btn: '❌ No — Bin was empty',
      pts_info: 'User earns 10 pts if you confirm waste was collected',
      
      // Issue Reporting
      report_issue_title: '🚩 Report Issue',
      report_help_text: 'Help us keep the route efficient by reporting obstacles or bin issues.',
      issue_type_label: 'Issue Type',
      bin_issue_opt: '🗑️ Bin Overflow / Damaged',
      road_issue_opt: '🚧 Road Block / Construction',
      user_complaint_opt: '👤 User Complaint / Issue',
      other_issue_opt: '❓ Other',
      description_label: 'Description',
      submit_report_btn: 'Submit Report',

      // Trip Summary
      trip_complete_title: '🏁 Trip Complete!',
      great_job_msg: 'Great job today!',
      collection_summary_msg: 'Here is your collection summary',
      pickups_label: 'Pickups',
      efficiency_label: 'Efficiency',
      done_today_btn: 'Done for today',

      // Voice Feedback
      voice_feedback: 'Voice Feedback (Beta)',
      voice_settings: 'Accessibility & Voice',
      nav_home_speak: 'Switching to Home',
      nav_map_speak: 'Opening Map',
      nav_history_speak: 'Viewing History',
      nav_rewards_speak: 'Opening Rewards',
      nav_chat_speak: 'Opening EcoBot Chat',
      nav_profile_speak: 'Opening Profile',
      location_sharing_active: 'Location sharing is now active',
      location_sharing_inactive: 'Location sharing paused',

      // Map & Popups
      map_not_configured: 'Map Not Configured',
      house_label: 'House',
      bin_label: 'Bin',
      fill_level_label: 'Fill Level',
      map_summary: '{hCount} Houses | {bCount} Bins',

      // Notifications
      notif_driver_assigned_title: 'EcoRoute - Driver Assigned',
      notif_driver_assigned_body: 'Your driver is on the route and heading to your area!',
      notif_driver_nearby_title: 'EcoRoute — Driver Nearby!',
      notif_driver_nearby_body: 'Your driver is less than 20 meters away.',
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

      // Dynamic Keys (Buttons)
      creating_account_btn: 'खाता बनाया जा रहा है...',
      signing_in_btn: 'साइन इन हो रहा है...',
      verifying_btn: 'सत्यापित किया जा रहा है...',
      submitting_btn: 'सबमिट किया जा रहा है...',
      waiting_location: 'स्थान की प्रतीक्षा है...',

      // Dynamic Keys (Toasts)
      demo_home_filled: 'होम उपयोगकर्ता डेमो भरा गया',
      demo_point_filled: 'पॉइंट उपयोगकर्ता डेमो भरा गया',
      demo_driver_filled: 'डेमो ड्राइवर क्रेडेंशियल्स भरे गए',
      fill_all_fields: 'कृपया सभी फ़ील्ड भरें',
      pw_min_6: 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए',
      pw_mismatch: 'पासवर्ड मेल नहीं खाते',
      welcome_user: 'वापसी पर स्वागत है, {name}! 👋',
      login_fields_req: 'कृपया ईमेल और पासवर्ड दर्ज करें',
      driver_login_fields: 'कर्मचारी आईडी और पिन दर्ज करें',
      bin_selected_msg: 'बिन चुना गया। भराव स्तर अपडेट करने के लिए स्लाइडर का उपयोग करें।',
      set_location_first: 'कृपया पहले अपना स्थान सेट करें।',
      status_updated: 'स्थिति अपडेट की गई! +10 अंक अर्जित किए।',
      update_failed: 'अपडेट विफल रहा। कनेक्शन जांचें।',
      route_locked_msg: 'ड्राइवर ने पहले ही मार्ग लॉक कर दिया है।',
      confirmed_pts: 'पुष्टि की गई! +{pts} अंक 🎉',
      location_error: 'कृपया स्थान पहुंच सक्षम करें।',
      not_available_toast: 'उपलब्ध नहीं के रूप में चिह्नित किया गया। 👋',
      driver_online_toast: 'ड्राइवर ऑनलाइन है! लाइव ट्रैकिंग। 🚛',
      driver_offline_toast: 'ड्राइवर ऑफ़लाइन हो गया है।',
      proximity_alert: 'ड्राइवर 20 मीटर दूर है! बिन तैयार रखें! 🗑️',
      fetching_route_msg: 'मार्ग प्राप्त किया जा रहा है...',
      route_ready_msg: 'मार्ग तैयार! {count} सक्रिय स्टॉप',
      route_fetch_failed: 'मार्ग प्राप्त करना विफल रहा। टोकन या नेटवर्क जांचें।',
      walking_route_gen: '{name} के लिए पैदल मार्ग तैयार',

      // Verification & Reporting
      bin_verified: 'सत्यापित! {name} का बिन एकत्र किया गया। +10 अंक दिए गए। 🎉',
      bin_empty_msg: '{name} के स्थान पर बिन खाली है। कोई अंक नहीं दिए गए।',
      verify_error: 'सत्यापन सबमिट करने में त्रुटि।',
      morning_alert_sent: '{count} होम-उपयोगकर्ताओं को सुबह का अलर्ट भेजा गया!',
      notif_error: 'सूचना नहीं भेजी जा सकी। कनेक्शन जांचें।',
      enter_description: 'कृपया विवरण दर्ज करें।',
      issue_reported: 'समस्या की रिपोर्ट सफलतापूर्वक की गई। 🚩',
      report_error: 'रिपोर्ट सबमिट करने में त्रुटि।',
      destination_reached: 'गंतव्य तक पहुँच गए! यात्रा पूरी। 🏆',

      // History & Profile
      history_loading: 'इतिहास लोड हो रहा है...',
      no_history: 'अभी तक कोई इतिहास दर्ज नहीं है।',
      no_collection_found: 'कोई पिछला संग्रह नहीं मिला।',
      shift_morning: 'शिफ्ट: सुबह का सत्र',
      points_earned_label: 'अर्जित अंक',
      item_redeemed: '{name} रिडीम किया गया! अपना ईमेल जांचें। 🎉',
      name_empty_err: 'नाम खाली नहीं हो सकता',
      profile_updated: 'प्रोफ़ाइल अपडेट की गई! ✅',
      location_saved: 'स्थान सहेजा गया! 📍',
      reset_complete: 'ग्लोबल रीसेट पूरा! ({count} उपयोगकर्ता रीसेट)',
      reset_error: 'ग्लोबल रीसेट करने में त्रुटि।',
      reset_confirm: 'क्या आप वाकई आज के लिए सभी उपयोगकर्ता प्राथमिकताएं रीसेट करना चाहते हैं?',
      history_error: 'इतिहास ट्रैकिंग लोड करने में विफल।',
      you: 'आप',
      pts_given: 'दिए गए अंक',
      points_required: 'अंकों की आवश्यकता',
      balance: 'शेष राशि',
      insufficient: 'अपर्याप्त',
      redeem_now: 'अभी रिडीम करें',
      maybe_later: 'शायद बाद में',
      submit_report: 'रिपोर्ट जमा करें',
      send_morning_notif: '📢 उपयोगकर्ताओं को सूचना भेजें',
      open_config_hint: 'public/js/config.js खोलें और टोकन बदलें।',
      demo_mode_label: '(डेमो मोड)',
      no_active_locations: 'आज संग्रह की आवश्यकता वाला कोई सक्रिय स्थान नहीं है',
      driver_view: 'ड्राइवर दृश्य',
      community_map: 'सಮುದಾಯ मानचित्र',
      youre_active_today: "आप आज सक्रिय हैं!",
      bin_confirmed: 'बिन संग्रह के लिए पुष्टि की गई।',
      done: 'हो गया',
      not_available_today: 'आज उपलब्ध नहीं है',
      bin_not_collected: 'बिन आज एकत्र नहीं किया जाएगा।',
      change: 'बदलें',
      confirm_todays_pickup: "आज के पिकअप की पुष्टि करें",
      tap_to_confirm: 'हमें बताएं कि आपका बिन तैयार है।',
      confirm: 'पुष्टि करें',
      home_user_label: 'होम उपयोगकर्ता',
      point_user_label: 'पॉइंट उपयोगकर्ता',
      driver_mode: '🚛 ड्राइवर मोड',
      block_pickups: '🔒 पिकअप अनुरोधों को ब्लॉक करें',
      unblock_pickups: '🔓 पिकअप अनब्लॉक करें',
      go_online: '📍 ऑनलाइन जाएं (लोकेशन शेयर करें)',
      go_offline: '🛑 ऑफलाइन जाएं',

      // Verification Modals (Driver)
      bin_checkpoint_title: '🗑️ बिन चेकप्वाइंट',
      waste_question: 'क्या इस संग्रह बिंदु पर कचरा / धूल थी?',
      waste_yes_btn: '✅ हाँ — कचरा एकत्र किया गया था',
      waste_no_btn: '❌ नहीं — बिन खाली था',
      pts_info: 'यदि आप कचरा एकत्र होने की पुष्टि करते हैं तो उपयोगकर्ता 10 अंक अर्जित करता है',

      // Issue Reporting
      report_issue_title: '🚩 समस्या की रिपोर्ट करें',
      report_help_text: 'बाधाओं या बिन समस्याओं की रिपोर्ट करके मार्ग को कुशल बनाए रखने में हमारी सहायता करें।',
      issue_type_label: 'समस्या का प्रकार',
      bin_issue_opt: '🗑️ बिन ओवरफ्लो / क्षतिग्रस्त',
      road_issue_opt: '🚧 रोड ब्लॉक / निर्माण',
      user_complaint_opt: '👤 उपयोगकर्ता शिकायत / समस्या',
      other_issue_opt: '❓ अन्य',
      description_label: 'विवरण',
      submit_report_btn: 'रिपोर्ट सबमिट करें',

      // Trip Summary
      trip_complete_title: '🏁 यात्रा पूरी!',
      great_job_msg: 'आज बहुत अच्छा काम किया!',
      collection_summary_msg: 'यहाँ आपका संग्रह सारांश है',
      pickups_label: 'पिकअप',
      efficiency_label: 'दक्षता',
      done_today_btn: 'आज के लिए हो गया',

      // Voice Feedback
      voice_feedback: 'आवाज फीडबैक (बीटा)',
      voice_settings: 'पहुंच और आवाज',
      nav_home_speak: 'होम पर जा रहे हैं',
      nav_map_speak: 'नक्शा खोल रहे हैं',
      nav_history_speak: 'इतिहास देख रहे हैं',
      nav_rewards_speak: 'पुरस्कार खोल रहे हैं',
      nav_chat_speak: 'इकोबॉट चैट खोल रहे हैं',
      nav_profile_speak: 'प्रोफाइल खोल रहे हैं',
      location_sharing_active: 'लोकेशन शेयरिंग अब सक्रिय है',
      location_sharing_inactive: 'लोकेशन शेयरिंग रुकी हुई है',

      // Map & Popups
      map_not_configured: 'मानचित्र कॉन्फ़िगर नहीं किया गया',
      house_label: 'घर',
      bin_label: 'बिन',
      fill_level_label: 'भराव स्तर',
      map_summary: '{hCount} घर | {bCount} बिन',

      // Notifications
      notif_driver_assigned_title: 'EcoRoute - ड्राइवर असाइन किया गया',
      notif_driver_assigned_body: 'आपका ड्राइवर मार्ग पर है और आपके क्षेत्र की ओर आ रहा है!',
      notif_driver_nearby_title: 'EcoRoute — ड्राइवर पास है!',
      notif_driver_nearby_body: 'आपका ड्राइवर 20 मीटर से भी कम दूरी पर है।',
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

      // Dynamic Keys (Buttons)
      creating_account_btn: 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...',
      signing_in_btn: 'ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ...',
      verifying_btn: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
      submitting_btn: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
      waiting_location: 'ಸ್ಥಳಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...',

      // Dynamic Keys (Toasts)
      demo_home_filled: 'ಹೋಮ್ ಬಳಕೆದಾರರ ಡೆಮೊ ತುಂಬಿದೆ',
      demo_point_filled: 'ಪಾಯಿಂಟ್ ಬಳಕೆದಾರರ ಡೆಮೊ ತುಂಬಿದೆ',
      demo_driver_filled: 'ಡೆಮೊ ಚಾಲಕ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ',
      fill_all_fields: 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ',
      pw_min_6: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು',
      pw_mismatch: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ',
      welcome_user: 'ಕುಶಲವೇ ಸ್ವಾಗತ, {name}! 👋',
      login_fields_req: 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',
      driver_login_fields: 'ಉದ್ಯೋಗಿ ಐಡಿ ಮತ್ತು ಪಿನ್ ನಮೂದಿಸಿ',
      bin_selected_msg: 'ಬಿನ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಭರ್ತಿ ಮಟ್ಟವನ್ನು ಅಪ್‌ಡೇಟ್ ಮಾಡಲು ಸ್ಲೈಡರ್ ಬಳಸಿ.',
      set_location_first: 'ದಯವಿಟ್ಟು ಮೊದಲು ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹೊಂದಿಸಿ.',
      status_updated: 'ಸ್ಥಿತಿ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ! +10 ಅಂಕಗಳನ್ನು ಗಳಿಸಲಾಗಿದೆ.',
      update_failed: 'ಅಪ್‌ಡೇಟ್ ವಿಫಲವಾಗಿದೆ. ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      route_locked_msg: 'ಚಾಲಕ ಈಗಾಗಲೇ ಮಾರ್ಗವನ್ನು ಲಾಕ್ ಮಾಡಿದ್ದಾರೆ.',
      confirmed_pts: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ! +{pts} ಅಂಕಗಳು 🎉',
      location_error: 'ದಯವಿಟ್ಟು ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.',
      not_available_toast: 'ಲಭ್ಯವಿಲ್ಲ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ. 👋',
      driver_online_toast: 'ಚಾಲಕ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾರೆ! ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್. 🚛',
      driver_offline_toast: 'ಚಾಲಕ ಆಫ್‌ಲೈನ್ ಆಗಿದ್ದಾರೆ.',
      proximity_alert: 'ಚಾಲಕ 20 ಮೀಟರ್ ದೂರದಲ್ಲಿದ್ದಾರೆ! ಬಿನ್ ಸಿದ್ಧಪಡಿಸಿ! 🗑️',
      fetching_route_msg: 'ಮಾರ್ಗವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...',
      route_ready_msg: 'ಮಾರ್ಗ ಸಿದ್ಧವಾಗಿದೆ! {count} ಸಕ್ರಿಯ ನಿಲ್ದಾಣಗಳು',
      route_fetch_failed: 'ಮಾರ್ಗ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ. ಟೋಕನ್ ಅಥವಾ ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ.',
      walking_route_gen: '{name} ಗೆ ನಡಿಗೆ ಮಾರ್ಗ ರಚಿಸಲಾಗಿದೆ',

      // Verification & Reporting
      bin_verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ! {name} ಅವರ ಬಿನ್ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ. +10 ಅಂಕ ನೀಡಲಾಗಿದೆ. 🎉',
      bin_empty_msg: '{name} ಅವರ ಸ್ಥಳದಲ್ಲಿ ಬಿನ್ ಖಾಲಿ ಇದೆ. ಯಾವುದೇ ಅಂಕಗಳಿಲ್ಲ.',
      verify_error: 'ಪರಿಶೀಲನೆ ಸಲ್ಲಿಸುವಲ್ಲಿ ದೋಷ.',
      morning_alert_sent: '{count} ಮನೆ-ಬಳಕೆದಾರರಿಗೆ ಬೆಳಗಿನ ಅಲರ್ಟ್ ಕಳುಹಿಸಲಾಗಿದೆ!',
      notif_error: 'ಅಧಿಸೂಚನೆ ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಸಂಪರ್ಕ ಸಂಪರ್ಕಿಸಿ.',
      enter_description: 'ದಯವಿಟ್ಟು ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ.',
      issue_reported: 'ಸಮಸ್ಯೆ ವರದಿ ಯಶಸ್ವಿಯಾಗಿದೆ. 🚩',
      report_error: 'ವರದಿ ಸಲ್ಲಿಸುವಲ್ಲಿ ದೋಷ.',
      destination_reached: 'ಗುರಿ ತಲುಪಲಾಗಿದೆ! ಪ್ರಯಾಣ ಪೂರ್ಣಗೊಂಡಿದೆ. 🏆',

      // History & Profile
      history_loading: 'ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      no_history: 'ಇನ್ನೂ ಯಾವುದೇ ಇತಿಹಾಸ ದಾಖಲಾಗಿಲ್ಲ.',
      no_collection_found: 'ಯಾವುದೇ ಹಿಂದಿನ ಸಂಗ್ರಹಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      shift_morning: 'ಶಿಫ್ಟ್: ಬೆಳಗಿನ ಅವಧಿ',
      points_earned_label: 'ಗಳಿಸಿದ ಅಂಕಗಳು',
      item_redeemed: '{name} ರಿಡೀಮ್ ಮಾಡಲಾಗಿದೆ! ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ. 🎉',
      name_empty_err: 'ಹೆಸರು ಖಾಲಿಯಿರಬಾರದು',
      profile_updated: 'ಪ್ರೊಫೈಲ್ ಅಪ್‌ಡೇಟ್ ಆಗಿದೆ! ✅',
      location_saved: 'ಸ್ಥಳ ಉಳಿಸಲಾಗಿದೆ! 📍',
      reset_complete: 'ಜಾಗತಿಕ ಮರುಹೊಂದಿಸುವಿಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ! ({count} ಬಳಕೆದಾರರು)',
      reset_error: 'ಜಾಗತಿಕ ಮರುಹೊಂದಿಸುವಿಕೆಯಲ್ಲಿ ದೋಷ.',
      reset_confirm: 'ಇಂದಿನ ಎಲ್ಲಾ ಬಳಕೆದಾರರ ಆದ್ಯತೆಗಳನ್ನು ಮರುಹೊಂದಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?',
      history_error: 'ಇತಿಹಾಸ ಟ್ರ್ಯಾಕಿಂಗ್ ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.',
      you: 'ನೀವು',
      pts_given: 'ನೀಡಿದ ಅಂಕಗಳು',
      points_required: 'ಅಂಕಗಳ ಅಗತ್ಯವಿದೆ',
      balance: 'ಬಾಕಿ',
      insufficient: 'ಅಪೂರ್ಣ',
      redeem_now: 'ಈಗ ರಿಡೀಮ್ ಮಾಡಿ',
      maybe_later: 'ನಂತರ ನೋಡೋಣ',
      submit_report: 'ವರದಿಯನ್ನು ಸಲ್ಲಿಸಿ',
      send_morning_notif: '📢 ಬಳಕೆದಾರರಿಗೆ ಅಲರ್ಟ್ ಕಳುಹಿಸಿ',
      open_config_hint: 'public/js/config.js ತೆರೆಯಿರಿ ಮತ್ತು ಟೋಕನ್ ಬದಲಾಯಿಸಿ.',
      demo_mode_label: '(ಡೆಮೊ ಮೋಡ್)',
      no_active_locations: 'ಇಂದು ಸಂಗ್ರಹಿಸಲು ಯಾವುದೇ ಸಕ್ರಿಯ ಸ್ಥಳಗಳಿಲ್ಲ',
      driver_view: 'ಚಾಲಕನ ನೋಟ',
      community_map: 'ಸಮುದಾಯ ನಕ್ಷೆ',
      youre_active_today: "ನೀವು ಇಂದು ಸಕ್ರಿಯರಾಗಿದ್ದೀರಿ!",
      bin_confirmed: 'ಬಿನ್ ಪಿಕಪ್‌ಗಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.',
      done: 'ಮುಗಿಯಿತು',
      not_available_today: 'ಇಂದು ಲಭ್ಯವಿಲ್ಲ',
      bin_not_collected: 'ಬಿನ್ ಇಂದು ಸಂಗ್ರಹವಾಗುವುದಿಲ್ಲ.',
      change: 'ಬದಲಾಯಿಸಿ',
      confirm_todays_pickup: "ಇಂದಿನ ಪಿಕಪ್ ದೃಢೀಕರಿಸಿ",
      tap_to_confirm: 'ನಿಮ್ಮ ಬಿನ್ ಸಿದ್ಧವಾಗಿದೆ ಎಂದು ತಿಳಿಸಿ.',
      confirm: 'ದೃಢೀಕರಿಸಿ',
      home_user_label: 'ಹೋಮ್ ಬಳಕೆದಾರ',
      point_user_label: 'ಪಾಯಿಂಟ್ ಬಳಕೆದಾರ',
      driver_mode: '🚛 ಚಾಲಕ ಮೋಡ್',
      block_pickups: '🔒 ಪಿಕಪ್ ವಿನಂತಿ ನಿರ್ಬಂಧಿಸಿ',
      unblock_pickups: '🔓 ಪಿಕಪ್ ಅನ್ಬ್ಲಾಕ್ ಮಾಡಿ',
      go_online: '📍 ಆನ್‌ಲೈನ್‌ಗೆ ಹೋಗಿ (ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ)',
      go_offline: '🛑 ಆಫ್‌ಲೈನ್‌ಗೆ ಹೋಗಿ',

      // Verification Modals (Driver)
      bin_checkpoint_title: '🗑️ ಬಿನ್ ಚೆಕ್‌ಪಾಯಿಂಟ್',
      waste_question: 'ಈ ಸಂಗ್ರಹಣಾ ಕೇಂದ್ರದಲ್ಲಿ ಕಸ / ಧೂಳು ಇತ್ತೇ?',
      waste_yes_btn: '✅ ಹೌದು — ಕಸವನ್ನು ಸಂಗ್ರಹಿಸಲಾಗಿದೆ',
      waste_no_btn: '❌ ಇಲ್ಲ — ಬಿನ್ ಖಾಲಿಯಿತ್ತು',
      pts_info: 'ಕಸ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ ಎಂದು ನೀವು ದೃಢಪಡಿಸಿದರೆ ಬಳಕೆದಾರರು 10 ಅಂಕಗಳನ್ನು ಪಡೆಯುತ್ತಾರೆ',

      // Issue Reporting
      report_issue_title: '🚩 ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      report_help_text: 'ಅಡೆತಡೆಗಳು ಅಥವಾ ಬಿನ್ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡುವ ಮೂಲಕ ಮಾರ್ಗವನ್ನು ದಕ್ಷವಾಗಿಡಲು ನಮಗೆ ಸಹಾಯ ಮಾಡಿ.',
      issue_type_label: 'ಸಮಸ್ಯೆಯ ವಿಧ',
      bin_issue_opt: '🗑️ ಬಿನ್ ತುಂಬಿ ಹರಿಯುತ್ತಿದೆ / ಹಾನಿಗೊಳಗಾಗಿದೆ',
      road_issue_opt: '🚧 ರಸ್ತೆ ಬ್ಲಾಕ್ / ನಿರ್ಮಾಣ',
      user_complaint_opt: '👤 ಬಳಕೆದಾರರ ದೂರು / ಸಮಸ್ಯೆ',
      other_issue_opt: '❓ ಇತರೆ',
      description_label: 'ವಿವರಣೆ',
      submit_report_btn: 'ವರದಿ ಸಲ್ಲಿಸಿ',

      // Trip Summary
      trip_complete_title: '🏁 ಪ್ರಯಾಣ ಪೂರ್ಣ!',
      great_job_msg: 'ಇಂದು ಅದ್ಭುತ ಕೆಲಸ!',
      collection_summary_msg: 'ಇಲ್ಲಿ ನಿಮ್ಮ ಸಂಗ್ರಹಣಾ ಸಾರಾಂಶವಿದೆ',
      pickups_label: 'ಪಿಕಪ್‌ಗಳು',
      accuracy_label: 'Accuracy',
      done_today_btn: 'Done for today',

      // Voice Feedback
      voice_feedback: 'Voice Feedback 🔊',
      voice_settings: 'Accessibility & Voice',
      nav_home_speak: 'ಹೋಮ್‌ಗೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ',
      nav_map_speak: 'ನಕ್ಷೆಯನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ',
      nav_history_speak: 'ಇತಿಹಾಸವನ್ನು ವೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ',
      nav_rewards_speak: 'ಬಹುಮಾನಗಳನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ',
      nav_chat_speak: 'ಇಕೋಬಾಟ್ ಚಾಟ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
      nav_profile_speak: 'ಪ್ರೊಫೈಲ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ',
      location_sharing_active: 'ಸ್ಥಳ ಹಂಚಿಕೆ ಈಗ ಸಕ್ರಿಯವಾಗಿದೆ',
      location_sharing_inactive: 'ಸ್ಥಳ ಹಂಚಿಕೆಯನ್ನು ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ',

      // Map & Popups
      map_not_configured: 'ನಕ್ಷೆ ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ',
      house_label: 'ಮನೆ',
      bin_label: 'ಬಿನ್',
      fill_level_label: 'ಭರ್ತಿ ಮಟ್ಟ',
      map_summary: '{hCount} ಮನೆಗಳು | {bCount} ಬಿನ್‌ಗಳು',

      // Notifications
      notif_driver_assigned_title: 'EcoRoute - ಚಾಲಕನನ್ನು ನಿಯೋಜಿಸಲಾಗಿದೆ',
      notif_driver_assigned_body: 'ನಿಮ್ಮ ಚಾಲಕ ಮಾರ್ಗದಲ್ಲಿದ್ದಾರೆ ಮತ್ತು ನಿಮ್ಮ ಪ್ರದೇಶದ ಕಡೆಗೆ ಬರುತ್ತಿದ್ದಾರೆ!',
      notif_driver_nearby_title: 'EcoRoute — ಚಾಲಕ ಹತ್ತಿರವಿದ್ದಾರೆ!',
      notif_driver_nearby_body: 'ನಿಮ್ಮ ಚಾಲಕ 20 ಮೀಟರ್‌ಗಿಂತ ಕಡಿಮೆ ದೂರದಲ್ಲಿದ್ದಾರೆ.',
    }
  };

  // ── Core Functions ───────────────────────────────────────
  function t(key, params = {}) {
    let text = (translations[currentLang] && translations[currentLang][key])
      || translations.en[key]
      || key;

    // Simple interpolation: replaces {name} with params.name
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });

    return text;
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

  // ── Text To Speech (TTS) ─────────────────────────────
  let speakEnabled = localStorage.getItem('eco_voice_feedback') === 'true';

  function setVoiceEnabled(bool) {
    speakEnabled = bool;
    localStorage.setItem('eco_voice_feedback', bool);
  }

  function captureClickForTTS() {
    // Some browsers require a user gesture to init speech
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  }

  function speak(text) {
    if (!speakEnabled || !('speechSynthesis' in window)) return;

    console.log(`[TTS] Speaking: "${text}" [${currentLang}]`);

    // Cancel existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to pick a localized voice
    const voices = window.speechSynthesis.getVoices();
    const langMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
    const targetLang = langMap[currentLang] || 'en-US';

    // Find direct match or start-with match
    let voice = voices.find(v => v.lang === targetLang) || 
                voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    
    if (voice) utterance.voice = voice;
    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }

  // Pre-fetch voices (Chrome needs this)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = speechSynthesis.getVoices;
    }
  }

  function init() {
    applyTranslations();
  }

  return { t, setLanguage, getLanguage, applyTranslations, init, toggleLangDropdown, speak, setVoiceEnabled, isVoiceEnabled: () => speakEnabled, captureClickForTTS };
})();
