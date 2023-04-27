const grid = document.getElementById("game-grid");
const gameStatus = document.getElementById("game-status");
const bomberManWrapper = document.createElement("div");
bomberManWrapper.classList.add("bomberManWrapper");
bomberManWrapper.classList.add("bomber-man");
grid.appendChild(bomberManWrapper);
const score = document.querySelector(".score");
const lives = document.querySelector(".lives");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
const speed = 200;
let bomberManCurrenPosition = { y: 64, x: 64 };
let horizontalAnimation = 0;
let verticalAnimation = 3;
let enemyCount = 1;
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
      if (
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
        if (Math.random() < 0.25) {
          cell.classList.add("walkable");
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

const walkableCells = Array.from(document.querySelectorAll(".walkable"));

const createEnemies = () => {
  while (enemyCount > 0) {
    let randomWalkableCell =
      walkableCells[Math.floor(Math.random() * walkableCells.length)];
    if (
      randomWalkableCell.style.top !== `${bomberManCurrenPosition.y}px` &&
      randomWalkableCell.style.left !== `${bomberManCurrenPosition.x}px`
    ) {
      const enemyObj = {
        id: enemyCount,
        y: parseInt(randomWalkableCell.style.top.split("px")[0]),
        x: parseInt(randomWalkableCell.style.left.split("px")[0]),
        direction:
          randomDirection[Math.floor(Math.random() * randomDirection.length)],
      };
      const enemyWrapper = document.createElement("div");
      enemyWrapper.classList.add("enemyWrapper");
      enemyWrapper.classList.add("enemy");
      enemyWrapper.style.top = randomWalkableCell.style.top;
      enemyWrapper.style.left = randomWalkableCell.style.left;
      enemyWrapper.dataset.enemy = JSON.stringify(enemyObj);
      grid.appendChild(enemyWrapper);
      enemyCount--;
    } else {
      continue;
    }
  }
  return Array.from(document.querySelectorAll(".enemyWrapper"));
};

const enemyArr = createEnemies();

const isWalkable = (y, x) => {
  return walkableCells.includes(cellsArr[y][x])
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
      killEnemy(cell);
    }
  }
};

const move = (direction) => {
  let newPosition = {
    x: bomberManCurrenPosition.x,
    y: bomberManCurrenPosition.y,
  };
  switch (direction) {
    case "ArrowUp":
      newPosition.y -= cellSize;
      break;
    case "ArrowDown":
      newPosition.y += cellSize;
      break;
    case "ArrowRight":
      newPosition.x += cellSize;
      break;
    case "ArrowLeft":
      newPosition.x -= cellSize;
      break;
  }
  // Check if the new position is walkable
  const newY = Math.floor(newPosition.y / cellSize);
  const newX = Math.floor(newPosition.x / cellSize);
  if (isWalkable(newY, newX)) {
    checkNotDead(cellsArr[newY][newX], "bomberMan");
    // Animate the movement
    bomberManWrapper.style.transition = `transform ${speed}ms`;
    bomberManWrapper.style.transform = `translate(${
      newPosition.x - cellSize
    }px, ${newPosition.y - cellSize}px)`;
    bomberManCurrenPosition = newPosition;
    // Update sprite based on the direction
    if (direction === "ArrowUp" || direction === "ArrowDown") {
      setSprite(verticalAnimation, direction === "ArrowUp" ? 1 : 0);
      verticalAnimation = ((verticalAnimation + 1) % 3) + 3;
    } else {
      setSprite(horizontalAnimation, direction === "ArrowLeft" ? 0 : 1);
      horizontalAnimation = (horizontalAnimation + 1) % 3;
    }
  }
};

