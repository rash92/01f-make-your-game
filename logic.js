const grid = document.getElementById("game-grid")
const gameStatus = document.getElementById("game-status")
const bomberManWrapper = document.createElement("div")
bomberManWrapper.classList.add("bomberManWrapper")
bomberManWrapper.classList.add("bomber-man")
bomberManWrapper.style.top = "64px"
bomberManWrapper.style.left = "64px"
grid.appendChild(bomberManWrapper)
const score = document.querySelector(".score")
const lives = document.querySelector(".lives")
const gridRow = 13
const gridCol = 15
const cellSize = 64
let speed = 50
const distance = 0.25
let bomberManCurrentPosition = {
	y: 64,
	x: 64,
}
let horizontalAnimation = 0
let verticalAnimation = 3
let enemyCount = 2
let randomDirection = [0, 1, 2, 3]
let bombPlaced = false
let currentScore = 0
let currentLives = 3
let gamePaused = false
let gameOver = false
let isMoving = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowLeft: false,
	ArrowRight: false,
}

// power ups
let currentPower
let numOfPowerUps = 2
let fireRange = 1
let numBombs = 1
let remoteControl = false
let vest = false
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
]

const powerUpLists = powerUpObj.map((v) => v.name)

const buildGrid = () => {
	for (let row = 0; row < gridRow; row++) {
		for (let col = 0; col < gridCol; col++) {
			const cell = document.createElement("div")
			cell.style.top = `${row * cellSize}px`
			cell.style.left = `${col * cellSize}px`
			cell.classList.add("cell")
			if (
				row === 0 ||
				col === 0 ||
				row === gridRow - 1 ||
				col === gridCol - 1 ||
				(row % 2 === 0 && col % 2 === 0)
			) {
				cell.classList.add("indestructible")
			} else if (
				(row >= 1 && row <= 2 && col >= 1 && col <= 2) ||
				Math.random() < 0.7
			) {
				cell.classList.add("walkable")
			} else {
				cell.classList.add("breakable")
				// assign power ups
				if (Math.random() < 0.1 && numOfPowerUps > 0) {
					let randomPowerUp =
						powerUpObj[Math.floor(Math.random() * powerUpObj.length)]
					if (randomPowerUp.count > 0) {
						cell.classList.add("powerUp")
						cell.classList.add(randomPowerUp.name)
						randomPowerUp.count--
						numOfPowerUps--
					}
				}
			}
			grid.append(cell)
		}
	}
}

