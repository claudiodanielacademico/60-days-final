

# 60 Days Closer — Spiritual Growth App

A mobile-first app guiding users through a 60-day journey to deepen their relationship with Jesus, built with React + Supabase + Capacitor.

---

## Design Foundation

- **Color palette**: Serene Blue (#5B8DB8), Gold (#C9A84C), White (#FFFFFF), Soft Yellow (#F5E6A3), Warm White-Brown (#E8DCC8)
- **Style**: Clean, serene, minimalist — gentle gradients, rounded cards, calming typography
- **Layout**: Mobile-first with bottom navigation bar (4 tabs: My Journey, Community, Prayers, Profile/Stats)

---

## 1. Authentication & Onboarding

- Email/password signup and login via Supabase Auth
- Google social login option
- Profile creation on signup: display name and avatar
- Session persistence so users stay logged in
- Clean, welcoming login/signup screens matching the serene theme

## 2. The 60-Day Journey (My Journey Tab)

- **Journey overview**: Visual timeline/card list of all 60 days
- Each day card shows: day number, title, status (Completed ✓, Today's Step ▶, Locked 🔒)
- **Unlock logic**: Day 1 unlocks on signup, one new day per calendar day
- **Daily devotional screen**:
  - Scripture passage
  - Devotional reflection text
  - Practical task or prompt
  - "Mark as Complete" button
- Progress bar showing overall completion (e.g., "Day 12 of 60")
- **AI-generated content**: Edge function using Lovable AI to generate all 60 days of scripture-based reflections and tasks

## 3. Community Hub (Community Tab)

- Community feed for text posts with captions
- Photo uploads (Bible journaling, nature, gatherings) stored in Supabase Storage
- Like and Comment interactions on posts
- Follow system to see posts from followed members
- Chronological/most-recent feed layout

## 4. Prayer Chain (Prayers Tab)

- Prayer request feed — users post text-based prayer requests
- "I Prayed" button on each request (amen counter)
- Total prayer count displayed per request
- View own requests and ones prayed for

## 5. Profile & Community Stats (Profile/Stats Tab)

- User profile: avatar, display name, journey progress, posts
- **Community Impact Dashboard** with real-time stats:
  - Total prayers offered by the community
  - Total journey steps completed globally
  - Number of active users today
- **Personal stats**: days completed, prayers offered, posts made

## 6. Backend (Lovable Cloud + Supabase)

- **Database tables**: profiles, journey_progress, daily_content, community_posts, comments, likes, follows, prayer_requests, prayer_counts
- **Storage bucket** for community photo uploads
- **Row-Level Security** on all tables
- **Edge function** to generate 60-day devotional content via Lovable AI

## 7. Native Mobile Setup (Capacitor)

- Capacitor configured for iOS and Android
- Mobile-optimized UI with touch-friendly interactions
- Instructions for building and running on physical devices

