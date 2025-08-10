const grid = document.querySelector('.grid');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const generateBtn = document.getElementById('generateBtn');

function setupGridStyles(map) {
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
  const width = map.width;
  const height = map.height;

  grid.innerHTML = '';

  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    grid.appendChild(cell);
  }
}

function createPuzzle(width, height) {
  return { width, height };
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

let map = createMap(
  parseInt(widthInput.value),
  parseInt(heightInput.value)
);

generateBtn.addEventListener('click', () => {
  const w = parseInt(widthInput.value);
  const h = parseInt(heightInput.value);
  if (w > 0 && h > 0) {
    map = createMap(w, h);
  }
});

window.addEventListener('resize', () => {
  setupGridStyles(map);
});
