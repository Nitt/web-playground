export const CellType = {
  UNTOUCHED: 0,
  EMPTY: 1,
  START: 2,
  BLOCK: 3,
};

const likelihoods = {
  block: 0.2,
}

export function createPuzzle(width, height) {
  const map = initMap(width, height);
  placeStart(map);

  for (let i = 0; i < map.cells.length; i++) {

    if (map.cells[i] != CellType.UNTOUCHED) continue;

    if (Math.random() < likelihoods.block) {
      map.cells[i] = CellType.BLOCK;
      continue;
    }

    map.cells[i] = CellType.EMPTY;
    
  }
  
  return map;
}

function initMap(width, height) {
  const map = {
    width,
    height,
    cells: new Array(width * height).fill(CellType.UNTOUCHED)
  };
  return map;
}

function placeStart(map) {
  const startPosition = {
    x: Math.floor(Math.random()*map.width),
    y: Math.floor(Math.random()*map.height)
  };
  const startIndex = startPosition.y * map.width + startPosition.x;

  map.cells[startIndex] = CellType.START;
}
