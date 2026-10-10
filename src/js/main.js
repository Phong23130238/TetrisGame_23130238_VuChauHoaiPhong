import PieceFactory from "./pieceFactory.js";
import PieceUI from "./ui/pieceUI.js";
import Game from "./game.js";
import GameUI from "./ui/gameUI.js";

const ui = new GameUI();
const game = new Game(ui);
const piece = PieceFactory.createRandomPiece();
const pieceUI = new PieceUI();
const holdBoard = document.getElementById("hold-board");
pieceUI.render(piece, holdBoard);
game.start();

document.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "ArrowLeft":
            event.preventDefault();
            game.movePiece(-1, 0);
            break;

        case "ArrowRight":
            event.preventDefault();
            game.movePiece(1, 0);
            break;

        case "ArrowDown":
            event.preventDefault();
            game.dropPiece();
            break;

        case "ArrowUp":
            event.preventDefault();
            game.rotatePiece();
            break;

        case "Space":
            event.preventDefault();
            game.hardDrop();
            break;

        case "KeyC":
            game.holdCurrentPiece();
            break;

        case "KeyP":
            game.togglePause();
            break;
    }
});

document.getElementById("pause-button").addEventListener("click", () => {
    game.togglePause();
});
document.getElementById("resume-button").addEventListener("click", () => {
    game.togglePause();
});
document.getElementById("replay-button").addEventListener("click", () => {
    game.start();
});
document.getElementById("home-button").addEventListener("click", () => {
    window.location.href = "./index.html";
});
document.getElementById("pause-settings-button").addEventListener("click", () => {
    ui.hidePause();
    ui.showSettings();
});
document.getElementById("setting-back-button").addEventListener("click", () => {
    ui.hideSettings();
    ui.showPause();
});
document.getElementById("exit-button").addEventListener("click", () => {
    window.location.href = "./index.html";
});