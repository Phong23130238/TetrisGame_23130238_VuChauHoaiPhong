import Board from "./board.js";
import PieceFactory from "./pieceFactory.js";
import GameLoop from "./gameLoop.js";
import {saveHighScore} from "./services/storageServices.js";

import {
    ROWS, COLS, DROP_INTERVAL, NEXT_COUNT
} from "./config/constants.js";

import { rotateMatrix} from "./utils/matrix.js";

export default class Game {
    constructor(ui) {
        this.ui = ui;
        this.board = new Board(ROWS, COLS);
        this.loop = new GameLoop();
        this.currentPiece = null;
        // phụ
        this.holdPiece = null;
        this.canHold = true;
        this.nextQueue = [];
        // p điểm, vòng, màn
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        //menu, thua
        this.isPaused = false;
        this.isGameOver = false;
    }

    start() {
        this.reset();
        this.prepareQueue();
        this.spawnPiece();
        this.ui.createBoard(this.board);
        this.render();
        this.loop.star(() => this.dropPiece(), DROP_INTERVAL);
    }

    reset() {
        this.board.reset();
        this.currentPiece = null;
        this.holdPiece = null;
        this.nextQueue = [];
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.canHold = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.ui.hideGameOver();
        this.ui.hidePause();
        this.ui.hideSettings();
    }

    prepareQueue() {
        while(this.nextQueue.length < NEXT_COUNT){
            this.nextQueue.push(PieceFactory.createRandomPiece());
        }
    }

    spawnPiece() {
        this.currentPiece = this.nextQueue.shift();
        this.nextQueue.push(PieceFactory.createRandomPiece());
        this.setSpawnPosition(this.currentPiece);
        if(!this.board.canPlace(this.currentPiece)){
            this.endGame();
        }
    }

    setSpawnPosition(piece) {
        piece.x = Math.floor((COLS - piece.shape[0].length) / 2);
        piece.y = 0;
    }

    movePiece(x, y){
        if (this.board.canPlace(this.currentPiece, x, y)){
            this.currentPiece.x += x;
            this.currentPiece.y += y;
        }
        this.render();
    }

    dropPiece() {
        if (this.isPaused || this.isGameOver){
            return;
        }
        if (this.board.canPlace(this.currentPiece, 0, 1)){
            this.currentPiece.y++;
            this.render();
            return;
        }
        this.lockPiece();
    }

    rotatePiece(){
        const oldShape = this.currentPiece.shape;
        const newShape = rotateMatrix(oldShape);
        this.currentPiece.shape = newShape;
        if(!this.board.canPlace(this.currentPiece)){
            this.currentPiece.shape = oldShape;
        }
        this.render();
    }

    hardDrop(){
        while(this.board.canPlace(this.currentPiece, 0, 1)){
            this.currentPiece.y++;
        }
        this.lockPiece();
    }

    lockPiece() {
        this.board.merge(this.currentPiece);
        this.clearLines();
        this.spawnPiece();
        this.canHold = true;
        this.render();
    }

    clearLines(){
        const cleared = this.board.clearLines();
        if (cleared === 0){
            return;
        }
        this.lines += cleared;
        this.addScore(cleared);
    }

    addScore(lines){
        const scores = [0, 100, 300, 500, 800];
        this.score += scores[lines];
    }

    holdCurrentPiece(){
        if(!this.currentPiece || !this.canHold || this.isPaused || this.isGameOver){
            return;
        }
        if(!this.holdPiece){
            this.holdPiece = this.currentPiece;
            this.spawnPiece();
        }else{
            const temp = this.currentPiece;
            this.currentPiece = this.holdPiece;
            this.holdPiece = temp;
            this.setSpawnPosition(this.currentPiece);
            if(!this.board.canPlace(this.currentPiece)){
                this.endGame();
                return;
            }
        }
        this.canHold = false;
        this.render();
    }

    togglePause(){
        if(this.isGameOver){
            return;
        }
        this.isPaused = !this.isPaused;
        if(this.isPaused){
            this.loop.stop();
            this.ui.showPause();
            return;
        }
        this.ui.hidePause();
        this.loop.start(() => this.dropPiece(), DROP_INTERVAL);
    }

    endGame() {
        this.isGameOver = true;
        this.loop.stop();
        saveHighScore(this.score);
        this.ui.showGameOver();
    }

    render() {
        this.ui.render(this);
    }
}