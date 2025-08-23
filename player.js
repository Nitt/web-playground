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
    // Remove previous d-pad buttons from cells
    for (let i = 0; i < cellElements.length; i++) {
      const cell = cellElements[i];
      if (!cell) continue;
      const oldBtn = cell.querySelector('.dpad-btn');
      if (oldBtn) cell.removeChild(oldBtn);
    }

    // Always render the character as a child of grid
    const gridElement = document.querySelector('.grid');
    let char = gridElement.querySelector('.character');
    if (!char) {
      char = document.createElement('div');
      char.className = 'character';
      gridElement.appendChild(char);
    }

    // Position the character using fractional coordinates
    if (this.position) {
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
      char.style.transform = `translate(-50%, -50%) translate(${left}px, ${top}px)`;
    }

    // Only show D-pad buttons if not moving
    if (this.isMoving) return;

    // Add D-pad buttons to valid neighboring cells
    DIRS.forEach(dir => {
      const nx = Math.round(this.position.x + dir.dx);
      const ny = Math.round(this.position.y + dir.dy);
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
    this.isMoving = true;
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

    // Animate from (x, y) to (tx, ty) over a fixed duration
    const steps = Math.max(Math.abs(tx - x), Math.abs(ty - y));
    if (steps === 0) {
      this.isMoving = false;
      this.renderStep();
      return;
    }

    const duration = 180 * steps; // ms, e.g. 180ms per cell
    const startTime = performance.now();
    const startX = x, startY = y;
    const endX = tx, endY = ty;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Interpolate position
      const nx = startX + (endX - startX) * t;
      const ny = startY + (endY - startY) * t;
      this.position = { x: nx, y: ny };
      this.renderStep();
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Snap to final cell
        this.position = { x: endX, y: endY };
        this.isMoving = false;
        this.renderStep();
      }
    };
    requestAnimationFrame(animate);
  }
}