# Canny Carrot Admin Console - Release Notes

## 2025-01-02 - Customer List Background and Clickability Fix

### Changes Made
- **Fixed blue background on customer records** - Removed conditional background color, all items now have white background
- **Fixed clickability** - Added stopPropagation to checkbox and star icon containers to prevent blocking row clicks
- **Ensured entire row is clickable** - onClick handler now works properly for the full row

### Technical Details
- Updated `EmailList.tsx` to use consistent `bg-white` for all items
- Added `onClick={(e) => e.stopPropagation()}` to checkbox and star containers
- Removed conditional `isRead` background logic that was causing blue/gray backgrounds

### Commit
- `[latest]` - Fix customer list blue background and clickability

---

## 2025-01-02 - UI Formatting and Clickability Fixes

### Changes Made
- **Added customer count to sidebar navigation** - Customers navigation item now displays count matching Members format
- **Made list items clickable** - Member and customer records are now clickable with onClick handler
- **Right-aligned preview text** - Status/tier text in list items is now right-aligned for better visual hierarchy
- **Customer list format matches members** - Consistent formatting between Members and Customers lists
- **Created web-compatible EmailList component** - Replaced React Native component with web-compatible version using standard HTML/CSS

### Technical Details
- Updated `AdminLayout.tsx` to accept and display `customersCount` prop
- Created `app/components/EmailList.tsx` with clickable items and right-aligned preview text
- Updated `app/page.tsx` to pass customer count to AdminLayout

### Commit
- `9c79b787` - Fix member/customer list formatting and clickability

---

## 2025-01-02 - Sidebar Navigation UI Restoration

### Changes Made
- **Restored left sidebar navigation** - Added vertical sidebar with navigation items: Members, Customers, Apps, Website, Email, Drafts, Archive, Trash
- **Logo positioned in top left** - Logo placed in sidebar header to fix top bar alignment
- **Top bar with search and refresh** - Main content area header with search input and refresh button
- **Consistent layout structure** - Matches previous UI structure from screenshot

### Technical Details
- Updated `AdminLayout.tsx` with flex layout: sidebar (264px) + main content area
- Added logo image component in sidebar header
- Navigation items with active state highlighting (blue background, right border)
- Member count displayed next to Members navigation item

### Commits
- `52f69a4b` - Restore sidebar navigation UI layout

---

## 2025-01-02 - Build Error Fixes

### Changes Made
- **Fixed TypeScript ViewType compatibility** - Exported ViewType from AdminLayout and imported in page.tsx
- **Removed deleted files from git tracking** - Cleaned up api-test, businesses/[id], and customers/[id] pages that were causing build errors

### Technical Details
- Exported `ViewType` from `AdminLayout.tsx` to ensure type compatibility
- Removed deleted files from git index to prevent build errors

### Commits
- `bfcd7d8b` - Fix TypeScript error: Export ViewType from AdminLayout and import in page.tsx
- `bf47078a` - Remove deleted api-test page.tsx from git tracking
- `528f9533` - Remove deleted business and customer detail pages from git

---

## 2025-01-02 - Redis Data Access Fix

### Changes Made
- **Updated Redis data retrieval to use KEYS pattern matching** - Changed from relying on index sets (businesses:all, customers:all) to using KEYS pattern matching
- **Fixed business and customer data display** - Data now loads correctly using same method as working db dump screen

### Technical Details
- Updated `businessData.getAll()` to use `redis.keys('business:*')` pattern matching
- Updated `customerData.getAll()` to use `redis.keys('customer:*')` pattern matching
- Filters out non-record keys (email indexes, nested keys) to only get actual business/customer records
- Uses MGET to fetch all records in parallel for performance

### Commits
- `eebab694` - Fix Redis data access: Use KEYS pattern matching instead of index sets

---

