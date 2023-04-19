const grid = document.getElementById("game-grid");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
let bomberManCurrenPosition = { y: 1, x: 1 };
let horizontalAnimation = 0;
let verticalAnimation = 3;
let enemyCount = 3;

const buildGrid = () => {
  for (let row = 0; row < gridRow; row++) {
    for (let col = 0; col < gridCol; col++) {
      const cell = document.createElement("div");
      cell.style.top = `${row * cellSize}px`;
      cell.style.left = `${col * cellSize}px`;
      cell.classList.add("cell");
      if (row === 1 && col === 1) {
        cell.classList.add("walkable")
        cell.classList.add("bomber-man");
      } else if (
        row === 0 ||
        col === 0 ||
        row === gridRow - 1 ||
        col === gridCol - 1 ||
        (row % 2 === 0 && col % 2 === 0)
      ) {
        cell.classList.add("indestructible");
      } else if (
        (row >= 1 && row <= 2 && col >= 1 && col <= 2) ||
        Math.random() < 0.75
      ) {
        cell.classList.add("walkable");
        if(
            (row >= 4 && row <= 13 && col >= 4 && col <= 15 ) && enemyCount > 0
          ) {
            cell.classList.add("enemy");
            enemyCount--
          }
      } else {
        cell.classList.add("breakable");
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
const internalBoard = createInternalBoard();
setSprite(horizontalAnimation, 1);

const isWalkable = (tilePosition) => {
    return cellsArr[tilePosition[1]][tilePosition[0]].classList.contains("walkable")
};

function setSprite(spriteX, spriteY) {
  const bomberMan = document.querySelector(".bomber-man");
  const spriteSize = 64;
  bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
    spriteY * spriteSize
  }px`;
}

const move = (direction) => {
  switch (direction) {
    case "ArrowUp":
      if (
        isWalkable([bomberManCurrenPosition.x, bomberManCurrenPosition.y - 1])
      ) {
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.remove("bomber-man");
        bomberManCurrenPosition.y = bomberManCurrenPosition.y - 1;
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.add("bomber-man");
        setSprite(verticalAnimation, 1);
      }
      switch (verticalAnimation) {
        case 3:
          verticalAnimation = 4;
          break;
        case 4:
          verticalAnimation = 5;
          break;
        case 5:
          verticalAnimation = 3;
          break;
      }
      break;
    case "ArrowDown":
      if (
        isWalkable([bomberManCurrenPosition.x, bomberManCurrenPosition.y + 1])
      ) {
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.remove("bomber-man");
        bomberManCurrenPosition.y = bomberManCurrenPosition.y + 1;
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.add("bomber-man");
        setSprite(verticalAnimation, 0);
      }
      switch (verticalAnimation) {
        case 3:
          verticalAnimation = 4;
          break;
        case 4:
          verticalAnimation = 5;
          break;
        case 5:
          verticalAnimation = 3;
          break;
      }
      break;
    case "ArrowRight":
      if (
        isWalkable([bomberManCurrenPosition.x + 1, bomberManCurrenPosition.y])
      ) {
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.remove("bomber-man");
        bomberManCurrenPosition.x = bomberManCurrenPosition.x + 1;
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.add("bomber-man");
        setSprite(horizontalAnimation, 1);
      }
      switch (horizontalAnimation) {
        case 0:
          horizontalAnimation = 1;
          break;
        case 1:
          horizontalAnimation = 2;
          break;
        case 2:
          horizontalAnimation = 0;
          break;
      }
      break;
    case "ArrowLeft":
      if (
        isWalkable([bomberManCurrenPosition.x - 1, bomberManCurrenPosition.y])
      ) {
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.remove("bomber-man");
        bomberManCurrenPosition.x = bomberManCurrenPosition.x - 1;
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.add("bomber-man");
        setSprite(horizontalAnimation, 0);
      }
      switch (horizontalAnimation) {
        case 0:
          horizontalAnimation = 1;
          break;
        case 1:
          horizontalAnimation = 2;
          break;
        case 2:
          horizontalAnimation = 0;
          break;
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