const killBomberMan = () => {
  document.removeEventListener("keydown", onKeyDown);
  if (currentLives === 0) {
    gameOver = true;
  }
  bomberManCurrenPosition = { y: 64, x: 64 };
  bomberManWrapper.classList.remove("bomber-man");
  bomberManWrapper.classList.add("death");
  bomberManWrapper.addEventListener("animationend", () => {
    bomberManWrapper.classList.remove("death");
    bomberManWrapper.classList.add("bomber-man");
    bomberManWrapper.style.transition = `transform 0ms`;
    bomberManWrapper.style.transform = `translate(${
      bomberManCurrenPosition.x - cellSize
    }px, ${bomberManCurrenPosition.y - cellSize}px)`;
    setSprite(horizontalAnimation, 1);
    document.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(gameLoop);
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
    cell.firstChild.classList.add("enemy-death");
    cell.firstChild.addEventListener("animationend", () => {
      cell.firstChild.remove("enemy-death");
    });
  }
};

const bomb = () => {
  const bomberManPosition = {
    y: bomberManCurrenPosition.y / cellSize,
    x: bomberManCurrenPosition.x / cellSize,
  };
  const bomberManCell = cellsArr[bomberManPosition.y][bomberManPosition.x];
  const explosionTop = cellsArr[bomberManPosition.y - 1][bomberManPosition.x];
  const explosionBottom =
    cellsArr[bomberManPosition.y + 1][bomberManPosition.x];
  const explosionRight = cellsArr[bomberManPosition.y][bomberManPosition.x + 1];
  const explosionLeft = cellsArr[bomberManPosition.y][bomberManPosition.x - 1];
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
      // console.log("explosiontop top", explosionTop.style.top)
      // console.log("explosiontop left", explosionTop.style.left)
      // console.log("bomberman wrapper top", bomberManCurrenPosition.y)
      // console.log("bomberman wrapper left", bomberManCurrenPosition.x)
      if (
        explosionTop.style.top === `${bomberManCurrenPosition.y}px` &&
        explosionTop.style.left === `${bomberManCurrenPosition.x}px`
      ) {
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
      if (
        explosionBottom.style.top === `${bomberManCurrenPosition.y}px` &&
        explosionBottom.style.left === `${bomberManCurrenPosition.x}px`
      ) {
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
      if (
        explosionRight.style.top === `${bomberManCurrenPosition.y}px` &&
        explosionRight.style.left === `${bomberManCurrenPosition.x}px`
      ) {
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
      if (
        explosionLeft.style.top === `${bomberManCurrenPosition.y}px` &&
        explosionLeft.style.left === `${bomberManCurrenPosition.x}px`
      ) {
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
  if (!cell.firstChild.classList.contains("bomberManWrapper")) {
    cell.removeChild(cell.firstChild);
    const enemyWrapper = document.createElement("div");
    enemyWrapper.classList.add("enemyWrapper");
    enemyWrapper.classList.add("enemy");
    cellsArr[enemy.y][enemy.x].prepend(enemyWrapper);
  }
};

const enemyAI = () => {
  enemyArr.forEach((enemy) => {
    const enemyData = JSON.parse(enemy.dataset.enemy);
    let newEnemyPosition = {
      x: enemyData.x,
      y: enemyData.y,
    };
    switch (enemyData.direction) {
      case 0: // up
        newEnemyPosition.y -= cellSize;
        break;
      case 2: // down
        newEnemyPosition.y += cellSize;
        break;
      case 1: // right
        newEnemyPosition.x += cellSize;
        break;
      case 3: // left
        newEnemyPosition.x -= cellSize;
        break;
    }
    const newEnemyY = Math.floor(newEnemyPosition.y / cellSize);
    const newEnemyX = Math.floor(newEnemyPosition.x / cellSize);
    if (isWalkable(newEnemyY, newEnemyX)) {
      // checkNotDead(cellsArr[newEnemyY][newEnemyX], "enemy");
      // Animate the movement
      enemy.style.transition = `transform 1000ms`;
      enemy.style.transform = `translate(${
        newEnemyPosition.x - cellSize
      }px, ${newEnemyPosition.y - cellSize}px)`;
      enemyData.y = newEnemyPosition.y
      enemyData.x = newEnemyPosition.x
      console.log(enemyData);
    } else {
      enemyData.direction = randomDirection[(enemyData.direction + 1) % randomDirection.length]
    }
    enemy.dataset.enemy = JSON.stringify(enemyData);
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
        window.requestAnimationFrame(gameLoop);
      }
      break;
  }
};

document.addEventListener("keydown", onKeyDown);

const enemyInterval = 500;
let lastEnemyMove = 0;

const gameLoop = (timestamp) => {
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
  window.requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);
