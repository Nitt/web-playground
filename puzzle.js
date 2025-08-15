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
  teleporter: 0.01,
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

  return map;
}

async function goDirection(dirKey, pos, onStep) {
  if (onStep) await onStep(map);
  
  const dir = Dirs[dirKey];
  const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };

  const currentIndex = getIndex(pos);

  if (hasVisitedDirection(currentIndex, dirKey)) return;
  markVisitedDirection(currentIndex, dirKey);

  // Check boundaries
  if (
    nextPos.x < 0 || nextPos.x >= map.width ||
    nextPos.y < 0 || nextPos.y >= map.height
  ) {
    addBranchPoint(pos);
    return;
  }

  const nextIndex = getIndex(nextPos);
  const nextCell = map.cells[nextIndex];

  if (nextCell === CellType.UNTOUCHED) {
    const placedType = placeCellTypeIfNeeded(nextIndex);
    if (placedType !== CellType.BLOCK) {
      await goDirection(dirKey, nextPos, onStep);
    } else {
      addBranchPoint(pos);
    }
  } else if (nextCell === CellType.EMPTY) {
    if (!hasVisitedDirection(nextIndex, dirKey)) {
      await goDirection(dirKey, nextPos, onStep);
    }
  } else {
    addBranchPoint(pos);
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
  const startPosition = {
    x: Math.floor(Math.random() * map.width),
    y: Math.floor(Math.random() * map.height),
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
