export const CellType = {
  EMPTY: 0,
  BLOCK: 1,
  SPECIAL: 2,
};

const likelihoods = {
  block: 0.2,
  special: 0.05
}

export function createPuzzle(width, height) {
  const map = {};
  map.width = width;
  map.height = height;
  map.cells = new Array(width * height).fill(CellType.EMPTY);

  for (let i = 0; i < map.cells.length; i++) {

    if (Math.random() < likelihoods.block) {
      map.cells[i] = CellType.BLOCK;
      continue;
    }

    if (Math.random() < likelihoods.special) {
      map.cells[i] = CellType.SPECIAL;
      continue;
    }
  }
  
  return map;
}
