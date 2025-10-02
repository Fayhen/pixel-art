// Variáveis globais
let currentColor = '#000000';
let currentTool = 'pencil';
let isDrawing = false;

// Elementos do DOM
const canvas = document.getElementById('pixel-canvas');
const colorPalette = document.querySelectorAll('.color');
const tools = document.querySelectorAll('.tools button');
const clearBtn = document.getElementById('clear-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
  initializeCanvas();
  setupEventListeners();
  initializeUI();
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
      updateSelectedColor(this);
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

  // Botão limpar
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCanvas);
  }
}

// Funções de desenho
function startDrawing(e) {
  if (e.target.classList.contains('pixel')) {
    isDrawing = true;
    drawPixel(e.target);
    e.preventDefault(); // Prevenir seleção de texto
  }
}

function draw(e) {
  if (isDrawing && e.target.classList.contains('pixel')) {
    drawPixel(e.target);
    e.preventDefault(); // Prevenir seleção de texto
  }
}

function stopDrawing() {
  isDrawing = false;
}

function drawPixel(pixel) {
  if (currentTool === 'pencil') {
    pixel.style.backgroundColor = currentColor;
    pixel.style.borderColor = currentColor;
  } else if (currentTool === 'eraser') {
    pixel.style.backgroundColor = 'white';
    pixel.style.borderColor = '#ddd';
  }
  // fill-tool será implementado futuramente
}

// Atualizar interface
function updateSelectedColor(selectedColorElement) {
  colorPalette.forEach(color => {
    color.style.border = '1px solid #ccc';
    color.style.transform = 'scale(1)';
  });
  selectedColorElement.style.border = '3px solid #333';
  selectedColorElement.style.transform = 'scale(1.1)';

  // Atualizar preview da cor atual
  const currentColorPreview = document.getElementById('current-color-preview');
  if (currentColorPreview) {
    currentColorPreview.style.backgroundColor = currentColor;
  }
}

function updateSelectedTool() {
  tools.forEach(tool => {
    tool.style.backgroundColor = '#f9f9f9';
    tool.style.color = '#333';
    tool.style.transform = 'scale(1)';
  });
  const selectedTool = document.getElementById(currentTool + '-tool');
  selectedTool.style.backgroundColor = '#007bff';
  selectedTool.style.color = 'white';
  selectedTool.style.transform = 'scale(1.05)';
}

// Inicializar interface
function initializeUI() {
  // Selecionar primeira cor por padrão
  const firstColor = colorPalette[0];
  updateSelectedColor(firstColor);

  // Selecionar primeira ferramenta por padrão
  updateSelectedTool();
}

// Função para limpar o canvas
function clearCanvas() {
  const pixels = canvas.querySelectorAll('.pixel');
  pixels.forEach(pixel => {
    pixel.style.backgroundColor = 'white';
    pixel.style.borderColor = '#ddd';
  });
}
