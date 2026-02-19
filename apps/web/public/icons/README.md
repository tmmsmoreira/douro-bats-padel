# PWA Icons

This directory contains the icons for the Progressive Web App (PWA).

## Required Icons

The following icon sizes are required:

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## How to Generate Icons

### Option 1: Using the HTML Generator (Recommended)

1. Open `apps/web/scripts/generate-icons.html` in your web browser
2. Click "Generate All Icons"
3. Download each icon and save them to this directory

### Option 2: Using an Online Tool

1. Use a tool like [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
2. Upload your logo or use the SVG in `icon.svg`
3. Download all generated icons
4. Place them in this directory with the naming format: `icon-{size}x{size}.png`

### Option 3: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd apps/web/public/icons

# Generate all sizes from SVG
for size in 72 96 128 144 152 192 384 512; do
  convert icon.svg -resize ${size}x${size} icon-${size}x${size}.png
done
```

## Current Status

⚠️ **Placeholder icons needed**: Please generate the PNG icons using one of the methods above.

The app will work without icons, but users won't be able to install it as a PWA until proper icons are provided.
