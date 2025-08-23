import { CellType } from './puzzle.js';

const DIRS = [
  { dx: -1, dy: 0, key: 'LEFT', symbol: '←' },
  { dx: 0, dy: -1, key: 'UP', symbol: '↑' },
  { dx: 1, dy: 0, key: 'RIGHT', symbol: '→' },
  { dx: 0, dy: 1, key: 'DOWN', symbol: '↓' }
];

export class Player {
  constructor(getMapState, renderStep, moveCallback) {
    this.getMapState = getMapState;
    this.renderStep = renderStep;
    this.moveCallback = moveCallback; // Function to move player
    this.position = null;
  }

  // Initialize at start position
  reset() {
    const map = this.getMapState().map;
    this.position = { ...map.startPos };
    this.renderStep();
  }

  // Check if the move is valid
  isValidMove(dx, dy) {
    const mapState = this.getMapState();
    const map = mapState.map;
    const visitedDirs = mapState.visitedDirs;
    const { x, y } = this.position;
    const nx = x + dx;
    const ny = y + dy;
    const index = ny * map.width + nx;
    const cellType = map.cells[index];
    if (cellType === CellType.BLOCK) return false;
    if (cellType === CellType.ONEWAY) {
      const dirKey = DIRS.find(d => d.dx === dx && d.dy === dy).key;
      const allowed = visitedDirs?.get(index)?.has(dirKey);
      return !!allowed;
    }
    return true;
  }

  // Render character and D-pad in the grid
  renderWithDPad(cellElements, map) {
    // Remove previous character and d-pad buttons
    for (let i = 0; i < cellElements.length; i++) {
      const cell = cellElements[i];
      if (!cell) continue;
      const oldChar = cell.querySelector('.character');
      if (oldChar) cell.removeChild(oldChar);
      const oldBtn = cell.querySelector('.dpad-btn');
      if (oldBtn) cell.removeChild(oldBtn);
    }
    if (!this.position) return;
    const index = this.position.y * map.width + this.position.x;
    const cell = cellElements[index];
    if (cell) {
      const char = document.createElement('div');
      char.className = 'character';
      cell.appendChild(char);
    }

    // Add D-pad buttons to valid neighboring cells
    DIRS.forEach(dir => {
      const nx = this.position.x + dir.dx;
      const ny = this.position.y + dir.dy;
      const nIndex = ny * map.width + nx;
      const nCell = cellElements[nIndex];
      if (!nCell) return;
      if (this.isValidMove(dir.dx, dir.dy)) {
        const btn = document.createElement('button');
        btn.className = 'dpad-btn dpad-' + dir.key;
        btn.textContent = dir.symbol;
        btn.setAttribute('aria-label', dir.key);
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this.moveCallback(dir.dx, dir.dy);
        }, { once: true });
        btn.addEventListener('touchstart', e => {
          e.stopPropagation();
          this.moveCallback(dir.dx, dir.dy);
        }, { once: true });
        nCell.appendChild(btn);
      }
    });
  }

  async animateMove(dx, dy) {
    const mapState = this.getMapState();
    const map = mapState.map;
    const { x, y } = this.position;
    const nx = x + dx;
    const ny = y + dy;
    const index = ny * map.width + nx;
    const cellType = map.cells[index];
    if (cellType === CellType.BLOCK) return false;
    this.position = { x: nx, y: ny };
    this.renderStep();
    return true;
  }
}