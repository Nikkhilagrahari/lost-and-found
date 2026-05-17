# IET Gorakhpur Lost & Found — PRD

## Original Problem Statement
Full-stack Lost & Found web app for students, faculty and staff of Institute of Engineering & Technology, Gorakhpur University. Secure, campus-only platform to report, search, and recover lost items.

## User Choices
- Auth: JWT email/password (institute domain restricted) + Emergent Google Auth
- Matching: Simple keyword/category-based (no AI)
- Image storage: Base64 in MongoDB
- Scope v1: Core + In-app Messaging
- Design: Clean academic/institutional (Deep Academic Blue #1E3A8A + Cabinet Grotesk/IBM Plex Sans)

## Architecture
- **Backend**: FastAPI + Motor (MongoDB async). Routes prefixed `/api`. JWT (cookie + Bearer fallback) and Emergent OAuth session-token strategies.
- **Frontend**: React 19 + React Router 7 + shadcn/ui + recharts + sonner toasts. Tailwind. Axios with credentials + Bearer header from localStorage.
- **DB Collections**: users, user_sessions, items, notifications, conversations, messages.

## User Personas
- **Student**: reports lost items, browses, contacts finders.
- **Faculty/Staff**: reports found items, hands over to admin or returns directly.
- **Admin (Institute Authority)**: moderates posts, monitors stats, manages users.

## Core Requirements (Static)
- Institute-only access (email domain allowlist)
- Report Lost / Found items with image upload, category, location, date
- Smart search & filters (q, type, category, location)
- Keyword + location based matching with notifications
- In-app messaging between finder and owner
- Admin dashboard with analytics
- Mobile-first responsive

## Implemented (April 2026)
- Backend (`server.py`): full auth (signup/login/me/logout/google-session), items CRUD + mine + matches, notifications (list/read/read-all), conversations (start/list/get/send), admin (stats/items/users).
- Frontend pages: Landing, Login (email/pw + Google), AuthCallback, Browse (filters), ReportItem (lost/found), ItemDetail (gallery + contact dialog + status updates + matches), Messages (chat list + conversation pane + polling), Profile (tabs), AdminDashboard (stat cards + bar chart + pie chart + items/users tables).
- Header with notifications bell + dropdown, user avatar menu, mobile nav.
- Design tokens: Deep Academic Blue + accent amber, Cabinet Grotesk/IBM Plex Sans, glass-nav, flat institutional cards.
- Test accounts: admin@ietgkp.edu, student@ietgkp.edu, other@ietgkp.edu (see `/app/memory/test_credentials.md`).

## Iteration 2 (May 2026) — Institute-specific auth & moderation features
- **Student login via Roll No. + DOB**: New endpoint `/api/auth/student/login`. Admin pre-registers students in the `students` collection; on first successful login a user record is auto-created (role=`student`). DOB accepts both `DD/MM/YYYY` and `YYYY-MM-DD`.
- **Admin (gmail) bypass**: Emails listed in `ADMIN_EMAILS` env var bypass the institute-domain restriction. Configured for `nikkhil.agrahari1977@gmail.com`.
- **Admin Students management**: `/api/admin/students` (list/add/delete) + `/api/admin/students/bulk` (CSV). Admin UI: dedicated "Students" tab with form, CSV upload (file or paste), and a table with delete actions.
- **Anonymous Found reports**: `is_anonymous` flag on items. Non-admin and non-owner viewers see `owner_name: "Anonymous Finder"` and `owner_email: null` in all listings, detail, and chat participant names. Admin sees the real identity. Only `type=found` items can be anonymous.
- **Claimed item visual + auto-hide**: When status moves to `recovered`/`closed`, backend stamps `recovered_at`. Browse cards become opacity-60 grayscale with a "Recovered" overlay. Items are excluded from listings 24h after `recovered_at` (configurable via `ITEM_RECOVERED_HIDE_HOURS`).
- **Login UX**: Student tab is the default; Admin/Staff tab keeps email/password + Google login.
- **Mobile polish**: Brand text now always visible on header (truncated), tighter padding on login screen, mobile menu drawer retained.
- Seed accounts: `nikkhil.agrahari1977@gmail.com / Admin@123` (admin), roll numbers `2514750010114`, `2514750010012`, `2514750010094` with respective DOBs.

## Backlog / Next Tasks
- **P1**: Email/OTP verification flow (currently password-only signup), report-abuse moderation queue, admin approve/reject pre-publish workflow.
- **P1**: Image-similarity matching (advanced), QR-based claim verification.
- **P2**: Reputation system, location heatmap, push/email notifications, OCR for ID cards.
- **P2**: Rate limiting + password complexity rules, split server.py into modular routers.
- **P2**: Profile picture upload, public profile / community leaderboard.
