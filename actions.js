
const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

let rows = 30;
let cols = 30;
let cellSize = canvas.width / cols;
const grid = [];
const stack = [];

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
        this.parent = null;
        this.visitedInSolve = false;
        this.distance = Infinity;
    }

    draw() {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        ctx.strokeStyle = "white";

        if (this.walls.top)    ctx.strokeRect(x, y, cellSize, 0);
        if (this.walls.right)  ctx.strokeRect(x + cellSize, y, 0, cellSize);
        if (this.walls.bottom) ctx.strokeRect(x, y + cellSize, cellSize, 0);
        if (this.walls.left)   ctx.strokeRect(x, y, 0, cellSize);
    }
}

let current;
let startCell;
let endCell;

function setup() {
    grid.length = 0;
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            grid.push(new Cell(x, y));
        }
    }
    current = grid[0];
    current.visited = true;
    stack.push(current);
    generateMaze();
    startCell = grid[index(0, 0)];
    endCell = grid[index(cols - 1, rows - 1)];
    draw();
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    grid.forEach(cell => cell.draw());
}

function index(x, y) {
    return (x < 0 || y < 0 || x >= cols || y >= rows) ? -1 : x + y * cols;
}

function removeWalls(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    if (dx === 1) { a.walls.left = false; b.walls.right = false; }
    else if (dx === -1) { a.walls.right = false; b.walls.left = false; }
    else if (dy === 1) { a.walls.top = false; b.walls.bottom = false; }
    else if (dy === -1) { a.walls.bottom = false; b.walls.top = false; }
}

function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const directions = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ];
    for (const { x, y } of directions) {
        const neighbor = grid[index(cell.x + x, cell.y + y)];
        if (neighbor && !neighbor.visited) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

function generateMaze() {
    while (stack.length > 0) {
        const neighbors = getUnvisitedNeighbors(current);
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWalls(current, next);
            next.visited = true;
            stack.push(next);
            current = next;
        } else {
            current = stack.pop();
        }
    }
}

setup();

document.getElementById("explore").addEventListener("click", () => {
    front.style.display = "none";
});

document.getElementById("generate").addEventListener("click", () => {
    const input_rows = document.getElementById("bre");
    const input_cols = document.getElementById("len");
    if (input_rows && input_cols) {
        rows = parseInt(input_rows.value) || rows;
        cols = parseInt(input_cols.value) || cols;
        cellSize = canvas.width / cols;
    }
    setup();
});

function getAccessibleNeighbors(cell) {
    const neighbors = [];
    const directions = [
        { x: 0, y : -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ];
    for (const { x, y } of directions) {
        const neighbor = grid[index(cell.x + x, cell.y + y)];
        if (neighbor) {
            if ((x === 0 && y === -1 && !cell.walls.top && !neighbor.walls.bottom) || 
                (x === 1 && y === 0 && !cell.walls.right && !neighbor.walls.left) || 
                (x === 0 && y === 1 && !cell.walls.bottom && !neighbor.walls.top) || 
                (x === -1 && y === 0 && !cell.walls.left && !neighbor.walls.right)) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
}

function reconstructPath(end) {
    const path = [];
    let current = end;
    while (current) {
        path.push(current);
        current = current.parent;
    }
    return path.reverse();
}

function resetPathfinding() {
    grid.forEach(cell => {
        cell.parent = null;
        cell.visitedInSolve = false;
        cell.distance = Infinity;
    });
}

function solveMazeBFS(start, end) {
    resetPathfinding();
    const queue = [start];
    start.visitedInSolve = true;

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === end) return reconstructPath(end);

        const neighbors = getAccessibleNeighbors(current);
        for (const neighbor of neighbors) {
            if (!neighbor.visitedInSolve) {
                neighbor.visitedInSolve = true;
                neighbor.parent = current;
                queue.push(neighbor);
            }
        }
    }
    return [];
}

function solveMazeDFS(start, end) {
    resetPathfinding();
    const stack = [start];
    start.visitedInSolve = true;

    while (stack.length > 0) {
        const current = stack.pop();
        if (current === end) return reconstructPath(end);

        const neighbors = getAccessibleNeighbors(current);
        for (const neighbor of neighbors) {
            if (!neighbor.visitedInSolve) {
                neighbor.visitedInSolve = true;
                neighbor.parent = current;
                stack.push(neighbor);
            }
        }
    }
    return [];
}

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function solveMazeDijkstra(start, end) {
    resetPathfinding();
    start.distance = 0;
    const priorityQueue = [start];
    
    while (priorityQueue.length > 0) {
        // Sort by distance
        priorityQueue.sort((a, b) => a.distance - b.distance);
        const current = priorityQueue.shift();
        
        if (current === end) return reconstructPath(end);
        
        const neighbors = getAccessibleNeighbors(current);
        for (const neighbor of neighbors) {
            const newDistance = current.distance + 1;
            if (newDistance < neighbor.distance) {
                neighbor.distance = newDistance;
                neighbor.parent = current;
                if (!priorityQueue.includes(neighbor)) {
                    priorityQueue.push(neighbor);
                }
            }
        }
    }
    return [];
}

function solveMazeAStar(start, end) {
    resetPathfinding();
    start.distance = 0;
    const priorityQueue = [start];
    
    while (priorityQueue.length > 0) {
        // Sort by f(n) = g(n) + h(n)
        priorityQueue.sort((a, b) => 
            (a.distance + heuristic(a, end)) - (b.distance + heuristic(b, end))
        );
        const current = priorityQueue.shift();
        
        if (current === end) return reconstructPath(end);
        
        const neighbors = getAccessibleNeighbors(current);
        for (const neighbor of neighbors) {
            const newDistance = current.distance + 1;
            if (newDistance < neighbor.distance) {
                neighbor.distance = newDistance;
                neighbor.parent = current;
                if (!priorityQueue.includes(neighbor)) {
                    priorityQueue.push(neighbor);
                }
            }
        }
    }
    return [];
}

function animatePath(path, color) {
    let i = 0;
    function step() {
        if (i < path.length) {
            const cell = path[i];
            const x = cell.x * cellSize;
            const y = cell.y * cellSize;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, cellSize - 3, cellSize - 3);
            i++;
            setTimeout(step, 20);
        }
    }
    step();
}

// Event Listeners with Different Colors
document.getElementById("BFS").addEventListener("click", () => {
    draw();
    const pathBFS = solveMazeBFS(startCell, endCell);
    animatePath(pathBFS, "#00FFFF"); // Cyan
});

document.getElementById("DFS").addEventListener("click", () => {
    draw();
    const pathDFS = solveMazeDFS(startCell, endCell);
    animatePath(pathDFS, "#00FF00"); // Lime
});

document.getElementById("Dijkstra").addEventListener("click", () => {
    draw();
    const pathDijkstra = solveMazeDijkstra(startCell, endCell);
    animatePath(pathDijkstra, "#FF00FF"); // Magenta
});

document.getElementById("AStar").addEventListener("click", () => {
    draw();
    const pathAStar = solveMazeAStar(startCell, endCell);
    animatePath(pathAStar, "#FFFF00"); // Yellow
});