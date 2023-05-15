const grid = document.getElementById("game-grid")
const gameStatus = document.getElementById("game-status")
const gameOver = document.getElementById("game-over")
const stageComplete = document.getElementById("stage-complete")
const timer = document.getElementById("timer")
const playerDied = document.getElementById("player-died")
const powerUp = document.getElementById("powerUp")
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
let step = 0.25
let bomberManCurrentPosition = {
	y: 64,
	x: 64,
}
let horizontalAnimation = 0
let verticalAnimation = 3
const totalNoEnemy = 1
let enemyCount = totalNoEnemy
let randomDirection = [0, 1, 2, 3]
let bombPlaced = false
let currentScore = 0
let currentLives = 100
let gamePaused = false
let isGameOver = false
let isKilled = false
let stageCleared = false
let isMoving = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowLeft: false,
	ArrowRight: false,
}
let doorAdded = false

// power ups
let currentPower = ""
let numOfPowerUps = 2
let fireRange = 1
let numBombs = 1
let remoteControl = false
let passBombs = false
let vest = false
let powerUpObj = [
	// {
	// 	name: "bomb-up",
	// 	count: 2,
	// },
	// {
	// 	name: "fire-up",
	// 	count: 1,
	// },
	// {
	// 	name: "skate",
	// 	count: 1,
	// },
	// {
	// 	name: "soft-block-pass",
	// 	count: 1,
	// },
	// {
	// 	name: "remote-control",
	// 	count: 1,
	// },
	// {
	// 	name: "bomb-pass",
	// 	count: 1,
	// },
	// {
	// 	name: "full-fire",
	// 	count: 1,
	// },
	{
		name: "vest",
		count: 1,
	},
]
const powerUpLists = powerUpObj.map((v) => v.name)

const totalTime = 200
let countdownTimer
let remainingSeconds = totalTime

const startCountdown = () => {
	countdownTimer = setInterval(() => {
		remainingSeconds--
		timer.textContent = `Time: ${remainingSeconds}`
		if (remainingSeconds === 0) {
			clearInterval(countdownTimer)
			isGameOver = true
			gameOver.style.display = "flex"
		}
	}, 1000)
}

const pauseCountdown = () => {
	clearInterval(countdownTimer)
}

startCountdown()

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

				if (Math.random() < 0.1 && !doorAdded) {
					cell.classList.add("door")
					doorAdded = true
				}

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

