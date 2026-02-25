#!/usr/bin/env python3

"""
Generate App Icons Script

This script generates app icons for Android and iOS
from the new logo (app-logo.png).
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ Pillow is not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "--break-system-packages", "Pillow"])
    from PIL import Image

# Colors for console output
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    RED = '\033[31m'
    CYAN = '\033[36m'

def log(message, color=Colors.RESET):
    print(f"{color}{message}{Colors.RESET}")

# Android icon configurations (mipmap densities)
ANDROID_ICONS = [
    {'name': 'mipmap-mdpi', 'size': 48},
    {'name': 'mipmap-hdpi', 'size': 72},
    {'name': 'mipmap-xhdpi', 'size': 96},
    {'name': 'mipmap-xxhdpi', 'size': 144},
    {'name': 'mipmap-xxxhdpi', 'size': 192},
]

# iOS icon configurations (all required sizes)
IOS_ICONS = [
    {'name': 'Icon-20-ipad.png', 'size': 20},
    {'name': 'Icon-20@2x-ipad.png', 'size': 40},
    {'name': 'Icon-20@2x.png', 'size': 40},
    {'name': 'Icon-20@3x.png', 'size': 60},
    {'name': 'Icon-29-ipad.png', 'size': 29},
    {'name': 'Icon-29@2x-ipad.png', 'size': 58},
    {'name': 'Icon-29@2x.png', 'size': 58},
    {'name': 'Icon-29@3x.png', 'size': 87},
    {'name': 'Icon-40-ipad.png', 'size': 40},
    {'name': 'Icon-40@2x-ipad.png', 'size': 80},
    {'name': 'Icon-40@2x.png', 'size': 80},
    {'name': 'Icon-40@3x.png', 'size': 120},
    {'name': 'Icon-60@2x.png', 'size': 120},
    {'name': 'Icon-60@3x.png', 'size': 180},
    {'name': 'Icon-76-ipad.png', 'size': 76},
    {'name': 'Icon-76@2x-ipad.png', 'size': 152},
    {'name': 'Icon-83.5@2x.png', 'size': 167},
    {'name': 'Icon-1024.png', 'size': 1024},
]

def generate_icon(logo_path, output_path, size, use_rgba=True):
    """Generate an app icon at the specified size."""
    try:
        # Load the logo
        logo = Image.open(logo_path)
        
        # Convert to RGBA if needed
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Resize logo to exact size using high-quality resampling
        icon = logo.resize((size, size), Image.Resampling.LANCZOS)
        
        # iOS requires RGB (no alpha channel) for most icons
        if not use_rgba:
            # Create white background
            background = Image.new('RGB', (size, size), 'white')
            # Paste icon on background using alpha as mask
            background.paste(icon, (0, 0), icon)
            icon = background
        
        # Save as PNG
        icon.save(output_path, 'PNG', optimize=True)
        
        return True
    except Exception as e:
        log(f"Error generating {output_path}: {str(e)}", Colors.RED)
        return False

def main():
    log('\n🎨 Generating app icons with new logo...', Colors.BLUE)
    
    # Get paths
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    logo_path = project_dir / 'assets' / 'app-logo.png'
    
    if not logo_path.exists():
        log(f'❌ Logo not found: {logo_path}', Colors.RED)
        sys.exit(1)
    
    log(f'✅ Using logo: {logo_path}', Colors.GREEN)
    
    success_count = 0
    total_count = 0
    
    # Generate Android icons
    log('\n📱 Generating Android icons...', Colors.CYAN)
    android_res_dir = project_dir / 'android' / 'app' / 'src' / 'main' / 'res'
    
    for config in ANDROID_ICONS:
        total_count += 1
        output_dir = android_res_dir / config['name']
        output_path = output_dir / 'ic_launcher.png'
        
        log(f"  Generating {config['name']} ({config['size']}x{config['size']})...", Colors.RESET)
        
        if generate_icon(logo_path, output_path, config['size'], use_rgba=True):
            success_count += 1
            log(f"  ✅ {config['name']}", Colors.GREEN)
        else:
            log(f"  ❌ {config['name']}", Colors.RED)
    
    # Generate iOS icons
    log('\n🍎 Generating iOS icons...', Colors.CYAN)
    ios_icon_dir = project_dir / 'ios' / 'PdfSignPOC' / 'Images.xcassets' / 'AppIcon.appiconset'
    
    for config in IOS_ICONS:
        total_count += 1
        output_path = ios_icon_dir / config['name']
        
        log(f"  Generating {config['name']} ({config['size']}x{config['size']})...", Colors.RESET)
        
        # iOS icons should be RGB (no alpha) except for some cases
        use_rgba = False  # iOS prefers RGB
        
        if generate_icon(logo_path, output_path, config['size'], use_rgba=use_rgba):
            success_count += 1
            log(f"  ✅ {config['name']}", Colors.GREEN)
        else:
            log(f"  ❌ {config['name']}", Colors.RED)
    
    # Also update the adaptive icon components for Android
    log('\n🎭 Generating Android adaptive icon components...', Colors.CYAN)
    
    # Foreground (the logo itself, with padding)
    foreground_path = android_res_dir / 'drawable' / 'ic_launcher_foreground.png'
    total_count += 1
    log(f"  Generating ic_launcher_foreground.png (432x432)...", Colors.RESET)
    
    # For adaptive icons, we need a 432x432 image with the logo centered and padded
    try:
        logo = Image.open(logo_path)
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Create transparent background
        foreground = Image.new('RGBA', (432, 432), (0, 0, 0, 0))
        
        # Resize logo to fit with safe area (288x288 in center)
        logo_resized = logo.resize((288, 288), Image.Resampling.LANCZOS)
        
        # Center the logo
        x = (432 - 288) // 2
        y = (432 - 288) // 2
        foreground.paste(logo_resized, (x, y), logo_resized)
        
        foreground.save(foreground_path, 'PNG', optimize=True)
        success_count += 1
        log(f"  ✅ ic_launcher_foreground.png", Colors.GREEN)
    except Exception as e:
        log(f"  ❌ ic_launcher_foreground.png: {str(e)}", Colors.RED)
    
    # Background (white)
    background_path = android_res_dir / 'drawable' / 'ic_launcher_background.png'
    total_count += 1
    log(f"  Generating ic_launcher_background.png (432x432)...", Colors.RESET)
    
    try:
        background = Image.new('RGB', (432, 432), 'white')
        background.save(background_path, 'PNG', optimize=True)
        success_count += 1
        log(f"  ✅ ic_launcher_background.png", Colors.GREEN)
    except Exception as e:
        log(f"  ❌ ic_launcher_background.png: {str(e)}", Colors.RED)
    
    log('\n' + '=' * 60, Colors.CYAN)
    log('✨ App icon generation complete!', Colors.GREEN)
    log(f'📊 Success: {success_count}/{total_count}', Colors.BLUE)
    log('=' * 60 + '\n', Colors.CYAN)
    
    log('💡 Next steps:', Colors.YELLOW)
    log('   1. Clean build: cd android && ./gradlew clean', Colors.RESET)
    log('   2. Rebuild app: npm run android', Colors.RESET)
    log('   3. Check the new app icon on your device', Colors.RESET)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        log(f'\n❌ Error: {str(e)}', Colors.RED)
        sys.exit(1)
