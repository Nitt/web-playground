import { CellType } from './puzzle.js';

const DIRS = {
  '-1,0': 'LEFT',
  '0,-1': 'UP',
  '1,0': 'RIGHT',
  '0,1': 'DOWN'
};

export class Player {
  constructor(getMapState, renderStep) {
    this.getMapState = getMapState; // Function to get current map state
    this.renderStep = renderStep;   // Function to re-render the grid
    this.position = null;
  }

  // Initialize at start position
  reset() {
    const map = this.getMapState().map;
    this.position = { ...map.startPos };
    this.renderStep();
  }

  // Move in a direction until blocked or sticky
  move(dx, dy) {
    const mapState = this.getMapState();
    const map = mapState.map;
    const visitedDirs = mapState.visitedDirs;
    let { x, y } = this.position;
    const dirKey = DIRS[`${dx},${dy}`];

    while (true) {
      const nx = x + dx;
      const ny = y + dy;
      const index = ny * map.width + nx;
      const cellType = map.cells[index];

      if (cellType === CellType.BLOCK) break;

      if (cellType === CellType.ONEWAY) {
        // Only pass if the direction is allowed (was visited during generation)
        const allowed = visitedDirs?.get(index)?.has(dirKey);
        if (!allowed) break;
      }

      x = nx;
      y = ny;
      if (cellType === CellType.STICKY) break;
    }
    this.position = { x, y };
    this.renderStep();
  }

  async animateMove(dx, dy) {
    const mapState = this.getMapState();
    const map = mapState.map;
    const visitedDirs = mapState.visitedDirs;
    let { x, y } = this.position;
    const dirKey = DIRS[`${dx},${dy}`];

    while (true) {
      const nx = x + dx;
      const ny = y + dy;
      const index = ny * map.width + nx;
      const cellType = map.cells[index];

      if (cellType === CellType.BLOCK) break;
      if (cellType === CellType.ONEWAY) {
        const allowed = visitedDirs?.get(index)?.has(dirKey);
        if (!allowed) break;
      }

      x = nx;
      y = ny;
      this.position = { x, y };
      this.renderStep();
      await new Promise(resolve => setTimeout(resolve, 180)); // Match transition duration

      if (cellType === CellType.STICKY) break;
    }
  }

  // Render character in the grid
  render(cellElements, map) {
    for (let i = 0; i < cellElements.length; i++) {
      const cell = cellElements[i];
      if (!cell) continue;
      const oldChar = cell.querySelector('.character');
      if (oldChar) cell.removeChild(oldChar);
    }
    if (!this.position) return;
    const index = this.position.y * map.width + this.position.x;
    const cell = cellElements[index];
    if (cell) {
      const char = document.createElement('div');
      char.className = 'character';
      cell.appendChild(char);
    }
  }

  renderAbsolute(gridElement, map) {
    let char = gridElement.querySelector('.character');
    if (!char) {
      char = document.createElement('div');
      char.className = 'character';
      gridElement.appendChild(char);
    }
    if (!this.position) return;

    // Calculate cell size and position
    const innerWidth = map.width - 2;
    const innerHeight = map.height - 2;
    const style = window.getComputedStyle(gridElement);
    const gapX = parseInt(style.columnGap) || 0;
    const gapY = parseInt(style.rowGap) || 0;
    const cellWidth = gridElement.clientWidth / innerWidth;
    const cellHeight = gridElement.clientHeight / innerHeight;

    // Calculate position including gaps
    const x = this.position.x - 1;
    const y = this.position.y - 1;
    const left = x * (cellWidth + gapX) + cellWidth / 2;
    const top = y * (cellHeight + gapY) + cellHeight / 2;

    char.style.width = `${cellWidth * 0.6}px`;
    char.style.height = `${cellHeight * 0.6}px`;
    char.style.position = 'absolute';
    char.style.transition = 'transform 0.18s linear';
    char.style.transform = `translate(-50%, -50%) translate(${left}px, ${top}px)`;
  }
}