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
  UP:    { x:  0,  y:  1 },
  RIGHT: { x:  1,  y:  0 },
  DOWN:  { x:  0,  y: -1 },
};

const Likelihoods = {
  sticky: 0.06,
  block: 0.1,
  oneway: 0.02,
  teleporter: 0,
  empty: 1,
};

let map;
let branchPoints = [];
const visitedBranchPositions = new Set();
const visitedDirs = new Map();

export async function createPuzzle(width, height, { onStep } = {}) {
  map = initMap(width, height);
  branchPoints.length = 0;
  visitedBranchPositions.clear();
  visitedDirs.clear();

  const startPosition = placeStart();
  branchPoints = [startPosition];

  while (branchPoints.length > 0) {
    const current = branchPoints.shift();

    for (const dirKey of Object.keys(Dirs)) {
      await goDirection(dirKey, current, onStep);
    }
  }

  map.visitedDirs = visitedDirs;
  return map;
}

async function goDirection(dirKey, pos, onStep) {
  if (onStep) {
    await onStep(map);
  }

  const dir = Dirs[dirKey];
  const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };

  const currentIndex = getIndex(pos);

  if (hasVisitedDirection(currentIndex, dirKey)) {
    return;
  }
  markVisitedDirection(currentIndex, dirKey);

  const nextIndex = getIndex(nextPos);
  const nextCell = map.cells[nextIndex];

  switch (nextCell) {
    case CellType.UNTOUCHED: { // About to add new things!
      const placedType = placeCellTypeIfNeeded(nextIndex);
      switch (placedType) {
        case CellType.EMPTY:
        case CellType.ONEWAY:
          await goDirection(dirKey, nextPos, onStep);
          break;
        case CellType.BLOCK:
          addBranchPoint(pos);
          break;
        case CellType.STICKY:
          addBranchPoint(nextPos);
          break;
      }
      break;
    }

    case CellType.EMPTY:
      if (!hasVisitedDirection(nextIndex, dirKey)) {
        await goDirection(dirKey, nextPos, onStep);
      }
      break;

    case CellType.BLOCK:
      addBranchPoint(pos);
      break;

    case CellType.STICKY:
      addBranchPoint(nextPos);
      break;
      
    case CellType.ONEWAY:
      // No need to check for passthrough direction since we only enter in that direction when placing it (here we're colliding with one already placed)
      // We always place oneways in the directionality we're going when first placing so we just keep track of the "visitedDirs" value of the oneway cell
      addBranchPoint(pos);
      break;
  }
}

function initMap(width, height) {
  const paddedWidth = width + 2;
  const paddedHeight = height + 2;
  const cells = new Array(paddedWidth * paddedHeight).fill(CellType.UNTOUCHED);

  // Fill border with blockers
  for (let x = 0; x < paddedWidth; x++) {
    cells[x] = CellType.BLOCK; // top row
    cells[(paddedHeight - 1) * paddedWidth + x] = CellType.BLOCK; // bottom row
  }
  for (let y = 0; y < paddedHeight; y++) {
    cells[y * paddedWidth] = CellType.BLOCK; // left column
    cells[y * paddedWidth + (paddedWidth - 1)] = CellType.BLOCK; // right column
  }

  return {
    width: paddedWidth,
    height: paddedHeight,
    cells,
    startPos: null,
  };
}

function placeStart() {
  const innerWidth = map.width - 2;
  const innerHeight = map.height - 2;

  const startPosition = {
    x: 1 + Math.floor(Math.random() * innerWidth),
    y: 1 + Math.floor(Math.random() * innerHeight),
  };

  const startIndex = getIndex(startPosition);

  map.cells[startIndex] = CellType.EMPTY;
  map.startPos = startPosition;

  return startPosition;
}

function getIndex(pos) {
  return pos.y * map.width + pos.x;
}

function placeCellTypeIfNeeded(index) {
  const total = Object.values(Likelihoods).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (const type in Likelihoods) {
    if (r < Likelihoods[type]) {
      // TODO: check legality of placing certain types here (oneways and teleporters)
      map.cells[index] = CellType[type.toUpperCase()];
      return CellType[type.toUpperCase()];
    }
    r -= Likelihoods[type];
  }
  
  map.cells[index] = CellType.EMPTY;
  return CellType.EMPTY;
}

function addBranchPoint(pos) {
  const key = `${pos.x},${pos.y}`;
  if (!visitedBranchPositions.has(key)) {
    visitedBranchPositions.add(key);
    branchPoints.push(pos);
  }
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
