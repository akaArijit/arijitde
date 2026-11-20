# FinAnalysis Platform - Implementation Plan

## Executive Summary

Based on comprehensive codebase analysis, this plan addresses critical issues, technical debt, and missing features across the FinAnalysis monorepo.

## Current State Summary

### ✅ Completed (Phases 1-3)
- Backend modularization: Split `admin.ts` into 8 feature routers
- Extracted services: `ClientImportService`, `FolioImportService`, `ValuationImportService`
- Moved availability from JSON file to Prisma database
- Extracted shared utilities: `createTokenPair`, `ExcelParser`
- Added React Query provider and admin hooks
- Generated admin API types from OpenAPI spec
- Added React Query hooks for admin endpoints
- Fixed Buffer handling, Prisma imports, TypeScript errors
- Added scoring engine tests (15 tests), AMFI service tests (18 tests)

### 🔴 Critical (Must Fix - Week 1)
| # | Issue | Location | Effort | Risk |
|---|-------|----------|--------|------|
| 1 | **Admin Dashboard** - 4,736 lines single component | `frontend/app/dashboard/admin/page.tsx` | 3 days | 🔴 Critical - Unmaintainable, slow HMR |
| 2 | **Admin Routes** - 2,334 lines in single file | `backend/src/routes/admin.ts` | 2 days | High - Merge conflicts, testing |
| 3 | **Duplicate Excel Parsing** | 3 locations (portfolio/folio/clients) | 1 day | High - Bug fix ×3 |
| 4 | **Availability** - JSON file (no DB) | `backend/src/routes/admin/availability.ts` | 1 day | Data integrity |

### 🟡 High Priority (Week 2)
| # | Issue | Location | Effort |
|---|-------|----------|--------|
| 5 | Admin Dashboard - Split into 6 tab components | `frontend/app/dashboard/admin/page.tsx` | 3 days |
| 6 | Admin Routes - Split into 8 feature routers | `backend/src/routes/admin.ts` | 2 days |
| 7 | Admin Dashboard - Extract shared UI components | `DataTable`, `DetailDrawer`, `UploadZone` | 2 days |
| 10 | Extract `ExcelParser` service | 3 duplicates | 1 day |
| 11 | Move availability to Prisma | JSON file → DB | 1 day |
| 12 | Fix `any` types in admin hooks | 167 lint errors | 1 day |

### 🟡 Medium Priority
| # | Issue | Location |
|---|-------|----------|
| 13 | Generate OpenAPI from code (tsoa/zod-openapi) |
| 14 | Add contract tests for success responses |
| 15 | Write E2E tests for critical flows |
| 16 | Generate frontend types from OpenAPI |
| 17 | Replace Redis `KEYS` with `SCAN` |
| 18 | Add request ID propagation to AMFI service |
| 19 | Add password strength meter component |
| 20 | Add request ID propagation to AMFI service |

---

## Phase 1: Critical Fixes (Week 1)

### Task 1.1: Extract Excel Parser Utility (1 day)
**Files to create:**
- `backend/src/utils/excelParser.ts` - Shared `ExcelParser` class
- Update: `portfolio.ts`, `folios.ts`, `clients.ts` to use shared parser

**Justification:** 3 duplicate implementations of `parseExcelNumber`, `parseExcelDate`, `getRowValue`, `findHeaderRowIndex`

### Task 1.2: Move Availability to Prisma (1 day)
**Files to create:**
- `prisma/schema.prisma` - Add `AvailabilitySlot` model
- `backend/src/services/availabilityService.ts`
- Update `backend/src/routes/admin/availability.ts`

### Task 1.3: Extract Excel Parser Utility (1 day)
**Files to create:**
- `backend/src/utils/excelParser.ts` - Shared `ExcelParser` class
- Update: `portfolio.ts`, `folios.ts`, `clients.ts`

### Task 1.4: Fix TypeScript Errors (1 day)
- Fix `Buffer<ArrayBuffer>` → `Buffer` in 3 files
- Replace `any` → `unknown` in hooks
- Fix `any` in admin hooks (167 lint errors)

---

## Phase 2: Backend Modularization (Week 2)

### Task 2.1: Split Admin Routes (2 days)
**Current:** `backend/src/routes/admin.ts` (2,334 lines)
**Target Structure:**
```
backend/src/routes/admin/
├── index.ts              # Router aggregator
├── stats.ts              # GET /stats
├── users.ts              # GET/POST /users, POST /users/:id/role
├── clients.ts            # GET/POST/DELETE /existing-clients, /portfolio-valuations
├── folios.ts             # GET/POST/DELETE /folios
├── valuations.ts         # GET/POST/DELETE /portfolio-valuations
├── queries.ts            # GET/PATCH/DELETE /queries
└── availability.ts       # GET/POST /availability
```

### Task 2.2: Extract Shared Services (1 day)
- `ExcelParser` utility class
- `AvailabilityService` class
- `ClientImportService` class

---

## Phase 3: Frontend Refactoring (Week 3-4)

### Task 3.1: Create Admin Layout (1 day)
**Files to create:**
- `frontend/app/dashboard/admin/layout.tsx`
- `frontend/components/admin/AdminSidebar.tsx`
- `frontend/components/admin/AdminHeader.tsx`
- `frontend/components/admin/AdminTabs.tsx`

