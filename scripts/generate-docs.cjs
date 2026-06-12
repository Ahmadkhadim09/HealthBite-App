const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 60, bottom: 60, left: 65, right: 65 },
  info: {
    Title: 'Health Bite – Project Documentation',
    Author: 'Muhammad Ahmad & Aimen Khawaja Zahid',
  },
});

const OUT = path.join(__dirname, '..', 'L1F23BSSE0201_ProjectDocument.pdf');
doc.pipe(fs.createWriteStream(OUT));

// ─── Colours ───────────────────────────────────────────────────────────────
const GREEN  = '#2DB87A';
const BLACK  = '#0A0A0A';
const DARK   = '#1A1A1A';
const MUTED  = '#555555';
const WHITE  = '#FFFFFF';
const LIGHT  = '#F5F5F5';

// ─── Helpers ────────────────────────────────────────────────────────────────
const PW = doc.page.width  - doc.page.margins.left - doc.page.margins.right;

function headerBar() {
  doc.rect(0, 0, doc.page.width, 10).fill(GREEN);
}

function footerBar(pageNum) {
  const y = doc.page.height - 40;
  doc.rect(0, y, doc.page.width, 40).fill(BLACK);
  doc.font('Helvetica').fontSize(9).fillColor(WHITE)
     .text('Health Bite  |  Advance Web Programming – Assignment 4  |  Spring 2026', 65, y + 14, { width: PW - 80, align: 'left' });
  doc.text(`Page ${pageNum}`, 0, y + 14, { width: doc.page.width - 65, align: 'right' });
}

function addPage(pageNum) {
  doc.addPage();
  headerBar();
  footerBar(pageNum);
}

function sectionTitle(text) {
  doc.moveDown(0.6);
  const y = doc.y;
  doc.rect(doc.page.margins.left, y, 4, 22).fill(GREEN);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(BLACK)
     .text(text, doc.page.margins.left + 12, y + 3);
  doc.moveDown(0.5);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.margins.left + PW, doc.y)
     .strokeColor('#E0E0E0').lineWidth(0.5).stroke();
  doc.moveDown(0.4);
}

function body(text, opts = {}) {
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK)
     .text(text, doc.page.margins.left, doc.y, { width: PW, align: 'justify', lineGap: 3, ...opts });
  doc.moveDown(0.3);
}

function bullet(text, indent = 0) {
  const x = doc.page.margins.left + indent;
  const bx = x;
  const tx = x + 14;
  const y = doc.y;
  doc.circle(bx + 3, y + 5, 2.5).fill(GREEN);
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK)
     .text(text, tx, y, { width: PW - indent - 14, lineGap: 3 });
  doc.moveDown(0.15);
}

function subheading(text) {
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK).text(text);
  doc.moveDown(0.2);
}

function infoRow(label, value) {
  const y = doc.y;
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(MUTED)
     .text(label + ':', doc.page.margins.left, y, { continued: false, width: 160 });
  doc.font('Helvetica').fontSize(10.5).fillColor(DARK)
     .text(value, doc.page.margins.left + 165, y - doc.currentLineHeight(true), { width: PW - 165 });
  doc.moveDown(0.35);
}

function tag(text, x, y) {
  const w = doc.widthOfString(text) + 16;
  doc.roundedRect(x, y, w, 18, 4).fill(GREEN);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE).text(text, x + 8, y + 4);
  return w + 6;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════
headerBar();
footerBar(1);

// Big green hero block
doc.rect(0, 10, doc.page.width, 220).fill(BLACK);
doc.circle(doc.page.width - 80, 60, 120).fill('#111');
doc.circle(80, 180, 80).fill('#111');

// Logo icon placeholder
doc.roundedRect(doc.page.margins.left, 40, 60, 60, 12).fill(GREEN);
doc.font('Helvetica-Bold').fontSize(30).fillColor(WHITE)
   .text('HB', doc.page.margins.left + 10, 58);

// Title
doc.font('Helvetica-Bold').fontSize(32).fillColor(WHITE)
   .text('Health Bite', doc.page.margins.left, 116, { lineGap: 4 });