const createCellsArr = () => {
	let oneDArr = [].slice.call(document.getElementsByClassName("cell"))
	let twoDArr = []
	for (let i = 0; i < gridCol; i++) {
		twoDArr.push(oneDArr.slice(i * gridCol, i * gridCol + gridCol))
	}
	return twoDArr
}
function setSprite(spriteX, spriteY) {
	const bomberMan = document.querySelector(".bomber-man")
	const spriteSize = 64
	bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
		spriteY * spriteSize
	}px`
}

buildGrid()
const cellsArr = createCellsArr()
setSprite(horizontalAnimation, 1)

let walkableCells = Array.from(document.querySelectorAll(".walkable"))
let powerUps = Array.from(document.querySelectorAll(".powerUp"))

const createEnemies = () => {
	while (enemyCount > 0) {
		let randomWalkableCell =
			walkableCells[Math.floor(Math.random() * walkableCells.length)]

		if (
			randomWalkableCell.style.top !== `${bomberManCurrentPosition.y}px` &&
			randomWalkableCell.style.left !== `${bomberManCurrentPosition.x}px`
		) {
			const enemyObj = {
				id: enemyCount,
				y: parseInt(randomWalkableCell.style.top.split("px")[0]),
				x: parseInt(randomWalkableCell.style.left.split("px")[0]),
				rely: 0,
				relx: 0,
				direction:
					randomDirection[Math.floor(Math.random() * randomDirection.length)],
			}
			const enemyWrapper = document.createElement("div")
			enemyWrapper.classList.add("enemy")
			enemyWrapper.style.top = randomWalkableCell.style.top
			enemyWrapper.style.left = randomWalkableCell.style.left
			enemyWrapper.dataset.enemy = JSON.stringify(enemyObj)
			grid.appendChild(enemyWrapper)
			enemyCount--
		} else {
			continue
		}
	}
	return Array.from(document.querySelectorAll(".enemy"))
}

let enemyArr = createEnemies()

function isWalkable(cell) {
	walkableCells = Array.from(document.querySelectorAll(".walkable"))
	return walkableCells.includes(cell)
}

function isPowerUp(cell) {
	return powerUps.includes(cell)
}

// const throttle = (callback, delay) => {
// 	let shouldWait = false
// 	let waitingArgs
// 	const timeoutFunc = () => {
// 		if (waitingArgs == null) {
// 			shouldWait = false
// 		} else {
// 			callback(...waitingArgs)
// 			waitingArgs = null
// 			setTimeout(timeoutFunc, delay)
// 		}
// 	}

// 	return (...args) => {
// 		if (shouldWait) {
// 			waitingArgs = args
// 			return
// 		}

// 		callback(...args)
// 		shouldWait = true

// 		setTimeout(timeoutFunc, delay)
// 	}
// }

const checkPowerUp = (cell) => {
	const classes = cell.classList
	const powerup = powerUpLists.filter((v) => v === classes[classes.length - 2])
	return powerup[0]
}

// const throttledCheckPowerUp = throttle(checkPowerUp, 1000)

// CHECKNOTDEAD NOW BROKEN
// const checkNotDead = (cell, entity) => {
//   const classNames = [
//     "explosion-middle",
//     "explosion-top",
//     "explosion-right",
//     "explosion-left",
//     "explosion-bottom",
//   ];

//   const hasExplosionClass = classNames.some((className) =>
//     cell.classList.contains(className)
//   );
//   if (entity === "bomberMan") {
//     if (cell.hasChildNodes() || hasExplosionClass) {
//       // killBomberMan()
//     }
//   } else {
//     if (hasExplosionClass) {
//       killEnemy(cell);
//     }
//   }
// };

const isbetweenCells = (position) => position % cellSize !== 0

const move = (direction) => {
	let newPosition = {
		x: bomberManCurrentPosition.x,
		y: bomberManCurrentPosition.y,
	}
	let newY = Math.floor(newPosition.y / cellSize)
	let newX = Math.floor(newPosition.x / cellSize)
	switch (direction) {
		case "ArrowUp":
			newPosition.y -= cellSize * distance
			newY = Math.floor(newPosition.y / cellSize)
			if (isbetweenCells(newPosition.x)) {
				newX = Math.round(newPosition.x / cellSize)
				newPosition.x = newX * cellSize
			}
			break
		case "ArrowDown":
			newPosition.y += cellSize * distance
			newY = Math.ceil(newPosition.y / cellSize)
			if (isbetweenCells(newPosition.x)) {
				newX = Math.round(newPosition.x / cellSize)
				newPosition.x = newX * cellSize
			}
			break
		case "ArrowRight":
			newPosition.x += cellSize * distance
			newX = Math.ceil(newPosition.x / cellSize)
			if (isbetweenCells(newPosition.y)) {
				newY = Math.round(newPosition.y / cellSize)
				newPosition.y = newY * cellSize
			}
			break
		case "ArrowLeft":
			newPosition.x -= cellSize * distance
			newX = Math.floor(newPosition.x / cellSize)
			if (isbetweenCells(newPosition.y)) {
				newY = Math.round(newPosition.y / cellSize)
				newPosition.y = newY * cellSize
			}
			break
		default:
			return
	}
	// Check if the new position is within the boundaries of the grid

	// console.log(newY, newX);

	const cell = cellsArr[newY][newX]

	if (isPowerUp(cell)) {
		const powerupValue = checkPowerUp(cell)

		if (
			!cell.classList.contains("breakable") &&
			cell.classList.contains("powerUp") &&
			cell.classList.contains(powerupValue)
		) {
			currentPower = powerupValue
			cell.classList.remove("powerUp")
			cell.classList.remove(powerupValue)
			cell.classList.add("walkable")

			// reset power ups
			if (powerupValue !== "bomb-up") {
				numBombs = 1
			}

			if (powerupValue !== "fire-up" || "full-fire") {
				fireRange = 1
			}

			if (powerupValue !== "skate") {
				speed = 50
			}

			if (powerupValue !== "soft-block-pass") {
				walkableCells = Array.from(document.querySelectorAll(".walkable"))
			}

			if (powerupValue !== "remote-control") {
				remoteControl = false
			}

			if (powerupValue !== "bomb-pass" || "vest") {
				vest = false
			}

			// apply powerup
			switch (powerupValue) {
				case "bomb-up": // increase number of bomb
					numBombs += 1
					break
				case "fire-up": // change explosion and range by 1 tile
					fireRange = 2
					break
				case "skate": // skate - Increase Bomberman's speed
					speed += 100
					break
				case "soft-block-pass": // soft block pass - Pass through Soft Blocks
					// include breakable cells as walkable
					walkableCells = Array.from(
						document.querySelectorAll(".walkable,.breakable")
					)
					break
				case "remote-control": // remote control - Manually detonate a Bombs with certain button
					remoteControl = true
					break
				case "bomb-pass": // bomb pass - Pass through Bombs
					vest = true
					break
				case "full-fire": // full fire - Increase your firepower to the max
					fireRange = 5
					break
				case "vest": // vest - Immune to both Bombs blast and enemies
					vest = true
					// enemy blast WIP
					break
			}
		}
	}

	if (
		isWalkable(cell) ||
		(isPowerUp(cell) && !cell.classList.contains("breakable"))
	) {
		// checkNotDead(cell, "bomberMan");
		if (
			newPosition.x === bomberManCurrentPosition.x &&
			newPosition.y === bomberManCurrentPosition.y
		) {
			return // Don't move if the bomberman is already at the new position
		}
		// Animate the movement
		bomberManWrapper.style.transition = `transform ${speed}ms`
		bomberManWrapper.style.transform = `translate3d(${
			newPosition.x - cellSize
		}px, ${newPosition.y - cellSize}px, 0)`
		bomberManCurrentPosition = newPosition
		// Update sprite based on the direction
		if (direction === "ArrowUp" || direction === "ArrowDown") {
			setSprite(verticalAnimation, direction === "ArrowUp" ? 1 : 0)
			verticalAnimation = ((verticalAnimation + 1) % 3) + 3
		} else {
			setSprite(horizontalAnimation, direction === "ArrowLeft" ? 0 : 1)
			horizontalAnimation = (horizontalAnimation + 1) % 3
		}
	}
}

const killBomberMan = () => {
	document.removeEventListener("keydown", onKeyDown)
	if (currentLives === 0) {
		gameOver = true
	}
	bomberManWrapper.classList.remove("bomber-man")
	bomberManWrapper.classList.add("death")
	bomberManWrapper.addEventListener("animationend", () => {
		bomberManWrapper.classList.remove("death")
		bomberManWrapper.classList.add("bomber-man")
		bomberManCurrentPosition = { y: 64, x: 64 }
		bomberManWrapper.style.transition = `transform 0ms`
		bomberManWrapper.style.transform = `translate(${
			bomberManCurrentPosition.x - cellSize
		}px, ${bomberManCurrentPosition.y - cellSize}px)`
		setSprite(horizontalAnimation, 1)
		document.addEventListener("keydown", onKeyDown)
		window.requestAnimationFrame(gameLoop)
	})
	currentLives -= 1
	lives.textContent = `Lives ${currentLives}`
}

const destroyBlocks = (cell) => {
	cell.classList.remove("breakable")
	cell.classList.add("breakable-block-destruction")
	cell.addEventListener("animationend", () => {
		cell.classList.remove("breakable-block-destruction")
		cell.classList.add("walkable")
		walkableCells = Array.from(document.querySelectorAll(".walkable"))
	})

	currentScore += 10
	score.textContent = `Score ${currentScore}`
}

const killEnemy = (cell) => {
	enemyArr.forEach((enemy) => {
		const enemyData = JSON.parse(enemy.dataset.enemy)
		// console.log("enemy y x", enemyData.y, enemyData.x)
		// console.log("cell y x", parseInt(cell.style.top), parseInt(cell.style.left));
		let originalEnemyPosition = {
			y: enemyData.y + enemyData.rely,
			x: enemyData.x + enemyData.relx,
		}
		if (
			parseInt(cell.style.top) === originalEnemyPosition.y &&
			parseInt(cell.style.left) === originalEnemyPosition.x
		) {
			enemy.classList.remove("enemy")
			enemy.classList.add("enemy-death")
			enemy.addEventListener("animationend", () => {
				enemy.remove("enemy-death")
				enemyArr.splice(enemyData.id - enemyArr.length, 1)
				currentScore += 100
				score.textContent = `Score ${currentScore}`
			})
		}
	})
	if (enemyArr.length === 0) {
		gameOver = true
	}
}

let remoteControlBombElements = []
const bomb = () => {
	const bomberManPosition = {
		y: Math.round(bomberManCurrentPosition.y / cellSize),
		x: Math.round(bomberManCurrentPosition.x / cellSize),
	}

	const bomberManCell = cellsArr[bomberManPosition.y][bomberManPosition.x]

	for (let i = 1; i <= numBombs; i++) {
		const bombElement = document.createElement("div")
		bombElement.classList.add("bomb")
		bombPlaced = true
		bomberManCell.appendChild(bombElement)
		bomberManCell.classList.remove("walkable")

		if (remoteControl) {
			remoteControlBombElements.push({
				bombElement,
				bomberManPosition,
				bomberManCell,
			})
		} else {
			bombElement.style.animation = "bomb-animation 1s steps(1) 2"
			detonate(bombElement, bomberManPosition, bomberManCell)
		}
	}
}

// // Add event listener for space bar key press
document.addEventListener("keydown", (e) => {
	if (e.key === " " && remoteControl && remoteControlBombElements.length > 0) {
		remoteControlBombElements.forEach((v) => {
			v.bombElement.style.animation = "bomb-animation 1s steps(1) 2"
			detonate(v.bombElement, v.bomberManPosition, v.bomberManCell)
		})
		remoteControlBombElements.length = 0
	}
})

function detonate(bombElement, bomberManPosition, bomberManCell) {
	let explosionRangeMinusY = bomberManPosition.y - fireRange
	if (explosionRangeMinusY < 0) {
		explosionRangeMinusY = 1
	}

	let explosionRangePlusY = bomberManPosition.y + fireRange
	if (explosionRangePlusY > 12) {
		explosionRangePlusY = 12
	}

	let explosionRangeMinusX = bomberManPosition.x - fireRange
	if (explosionRangeMinusX < 0) {
		explosionRangeMinusX = 1
	}

	let explosionRangePlusX = bomberManPosition.x + fireRange
	if (explosionRangePlusX > 13) {
		explosionRangePlusX = 13
	}

	let explosionTop = cellsArr[explosionRangeMinusY][bomberManPosition.x]
	let explosionBottom = cellsArr[explosionRangePlusY][bomberManPosition.x]
	let explosionRight = cellsArr[bomberManPosition.y][explosionRangePlusX]
	let explosionLeft = cellsArr[bomberManPosition.y][explosionRangeMinusX]

	bombElement.addEventListener("animationend", () => {
		bombElement.remove()

		// Explosion Middle
		setTimeout(() => {
			bomberManCell.classList.add("explosion-middle")
		}, 0)

		bomberManCell.addEventListener("animationend", () => {
			bomberManCell.classList.remove("explosion-middle")
			bomberManCell.classList.add("walkable")
			bombPlaced = false
		})

		// Explosion Top
		if (!explosionTop.classList.contains("indestructible")) {
			if (explosionTop.classList.contains("breakable")) {
				destroyBlocks(explosionTop)
			}
			killEnemy(explosionTop)
			if (
				Math.abs(
					parseInt(explosionTop.style.top) - bomberManCurrentPosition.y
				) < cellSize &&
				Math.abs(
					parseInt(explosionTop.style.left) - bomberManCurrentPosition.x
				) < cellSize &&
				!vest
			) {
				killBomberMan()
			}

			explosionTop.classList.add("explosion-top")
			explosionTop.addEventListener("animationend", () => {
				explosionTop.classList.remove("explosion-top")
			})
		}

		// Explosion Bottom
		if (!explosionBottom.classList.contains("indestructible")) {
			if (explosionBottom.classList.contains("breakable")) {
				destroyBlocks(explosionBottom)
			}
			killEnemy(explosionBottom)
			if (
				Math.abs(
					parseInt(explosionBottom.style.top) - bomberManCurrentPosition.y
				) < cellSize &&
				Math.abs(
					parseInt(explosionBottom.style.left) - bomberManCurrentPosition.x
				) < cellSize &&
				!vest
			) {
				killBomberMan()
			}
			explosionBottom.classList.add("explosion-bottom")
			explosionBottom.addEventListener("animationend", () => {
				explosionBottom.classList.remove("explosion-bottom")
			})
		}

		// Explosion Right
		if (!explosionRight.classList.contains("indestructible")) {
			if (explosionRight.classList.contains("breakable")) {
				destroyBlocks(explosionRight)
			}
			killEnemy(explosionRight)
			if (
				Math.abs(
					parseInt(explosionRight.style.top) - bomberManCurrentPosition.y
				) < cellSize &&
				Math.abs(
					parseInt(explosionRight.style.left) - bomberManCurrentPosition.x
				) < cellSize &&
				!vest
			) {
				killBomberMan()
			}
			explosionRight.classList.add("explosion-right")
			explosionRight.addEventListener("animationend", () => {
				explosionRight.classList.remove("explosion-right")
			})
		}

		// Explosion Left
		if (!explosionLeft.classList.contains("indestructible")) {
			if (explosionLeft.classList.contains("breakable")) {
				destroyBlocks(explosionLeft)
			}
			killEnemy(explosionLeft)
			if (
				Math.abs(
					parseInt(explosionLeft.style.top) - bomberManCurrentPosition.y
				) < cellSize &&
				Math.abs(
					parseInt(explosionLeft.style.left) - bomberManCurrentPosition.x
				) < cellSize &&
				!vest
			) {
				killBomberMan()
			}
			explosionLeft.classList.add("explosion-left")
			explosionLeft.addEventListener("animationend", () => {
				explosionLeft.classList.remove("explosion-left")
			})
		}
	})
}

// const moveEnemy = (enemy, cell, movement = []) => {
//   enemy.y = movement[0];
//   enemy.x = movement[1];
//   if (!cell.firstChild.classList.contains("bomberManWrapper")) {
//     cell.removeChild(cell.firstChild);
//     const enemyWrapper = document.createElement("div");
//     enemyWrapper.classList.add("enemyWrapper");
//     enemyWrapper.classList.add("enemy");
//     cellsArr[enemy.y][enemy.x].prepend(enemyWrapper);
//   }
// };

const enemyAI = () => {
	enemyArr.forEach((enemy) => {
		const enemyData = JSON.parse(enemy.dataset.enemy)
		let originalEnemyPosition = {
			y: enemyData.y,
			x: enemyData.x,
		}
		let relativeEnemyPosition = {
			x: enemyData.relx,
			y: enemyData.rely,
		}
		switch (enemyData.direction) {
			case 0: // up
				relativeEnemyPosition.y -= cellSize
				break
			case 2: // down
				relativeEnemyPosition.y += cellSize
				break
			case 1: // right
				relativeEnemyPosition.x += cellSize
				break
			case 3: // left
				relativeEnemyPosition.x -= cellSize
				break
		}
		const newEnemyY = Math.floor(
			(originalEnemyPosition.y + relativeEnemyPosition.y) / cellSize
		)
		const newEnemyX = Math.floor(
			(originalEnemyPosition.x + relativeEnemyPosition.x) / cellSize
		)

		if (isWalkable(cellsArr[newEnemyY][newEnemyX])) {
			// checkNotDead(cellsArr[newEnemyY][newEnemyX], "enemy");
			// Animate the movement
			enemy.style.transition = `transform 1000ms`
			enemy.style.transform = `translate(${relativeEnemyPosition.x}px, ${relativeEnemyPosition.y}px)`
			enemyData.rely = relativeEnemyPosition.y
			enemyData.relx = relativeEnemyPosition.x
		} else {
			enemyData.direction =
				randomDirection[(enemyData.direction + 1) % randomDirection.length]
		}
		enemy.dataset.enemy = JSON.stringify(enemyData)
	})
}

const onKeyDown = (e) => {
	switch (e.key) {
		case "ArrowUp":
		case "ArrowDown":
		case "ArrowRight":
		case "ArrowLeft":
			if (isMoving[e.key]) {
				return
			}
			isMoving = {
				ArrowUp: false,
				ArrowDown: false,
				ArrowLeft: false,
				ArrowRight: false,
			}
			isMoving[e.key] = true
			bomberManCurrentPosition.direction = e.key
			break
		case "x":
			if (!bombPlaced) bomb()
			break
		case "p":
			gamePaused = !gamePaused
			if (gamePaused) {
				gameStatus.style.display = "flex"
			} else {
				gameStatus.style.display = "none"
				window.requestAnimationFrame(gameLoop)
			}
			break
	}
}
const onKeyUp = (e) => {
	switch (e.key) {
		case "ArrowUp":
		case "ArrowDown":
		case "ArrowRight":
		case "ArrowLeft":
			isMoving[e.key] = false
			break
	}
}

document.addEventListener("keydown", onKeyDown)
document.addEventListener("keyup", onKeyUp)

const getBombermanDirection = () => {
	for (let key in isMoving) {
		if (isMoving[key]) {
			return key
		}
	}
	return undefined
}

const enemyInterval = 500
const moveInterval = 50
let lastEnemyMove = 0
let lastMove = 0
const gameLoop = (timestamp) => {
	if (gamePaused) {
		return
	}
	if (gameOver) {
		return
	}

	const enemyDeltaTime = timestamp - lastEnemyMove
	const moveDeltaTime = timestamp - lastMove

	if (enemyDeltaTime >= enemyInterval) {
		enemyAI(enemyDeltaTime)
		lastEnemyMove = timestamp
	}

	if (moveDeltaTime >= moveInterval) {
		if (getBombermanDirection()) {
			move(getBombermanDirection())
			lastMove = timestamp
		}
	}
	window.requestAnimationFrame(gameLoop)
}
window.requestAnimationFrame(gameLoop)
