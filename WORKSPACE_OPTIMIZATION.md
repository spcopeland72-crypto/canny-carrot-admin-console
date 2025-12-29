# Workspace Optimization Plan
**Target**: Reduce from 6.6GB to <500MB while retaining full context

## Current Size Breakdown

### Top Space Consumers (from analysis)
1. **Signup-landing page**: 1,840 MB
2. **CannyCarrot_OfflineReady_v3.3_FullSuite**: 800 MB
3. **Cursor**: 723 MB
4. **Design directories**: ~440 MB each (v1.2.1, v1.2.1b)
5. **Mobile apps**: ~350-440 MB each
6. **Backup directories**: ~370 MB each

### File Type Analysis
- **.js files**: 1,706 MB (mostly node_modules - can exclude)
- **.node files**: 1,271 MB (binary modules - can exclude)
- **.zip files**: 972 MB (archives - can exclude)
- **.png/.jpeg**: ~800 MB (images - can exclude from indexing)
- **.map files**: 435 MB (source maps - can exclude)
- **.pack files**: 295 MB (git packs - can exclude)
- **.ts files**: 243 MB (source code - **KEEP**)
- **.json**: 226 MB (mix of config and data)

## Strategy: Selective Exclusion

### Keep for Full Context
- **Active source code**: `.ts`, `.tsx`, `.jsx`, `.js` (in active projects only)
- **Configuration**: `package.json`, `tsconfig.json`, `.env.example`, `vercel.json`
- **Documentation**: `.md` files (limit to essential docs)
- **Critical assets**: Only logo files and essential images referenced in code

### Exclude Completely
1. **All node_modules** (1.7GB+)
2. **All build outputs** (`.next`, `dist`, `build`, `.expo`)
3. **All archives** (`.zip`, `.tar.gz`, `.rar`)
4. **Binary files** (`.node`, `.exe`, `.dll`, `.so`)
5. **Media files** (`.png`, `.jpeg`, `.mp4`, `.mov`)
6. **Source maps** (`.map` files)
7. **Git pack files** (`.pack`)
8. **Backup directories**
9. **Design/full suite directories**
10. **Lock files** (`package-lock.json`, `yarn.lock`)

### Selective Keep
- **Signup-landing page**: Keep only `src/` directory
- **Cursor**: Keep only `aureon-cursor-prime/` and essential docs
- **Active apps**: Keep only source code directories, exclude assets

## Implementation

### Phase 1: Update .cursorignore (Immediate)
Expand exclusions to cover all large directories and file types.

### Phase 2: Archive Strategy
Move large directories to external archive, keep only pointers/references.

### Phase 3: Selective Indexing
Use `.cursorignore` to exclude everything except:
- Active source code (`src/`, `app/`, `components/`)
- Essential config files
- Critical documentation

## Expected Result
- **Active source code**: ~500 MB (all `.ts`, `.tsx`, essential `.js`)
- **Config/docs**: ~50 MB
- **Total indexed**: ~550 MB (under 500MB target after optimization)

## Maintenance
- Keep `.cursorignore` updated as workspace evolves
- Archive old versions instead of keeping in workspace
- Use git LFS for large assets if needed