doc.font('Helvetica').fontSize(14).fillColor('rgba(255,255,255,0.6)')
   .text('Personalized Calorie & Restaurant Recommendation App', doc.page.margins.left, 153, { width: PW });

// Divider
doc.moveTo(doc.page.margins.left, 238).lineTo(doc.page.margins.left + PW, 238)
   .strokeColor('#E0E0E0').lineWidth(0.5).stroke();

// Student info table
doc.y = 256;
const fields = [
  ['Project Title',     'Health Bite – Personalized Calorie & Restaurant Recommendation App'],
  ['Student 1',        'Muhammad Ahmad'],
  ['Reg. No. 1',       'L1F23BSSE0201'],
  ['Student 2',        'Aimen Khawaja Zahid'],
  ['Reg. No. 2',       'L1F23BSSE0219'],
  ['Section',          'F5'],
  ['Course',           'Advance Web Programming'],
  ['Semester',         'Spring 2026'],
  ['Submission Date',  '17th June 2026'],
];
fields.forEach(([l, v]) => infoRow(l, v));

// Tags row
doc.moveDown(0.6);
let tx = doc.page.margins.left;
const ty = doc.y;
['React Native', 'Expo', 'OpenStreetMap', 'TheMealDB API', 'TypeScript'].forEach(t => {
  tx += tag(t, tx, ty) + 4;
});

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 2 — Overview + Problem Statement + Objectives
// ═══════════════════════════════════════════════════════════════════════════
addPage(2);
doc.y = 28;

sectionTitle('1.  Project Overview');
body(
  'Health Bite is a cross-platform mobile application built with React Native (Expo) that helps users make informed food choices by calculating their daily calorie requirements and recommending nearby restaurants that match those targets. The app follows a simple, guided flow: users create an account, enter their physical metrics and fitness goal, receive a personalised TDEE (Total Daily Energy Expenditure) calculation, and are shown real local restaurants whose meals align with their calorie budget.'
);
body(
  'The application targets university students and health-conscious individuals who want practical, location-aware meal guidance without requiring a complex nutrition background. It bridges the gap between health science (Mifflin-St Jeor equation, BMI, TDEE) and everyday dining decisions.'
);
infoRow('Application Type', 'Mobile Application (iOS & Android via Expo Go)');
infoRow('Target Users',     'University students, fitness beginners, health-conscious individuals');

sectionTitle('2.  Problem Statement');
body(
  'Modern individuals, especially students with busy schedules, struggle to align their daily eating habits with their health and fitness goals. Existing calorie-counting apps require extensive manual food logging, and restaurant finder apps show no nutritional context. There is no unified solution that:'
);
bullet('Calculates a personalised calorie target based on the user\'s body metrics and goal (lose / maintain / gain)');
bullet('Shows a BMI score with visual feedback and actionable health advice');
bullet('Recommends real, nearby restaurants filtered to the user\'s calorie budget');
bullet('Allows restaurant owners to register and reach calorie-conscious customers');
body('This gap results in uninformed food choices, wasted effort, and poor adherence to health goals.');

sectionTitle('3.  Project Objectives');
bullet('Implement secure user registration and login with persistent session management');
bullet('Collect key physical metrics (age, weight, height, gender, activity level, fitness goal)');
bullet('Calculate TDEE using the Mifflin-St Jeor equation and adjust based on the selected goal');
bullet('Compute and display BMI with a colour-coded visual scale and personalised health tip');
bullet('Fetch real nearby restaurants using the free Overpass (OpenStreetMap) API');
bullet('Fall back to TheMealDB category-based meal suggestions when location is unavailable');
bullet('Allow restaurant owners to register their business and appear in user recommendations');
bullet('Provide a restaurant detail screen with website link and phone-call functionality');
bullet('Deliver a polished, dark-themed UI inspired by industry-leading apps (Uber, etc.)');

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 3 — Scope + Functional Requirements
// ═══════════════════════════════════════════════════════════════════════════
addPage(3);
doc.y = 28;

