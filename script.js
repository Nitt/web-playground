import { createPuzzle, CellType } from './puzzle.js';

const grid = document.querySelector('.grid');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const generateBtn = document.getElementById('generateBtn');

const CellTypeClass = Object.keys(CellType).reduce((acc, key) => {
  acc[CellType[key]] = key;
  return acc;
}, {});

function setupGridStyles(map) {
  if (!map) return;

  const gridWidth = map.width;
  const gridHeight = map.height;

  const maxWidth = grid.clientWidth * 0.9;
  const maxHeight = grid.clientHeight * 0.9;

  const cellWidth = Math.floor(maxWidth / gridWidth);
  const cellHeight = Math.floor(maxHeight / gridHeight);
  const cellSize = Math.min(cellWidth, cellHeight);

  grid.style.gridTemplateColumns = `repeat(${gridWidth}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${gridHeight}, ${cellSize}px)`;

  const cells = grid.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });
}

function createGridData(map) {
  if (!map) return;

  const width = map.width;
  const height = map.height;

  grid.innerHTML = '';

  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    const value = map.cells[i];
    cell.classList.add('cell', CellTypeClass[value]);
    grid.appendChild(cell);
  }
}

function visualiseMap(map) {
  createGridData(map);
  setupGridStyles(map);
}

function createMap(width, height) {
  const map = createPuzzle(width, height);
  visualiseMap(map);
  return map;
}

function createMap(width, height) {
  const stepMode = document.getElementById('debugStep').checked;

  const map = createPuzzle(width, height, {
    onStep: stepMode
      ? (map) => {
          visualiseMap(map);
          // Could slow it down with requestAnimationFrame or setTimeout
          // await new Promise(r => setTimeout(r, 50));
        }
      : null
  });

  if (!stepMode) {
    visualiseMap(map);
  }
  return map;
}


// Use defaults if inputs invalid
const initialWidth = parseInt(widthInput.value) || 10;
const initialHeight = parseInt(heightInput.value) || 10;

let map = createMap(initialWidth, initialHeight);

generateBtn.addEventListener('click', () => {
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  if (Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0) {
    map = createMap(w, h);
  } else {
    alert('Please enter valid positive integers for width and height.');
  }
});

window.addEventListener('resize', () => {
  if (map) {
    setupGridStyles(map);
  }
});
