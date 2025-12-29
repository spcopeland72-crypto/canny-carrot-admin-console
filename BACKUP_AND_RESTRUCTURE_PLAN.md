# Complete Backup & Workspace Restructure Plan

## Current Situation

**Total Workspace Size**: ~7.2 GB  
**Current Location**: `C:\Canny Carrot\`  
**Issue**: Too large for efficient Cursor indexing, causing substrate resets

---

## Part 1: Backup Strategy

### Backup Location
**Primary Backup**: `C:\WORKSPACE_FULL_BACKUP_[timestamp]\`  
**Reason**: Outside workspace to avoid recursion, preserves everything

### What Gets Backed Up
✅ **EVERYTHING** - Complete 1:1 copy including:
- All source code (`.ts`, `.tsx`, `.js`, `.jsx`)
- All `node_modules/` directories
- All build outputs (`.next`, `dist`, `build`)
- All assets and images
- All git repositories (including `.git/` folders)
- All configuration files
- All documentation
- All backup/legacy directories
- All archives (`.zip`, `.tar.gz`)

⚠️ **CRITICAL SECTIONS - SPECIAL ATTENTION**:
- **`Cursor/` directory (723 MB)** - COMPLETE backup, zero exclusions
  - `aureon-cursor-prime/` - Aureon Continuum identity system
  - All enriched thread data (Aureon_Claude, Aureon_GPT, etc.)
  - Mesh router with `@newton-mesh` packages
  - All Newton AIIS specifications
  - All processing scripts and thread records
- **All Aureon-related files** - Every mention of Aureon preserved
- **All Newton AIIS work** - Complete specification and implementation
- **All continuum records** - Thread deltas, PACK files, persona states

**Every single file** - nothing excluded from backup

### Backup Method
**Tool**: `robocopy` (fast, preserves permissions, creates log)  
**Command**:
```powershell
robocopy "C:\Canny Carrot" "C:\WORKSPACE_FULL_BACKUP_[timestamp]" /E /COPYALL /R:3 /W:5 /MT:8 /LOG:"C:\WORKSPACE_FULL_BACKUP_[timestamp]\backup_log.txt" /XD "C:\WORKSPACE_FULL_BACKUP_*"
```

**Switches**:
- `/E`: Copy all subdirectories (including empty)
- `/COPYALL`: Copy all file attributes and permissions
- `/R:3`: Retry 3 times on failure
- `/W:5`: Wait 5 seconds between retries
- `/MT:8`: Multi-threaded (8 threads) for speed
- `/LOG`: Create detailed log file
- `/XD`: Exclude backup directories (avoid recursion)

### Backup Verification
After backup completes:
1. Check log file for errors
2. Compare file counts: `(Get-ChildItem -Recurse -File).Count`
3. Compare total size: `(Get-ChildItem -Recurse -File | Measure-Object Length -Sum).Sum`
4. Spot-check critical directories
5. Verify git repos are intact

---

## Part 2: Current Filesystem Structure Analysis

### Large Directories (Top 10)
Based on analysis:

| Directory | Size (MB) | Status | Action |
|-----------|-----------|--------|--------|
| `Signup-landing page/` | ~1,840 | Active | Keep source, exclude assets |
| `CannyCarrot_OfflineReady_v3.3_FullSuite/` | ~800 | Legacy | Archive/Move |
| `Cursor/` | ~723 | Active | Keep essential, exclude large subdirs |
| `canny-carrot-design-v1.2.1-full/` | ~441 | Legacy | Archive/Move |
| `canny-carrot-design-v1.2.1b-full/` | ~441 | Legacy | Archive/Move |
| `canny-carrot-mobile-app/` | ~438 | Active | Keep source, exclude node_modules |
| `Canny-carrot-website/` | ~437 | Legacy? | Archive/Move |
| `canny-carrot-business-app-BACKUP-SAFE/` | ~372 | Backup | Archive/Move |
| `canny-carrot-business-app-BACKUP-2025-12-10-1623/` | ~372 | Backup | Archive/Move |
| `canny-carrot-business-app/` | ~364 | Active | Keep source, exclude node_modules |

### File Type Breakdown
- **.js files**: ~1,706 MB (mostly `node_modules`)
- **.node files**: ~1,271 MB (binary modules)
- **.zip files**: ~972 MB (archives)
- **Images** (`.png`, `.jpeg`): ~800 MB
- **Source maps** (`.map`): ~435 MB
- **Git packs** (`.pack`): ~295 MB
- **Source code** (`.ts`): ~243 MB ⭐ **THIS IS WHAT WE KEEP**

---

## Part 3: Proposed Optimized Structure

### Structure Goal
**Target**: <500 MB indexed by Cursor  
**Method**: `.cursorignore` excludes large files, keeps source code

### Directory Categories

#### ✅ ACTIVE PROJECTS (Keep in workspace)
```
C:\Canny Carrot\
├── canny-carrot-admin-app/          # Active - Next.js admin console
│   ├── src/                          ✅ Index
│   ├── app/                          ✅ Index
│   ├── package.json                  ✅ Index
│   ├── tsconfig.json                 ✅ Index
│   ├── node_modules/                 ❌ Exclude
│   └── .next/                        ❌ Exclude
│
├── canny-carrot-api/                 # Active - API server
│   ├── src/                          ✅ Index
│   ├── package.json                  ✅ Index
│   ├── tsconfig.json                 ✅ Index
│   ├── node_modules/                 ❌ Exclude
│   └── dist/                         ❌ Exclude
│
├── canny-carrot-business-app/        # Active - React Native business app
│   ├── src/                          ✅ Index
│   ├── package.json                  ✅ Index
│   ├── node_modules/                 ❌ Exclude
│   └── build/                        ❌ Exclude
│
├── canny-carrot-admin-mobile-app/    # Active - Mobile admin app
│   ├── src/                          ✅ Index
│   ├── package.json                  ✅ Index
│   ├── node_modules/                 ❌ Exclude
│   └── .expo/                        ❌ Exclude
│
├── Signup-landing page/              # Active - Website
│   ├── src/                          ✅ Index
│   ├── public/assets/logo.png        ✅ Index (essential only)
│   ├── package.json                  ✅ Index
│   ├── node_modules/                 ❌ Exclude
│   ├── .next/                        ❌ Exclude
│   └── public/assets/images/         ❌ Exclude (large)
│
└── Cursor/                           # ⚠️ CRITICAL - Newton AIIS & Aureon Continuum
    ├── aureon-cursor-prime/          ✅ Index - PACK identity system
    │   ├── CURSOR_PACK_v1.0.json     ✅ CRITICAL - Aureon identity
    │   ├── CURSOR_PERSONA_STATE.md   ✅ CRITICAL - Persona state
    │   └── (all identity files)      ✅ BACKUP ALL
    │
    ├── enriched/                     ✅ Index - All thread enrichment data
    │   ├── Aureon_Claude/           ✅ All Aureon Claude threads
    │   ├── Aureon_Cursor/           ✅ All Aureon Cursor threads
    │   ├── Aureon_GPT/              ✅ All Aureon GPT threads
    │   └── Aureon_Perplexity/       ✅ All Aureon Perplexity threads
    │
    ├── mesh-router/                  ✅ Index - Newton Mesh Router
    │   ├── src/                      ✅ Source code
    │   ├── packages/                 ✅ Packages
    │   ├── apps/                     ✅ Apps
    │   ├── node_modules/             ❌ Exclude (but BACKUP)
    │   └── @newton-mesh/            ✅ CRITICAL - Newton mesh packages
    │
    ├── (All .md specs)               ✅ Index - All specifications
    ├── (All .ts scripts)             ✅ Index - Processing scripts
    ├── (All thread records)          ✅ Index - Thread data
    ├── (All .txt/.docx files)        ✅ Index - Documentation
    │
    └── node_modules/                 ❌ Exclude from index (but FULLY BACKED UP)
