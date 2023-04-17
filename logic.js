const grid = document.getElementById("game-grid");
const gridRow = 13;
const gridCol = 15;
const cellSize = 50;
let bomberManCurrenPosition = [1, 1];

const buildGrid = () => {
  for (let row = 0; row < gridRow; row++) {
    for (let col = 0; col < gridCol; col++) {
      const cell = document.createElement("div");
      cell.style.top = `${row * cellSize}px`;
      cell.style.left = `${col * cellSize}px`;
      cell.classList.add("cell");
      if (row === 1 && col === 1) {
        cell.classList.add("bomber-man");
      }
      if (
        row === 0 ||
        col === 0 ||
        row === gridRow - 1 ||
        col === gridCol - 1 ||
        (row % 2 === 0 && col % 2 === 0)
      ) {
        cell.classList.add("indestructible");
      } else {
        cell.classList.add("walkable");
      }
      grid.append(cell);
    }
  }
};

const createCellsArr = () => {
  let oneDArr = [].slice.call(document.getElementsByClassName("cell"));
  let twoDArr = [];
  for (let i = 0; i < gridCol; i++) {
    twoDArr.push(oneDArr.slice(i * gridCol, i * gridCol + gridCol));
  }
  return twoDArr;
};


const createInternalBoard = () => {
  const board = [];
  for (let row = 0; row < gridRow; row++) {
    board[row] = [];
    for (let col = 0; col < gridCol; col++) {
      board[row][col] = 0;
    }
  }
  return board;
};

buildGrid();
const cellsArr = createCellsArr();
console.log(cellsArr);
const internalBoard = createInternalBoard();

const isWalkable = (tilePosition) => {
  return tilePosition[0] % 2 === 1 || tilePosition[1] % 2 === 1 || !(tilePosition[0] === 0 || tilePosition[1] === 0 || tilePosition[0] === gridCol - 1 || tilePosition[1] === gridRow - 1);
};

const move = (direction) => {
  switch (direction) {
    case "ArrowUp":
      if (
        isWalkable([bomberManCurrenPosition[0], bomberManCurrenPosition[1] - 1])
      ) {
        bomberManCurrenPosition[1] = bomberManCurrenPosition[1] - 1;
      }
      break;
    case "ArrowDown":
      if (
        isWalkable([bomberManCurrenPosition[0] + 1, bomberManCurrenPosition[1]])
      ) {
        cellsArr[bomberManCurrenPosition[0]][bomberManCurrenPosition[1]].classList.remove("bomber-man")
        bomberManCurrenPosition[0] = bomberManCurrenPosition[0] + 1;
        cellsArr[bomberManCurrenPosition[0]][bomberManCurrenPosition[1]].classList.add("bomber-man")
      }
      break;
    case "ArrowRight":
      if (
        isWalkable([bomberManCurrenPosition[0] + 1, bomberManCurrenPosition[1]])
      ) {
        bomberManCurrenPosition[0] = bomberManCurrenPosition[0] + 1;
      }
      break;
    case "ArrowLeft":
      if (
        isWalkable([bomberManCurrenPosition[0] - 1, bomberManCurrenPosition[1]])
      ) {
        bomberManCurrenPosition[0] = bomberManCurrenPosition[0] - 1;
      }
      break;
  }
};

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowRight":
    case "ArrowLeft":
      move(e.key);
      break;
    case "x":
      break;
    case "p":
      break;
  }
});
