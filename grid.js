const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;
let rows = 30;
let cols = 30;
let cellSize = canvas.width / cols;
const grid = [];
const stack = [];

class Cell{
   constructor(x,y){
      this.x = x;
      this.y = y;
      this.walls = { top: true, right: true, bottom: true, left: true };
      this.visited = false;
   }
   draw() {
      const x = this.x * cellSize;
      const y = this.y * cellSize;
      ctx.strokeStyle = "white";
      
      if (this.walls.top)    ctx.beginPath(), ctx.moveTo(x, y), ctx.lineTo(x + cellSize, y), ctx.stroke();
      if (this.walls.right)  ctx.beginPath(), ctx.moveTo(x + cellSize, y), ctx.lineTo(x + cellSize, y + cellSize), ctx.stroke();
      if (this.walls.bottom) ctx.beginPath(), ctx.moveTo(x + cellSize, y + cellSize), ctx.lineTo(x, y + cellSize), ctx.stroke();
      if (this.walls.left)   ctx.beginPath(), ctx.moveTo(x, y + cellSize), ctx.lineTo(x, y), ctx.stroke();
   }
};

   function setup() {
      for (let y = 0; y < rows; y++) {
         for (let x = 0; x < cols; x++) {
            grid.push(new Cell(x, y));
         }
      }
      current = grid[0];
      current.visited = true;
      stack.push(current);
      generateMaze();
      draw();
   }
   function draw() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      grid.forEach(cell => cell.draw());
   }