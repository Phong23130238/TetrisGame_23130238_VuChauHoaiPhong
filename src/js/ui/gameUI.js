import PieceUI from "./pieceUI.js";
import BoardUI from "./boardUI.js";

export default class GameUI {
    constructor() {
        this.boardUI = new BoardUI(document.getElementById("game-board"));
        this.pieceUI = new PieceUI();

        this.scoreValue = document.getElementById("score-value");
        this.levelValue = document.getElementById("level-value");
        this.linesValue = document.getElementById("lines-value");
        this.holdBoard = document.getElementById("hold-board");
        this.nextBoards = [document.getElementById("next-1"), document.getElementById("next-2"), document.getElementById("next-3")];
    }

    createBoard(board) {
        this.boardUI.createCells(board.rows, board.cols);
    }

    render(game){
        this.boardUI.render(game.board, game.currentPiece);
        this.renderHold(game.holdPiece);
        this.renderNext(game.nextQueue);
        this.updateScore(game.score);
        this.updateLevel(game.level);
        this.updateLines(game.lines);
    }

    renderHold(piece){
        if(!piece){
            this.holdBoard.innerHTML = "";
            return;
        }
        this.pieceUI.render(piece, this.holdBoard);
    }

    renderNext(queue){
        this.nextBoards.forEach((container, index) => {
           const piece = queue[index];
           if(!piece){
               container.innerHTML = "";
               return;
           }
            this.pieceUI.render(piece, container);
        });
    }

    updateScore(score){
        this.scoreValue.textContent = score;
    }

    updateLevel(level){
        this.levelValue.textContent = level;
    }

    updateLines(lines){
        this.linesValue.textContent = lines;
    }

    showPause(){
        document.getElementById("pause-overlay").classList.remove("hidden");
    }

    hidePause(){
        document.getElementById("pause-overlay").classList.add("hidden");
    }

    showSettings(){
        document.getElementById("settings-overlay").classList.remove("hidden");
    }

    hideSettings(){
        document.getElementById("settings-overlay").classList.add("hidden");
    }

    showGameOver(){
        document.getElementById("game-over-overlay").classList.remove("hidden");
    }

    hideGameOver(){
        document.getElementById("game-over-overlay").classList.add("hidden");
    }
}