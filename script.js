// Image to Arduino Sprite Converter
// Main JavaScript Application

class SpriteConverter {
    constructor() {
        this.currentImage = null;
        this.spriteData = null;
        this.spriteWidth = 16;
        this.spriteHeight = 16;
        this.currentTool = 'pixel';
        this.isDrawing = false;
        this.undoStack = [];
        this.redoStack = [];
        this.animationFrames = [];
        this.animationPlaying = false;
        this.zoomLevel = 4;
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImg = document.getElementById('previewImg');
        this.removeImageBtn = document.getElementById('removeImage');
        
        // Control elements
        this.spriteSizeSelect = document.getElementById('spriteSize');
        this.customSizeGroup = document.getElementById('customSizeGroup');
        this.customWidth = document.getElementById('customWidth');
        this.customHeight = document.getElementById('customHeight');
        this.algorithmSelect = document.getElementById('algorithm');
        this.thresholdSlider = document.getElementById('threshold');
        this.thresholdValue = document.getElementById('thresholdValue');
        this.brightnessSlider = document.getElementById('brightness');
        this.brightnessValue = document.getElementById('brightnessValue');
        this.contrastSlider = document.getElementById('contrast');
        this.contrastValue = document.getElementById('contrastValue');
        this.convertBtn = document.getElementById('convertBtn');
        
        // Editor elements
        this.spriteEditor = document.getElementById('spriteEditor');
        this.editorCtx = this.spriteEditor.getContext('2d');
        this.editorOverlay = document.getElementById('editorOverlay');
        this.toolButtons = document.querySelectorAll('.tool-btn');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.zoomSlider = document.getElementById('zoomLevel');
        this.zoomValue = document.getElementById('zoomValue');
        
        // Preview elements
        this.spritePreview = document.getElementById('spritePreview');
        this.previewCtx = this.spritePreview.getContext('2d');
        this.preview1x = document.getElementById('preview1x');
        this.preview2x = document.getElementById('preview2x');
        this.preview4x = document.getElementById('preview4x');
        this.oledDisplay = document.getElementById('oledDisplay');
        this.oledCtx = this.oledDisplay.getContext('2d');
        this.oledX = document.getElementById('oledX');
        this.oledY = document.getElementById('oledY');
        this.centerSpriteBtn = document.getElementById('centerSprite');
        
        // Code elements
        this.spriteName = document.getElementById('spriteName');
        this.codeFormat = document.getElementById('codeFormat');
        this.displayType = document.getElementById('displayType');
        this.generateCodeBtn = document.getElementById('generateCode');
        this.generatedCode = document.getElementById('generatedCode');
        this.copyCodeBtn = document.getElementById('copyCode');
        this.downloadCodeBtn = document.getElementById('downloadCode');
        this.codeSize = document.getElementById('codeSize');
        this.arraySize = document.getElementById('arraySize');
        this.memoryUsage = document.getElementById('memoryUsage');
        
        // Info elements
        this.spriteSizeInfo = document.getElementById('spriteSizeInfo');
        this.pixelCount = document.getElementById('pixelCount');
        this.mousePos = document.getElementById('mousePos');
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Initialize canvas contexts
        this.editorCtx.imageSmoothingEnabled = false;
        this.previewCtx.imageSmoothingEnabled = false;
        this.oledCtx.imageSmoothingEnabled = false;
    }

