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
    this.moveCallback = moveCallback;
    this.position = null;
    this.isMoving = false; // <-- Add this
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

    // Only show D-pad buttons if not moving
    if (this.isMoving) return;

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
    this.isMoving = true;
    const mapState = this.getMapState();
    const map = mapState.map;
    const visitedDirs = mapState.visitedDirs;
    let { x, y } = this.position;
    const dirKey = DIRS.find(d => d.dx === dx && d.dy === dy).key;

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
      await new Promise(resolve => setTimeout(resolve, 180));
      if (cellType === CellType.STICKY) break;
    }
    this.isMoving = false;
    this.renderStep(); // Re-render to show D-pad buttons
  }

  async smoothMove(dx, dy) {
    const mapState = this.getMapState();
    const map = mapState.map;
    const visitedDirs = mapState.visitedDirs;
    let { x, y } = this.position;
    const dirKey = DIRS.find(d => d.dx === dx && d.dy === dy).key;

    // Find the final destination (slide until blocked/sticky)
    let tx = x, ty = y;
    while (true) {
      const nx = tx + dx;
      const ny = ty + dy;
      const index = ny * map.width + nx;
      const cellType = map.cells[index];
      if (cellType === CellType.BLOCK) break;
      if (cellType === CellType.ONEWAY) {
        const allowed = visitedDirs?.get(index)?.has(dirKey);
        if (!allowed) break;
      }
      tx = nx;
      ty = ny;
      if (cellType === CellType.STICKY) break;
    }

    // Animate from (x, y) to (tx, ty)
    const steps = Math.max(Math.abs(tx - x), Math.abs(ty - y));
    if (steps === 0) return;

    for (let step = 1; step <= steps; step++) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      this.position = { x: nx, y: ny };
      this.renderStep();
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }
}