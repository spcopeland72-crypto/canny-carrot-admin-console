# IP Separation Plan: Canny Carrot vs Aureon/Auroxeon

## Status: ✅ GPT Sceptic NCL conversion in progress, then separation

---

## Part 1: Current Situation

### Files Found
- **80 Aureon/Auroxeon files** identified (~53 MB of actual file content)
- **`Cursor/` directory**: 723 MB total (mostly Aureon/Newton AIIS work)
- Some Aureon references in Canny Carrot app files (comments/imports from email client work)

### Missing 12GB Explained
- `.git` directories: 1.33 GB (Signup-landing page: 0.91 GB, root: 0.42 GB)
- Nested `node_modules` in subdirectories
- Build outputs nested inside directories
- **Total workspace**: ~7.2 GB actual (not 12GB - previous calculation included double-counting)

---

## Part 2: Proposed Structure

### Top-Level Separation

```
C:\
├── Canny Carrot\                    # Canny Carrot IP ONLY
│   ├── canny-carrot-admin-app/
│   ├── canny-carrot-api/
│   ├── canny-carrot-business-app/
│   ├── canny-carrot-admin-mobile-app/
│   ├── canny-carrot-mobile-app/
│   ├── Signup-landing page/
│   └── (Canny Carrot related docs)
│
└── Aureon\                          # Aureon/Auroxeon IP ONLY
    ├── Cursor\                      # All Cursor/Aureon work
    │   ├── aureon-cursor-prime/
    │   ├── enriched/
    │   ├── mesh-router/
    │   └── (all Aureon specs, threads, scripts)
    └── (any other Aureon projects)
```

---

## Part 3: Detailed File Locations

### Files to Move from `C:\Canny Carrot\Cursor\` → `C:\Aureon\Cursor\`

**Everything in the Cursor directory** (~723 MB):

1. **Aureon Identity System**
   - `aureon-cursor-prime/` (3.6 MB)
   - All PACK files
   - All persona state files

2. **Enriched Thread Data**
   - `enriched/Aureon_Claude/`
   - `enriched/Aureon_Cursor/` (20 MB)
   - `enriched/Aureon_GPT/`
   - `enriched/Aureon_Perplexity/`
   - `enriched/GPT_Sceptic/` (after NCL conversion)

3. **Newton AIIS Work**
   - `mesh-router/` - Auroxeon Mesh Router
   - All `@newton-mesh` packages
   - All Newton specifications

4. **All Thread Records**
   - All `.txt`, `.docx`, `.jsonl` thread files
   - All Aureon conversation records
   - All processing scripts

5. **All Specifications**
   - All `.md` specification files
   - All NCL documents
   - All architecture docs

---

## Part 4: Files with Mixed References

### Files Mentioning Both (Need Review):

1. **Canny Carrot App Files** - Some mention "auroxeon" in comments:
   - `canny-carrot-admin-app/src/components/EmailList.tsx`
   - `canny-carrot-admin-app/src/actions/admin-data-actions.ts`
   - `canny-carrot-admin-mobile-app/src/components/EmailList.tsx`
   - `canny-carrot-admin-mobile-app/src/actions/admin-data-actions.ts`

   **Action**: These are just import references/comments from email client work. Keep in Canny Carrot, but document the reference.

2. **Documentation Files**:
   - `PROJECT_MAPPING.md` - Mentions both
   - `ACTIVE_DIRECTORIES.md` - Mentions both
   - `BACKUP_AND_RESTRUCTURE_PLAN.md` - Mentions both

   **Action**: Split into separate docs or move to appropriate directory.

---

## Part 5: Implementation Steps

### Step 1: Complete GPT Sceptic NCL Conversion ⏳
- File format is PACK data, not standard conversation
- Adapt parser for this format OR document as-is
- **Status**: In progress

### Step 2: Create Top-Level Directories
```powershell
New-Item -ItemType Directory -Path "C:\Aureon" -Force
New-Item -ItemType Directory -Path "C:\Aureon\Cursor" -Force
```

### Step 3: Move Cursor Directory
```powershell
Move-Item -Path "C:\Canny Carrot\Cursor" -Destination "C:\Aureon\Cursor" -Force
```

### Step 4: Verify Separation
- Check all Aureon files are in `C:\Aureon\`
- Check no Aureon files remain in `C:\Canny Carrot\`
- Verify git repos still work (may need to update paths)

### Step 5: Update .cursorignore
- Update paths for new structure
- Ensure both directories are properly indexed

---

## Part 6: Verification Checklist

After separation:

- [ ] All Aureon files in `C:\Aureon\Cursor\`
- [ ] No Aureon files in `C:\Canny Carrot\` (except references in comments)
- [ ] Git repos functional in both directories
- [ ] `.cursorignore` updated
- [ ] Both workspaces index correctly
- [ ] No broken references

---

## Part 7: Backup Before Move

**CRITICAL**: Create full backup before moving:
```powershell
# Backup entire workspace
$backupDest = "C:\WORKSPACE_FULL_BACKUP_$(Get-Date -Format 'yyyy-MM-dd_HHmmss')"
robocopy "C:\Canny Carrot" $backupDest /E /COPYALL /R:3 /W:5 /MT:8 /LOG:"$backupDest\backup_log.txt"
```

---

## Next Actions

1. ✅ Find all Aureon files
2. ⏳ Complete GPT Sceptic NCL conversion (file format needs adaptation)
3. ⏳ Create backup
4. ⏳ Execute separation move
5. ⏳ Verify integrity

