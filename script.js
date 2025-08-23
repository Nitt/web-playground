import { createPuzzle, CellType } from './puzzle.js';

const grid = document.querySelector('.grid');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const generateBtn = document.getElementById('generateBtn');
const seedInput = document.getElementById('seedInput');
const speedInput = document.getElementById('speedInput');
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

// Create all the grid cells and arrows
function createGridData(map, visitedDirs) {
  if (!map) return;

  grid.innerHTML = '';
  const startIndex = map.startPos.y * map.width + map.startPos.x;

  for (let y = 1; y <= map.height - 2; y++) {
    for (let x = 1; x <= map.width - 2; x++) {
      const index = y * map.width + x;
      const value = map.cells[index];

      const cell = document.createElement('div');
      cell.classList.add('cell');

      if (index === startIndex) {
        cell.classList.add('START');
      } else {
        cell.classList.add(CellTypeClass[value]);
      }

      // Add arrows
      const directions = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
      directions.forEach(dir => {
        const arrow = document.createElement('div');
        arrow.classList.add('arrow', dir);

        console.log(index, visitedDirs?.get(index), dir);

        if (visitedDirs?.has(index) && visitedDirs.get(index).has(dir)) {
          console.log('Visited arrow', index, dir);
          arrow.classList.add('visited');
        } else {
          console.log('Not visited', index, dir);
          arrow.classList.remove('visited');
        }

        cell.appendChild(arrow);
      });

      grid.appendChild(cell);
    }
  }
}

// Visualize the map
function visualiseMap(map, visitedDirs) {
  createGridData(map, visitedDirs);
  setupGridStyles(map);
}

// Create a map
async function createMap(width, height, seed) {
  const stepMode = document.getElementById('debugStep').checked;
  const STEP_DELAY_MS = parseInt(speedInput.value) || 300;
  let maxSteps = parseInt(maxStepsInput.value) || 1;

  let stepCount = 0;

  // Run once to get stepCount
  const { map, visitedDirs, stepCount: realMaxSteps } = await createPuzzle(width, height, {
    onStep: () => {}, // No visualization, just count
    seed
  });

  // Set slider max to realMaxSteps
  maxStepsInput.max = realMaxSteps;
  maxStepsValue.textContent = maxStepsInput.value;

  // Now run with visualization if needed
  let currentStep = 0;
  const { map: finalMap, visitedDirs: finalVisitedDirs } = await createPuzzle(width, height, {
    onStep: stepMode
      ? async (map, visitedDirs) => {
          visualiseMap(map, visitedDirs);
          currentStep++;
          if (currentStep >= maxSteps) {
            currentStep = 0;
            await new Promise(resolve => setTimeout(resolve, STEP_DELAY_MS));
          }
        }
      : null,
    seed
  });

  if (!stepMode) visualiseMap(finalMap, finalVisitedDirs);

  return { map: finalMap, visitedDirs: finalVisitedDirs };
}

let map;
let visitedDirs = new Map();
(async () => {
  const initialWidth = parseInt(widthInput.value) || 10;
  const initialHeight = parseInt(heightInput.value) || 10;
  const initialSeed = parseInt(seedInput.value) || 42;
  ({map, visitedDirs} = await createMap(initialWidth, initialHeight, initialSeed));
})();

generateBtn.addEventListener('click', async () => {
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  const seed = parseInt(seedInput.value) || 42;
  if (Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0) {
    ({map, visitedDirs} = await createMap(w, h, seed));
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
});