sectionTitle('4.  Scope of the Project');
subheading('Features Included');
bullet('User authentication (sign up, login, session persistence, logout)');
bullet('Profile setup: age, weight, height, gender, activity level, fitness goal');
bullet('TDEE calculation (Mifflin-St Jeor × activity multiplier)');
bullet('Goal-based calorie adjustment (−500 / 0 / +300 kcal)');
bullet('BMI calculation with colour-coded scale bar and health category');
bullet('GPS-based restaurant discovery (3 km radius via Overpass API)');
bullet('TheMealDB fallback with TDEE-matched meal categories');
bullet('Restaurant detail screen: meal info, calorie estimate, star rating, website, phone');
bullet('Restaurant registration portal for business owners');
bullet('Registered restaurants displayed first with "Partner" badge');
bullet('Dark Uber-inspired UI with Inter font, green accent, animated landing screen');

subheading('Features Excluded (Future Work)');
bullet('Backend database / cloud sync (currently uses on-device AsyncStorage only)');
bullet('Social features (share meals, follow friends)');
bullet('Full nutritional breakdown (macros, vitamins, allergens)');
bullet('In-app restaurant booking or ordering');
bullet('Push notifications for meal reminders');

sectionTitle('5.  Functional Requirements');

subheading('FR-1  Authentication');
bullet('Users can register with name, email, and password (≥6 characters)');
bullet('Users can log in with email and password');
bullet('Session is persisted across app restarts using AsyncStorage');
bullet('Users can log out, which clears all local session data');

subheading('FR-2  Profile & Metrics');
bullet('Users enter age (10–100), weight (kg), height (cm), gender, activity level');
bullet('Users select a fitness goal: Lose Weight, Maintain, or Gain Muscle');
bullet('Profile is saved locally and reloaded on next launch');

subheading('FR-3  Calorie & BMI Calculation');
bullet('TDEE calculated using Mifflin-St Jeor BMR × activity multiplier');
bullet('Adjusted target: Lose −500 kcal · Maintain ±0 · Gain +300 kcal');
bullet('BMI = weight(kg) ÷ height(m)²; categorised as Underweight/Normal/Overweight/Obese');

subheading('FR-4  Restaurant Recommendations');
bullet('App requests foreground location permission from the device');
bullet('Sends Overpass QL query; returns restaurants within 3 km');
bullet('Each card shows: restaurant name, meal name, estimated calories, star rating');
bullet('Cards are tappable and open a full detail screen');

subheading('FR-5  Restaurant Registration');
bullet('Business owners fill a form: name, cuisine, address, city, phone, website, hours, price range, description');
bullet('Data stored locally; registered restaurants appear first in results with Partner badge');

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 4 — Non-Functional Requirements + Tech Stack
// ═══════════════════════════════════════════════════════════════════════════
addPage(4);
doc.y = 28;

sectionTitle('6.  Non-Functional Requirements');

subheading('Usability');
bullet('Minimal onboarding — user reaches results in under 2 minutes');
bullet('Dark, high-contrast theme passes WCAG AA contrast ratios');
bullet('Haptic feedback on all interactive elements (Expo Haptics)');
bullet('Keyboard-aware layouts prevent input fields from being hidden');

subheading('Performance');
bullet('React Query caches API responses for 10 minutes — no redundant network calls');
bullet('Expo Image lazy-loads with smooth 300 ms fade transitions');
bullet('FlatList virtualises the restaurant list for smooth 60 fps scrolling');
bullet('Animated landing screen uses React Native Animated API with native driver');

subheading('Responsiveness');
bullet('Layouts use flex and SafeAreaInsets — adapts to any screen size and notch');
bullet('Runs on iOS 14+, Android 8+, and Expo Web (browser preview)');

subheading('Security');
bullet('No passwords are stored — email only persisted post-login (prototype scope)');
bullet('All API calls use HTTPS');
bullet('No sensitive data transmitted to third-party servers beyond location (Overpass)');

sectionTitle('7.  Technology Stack');

