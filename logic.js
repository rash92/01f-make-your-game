const grid = document.getElementById("game-grid");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
let bomberManCurrenPosition = { y: 1, x: 1 };

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
const internalBoard = createInternalBoard();
// setSprite(bomberMan, 0, 1);

const isWalkable = (tilePosition) => {
  return (
    (tilePosition[0] % 2 === 1 || tilePosition[1] % 2 === 1) &&
    tilePosition[0] > 0 &&
    tilePosition[0] < gridCol - 1 &&
    tilePosition[1] > 0 &&
    tilePosition[1] < gridRow - 1
  );
};

function setSprite(spriteX, spriteY) {
  const bomberMan = document.querySelector(".bomber-man");
  const spriteSize = 64;
  bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
    spriteY * spriteSize
  }px`;
}

const move = (direction) => {
    const animationArr = [0, 1, 2]

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
      }
      break;
    case "ArrowRight":
        setSprite(animationArr[0], 1);
      if (
        isWalkable([bomberManCurrenPosition.x + 1, bomberManCurrenPosition.y])
      ) {
        setSprite(animationArr[1], 1);
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.remove("bomber-man");
        bomberManCurrenPosition.x = bomberManCurrenPosition.x + 1;
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].classList.add("bomber-man");
        setSprite(animationArr[2], 1);
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
      }
      // setSprite(bomberMan, 0, 0);
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
