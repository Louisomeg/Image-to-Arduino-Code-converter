# Image to Arduino Sprite Converter

A cross-platform tool to convert any image into Arduino/ESP32-compatible pixel art sprites.  
Use it directly in your browser as a static web app, or install the desktop edition powered by Electron.

## Features
- Supports JPG, PNG, GIF, WebP inputs
- Custom sprite dimensions (8×8 up to 128×128)
- Multiple dithering algorithms: Threshold, Floyd–Steinberg, Ordered
- Brightness & contrast adjustments
- Built-in pixel editor with undo/redo, zoom, fill, line, rectangle, eyedropper
- Live preview at multiple scales and OLED simulation
- Generates Arduino C arrays, PROGMEM-optimized data, full sketches or libraries

## Prerequisites
- Node.js (>=16.x) & npm

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
- Static web preview (any static server):
  ```bash
  # Option A: built-in Node server (using `serve`)
  npx serve .
  # Option B: Python 3
  python3 -m http.server 8000
  ```
- Desktop (Electron):
  ```bash
  npm start
  ```

## Packaging Desktop App
Ensure `electron` and `electron-packager` are installed (they are in devDependencies).

```bash
npm run package-win
```
The Windows executable will be output to `dist/ImageToArduinoSpriteConverter-win32-x64`.

## Deployment (Web)

Choose your favorite hosting:
1. **GitHub Pages**  
   - Push your code to GitHub.  
   - In **Settings → Pages**, select branch `main` (or `master`) and folder `/ (root)`.  
   - Visit `https://<user>.github.io/<repo>/`.  
2. **Surge**  
   ```bash
   npm install -g surge
   surge .
   ```  
3. **Netlify** / **Vercel**  
   - Import your repository, accept defaults.  
   - Automatic deploys with free HTTPS on each push.

## Usage
1. Open the app (browser or `npm start`).  
2. Drag & drop or browse for an image.  
3. Select sprite size (choose *Custom* to specify width/height).  
4. Adjust algorithm, threshold, brightness, contrast.  
5. Click **Convert to Sprite**, then edit using the pixel editor if desired.  
6. Preview at various scales or in the OLED simulator.  
7. Generate code and copy or download it for your Arduino sketch.

## Contributing
PRs welcome! Open issues for bugs or feature requests.

## License
MIT © [Your Name]# Sprite-to-Arduino-Code-converter
