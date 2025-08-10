function createPuzzle(width, height) {
  const map = {};
  map.width = width;
  map.height = height;

  map.cells = new Array(width * height).fill(0); // 0 = empty

  for (let i = 0; i < map.cells.length; i++) {
    map.cells[i] = Math.floor(Math.random() * 3); // 0, 1 and 2 randomly
  }
  
  return map;
}

export default {
  createPuzzle
};
