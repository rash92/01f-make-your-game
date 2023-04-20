const grid = document.getElementById("game-grid");
const bomberManWrapper = document.createElement("div");
bomberManWrapper.classList.add("bomberManWrapper");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
let bomberManCurrenPosition = { y: 1, x: 1 };
let horizontalAnimation = 0;
let verticalAnimation = 3;
let enemyCount = 3;
let bombPlaced = false;

const buildGrid = () => {
  for (let row = 0; row < gridRow; row++) {
    for (let col = 0; col < gridCol; col++) {
      const cell = document.createElement("div");
      cell.style.top = `${row * cellSize}px`;
      cell.style.left = `${col * cellSize}px`;
      cell.classList.add("cell");
      if (row === 1 && col === 1) {
        cell.classList.add("walkable");
        bomberManWrapper.classList.add("bomber-man");
        cell.appendChild(bomberManWrapper);
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
        Math.random() < 0.7
      ) {
        cell.classList.add("walkable");
      } else {
        if (Math.random() < 0.25 && enemyCount > 0) {
          cell.classList.add("walkable");
          const enemyWrapper = document.createElement("div");
          enemyWrapper.classList.add("enemyWrapper");
          enemyWrapper.classList.add("enemy");
          cell.appendChild(enemyWrapper);
          enemyCount--;
        } else {
          cell.classList.add("breakable");
        }
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
  return cellsArr[tilePosition[1]][tilePosition[0]].classList.contains(
    "walkable"
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
  switch (direction) {
    case "ArrowUp":
      if (
        isWalkable([bomberManCurrenPosition.x, bomberManCurrenPosition.y - 1])
      ) {
        bomberManWrapper.remove();
        bomberManCurrenPosition.y = bomberManCurrenPosition.y - 1;
        bomberManWrapper.classList.add("bomber-man");
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].appendChild(bomberManWrapper);
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
        bomberManWrapper.remove();
        bomberManCurrenPosition.y = bomberManCurrenPosition.y + 1;
        bomberManWrapper.classList.add("bomber-man");
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].appendChild(bomberManWrapper);
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
        bomberManWrapper.remove();
        bomberManCurrenPosition.x = bomberManCurrenPosition.x + 1;
        bomberManWrapper.classList.add("bomber-man");
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].appendChild(bomberManWrapper);
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
        bomberManWrapper.remove();
        bomberManCurrenPosition.x = bomberManCurrenPosition.x - 1;
        bomberManWrapper.classList.add("bomber-man");
        cellsArr[bomberManCurrenPosition.y][
          bomberManCurrenPosition.x
        ].appendChild(bomberManWrapper);
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

const bomb = () => {
  const bomberManCell =
    cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x];
  const explosionTop =
    cellsArr[bomberManCurrenPosition.y - 1][bomberManCurrenPosition.x];
  const explosionBottom =
    cellsArr[bomberManCurrenPosition.y + 1][bomberManCurrenPosition.x];
  const explosionRight =
    cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x + 1];
  const explosionLeft =
    cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x - 1];
  const bombElement = document.createElement("div");
  bombElement.classList.add("bomb");
  bombPlaced = true;
  bomberManCell.appendChild(bombElement);
  bomberManCell.classList.remove("walkable");
  bombElement.addEventListener("animationend", () => {
    bombElement.remove();

    // Explosion Middle
    setTimeout(() => {
      bomberManCell.classList.add("explosion-middle");
    }, 0);
    bomberManCell.addEventListener("animationend", () => {
      bomberManCell.classList.remove("explosion-middle");
      bomberManCell.classList.add("walkable");
      bombPlaced = false;
    });

    // Explosion Top
    if (!explosionTop.classList.contains("indestructible")) {
      if (explosionTop.classList.contains("breakable")) {
        explosionTop.classList.remove("breakable");
        explosionTop.classList.add("breakable-block-destruction");
        explosionTop.addEventListener("animationend", () => {
          explosionTop.classList.remove("breakable-block-destruction");
          explosionTop.classList.add("walkable");
        });
      }
      if (explosionTop.hasChildNodes()) {
        explosionTop.firstChild.classList.remove("enemy");
        explosionTop.firstChild.classList.add("enemy-death");
        explosionTop.firstChild.addEventListener("animationend", () => {
          explosionTop.firstChild.remove("enemy-death");
        });
      }
      if (explosionTop.contains(bomberManWrapper)) {
        bomberManWrapper.classList.remove("bomber-man");
        bomberManWrapper.classList.add("death");
        bomberManWrapper.addEventListener("animationend", () => {
          bomberManWrapper.classList.remove("death");
        });
      }
      explosionTop.classList.add("explosion-top");
      explosionTop.addEventListener("animationend", () => {
        explosionTop.classList.remove("explosion-top");
      });
    }

    // Explosion Bottom
    if (!explosionBottom.classList.contains("indestructible")) {
      if (explosionBottom.classList.contains("breakable")) {
        explosionBottom.classList.remove("breakable");
        explosionBottom.classList.add("breakable-block-destruction");
        explosionBottom.addEventListener("animationend", () => {
          explosionBottom.classList.remove("breakable-block-destruction");
          explosionBottom.classList.add("walkable");
        });
      }
      if (explosionBottom.hasChildNodes()) {
        explosionBottom.firstChild.classList.remove("enemy");
        explosionBottom.firstChild.classList.add("enemy-death");
        explosionBottom.firstChild.addEventListener("animationend", () => {
          explosionBottom.firstChild.remove("enemy-death");
        });
      }
      if (explosionBottom.contains(bomberManWrapper)) {
        bomberManWrapper.classList.remove("bomber-man");
        bomberManWrapper.classList.add("death");
        bomberManWrapper.addEventListener("animationend", () => {
          bomberManWrapper.classList.remove("death");
        });
      }
      explosionBottom.classList.add("explosion-bottom");
      explosionBottom.addEventListener("animationend", () => {
        explosionBottom.classList.remove("explosion-bottom");
      });
    }

    // Explosion Right
    if (!explosionRight.classList.contains("indestructible")) {
      if (explosionRight.classList.contains("breakable")) {
        explosionRight.classList.remove("breakable");
        explosionRight.classList.add("breakable-block-destruction");
        explosionRight.addEventListener("animationend", () => {
          explosionRight.classList.remove("breakable-block-destruction");
          explosionRight.classList.add("walkable");
        });
      }
      if (explosionRight.hasChildNodes()) {
        explosionRight.firstChild.classList.remove("enemy");
        explosionRight.firstChild.classList.add("enemy-death");
        explosionRight.firstChild.addEventListener("animationend", () => {
          explosionRight.firstChild.remove("enemy-death");
        });
      }
      if (explosionRight.contains(bomberManWrapper)) {
        bomberManWrapper.classList.remove("bomber-man");
        bomberManWrapper.classList.add("death");
        bomberManWrapper.addEventListener("animationend", () => {
          bomberManWrapper.classList.remove("death");
        });
      }
      explosionRight.classList.add("explosion-right");
      explosionRight.addEventListener("animationend", () => {
        explosionRight.classList.remove("explosion-right");
      });
    }

    // Explosion Left
    if (!explosionLeft.classList.contains("indestructible")) {
      if (explosionLeft.classList.contains("breakable")) {
        explosionLeft.classList.remove("breakable");
        explosionLeft.classList.add("breakable-block-destruction");
        explosionLeft.addEventListener("animationend", () => {
          explosionLeft.classList.remove("breakable-block-destruction");
          explosionLeft.classList.add("walkable");
        });
      }
      if (explosionLeft.hasChildNodes()) {
        explosionLeft.firstChild.classList.remove("enemy");
        explosionLeft.firstChild.classList.add("enemy-death");
        explosionLeft.firstChild.addEventListener("animationend", () => {
          explosionLeft.firstChild.remove("enemy-death");
        });
      }
      if (explosionLeft.contains(bomberManWrapper)) {
        bomberManWrapper.classList.remove("bomber-man");
        bomberManWrapper.classList.add("death");
        bomberManWrapper.addEventListener("animationend", () => {
          bomberManWrapper.classList.remove("death");
        });
      }
      explosionLeft.classList.add("explosion-left");
      explosionLeft.addEventListener("animationend", () => {
        explosionLeft.classList.remove("explosion-left");
      });
    }
  });
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
      if (!bombPlaced) bomb();
      break;
    case "p":
      break;
  }
});
