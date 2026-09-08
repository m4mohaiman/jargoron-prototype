# JAGORON — AI Aptitude Demo (Software Shell)

React + Vite + TypeScript + Tailwind (v4) + shadcn-style UI দিয়ে বানানো একটা
সম্পূর্ণ ফ্রন্টএন্ড ডেমো — Login → Dashboard (sidebar + topbar) → নতুন
অ্যাসেসমেন্ট → কম্পিটেন্সি প্রোফাইল। কোনো ব্যাকএন্ড নেই — সব ডেটা ব্রাউজারের
`localStorage`-এ থাকে, আর প্রোফাইলের ন্যারেটিভ তৈরি হয় সরাসরি ব্রাউজার থেকে
**Google AI API** কল করে।

## চালানো

```bash
npm install
```

প্রজেক্ট রুটে `.env` ফাইলে তোমার AI API key বসাও:

```
VITE_AI_API_KEY=তোমার-key-এখানে
```

([Google AI Studio](https://aistudio.google.com/apikey) থেকে ফ্রি নেওয়া যায়।)

```bash
npm run dev
```

## লগইন

ইমেইল + পাসওয়ার্ড দিয়ে সাইন ইন বা সাইন আপ করা যায়। অ্যাকাউন্ট ব্রাউজারের
`localStorage`-এ থাকে; পাসওয়ার্ড salt সহ SHA-256 হ্যাশ করে রাখা হয় (ডেমো-মানের
— আসল নিরাপত্তার জন্য সার্ভার-সাইড auth লাগবে)।

প্রথমবার অ্যাপ খুললে দুটি ডেমো অ্যাকাউন্ট তৈরি হয় (পাসওয়ার্ড `jagoron123`):

| ইমেইল                | ভূমিকা         | কী দেখতে পায়                                              |
| -------------------- | -------------- | --------------------------------------------------------- |
| `field@jagoron.org`  | ফিল্ড অফিসার   | নতুন অ্যাসেসমেন্ট, নিজের ড্যাশবোর্ড, প্রোফাইল হিস্ট্রি     |
| `admin@jagoron.org`  | প্রশাসক        | সার্বিক ড্যাশবোর্ড, ইউজার ম্যানেজমেন্ট, সেটিংস             |

নতুন সাইন আপ করলে ভূমিকা হয় **ফিল্ড অফিসার**।

## স্কোরিং কীভাবে কাজ করে

প্রোফাইলটা দুই ভাগে তৈরি হয়:

1. **নিয়মভিত্তিক স্কোরিং** (`src/lib/scoring.ts`) — অ্যাসেসমেন্টের প্রতিটি
   উত্তরের সাথে ৬টি দক্ষতার ওজন যুক্ত (`src/data/questions.ts`)। এখান থেকে
   ০–১০০ স্কেলে Competency Profile আসে, আর সেই স্কোর `src/data/pathways.ts`-এর
   ৯টি পাথওয়ের ওজনের সাথে মিলিয়ে ম্যাচ শতাংশ বের হয়। এটা সম্পূর্ণ
   deterministic — একই উত্তরে সবসময় একই ফল।
2. **AI ন্যারেটিভ** (`src/lib/gemini.ts`) — Gemini স্কোরগুলো দেখে সর্বোচ্চ ±১৫
   পয়েন্ট সংশোধন করতে পারে, এবং বাংলায় headline / summary / strengths /
   next steps লেখে।

**AI না পাওয়া গেলেও অ্যাপ থামে না।** মডেল overload (503), রেট-লিমিট (429),
টাইমআউট বা key না থাকলে নিয়মভিত্তিক স্কোরিং দিয়েই পুরো প্রোফাইল তৈরি হয়, আর
Results পেজে একটা নোটিশ দেখায়। রিট্রাই নীতি:

- 429/500/502/503/504 ও নেটওয়ার্ক ব্যর্থতায় exponential backoff + jitter
  (প্রতি মডেলে ৩ বার), `Retry-After` হেডার থাকলে সেটাই মানা হয়
- এরপর `MODELS` লিস্টের পরের মডেলে ফলব্যাক
- 400/404 (ভুল মডেল) → সরাসরি পরের মডেল; 401/403 (key সমস্যা) → রিট্রাই নয়

`src/lib/gemini.ts`-এর `MODELS` অ্যারে-তে তোমার key-এ available মডেলগুলো বসাও।
কোন মডেল আছে দেখতে:

```bash
curl -H "x-goog-api-key: $VITE_AI_API_KEY" https://generativelanguage.googleapis.com/v1beta/models
```

## গঠন

```
src/
  components/
    shell/            # Sidebar, Topbar, AppShell
    Login.tsx         # ইমেইল + পাসওয়ার্ড (সাইন ইন / সাইন আপ)
    Dashboard.tsx     # role অনুযায়ী আলাদা কন্টেন্ট
    ProfileHistory.tsx
    UsersPage.tsx     # admin only — নিবন্ধিত অ্যাকাউন্টের তালিকা
    SettingsPage.tsx  # admin only — AI সংযোগ স্ট্যাটাস
    Intake.tsx        # Participant Profile ফর্ম (দ্বিভাষিক + consent)
    Assessment.tsx    # icon-based প্রশ্নের ধাপ
    Generating.tsx
    Results.tsx       # Competency Profile + Matched Pathways + Learning Pathway
    ui/               # button, card, input, select, progress
  data/
    questions.ts      # ৯টি প্রশ্ন, প্রতিটি অপশনে দক্ষতার ওজন
    competencies.ts   # ৬টি দক্ষতা ও তাদের রং/থ্রেশহোল্ড
    pathways.ts       # ৯টি ক্যারিয়ার পাথওয়ে (আয়, চাহিদা, প্রশিক্ষণকাল)
    options.ts        # Intake ড্রপডাউন (জেলা, শিক্ষা, প্রতিবন্ধিতা, লিঙ্গ)
  lib/
    auth.ts           # ইমেইল/পাসওয়ার্ড auth (localStorage, SHA-256)
    scoring.ts        # নিয়মভিত্তিক স্কোরিং ও পাথওয়ে ম্যাচিং
    gemini.ts         # AI কল, রিট্রাই/ফলব্যাক, প্রোফাইল অ্যাসেম্বলি
    storage.ts        # সেভ করা প্রোফাইলের তালিকা (localStorage)
  App.tsx             # পুরো স্ক্রিন-রাউটিং (state মেশিন)
```

## যা এই demo দেখায়

- সফটওয়্যার-এর মতো shell: sidebar navigation + topbar + user menu
- ইমেইল/পাসওয়ার্ড লগইন ও সাইন আপ, role-based দুটি ভিন্ন ড্যাশবোর্ড
- Intake ফর্ম → icon-ভিত্তিক অ্যাসেসমেন্ট → Competency Profile + ৯টি
  র‍্যাঙ্ক করা পাথওয়ে + ৩-ধাপের Learning Pathway → localStorage-এ সেভ →
  হিস্ট্রি থেকে আবার দেখা যায়
- AI বন্ধ থাকলেও সম্পূর্ণ কার্যকর ফলাফল (graceful degradation)

## যা এই demo দেখায় না (production-এর জন্য দরকার)

- আসল ব্যাকএন্ড, ডেটাবেজ, বা সার্ভার-সাইড অথেন্টিকেশন। **API key এখন
  ব্রাউজার বান্ডলে যায়** — যে কেউ DevTools খুলে দেখতে পারবে। প্রকৃত
  ডেপ্লয়মেন্টে Gemini কলটা একটা সার্ভার রুটের পেছনে থাকা উচিত।
- CARE-এর existing MIS (ASP.NET Core / PostgreSQL / Redis / Azure) এর সাথে
  ইন্টিগ্রেশন
- RBAC, MFA, encryption at rest, audit logging
- একাধিক ইউজারের ডেটা আলাদা করে রাখা (এখন সব প্রোফাইল সব ইউজার একই
  localStorage থেকে দেখে)
- Offline সাপোর্ট, audio-based প্রশ্ন, validated psychometric instrument
  (এখনকার স্কোরিং একটা যুক্তিসঙ্গত heuristic, প্রমাণিত সাইকোমেট্রিক মডেল নয়)
