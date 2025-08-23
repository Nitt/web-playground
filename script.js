import { createPuzzle, CellType } from './puzzle.js';

const grid = document.querySelector('.grid');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const generateBtn = document.getElementById('generateBtn');
const seedInput = document.getElementById('seedInput');
const maxStepsInput = document.getElementById('maxStepsInput');
const maxStepsValue = document.getElementById('maxStepsValue');

// Map cell type values to class names
const CellTypeClass = Object.keys(CellType).reduce((acc, key) => {
  acc[CellType[key]] = key;
  return acc;
}, {});

// Setup the CSS grid dimensions
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

let cellElements = [];
let arrowElements = [];

// Create all the grid cells and arrows
function initGrid(map) {
  grid.innerHTML = '';
  cellElements = [];
  arrowElements = [];

  const startIndex = map.startPos.y * map.width + map.startPos.x;

  for (let y = 1; y <= map.height - 2; y++) {
    for (let x = 1; x <= map.width - 2; x++) {
      const index = y * map.width + x;
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cellElements[index] = cell;

      // Store arrow elements for this cell
      arrowElements[index] = {};

      const directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
      directions.forEach(dir => {
        const arrow = document.createElement('div');
        arrow.classList.add('arrow', dir);
        arrowElements[index][dir] = arrow;
        cell.appendChild(arrow);
      });

      grid.appendChild(cell);
    }
  }
}

// Visualize the map
function visualiseMap(map, visitedDirs) {
  initGrid(map);
  setupGridStyles(map);

  const startIndex = map.startPos.y * map.width + map.startPos.x;

  for (let y = 1; y <= map.height - 2; y++) {
    for (let x = 1; x <= map.width - 2; x++) {
      const index = y * map.width + x;

      const directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
      directions.forEach(dir => {
        if (visitedDirs?.has(index) && visitedDirs.get(index).has(dir)) {
          arrowElements[index][dir].classList.add('visited');
        } else {
          arrowElements[index][dir].classList.remove('visited');
        }
      });
    }
  }
}

let mapStates = [];

async function createMap(width, height, seed) {
  const { mapStates: generatedStates } = await createPuzzle(width, height, { seed });
  mapStates = generatedStates;

  // Set slider max to number of steps
  maxStepsInput.max = mapStates.length - 1;
  maxStepsValue.textContent = maxStepsInput.value;

  // Show initial state
  showStep(parseInt(maxStepsInput.value) || 0);
}

function showStep(step) {
  const state = mapStates[step];
  if (state) {
    visualiseMap(state.map, state.visitedDirs);
  }
}

generateBtn.addEventListener('click', async () => {
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  const seed = parseInt(seedInput.value) || 42;
  if (Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0) {
    await createMap(w, h, seed);
  } else {
    alert('Please enter valid positive integers for width and height.');
  }
});

// Update grid size on window resize
window.addEventListener('resize', () => {
  if (map) setupGridStyles(map, visitedDirs);
});

// Update label when slider changes
maxStepsInput.addEventListener('input', () => {
  maxStepsValue.textContent = maxStepsInput.value;
  showStep(parseInt(maxStepsInput.value));
});

(async () => {
  const initialWidth = parseInt(widthInput.value) || 10;
  const initialHeight = parseInt(heightInput.value) || 10;
  const initialSeed = parseInt(seedInput.value) || 42;
  await createMap(initialWidth, initialHeight, initialSeed);
})();

function updateGrid(map, visitedDirs) {
  const startIndex = map.startPos.y * map.width + map.startPos.x;

  for (let y = 1; y <= map.height - 2; y++) {
    for (let x = 1; x <= map.width - 2; x++) {
      const index = y * map.width + x;
      const value = map.cells[index];
      const cell = cellElements[index];

      // Reset cell classes
      cell.className = 'cell';
      if (index === startIndex) {
        cell.classList.add('START');
      } else {
        cell.classList.add(CellTypeClass[value]);
      }

      // Update arrows
      const directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
      directions.forEach(dir => {
        const arrow = arrowElements[index][dir];
        if (visitedDirs?.has(index) && visitedDirs.get(index).has(dir)) {
          arrow.classList.add('visited');
        } else {
          arrow.classList.remove('visited');
        }
      });
    }
  }
}