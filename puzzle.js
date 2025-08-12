export const CellType = {
  UNTOUCHED: 0,
  EMPTY: 1,
  START: 2,
  BLOCK: 3,
};

const Dirs = {
  LEFT:  { x: -1,  y:  0 },
  UP:    { x:  0,  y:  1 },
  RIGHT: { x:  1,  y:  0 },
  DOWN:  { x:  0,  y: -1 },
};

const Likelihoods = {
  block: 0.2,
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

function initMap(width, height) {
  return {
    width,
    height,
    cells: new Array(width * height).fill(CellType.UNTOUCHED),
  };
}

function placeStart() {
  const startPosition = {
    x: Math.floor(Math.random() * map.width),
    y: Math.floor(Math.random() * map.height),
  };
  const startIndex = getIndex(startPosition);
  map.cells[startIndex] = CellType.START;
  return startPosition;
}

function getIndex(pos) {
  return pos.y * map.width + pos.x;
}

function placeCellTypeIfNeeded(index) {
  const rand = Math.random();
  if (rand < Likelihoods.block) {
    map.cells[index] = CellType.BLOCK;
    return CellType.BLOCK;
  } else {
    map.cells[index] = CellType.EMPTY;
    return CellType.EMPTY;
  }
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

async function goDirection(dirKey, pos, onStep) {
  if (onStep) await onStep(map);
  
  const dir = Dirs[dirKey];
  const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };

  const currentIndex = getIndex(pos);

  // If we've already tried going in this direction from this cell, skip
  if (hasVisitedDirection(currentIndex, dirKey)) {
    return;
  }

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
    // Prevent infinite loops by checking if direction visited from nextPos
    if (!hasVisitedDirection(nextIndex, dirKey)) {
      await goDirection(dirKey, nextPos, onStep);
    }
  } else {
    addBranchPoint(pos);
  }
}

