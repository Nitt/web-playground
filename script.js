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

  const innerWidth = map.width - 2;
  const innerHeight = map.height - 2;

  const maxWidth = grid.clientWidth * 0.9;
  const maxHeight = grid.clientHeight * 0.9;

  const cellWidth = Math.floor(maxWidth / innerWidth);
  const cellHeight = Math.floor(maxHeight / innerHeight);
  const cellSize = Math.min(cellWidth, cellHeight);

  grid.style.gridTemplateColumns = `repeat(${innerWidth}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${innerHeight}, ${cellSize}px)`;

  const cells = grid.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });
}

function createGridData(map) {
  if (!map) return;

  const innerWidth = map.width - 2;
  const innerHeight = map.height - 2;

  grid.innerHTML = '';

  const startIndex = map.startPos.y * map.width + map.startPos.x;

  for (let y = 1; y <= innerHeight; y++) {
    for (let x = 1; x <= innerWidth; x++) {
      const index = y * map.width + x;
      const value = map.cells[index];

      const cell = document.createElement('div');
      cell.classList.add('cell');

      if (index === startIndex) {
        cell.classList.add('START');
      } else {
        cell.classList.add(CellTypeClass[value]);
      }

      // Add arrows for visited directions
      const directions = ['up', 'right', 'down', 'left'];
      directions.forEach(dir => {
        const arrow = document.createElement('div');
        arrow.classList.add('arrow', dir);
  
        // Check if this direction has been visited
        if (map.visitedDirs?.[i]?.[dir]) {
          arrow.classList.add('visited');
        }
  
        cell.appendChild(arrow);
      });

      grid.appendChild(cell);
    }
  }
}

function visualiseMap(map) {
  createGridData(map);
  setupGridStyles(map);
}

async function createMap(width, height) {
  const stepMode = document.getElementById('debugStep').checked;

  const map = await createPuzzle(width, height, {
    onStep: stepMode
      ? async (map) => {
          visualiseMap(map);
          // Could slow it down with requestAnimationFrame or setTimeout
          //await new Promise(r => setTimeout(r, 5));
          await new Promise(requestAnimationFrame);
        }
      : null
  });

  if (!stepMode) {
    visualiseMap(map);
  }
  return map;
}

let map;
(async () => {
  const initialWidth = parseInt(widthInput.value) || 10;
  const initialHeight = parseInt(heightInput.value) || 10;
  map = await createMap(initialWidth, initialHeight);
})();

generateBtn.addEventListener('click', async () => {
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  if (Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0) {
    map = await createMap(w, h);
  } else {
    alert('Please enter valid positive integers for width and height.');
  }
});

window.addEventListener('resize', () => {
  if (map) {
    setupGridStyles(map);
  }
});
