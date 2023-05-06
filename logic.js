const grid = document.getElementById("game-grid")
const bomberManWrapper = document.createElement("div")
bomberManWrapper.classList.add("bomberManWrapper")
bomberManWrapper.classList.add("bomber-man")
grid.appendChild(bomberManWrapper)
const gridRow = 13
const gridCol = 15
const cellSize = 64
const speed = 100
const distance = 0.25
let bomberManCurrenPosition = {
	y: 64,
	x: 64,
	direction: 2,
}
let horizontalAnimation = 0
let verticalAnimation = 3
let gameStarted = false

const buildGrid = () => {
	for (let row = 0; row < gridRow; row++) {
		for (let col = 0; col < gridCol; col++) {
			const cell = document.createElement("div")
			cell.style.top = `${row * cellSize}px`
			cell.style.left = `${col * cellSize}px`
			cell.classList.add("cell")
			cell.classList.add("wall")
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

buildGrid()
const cellsArr = createCellsArr()

const walkableCells = Array.from(document.querySelectorAll(".walkable"))

const isWalkable = (y, x) => {
	console.log(walkableCells.includes(cellsArr[y][x]))
	return walkableCells.includes(cellsArr[y][x])
}

function setSprite(spriteX, spriteY) {
	const bomberMan = document.querySelector(".bomber-man")
	const spriteSize = 64
	bomberMan.style.backgroundPosition = `-${spriteX * spriteSize}px -${
		spriteY * spriteSize
	}px`
}
const move = (direction) => {
	let newPosition = {
		x: bomberManCurrenPosition.x,
		y: bomberManCurrenPosition.y,
	}
	switch (direction) {
		case "ArrowUp":
			newPosition.y -= cellSize * distance
			break
		case "ArrowDown":
			newPosition.y += cellSize * distance
			break
		case "ArrowRight":
			newPosition.x += cellSize * distance
			break
		case "ArrowLeft":
			newPosition.x -= cellSize * distance
			break
	}
	const newY = Math.floor(newPosition.y / cellSize)
	const newX = Math.floor(newPosition.x / cellSize)
	console.log(newY, newX)
	if (isWalkable(newY, newX)) {
		if (
			newPosition.x === bomberManCurrenPosition.x &&
			newPosition.y === bomberManCurrenPosition.y
		) {
			return // Don't move if the bomberman is already at the new position
		}
		// Animate the movement
		bomberManWrapper.style.transition = `transform ${speed}ms`
		bomberManWrapper.style.transform = `translate3d(${
			newPosition.x - cellSize
		}px, ${newPosition.y - cellSize}px, 0)`
		bomberManCurrenPosition = newPosition
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

const enemyInterval = 75
let lastEnemyMove = 0

const gameLoop = (timestamp) => {
	const deltaTime = timestamp - lastEnemyMove
	if (deltaTime >= enemyInterval) {
		move(bomberManCurrenPosition.direction)
		lastEnemyMove = timestamp
	}
	window.requestAnimationFrame(gameLoop)
}

window.requestAnimationFrame(gameLoop)

const onKeyDown = (e) => {
	switch (e.key) {
		case "ArrowUp":
		case "ArrowDown":
		case "ArrowRight":
		case "ArrowLeft":
			bomberManCurrenPosition.direction = e.key
			break
	}
}

document.addEventListener("keydown", onKeyDown)
