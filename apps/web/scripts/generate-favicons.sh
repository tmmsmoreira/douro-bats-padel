#!/bin/bash

# Script to generate all favicon and PWA icon sizes from logo.png
# Uses macOS built-in 'sips' command (no external dependencies needed)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎨 Favicon & PWA Icon Generator${NC}"
echo -e "${BLUE}================================${NC}\n"

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$(dirname "$SCRIPT_DIR")/public"
ICONS_DIR="$PUBLIC_DIR/icons"
SOURCE_LOGO="$ICONS_DIR/logo.png"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${YELLOW}❌ Error: logo.png not found at $SOURCE_LOGO${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found source logo: $SOURCE_LOGO${NC}\n"

# PWA icon sizes
PWA_SIZES=(72 96 128 144 152 192 384 512)

# Favicon sizes
FAVICON_SIZES=(16 32 48)

# Apple touch icon sizes
APPLE_SIZES=(180)

echo -e "${BLUE}📱 Generating PWA icons...${NC}"
for size in "${PWA_SIZES[@]}"; do
    output="$ICONS_DIR/icon-${size}x${size}.png"
    echo -e "  Generating ${size}x${size}..."
    sips -z $size $size "$SOURCE_LOGO" --out "$output" > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Created: icon-${size}x${size}.png${NC}"
done

echo -e "\n${BLUE}🌐 Generating favicon sizes...${NC}"
for size in "${FAVICON_SIZES[@]}"; do
    output="$PUBLIC_DIR/favicon-${size}x${size}.png"
    echo -e "  Generating ${size}x${size}..."
    sips -z $size $size "$SOURCE_LOGO" --out "$output" > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Created: favicon-${size}x${size}.png${NC}"
done

echo -e "\n${BLUE}🍎 Generating Apple touch icons...${NC}"
for size in "${APPLE_SIZES[@]}"; do
    output="$ICONS_DIR/apple-touch-icon.png"
    echo -e "  Generating ${size}x${size}..."
    sips -z $size $size "$SOURCE_LOGO" --out "$output" > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Created: apple-touch-icon.png${NC}"
done

# Generate standard favicon.ico (using 32x32 as base)
echo -e "\n${BLUE}🔖 Generating favicon.ico...${NC}"
FAVICON_ICO="$PUBLIC_DIR/favicon.ico"
TEMP_32="$PUBLIC_DIR/favicon-32x32.png"

# Note: sips cannot create .ico files directly, so we'll create a note about this
echo -e "${YELLOW}  ℹ️  Note: favicon.ico should be created from favicon-32x32.png${NC}"
echo -e "${YELLOW}  You can use an online converter or ImageMagick:${NC}"
echo -e "${YELLOW}  convert favicon-32x32.png favicon.ico${NC}"

echo -e "\n${GREEN}✅ Icon generation complete!${NC}\n"

echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • PWA icons: ${#PWA_SIZES[@]} sizes (72px - 512px)"
echo -e "  • Favicon PNGs: ${#FAVICON_SIZES[@]} sizes (16px - 48px)"
echo -e "  • Apple touch icon: 180x180px"
echo -e "\n${BLUE}📁 Output locations:${NC}"
echo -e "  • PWA icons: $ICONS_DIR/"
echo -e "  • Favicons: $PUBLIC_DIR/"
echo -e "\n${GREEN}🎉 All done! Your PWA is ready with custom icons.${NC}\n"

# List generated files
echo -e "${BLUE}Generated files:${NC}"
ls -lh "$ICONS_DIR"/icon-*.png 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
ls -lh "$PUBLIC_DIR"/favicon-*.png 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
ls -lh "$ICONS_DIR"/apple-touch-icon.png 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

echo ""

