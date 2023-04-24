const grid = document.getElementById("game-grid");
const gameStatus = document.getElementById("game-status");
const bomberManWrapper = document.createElement("div");
bomberManWrapper.classList.add("bomberManWrapper");
const score = document.querySelector(".score");
const lives = document.querySelector(".lives");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
let bomberManCurrenPosition = { y: 1, x: 1 };
let horizontalAnimation = 0;
let verticalAnimation = 3;
let enemyCount = 3;
let enemyArr = [];
let randomDirection = [0, 1, 2, 3];
let bombPlaced = false;
let currentScore = 0;
let currentLives = 3;
let gamePaused = false;
let gameOver = false;

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
          const enemyObj = {
            id: enemyCount,
            y: row,
            x: col,
            direction:
              randomDirection[
                Math.floor(Math.random() * randomDirection.length)
              ],
          };
          enemyArr.push(enemyObj);
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

buildGrid();
const cellsArr = createCellsArr();
setSprite(horizontalAnimation, 1);

const isWalkable = (tilePosition, entity) => {
  const isCellWalkable =
    cellsArr[tilePosition[0]][tilePosition[1]].classList.contains("walkable");
  const isCellEnemy =
    cellsArr[tilePosition[0]][tilePosition[1]].firstChild &&
    cellsArr[tilePosition[0]][tilePosition[1]].firstChild.classList.contains(
      "enemy"
    );
  if (entity === "bomberMan") {
    return isCellWalkable;
  } else {
    return isCellWalkable && !isCellEnemy;
  }
};