### Task 3.2: Extract Tab Components (3 days)
**Components to create:**
- `UsersTab.tsx` - User management table
- `ConsultationsTab.tsx` - Advisory sessions management
- `ExistingClientsTab.tsx` - Client database with folios
- `LiveSessionsTab.tsx` - Premium client sessions
- `AUMTab.tsx` - AUM distribution + pie chart
- `QueriesTab.tsx` - Support queries management

### Task 3.3: Shared UI Components (2 days)
- `DataTable.tsx` - Reusable table with sorting, pagination, search
- `DetailDrawer.tsx` - Slide-in drawer for details
- `UploadZone.tsx` - Drag-drop file upload with progress
- `ConfirmModal.tsx` - Reusable confirmation dialog
- `UploadZone.tsx` - Reusable file upload component

### Task 3.4: Create Missing Components (1 day)
- `PasswordStrengthMeter.tsx` (referenced in onboarding)
- `PasswordStrengthMeter.tsx` for admin dashboard
- `DetailDrawer.tsx` - Slide-in detail panel

### Task 3.5: Replace `any` Types (2 days)
- Replace `any` with generated types from OpenAPI
- Add proper types to `admin-hooks.ts` and `api-hooks.ts`
- Run `eslint --fix` to auto-fix 62 issues

---

## Phase 4: Testing & OpenAPI (Week 5-6)

### Task 4.1: Testing (3 days)
| Test Type | Current | Target |
|-----------|---------|--------|
| Unit Tests | 5 (scoring only) | >80% coverage |
| Contract Tests | 10 (validation only) | All endpoints |
| E2E Tests | 7 (basic nav) | Critical flows |
| Load Testing | None | Critical paths |

### Task 4.1: OpenAPI Generation (1 day)
- Replace manual `openapi.json` with `tsoa` or `zod-openapi`
- Auto-generate frontend types from OpenAPI
- Remove manual `openapi.json` maintenance

### Task 4.3: E2E Tests (2 days)
Critical flows to test:
1. Auth: Register → OTP → Login → Dashboard
2. Assessment → Portfolio Upload → Score Calculation
3. Admin: Client Import → Valuation Upload → Session Confirm
4. Admin: Client Search → Folio View → Valuation Update

---

## Phase 5: Performance & Polish (Week 6)

### Task 5.1: Performance (2 days)
- Add `React.memo` / `useMemo` / `useCallback` to admin components
- Implement `react-window` for virtualized tables (1000+ rows)
- Code-split by tab (`lazy(() => import(...))`)
- Add cursor-based pagination (replace offset)

### Task 5.2: Security & Observability (1 day)
- Move availability to database (already in Phase 1)
- Add request ID propagation to AMFI service
- Replace Redis `KEYS` with `SCAN` in cache invalidation
- Add request ID propagation to AMFI service logs

### Task 5.3: Documentation & Polish (1 day)
- Generate frontend types from OpenAPI spec
- Add Storybook for admin components
- Add bundle size budgets
- Add error boundaries

---

## Effort Summary

| Phase | Duration | Engineers |
|-------|----------|-----------|
| Phase 1: Critical Fixes | 1 week | 1-2 |
| Phase 2: Backend Modularization | 1 week | 1-2 |
| Phase 3: Frontend Architecture | 2 weeks | 2 |
| Phase 4: Testing & OpenAPI | 1 week | 1-2 |
| Phase 5: Performance & Polish | 1 week | 1-2 |
| **Total** | **6 weeks** | **2-3 engineers** |

---

## Quick Wins (Do This Week)

| Task | Effort | Impact |
|------|--------|--------|
| Extract `ExcelParser` utility | 1 day | Eliminates 3 dupes |
| Move availability to Prisma | 1 day | Data integrity |
| Fix `any` types in hooks | 0.5 day | Type safety |
| Add `PasswordStrengthMeter` | 0.5 day | UX + missing component |
| Run `eslint --fix` | 30 min | 62 auto-fixes |

---

## Success Criteria

- [ ] All 167 lint errors resolved
- [ ] Admin dashboard < 500 lines (split into 6+ components)
- [ ] Admin routes < 300 lines each (8 files)
- [ ] OpenAPI spec generated from code
- [ ] 80% unit test coverage
- [ ] 10 E2E tests for critical flows
- [ ] All `any` types replaced with `unknown`/generics
- [ ] Availability in DB with transactions
- [ ] OpenAPI spec generated from code
- [ ] 10 E2E tests for critical flows
- [ ] Bundle size < 200KB gzipped
- [ ] Lighthouse score > 90

---

## Questions for Clarification

1. **Team Size**: How many engineers available? (Affects parallelization)
2. **Deadline**: Any hard deadline for specific features?
3. **CSV Volume**: Typical upload sizes? (Affects streaming vs memory parsing)
4. **Admin Users**: Current/expected concurrent admin users?
5. **Known Bugs**: Any specific bugs blocking users today?

---

**Recommendation:** Start with Phase 1 (Critical Fixes) this week. The Excel parser extraction and availability migration are low-risk, high-impact changes that unblock subsequent work.