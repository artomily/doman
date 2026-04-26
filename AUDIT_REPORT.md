# Wallo Backend Code Audit Report

**Date:** 2026-04-17  
**Version:** 1.0.0  
**Auditor:** Claude (AI Assistant)

---

## Executive Summary

Overall assessment: **GOOD** with some **CRITICAL** and **HIGH** priority issues that need to be addressed before production deployment.

| Category | Status | Score | Notes |
|----------|--------|-------|-------|
| Security | ⚠️ Needs Improvement | 6/10 | Several vulnerabilities found |
| Performance | ✅ Good | 7/10 | Some N+1 queries detected |
| PRD Compliance | ⚠️ Partial | 6/10 | Core features present, on-chain integration missing |
| Code Quality | ✅ Good | 8/10 | Clean code, good patterns |
| Business Logic | ⚠️ Incomplete | 5/10 | Smart contract integration missing |

---

## 1. SECURITY ISSUES

### 🔴 CRITICAL

#### 1.1 Hardcoded Default CRON_SECRET
**File:** `lib/constants.ts:17`
```typescript
export const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret-change-in-production';
```
**Issue:** Default value is a security risk. If env var is missing, it falls back to a known value.  
**Risk:** Attackers can bypass sync endpoint authentication  
**Fix:**
```typescript
export const CRON_SECRET = process.env.CRON_SECRET;
if (!CRON_SECRET) {
  throw new Error('CRON_SECRET must be set in production');
}
```

