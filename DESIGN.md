# FinAnalysis — Design Document

> **Premium Portfolio Distribution & Goal-Based Investment Structuring by Arijit De**

---

## 1. Executive Summary

FinAnalysis is a full-stack wealth management platform that combines **portfolio health scoring**, **investor archetype profiling**, **interactive calculators**, and **AI-driven advisory chat** into a cohesive experience for retail investors and advisors.

**Core Value Proposition**: Transform raw portfolio data into actionable, goal-aligned investment decisions through a 5-dimension scoring engine (0–100) backed by AMFI benchmark data.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            MONOREPO STRUCTURE                               │
├──────────────────┬──────────────────┬───────────────────────────────────────┤
│    frontend/     │     backend/     │           shared/                     │
│   (Next.js 16)   │  (Express + TS)  │     (Types + Constants)               │
├──────────────────┼──────────────────┼───────────────────────────────────────┤
│ • App Router     │ • REST API       │ • @finanalysis/shared                 │
│ • React 19       │ • Prisma ORM     │   – types/user.ts                     │
│ • Tailwind CSS 4 │ • PostgreSQL     │   – types/assessment.ts               │
│ • GSAP/Scroll    │ • JWT Auth       │   – types/portfolio.ts                │
│ • Three.js/OGL   │ • Zod Validation │   – types/scoring.ts                  │
│ • Lottie/Anim    │ • Multer Upload  │   – types/payment.ts                  │
│ • Recharts       │ • NodeMailer OTP │   – constants/goals.ts                │
│ • TanStack Query │ • AMFI Service   │   – constants/scoring.ts              │
└──────────────────┴──────────────────┴───────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | Next.js (App Router) | 16.2.6 |
| UI Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Animation | GSAP + ScrollTrigger | 3.15 |
| 3D/WebGL | Three.js + OGL | 0.167 / 1.0 |
| Charts | Recharts | 3.8 |
| State/Async | TanStack Query | 5.100 |
| Backend Runtime | Node.js + Express | 5.2 / TS 6.0 |
| Database | PostgreSQL + Prisma | 7.8 |
| Auth | JWT + bcryptjs | 9.0 / 3.0 |
| Validation | Zod | 4.4 |
| Email | Nodemailer (Gmail) | 8.0 |
| File Upload | Multer + XLSX | 2.1 / 0.20 |

---

## 3. Domain Model (Prisma Schema)

### Core Entities

```
User ◄─────────────────────► Assessment
 │                              │
 │                              ▼
 │                         Portfolio ◄──► PortfolioRow (Fund holdings)
 │                              │
 │                              ▼
 │                           Score (5 dimensions + total + tag)
 │
 ├──► Lead (Advisory pipeline)
 ├──► Client (Activated advisory client)
 ├──► AdvisorySession (Booked calls)
 └──► SupportQuery (Help desk)

Folio ◄──── ExistingClient (CRM import data)
    └── Holdings + Valuation merged
```

### Key Enums

| Enum | Values |
|------|--------|
| `Role` | `GUEST`, `CLIENT`, `ADMIN` |
| `Goal` | `WEALTH_CREATION`, `RETIREMENT`, `HOUSE_PURCHASE`, `CHILD_EDUCATION`, `MARRIAGE`, `PASSIVE_INCOME`, `TAX_SAVING`, `NOT_SURE_YET` + legacy |
| `UploadType` | `EXCEL`, `MANUAL`, `FOLIO_IMPORT` |
| `FundType` | `SIP`, `LUMPSUM` |
| `ScoreTag` | `ALIGNED` (≥75), `MODERATE` (≥60), `NEEDS_REVIEW` (<60), `NEEDS_STRUCTURING` (no goal) |
| `LeadStatus` | `NEW`, `CONTACTED`, `CONVERTED` |
| `SessionStatus` | `PENDING`, `CONFIRMED`, `COMPLETED`, `REFUNDED` |

---

