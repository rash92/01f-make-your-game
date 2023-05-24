const grid = document.getElementById("game-grid");
const gameStatus = document.getElementById("game-status");
const startUp = document.getElementById("start-up");
const gameOver = document.getElementById("game-over");
let scoreBoardData;
const scoreTable = document.getElementById("scoreboard-table");
const scoreTableBody = scoreTable.getElementsByTagName("tbody")[0];
const pause = document.getElementById("pause");
const stageComplete = document.getElementById("stage-complete");
const timer = document.getElementById("timer");
const playerDied = document.getElementById("player-died");
const bomberManWrapper = document.createElement("div");
bomberManWrapper.classList.add("bomber-man");
bomberManWrapper.style.top = "64px";
bomberManWrapper.style.left = "64px";
const infoWrapper = document.getElementById("info");
const score = document.querySelector(".score");
const lives = document.querySelector(".lives");
const level = document.querySelector(".level");
const power = document.getElementById("powerUp");
const gridRow = 13;
const gridCol = 15;
const cellSize = 64;
let speed = 50;
let step = 0.25;
let bomberManCurrentPosition = {
  y: 64,
  x: 64,
  direction: "",
};
let horizontalAnimation = 0;
let verticalAnimation = 3;
const totalNoEnemy = 1;
let enemyCount = totalNoEnemy;
let randomDirection = [0, 1, 2, 3];
let bombPlaced = false;
const startingScore = 0;
let currentScore = startingScore;
const startinglives = 3;
let currentLives = startinglives;
const startingLevel = 1;
let currentLevel = startingLevel;
let gamePaused = false;
let isGameOver = false;
let isKilled = false;
let stageCleared = false;
let isMoving = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
let doorAdded = false;

// power ups
let currentPower;
const totalNoPowerups = 2;
let numOfPowerUps = totalNoPowerups;
let fireRange = 1;
const maxBomb = 2;
let numBombs = 1;
let remoteControl = false;
let passBombs = false;
let vest = false;
const powerUpObj = [
  {
    name: "bomb-up",
    count: 2,
  },
  {
    name: "fire-up",
    count: 1,
  },
  {
    name: "skate",
    count: 1,
  },
  {
    name: "soft-block-pass",
    count: 1,
  },
  {
    name: "remote-control",
    count: 1,
  },
  {
    name: "bomb-pass",
    count: 1,
  },
  {
    name: "full-fire",
    count: 1,
  },
  {
    name: "vest",
    count: 1,
  },
];
const powerUpLists = powerUpObj.map((v) => v.name);

const totalTime = 200;
let countdownTimer;
let remainingSeconds = totalTime;

const startCountdown = () => {
  if (!isKilled) {
    clearInterval(countdownTimer);
  }
  countdownTimer = setInterval(() => {
    remainingSeconds--;
    timer.textContent = `Time: ${remainingSeconds}`;
    if (remainingSeconds === 0) {
      clearInterval(countdownTimer);
      isGameOver = true;
      gameOver.style.display = "flex";
    }
  }, 1000);
};

