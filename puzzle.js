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
let branchPoints;

export function createPuzzle(width, height) {
  map = initMap(width, height);
  const startPosition = placeStart();

  branchPoints = [startPosition];

  while (branchPoints.length > 0) {
    const current = branchPoints.shift();
    goDirection(Dirs.LEFT, current);
    goDirection(Dirs.UP, current);
    goDirection(Dirs.RIGHT, current);
    goDirection(Dirs.DOWN, current);
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
  // Prevent duplicates:
  if (!branchPoints.some(bp => bp.x === pos.x && bp.y === pos.y)) {
    branchPoints.push(pos);
  }
}

function goDirection(dir, pos) {
  const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };

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
      goDirection(dir, nextPos);
    } else {
      addBranchPoint(pos);
    }
  } else if (nextCell === CellType.EMPTY) {
    goDirection(dir, nextPos);
  } else {
    addBranchPoint(pos);
  }
}
