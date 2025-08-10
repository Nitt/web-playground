const grid = document.querySelector('.grid');

// This handles the visual setup: sizes the cells based on container size & grid dimensions
function setupGridStyles(gridWidth, gridHeight) {
  // Calculate max available size (viewport minus some margin)
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.9;

  // Calculate cell size to fit grid within max available space
  const cellWidth = Math.floor(maxWidth / gridWidth);
  const cellHeight = Math.floor(maxHeight / gridHeight);

  // Use the smaller dimension to keep cells square
  const cellSize = Math.min(cellWidth, cellHeight);

  // Set CSS grid styles
  grid.style.gridTemplateColumns = `repeat(${gridWidth}, ${cellSize}px)`;
  grid.style.gridTemplateRows = `repeat(${gridHeight}, ${cellSize}px)`;

  // Update all existing cells size (if any)
  const cells = grid.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
  });
}

// This handles grid data: creates cells based on width & height
function createGridData(width, height) {
  grid.innerHTML = ''; // clear existing cells

  for (let i = 0; i < width * height; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    grid.appendChild(cell);
  }
}

// Main function to initialize grid
function initGrid(width, height) {
  createGridData(width, height);
  setupGridStyles(width, height);
}

// Initialize example grid
initGrid(10, 10);

// Optional: adjust grid layout when window resizes
window.addEventListener('resize', () => {
  setupGridStyles(10, 10);
});