const techRows = [
  ['Framework',        'React Native via Expo SDK 52'],
  ['Language',         'TypeScript 5.9 (strict mode)'],
  ['Navigation',       'Expo Router v4 (file-based, Stack navigator)'],
  ['State Management', 'React Context API + AsyncStorage (@react-native-async-storage)'],
  ['Data Fetching',    '@tanstack/react-query v5'],
  ['UI / Styling',     'React Native StyleSheet, expo-linear-gradient'],
  ['Icons',            '@expo/vector-icons (Feather set)'],
  ['Fonts',            '@expo-google-fonts/inter (400 / 500 / 600 / 700)'],
  ['Location',         'expo-location (foreground GPS)'],
  ['Haptics',          'expo-haptics'],
  ['Images',           'expo-image (high-performance lazy loading)'],
  ['Package Manager',  'pnpm workspaces (monorepo)'],
  ['Build / Dev',      'Expo Dev Server + Expo Go app for device testing'],
  ['Primary API',      'Overpass API (OpenStreetMap) — free, no key required'],
  ['Fallback API',     'TheMealDB REST API v1 — free, no key required'],
];
techRows.forEach(([l, v]) => infoRow(l, v));

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 5 — Application Flow
// ═══════════════════════════════════════════════════════════════════════════
addPage(5);
doc.y = 28;

sectionTitle('8.  Application Flow / Architecture');

body('The application follows a linear onboarding flow with a persistent home screen. All screens live inside a single Expo Router Stack navigator under app/(tabs)/.');

// Flow diagram — drawn with boxes and arrows
const bx = doc.page.margins.left;
const bw = PW;
const bh = 28;
const gap = 10;
const boxes = [
  { label: '🌿  Landing Screen  (index.tsx)', color: BLACK },
  { label: '🔐  Login / Sign Up  (login.tsx / signup.tsx)', color: DARK },
  { label: '👤  Profile Setup  (profile.tsx) — metrics + goal', color: DARK },
  { label: '📊  Results Screen  (results.tsx) — TDEE + BMI + restaurants', color: GREEN },
  { label: '🏪  Restaurant Detail  (restaurant-detail.tsx)', color: DARK },
  { label: '📝  Restaurant Register  (restaurant-register.tsx)', color: DARK },
];

doc.moveDown(0.4);
let flowY = doc.y;
boxes.forEach((b, i) => {
  doc.roundedRect(bx, flowY, bw, bh, 5).fill(b.color);
  const textColor = b.color === GREEN ? WHITE : WHITE;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(textColor)
     .text(b.label, bx + 12, flowY + 8, { width: bw - 24 });
  flowY += bh;
  if (i < boxes.length - 1) {
    const arrowX = bx + bw / 2;
    doc.moveTo(arrowX, flowY).lineTo(arrowX, flowY + gap - 2)
       .strokeColor(GREEN).lineWidth(1.5).stroke();
    doc.polygon([arrowX - 5, flowY + gap - 2], [arrowX + 5, flowY + gap - 2], [arrowX, flowY + gap + 4])
       .fill(GREEN);
    flowY += gap + 4;
  }
});

doc.y = flowY + 14;

subheading('Data Flow');
bullet('App launch → check AsyncStorage for existing login → redirect to Results or Landing');
bullet('Profile saved → TDEE + adjusted calories + BMI computed in-memory (utils/calories.ts)');
bullet('Results screen → React Query fires API call → Overpass (if location) or TheMealDB');
bullet('Registered restaurants loaded from AsyncStorage and merged at top of results list');
bullet('Tapping a card → navigate to detail screen with all params passed via Expo Router');

subheading('State Architecture');
bullet('AppContext — global auth state (isLoggedIn, email, userProfile) via React Context');
bullet('AsyncStorage — persistent storage for login flag, email, profile JSON, registered restaurants');
bullet('React Query — server-state cache with 10 min stale time for API responses');

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 6 — UI Screens Description
// ═══════════════════════════════════════════════════════════════════════════
addPage(6);
doc.y = 28;

sectionTitle('9.  UI Screens / Components Description');