## 4. Scoring Engine — The Core Algorithm

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SCORE CALCULATION (0–100)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │Goal Alignment│ │Asset Alloc   │ │Diversification│ │Discipline    │       │
│  │    (20pts)   │ │    (20pts)   │ │    (20pts)   │ │   (20pts)    │       │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘       │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                    │                                        │
│                         ┌──────────▼──────────┐                             │
│                         │    Efficiency       │                             │
│                         │      (20pts)        │  ← Async (AMFI API calls)  │
│                         └──────────┬──────────┘                             │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌──────────────────┐                               │
│                         │   RAW TOTAL      │                               │
│                         │   (0–100)        │                               │
│                         └────────┬─────────┘                               │
│                                  │                                        │
│                         ┌────────▼────────┐                               │
│                         │ DISPLAY CLAMP   │  min 2, max 97                │
│                         └────────┬────────┘                               │
│                                  │                                        │
│                         ┌────────▼────────┐                               │
│                         │ SCORE TAG       │                               │
│                         │ ALIGNED ≥75     │                               │
│                         │ MODERATE ≥60    │                               │
│                         │ NEEDS_REVIEW    │                               │
│                         │ NEEDS_STRUCTURE │  (no goal)                   │
│                         └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dimension Details

#### 1. Goal Alignment (20 pts)
| Criterion | Points | Logic |
|-----------|--------|-------|
| Goal Defined | +4 | Not `EXPLORING`/`NOT_SURE_YET` |
| Goal + Tenure Match | +4 | Long-term goal ↔ ≥5yr tenure; Short-term ↔ <5yr |
| Life Stage Coherence | +4 | Goal in `LIFE_STAGE_GOAL_ALIGNMENT[lifeStage]` |
| Monthly Investment Adequacy | +4 | Growth goal: ≥₹3k; Tax: ≥₹1.5k; Other: ≥₹1k |
| Emergency Fund | +4 | ≥6 months = +4; 3-6m = +3; <3m = +1; none = 0 + insight |

#### 2. Asset Allocation (20 pts)
| Criterion | Points | Logic |
|-----------|--------|-------|
| Age-Based Equity Range | +10 | Within ±0% = 10; ±10% = 6; ±20% = 3; >20% = 0 |
| Category Spread | +10 | Large+Mid = +3; Flexi/Multi = +3 (Index = +2); Debt/Hybrid = +2; ELSS (Tax goal) = +2 |

**Age → Equity Range**: <30: 70-90%, 30-39: 60-80%, 40-49: 50-65%, 50-59: 30-50%, 60+: 20-40%

#### 3. Diversification (20 pts)
| Criterion | Points | Logic |
|-----------|--------|-------|
| Fund Count | +5 | 3-8 = 5; 9-12 = 3; 1-2 = 2; >12 = 1 |
| Category Spread | +5 | ≥3 = 5; 2 = 3; 1 = 1 |
| AMC Concentration | +4 | Max AMC ≤40% = 4; else = 1 |
| Single Fund Dominance | +3 | Max fund ≤35% = 3; 35-50% = 1; >50% = 0 |
| Overlap Check | +3 | No same-category/same-AMC duplicates = 3; else = 1 |

#### 4. Discipline (20 pts)
| Criterion | Points | Logic |
|-----------|--------|-------|
| SIP Consistency | +8 | All SIPs active ≥12mo = 8; ≥6mo = 5; <6mo = 2 |
| Step-up Presence | +5 | Any SIP has step-up = 5 |
| Investment Regularity | +4 | Regular monthly SIP style = 4; Occasional = 2; Rarely = 1 |
| No Panic Selling | +3 | Risk behavior ≠ `SELL_EVERYTHING` = 3 |

#### 5. Efficiency (20 pts) — *Async (AMFI API)*
| Criterion | Points | Logic |
|-----------|--------|-------|
| Expense Ratio vs Category Avg | +10 | Below avg = 10; Within 10bps = 7; Within 25bps = 4; Above = 1 |
| Exit Load Awareness | +5 | No funds with exit load >1yr = 5; Has loads = 2 |
| Turnover Ratio | +5 | Low turnover funds preferred = 5 |

---

## 5. API Design