const setSprite = (spriteX, spriteY) => {
	const bomberMan = document.querySelector(".bomber-man")
	const spriteSize = 64
	bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
		spriteY * spriteSize
	}px`
}

buildGrid()
let cellsArr = createCellsArr()
setSprite(horizontalAnimation, 1)

let walkableCells = Array.from(document.querySelectorAll(".walkable"))
let breakableCells = Array.from(document.querySelectorAll(".breakable"))
let powerUps = Array.from(document.querySelectorAll(".powerUp"))
let door = Array.from(document.querySelectorAll(".door"))

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

function isWalkable(cell, entity) {
	if (entity === "enemy") {
		return (
			cell.classList.contains("walkable") &&
			!cell.classList.contains("breakable")
		)
	} else {
		return cell.classList.contains("walkable")
	}
}

function isPowerUp(cell) {
	return powerUps.includes(cell)
}

function isDoor(cell) {
	return door.includes(cell)
}

const checkPowerUp = (cell) => {
	const classes = cell.classList
	const powerup = powerUpLists.filter((v) => v === classes[classes.length - 2])
	return powerup[0]
}

// RASH FIX THIS IT'S MATHS!
const bomberManEnemyCollision = () => {
	return enemyArr.some((enemy) => {
		const enemyData = JSON.parse(enemy.dataset.enemy)
		let originalEnemyPosition = {
			y: enemyData.y + enemyData.rely,
			x: enemyData.x + enemyData.relx,
		}
		return (
			Math.abs(originalEnemyPosition.y - bomberManCurrentPosition.y) <
				cellSize &&
			Math.abs(originalEnemyPosition.x - bomberManCurrentPosition.x) < cellSize
		)
	})
}

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
	]

	const hasExplosionClass = classNames.some((className) =>
		cell.classList.contains(className)
	)
	if (entity === "bomberMan") {
		if (hasExplosionClass || bomberManEnemyCollision()) {
			killBomberMan()
		}
	} else {
		if (hasExplosionClass) {
			killEnemy(cell)
		} else if (bomberManEnemyCollision()) {
			killBomberMan()
		}
	}
}

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
			newPosition.y -= cellSize * step
			newY = Math.floor(newPosition.y / cellSize)
			if (isbetweenCells(newPosition.x)) {
				newX = Math.round(newPosition.x / cellSize)
				newPosition.x = newX * cellSize
			}
			break
		case "ArrowDown":
			newPosition.y += cellSize * step
			newY = Math.ceil(newPosition.y / cellSize)
			if (isbetweenCells(newPosition.x)) {
				newX = Math.round(newPosition.x / cellSize)
				newPosition.x = newX * cellSize
			}
			break
		case "ArrowRight":
			newPosition.x += cellSize * step
			newX = Math.ceil(newPosition.x / cellSize)
			if (isbetweenCells(newPosition.y)) {
				newY = Math.round(newPosition.y / cellSize)
				newPosition.y = newY * cellSize
			}
			break
		case "ArrowLeft":
			newPosition.x -= cellSize * step
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
	const cell = cellsArr[newY][newX]

	if (isPowerUp(cell)) {
		const powerupValue = checkPowerUp(cell)

		if (
			!cell.classList.contains("breakable") &&
			cell.classList.contains("powerUp") &&
			cell.classList.contains(powerupValue)
		) {
			// currentPower = powerupValue
			cell.classList.remove("powerUp")
			cell.classList.remove(powerupValue)

			// reset power ups
			if (powerupValue !== "bomb-up") {
				numBombs = 1
			}

			if (powerupValue !== "fire-up" || powerupValue !== "full-fire") {
				fireRange = 1
			}

			if (powerupValue !== "skate") {
				step = 0.25
			}

			if (powerupValue !== "soft-block-pass") {
				walkableCells = Array.from(document.querySelectorAll(".walkable"))
			}

			if (powerupValue !== "remote-control") {
				remoteControl = false
			}

			if (powerupValue !== "bomb-pass") {
				passBombs = false
			}

			if (powerupValue !== "vest") {
				vest = false
			}

			powerUp.textContent = `Powerup: ${powerupValue}`

			// apply powerup
			switch (powerupValue) {
				case "bomb-up": // increase number of bomb
					numBombs += 1
					break
				case "fire-up": // change explosion and range by 1 tile
					fireRange = 2
					break
				case "skate": // skate - Increase Bomberman's speed
					step = 0.5
					break
				case "soft-block-pass": // soft block pass - Pass through Soft Blocks
					// include breakable cells as walkable
					breakableCells.forEach((v) => v.classList.add("walkable"))
					break
				case "remote-control": // remote control - Manually detonate a Bombs with certain button
					remoteControl = true
					break
				case "bomb-pass": // bomb pass - Pass through Bombs
					passBombs = true

					break
				case "full-fire": // full fire - Increase your firepower to the max
					fireRange = 3
					break
				case "vest": // vest - Immune to both Bombs blast and enemies
					vest = true
					// // remove power up after 10 seconds
					// setTimeout(() => {
					// 	vest = false
					// }, 10000)
					break
			}
		}
	}

	if (
		isDoor(cell) &&
		enemyArr.length === 0 &&
		!cell.classList.contains("breakable")
	) {
		stageCleared = true
		stageComplete.style.display = "flex"
	}

	if (
		isWalkable(cell, "bomberman") ||
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
		checkNotDead(cell, "bomberMan")
	}
}

const killBomberMan = () => {
	if (vest) {
		return
	}

	document.removeEventListener("keydown", onKeyDown)
	isKilled = true
	pauseCountdown()

	if (currentLives === 0) {
		isGameOver = true
		gameOver.style.display = "flex"
	} else {
		currentLives -= 1
		lives.textContent = `Lives ${currentLives}`
	}

	if (!isGameOver) {
		playerDied.style.display = "flex"
	}

	bomberManWrapper.classList.remove("bomber-man")
	bomberManWrapper.classList.add("death")
	bomberManWrapper.addEventListener("animationend", () => {
		bomberManWrapper.classList.remove("death")
	})

	setTimeout(() => {
		if (!isGameOver) {
			startCountdown()
		}
		reset()
	}, 3000)
}

const reset = () => {
	isKilled = false

	grid.innerHTML = ""
	numOfPowerUps = 2
	doorAdded = false
	// vest = false
	powerUp.innerText = "Powerup:"

	// reset the number of powerups
	powerUpObj.forEach((v) => {
		if (v.name !== "bomb-up") {
			v.count = 1
		} else {
			v.count = 2
		}
	})

	buildGrid()
	grid.appendChild(bomberManWrapper)

	cellsArr = createCellsArr()
	walkableCells = Array.from(document.querySelectorAll(".walkable"))
	powerUps = Array.from(document.querySelectorAll(".powerUp"))
	door = Array.from(document.querySelectorAll(".door"))
	enemyCount = totalNoEnemy

	// remove existing enemies from the grid
	enemyArr.forEach((enemy) => enemy.remove())

	// create new enemies in random walkable cells
	enemyArr = createEnemies()

	playerDied.style.display = "none"
	bomberManCurrentPosition = { y: 64, x: 64 }
	bomberManWrapper.classList.add("bomber-man")
	bomberManWrapper.style.transition = `transform 0ms`
	bomberManWrapper.style.transform = `translate(${
		bomberManCurrentPosition.x - cellSize
	}px, ${bomberManCurrentPosition.y - cellSize}px)`
	setSprite(horizontalAnimation, 1)
	document.addEventListener("keydown", onKeyDown)
	window.requestAnimationFrame(gameLoop)
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
	const enemyToKill = enemyArr.find((enemy) => {
		const enemyData = JSON.parse(enemy.dataset.enemy)
		let originalEnemyPosition = {
			y: enemyData.y + enemyData.rely,
			x: enemyData.x + enemyData.relx,
		}
		return (
			parseInt(cell.style.top) === originalEnemyPosition.y &&
			parseInt(cell.style.left) === originalEnemyPosition.x
		)
	})

	if (enemyToKill) {
		enemyToKill.classList.remove("enemy")
		enemyToKill.classList.add("enemy-death")
		enemyToKill.addEventListener("animationend", () => {
			enemyToKill.classList.remove("enemy-death")
			const enemyData = JSON.parse(enemyToKill.dataset.enemy)
			enemyToKill.remove()
			enemyArr = Array.from(document.querySelectorAll(".enemy"))
			currentScore += 100
			score.textContent = `Score ${currentScore}`
		})
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
		if (!passBombs) {
			bomberManCell.classList.remove("walkable")
			walkableCells = Array.from(document.querySelectorAll(".walkable"))
		}

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

document.addEventListener("keydown", (e) => {
	if (e.key === " " && remoteControl && remoteControlBombElements.length > 0) {
		remoteControlBombElements.forEach((v) => {
			v.bombElement.style.animation = "bomb-animation 1s steps(1) 2"
			detonate(v.bombElement, v.bomberManPosition, v.bomberManCell)
		})
		remoteControlBombElements.length = 0
	}
})

function explode(cell, style) {
	if (cell.classList.contains("indestructible")) {
		return false
	} else {
		if (cell.classList.contains("breakable")) {
			destroyBlocks(cell)
		}
		killEnemy(cell)
		if (
			Math.abs(parseInt(cell.style.top) - bomberManCurrentPosition.y) <
				cellSize &&
			Math.abs(parseInt(cell.style.left) - bomberManCurrentPosition.x) <
				cellSize
		) {
			killBomberMan()
		}
		cell.classList.add(style)
		cell.addEventListener("animationend", () => {
			cell.classList.remove(style)
		})
		return true
	}
}

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

		if (fireRange > 1) {
			let explosionTopFR =
				cellsArr[bomberManPosition.y - 1][bomberManPosition.x]
			let explosionBottomFR =
				cellsArr[bomberManPosition.y + 1][bomberManPosition.x]
			let explosionRightFR =
				cellsArr[bomberManPosition.y][bomberManPosition.x + 1]
			let explosionLeftFR =
				cellsArr[bomberManPosition.y][bomberManPosition.x - 1]
			if (explode(explosionTopFR, "explosion-fireRange-top")) {
				explode(explosionTop, "explosion-top")
			}
			if (explode(explosionBottomFR, "explosion-fireRange-bottom")) {
				explode(explosionBottom, "explosion-bottom")
			}
			if (explode(explosionRightFR, "explosion-fireRange-right")) {
				explode(explosionRight, "explosion-right")
			}
			if (explode(explosionLeftFR, "explosion-fireRange-left")) {
				explode(explosionLeft, "explosion-left")
			}
		} else {
			explode(explosionTop, "explosion-top")
			explode(explosionBottom, "explosion-bottom")
			explode(explosionRight, "explosion-right")
			explode(explosionLeft, "explosion-left")
		}
	})
}

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

		const cell = cellsArr[newEnemyY][newEnemyX]

		if (isWalkable(cell, "enemy")) {
			enemy.style.transition = `transform 1000ms`
			enemy.style.transform = `translate(${relativeEnemyPosition.x}px, ${relativeEnemyPosition.y}px)`
			enemyData.rely = relativeEnemyPosition.y
			enemyData.relx = relativeEnemyPosition.x
			checkNotDead(cell, "enemy")
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
			pauseCountdown()
			if (gamePaused) {
				gameStatus.style.display = "flex"
			} else {
				startCountdown()
				gameStatus.style.display = "none"
				window.requestAnimationFrame(gameLoop)
			}
			break
		case "r":
			location.reload()
			remainingSeconds = totalTime
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
	walkableCells = Array.from(document.querySelectorAll(".walkable"))
	if (gamePaused || isGameOver || isKilled || stageCleared) {
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