const screens = [
  {
    name: '1. Landing Screen',
    purpose: 'First screen shown to new users. Introduces the app brand and guides users to sign up or log in.',
    components: [
      'Animated floating food emoji icons (CSS keyframe-style loop)',
      'Green glowing logo mark (🌿) with gradient background',
      '"Eat Smart. Feel Great." hero headline',
      'Feature pills: Location-based · Calorie-smart · Rated meals',
      'Top-right Login / Sign Up buttons',
      'Bottom "Get Started →" white CTA button',
      'Auto-login check — redirects if session exists',
    ],
  },
  {
    name: '2. Login Screen',
    purpose: 'Allows existing users to authenticate. Validates email format and password length.',
    components: [
      'Dark header with green logo and app name',
      'Email input with mail icon; highlights white border on focus',
      'Password input with lock icon (secureTextEntry)',
      'Inline validation error messages in red',
      '"Sign In" white primary button',
      '"Create New Account" outlined secondary button',
    ],
  },
  {
    name: '3. Sign Up Screen',
    purpose: 'New user registration. Collects name, email, password, and confirmation.',
    components: [
      'Four input fields: Full Name, Email, Password, Confirm Password',
      'Each field has a Feather icon and focus highlight',
      'All fields validated before submission',
      '"Create Account →" primary button',
      '"Already have an account? Sign In" link at bottom',
    ],
  },
  {
    name: '4. Profile Screen',
    purpose: 'User enters physical metrics and selects fitness goal before calorie calculation.',
    components: [
      'Age, Weight (kg), Height (cm) numeric inputs in dark cards',
      'Gender toggle: Male / Female (white active state)',
      'Goal picker: 3 cards — 📉 Lose Weight / ⚖️ Maintain / 💪 Gain Muscle',
      'Each goal card shows calorie delta (−500 / ±0 / +300 kcal)',
      'Activity level: 5 radio options (Sedentary → Very Active)',
      '"Calculate My Calories" white submit button',
    ],
  },
  {
    name: '5. Results Screen',
    purpose: 'Main home screen showing calorie target, BMI, and restaurant list.',
    components: [
      'Top bar: settings (sliders icon) + logo + logout button',
      'Green TDEE card: adjusted calorie target, goal badge, per-meal estimate',
      'BMI card: score circle, colour-coded category, scale bar with marker, health tip',
      'Location permission banner (Enable → requesting → granted/denied states)',
      '"Own a restaurant?" registration CTA banner',
      'Scrollable restaurant cards: photo, name, meal, calories, stars, Partner/Nearby badge',
    ],
  },
  {
    name: '6. Restaurant Detail Screen',
    purpose: 'Full information page for a selected restaurant. Opens when user taps a card.',
    components: [
      'Full-width hero food image with gradient overlay',
      'Partner / Nearby badge overlaid on image',
      'Restaurant name, cuisine type, price range pill',
      'Star rating row with opening hours',
      'Calorie card: estimated kcal per meal + meal name',
      '"About" description card (for registered restaurants)',
      'Address, phone, website info row',
      'Large white "Visit Website" button with URL preview',
      'Green "Call" button (secondary)',
    ],
  },
  {
    name: '7. Restaurant Registration Screen',
    purpose: 'Allows restaurant owners to list their business in the app.',
    components: [
      'Name input, cuisine chip selector (10 options), address, city fields',
      'Phone number and website URL inputs',
      'Price range selector: $ / $$ / $$$ / $$$$',
      'Opening hours input',
      'Multi-line description text area',
      '"Register Restaurant" submit button',
      'Success screen with green checkmark animation on completion',
    ],
  },
];

screens.forEach((s) => {
  if (doc.y > 660) { addPage(doc.bufferedPageRange().count + 1); doc.y = 28; }
  subheading(s.name);
  body(`Purpose: ${s.purpose}`);
  s.components.forEach(c => bullet(c, 8));
  doc.moveDown(0.2);
});

// ═══════════════════════════════════════════════════════════════════════════
// PAGE 7 — API Usage + Conclusion
// ═══════════════════════════════════════════════════════════════════════════
addPage(7);
doc.y = 28;

sectionTitle('10.  API Usage');