#### 1.2 WALLET_PRIVATE_KEY Exposed
**File:** `lib/viem.ts:27`
```typescript
const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}` | undefined;
```
**Issue:** Private key is loaded but never validated if required.  
**Risk:** Potential exposure or misconfiguration  
**Fix:** Add validation and ensure key is never logged.

### 🟠 HIGH

#### 1.3 Rate Limiting - In-Memory Store
**File:** `middleware/rate-limit.ts`
```typescript
const rateLimitStore = new Map<string, RateLimitEntry>();
```
**Issue:** In-memory store resets on server restart, allowing rate limit bypass.  
**Impact:** Distributed deployment (Vercel) won't enforce limits consistently  
**Fix:** Use Upstash Redis or Vercel KV for production.

#### 1.4 No Input Sanitization Before DB Operations
**File:** Multiple services
**Issue:** User input is validated with Zod but not sanitized for special characters.  
**Risk:** Potential log injection or XSS in responses  
**Fix:** Add sanitization layer for user-generated content.

#### 1.5 CORS Not Configured
**File:** `middleware/security.ts`
**Issue:** CORS configuration present but may be too permissive.  
**Fix:** Whitelist specific domains for production.

### 🟡 MEDIUM

#### 1.6 Error Messages May Expose Internal Information
**File:** `lib/api-response.ts:150`
```typescript
process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
```
**Issue:** In development, full error messages are shown.  
**Risk:** Information disclosure  
**Fix:** Ensure this never happens in production.

---

## 2. PERFORMANCE ISSUES

### 🔴 CRITICAL

#### 2.1 N+1 Query in Leaderboard
**File:** `services/leaderboard-service.ts:150-184`
```typescript
for (const address of allAddresses) {
  const reputation = await calculateUserReputation(address); // Query in loop
  const verifiedReports = await prisma.report.count(...); // Another query
  const totalVotes = await prisma.vote.count(...); // Another query
  const correctVotes = await prisma.vote.count(...); // Another query
}
```
**Issue:** For 1000 users, this makes 4000+ queries.  
**Impact:** Very slow leaderboard loading  
**Fix:** Batch all queries with `Promise.all()` or use raw SQL.

#### 2.2 No Database Query Timeout
**Issue:** Prisma queries have no timeout configured.  
**Risk:** Slow queries can block server indefinitely  
**Fix:** Add `prisma.$queryTimeout()` middleware.

### 🟠 HIGH

#### 2.3 No Caching Layer
**Issue:** Repeated expensive queries (stats, leaderboard) are not cached.  
**Impact:** High database load  
**Fix:** Implement Redis caching with TTL.

#### 2.4 Sync Service - Sequential External API Calls
**File:** `services/sync-service.ts`
**Issue:** External API calls are sequential, not parallel.  
**Fix:** Use `Promise.allSettled()` for independent calls.

---

## 3. PRD COMPLIANCE

### ❌ MISSING CRITICAL FEATURES

| Feature | PRD Requirement | Status | Impact |
|---------|----------------|-------|--------|
| **Smart Contract Integration** | "Viem: writeContract → CommunityReport.submitReport()" | ❌ Not implemented | **CRITICAL** - Core to "onchain" promise |
| **On-chain Vote Recording** | "txHash: On-chain vote tx" | ❌ txHash never populated | **HIGH** - Votes not recorded on-chain |
| **Event Listener** | "Event emitted → listener updates DB" | ❌ No listener service | **HIGH** - No real-time sync |
| **Base Registry Sync** | "syncBaseRegistry(): Scrape official Base dApps" | ❌ Not implemented | **MEDIUM** - Missing legit dApp source |

### ✅ IMPLEMENTED FEATURES

| Feature | Status | Quality |
|---------|--------|--------|
| Address CRUD | ✅ Complete | Good |
| Report System | ✅ Complete | Good (but no on-chain) |
| Voting System | ✅ Complete | Good (but no on-chain) |
| Scanner Service | ✅ Complete | Excellent - with type detection |
| Sync Service | ✅ Partial | Good (DeFiLlama unreliable, ScamSniffer working) |
| Leaderboard | ✅ Complete | Performance issues (N+1) |
| Stats Service | ✅ Complete | Good |
| Rate Limiting | ✅ Complete | Needs Redis for production |

---

## 4. BUSINESS LOGIC ISSUES

### 🔴 CRITICAL

#### 4.1 Report Status Never Updates
**Flow:**
1. User submits report → status: PENDING
2. Community votes → status should update to VERIFIED/REJECTED
3. **BUT:** No listener/worker to check thresholds and update status

**Current State:** Reports stay PENDING forever  
**Fix:** Implement background worker or webhook handler.

#### 4.2 Address Status Never Updates Based on Reports
**Flow:**
- PRD: "Address status updated → address moved to scam/legit"
- **Current:** Manual status update only

**Fix:** Implement trigger in report-service when threshold reached.

### 🟠 HIGH

#### 4.3 No Verification Workflow
**Issue:** PRD mentions "verifiedBy" and "verifiedAt" fields but no UI/API to mark addresses as verified.  
**Fix:** Add admin endpoint for address verification.

#### 4.4 ENS Resolution Not Exposed via API
**Issue:** ENS service created but no endpoint exposed.  
**Fix:** Create `/api/v1/resolve/[ens]` endpoint.

---

## 5. CODE QUALITY

### ✅ STRENGTHS

1. **Type Safety:** Excellent use of TypeScript and Prisma types
2. **Error Handling:** Consistent error handling pattern
3. **Code Organization:** Clean separation of concerns (services, middleware, lib)
4. **Naming:** Consistent, descriptive names
5. **Comments:** Good documentation in complex functions

### ⚠️ AREAS FOR IMPROVEMENT

1. **Magic Numbers:** Some hardcoded values should be in constants
2. **Duplicate Code:** Some repeated patterns in sync-service.ts
3. **Function Length:** Some functions are getting long (should break down)
4. **Missing Tests:** No test files found

---

## 6. DATABASE SCHEMA AUDIT

### ✅ EXCELLENT

The enhanced schema with new models is well-designed:

- **Proper Indexing:** All critical fields indexed
- **Cascade Deletes:** Properly configured
- **Enum Types:** Using Prisma enums for type safety
- **Relationships:** Well-defined foreign keys
- **Domain-Address Mapping:** ScamDomainAddress is perfect for ScamSniffer format

### Minor Issues

1. **Missing Index:** `@@index([source, category])` on ExternalSource might help sync performance
2. **No Composite Index:** `@@index([status, riskScore, category])` on Address could optimize common queries

---

## 7. API ENDPOINT AUDIT

### ✅ IMPLEMENTED (15 endpoints)

| Endpoint | Method | Status | Auth | Rate Limit |
|----------|--------|--------|------|------------|
| /api/health | GET | ✅ | ❌ | ❌ |
| /api/v1/address/[address] | GET | ✅ | ❌ | Medium |
| /api/v1/dapps | GET | ✅ | ❌ | Loose |
| /api/v1/report | POST | ✅ | ❌ | Strict |
| /api/v1/reports | GET | ✅ | ❌ | Medium |
| /api/v1/reports/[id]/vote | POST | ✅ | ❌ | Strict |
| /api/v1/scan/[address] | GET | ✅ | ❌ | Medium |
| /api/v1/scan/batch | POST | ✅ | ❌ | Medium |
| /api/v1/search | GET | ✅ | ❌ | Loose |
| /api/v1/stats | GET | ✅ | ❌ | Loose |
| /api/v1/leaderboard | GET | ✅ | ❌ | Loose |
| /api/v1/leaderboard/[address] | GET | ✅ | ❌ | Loose |
| /api/v1/sync | POST | ✅ | ✅ (CRON_SECRET) | ❌ |
| /api/v1/check-domain | GET | ✅ | ❌ | Loose |
| /api/v1/scam-domains | GET | ✅ | ❌ | Loose |

### ❌ MISSING (PRD required)

| Endpoint | Method | Priority |
|----------|--------|----------|
| /api/v1/resolve/[ens] | GET | HIGH |
| /api/v1/address/[address]/ens | GET | MEDIUM |

---

## 8. DEPENDENCIES AUDIT

### ✅ SECURE

```json
{
  "dependencies": {
    "next": "^16.2.3",        // Latest
    "react": "^19.0.0",        // Latest
    "@prisma/client": "^5.22.0",
    "viem": "^2.x",            // Latest
    "zod": "^3.x"              // Latest
  }
}
```

### ⚠️ OUTDATED

- None - all dependencies are up to date

---

## 9. RECOMMENDATIONS

### IMMEDIATE (Before Production)

1. **Fix CRON_SECRET default** - Remove fallback value
2. **Add database query timeouts** - Prevent hanging queries
3. **Fix N+1 in leaderboard** - Batch queries
4. **Add caching layer** - Redis/Vercel KV
5. **Use Redis for rate limiting** - Not in-memory
6. **Add request validation middleware** - Verify all inputs

### SHORT TERM (Week 1)

1. **Implement smart contract integration** - Critical for "onchain" promise
2. **Add background worker** - For vote counting and status updates
3. **Create ENS resolution endpoints** - Already have service, just need routes
4. **Add tests** - At least API endpoint tests
5. **Implement syncBaseRegistry()** - Missing legit dApp source

### MEDIUM TERM (Month 1)

1. **Add monitoring/alerting** - Sentry for errors, uptime monitoring
2. **Implement proper logging** - Structured logging for production
3. **Add API documentation** - Swagger/OpenAPI
4. **Performance testing** - Load test all endpoints
5. **Security audit** - Third-party security review

---

## 10. SUMMARY SCORE

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Security | 6/10 | 30% | 1.8 |
| Performance | 7/10 | 20% | 1.4 |
| PRD Compliance | 6/10 | 25% | 1.5 |
| Code Quality | 8/10 | 15% | 1.2 |
| Business Logic | 5/10 | 10% | 0.5 |

**Overall: 6.4/10** - **GOOD** with improvements needed

---

## 11. TESTING CHECKLIST

Before deployment, ensure:

- [ ] All environment variables are set
- [ ] Database migrations applied
- [ ] Rate limiting uses Redis (not in-memory)
- [ ] CRON_SECRET is strong and unique
- [ ] WALLET_PRIVATE_KEY is secured
- [ ] CORS is properly configured
- [ ] All endpoints have rate limiting
- [ ] Input validation works on all endpoints
- [ ] Error handling doesn't expose sensitive data
- [ ] Database queries have timeouts
- [ ] Smart contract integration is tested
- [ ] Background worker is operational
- [ ] Monitoring/alerting is set up
- [ ] Load testing is completed
- [ ] Security review is done

---

**Audit Completed:** 2026-04-17  
**Next Steps:** Fix critical issues, update Postman collection, run testing.
