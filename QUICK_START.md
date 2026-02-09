# Quick Start Guide

## ⚠️ IMPORTANT: You must use Node 22.22.0

Your current Node version: **16.13.0** ❌  
Required Node version: **22.22.0** ✅

## Step 1: Install Node 22.22.0

```bash
# Using nvm (recommended)
nvm install 22.22.0
nvm use 22.22.0
nvm alias default 22.22.0

# Verify
node --version  # Should output: v22.22.0
```

## Step 2: Run Setup Script

```bash
./setup-android.sh
```

This will:
- Clean old dependencies
- Clear build caches
- Install fresh dependencies
- Verify your environment

## Step 3: Start Development

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run Android app
npm run android
```

## That's it! 🎉

---

## Manual Setup (if script fails)

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json
cd android && ./gradlew clean && cd ..
watchman watch-del-all

# 2. Install dependencies
npm install

# 3. Run the app
npm start  # Terminal 1
npm run android  # Terminal 2
```

## Troubleshooting

**Problem**: Build fails  
**Solution**: `cd android && ./gradlew clean && cd .. && npm run android`

**Problem**: Metro cache issues  
**Solution**: `npm start -- --reset-cache`

**Problem**: Native module errors  
**Solution**: `rm -rf node_modules && npm install && npm run android`

## More Help

- Full setup guide: `SETUP.md`
- What was fixed: `FIXES_APPLIED.md`
- Project guidelines: `AGENTS.md`