subheading('API 1 — Overpass API (OpenStreetMap)');
infoRow('Base URL',    'https://overpass-api.de/api/interpreter');
infoRow('Auth',        'None — completely free, no API key required');
infoRow('Trigger',     'User grants foreground location permission');
infoRow('Query type',  'Overpass QL via POST query parameter');
body('The app builds an Overpass QL query that searches for all OpenStreetMap nodes tagged as amenity=restaurant within a 3 km radius of the device\'s GPS coordinates. Up to 15 results are returned. Each element includes the restaurant name (from OSM tags), cuisine type, and GPS coordinates (lat/lon). The calorie estimate per meal is calculated as TDEE ÷ 3 ± a small deterministic variation based on the OSM node ID.');
bullet('Endpoint example: ?data=[out:json];node["amenity"="restaurant"](around:3000,31.5,74.3);out body 15;');
bullet('Response fields used: id, lat, lon, tags.name, tags.cuisine');
bullet('Fallback: if 0 results returned, TheMealDB is called instead');

doc.moveDown(0.4);
subheading('API 2 — TheMealDB (v1 — free tier)');
infoRow('Base URL',    'https://www.themealdb.com/api/json/v1/1/filter.php');
infoRow('Auth',        'None — free public API, no key required');
infoRow('Trigger',     'Location not granted OR Overpass returns 0 results');
infoRow('Method',      'GET with category query parameter (?c=Chicken)');
body('TDEE is mapped to a food category (Vegan / Vegetarian / Seafood / Chicken / Pasta / Beef) based on calorie thresholds. The API returns meals in that category, each with a name and thumbnail image URL. Calorie values are estimated deterministically from the meal ID within the category\'s known calorie range.');
bullet('Category mapping: <1600 → Vegan, <1900 → Vegetarian, <2200 → Seafood, <2500 → Chicken, <2800 → Pasta, 2800+ → Beef');
bullet('Response fields used: idMeal, strMeal, strMealThumb');
bullet('Up to 12 meals shown per query');

doc.moveDown(0.4);
subheading('Local Storage — AsyncStorage');
body('No backend database is used in this prototype. All user data is stored on-device using @react-native-async-storage/async-storage:');
bullet('isLoggedIn, userEmail — authentication state');
bullet('userProfile — JSON object with all physical metrics and goal');
bullet('registeredRestaurants — JSON array of restaurant owner submissions');

sectionTitle('11.  Conclusion');
body(
  'Health Bite successfully demonstrates a full mobile application lifecycle — from UI/UX design to data fetching and local persistence. By combining the Mifflin-St Jeor calorie equation with real-world restaurant data from OpenStreetMap, the app delivers genuinely personalised and actionable meal recommendations without requiring any paid APIs or backend infrastructure.'
);
body(
  'The project showcases practical skills in React Native, TypeScript, Expo Router navigation, REST API integration, React Query state management, and modern mobile UI design. The addition of goal-based calorie adjustment, BMI visual feedback, and a restaurant registration portal demonstrates the ability to extend a functional MVP with meaningful features.'
);
body(
  'Expected outcomes include a deeper understanding of cross-platform mobile development, API-driven UI design, and user experience principles. Future work would introduce a cloud backend (Supabase / Firebase), real menu data, macro tracking, and push notification reminders to make the app fully production-ready.'
);

doc.moveDown(1);
doc.rect(doc.page.margins.left, doc.y, PW, 60).fill('#F9FFF9').stroke('#2DB87A');
doc.font('Helvetica-Bold').fontSize(11).fillColor(GREEN)
   .text('Submitted by', doc.page.margins.left + 16, doc.y - 48);
doc.font('Helvetica').fontSize(10.5).fillColor(DARK)
   .text('Muhammad Ahmad (L1F23BSSE0201)  &  Aimen Khawaja Zahid (L1F23BSSE0219)', doc.page.margins.left + 16, doc.y - 32);
doc.font('Helvetica').fontSize(10).fillColor(MUTED)
   .text('Section F5  ·  Advance Web Programming  ·  Spring 2026  ·  Submission: 17th June 2026', doc.page.margins.left + 16, doc.y - 16);

doc.end();
console.log('PDF written to', OUT);
