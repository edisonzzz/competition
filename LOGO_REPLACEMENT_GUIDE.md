# 📝 Logo Replacement Steps

## Your Logo Details
- Format: PNG (black background, with graphic logo)
- Size: 2001x2001px

## Replacement Steps

### Method 1: Direct Copy (Recommended)

1. **Save the image**
   - Right-click the logo image you sent in the chat
   - Select "Save Image As"
   - Save as `logo.png`

2. **Copy to project**
   ```bash
   # Run in project root
   cp ~/Downloads/logo.png frontend/public/logo.png
   ```

3. **Refresh browser**
   - Visit http://localhost:5173
   - Press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to force refresh

### Method 2: Using Docker Copy

```bash
# Copy logo into container
docker cp /path/to/your/logo.png blueteam-frontend:/app/public/logo.png

# Restart frontend service
docker compose restart frontend
```

### Method 3: Direct File Placement

1. Open project directory
   ```bash
   cd /Users/rickbook2025/Documents/code/blueteamctf
   ```

2. Drag the logo.png file into the `frontend/public/` folder

3. Ensure the file is named `logo.png`

4. Refresh browser

## Verify Logo

Visit the following URL to check if the logo is working:
- http://localhost:5173/logo.png

If you can see your logo image, the replacement was successful!

## Notes

- **Filename must be**: `logo.png` or `logo.svg`
- **Location must be**: `frontend/public/logo.png`
- **Recommended size**: 512x512px or larger (current 2001x2001 is sufficient)
- **Supported formats**: PNG (transparent background recommended), SVG, JPG

## If Logo Has Black Background

Your logo appears to have a black background. Two options:

1. **Keep black background** (use as-is)
2. **Remove background** (use image editor to make black background transparent)

Transparent background PNG is recommended for better display on white pages.

## Current Temporary Logo Location

```
frontend/public/logo.svg  ← Current temporary SVG
frontend/public/logo.png  ← Location you need to replace
```

Priority: If logo.png exists, the page will use PNG format first.