### Authentication (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Email/password signup |
| POST | `/login` | Public | Email/password signin |
| POST | `/google` | Public | Google OAuth callback |
| POST | `/otp/send` | Public | Send OTP to email |
| POST | `/otp/verify` | Public | Verify OTP |
| POST | `/refresh` | Cookie | Refresh access token |
| POST | `/logout` | Cookie | Clear tokens |
| GET | `/me` | Bearer | Current user profile |
| PATCH | `/me` | Bearer | Update profile |

### Assessment (`/api/assess`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Bearer | Create/update assessment |
| GET | `/:id` | Bearer | Get assessment |

### Portfolio (`/api/portfolio`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/upload` | Bearer | Upload Excel/CSV (Multer) |
| POST | `/manual` | Bearer | Manual JSON entry |
| GET | `/client-data` | Bearer | Match CRM folios by PAN/email/name |
| GET | `/:id` | Bearer | Get portfolio with rows + score |
| GET | `/` | Bearer | List user portfolios |

### Scoring (`/api/score`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:portfolioId` | Bearer | Calculate & persist score |
| GET | `/:id` | Bearer | Get score by ID |

### Admin (`/api/admin`) — *Requires ADMIN role*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform metrics |
| GET | `/users` | Paginated user list |
| GET | `/portfolios` | All portfolios |
| GET | `/leads` | Lead pipeline |
| POST | `/users/:id/role` | Update user role |
| GET | `/clients` | Activated clients |
| POST | `/clients/:id/notes` | Advisor notes |

### Chat (`/api/chat`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Bearer | Send message → Grok AI |
| GET | `/history` | Bearer | Conversation history |

### Support (`/api/support`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Bearer | Create ticket |
| GET | `/` | Bearer | List user tickets |

### Leads (`/api/leads`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Public | Capture lead (name, phone, slot) |
| GET | `/` | Admin | List leads |

### Contact (`/api/contact`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Public | Contact form submission |

---

## 6. Frontend Architecture

### Route Structure (App Router)

```
/                          → Landing page (hero, archetype, calculators carousel)
/onboarding                → Auth flow (Select → New User/OTP/Existing Client)
/quiz                      → Investor Archetype Quiz (5 questions → Tiger/Elephant/Deer/Fox/Lion)
/dashboard/user            → User Dashboard (Assessment → Upload → Score → Report)
/dashboard/client          → Client Dashboard (Advisor view of client portfolios)
/dashboard/admin           → Admin Dashboard (Platform metrics, user mgmt)
/sip-calculator            → SIP Calculator
/lumpsum-calculator        → Lumpsum Calculator
/step-up-sip-calculator    → Step-up SIP Calculator
/swp-calculator            → SWP Calculator
/sif-calculator            → SIF Calculator
/emi-calculator            → EMI Calculator
/fd-calculator             → FD Calculator
/rd-calculator             → RD Calculator
/inflation-calculator      → Inflation Calculator
/loan-calculator           → Loan Calculator
/privacy                   → Privacy Policy
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | Navigation + auth state + theme |
| `Footer` | Links, contact, social |
| `ChatbotWidget` | Floating AI chat (SmoothUI orb) |
| `BookCallModal` | Advisory booking (Razorpay integration) |
| `CalculatorsCarousel` | Horizontal scroll of calculator cards |
| `ServicesConstellation` | Animated 3D service visualization |
| `LightTunnel` / `Prism` / `ColorBends` | Hero background effects |
| `ScrollRevealSection` / `ScrollBlurReveal` | GSAP scroll animations |
| `KnobSlider` | Custom radial input for calculators |
| `AIOrbFace` / `ai-core` | Chatbot avatar animation |

### State Management
- **Server State**: TanStack Query (React Query) for API caching
- **Auth State**: LocalStorage + httpOnly cookies (JWT)
- **UI State**: React `useState` / `useReducer` per component
- **Session Sync**: `SessionSync` component hydrates auth on load

---

## 7. User Flows

### Flow 1: New User Onboarding
```
Landing → Click "Get Started" → /onboarding?flow=new
    → Select "New User" → Email/Password/Name → OTP verification
    → Redirect to /dashboard/user → Assessment Wizard
    → Complete Assessment → Portfolio Upload (Excel/Manual)
    → Score Calculation → View Report → Book Call (optional)
