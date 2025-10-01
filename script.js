// Variáveis globais
let currentColor = '#000000';
let currentTool = 'pencil';
let isDrawing = false;

// Elementos do DOM
const canvas = document.getElementById('pixel-canvas');
const colorPalette = document.querySelectorAll('.color');
const tools = document.querySelectorAll('.tools button');

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  initializeCanvas();
  setupEventListeners();
});

// Criar canvas de pixels
function initializeCanvas() {
  for (let i = 0; i < 256; i++) { // 16x16 = 256 pixels
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    pixel.dataset.index = i;
    canvas.appendChild(pixel);
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Seleção de cores
  colorPalette.forEach(color => {
    color.addEventListener('click', function () {
      currentColor = this.dataset.color;
      updateSelectedColor();
    });
  });

  // Seleção de ferramentas
  tools.forEach(tool => {
    tool.addEventListener('click', function () {
      currentTool = this.id.replace('-tool', '');
      updateSelectedTool();
    });
  });

  // Eventos do canvas
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
}

// Funções de desenho
function startDrawing(e) {
  if (e.target.classList.contains('pixel')) {
    isDrawing = true;
    drawPixel(e.target);
  }
}

function draw(e) {
  if (isDrawing && e.target.classList.contains('pixel')) {
    drawPixel(e.target);
  }
}

function stopDrawing() {
  isDrawing = false;
}

function drawPixel(pixel) {
  if (currentTool === 'pencil') {
    pixel.style.backgroundColor = currentColor;
  } else if (currentTool === 'eraser') {
    pixel.style.backgroundColor = 'white';
  }
  // fill-tool será implementado futuramente
}

// Atualizar interface
function updateSelectedColor() {
  colorPalette.forEach(color => {
    color.style.border = '1px solid #ccc';
  });
  event.target.style.border = '3px solid #333';
}

function updateSelectedTool() {
  tools.forEach(tool => {
    tool.style.backgroundColor = '#f9f9f9';
  });
  document.getElementById(currentTool + '-tool').style.backgroundColor = '#007bff';
  document.getElementById(currentTool + '-tool').style.color = 'white';
}
