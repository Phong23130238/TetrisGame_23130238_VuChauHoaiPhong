export default class BoardUI {
    constructor(boardElement) {
        this.boardElement = boardElement;
        this.cells = [];
    }

    createCells(rows, cols){
        this.boardElement.innerHTML = "";
        this.cells = [];
        for(let row = 0; row < rows; row++){
            for(let col = 0; col < cols; col++){
                const cell = document.createElement("div");
                cell.classList.add("board-cell");
                this.cells.push(cell);
                this.boardElement.appendChild(cell);
            }
        }
        console.log("Số board cell:", this.cells.length);
    }

    render(board, piece){
        this.renderBoard(board);
        this.renderPiece(piece, board);
    }

    renderBoard(board){
        for(let row = 0; row < board.rows; row++){
            for(let col = 0; col < board.cols; col++){
                const index = row * board.cols + col;
                const cell = this.cells[index];
                cell.style.backgroundColor = board.grid[row][col] || "";
            }
        }
    }

    renderPiece(piece, board){
        if(!piece){
            return;
        }
        for(let row = 0; row < piece.shape.length; row++){
            for(let col = 0; col < piece.shape[row].length; col++){
                if(!piece.shape[row][col]){
                    continue;
                }
                const x = piece.x + col;
                const y = piece.y + row;
                if(x < 0 || x >= board.cols || y < 0 || y >= board.rows){
                    continue;
                }
                const index = y * board.cols + x;
                const cell = this.cells[index];
                if (!cell) {console.error("Không tìm thấy board cell:", {
                        x, y, index, totalCells: this.cells.length, rows: board.rows, cols: board.cols
                    });
                    continue;
                }
                cell.style.backgroundColor = piece.color;
            }
        }
    }


}