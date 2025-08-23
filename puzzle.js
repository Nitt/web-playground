import { getRandom, setRandomSeed } from './RandomValues.js';

export const CellType = {
  UNTOUCHED: 0,
  EMPTY: 1,
  STICKY: 2,
  BLOCK: 3,
  ONEWAY: 4,
  TELEPORTER: 5,
};

const Dirs = {
  LEFT:  { x: -1,  y:  0 },
  UP:    { x:  0,  y: -1 },
  RIGHT: { x:  1,  y:  0 },
  DOWN:  { x:  0,  y:  1 },
};

const Likelihoods = {
  sticky: 0.06,
  block: 0.1,
  oneway: 0.02,
  teleporter: 0,
  empty: 1,
};

// Main puzzle generator: returns all intermediate states for step visualization
export async function createPuzzle(width, height, { seed } = {}) {
  if (typeof seed !== 'undefined') setRandomSeed(seed);

  let map = initMap(width, height);
  let branchPoints = [];
  let visitedDirs = new Map();
  const visitedBranchPositions = new Set();
  let mapStates = [];

  function cloneState() {
    // Deep copy map and visitedDirs for step visualization
    mapStates.push({
      map: {
        width: map.width,
        height: map.height,
        cells: [...map.cells],
        startPos: { ...map.startPos }
      },
      visitedDirs: new Map(Array.from(visitedDirs, ([k, v]) => [k, new Set(v)]))
    });
  }

  function getIndex(pos) {
    return pos.y * map.width + pos.x;
  }

  function hasVisitedDirection(index, dirKey) {
    const set = visitedDirs.get(index);
    return set ? set.has(dirKey) : false;
  }

  function markVisitedDirection(index, dirKey) {
    if (!visitedDirs.has(index)) {
      visitedDirs.set(index, new Set());
    }
    visitedDirs.get(index).add(dirKey);
  }

  function addBranchPoint(pos) {
    const key = `${pos.x},${pos.y}`;
    if (!visitedBranchPositions.has(key)) {
      visitedBranchPositions.add(key);
      branchPoints.push(pos);
    }
  }

  function getCellToPlace(index) {
    const total = Object.values(Likelihoods).reduce((a, b) => a + b, 0);
    let r = getRandom() * total;
    for (const type in Likelihoods) {
      if (r < Likelihoods[type]) {
        return CellType[type.toUpperCase()];
      }
      r -= Likelihoods[type];
    }
    return CellType.EMPTY;
  }

  function placeStart() {
    const innerWidth = map.width - 2;
    const innerHeight = map.height - 2;
    const startPosition = {
      x: 1 + Math.floor(getRandom() * innerWidth),
      y: 1 + Math.floor(getRandom() * innerHeight),
    };
    const startIndex = getIndex(startPosition);
    map.cells[startIndex] = CellType.EMPTY;
    map.startPos = startPosition;
    return startPosition;
  }

  async function goDirection(dirKey, pos) {
    cloneState();

    const dir = Dirs[dirKey];
    const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    const currentIndex = getIndex(pos);

    if (hasVisitedDirection(currentIndex, dirKey)) return;
    markVisitedDirection(currentIndex, dirKey);

    const nextIndex = getIndex(nextPos);
    const nextCell = map.cells[nextIndex];

    switch (nextCell) {
      case CellType.UNTOUCHED: {
        const cellToPlace = getCellToPlace(nextIndex);
        switch (cellToPlace) {
          case CellType.EMPTY:
            map.cells[nextIndex] = CellType.EMPTY;
            await goDirection(dirKey, nextPos);
            break;
          case CellType.ONEWAY: {
            const nextNextPos = { x: nextPos.x + dir.x, y: nextPos.y + dir.y };
            const nextNextIndex = getIndex(nextNextPos);
            const nextNextCell = map.cells[nextNextIndex];
            if (nextNextCell === CellType.UNTOUCHED || nextNextCell === CellType.EMPTY) {
              map.cells[nextNextIndex] = CellType.EMPTY;
              map.cells[nextIndex] = CellType.ONEWAY;
            } else {
              map.cells[nextIndex] = CellType.EMPTY;
            }
            await goDirection(dirKey, nextPos);
            break;
          }
          case CellType.BLOCK:
            map.cells[nextIndex] = CellType.BLOCK;
            addBranchPoint(pos);
            break;
          case CellType.STICKY:
            map.cells[nextIndex] = CellType.STICKY;
            addBranchPoint(nextPos);
            break;
        }
        break;
      }
      case CellType.EMPTY:
        if (!hasVisitedDirection(nextIndex, dirKey)) {
          await goDirection(dirKey, nextPos);
        }
        break;
      case CellType.BLOCK:
        addBranchPoint(pos);
        break;
      case CellType.STICKY:
        addBranchPoint(nextPos);
        break;
      case CellType.ONEWAY:
        addBranchPoint(pos);
        break;
    }
  }

  // Initialize map and start generation
  branchPoints.length = 0;
  visitedDirs.clear();
  visitedBranchPositions.clear();
  map = initMap(width, height);
  const startPosition = placeStart();
  branchPoints = [startPosition];

  while (branchPoints.length > 0) {
    const current = branchPoints.shift();
    for (const dirKey of Object.keys(Dirs)) {
      await goDirection(dirKey, current);
    }
  }

  // Final state
  cloneState();

  return { mapStates };
}

// Helper to initialize the map with borders
function initMap(width, height) {
  const paddedWidth = width + 2;
  const paddedHeight = height + 2;
  const cells = new Array(paddedWidth * paddedHeight).fill(CellType.UNTOUCHED);

  // Fill border with blockers
  for (let x = 0; x < paddedWidth; x++) {
    cells[x] = CellType.BLOCK;
    cells[(paddedHeight - 1) * paddedWidth + x] = CellType.BLOCK;
  }
  for (let y = 0; y < paddedHeight; y++) {
    cells[y * paddedWidth] = CellType.BLOCK;
    cells[y * paddedWidth + (paddedWidth - 1)] = CellType.BLOCK;
  }

  return {
    width: paddedWidth,
    height: paddedHeight,
    cells,
    startPos: null,
  };
}
