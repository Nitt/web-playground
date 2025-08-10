const grid = document.querySelector('.grid');

function setupGridStyles(map) {
  let gridWidth = map.width;
  let gridHeight = map.height;
  
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;

  const cellWidth = Math.floor(maxWidth / gridWidth);
  const cellHeight = Math.floor(maxHeight / gridHeight);
  const cellSize = Math.min(cellWidth, cellHeight); // keeps the size square

  grid.style.gridTemplateColumns = `repeat(${gridWidth}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${gridHeight}, ${cellSize}px)`;

  const cells = grid.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });
}

function createGridData(map) {
  let width = map.width;
  let height = map.height;
  
  grid.innerHTML = ''; // clear existing cells

  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    grid.appendChild(cell);
  }
}

function createPuzzle(width, height) {
  let map;
  map.width = width;
  map.height = height;
  return map;
}

function visualiseMap(map) {
  createGridData(map);
  setupGridStyles(map);
}

function createMap(width, height) {
  let map = createPuzzle(width, height);
  visualiseMap(map);
  return map;
}

let map = createMap(10, 10);

window.addEventListener('resize', () => {
  setupGridStyles(map);
});
