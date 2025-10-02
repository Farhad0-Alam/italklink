# 🔍 Complete Debugging Guide for 2TalkLink

## Table of Contents
1. [Quick Start](#quick-start)
2. [Development Debugging](#development-debugging)
3. [Production Debugging](#production-debugging)
4. [Common Issues & Solutions](#common-issues--solutions)
5. [Performance Monitoring](#performance-monitoring)
6. [Database Debugging](#database-debugging)

---

## Quick Start

### Check if App is Working
```bash
# 1. Check server logs (in Replit Console)
# Look for: "serving on port 5000"

# 2. Open browser DevTools (F12)
# Check Console tab for errors

# 3. Check Network tab
# See if API calls are returning 200/304
```

---

## Development Debugging

### 1. Server-Side Debugging

#### A. View Real-Time Logs
- **Replit Console Tool** shows all server logs automatically
- Look for these log types:
  - `[express]` - API endpoint calls
  - `[API_REQUEST]` - Request details
  - `[API_PERFORMANCE]` - Response times
  - `[SLOW_REQUEST]` - Requests over 2 seconds
  - `Failed to...` - Error messages

#### B. Common Log Patterns
```
✅ Good: GET /api/auth/user 200 in 50ms
❌ Error: GET /api/business-cards 500 in 100ms
⚠️ Warning: [SLOW_REQUEST] GET /api/data took 3000ms
```

#### C. Add Custom Debug Logging
```typescript
// In any server file:
console.log('[DEBUG]', 'Variable name:', yourVariable);
console.error('[ERROR]', 'Something failed:', error);
```

### 2. Frontend Debugging

#### A. Browser Developer Tools (F12)
1. **Console Tab**
   - JavaScript errors
   - Network failures
   - React warnings
   - Custom console.log output

2. **Network Tab**
   - See all API requests
   - Check response status (200, 404, 500)
   - View request/response data
   - Check request headers

3. **React DevTools** (Install extension)
   - Inspect component state
   - View props
   - Check re-render causes

#### B. Add Debug Logging
```typescript
// In React components:
console.log('Component state:', state);
console.log('API response:', data);
console.error('Error occurred:', error);
```

### 3. Database Debugging

#### A. Check Database Queries
```typescript
// All database operations are logged automatically
// Look for Drizzle ORM errors in console
```

#### B. Run Manual Queries
Use the SQL tool in Replit:
```sql
-- Check table structure
SELECT * FROM users LIMIT 5;

-- Check relationships
SELECT u.email, COUNT(bc.id) as card_count 
FROM users u 
LEFT JOIN business_cards bc ON u.id = bc.user_id 
GROUP BY u.email;
```

### 4. API Endpoint Testing

#### A. Test with Browser
Open these URLs directly:
- `http://localhost:5000/api/auth/user` (if logged in)
- `http://localhost:5000/api/health` (if exists)

#### B. Test with Curl
```bash
curl http://localhost:5000/api/business-cards
```

---

## Production Debugging

### 1. Replit Publishing Dashboard

After publishing your app, access monitoring tools:

#### A. **Logs Tab**
- Real-time production logs
- Filter by error level
- Search for specific terms
- Download logs for analysis

#### B. **Resources Tab**
- CPU usage
- Memory consumption
- Identify resource spikes

#### C. **Analytics Tab**
- Page views
- Top URLs
- HTTP status codes
- Request duration metrics

### 2. Production-Specific Issues

#### A. CSRF/CORS Errors
```
Error: INVALID_ORIGIN_FOR_CREDENTIALED_REQUEST
```
**Solution:** Verify `.replit.app` is in allowed origins (✅ FIXED)

#### B. 404 Errors on API Routes
**Causes:**
- Routes not registered
- Authentication required but not logged in
- Wrong URL path

**Debug:**
1. Check server logs for route registration
2. Verify authentication status
3. Check exact URL being called

#### C. 500 Internal Server Errors
**Debug Steps:**
1. Check production logs in Publishing dashboard
2. Look for stack traces
3. Common causes:
   - Database connection issues
   - Missing environment variables
   - Uncaught exceptions

### 3. Check Production Environment

```typescript
// Add this to see environment in logs:
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
```

---

## Common Issues & Solutions

### Issue 1: White Screen / Blank Page
**Symptoms:** Nothing renders, blank page

**Debug:**
1. Open Browser DevTools (F12)
2. Check Console for React errors
3. Check Network tab for failed asset loads

**Common Causes:**
- JavaScript bundle failed to load (CSP blocking)
- React component threw error
- API endpoint unreachable

**Solution:**
- Fixed CSP headers (✅ DONE)
- Check for console errors
- Add error boundaries

### Issue 2: API Returns 403 Forbidden
**Symptoms:** `INVALID_ORIGIN_FOR_CREDENTIALED_REQUEST`

**Solution:** ✅ Already fixed - added `.replit.app` to allowed origins

### Issue 3: API Returns 401 Unauthorized
**Symptoms:** User not authenticated

**Debug:**
1. Check if user is logged in: `GET /api/auth/user`
2. Verify session cookie exists
3. Check authentication middleware

### Issue 4: Database Errors
**Symptoms:** 500 errors with database stack traces

**Common Causes:**
- Invalid query structure (nested selects) ✅ FIXED
- Missing relations
- Wrong data types

**Solution:**
```bash
# Push schema changes
npm run db:push --force
```

### Issue 5: Slow Performance
**Symptoms:** Requests taking >2 seconds

**Debug:**
1. Check `[SLOW_REQUEST]` logs
2. Look at `[API_PERFORMANCE]` times
3. Identify bottleneck

**Common Causes:**
- Missing database indexes
- N+1 query problems
- Large data transfers
- Unoptimized React re-renders

---

## Performance Monitoring

### 1. Server Performance

#### Watch for Slow Requests
```
[SLOW_REQUEST] GET /api/crm/contacts took 3500ms
```

#### Check Response Times
```
[API_PERFORMANCE] GET /api/business-cards - 200 - 50ms
```

### 2. Frontend Performance

#### Use Browser Performance Tab
1. Open DevTools → Performance
2. Click Record
3. Interact with app
4. Stop recording
5. Analyze timeline

#### React Profiler
```typescript
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={onRenderCallback}>
  <Dashboard />
</Profiler>
```

---

## Database Debugging

### 1. Check Connection
```typescript
// Add to server startup:
db.execute(sql`SELECT 1`).then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Database connection failed:', err);
});
```

### 2. Log All Queries (Development Only)
```typescript
// In drizzle config:
{
  logger: true  // Shows all SQL queries
}
```

### 3. Common Database Errors

#### "Cannot convert undefined or null to object"
**Cause:** Invalid Drizzle select structure (nested objects)
**Solution:** ✅ Fixed - flatten select fields

#### "Relation not found"
**Cause:** Missing joins or incorrect relation syntax
**Solution:** Check schema relations and add proper joins

---

## Emergency Debugging Checklist

When something breaks in production:

### Step 1: Check Logs (2 minutes)
- [ ] Open Replit Publishing → Logs tab
- [ ] Look for error messages
- [ ] Note the timestamp of first error

### Step 2: Check Browser Console (1 minute)
- [ ] Open DevTools (F12)
- [ ] Check Console tab for errors
- [ ] Check Network tab for failed requests

### Step 3: Verify Basic Functionality (3 minutes)
- [ ] Can you load the homepage?
- [ ] Can you login?
- [ ] Can API be reached at all?

### Step 4: Check Recent Changes (5 minutes)
- [ ] What was deployed recently?
- [ ] Were schema changes made?
- [ ] Were dependencies updated?

### Step 5: Quick Fixes to Try
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Check if issue exists in development
4. Restart the Replit

---

## Debugging Tools Summary

| Tool | Use Case | How to Access |
|------|----------|---------------|
| Replit Console | Server logs | Automatically shown |
| Browser DevTools | Frontend errors | Press F12 |
| Network Tab | API requests | F12 → Network |
| Publishing Logs | Production logs | Publishing → Logs |
| SQL Tool | Database queries | Replit workspace |
| React DevTools | Component debugging | Browser extension |

---

## Tips for Effective Debugging

### 1. Use Descriptive Log Messages
```typescript
// ❌ Bad
console.log(data);

// ✅ Good
console.log('[UserProfile] Fetched user data:', { 
  userId: data.id, 
  email: data.email 
});
```

### 2. Add Request IDs to Logs
Already implemented - every request has a unique ID:
```
[API_REQUEST] ... RequestID: req_1759420497835_av25u0g3x
```

### 3. Use Error Boundaries
```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

### 4. Monitor Production Regularly
- Check logs daily
- Set up alerts for 500 errors
- Monitor performance metrics

---

## Getting Help

### What to Include When Asking for Help:
1. **Error message** (full text)
2. **Steps to reproduce**
3. **Screenshots** (console, network tab)
4. **Server logs** (from Console or Publishing)
5. **What you've tried**

### Useful Commands:
```bash
# Check if server is running
curl http://localhost:5000/

# View all running processes
ps aux

# Check database connection
npm run db:push

# Clear node modules and reinstall
rm -rf node_modules && npm install
```

---

## Quick Reference: Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request worked |
| 304 | Not Modified | Using cached version (good) |
| 400 | Bad Request | Invalid data sent |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | CSRF/origin blocked ✅ FIXED |
| 404 | Not Found | Wrong URL or not logged in |
| 500 | Server Error | Bug in server code |

---

## Success! ✅

If you see these, your app is working correctly:
- ✅ No errors in browser console
- ✅ API requests return 200 or 304
- ✅ "serving on port 5000" in logs
- ✅ "[vite] connected" in browser console
- ✅ Database queries execute successfully

---

**Last Updated:** October 2, 2025
**Status:** All critical bugs fixed ✅