    bindEvents() {
        // Upload events
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.imageInput.addEventListener('change', this.handleImageUpload.bind(this));
        this.removeImageBtn.addEventListener('click', this.removeImage.bind(this));
        
        // Control events
        this.spriteSizeSelect.addEventListener('change', this.handleSizeChange.bind(this));
        this.customWidth.addEventListener('input', this.handleCustomSizeChange.bind(this));
        this.customHeight.addEventListener('input', this.handleCustomSizeChange.bind(this));
        this.thresholdSlider.addEventListener('input', this.updateSliderValue.bind(this));
        this.brightnessSlider.addEventListener('input', this.updateSliderValue.bind(this));
        this.contrastSlider.addEventListener('input', this.updateSliderValue.bind(this));
        this.convertBtn.addEventListener('click', this.convertImageToSprite.bind(this));
        
        // Editor events
        this.spriteEditor.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.spriteEditor.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.spriteEditor.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.spriteEditor.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.toolButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
        });
        this.undoBtn.addEventListener('click', this.undo.bind(this));
        this.redoBtn.addEventListener('click', this.redo.bind(this));
        this.clearBtn.addEventListener('click', this.clearSprite.bind(this));
        this.zoomSlider.addEventListener('input', this.handleZoomChange.bind(this));
        
        // Preview events
        this.oledX.addEventListener('input', this.updateOLEDPreview.bind(this));
        this.oledY.addEventListener('input', this.updateOLEDPreview.bind(this));
        this.centerSpriteBtn.addEventListener('click', this.centerSprite.bind(this));
        
        // Code events
        this.generateCodeBtn.addEventListener('click', this.generateArduinoCode.bind(this));
        this.copyCodeBtn.addEventListener('click', this.copyCode.bind(this));
        this.downloadCodeBtn.addEventListener('click', this.downloadCode.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        this.showLoading();
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.previewImg.src = e.target.result;
                this.uploadArea.style.display = 'none';
                this.imagePreview.style.display = 'block';
                this.convertBtn.disabled = false;
                this.hideLoading();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.currentImage = null;
        this.uploadArea.style.display = 'block';
        this.imagePreview.style.display = 'none';
        this.convertBtn.disabled = true;
        this.imageInput.value = '';
        this.clearSprite();
    }

    handleSizeChange() {
        const size = this.spriteSizeSelect.value;
        if (size === 'custom') {
            this.customSizeGroup.style.display = 'block';
            this.handleCustomSizeChange();
        } else {
            this.customSizeGroup.style.display = 'none';
            this.spriteWidth = this.spriteHeight = parseInt(size);
            this.updateSpriteSize();
        }
    }

    handleCustomSizeChange() {
        this.spriteWidth = parseInt(this.customWidth.value) || 16;
        this.spriteHeight = parseInt(this.customHeight.value) || 16;
        this.updateSpriteSize();
    }

    updateSpriteSize() {
        this.spriteSizeInfo.textContent = `Size: ${this.spriteWidth}×${this.spriteHeight}`;
        this.initializeSpriteData();
        this.updateEditorCanvas();
        this.updatePreview();
    }

    updateSliderValue(e) {
        const target = e.target;
        const valueElement = document.getElementById(target.id + 'Value');
        if (valueElement) {
            valueElement.textContent = target.value;
        }
    }

    initializeSpriteData() {
        this.spriteData = Array(this.spriteHeight).fill().map(() => Array(this.spriteWidth).fill(0));
        this.saveState();
    }

    convertImageToSprite() {
        if (!this.currentImage) return;
        
        this.showLoading();
        
        setTimeout(() => {
            try {
                // Create a temporary canvas for image processing
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = this.spriteWidth;
                tempCanvas.height = this.spriteHeight;
                
                // Apply preprocessing
                this.applyImagePreprocessing(tempCtx);
                
                // Get image data
                const imageData = tempCtx.getImageData(0, 0, this.spriteWidth, this.spriteHeight);
                
                // Convert based on algorithm
                const algorithm = this.algorithmSelect.value;
                switch (algorithm) {
                    case 'threshold':
                        this.spriteData = this.convertWithThreshold(imageData);
                        break;
                    case 'floyd-steinberg':
                        this.spriteData = this.convertWithFloydSteinberg(imageData);
                        break;
                    case 'ordered':
                        this.spriteData = this.convertWithOrderedDithering(imageData);
                        break;
                }
                
                this.saveState();
                this.updateEditorCanvas();
                this.updatePreview();
                this.generateCodeBtn.disabled = false;
                
            } catch (error) {
                console.error('Conversion error:', error);
                alert('Error converting image. Please try again.');
            }
            
            this.hideLoading();
        }, 100);
    }

    applyImagePreprocessing(ctx) {
        // Draw the original image scaled to sprite size
        ctx.drawImage(this.currentImage, 0, 0, this.spriteWidth, this.spriteHeight);
        
        // Apply brightness and contrast adjustments
        const brightness = parseInt(this.brightnessSlider.value);
        const contrast = parseInt(this.contrastSlider.value);
        
        if (brightness !== 0 || contrast !== 0) {
            const imageData = ctx.getImageData(0, 0, this.spriteWidth, this.spriteHeight);
            const data = imageData.data;
            
            const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            
            for (let i = 0; i < data.length; i += 4) {
                // Apply brightness
                data[i] = Math.max(0, Math.min(255, data[i] + brightness));     // R
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness)); // G
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness)); // B
                
                // Apply contrast
                data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128));
                data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128));
                data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128));
            }
            
            ctx.putImageData(imageData, 0, 0);
        }
    }

    convertWithThreshold(imageData) {
        const threshold = parseInt(this.thresholdSlider.value);
        const pixels = [];
        const data = imageData.data;
        
        for (let y = 0; y < this.spriteHeight; y++) {
            const row = [];
            for (let x = 0; x < this.spriteWidth; x++) {
                const index = (y * this.spriteWidth + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                // Convert to grayscale using luminance formula
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                row.push(gray > threshold ? 1 : 0);
            }
            pixels.push(row);
        }
        
        return pixels;
    }

    convertWithFloydSteinberg(imageData) {
        const pixels = Array(this.spriteHeight).fill().map(() => Array(this.spriteWidth).fill(0));
        const errors = Array(this.spriteHeight).fill().map(() => Array(this.spriteWidth).fill(0));
        const data = imageData.data;
        
        for (let y = 0; y < this.spriteHeight; y++) {
            for (let x = 0; x < this.spriteWidth; x++) {
                const index = (y * this.spriteWidth + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                const oldPixel = gray + errors[y][x];
                const newPixel = oldPixel > 128 ? 255 : 0;
                const error = oldPixel - newPixel;
                
                pixels[y][x] = newPixel > 128 ? 1 : 0;
                
                // Distribute error using Floyd-Steinberg coefficients
                if (x + 1 < this.spriteWidth) {
                    errors[y][x + 1] += error * 7 / 16;
                }
                if (y + 1 < this.spriteHeight) {
                    if (x > 0) {
                        errors[y + 1][x - 1] += error * 3 / 16;
                    }
                    errors[y + 1][x] += error * 5 / 16;
                    if (x + 1 < this.spriteWidth) {
                        errors[y + 1][x + 1] += error * 1 / 16;
                    }
                }
            }
        }
        
        return pixels;
    }

    convertWithOrderedDithering(imageData) {
        const ditherMatrix = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];
        
        const pixels = [];
        const data = imageData.data;
        
        for (let y = 0; y < this.spriteHeight; y++) {
            const row = [];
            for (let x = 0; x < this.spriteWidth; x++) {
                const index = (y * this.spriteWidth + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                const threshold = (ditherMatrix[y % 4][x % 4] + 1) * 16;
                
                row.push(gray > threshold ? 1 : 0);
            }
            pixels.push(row);
        }
        
        return pixels;
    }

    updateEditorCanvas() {
        if (!this.spriteData) return;
        
        const pixelSize = this.zoomLevel * 8; // Base pixel size * zoom
        const canvasWidth = this.spriteWidth * pixelSize;
        const canvasHeight = this.spriteHeight * pixelSize;
        
        this.spriteEditor.width = canvasWidth;
        this.spriteEditor.height = canvasHeight;
        
        this.editorCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw background grid
        this.editorCtx.strokeStyle = '#4a5568';
        this.editorCtx.lineWidth = 1;
        
        for (let x = 0; x <= this.spriteWidth; x++) {
            const xPos = x * pixelSize;
            this.editorCtx.beginPath();
            this.editorCtx.moveTo(xPos, 0);
            this.editorCtx.lineTo(xPos, canvasHeight);
            this.editorCtx.stroke();
        }
        
        for (let y = 0; y <= this.spriteHeight; y++) {
            const yPos = y * pixelSize;
            this.editorCtx.beginPath();
            this.editorCtx.moveTo(0, yPos);
            this.editorCtx.lineTo(canvasWidth, yPos);
            this.editorCtx.stroke();
        }
        
        // Draw pixels
        this.editorCtx.fillStyle = '#00ff7f';
        for (let y = 0; y < this.spriteHeight; y++) {
            for (let x = 0; x < this.spriteWidth; x++) {
                if (this.spriteData[y][x]) {
                    this.editorCtx.fillRect(x * pixelSize + 1, y * pixelSize + 1, pixelSize - 2, pixelSize - 2);
                }
            }
        }
        
        this.updatePixelCount();
    }

    updatePixelCount() {
        if (!this.spriteData) return;
        
        let count = 0;
        for (let y = 0; y < this.spriteHeight; y++) {
            for (let x = 0; x < this.spriteWidth; x++) {
                if (this.spriteData[y][x]) count++;
            }
        }
        
        const total = this.spriteWidth * this.spriteHeight;
        this.pixelCount.textContent = `Pixels: ${count}/${total}`;
    }

    handleZoomChange() {
        this.zoomLevel = parseInt(this.zoomSlider.value);
        this.zoomValue.textContent = `${this.zoomLevel}x`;
        this.updateEditorCanvas();
    }

    getPixelCoordinates(e) {
        const rect = this.spriteEditor.getBoundingClientRect();
        const pixelSize = this.zoomLevel * 8;
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);
        return { x, y };
    }

    handleMouseDown(e) {
        if (!this.spriteData) return;
        
        this.isDrawing = true;
        const { x, y } = this.getPixelCoordinates(e);
        
        if (x >= 0 && x < this.spriteWidth && y >= 0 && y < this.spriteHeight) {
            this.saveState();
            this.applyTool(x, y, e);
        }
    }

    handleMouseMove(e) {
        const { x, y } = this.getPixelCoordinates(e);
        this.mousePos.textContent = `Position: ${x},${y}`;
        
        if (this.isDrawing && this.spriteData) {
            if (x >= 0 && x < this.spriteWidth && y >= 0 && y < this.spriteHeight) {
                this.applyTool(x, y, e);
            }
        }
    }

    handleMouseUp() {
        this.isDrawing = false;
    }

    handleMouseLeave() {
        this.isDrawing = false;
        this.mousePos.textContent = 'Position: -,-';
    }

    applyTool(x, y, e) {
        if (!this.spriteData) return;
        
        switch (this.currentTool) {
            case 'pixel':
                this.spriteData[y][x] = e.shiftKey ? 0 : 1;
                break;
            case 'fill':
                this.floodFill(x, y, this.spriteData[y][x], e.shiftKey ? 0 : 1);
                break;
            // Add other tools here
        }
        
        this.updateEditorCanvas();
        this.updatePreview();
    }

    floodFill(x, y, targetColor, newColor) {
        if (x < 0 || x >= this.spriteWidth || y < 0 || y >= this.spriteHeight) return;
        if (this.spriteData[y][x] !== targetColor || targetColor === newColor) return;
        
        const stack = [[x, y]];
        
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            
            if (cx < 0 || cx >= this.spriteWidth || cy < 0 || cy >= this.spriteHeight) continue;
            if (this.spriteData[cy][cx] !== targetColor) continue;
            
            this.spriteData[cy][cx] = newColor;
            
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        this.toolButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    }

    saveState() {
        if (this.spriteData) {
            this.undoStack.push(JSON.parse(JSON.stringify(this.spriteData)));
            if (this.undoStack.length > 50) {
                this.undoStack.shift();
            }
            this.redoStack = [];
        }
    }

    undo() {
        if (this.undoStack.length > 1) {
            this.redoStack.push(this.undoStack.pop());
            this.spriteData = JSON.parse(JSON.stringify(this.undoStack[this.undoStack.length - 1]));
            this.updateEditorCanvas();
            this.updatePreview();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const state = this.redoStack.pop();
            this.undoStack.push(state);
            this.spriteData = JSON.parse(JSON.stringify(state));
            this.updateEditorCanvas();
            this.updatePreview();
        }
    }

    clearSprite() {
        if (this.spriteData) {
            this.saveState();
            this.spriteData = Array(this.spriteHeight).fill().map(() => Array(this.spriteWidth).fill(0));
            this.updateEditorCanvas();
            this.updatePreview();
        }
    }

    updatePreview() {
        if (!this.spriteData) return;
        
        // Update main preview
        this.previewCtx.clearRect(0, 0, 128, 128);
        this.previewCtx.fillStyle = '#00ff7f';
        
        const scale = Math.min(128 / this.spriteWidth, 128 / this.spriteHeight);
        for (let y = 0; y < this.spriteHeight; y++) {
            for (let x = 0; x < this.spriteWidth; x++) {
                if (this.spriteData[y][x]) {
                    this.previewCtx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
        
        // Update scale previews
        this.updateScalePreview(this.preview1x, 1);
        this.updateScalePreview(this.preview2x, 2);
        this.updateScalePreview(this.preview4x, 4);
        
        // Update OLED preview
        this.updateOLEDPreview();
    }

    updateScalePreview(canvas, scale) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 64, 64);
        ctx.fillStyle = '#00ff7f';
        
        const pixelSize = scale;
        const offsetX = (64 - this.spriteWidth * pixelSize) / 2;
        const offsetY = (64 - this.spriteHeight * pixelSize) / 2;
        
        for (let y = 0; y < this.spriteHeight; y++) {
            for (let x = 0; x < this.spriteWidth; x++) {
                if (this.spriteData[y][x]) {
                    ctx.fillRect(offsetX + x * pixelSize, offsetY + y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    updateOLEDPreview() {
        if (!this.spriteData) return;
        
        // Clear OLED display (black background)
        this.oledCtx.fillStyle = '#000';
        this.oledCtx.fillRect(0, 0, 256, 128);
        
        // Draw sprite at specified position
        this.oledCtx.fillStyle = '#fff';
        const x = parseInt(this.oledX.value) || 0;
        const y = parseInt(this.oledY.value) || 0;
        
        for (let py = 0; py < this.spriteHeight; py++) {
            for (let px = 0; px < this.spriteWidth; px++) {
                if (this.spriteData[py][px]) {
                    this.oledCtx.fillRect(x + px, y + py, 1, 1);
                }
            }
        }
    }

    centerSprite() {
        this.oledX.value = Math.floor((256 - this.spriteWidth) / 2);
        this.oledY.value = Math.floor((128 - this.spriteHeight) / 2);
        this.updateOLEDPreview();
    }

    generateArduinoCode() {
        if (!this.spriteData) return;
        
        const name = this.spriteName.value || 'mySprite';
        const format = this.codeFormat.value;
        const displayType = this.displayType.value;
        
        let code = '';
        
        switch (format) {
            case 'basic':
                code = this.generateBasicArray(name);
                break;
            case 'progmem':
                code = this.generateProgmemArray(name);
                break;
            case 'complete':
                code = this.generateCompleteSketch(name, displayType);
                break;
            case 'library':
                code = this.generateLibrary(name);
                break;
        }
        
        this.generatedCode.textContent = code;
        this.updateCodeStats(code);
    }

    generateBasicArray(name) {
        const bytesPerRow = Math.ceil(this.spriteWidth / 8);
        let code = `// ${name} sprite (${this.spriteWidth}x${this.spriteHeight})\n`;
        code += `const unsigned char ${name}[] = {\n`;
        
        for (let y = 0; y < this.spriteHeight; y++) {
            let line = '  ';
            for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
                let byte = 0;
                for (let bit = 0; bit < 8; bit++) {
                    const x = byteIndex * 8 + bit;
                    if (x < this.spriteWidth && this.spriteData[y][x]) {
                        byte |= (1 << (7 - bit));
                    }
                }
                line += `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`;
                if (y < this.spriteHeight - 1 || byteIndex < bytesPerRow - 1) {
                    line += ', ';
                }
            }
            code += line + '\n';
        }
        
        code += '};\n';
        return code;
    }

    generateProgmemArray(name) {
        let code = this.generateBasicArray(name);
        code = code.replace(`const unsigned char ${name}[]`, `const unsigned char ${name}[] PROGMEM`);
        
        code += `\n// Drawing function\n`;
        code += `void draw${name.charAt(0).toUpperCase() + name.slice(1)}(int x, int y) {\n`;
        code += `  display.drawBitmap(x, y, ${name}, ${this.spriteWidth}, ${this.spriteHeight}, WHITE);\n`;
        code += `}\n`;
        
        return code;
    }

    generateCompleteSketch(name, displayType) {
        let includes = '';
        let initCode = '';
        
        switch (displayType) {
            case 'ssd1306':
                includes = `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);`;
                initCode = `  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  display.display();
  delay(2000);
  display.clearDisplay();`;
                break;
                
            case 'sh1106':
                includes = `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH1106.h>

#define OLED_RESET -1
Adafruit_SH1106 display(OLED_RESET);`;
                initCode = `  display.begin(SH1106_SWITCHCAPVCC, 0x3C);
  display.display();
  delay(2000);
  display.clearDisplay();`;
                break;
                
            default:
                includes = `// Include your display library here
// #include <YourDisplayLibrary.h>`;
                initCode = `  // Initialize your display here
  // display.begin();`;
        }
        
        const arrayCode = this.generateProgmemArray(name);
        
        return `${includes}

${arrayCode}

void setup() {
  Serial.begin(9600);
${initCode}
}

void loop() {
  display.clearDisplay();
  
  // Draw the sprite at position (32, 16)
  draw${name.charAt(0).toUpperCase() + name.slice(1)}(32, 16);
  
  display.display();
  delay(1000);
}`;
    }

    generateLibrary(name) {
        const headerName = name.toUpperCase();
        
        return `#ifndef ${headerName}_H
#define ${headerName}_H

#include <Arduino.h>

${this.generateProgmemArray(name)}

#endif`;
    }

    updateCodeStats(code) {
        const bytes = new Blob([code]).size;
        this.codeSize.textContent = `${bytes} bytes`;
        
        const arrayBytes = Math.ceil(this.spriteWidth / 8) * this.spriteHeight;
        this.arraySize.textContent = `${arrayBytes} bytes`;
        
        const memoryPercent = ((arrayBytes / 2048) * 100).toFixed(1);
        this.memoryUsage.textContent = `${memoryPercent}% of Arduino Uno`;
    }

    copyCode() {
        const code = this.generatedCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.copyCodeBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                this.copyCodeBtn.textContent = '📋 Copy';
            }, 2000);
        });
    }

    downloadCode() {
        const code = this.generatedCode.textContent;
        const name = this.spriteName.value || 'mySprite';
        const format = this.codeFormat.value;
        
        let filename = `${name}`;
        let extension = '.txt';
        
        switch (format) {
            case 'complete':
                extension = '.ino';
                break;
            case 'library':
                extension = '.h';
                break;
            default:
                extension = '.cpp';
        }
        
        filename += extension;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
            }
        }
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    updateUI() {
        this.initializeSpriteData();
        this.updateEditorCanvas();
        this.updatePreview();
    }
}