```

### Flow 2: Existing Client (Passwordless)
```
Landing → /onboarding?flow=existing
    → Enter Email → OTP sent → Verify OTP
    → If multiple accounts → Select Account → PAN Verification
    → Session established → Dashboard
```

### Flow 3: Portfolio Scoring
```
Dashboard → "Upload Portfolio" → Excel file (Holdings Statement or 6-col template)
    → Parse & validate → Preview (may require start dates for Holdings)
    → Save Portfolio → "Calculate Score"
    → Backend: fetch rows + assessment → 5-dimension scoring
    → Save Score → Return result → Dashboard displays report
```

### Flow 4: Archetype Quiz
```
/quiz → 5 behavioral questions → Weighted scoring
    → Result: Tiger (Aggressive) / Elephant (Conservative) / Deer (Anxious) / Fox (Opportunistic) / Lion (Strategic)
    → Personalized recommendation + "Start Assessment" CTA
```

---

## 8. Data Processing Pipelines

### Excel Upload Processing
```
Multer (memory, 5MB) → XLSX.read(buffer)
    │
    ├─► Holdings Statement Detection:
    │     Header row: "Scheme Name" + "Invested Value" + "Current Value"
    │     → Extract funds → Return { requiresDates: true, funds[] }
    │
    └─► Standard 6-Column Template:
          Fund Name | Type | Start Date | SIP Amount | Invested | Current Value
          → Validate each row (Zod) → Parse dates/numbers → Transaction insert
```

### CRM Folio Matching (Client Data)
```
User profile (PAN/email/name) → ExistingClient lookup (priority: PAN > email > name)
    → If found: Load folios with valuation data
    → If client has purchaseValue but folios don't:
         Proportional allocation by AUM + deterministic variation (sin-based)
    → Return enriched client data for portfolio import
```

---

## 9. Security & Compliance

### Authentication
- **JWT**: Access (15m) + Refresh (30d) tokens; httpOnly Secure cookies
- **Password**: bcryptjs (cost 12)
- **OTP**: 6-digit, 10-min expiry, rate-limited (3/hr)
- **Google OAuth**: ID token verification via `google-auth-library`

### API Protection
- **Helmet**: CSP, HSTS, X-Frame-Options, etc.
- **CORS**: Whitelist `FRONTEND_URL` (prod) / localhost (dev)
- **Rate Limit**: Global 200 req/15min/IP; Auth endpoints stricter
- **Body Limit**: 50kb JSON
- **File Upload**: MIME whitelist (.xlsx, .xls, .csv), 5MB max

### Authorization
- **Middleware**: `authMiddleware` → attaches `req.user` from JWT
- **Admin Middleware**: `adminMiddleware` → checks `role === ADMIN`
- **Ownership Checks**: Every portfolio/score/lead query filters by `userId`

### Data Privacy
- **PII**: PAN, Aadhaar, DOB stored but not logged
- **Encryption**: At rest via PostgreSQL; in transit via TLS
- **GDPR-ready**: User deletion cascades (portfolios, scores, assessments)

---

## 10. Deployment & Operations

### Environment Variables

#### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="min-32-char-random-string"
GMAIL_USER="noreply@domain.com"
GMAIL_APP_PASSWORD="app-specific-password"
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
GROK_API_KEY="xai-xxx"
FRONTEND_URL="https://finanalysis.site"
PORT=5000
NODE_ENV=production
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://api.finanalysis.site/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_SITE_URL=https://finanalysis.site
```

### Build & Run

```bash
# Backend
cd backend
npm run build      # prisma generate + tsc
npm run start      # node dist/index.js

# Frontend
cd frontend
npm run build      # next build
npm run start      # next start

# Dev (concurrent)
npm run dev        # root package.json
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name <migration_name>
npx prisma migrate deploy   # Production
```

---

