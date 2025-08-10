export const CellType = {
  UNTOUCHED: 0,
  EMPTY: 1,
  START: 2,
  BLOCK: 3,
};

const Dirs = [
  { name: 'LEFT',  x: -1, y:  0 },
  { name: 'UP',    x:  0, y:  1 },
  { name: 'RIGHT', x:  1, y:  0 },
  { name: 'DOWN',  x:  0, y: -1 },
];

const Likelihoods = {
  block: 0.2,
};

let map;
let branchPoints = [];
const visitedBranchPoints = new Set();

function posToKey(pos) {
  return `${pos.x},${pos.y}`;
}

export function createPuzzle(width, height) {
  map = initMap(width, height);
  const startPosition = placeStart(map);

  branchPoints = [startPosition];
  visitedBranchPoints.clear();
  visitedBranchPoints.add(posToKey(startPosition));

  while (branchPoints.length > 0) {
    const current = branchPoints.shift();

    for (const dir of Dirs) {
      goDirection(dir, current);
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

function placeStart(map) {
  const startPosition = {
    x: Math.floor(Math.random() * map.width),
    y: Math.floor(Math.random() * map.height),
  };
  const startIndex = getIndex(map, startPosition);
  map.cells[startIndex] = CellType.START;
  return startPosition;
}

function getIndex(map, pos) {
  return pos.y * map.width + pos.x;
}

function addBranchPoint(pos) {
  const key = posToKey(pos);
  if (!visitedBranchPoints.has(key)) {
    visitedBranchPoints.add(key);
    branchPoints.push(pos);
  }
}

function goDirection(dir, pos) {
  const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };

  // Check boundaries
  if (
    nextPos.x < 0 ||
    nextPos.x >= map.width ||
    nextPos.y < 0 ||
    nextPos.y >= map.height
  ) {
    addBranchPoint(pos);
    return;
  }

  const nextIndex = getIndex(map, nextPos);

  if (map.cells[nextIndex] === CellType.UNTOUCHED) {
    const placeBlock = Math.random() < Likelihoods.block;
    map.cells[nextIndex] = placeBlock ? CellType.BLOCK : CellType.EMPTY;

    if (!placeBlock) {
      goDirection(dir, nextPos);
    } else {
      addBranchPoint(pos);
    }
  } else {
    addBranchPoint(pos);
  }
}
