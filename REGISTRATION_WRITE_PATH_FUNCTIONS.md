# Registration Write Path - Function List

**Document Created:** 2025-12-30  
**Purpose:** Complete list of all functions in the registration write path from form submission to Redis write

---

## Data Flow Path

```
Website Form → Next.js API Route → Redis Functions → API Server → Redis Database
```

---

## 1. Frontend Form Submission

### File: `Signup-landing page/src/pages/register.tsx`

#### Function: `onSubmit` Handler (Customer Form)
- **Lines:** ~175-260
- **Location:** Customer registration form
- **What it does:**
  - Validates password match
  - Validates terms consent
  - Prepares form data (removes password fields)
  - **Makes HTTP POST to:** `/api/send-verification`
  - Handles response and displays success/error modal

#### Function: `onSubmit` Handler (Business Form)
- **Lines:** ~651-730
- **Location:** Business registration form
- **What it does:**
  - Validates password match
  - Validates terms consent
  - Prepares form data (removes password fields)
  - **Makes HTTP POST to:** `/api/send-verification`
  - Handles response and displays success/error modal

---

## 2. Next.js API Route Handler

### File: `Signup-landing page/src/pages/api/send-verification.ts`

#### Function: `handler` (Default Export)
- **Type:** Next.js API Route Handler
- **Method:** POST
- **Endpoint:** `/api/send-verification`
- **What it does:**
  1. Validates request method (POST only)
  2. Validates required fields (formType, formData, email)
  3. Validates email format
  4. **CRITICAL STEP 1:** Calls `completeRegistration()` to write to Redis
  5. Generates verification token
  6. Stores pending registration token (for email verification)
  7. Sends verification email
  8. Returns success/error response

**Key Code Sections:**
- Lines 38-120: Redis write via `completeRegistration()`
- Lines 121-140: Token storage and email sending

---

## 3. Redis Registration Functions (Web Server)

### File: `Signup-landing page/src/lib/redis-registration.ts`

#### Function: `completeRegistration()`
- **Lines:** 191-222
- **Parameters:**
  - `recordKey`: Redis key (e.g., "business:123" or "customer:456")
  - `record`: Full record object to save
  - `recordId`: The ID within the record
  - `listKey`: Set key (e.g., "businesses:all" or "customers:all")
  - `emailIndexKey`: Email index key (e.g., "business:email:user@example.com")
  - `email`: Email address
- **What it does:**
  1. Calls `checkAPIHealth()` (non-blocking - continues on failure)
  2. Calls `saveRecordToRedis()` - Saves record and verifies it exists
  3. Calls `addRecordToList()` - Adds ID to list and verifies it's in list
  4. Calls `createEmailIndex()` - Creates email index (non-critical)
  5. Returns saved record

#### Function: `saveRecordToRedis()`
- **Lines:** 25-95
- **What it does:**
  1. Makes HTTP POST to `${apiUrl}/api/v1/redis/set`
  2. Verifies response is OK
  3. Verifies Redis SET command returned "OK"
  4. **Verification step:** Makes HTTP POST to `${apiUrl}/api/v1/redis/get`
  5. Verifies record exists in Redis
  6. Parses and validates saved data matches
  7. Returns saved record

#### Function: `addRecordToList()`
- **Lines:** 102-149
- **What it does:**
  1. Makes HTTP POST to `${apiUrl}/api/v1/redis/sadd`
  2. Verifies response is OK
  3. **Verification step:** Makes HTTP POST to `${apiUrl}/api/v1/redis/smembers`
  4. Verifies record ID is in the list
  5. Throws error if verification fails

#### Function: `createEmailIndex()`
- **Lines:** 156-179
- **What it does:**
  1. Makes HTTP POST to `${apiUrl}/api/v1/redis/set`
  2. Creates email index mapping (non-critical - logs warning on failure, doesn't throw)

#### Function: `checkAPIHealth()`
- **Lines:** 9-16
- **What it does:**
  1. Makes HTTP GET to `${apiUrl}/health`
  2. Verifies API server is responding
  3. Throws error if health check fails

**Constants:**
- `apiUrl`: `process.env.CANNY_CARROT_API_URL || 'https://api.cannycarrot.com'`

---

## 4. API Server Routes

### File: `canny-carrot-api/src/routes/redis.ts`

#### Function: `router.post('/:command')` - Redis Proxy Route
- **Endpoint:** `POST /api/v1/redis/:command`
- **Commands Used:**
  - `set`: Save record to Redis
  - `get`: Retrieve record from Redis (verification)
  - `sadd`: Add record ID to set (e.g., "businesses:all")
  - `smembers`: Get all members of set (verification)
- **What it does:**
  1. Validates command is in allowed list
  2. Logs all incoming requests with full details
  3. Executes Redis command via `redisClient`
  4. Returns result as JSON: `{ data: result }`
  5. Handles errors and returns 500 with error message

**Special Logging:**
- Logs customer registration data when `command === 'set'` and key starts with `'customer:'`
- Logs business registration data when `command === 'set'` and key starts with `'business:'`
- Logs when adding to lists (`sadd` on `businesses:all` or `customers:all`)

---

## 5. Redis Database

### Direct Redis Operations
- **Client:** `redisClient` (ioredis instance)
- **Operations:**
  - `SET key value`: Store record
  - `GET key`: Retrieve record
  - `SADD set member`: Add to set
  - `SMEMBERS set`: Get all members of set

---

## Summary

**Total Functions in Write Path:** 7

1. `register.tsx` - Customer form `onSubmit`
2. `register.tsx` - Business form `onSubmit`
3. `send-verification.ts` - API route `handler`
4. `redis-registration.ts` - `completeRegistration()`
5. `redis-registration.ts` - `saveRecordToRedis()`
6. `redis-registration.ts` - `addRecordToList()`
7. `redis.ts` - API server Redis proxy route

**HTTP Calls Made:**
- Website → `/api/send-verification` (Next.js API route)
- Next.js API route → `${apiUrl}/api/v1/redis/set` (API server)
- Next.js API route → `${apiUrl}/api/v1/redis/get` (API server - verification)
- Next.js API route → `${apiUrl}/api/v1/redis/sadd` (API server)
- Next.js API route → `${apiUrl}/api/v1/redis/smembers` (API server - verification)

**Verification Steps:**
1. After SET: GET the record back to verify it exists
2. After SADD: SMEMBERS the list to verify ID is in list

---

## Environment Variables Required

**Web Server (Vercel):**
- `CANNY_CARROT_API_URL`: API server URL (defaults to `https://api.cannycarrot.com`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Email configuration

**API Server:**
- `REDIS_URL`: Redis connection string
- Redis client connection configured in `canny-carrot-api/src/config/redis.ts`

---

## Error Handling

- All Redis operations throw errors if they fail
- Verification steps throw errors if data not found
- API server returns 500 status with error message on failures
- Web server catches errors and returns user-friendly messages

---

## Logging

All functions now include comprehensive logging:
- Timestamp
- Function name and step
- Request/response details
- Success/failure status
- Error details when failures occur

