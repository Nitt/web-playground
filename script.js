import { createPuzzle, CellType } from './puzzle.js';

const elements = {
  grid: document.querySelector('.grid'),
  widthInput: document.getElementById('widthInput'),
  heightInput: document.getElementById('heightInput'),
  generateBtn: document.getElementById('generateBtn'),
  seedInput: document.getElementById('seedInput'),
  maxStepsInput: document.getElementById('maxStepsInput'),
  maxStepsValue: document.getElementById('maxStepsValue')
};

const CellTypeClass = Object.keys(CellType).reduce((acc, key) => {
  acc[CellType[key]] = key;
  return acc;
}, {});

let cellElements = [];
let arrowElements = [];
let mapStates = [];

// Create grid DOM elements once per puzzle
function createGridElements(map) {
  elements.grid.innerHTML = '';
  cellElements = [];
  arrowElements = [];

  for (let y = 1; y <= map.height - 2; y++) {
    for (let x = 1; x <= map.width - 2; x++) {
      const index = y * map.width + x;
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cellElements[index] = cell;
      arrowElements[index] = {};

      ['LEFT', 'UP', 'RIGHT', 'DOWN'].forEach(dir => {
        const arrow = document.createElement('div');
        arrow.classList.add('arrow', dir);
        arrowElements[index][dir] = arrow;
        cell.appendChild(arrow);
      });

      elements.grid.appendChild(cell);
    }
  }
}

// Apply grid CSS styles
function applyGridStyles(map) {
  if (!map) return;
  const innerWidth = map.width - 2;
  const innerHeight = map.height - 2;
  const maxWidth = elements.grid.clientWidth * 0.9;
  const maxHeight = elements.grid.clientHeight * 0.9;
  const cellSize = Math.min(
    Math.floor(maxWidth / innerWidth),
    Math.floor(maxHeight / innerHeight)
  );
  elements.grid.style.gridTemplateColumns = `repeat(${innerWidth}, ${cellSize}px)`;
  elements.grid.style.gridTemplateRows = `repeat(${innerHeight}, ${cellSize}px)`;
  elements.grid.querySelectorAll('.cell').forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });
}

// Render a specific puzzle state
function renderMapState(map, visitedDirs) {
  const startIndex = map.startPos.y * map.width + map.startPos.x;
  for (let y = 1; y <= map.height - 2; y++) {
    for (let x = 1; x <= map.width - 2; x++) {
      const index = y * map.width + x;
      const value = map.cells[index];
      const cell = cellElements[index];
      cell.className = 'cell';
      if (index === startIndex) {
        cell.classList.add('START');
      } else {
        cell.classList.add(CellTypeClass[value]);
      }
      ['LEFT', 'UP', 'RIGHT', 'DOWN'].forEach(dir => {
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

// Render the selected step
function renderStep(step) {
  const state = mapStates[step];
  if (state) {
    renderMapState(state.map, state.visitedDirs);
    applyGridStyles(state.map);
  }
}

// Generate a new puzzle and initialize grid
async function generatePuzzle() {
  console.log('Generating puzzle...');
  const width = parseInt(elements.widthInput.value) || 10;
  const height = parseInt(elements.heightInput.value) || 10;
  const seed = parseInt(elements.seedInput.value) || 0;
  const { mapStates: generatedStates } = await createPuzzle(width, height, { seed });
  mapStates = generatedStates;
  elements.maxStepsInput.max = mapStates.length - 1;
  elements.maxStepsValue.textContent = elements.maxStepsInput.max;
  createGridElements(mapStates[0].map);
  renderStep(parseInt(elements.maxStepsInput.value) || 0);
}

// Event listeners
elements.generateBtn.addEventListener('click', generatePuzzle);
elements.seedInput.addEventListener('input', generatePuzzle);
elements.maxStepsInput.addEventListener('input', () => {
  elements.maxStepsValue.textContent = elements.maxStepsInput.value;
  renderStep(parseInt(elements.maxStepsInput.value));
});
window.addEventListener('resize', () => {
  if (mapStates.length) applyGridStyles(mapStates[0].map);
});

// Initial load
(async () => {
  await generatePuzzle();
})();