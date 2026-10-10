export default class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = this.createGrid();
    }

    createGrid(){
        return Array.from(
            {length:  this.rows},
            () => Array(this.cols).fill(null)
        );
    }

    reset(){
        this.grid = this.createGrid();
    }

    canPlace(piece, offsetX = 0, offsetY = 0) {
        for(let row = 0; row < piece.shape.length; row++) {
            for(let col = 0; col < piece.shape[row].length; col++) {
                if(!piece.shape[row][col]){
                    continue;
                }

                const x = piece.x + col + offsetX;
                const y = piece.y + row + offsetY;

                if(x < 0 || x >=  this.cols || y >= this.rows){
                    return false;
                }
                if(y >= 0 && this.grid[y][x]){
                    return false;
                }
            }
        }
        return true;

    }

    merge(piece){
        for(let row = 0; row < piece.shape.length; row++) {
            for(let col = 0; col < piece.shape[row].length; col++) {
                if(!piece.shape[row][col]){
                    continue;
                }
                const x = piece.x + col;
                const y = piece.y + row;

                if(y >= 0){
                    this.grid[y][x] = piece.color;

                }
            }
        }
    }   

    clearLines(){
        const remainingRows = this.grid.filter(row => row.some(cell => cell === null));
        const clearedLines = this.rows - remainingRows.length;
        while(remainingRows.length < this.rows){
            remainingRows.unshift( Array(this.cols).fill(null));
        }
        this.grid = remainingRows;
        return clearedLines;
    }
}