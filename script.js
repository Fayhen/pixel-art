// Variáveis globais
let currentColor = '#000000';
let currentTool = 'pencil';
let isDrawing = false;
let currentZoom = 100;
let showGrid = true;
let canvasSize = window.innerWidth <= 768 ? (window.innerWidth <= 480 ? 10 : 12) : 16;

// Elementos do DOM
const canvas = document.getElementById('pixel-canvas');
const colorPalette = document.querySelectorAll('.color');
const tools = document.querySelectorAll('.tools button');
const themeToggle = document.getElementById('theme-toggle');
const gridToggle = document.getElementById('grid-toggle');
const zoomIn = document.getElementById('zoom-in');
const zoomOut = document.getElementById('zoom-out');
const zoomLevel = document.getElementById('zoom-level');

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  initializeCanvas();
  setupEventListeners();
  initializeUI();
  loadTheme();
});

// Criar canvas de pixels
function initializeCanvas() {
  canvas.innerHTML = ''; // Limpar canvas existente
  canvas.style.gridTemplateColumns = `repeat(${canvasSize}, ${getPixelSize()}px)`;
  canvas.style.gridTemplateRows = `repeat(${canvasSize}, ${getPixelSize()}px)`;
  
  for (let i = 0; i < canvasSize * canvasSize; i++) {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    pixel.dataset.index = i;
    pixel.style.width = getPixelSize() + 'px';
    pixel.style.height = getPixelSize() + 'px';
    canvas.appendChild(pixel);
  }
}

// Obter tamanho do pixel baseado no tamanho da tela
function getPixelSize() {
  if (window.innerWidth <= 480) return 16;
  if (window.innerWidth <= 768) return 18;
  return 20;
}

// Configurar event listeners
function setupEventListeners() {
  // Seleção de cores
  colorPalette.forEach(color => {
    color.addEventListener('click', function () {
      currentColor = this.dataset.color;
      updateSelectedColor(this);
    });
  });

  // Seleção de ferramentas
  tools.forEach(tool => {
    tool.addEventListener('click', function () {
      const toolName = this.id.replace('-tool', '');
      if (toolName === 'clear') {
        clearCanvas();
      } else {
        currentTool = toolName;
        updateSelectedTool();
      }
    });
  });

  // Tema
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Controles do canvas
  if (gridToggle) {
    gridToggle.addEventListener('click', toggleGrid);
  }
  
  if (zoomIn) {
    zoomIn.addEventListener('click', () => changeZoom(25));
  }
  
  if (zoomOut) {
    zoomOut.addEventListener('click', () => changeZoom(-25));
  }

  // Eventos do canvas para mouse
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Eventos do canvas para touch
  canvas.addEventListener('touchstart', startDrawingTouch, { passive: false });
  canvas.addEventListener('touchmove', drawTouch, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);

  // Atalhos de teclado
  document.addEventListener('keydown', handleKeyboard);

  // Responsividade
  window.addEventListener('resize', handleResize);
}

// Atalhos de teclado
function handleKeyboard(e) {
  const key = e.key.toLowerCase();
  
  switch (key) {
    case 'p':
      currentTool = 'pencil';
      updateSelectedTool();
      break;
    case 'e':
      currentTool = 'eraser';
      updateSelectedTool();
      break;
    case 'f':
      currentTool = 'fill';
      updateSelectedTool();
      break;
    case 'c':
      clearCanvas();
      break;
  }
}

// Responsividade
function handleResize() {
  const newCanvasSize = window.innerWidth <= 768 ? (window.innerWidth <= 480 ? 10 : 12) : 16;
  if (newCanvasSize !== canvasSize) {
    canvasSize = newCanvasSize;
    initializeCanvas();
    setupCanvasEvents();
  }
}

// Configurar eventos do canvas após recriação
function setupCanvasEvents() {
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
  canvas.addEventListener('touchstart', startDrawingTouch, { passive: false });
  canvas.addEventListener('touchmove', drawTouch, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

// Funções de desenho - Mouse
function startDrawing(e) {
  if (e.target.classList.contains('pixel')) {
    isDrawing = true;
    drawPixel(e.target);
    e.preventDefault();
  }
}

function draw(e) {
  if (isDrawing && e.target.classList.contains('pixel')) {
    drawPixel(e.target);
    e.preventDefault();
  }
}

// Funções de desenho - Touch
function startDrawingTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  
  if (element && element.classList.contains('pixel')) {
    isDrawing = true;
    drawPixel(element);
  }
}

function drawTouch(e) {
  e.preventDefault();
  if (isDrawing) {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('pixel')) {
      drawPixel(element);
    }
  }
}

function stopDrawing() {
  isDrawing = false;
}

