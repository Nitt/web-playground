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
      await new Promise(resolve => setTimeout(resolve, 120)); // 120ms per cell

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
    // Remove any previous player
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
    const cellWidth = gridElement.clientWidth / innerWidth;
    const cellHeight = gridElement.clientHeight / innerHeight;

    // Position the player
    const x = this.position.x - 1; // adjust for border
    const y = this.position.y - 1;
    char.style.position = 'absolute';
    char.style.width = `${cellWidth * 0.6}px`;
    char.style.height = `${cellHeight * 0.6}px`;
    char.style.left = `${x * cellWidth + cellWidth * 0.2}px`;
    char.style.top = `${y * cellHeight + cellHeight * 0.2}px`;
    char.style.transition = 'left 0.15s, top 0.15s';
  }
}