```

**⚠️ CRITICAL**: The `Cursor/` directory contains:
- **Aureon Continuum identity** (PACK system)
- **Newton AIIS specifications**
- **All enriched thread data**
- **Mesh router implementation**
- **All processing scripts**
- **All continuum records**

**MUST BE FULLY BACKED UP - NO EXCLUSIONS**

#### 📦 ARCHIVE (Move to separate archive location)
```
C:\Canny Carrot Archive\
├── CannyCarrot_OfflineReady_v3.3_FullSuite/
├── canny-carrot-design-v1.2.1-full/
├── canny-carrot-design-v1.2.1b-full/
├── Canny-carrot-website/
├── CC/
├── New folder/
├── rollback-v1.2.1a/
├── BUSINESS_APP_LATEST_*/
├── CUSTOMER_APP_LATEST_*/
├── canny-carrot-business-app-BACKUP*/
└── canny-carrot-business-app-fresh/
```

**⚠️ IMPORTANT**: 
- **`Cursor/` directory is NEVER archived** - it stays in workspace
- All Aureon and Newton AIIS work remains active
- Only Canny Carrot legacy/backup directories are archived

**Archive Location Options**:
1. **Option A**: `C:\Canny Carrot Archive\` (same drive, different folder)
2. **Option B**: External drive (if available)
3. **Option C**: Compressed archives (`.zip`) - smaller but requires extraction

---

## Part 4: Implementation Steps

### Step 1: Create Full Backup ⚠️ DO THIS FIRST
```powershell
# 1. Create backup directory outside workspace
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$backupDest = "C:\WORKSPACE_FULL_BACKUP_$timestamp"
New-Item -ItemType Directory -Path $backupDest -Force