const pauseCountdown = () => {
  clearInterval(countdownTimer);
};

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
        cell.classList.add("breakable");

        // assign power ups
        if (Math.random() < 0.1 && numOfPowerUps > 0) {
          let randomPowerUp =
            powerUpObj[Math.floor(Math.random() * powerUpObj.length)];
          if (randomPowerUp.count > 0) {
            cell.classList.add("powerUp");
            cell.classList.add(randomPowerUp.name);
            randomPowerUp.count--;
            numOfPowerUps--;
          }
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

const setSprite = (spriteX, spriteY) => {
  const bomberMan = document.querySelector(".bomber-man");
  const spriteSize = 64;
  bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
    spriteY * spriteSize
  }px`;
};

const createEnemies = () => {
  while (enemyCount > 0) {
    let randomWalkableCell =
      walkableCells[Math.floor(Math.random() * walkableCells.length)];

    let topPosition = parseInt(randomWalkableCell.style.top.split("px")[0]);
    let leftPosition = parseInt(randomWalkableCell.style.left.split("px")[0]);

    if (Math.abs(topPosition) > 192 && Math.abs(leftPosition) > 192) {
      const enemyObj = {
        id: enemyCount,
        y: parseInt(randomWalkableCell.style.top.split("px")[0]),
        x: parseInt(randomWalkableCell.style.left.split("px")[0]),
        rely: 0,
        relx: 0,
        direction:
          randomDirection[Math.floor(Math.random() * randomDirection.length)],
      };
      const enemyWrapper = document.createElement("div");
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
  return Array.from(document.querySelectorAll(".enemy"));
};

//generate level for first time
let cellsArr;
let walkableCells;
let breakableCells;
let powerUps;
let enemyArr;

const generateLevel = (numPowerups) => {
  if (currentLevel > 1) {
    remainingSeconds = totalTime;
  }

  // Reset Power Ups if died or reset but not if next level
  if (currentLevel === 1 || isKilled) {
    step = 0.25;
    currentPower = "";
    fireRange = 1;
    numBombs = 1;
    remoteControl = false;
    passBombs = false;
    vest = false;
  }
  if(currentPower === "bomb-up") {
    numBombs = maxBomb
  } else {
    numBombs = 1
  }

  isGameOver = false;
  isKilled = false;
  bombPlaced = false;

  level.textContent = `Level: ${currentLevel}`;
  lives.textContent = `Lives: ${currentLives}`;
  score.textContent = `Score: ${currentScore}`;
  power.innerHTML = `PowerUp:</br>${currentPower}`;
  enemyCount = totalNoEnemy * currentLevel;
  numOfPowerUps = numPowerups;

  powerUpObj.forEach((power) => {
    if (power !== "bomb-up") {
      power.count = 1;
    } else {
      power.count = 2;
    }
  });

  grid.textContent = "";
  buildGrid();
  cellsArr = createCellsArr();
  grid.appendChild(bomberManWrapper);


  walkableCells = Array.from(document.querySelectorAll(".walkable"));
  breakableCells = Array.from(document.querySelectorAll(".breakable"));
  if (currentPower === "soft-block-pass") {
    breakableCells.forEach((cell) => cell.classList.add("walkable"));
  }
  powerUps = Array.from(document.querySelectorAll(".powerUp"));
  enemyArr = createEnemies();
  playerDied.style.display = "none";
  gameOver.style.display = "none";
  bomberManCurrentPosition = { y: 64, x: 64 };
  bomberManWrapper.classList.add("bomber-man");
  bomberManWrapper.style.transition = `transform 0ms`;
  bomberManWrapper.style.transform = `translate(${
    bomberManCurrentPosition.x - cellSize
  }px, ${bomberManCurrentPosition.y - cellSize}px)`;
  setSprite(horizontalAnimation, 1);
  document.body.classList.remove("pause-animation");
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  window.requestAnimationFrame(gameLoop);
  infoWrapper.style.display = "flex";
  if (isKilled) {
    remainingSeconds = totalTime;
  }
  startCountdown();
};

function isWalkable(cell, entity) {
  if (cell === undefined) return false;
  if (entity === "enemy") {
    return (
      cell.classList.contains("walkable") &&
      !cell.classList.contains("breakable") &&
      !cell.classList.contains("hasBomb")
    );
  } else {
    return walkableCells.includes(cell);
  }
}

function isPowerUp(cell) {
  return powerUps.includes(cell);
}

const checkPowerUp = (cell) => {
  const classes = cell.classList;
  const powerup = powerUpLists.filter((v) => v === classes[classes.length - 2]);
  return powerup[0];
};

const bomberManEnemyCollision = () => {
  const bomberManBounding = bomberManWrapper.getBoundingClientRect();
  return enemyArr.some((enemy) => {
    const enemyBoundingBox = enemy.getBoundingClientRect();
    return (
      bomberManBounding.right > enemyBoundingBox.left + 10 &&
      bomberManBounding.left < enemyBoundingBox.right - 10 &&
      bomberManBounding.bottom > enemyBoundingBox.top + 10 &&
      bomberManBounding.top < enemyBoundingBox.bottom - 10
    );
  });
};

// CheckNotDead checks whether when an entity walks into a cell, it kills them.
const checkNotDead = (cell, entity) => {
  const classNames = [
    "explosion-middle",
    "explosion-top",
    "explosion-right",
    "explosion-left",
    "explosion-fireRange-bottom",
    "explosion-fireRange-top",
    "explosion-fireRange-bottom",
    "explosion-fireRange-right",
    "explosion-fireRange-left",
    "",
  ];

  const hasExplosionClass = classNames.some((className) =>
    cell.classList.contains(className)
  );

  if (entity === "bomberMan") {
    // Bomber walks into explosion or enem
    if (hasExplosionClass) {
      killBomberMan();
    }
  } else if (hasExplosionClass) {
    killEnemy(cell);
  }
};

const isbetweenCells = (position) => position % cellSize !== 0;

const move = (direction) => {
  let newPosition = {
    x: bomberManCurrentPosition.x,
    y: bomberManCurrentPosition.y,
  };
  let newY = Math.floor(newPosition.y / cellSize);
  let newX = Math.floor(newPosition.x / cellSize);
  switch (direction) {
    case "ArrowUp":
      newPosition.y -= cellSize * step;
      newY = Math.floor(newPosition.y / cellSize);
      if (isbetweenCells(newPosition.x)) {
        newX = Math.round(newPosition.x / cellSize);
        newPosition.x = newX * cellSize;
      }
      break;
    case "ArrowDown":
      newPosition.y += cellSize * step;
      newY = Math.ceil(newPosition.y / cellSize);
      if (isbetweenCells(newPosition.x)) {
        newX = Math.round(newPosition.x / cellSize);
        newPosition.x = newX * cellSize;
      }
      break;
    case "ArrowRight":
      newPosition.x += cellSize * step;
      newX = Math.ceil(newPosition.x / cellSize);
      if (isbetweenCells(newPosition.y)) {
        newY = Math.round(newPosition.y / cellSize);
        newPosition.y = newY * cellSize;
      }
      break;
    case "ArrowLeft":
      newPosition.x -= cellSize * step;
      newX = Math.floor(newPosition.x / cellSize);
      if (isbetweenCells(newPosition.y)) {
        newY = Math.round(newPosition.y / cellSize);
        newPosition.y = newY * cellSize;
      }
      break;
    default:
      return;
  }
  // Check if the new position is within the boundaries of the grid
  const cell = cellsArr[newY][newX];

  if (isPowerUp(cell)) {
    const powerupValue = checkPowerUp(cell);
    if (
      !cell.classList.contains("breakable") &&
      cell.classList.contains("powerUp") &&
      cell.classList.contains(powerupValue)
    ) {
      currentPower = powerupValue;
      cell.classList.remove("powerUp");
      cell.classList.remove(powerupValue);

      // reset power ups
      if (powerupValue !== "bomb-up") {
        numBombs = 1;
      }

      if (powerupValue !== "fire-up" || powerupValue !== "full-fire") {
        fireRange = 1;
      }

      if (powerupValue !== "skate") {
        step = 0.25;
      }

      if (powerupValue !== "soft-block-pass") {
        walkableCells = Array.from(document.querySelectorAll(".walkable"));
      }

      if (powerupValue !== "remote-control") {
        remoteControl = false;
      }

      if (powerupValue !== "bomb-pass") {
        passBombs = false;
      }

      if (powerupValue !== "vest") {
        vest = false;
      }

      power.innerHTML = `PowerUp:</br>${currentPower}`;

      // apply powerup
      switch (powerupValue) {
        case "bomb-up": // increase number of bomb
          numBombs = maxBomb
          break;
        case "fire-up": // change explosion and range by 1 tile
          fireRange = 2;
          break;
        case "skate": // skate - Increase Bomberman's speed
          step = 0.5;
          break;
        case "soft-block-pass": // soft block pass - Pass through Soft Blocks
          // include breakable cells as walkable
          breakableCells.forEach((cell) => cell.classList.add("walkable"));
          break;
        case "remote-control": // remote control - Manually detonate a Bombs with certain button
          remoteControl = true;
          break;
        case "bomb-pass": // bomb pass - Pass through Bombs
          passBombs = true;
          break;
        case "full-fire": // full fire - Increase your firepower to the max
          fireRange = 10;
          break;
        case "vest": // vest - Immune to both Bombs blast and enemies
          vest = true;
          // enemy blast WIP
          break;
      }
    }
  }

  if (
    isWalkable(cell) ||
    (isPowerUp(cell) && !cell.classList.contains("breakable"))
  ) {
    if (
      newPosition.x === bomberManCurrentPosition.x &&
      newPosition.y === bomberManCurrentPosition.y
    ) {
      return; // Don't move if the bomberman is already at the new position
    }
    // Animate the movement
    bomberManWrapper.style.transition = `transform ${speed}ms`;
    bomberManWrapper.style.transform = `translate3d(${
      newPosition.x - cellSize
    }px, ${newPosition.y - cellSize}px, 0)`;
    bomberManCurrentPosition = newPosition;
    bomberManCurrentPosition.direction = direction;
    // Update sprite based on the direction
    if (direction === "ArrowUp" || direction === "ArrowDown") {
      setSprite(verticalAnimation, direction === "ArrowUp" ? 1 : 0);
      verticalAnimation = ((verticalAnimation + 1) % 3) + 3;
    } else {
      setSprite(horizontalAnimation, direction === "ArrowLeft" ? 0 : 1);
      horizontalAnimation = (horizontalAnimation + 1) % 3;
    }
    checkNotDead(cell, "bomberMan");
  }

  if (cell.classList.contains("exit")) {
    currentLevel++;
    generateLevel(totalNoPowerups + currentLevel);
  }
};

const killBomberMan = () => {
  if (vest) {
    return;
  }
  pauseCountdown();
  document.removeEventListener("keydown", onKeyDown);
  isKilled = true;
  currentLives -= 1;
  if (currentLives > 0) {
    playerDied.style.display = "flex";
    lives.textContent = `Lives ${currentLives}`;
  }

  bomberManWrapper.classList.remove("bomber-man");
  bomberManWrapper.classList.add("death");
  bomberManWrapper.addEventListener("animationend", () => {
    bomberManWrapper.classList.remove("death");
    document.body.classList.add("pause-animation");
    setTimeout(() => {
      if (isGameOver) {
        return;
      }
      generateLevel(2);
    }, 3000);
  });
};

const destroyBlocks = (cell) => {
  cell.classList.remove("breakable");
  cell.classList.add("breakable-block-destruction");
  cell.addEventListener("animationend", () => {
    cell.classList.remove("breakable-block-destruction");
    cell.classList.add("walkable");
    walkableCells = Array.from(document.querySelectorAll(".walkable"));
  });

  currentScore += 10;
  score.textContent = `Score: ${currentScore}`;
};

const killEnemy = (cell) => {
  const enemyToKill = enemyArr.find((enemy) => {
    const enemyData = JSON.parse(enemy.dataset.enemy);
    let originalEnemyPosition = {
      y: enemyData.y + enemyData.rely,
      x: enemyData.x + enemyData.relx,
    };
    return (
      parseInt(cell.style.top) === originalEnemyPosition.y &&
      parseInt(cell.style.left) === originalEnemyPosition.x
    );
  });

  if (enemyToKill) {
    enemyToKill.classList.remove("enemy");
    if (document.querySelectorAll(".enemy").length === 0) {
      revealExit(cellsArr[1][1]);
    }
    enemyToKill.classList.add("enemy-death");
    enemyToKill.addEventListener("animationend", () => {
      enemyToKill.classList.remove("enemy-death");
      const enemyData = JSON.parse(enemyToKill.dataset.enemy);
      enemyToKill.remove();
      enemyArr = Array.from(document.querySelectorAll(".enemy"));
      currentScore += 100;
      score.textContent = `Score ${currentScore}`;
    });
  }
};

const revealExit = (cell) => {
  cell.classList.add("exit");
};

let remoteControlBombElements = {};
const bomb = () => {
  const bomberManPosition = {
    y: Math.round(bomberManCurrentPosition.y / cellSize),
    x: Math.round(bomberManCurrentPosition.x / cellSize),
  };
  const bomberManCell = cellsArr[bomberManPosition.y][bomberManPosition.x];
  if (bomberManCell.classList.contains("breakable")) {
    return;
  }
  const bombElement = document.createElement("div");
  bombElement.classList.add("bomb");
  bombElement.style.top = bomberManCell.style.top;
  bombElement.style.left = bomberManCell.style.left;
  grid.appendChild(bombElement);
  if (!passBombs) {
    bomberManCell.classList.remove("walkable");
  } else {
    bomberManCell.classList.add("hasBomb");
  }
  walkableCells = Array.from(document.querySelectorAll(".walkable"));
  if (remoteControl) {
    remoteControlBombElements = {
      bomb: bombElement,
      bmanposition: bomberManPosition,
      cell: bomberManCell,
    };
  } else {
    bombElement.style.animation = "bomb-animation 1s steps(1) 2";
    detonate(bombElement, bomberManPosition, bomberManCell);
  }
};

function explode(cell, style) {
  if (cell.classList.contains("breakable")) {
    destroyBlocks(cell);
  }
  killEnemy(cell);
  if (
    Math.abs(parseInt(cell.style.top) - bomberManCurrentPosition.y) <
      cellSize &&
    Math.abs(parseInt(cell.style.left) - bomberManCurrentPosition.x) < cellSize
  ) {
    killBomberMan();
  }
  cell.classList.add(style);
  cell.addEventListener("animationend", () => {
    cell.classList.remove(style);
  });
}

function detonate(bombElement, bomberManPosition, bomberManCell) {
  // Create explosion map
  let explosionMap = {
    top: [],
    bottom: [],
    right: [],
    left: [],
  };
  let continueExploring = {
    top: true,
    bottom: true,
    right: true,
    left: true,
  };
  // decide whether a cell should be classed with "explosion-direction" or "explosion-fireRange-direction"
  function checkCellAndPush(idx, posY, posX, direction) {
    if (!continueExploring[direction]) return; // If flag for this direction is false, return immediately
    let wallCheckerY, wallCheckerX;
    switch (direction) {
      case "top":
        wallCheckerY = posY - 1;
        wallCheckerX = posX;
        break;
      case "left":
        wallCheckerY = posY;
        wallCheckerX = posX - 1;
        break;
      case "bottom":
        wallCheckerY = posY + 1;
        wallCheckerX = posX;
        break;
      case "right":
        wallCheckerY = posY;
        wallCheckerX = posX + 1;
        break;
    }
    // check if the next cell is indestructible and if it is, immediately return and don't explore more.
    if (cellsArr[posY][posX].classList.contains("indestructible")) {
      continueExploring[direction] = false;
      return;
    }
    if (
      posY >= 0 &&
      posY < cellsArr.length &&
      posX >= 0 &&
      posX < cellsArr[0].length &&
      (cellsArr[posY][posX].classList.contains("walkable") ||
        cellsArr[posY][posX].classList.contains("breakable"))
    ) {
      if (
        idx === fireRange ||
        cellsArr[wallCheckerY][wallCheckerX].classList.contains(
          "indestructible"
        )
      ) {
        let explosionData = {
          cell: cellsArr[posY][posX],
          style: `explosion-${direction}`,
        };
        explosionMap[direction].push(explosionData);
      } else {
        let explosionData = {
          cell: cellsArr[posY][posX],
          style: `explosion-fireRange-${direction}`,
        };
        explosionMap[direction].push(explosionData);
      }
    }
  }
  // Loop through the fireRange and add data to explosion map
  for (let i = 1; i <= fireRange; i++) {
    checkCellAndPush(i, bomberManPosition.y - i, bomberManPosition.x, "top");
    checkCellAndPush(i, bomberManPosition.y + i, bomberManPosition.x, "bottom");
    checkCellAndPush(i, bomberManPosition.y, bomberManPosition.x - i, "left");
    checkCellAndPush(i, bomberManPosition.y, bomberManPosition.x + i, "right");
  }
  bombElement.addEventListener("animationend", () => {
    bombElement.remove();
    if (numBombs === 0) {
      if(currentPower === "bomb-up") {
        numBombs = maxBomb
      } else {
        numBombs = 1
      }
    }
    if (numBombs === 1 && currentPower === "bomb-up" ) {
        setTimeout(() => {
          numBombs = maxBomb
        }, 2000)
    }
    bomberManCell.classList.remove("hasBomb");
    // Explosion Middle
    bomberManCell.classList.add("explosion-middle");
    checkNotDead(bomberManCell, "bomberMan")
    bomberManCell.addEventListener("animationend", () => {
      bomberManCell.classList.remove("explosion-middle");
      bomberManCell.classList.add("walkable");
      
    });
    // Loop through the object and call explode
    Object.keys(explosionMap).forEach((direction) => {
      explosionMap[direction].forEach((cell) => {
        explode(cell.cell, cell.style);
      });
    });
  });
}

const enemyAI = () => {
  enemyArr.forEach((enemy) => {
    const enemyData = JSON.parse(enemy.dataset.enemy);
    let originalEnemyPosition = {
      y: enemyData.y,
      x: enemyData.x,
    };
    let relativeEnemyPosition = {
      x: enemyData.relx,
      y: enemyData.rely,
    };
    switch (enemyData.direction) {
      case 0: // up
        relativeEnemyPosition.y -= cellSize;
        break;
      case 2: // down
        relativeEnemyPosition.y += cellSize;
        break;
      case 1: // right
        relativeEnemyPosition.x += cellSize;
        break;
      case 3: // left
        relativeEnemyPosition.x -= cellSize;
        break;
    }
    const newEnemyY = Math.floor(
      (originalEnemyPosition.y + relativeEnemyPosition.y) / cellSize
    );
    const newEnemyX = Math.floor(
      (originalEnemyPosition.x + relativeEnemyPosition.x) / cellSize
    );

    const cell = cellsArr[newEnemyY][newEnemyX];

    if (isWalkable(cell, "enemy")) {
      enemy.style.transition = `transform 1000ms`;
      enemy.style.transform = `translate(${relativeEnemyPosition.x}px, ${relativeEnemyPosition.y}px)`;
      enemyData.rely = relativeEnemyPosition.y;
      enemyData.relx = relativeEnemyPosition.x;
    } else {
      enemyData.direction = getNewDirection(
        Math.floor((originalEnemyPosition.y + enemyData.rely) / cellSize),
        Math.floor((originalEnemyPosition.x + enemyData.relx) / cellSize),
        enemyData.direction
      );
      if (enemyData.direction === undefined) {
        enemyData.direction = 0;
      }
    }
    checkNotDead(cell, "enemy");
    enemy.dataset.enemy = JSON.stringify(enemyData);
  });
};

function getNewDirection(posY, posX, oldDirection) {
  let possibleCells = {
    top:
      posY - 1 >= 0
        ? {
            newCell: isWalkable(cellsArr[posY - 1][posX], "enemy"),
            newDirection: 0,
          }
        : null,
    bottom:
      posY + 1 < cellsArr.length
        ? {
            newCell: isWalkable(cellsArr[posY + 1][posX], "enemy"),
            newDirection: 2,
          }
        : null,
    right:
      posX + 1 < cellsArr[0].length
        ? {
            newCell: isWalkable(cellsArr[posY][posX + 1], "enemy"),
            newDirection: 1,
          }
        : null,
    left:
      posX - 1 >= 0
        ? {
            newCell: isWalkable(cellsArr[posY][posX - 1], "enemy"),
            newDirection: 3,
          }
        : null,
  };
  let newDirectionArray = [];
  for (let key in possibleCells) {
    if (
      possibleCells[key] &&
      possibleCells[key].newCell &&
      possibleCells[key].newDirection !== oldDirection
    ) {
      newDirectionArray.push(possibleCells[key].newDirection);
    }
  }
  return newDirectionArray[
    Math.floor(Math.random() * newDirectionArray.length)
  ];
}

const onKeyDown = (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowRight":
    case "ArrowLeft":
      if (!isGameOver) {
        if (isMoving[e.key]) {
          return;
        }
        isMoving = {
          ArrowUp: false,
          ArrowDown: false,
          ArrowLeft: false,
          ArrowRight: false,
        };
        isMoving[e.key] = true;
        bomberManCurrentPosition.direction = e.key;
      }
      break;
    case "x":
      console.log("numBombs:", numBombs);
      if (!isGameOver && numBombs >= 1 ) {
        bomb();
        numBombs--
      console.log("numBombs after placed:", numBombs)
      }
      break;
    case " ":
      if (!isGameOver) {
        if (
          remoteControl &&
          Object.keys(remoteControlBombElements).length !== 0
        ) {
          remoteControlBombElements.bomb.style.animation =
            "bomb-animation 1s steps(1) 2";
          detonate(
            remoteControlBombElements.bomb,
            remoteControlBombElements.bmanposition,
            remoteControlBombElements.cell
          );
          remoteControlBombElements = {};
        }
      }
      break;
    case "p":
      if (!isGameOver) {
        gamePaused = !gamePaused;
        pauseCountdown();
        if (gamePaused) {
          document.body.classList.add("pause-animation");
          pause.style.display = "flex";
        } else {
          document.body.classList.remove("pause-animation");
          startCountdown();
          pause.style.display = "none";
          window.requestAnimationFrame(gameLoop);
        }
      }
      break;
    case "r":
      pause.style.display = "none";
      gamePaused = false;
      currentScore = startingScore;
      currentLives = startinglives;
      currentLevel = startingLevel;
      remainingSeconds = totalTime;
      generateLevel(totalNoPowerups);
      break;
  }
};

const onKeyUp = (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
    case "ArrowRight":
    case "ArrowLeft":
      isMoving[e.key] = false;
      break;
  }
};

const getBombermanDirection = () => {
  for (let key in isMoving) {
    if (isMoving[key]) {
      return key;
    }
  }
  return undefined;
};

/* GAMELOOP */
const enemyInterval = 500;
const moveInterval = 50;
let lastEnemyMove = 0;
let lastMove = 0;
const gameLoop = (timestamp) => {
  walkableCells = Array.from(document.querySelectorAll(".walkable"));
  if (currentLives === 0) {
    lives.textContent = `Lives: ${currentLives}`;
    setTimeout(() => {
      gameOverHandler();
      return;
    }, 2000);
  }
  if (gamePaused || isGameOver || isKilled || stageCleared) {
    return;
  }
  if (bomberManEnemyCollision()) {
    killBomberMan();
  }

  const enemyDeltaTime = timestamp - lastEnemyMove;
  const moveDeltaTime = timestamp - lastMove;

  if (enemyDeltaTime >= enemyInterval) {
    enemyAI(enemyDeltaTime);
    lastEnemyMove = timestamp;
  }

  if (moveDeltaTime >= moveInterval) {
    if (getBombermanDirection()) {
      move(getBombermanDirection());
      lastMove = timestamp;
    }
  }
  window.requestAnimationFrame(gameLoop);
};

/* SCOREBOARD LOGIC */
let socket = new WebSocket("ws://localhost:8080/ws");
const form = document.getElementById("enter-name");
const arrowKeys = document.getElementById("scoreboard-wrapper");
let currentPage = 1;
let rowsPerPage = 5;

socket.onopen = function (e) {
  console.log("[open] Connection Established");
};

socket.onmessage = function (event) {
  scoreBoardData = JSON.parse(event.data);
  console.log("[message] Data received from server:", scoreBoardData);
  insertScoreTableData(scoreBoardData);
};

socket.onerror = function (error) {
  console.log(`[error] ${error.message}`);
};

arrowKeys.addEventListener("keydown", (e) => {
  const numRows = scoreTableBody.querySelectorAll("tr").length;
  const pagination = document.getElementById("pages");
  const numPages = Math.ceil(numRows / rowsPerPage);
  switch (e.key) {
    case "ArrowRight":
      if (currentPage < numPages) {
        currentPage++;
        pagination.textContent = `Page ${currentPage}/${numPages}`;
        displayRows();
      }
      break;
    case "ArrowLeft":
      if (currentPage > 1) {
        currentPage--;
        pagination.textContent = `Page ${currentPage}/${numPages}`;
        displayRows();
      }
      break;
  }
});

form.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    if (isGameOver) {
      console.log("Sending a new score to the server");
      let newScore = {
        player: this.elements.username.value,
        score: currentScore,
        time: remainingSeconds,
      };
      socket.send(JSON.stringify(newScore));
      form.style.display = "none";
      arrowKeys.focus();
      isGameOver = false;
      currentPage = 1;
    }
  }
});

function displayRows() {
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const rows = scoreTableBody.querySelectorAll("tr");
  rows.forEach((row, index) => {
    if (index >= startIndex && index < endIndex) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  });
}

function insertScoreTableData(data) {
  scoreTableBody.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    const row = scoreTableBody.insertRow();
    const rankCell = row.insertCell(0);
    rankCell.textContent = getOrdinal(i + 1);
    const nameCell = row.insertCell(1);
    nameCell.textContent = data[i].player;
    const scoreCell = row.insertCell(2);
    scoreCell.textContent = data[i].score;
    const timeCell = row.insertCell(3);
    timeCell.textContent = data[i].time;
  }
  displayRows();
}

function getOrdinal(n) {
  var s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* START/END GAME LOGIC */
function gameOverHandler() {
  pauseCountdown();
  isGameOver = true;
  gameOver.style.display = "flex";
  form.style.display = "flex";
  form.elements.username.focus();
  document.addEventListener("keydown", onKeyDown);
}

function start() {
  function keydownHandler(e) {
    if (e.key === "s") {
      setTimeout(() => {
        startUp.style.display = "none";
        document.removeEventListener("keydown", keydownHandler);
        generateLevel(totalNoPowerups);
      }, 500);
    }
  }
  document.addEventListener("keydown", keydownHandler);
}

start();