// Expose pure conversion and code generation utilities for testing
window.SpriteConverterUtils = {
    convertThreshold: function(imageData, width, height, threshold) {
        const pixels = [];
        const data = imageData.data;
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                row.push(gray > threshold ? 1 : 0);
            }
            pixels.push(row);
        }
        return pixels;
    },
    convertFloydSteinberg: function(imageData, width, height) {
        const pixels = Array(height).fill().map(() => Array(width).fill(0));
        const errors = Array(height).fill().map(() => Array(width).fill(0));
        const data = imageData.data;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                const oldPixel = gray + errors[y][x];
                const newPixel = oldPixel > 128 ? 255 : 0;
                const error = oldPixel - newPixel;
                pixels[y][x] = newPixel > 128 ? 1 : 0;
                if (x + 1 < width) errors[y][x + 1] += error * 7 / 16;
                if (y + 1 < height) {
                    if (x > 0) errors[y + 1][x - 1] += error * 3 / 16;
                    errors[y + 1][x] += error * 5 / 16;
                    if (x + 1 < width) errors[y + 1][x + 1] += error * 1 / 16;
                }
            }
        }
        return pixels;
    },
    convertOrderedDithering: function(imageData, width, height) {
        const ditherMatrix = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];
        const pixels = [];
        const data = imageData.data;
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                const threshold = (ditherMatrix[y % 4][x % 4] + 1) * 16;
                row.push(gray > threshold ? 1 : 0);
            }
            pixels.push(row);
        }
        return pixels;
    },
    generateBasicArray: function(spriteData, name) {
        const height = spriteData.length;
        const width = spriteData[0].length;
        const bytesPerRow = Math.ceil(width / 8);
        let code = `// ${name} sprite (${width}x${height})\n`;
        code += `const unsigned char ${name}[] = {\n`;
        for (let y = 0; y < height; y++) {
            let line = '  ';
            for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
                let byte = 0;
                for (let bit = 0; bit < 8; bit++) {
                    const x = byteIdx * 8 + bit;
                    if (x < width && spriteData[y][x]) {
                        byte |= (1 << (7 - bit));
                    }
                }
                line += `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`;
                if (y < height - 1 || byteIdx < bytesPerRow - 1) line += ', ';
            }
            code += line + '\n';
        }
        code += '};\n';
        return code;
    }
};
// Initialize the application when the page loads (only if UI elements exist)
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('spriteEditor')) {
        new SpriteConverter();
    }
});