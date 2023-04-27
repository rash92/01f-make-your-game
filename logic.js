const grid = document.getElementById("game-grid");
const gameStatus = document.getElementById("game-status");
const bomberManWrapper = document.createElement("div");
bomberManWrapper.classList.add("bomberManWrapper");
bomberManWrapper.classList.add("bomber-man")
grid.appendChild(bomberManWrapper)
const score = document.querySelector(".score");
const lives = document.querySelector(".lives");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
const speed = 200;
let bomberManCurrenPosition = { y: 64, x: 64 };
let horizontalAnimation = 0;
let verticalAnimation = 3;
let enemyCount = 8;
let enemyArr = [];
let randomDirection = [0, 1, 2, 3];
let bombPlaced = false;
let currentScore = 0;
let currentLives = 3;
let gamePaused = false;
let gameOver = false;

//enemies with various parameters for how the AI works. waitTime determines speed and is how long it waits before it moves.
//view radius determines how far it looks to decide if it wants to chase or run, xrayVision determines if it can see through walls to decide this
//chaseChance is chance of chasing player, runChance is chance of running from bomb, randomChance is chance of choosing a random direction, continueChance is chance of continuing in same direction, stillChance is chance of not moving.
const enemyA = {
  name: 'enemyA',
  waitTime: 1200,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyB = {
  name: 'enemyB',
  waitTime: 1000,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyC = {
  name: 'enemyC',
  waitTime: 800,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyD = {
  name: 'enemyD',
  waitTime: 600,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyE = {
  name: 'enemyE',
  waitTime: 400,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyF = {
  name: 'enemyF',
  waitTime: 300,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyG = {
  name: 'enemyG',
  waitTime: 200,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}
const enemyH = {
  name: 'enemyH',
  waitTime: 100,
  ghost: false,
  hitPoints: 1,
  viewRadius: 0,
  xrayVision: false,
  chaseChance: 0,
  runChance: 0,
  randomChance: 100,
  continueChance: 0,
  stillChance: 0,
  score: 100
}

const allEnemyTypes = [enemyA, enemyB, enemyC, enemyD, enemyF, enemyG, enemyH]

const addEnemy = (enemyType, row, col) => {
  const enemyObj = {
    id: enemyCount,
    y: row,
    x: col,
    lastEnemyMove: 0,
    direction:
      randomDirection[
      Math.floor(Math.random() * randomDirection.length)
      ],
    type: enemyType,
  };
  enemyArr.push(enemyObj);
  const enemyWrapper = document.createElement("div");
  enemyWrapper.classList.add("enemyWrapper");
  enemyWrapper.classList.add("enemy");
  enemyWrapper.classList.add(enemyObj.type.name);
  return enemyWrapper
}

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
        if (Math.random() < 0.25 && enemyCount > 0) {
          cell.classList.add("walkable");
          const enemyTypeToAdd = Math.floor(Math.random()*allEnemyTypes.length)
          cell.appendChild(addEnemy(allEnemyTypes[enemyTypeToAdd], row, col));
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
  bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${spriteY * spriteSize
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
  if (isWalkable([newY, newX], "bomberMan")) {
    checkNotDead(cellsArr[newY][newX], "bomberMan");
    // Animate the movement
    bomberManWrapper.style.transition = `transform ${speed}ms`;
    bomberManWrapper.style.transform = `translate(${newPosition.x - cellSize}px, ${newPosition.y - cellSize}px)`;
    bomberManCurrenPosition = newPosition;
    // Update sprite based on the direction
    if (direction === "ArrowUp" || direction === "ArrowDown") {
      setSprite(verticalAnimation, direction === "ArrowUp" ? 1 : 0);
      verticalAnimation = (verticalAnimation + 1) % 3 + 3;
    } else {
      setSprite(horizontalAnimation, direction === "ArrowLeft" ? 0 : 1);
      horizontalAnimation = (horizontalAnimation + 1) % 3;
    }
  }
};
        
// const move = (direction) => {
//   switch (direction) {
//     case "ArrowUp":
//       if (
//         isWalkable(
//           [bomberManCurrenPosition.y - 1, bomberManCurrenPosition.x],
//           "bomberMan"
//         )
//       ) {
//         checkNotDead(
//           cellsArr[bomberManCurrenPosition.y - 1][bomberManCurrenPosition.x],
//           "bomberMan"
//         );
//         bomberManWrapper.remove();
//         bomberManCurrenPosition.y = bomberManCurrenPosition.y - 1;
//         bomberManWrapper.classList.add("bomber-man");
//         cellsArr[bomberManCurrenPosition.y][
//           bomberManCurrenPosition.x
//         ].appendChild(bomberManWrapper);
//         setSprite(verticalAnimation, 1);
//       }
//       switch (verticalAnimation) {
//         case 3:
//           verticalAnimation = 4;
//           break;
//         case 4:
//           verticalAnimation = 5;
//           break;
//         case 5:
//           verticalAnimation = 3;
//           break;
//       }
//       break;
//     case "ArrowDown":
//       if (
//         isWalkable(
//           [bomberManCurrenPosition.y + 1, bomberManCurrenPosition.x],
//           "bomberMan"
//         )
//       ) {
//         checkNotDead(
//           cellsArr[bomberManCurrenPosition.y + 1][bomberManCurrenPosition.x],
//           "bomberMan"
//         );
//         bomberManWrapper.remove();
//         bomberManCurrenPosition.y = bomberManCurrenPosition.y + 1;
//         bomberManWrapper.classList.add("bomber-man");
//         cellsArr[bomberManCurrenPosition.y][
//           bomberManCurrenPosition.x
//         ].appendChild(bomberManWrapper);
//         setSprite(verticalAnimation, 0);
//       }
//       switch (verticalAnimation) {
//         case 3:
//           verticalAnimation = 4;
//           break;
//         case 4:
//           verticalAnimation = 5;
//           break;
//         case 5:
//           verticalAnimation = 3;
//           break;
//       }
//       break;
//     case "ArrowRight":
//       if (
//         isWalkable(
//           [bomberManCurrenPosition.y, bomberManCurrenPosition.x + 1],
//           "bomberMan"
//         )
//       ) {
//         checkNotDead(
//           cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x + 1],
//           "bomberMan"
//         );
//         bomberManWrapper.remove();
//         bomberManCurrenPosition.x = bomberManCurrenPosition.x + 1;
//         bomberManWrapper.classList.add("bomber-man");
//         cellsArr[bomberManCurrenPosition.y][
//           bomberManCurrenPosition.x
//         ].appendChild(bomberManWrapper);
//         setSprite(horizontalAnimation, 1);
//       }
//       switch (horizontalAnimation) {
//         case 0:
//           horizontalAnimation = 1;
//           break;
//         case 1:
//           horizontalAnimation = 2;
//           break;
//         case 2:
//           horizontalAnimation = 0;
//           break;
//       }
//       break;
//     case "ArrowLeft":
//       if (
//         isWalkable(
//           [bomberManCurrenPosition.y, bomberManCurrenPosition.x - 1],
//           "bomberMan"
//         )
//       ) {
//         checkNotDead(
//           cellsArr[bomberManCurrenPosition.y][bomberManCurrenPosition.x - 1],
//           "bomberMan"
//         );
//         bomberManWrapper.remove();
//         bomberManCurrenPosition.x = bomberManCurrenPosition.x - 1;
//         bomberManWrapper.classList.add("bomber-man");
//         cellsArr[bomberManCurrenPosition.y][
//           bomberManCurrenPosition.x
//         ].appendChild(bomberManWrapper);
//         setSprite(horizontalAnimation, 0);
//       }
//       switch (horizontalAnimation) {
//         case 0:
//           horizontalAnimation = 1;
//           break;
//         case 1:
//           horizontalAnimation = 2;
//           break;
//         case 2:
//           horizontalAnimation = 0;
//           break;
//       }
//       break;
//   }
// };

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
    bomberManWrapper.style.transform = `translate(${bomberManCurrenPosition.x - cellSize}px, ${bomberManCurrenPosition.y -cellSize}px)`;
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
  }
  const bomberManCell =
    cellsArr[bomberManPosition.y][bomberManPosition.x];
  const explosionTop =
    cellsArr[bomberManPosition.y - 1][bomberManPosition.x];
  const explosionBottom =
    cellsArr[bomberManPosition.y + 1][bomberManPosition.x];
  const explosionRight =
    cellsArr[bomberManPosition.y][bomberManPosition.x + 1];
  const explosionLeft =
    cellsArr[bomberManPosition.y][bomberManPosition.x - 1];
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
      console.log("explosiontop top", explosionTop.style.top)
      console.log("explosiontop left", explosionTop.style.left)
      console.log("bomberman wrapper top", bomberManCurrenPosition.y)
      console.log("bomberman wrapper left", bomberManCurrenPosition.x)
      if (explosionTop.style.top === `${bomberManCurrenPosition.y}px` && explosionTop.style.left === `${bomberManCurrenPosition.x}px`) {
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
      if (explosionBottom.style.top === `${bomberManCurrenPosition.y}px` && explosionBottom.style.left === `${bomberManCurrenPosition.x}px`) {
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
      if (explosionRight.style.top === `${bomberManCurrenPosition.y}px` && explosionRight.style.left === `${bomberManCurrenPosition.x}px`) {
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
      if (explosionLeft.style.top === `${bomberManCurrenPosition.y}px` && explosionLeft.style.left === `${bomberManCurrenPosition.x}px`) {
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
    enemyWrapper.classList.add(enemy.type.name);
    cellsArr[enemy.y][enemy.x].prepend(enemyWrapper);
  }
};

const enemyAI = (timestamp) => {
  enemyArr.forEach((enemy) => {
    if (enemy.type.waitTime > timestamp - enemy.lastEnemyMove) {
      return
    }
    enemy.lastEnemyMove = timestamp
    switch (enemy.direction) {
      case 0: // up
        if (isWalkable([enemy.y - 1, enemy.x], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y - 1, enemy.x]);
          if (cellsArr[enemy.y][enemy.x].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y][enemy.x], "enemy");
        } else {
          enemy.direction = 1;
        }
        break;
      case 1: // right
        if (isWalkable([enemy.y, enemy.x + 1], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y, enemy.x + 1]);
          if (cellsArr[enemy.y][enemy.x].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y][enemy.x], "enemy");
        } else {
          enemy.direction = 2;
        }
        break;
      case 2: // down
        if (isWalkable([enemy.y + 1, enemy.x], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y + 1, enemy.x]);
          if (cellsArr[enemy.y][enemy.x].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y][enemy.x], "enemy");
        } else {
          enemy.direction = 3;
        }
        break;
      case 3: // left
        if (isWalkable([enemy.y, enemy.x - 1], "enemy")) {
          moveEnemy(enemy, cellsArr[enemy.y][enemy.x], [enemy.y, enemy.x - 1]);
          if (cellsArr[enemy.y][enemy.x].contains(bomberManWrapper)) {
            killBomberMan();
          }
          checkNotDead(cellsArr[enemy.y][enemy.x], "enemy");
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
        window.requestAnimationFrame(gameLoop);
      }
      break;
  }
};

document.addEventListener("keydown", onKeyDown);

const enemyInterval = 500;


// let lastEnemyMove = 0;

const gameLoop = (timestamp) => {
  if (gamePaused) {
    return;
  }
  if (gameOver) {
    return;
  }
  enemyAI(timestamp);
  requestAnimationFrame(gameLoop);
};

window.requestAnimationFrame(gameLoop);