function drawPixel(pixel) {
  const pixelBg = getComputedStyle(document.documentElement).getPropertyValue('--pixel-bg').trim();
  const pixelBorder = getComputedStyle(document.documentElement).getPropertyValue('--pixel-border').trim();
  
  if (currentTool === 'pencil') {
    pixel.style.backgroundColor = currentColor;
  } else if (currentTool === 'eraser') {
    pixel.style.backgroundColor = pixelBg;
  } else if (currentTool === 'fill') {
    floodFill(pixel);
  }
}

// Algoritmo de preenchimento (flood fill)
function floodFill(startPixel) {
  const pixels = Array.from(canvas.children);
  const startIndex = parseInt(startPixel.dataset.index);
  const targetColor = getComputedStyle(startPixel).backgroundColor;
  
  if (rgbToHex(targetColor) === currentColor) {
    return; // Não preencher se a cor já for a mesma
  }
  
  const stack = [startIndex];
  const visited = new Set();
  
  while (stack.length > 0) {
    const currentIndex = stack.pop();
    
    if (visited.has(currentIndex)) continue;
    visited.add(currentIndex);
    
    const currentPixel = pixels[currentIndex];
    if (!currentPixel || rgbToHex(getComputedStyle(currentPixel).backgroundColor) !== rgbToHex(targetColor)) {
      continue;
    }
    
    currentPixel.style.backgroundColor = currentColor;
    
    // Adicionar pixels adjacentes
    const row = Math.floor(currentIndex / canvasSize);
    const col = currentIndex % canvasSize;
    
    // Cima
    if (row > 0) stack.push(currentIndex - canvasSize);
    // Baixo
    if (row < canvasSize - 1) stack.push(currentIndex + canvasSize);
    // Esquerda
    if (col > 0) stack.push(currentIndex - 1);
    // Direita
    if (col < canvasSize - 1) stack.push(currentIndex + 1);
  }
}

// Converter RGB para HEX
function rgbToHex(rgb) {
  if (rgb.startsWith('#')) return rgb;
  
  const values = rgb.match(/\d+/g);
  if (!values) return rgb;
  
  return '#' + values.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Limpar canvas
function clearCanvas() {
  const pixels = canvas.querySelectorAll('.pixel');
  const pixelBg = getComputedStyle(document.documentElement).getPropertyValue('--pixel-bg').trim();
  
  pixels.forEach(pixel => {
    pixel.style.backgroundColor = pixelBg;
  });
}

// Alternar tema
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('pixel-art-theme', newTheme);
}

// Carregar tema
function loadTheme() {
  const savedTheme = localStorage.getItem('pixel-art-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
}

// Alternar grade
function toggleGrid() {
  showGrid = !showGrid;
  canvas.classList.toggle('no-grid', !showGrid);
  
  if (gridToggle) {
    gridToggle.textContent = showGrid ? '🔲' : '⬜';
    gridToggle.title = showGrid ? 'Ocultar Grade' : 'Mostrar Grade';
  }
}

// Controle de zoom
function changeZoom(delta) {
  const newZoom = Math.max(50, Math.min(200, currentZoom + delta));
  
  if (newZoom !== currentZoom) {
    // Remover classe de zoom anterior
    canvas.classList.remove(`zoom-${currentZoom}`);
    
    currentZoom = newZoom;
    
    // Adicionar nova classe de zoom
    if (currentZoom !== 100) {
      canvas.classList.add(`zoom-${currentZoom}`);
    }
    
    if (zoomLevel) {
      zoomLevel.textContent = currentZoom + '%';
    }
  }
}

// Atualizar interface
function updateSelectedColor(selectedColorElement) {
  // Remover seleção anterior
  colorPalette.forEach(color => {
    color.classList.remove('selected');
  });
  
  // Adicionar seleção atual
  selectedColorElement.classList.add('selected');

  // Atualizar preview da cor atual
  const currentColorPreview = document.getElementById('current-color-preview');
  if (currentColorPreview) {
    currentColorPreview.style.backgroundColor = currentColor;
  }
}

function updateSelectedTool() {
  // Remover seleção anterior
  tools.forEach(tool => {
    tool.classList.remove('active');
  });
  
  // Adicionar seleção atual
  const selectedTool = document.getElementById(currentTool + '-tool');
  if (selectedTool) {
    selectedTool.classList.add('active');
  }
}

// Inicializar interface
function initializeUI() {
  // Selecionar primeira cor por padrão
  if (colorPalette.length > 0) {
    updateSelectedColor(colorPalette[0]);
  }

  // Selecionar primeira ferramenta por padrão
  updateSelectedTool();
  
  // Configurar zoom inicial
  if (zoomLevel) {
    zoomLevel.textContent = currentZoom + '%';
  }
}