# 2. Run robocopy backup
robocopy "C:\Canny Carrot" $backupDest /E /COPYALL /R:3 /W:5 /MT:8 /LOG:"$backupDest\backup_log.txt" /XD "WORKSPACE_FULL_BACKUP_*"

# 3. Verify backup
Write-Host "Backup completed. Check log: $backupDest\backup_log.txt"
```

### Step 2: Verify Backup Integrity
```powershell
# Count files in source
$sourceFiles = (Get-ChildItem "C:\Canny Carrot" -Recurse -File).Count

# Count files in backup
$backupFiles = (Get-ChildItem $backupDest -Recurse -File).Count

# Compare
if ($sourceFiles -eq $backupFiles) {
    Write-Host "✅ Backup verified: $sourceFiles files matched" -ForegroundColor Green
} else {
    Write-Host "⚠️ File count mismatch! Check backup log." -ForegroundColor Yellow
}
```

### Step 3: Update .cursorignore (Already Done ✅)
The `.cursorignore` file has been updated to exclude:
- All `node_modules/`
- All build outputs
- All media files
- All archives
- All binaries

**This does NOT delete files** - it only affects what Cursor indexes.

### Step 4: Archive Large Legacy Directories (Optional)
```powershell
# Create archive location
$archiveDest = "C:\Canny Carrot Archive"
New-Item -ItemType Directory -Path $archiveDest -Force

# Move (not copy) legacy directories
$legacyDirs = @(
    "CannyCarrot_OfflineReady_v3.3_FullSuite",
    "canny-carrot-design-v1.2.1-full",
    "canny-carrot-design-v1.2.1b-full",
    "Canny-carrot-website",
    "CC",
    "New folder",
    "rollback-v1.2.1a"
)

foreach ($dir in $legacyDirs) {
    if (Test-Path "C:\Canny Carrot\$dir") {
        Move-Item -Path "C:\Canny Carrot\$dir" -Destination "$archiveDest\" -Force
        Write-Host "✅ Moved: $dir" -ForegroundColor Green
    }
}
```

### Step 5: Let Cursor Re-index
After `.cursorignore` update:
1. Cursor will automatically re-index
2. Only files NOT in `.cursorignore` will be indexed
3. Expected indexed size: <500 MB
4. All source code remains accessible

---

## Part 5: What Gets Indexed vs What's Excluded

### ✅ Indexed by Cursor (<500 MB target)
- All `.ts`, `.tsx`, `.jsx` source files (~243 MB)
- **ALL `Cursor/` directory files** (specs, scripts, enriched data) (~200 MB)
  - `aureon-cursor-prime/` - FULLY indexed
  - All `.md` specifications
  - All `.ts` processing scripts
  - All enriched thread data
  - All thread records
- `package.json` files (~5 MB)
- `tsconfig.json` files (~1 MB)
- Essential documentation (`.md` in root) (~10 MB)
- Essential logo files only (~1 MB)
- **Total**: ~460 MB (under 500 MB target)

### ❌ Excluded from Indexing (but files remain on disk)
- `node_modules/` (~1,700 MB)
- Build outputs (~500+ MB)
- Media files (~800 MB)
- Archives (~1,000 MB)
- Binaries (~1,300 MB)
- Source maps (~435 MB)
- Legacy/backup directories (~2,000+ MB)

---

## Part 6: Safety Guarantees

### ✅ Files Are NOT Deleted
- `.cursorignore` only affects **indexing**, not file deletion
- All files remain on disk
- Can access any file at any time
- Git repositories fully intact
- Can revert `.cursorignore` changes anytime

### ✅ Backup Preserves Everything
- Complete 1:1 copy
- All file attributes preserved
- Git history intact
- Can restore entire workspace from backup

### ✅ Reversibility
- Can undo `.cursorignore` changes
- Can restore archived directories
- Can restore from backup if needed

---

## Part 7: Expected Results

### Before Optimization
- **Total workspace**: ~7.2 GB
- **Cursor indexed**: ~7.2 GB (everything)
- **Indexing time**: Slow, causes resets
- **Memory usage**: High

### After Optimization
- **Total workspace**: ~7.2 GB (unchanged - files still there)
- **Cursor indexed**: <500 MB (only source code)
- **Indexing time**: Fast
- **Memory usage**: Low
- **Substrate resets**: Eliminated

---

## Summary

**Action Plan**:
1. ✅ Create full backup (outside workspace)
2. ✅ Verify backup integrity
3. ✅ `.cursorignore` already updated (no file deletion)
4. ⏳ Optional: Archive legacy directories (can do later)
5. ⏳ Let Cursor re-index automatically

**Key Point**: **No files are deleted**. `.cursorignore` only tells Cursor what to index. All files remain accessible on disk.

