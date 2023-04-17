const grid = document.getElementById("game-grid")
const gridRow = 13
const gridCol = 15
const cellSize = 50

const buildGrid = () => {
    for(let row = 0; row < gridRow; row++) {
        for(let col = 0; col < gridCol; col++) {
            const cell = document.createElement("div")
            cell.style.top = `${row * cellSize}px`
            cell.style.left = `${col * cellSize}px`
            cell.classList.add("cell")
            if(row === 0 || col === 0 || row === gridRow -1 || col === gridCol-1 || row % 2 === 0 && col % 2 === 0) {
                cell.classList.add("indestructible")
            } else {
                cell.classList.add("walkable")
            }
            grid.append(cell)
        }
    }
}

buildGrid()