## 11. Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (scoring) | Vitest/Jest | 90%+ on dimension functions |
| Integration (API) | Supertest | All routes |
| E2E | Playwright | Critical flows (auth, upload, score) |
| Type Safety | TypeScript strict | Zero `any` in production code |

---

## 12. Future Enhancements

| Area | Planned |
|------|---------|
| **Scoring** | ML anomaly detection (isolation forest on fund patterns) |
| **Portfolio** | Direct MF API integration (MF Central / BSE StarMF) |
| **Advisory** | Video call scheduling (Cal.com / Google Calendar) |
| **Payments** | Razorpay subscription for advisory plans |
| **Notifications** | WhatsApp Business API for OTP/alerts |
| **Analytics** | Mixpanel/PostHog for funnel tracking |
| **Multi-tenancy** | Advisor white-label subdomains |

---

## 13. File Reference Index

### Backend
```
src/
├── index.ts                 # App entry, middleware, routes
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   └── jwt.ts              # Token sign/verify
├── middleware/
│   ├── auth.ts             # JWT verification
│   ├── admin.ts            # Role check
│   └── error.ts            # Global error handler
├── routes/
│   ├── auth.ts             # Auth endpoints
│   ├── assess.ts           # Assessment CRUD
│   ├── portfolio.ts        # Upload + CRM matching
│   ├── score.ts            # Scoring trigger + fetch
│   ├── admin.ts            # Admin panel APIs
│   ├── chat.ts             # Grok AI chat
│   ├── leads.ts            # Lead capture
│   ├── contact.ts          # Contact form
│   └── support.ts          # Support tickets
└── services/
    ├── scoring/
    │   ├── index.ts        # Orchestrator (calculateScore)
    │   ├── goalAlignment.ts
    │   ├── assetAllocation.ts
    │   ├── diversification.ts
    │   ├── discipline.ts
    │   └── efficiency.ts
    ├── amfiService.ts      # Fund category/AMC detection + NAV/expense
    ├── otp.ts              # OTP gen/verify/store
    └── email.ts            # Nodemailer templates
```

### Shared
```
src/
├── index.ts                # Barrel export
├── types/
│   ├── user.ts
│   ├── assessment.ts
│   ├── portfolio.ts
│   ├── scoring.ts
│   └── payment.ts
└── constants/
    ├── goals.ts            # Labels, horizons, options
    └── scoring.ts          # Thresholds, weights, benchmarks
```

### Frontend
```
app/
├── layout.tsx              # Root layout, fonts, providers
├── page.tsx                # Landing (hero, archetype, calculators)
├── onboarding/page.tsx     # Auth flow
├── quiz/page.tsx           # Archetype quiz
├── dashboard/
│   ├── user/page.tsx       # User dashboard
│   ├── client/page.tsx     # Client dashboard
│   └── admin/page.tsx      # Admin dashboard
└── */page.tsx              # Calculator pages

components/
├── Navbar.tsx
├── Footer.tsx
├── ChatbotWidget.tsx
├── BookCallModal.tsx
├── CalculatorsCarousel.tsx
├── ServicesConstellation.tsx
├── LightTunnel.tsx / Prism.tsx / ColorBends.tsx
├   Scroll* components
├── ui/ (KnobSlider, AdisyonShader)
└── smoothui/ (AI orb, messages)

lib/
└── utils.ts                # cn() className helper
```

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **AMFI** | Association of Mutual Funds in India — NAV/expense ratio source |
| **AUM** | Assets Under Management |
| **CAGR** | Compound Annual Growth Rate |
| **ELSS** | Equity Linked Savings Scheme (tax-saving mutual fund) |
| **Folio** | Mutual fund account number linking investor to holdings |
| **SIF** | Systematic Investment Facility (step-up SIP variant) |
| **SWP** | Systematic Withdrawal Plan |
| **XIRR** | Extended Internal Rate of Return (for irregular cashflows) |
| **Archetype** | Behavioral investor profile (Tiger/Elephant/Deer/Fox/Lion) |

---

*Document version: 1.0 | Last updated: 2026-09-11*