function setSprite(spriteX, spriteY) {
  const bomberMan = document.querySelector(".bomber-man");
  const spriteSize = 64;
  bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
    spriteY * spriteSize
  }px`;
}

const checkNotDead = (cell, entity) => {
  const classNames = [
    "explosion-middle",
    "explosion-top",
    "explosion-right",
    "explosion-left",
    "explosion-bottom",
  ];

  const hasExplosionClass = classNames.some((className) =>
    cell.classList.contains(className)
  );
  if (entity === "bomberMan") {
    if (cell.hasChildNodes() || hasExplosionClass) {
      killBomberMan();
    }
  } else {
    if (hasExplosionClass) {
      killEnemy();
    }
  }
};

const move = (direction) => {
  switch (direction) {
    case "ArrowUp":
      if (
        isWalkable(
          [bomberManCurrenPosition.y - 1, bomberManCurrenPosition.x],
          "bomberMan"
        )
      ) {
        checkNotDead(
          cellsArr[bomberManCurrenPosition.y - 1][bomberManCurrenPosition.x],
          "bomberMan"
        );
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
        isWalkable(
          [bomberManCurrenPosition.y + 1, bomberManCurrenPosition.x],
          "bomberMan"
        )
      ) {
        checkNotDead(
          cellsArr[bomberManCurrenPosition.y + 1][bomberManCurrenPosition.x],
          "bomberMan"
        );
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
        isWalkable(
          [bomberManCurrenPosition.y, bomberManCurrenPosition.x + 1],
          "bomberMan"
        )
      ) {
        checkNotDead(
          cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x + 1],
          "bomberMan"
        );
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
        isWalkable(
          [bomberManCurrenPosition.y, bomberManCurrenPosition.x - 1],
          "bomberMan"
        )
      ) {
        checkNotDead(
          cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x - 1],
          "bomberMan"
        );
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

const killBomberMan = () => {
  document.removeEventListener("keydown", onKeyDown);
  if (currentLives === 0) {
    gameOver = true;
  }
  bomberManWrapper.classList.remove("bomber-man");
  bomberManWrapper.classList.add("death");
  bomberManWrapper.addEventListener("animationend", () => {
    bomberManWrapper.classList.remove("death");
    bomberManWrapper.classList.add("bomber-man");
    bomberManCurrenPosition.y = 1;
    bomberManCurrenPosition.x = 1;
    cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x].appendChild(
      bomberManWrapper
    );
    setSprite(bomberManCurrenPosition.x, bomberManCurrenPosition.y);
    document.addEventListener("keydown", onKeyDown);
  });
  currentLives -= 1;
  lives.textContent = `Lives ${currentLives}`;
};

const destroyBlocks = (cell) => {
  cell.classList.remove("breakable");
  cell.classList.add("breakable-block-destruction");
  cell.addEventListener("animationend", () => {
    cell.classList.remove("breakable-block-destruction");
    cell.classList.add("walkable");
  });
  currentScore += 10;
  score.textContent = `Score ${currentScore}`;
};

const killEnemy = (cell) => {
  enemyArr.forEach((enemy) => {
    if (cell === cellsArr[enemy.y][enemy.x]) {
      const index = enemyArr.indexOf(enemy);
      enemyArr.splice(index, 1);
      currentScore += 100;
      score.textContent = `Score ${currentScore}`;
    }
  });
  if (enemyArr.length === 0) {
    gameOver = true;
  }
  if (cell.firstChild) {
    cell.firstChild.classList.remove("enemy");
    console.log("I've been called");
    cell.firstChild.classList.add("enemy-death");
    cell.firstChild.addEventListener("animationend", () => {
      cell.firstChild.remove("enemy-death");
    });
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
        destroyBlocks(explosionTop);
      }
      if (
        explosionTop.firstChild &&
        explosionTop.firstChild.classList.contains("enemy")
      ) {
        killEnemy(explosionTop);
      }
      if (explosionTop.contains(bomberManWrapper)) {
        killBomberMan();
      }
      explosionTop.classList.add("explosion-top");
      explosionTop.addEventListener("animationend", () => {
        explosionTop.classList.remove("explosion-top");
      });
    }

    // Explosion Bottom
    if (!explosionBottom.classList.contains("indestructible")) {
      if (explosionBottom.classList.contains("breakable")) {
        destroyBlocks(explosionBottom);
      }
      if (
        explosionBottom.firstChild &&
        explosionBottom.firstChild.classList.contains("enemy")
      ) {
        killEnemy(explosionBottom);
      }
      if (explosionBottom.contains(bomberManWrapper)) {
        killBomberMan();
      }
      explosionBottom.classList.add("explosion-bottom");
      explosionBottom.addEventListener("animationend", () => {
        explosionBottom.classList.remove("explosion-bottom");
      });
    }

    // Explosion Right
    if (!explosionRight.classList.contains("indestructible")) {
      if (explosionRight.classList.contains("breakable")) {
        destroyBlocks(explosionRight);
      }
      if (
        explosionRight.firstChild &&
        explosionRight.firstChild.classList.contains("enemy")
      ) {
        killEnemy(explosionRight);
      }
      if (explosionRight.contains(bomberManWrapper)) {
        killBomberMan();
      }
      explosionRight.classList.add("explosion-right");
      explosionRight.addEventListener("animationend", () => {
        explosionRight.classList.remove("explosion-right");
      });
    }

    // Explosion Left
    if (!explosionLeft.classList.contains("indestructible")) {
      if (explosionLeft.classList.contains("breakable")) {
        destroyBlocks(explosionLeft);
      }
      if (
        explosionLeft.firstChild &&
        explosionLeft.firstChild.classList.contains("enemy")
      ) {
        killEnemy(explosionLeft);
      }
      if (explosionLeft.contains(bomberManWrapper)) {
        killBomberMan();
      }
      explosionLeft.classList.add("explosion-left");
      explosionLeft.addEventListener("animationend", () => {
        explosionLeft.classList.remove("explosion-left");
      });
    }
  });
};

const moveEnemy = (enemy, cell, movement = []) => {
  enemy.y = movement[0];
  enemy.x = movement[1];
  cell.removeChild(cell.firstChild);
  const enemyWrapper = document.createElement("div");
  enemyWrapper.classList.add("enemyWrapper");
  enemyWrapper.classList.add("enemy");
  cellsArr[movement[0]][movement[1]].appendChild(enemyWrapper);
};

const enemyAI = () => {
  enemyArr.forEach((enemy) => {
    switch (enemy.direction) {
      case 0: // up
        if (isWalkable([enemy.y - 1, enemy.x], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y - 1, enemy.x]);
          if (cellsArr[enemy.y - 1][enemy.x].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y - 1][enemy.x], "enemy");
        } else {
          enemy.direction = 1;
        }
        break;
      case 1: // right
        if (isWalkable([enemy.y, enemy.x + 1], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y, enemy.x + 1]);
          if (cellsArr[enemy.y][enemy.x + 1].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y][enemy.x + 1], "enemy");
        } else {
          enemy.direction = 2;
        }
        break;
      case 2: // down
        if (isWalkable([enemy.y + 1, enemy.x], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y + 1, enemy.x]);
          if (cellsArr[enemy.y + 1][enemy.x].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y + 1][enemy.x], "enemy");
        } else {
          enemy.direction = 3;
        }
        break;
      case 3: // left
        if (isWalkable([enemy.y, enemy.x - 1], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y, enemy.x - 1]);
          if (cellsArr[enemy.y][enemy.x - 1].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y][enemy.x - 1], "enemy");
        } else {
          enemy.direction = 0;
        }
        break;
    }
  });
};

const onKeyDown = (e) => {
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
      gamePaused = !gamePaused;
      if (gamePaused) {
        gameStatus.style.display = "flex";
      } else {
        gameStatus.style.display = "none";
        requestAnimationFrame(gameLoop);
      }
      break;
  }
};

document.addEventListener("keydown", onKeyDown);

const enemyInterval = 500;
let lastEnemyMove = 0;

const gameLoop = (timestamp) => {
  console.log(gamePaused);
  if (gamePaused) {
    return;
  }
  if (gameOver) {
    return;
  }
  const deltaTime = timestamp - lastEnemyMove;
  if (deltaTime >= enemyInterval) {
    enemyAI(deltaTime);
    lastEnemyMove = timestamp;
  }
  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);
