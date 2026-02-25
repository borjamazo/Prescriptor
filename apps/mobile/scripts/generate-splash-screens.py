#!/usr/bin/env python3

"""
Generate Splash Screens Script

This script generates splash screens for Android and iOS
with the new logo centered on a white background.
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("❌ Pillow is not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "Pillow"])
    from PIL import Image, ImageDraw

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

# Splash screen configurations
SPLASH_CONFIGS = {
    'android': [
        {'name': 'drawable-mdpi', 'width': 320, 'height': 480, 'logo_size': 120},
        {'name': 'drawable-hdpi', 'width': 480, 'height': 800, 'logo_size': 180},
        {'name': 'drawable-xhdpi', 'width': 720, 'height': 1280, 'logo_size': 270},
        {'name': 'drawable-xxhdpi', 'width': 1080, 'height': 1920, 'logo_size': 400},
        {'name': 'drawable-xxxhdpi', 'width': 1440, 'height': 2560, 'logo_size': 540},
    ],
    'ios': [
        {'name': 'splash@1x', 'width': 320, 'height': 568, 'logo_size': 120},
        {'name': 'splash@2x', 'width': 640, 'height': 1136, 'logo_size': 240},
        {'name': 'splash@3x', 'width': 1242, 'height': 2208, 'logo_size': 460},
        {'name': 'splash_ipad@1x', 'width': 768, 'height': 1024, 'logo_size': 280},
        {'name': 'splash_ipad@2x', 'width': 1536, 'height': 2048, 'logo_size': 560},
    ],
}

def generate_splash_screen(logo_path, output_path, width, height, logo_size):
    """Generate a splash screen with logo centered on white background."""
    try:
        # Load the logo
        logo = Image.open(logo_path)
        
        # Convert to RGBA if not already
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        # Resize logo maintaining aspect ratio
        logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Create white background
        splash = Image.new('RGB', (width, height), 'white')
        
        # Calculate position to center the logo
        logo_x = (width - logo.width) // 2
        logo_y = (height - logo.height) // 2
        
        # Paste logo on background (using logo as mask for transparency)
        splash.paste(logo, (logo_x, logo_y), logo)
        
        # Save as JPEG
        splash.save(output_path, 'JPEG', quality=85, optimize=True)
        
        return True
    except Exception as e:
        log(f"Error generating {output_path}: {str(e)}", Colors.RED)
        return False

def main():
    log('\n🎨 Generating splash screens with new logo...', Colors.BLUE)
    
    # Get paths
    script_dir = Path(__file__).parent
    assets_dir = script_dir.parent / 'assets'
    logo_path = assets_dir / 'app-logo.png'
    
    if not logo_path.exists():
        log(f'❌ Logo not found: {logo_path}', Colors.RED)
        sys.exit(1)
    
    log(f'✅ Using logo: {logo_path}', Colors.GREEN)
    
    success_count = 0
    total_count = 0
    
    # Generate Android splash screens
    log('\n📱 Generating Android splash screens...', Colors.CYAN)
    for config in SPLASH_CONFIGS['android']:
        total_count += 1
        output_dir = assets_dir / 'splash_screens' / 'android' / config['name']
        output_path = output_dir / 'splash.jpg'
        
        log(f"  Generating {config['name']} ({config['width']}x{config['height']})...", Colors.RESET)
        
        if generate_splash_screen(logo_path, output_path, config['width'], config['height'], config['logo_size']):
            success_count += 1
            log(f"  ✅ {config['name']}", Colors.GREEN)
        else:
            log(f"  ❌ {config['name']}", Colors.RED)
    
    # Generate iOS splash screens
    log('\n🍎 Generating iOS splash screens...', Colors.CYAN)
    for config in SPLASH_CONFIGS['ios']:
        total_count += 1
        output_dir = assets_dir / 'splash_screens' / 'ios'
        output_path = output_dir / f"{config['name']}.jpg"
        
        log(f"  Generating {config['name']} ({config['width']}x{config['height']})...", Colors.RESET)
        
        if generate_splash_screen(logo_path, output_path, config['width'], config['height'], config['logo_size']):
            success_count += 1
            log(f"  ✅ {config['name']}", Colors.GREEN)
        else:
            log(f"  ❌ {config['name']}", Colors.RED)
    
    log('\n' + '=' * 60, Colors.CYAN)
    log('✨ Splash screen generation complete!', Colors.GREEN)
    log(f'📊 Success: {success_count}/{total_count}', Colors.BLUE)
    log('=' * 60 + '\n', Colors.CYAN)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        log(f'\n❌ Error: {str(e)}', Colors.RED)
        sys.exit(1)
