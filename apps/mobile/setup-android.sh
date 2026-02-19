#!/bin/bash

# React Native Android Setup Script
# This script helps set up the project for Android development with Node 22.22.0

set -e

echo "🚀 React Native Android Setup"
echo "=============================="
echo ""

# Check Node version
NODE_VERSION=$(node --version)
echo "📦 Current Node version: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v2[0-9]\. ]]; then
    echo "⚠️  Warning: Node version should be >= 20.19.4"
    echo "   Current version: $NODE_VERSION"
    echo ""
    echo "   To install Node 22.22.0 using nvm:"
    echo "   $ nvm install 22.22.0"
    echo "   $ nvm use 22.22.0"
    echo "   $ nvm alias default 22.22.0"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Java
echo ""
echo "☕ Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "   $JAVA_VERSION"
else
    echo "   ❌ Java not found. Please install JDK 17 or higher."
    exit 1
fi

# Check Android SDK
echo ""
echo "🤖 Checking Android SDK..."
if [ -z "$ANDROID_HOME" ]; then
    echo "   ⚠️  ANDROID_HOME not set"
    echo "   Add to ~/.zshrc or ~/.bash_profile:"
    echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
else
    echo "   ✅ ANDROID_HOME: $ANDROID_HOME"
fi

# Clean previous installation
echo ""
echo "🧹 Cleaning previous installation..."
rm -rf node_modules package-lock.json
echo "   ✅ Removed node_modules and package-lock.json"

# Clean Android build
echo ""
echo "🧹 Cleaning Android build..."
cd android
./gradlew clean > /dev/null 2>&1
cd ..
echo "   ✅ Android build cleaned"

# Clear Metro cache
echo ""
echo "🧹 Clearing Metro cache..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all > /dev/null 2>&1
    echo "   ✅ Watchman cache cleared"
else
    echo "   ⚠️  Watchman not installed (optional but recommended)"
fi

rm -rf $TMPDIR/react-* $TMPDIR/metro-* 2>/dev/null || true
echo "   ✅ Metro cache cleared"

# Install dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Verify installation
echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Metro bundler:  npm start"
echo "2. In a new terminal, run: npm run android"
echo ""
echo "For more details, see SETUP.md"
