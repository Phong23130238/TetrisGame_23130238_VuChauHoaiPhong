// ttinh
const ROWS = 20;
const COLS = 10;
const DROP_INTERVAL = 700;
const NEXT_COUNT = 3;
const PREVIEW_SIZE = 4;
const HIGH_SCORE_KEY = "tetrisHighScores";

// màu
const COLORS = [
    "#FD3F59",
    "#FFC82E",
    "#FEFB34",
    "#53DA3F",
    "#01EDFA",
    "#DD0AB2",
    "#EA141C",
    "#FE4819",
    "#FF910C",
    "#39892F",
    "#0077D3",
    "#78256F",
    "#2E2E84",
    "#485DC5"
];

// khối
const PIECES = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

// hd từng levels
const LEVEL_NOTES = {
    1: {
        title: "LV1 - TETRIS CƠ BẢN",
        paragraphs: [
            "Các Khối ngẫu nhiên xuất hiện từ phía trên và rơi xuống phía dưới.",
            "Người chơi di chuyển khối sang trái, phải, xoay khối và thả khối xuống.",
            "Khi một hàng được lắp đầy, hàng đó sẽ được xóa và các hàng phía trên sẽ rơi xuống."
        ]
    },
    2: {
        title: "LV2 - ĐẢO NGƯỢC DI CHUYỂN",
        paragraphs: [
            "Ở màn này, các logic tính điểm, ăn ô vẫn giống màn 1.",
            "Tuy nhiên, các nút di chuyển của người chơi sẽ bị đảo lộn",
            "Ví dụ: nút di chuyển trái khi ấn sẽ di chuyển sang phải, khiến độ khó màn chơi gia tăng"
        ]
    },
    3:  {
        title: "LV3 - BÀN CỜ ẨN",
        paragraphs: [
            "Trong màn này, khối đã rơi xuống và khóa chỉ hiển thị trong 3 giây sau đó bị ẩn đi.",
            "Để hiển thị các khối trước đó người chơi cần:",
            "-Xóa hàng, bàn cờ hiện lại trong 2 giây. Hard Drop khóa khối, bàn cờ hiện lại trong 1,5 giây."
        ]
    }
};
// tthai game
const gameState = {
    board: [],
    cells: [],
    currentPiece: null,
    holdPiece: null,
    canHold: true,
    nextQueue: [],
    score: 0,
    lines: 0,
    level: 1,
    selectedLevel:1,
    isPaused: false,
    isGameOver: false,
    timer: null,
// 3
    boardVisibleUntil: [],
    displayBoardUntil: 0,
    visibilityTimer: null
};

const gameBoardElement = document.getElementById("game-board");

// chức năng
function getRandomItem(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

function createRandomPiece() {
    const type = getRandomItem(Object.keys(PIECES));
    const shape = PIECES[type].map(row => row.slice());
    const color = getRandomItem(COLORS);

    return {
        type: type,
        shape: shape,
        color: color,
        x: 0,
        y: 0
    };
}

function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

// 3
function createEmptyVisibilityBoard(){
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

function getElement(id) {
    return document.getElementById(id);
}

function addClickEvent(id, callback) {
    const element = getElement(id);
    if (element) {
        element.addEventListener("click", callback);
    }
}

function canPlacePiece(piece, offsetX = 0, offsetY = 0) {
    if (!piece) {
        return false;
    }
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col] === 0) {
                continue;
            }
            const x = piece.x + col + offsetX;
            const y = piece.y + row + offsetY;
            if (x < 0 || x >= COLS || y >= ROWS) {
                return false;
            }
            if (y >= 0 && gameState.board[y][x] !== null) {
                return false;
            }
        }
    }
    return true;
}

function mergePiece(piece) {
    const visibleUntil = Date.now() + 1500;
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col] === 0) {
                continue;
            }
            const x = piece.x + col;
            const y = piece.y + row;
            if (x < 0 && x >= COLS && y < 0 && y >= ROWS) {
                continue;
            }
            gameState.board[y][x] = piece.color;
            if (gameState.selectedLevel === 3){
                gameState.boardVisibleUntil[y][x] = visibleUntil;
            }else{
                gameState.boardVisibleUntil[y][x] = 0;
            }
        }
    }
}

function clearFullLines() {
    const remainingRows = [];
    for(let row = 0; row < ROWS; row++) {
        if (gameState.board[row].some(cell => cell === null)){
            remainingRows.push(row);
        }
    }
    const clearedLines = ROWS - remainingRows.length;
    gameState.board = remainingRows.map(row => gameState.board[row]);
    gameState.boardVisibleUntil = remainingRows.map(row => gameState.boardVisibleUntil[row]);
    while(gameState.board.length < ROWS){
        gameState.board.unshift(Array(COLS).fill(null));
        gameState.boardVisibleUntil.unshift(Array(COLS).fill(0));
    }
    return clearedLines;
}

function setSpawnPosition(piece) {
    piece.x = Math.floor((COLS - piece.shape[0].length) / 2);
    piece.y = 0;
}

function fillNextQueue() {
    while (gameState.nextQueue.length < NEXT_COUNT) {
        gameState.nextQueue.push(createRandomPiece());
    }
}

function spawnNextPiece() {
    gameState.currentPiece = gameState.nextQueue.shift();
    gameState.nextQueue.push(createRandomPiece());
    setSpawnPosition(gameState.currentPiece);
    if (!canPlacePiece(gameState.currentPiece)) {
        endGame();
    }
}

// Ui
function createBoardCells() {
    if (!gameBoardElement) {
        return;
    }
    gameBoardElement.innerHTML = "";
    gameState.cells = [];
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement("div");
            cell.classList.add("board-cell");
            gameState.cells.push(cell);
            gameBoardElement.appendChild(cell);
        }
    }
}

function renderBoard() {
    const now = Date.now();
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const index = row * COLS + col;
            const cell = gameState.cells[index];
            if(!cell){
                continue;
            }
            const color = gameState.board[row][col];
            let shouldShow = true;
            if(gameState.selectedLevel === 3 && color !== null){
                const visibleUntil = gameState.boardVisibleUntil[row][col] || 0;
                const temporaryVisible = now < visibleUntil;
                const boardDisplay = now < gameState.displayBoardUntil;
                shouldShow = temporaryVisible || boardDisplay;
            }
            cell.style.backgroundColor = color !== null && shouldShow ? color : "";
        }
    }
}

function renderCurrentPiece() {
    const piece = gameState.currentPiece;
    if (!piece) {
        return;
    }

    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col] === 0) {
                continue;
            }
            const x = piece.x + col;
            const y = piece.y + row;
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
                continue;
            }
            const index = y * COLS + x;
            const cell = gameState.cells[index];
            if (cell) {
                cell.style.backgroundColor = piece.color;
            }
        }
    }
}

function renderPreview(piece, container) {
    if (!container) {
        return;
    }
    container.innerHTML = "";
    if (!piece) {
        return;
    }
    const offsetX = Math.floor(
        (PREVIEW_SIZE - piece.shape[0].length) / 2
    );
    const offsetY = Math.floor(
        (PREVIEW_SIZE - piece.shape.length) / 2
    );
    for (let row = 0; row < PREVIEW_SIZE; row++) {
        for (let col = 0; col < PREVIEW_SIZE; col++) {
            const cell = document.createElement("div");
            cell.classList.add("piece-cell");
            const shapeRow = row - offsetY;
            const shapeCol = col - offsetX;
            if (piece.shape[shapeRow]?.[shapeCol] === 1) {
                cell.style.backgroundColor = piece.color;
            }
            container.appendChild(cell);
        }
    }
}

function renderHoldPiece() {
    renderPreview(gameState.holdPiece, getElement("hold-board"));
}

function renderNextPieces() {
    for (let index = 0; index < NEXT_COUNT; index++) {
        const container = getElement(`next-${index + 1}`);
        renderPreview(gameState.nextQueue[index], container);
    }
}

function updateGameInformation() {
    const scoreElement = getElement("score-value");
    const levelElement = getElement("level-value");
    const linesElement = getElement("lines-value");

    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }
    if (levelElement) {
        levelElement.textContent = gameState.level;
    }
    if (linesElement) {
        linesElement.textContent = gameState.lines;
    }
}

function renderGame() {
    if (!gameBoardElement) {
        return;
    }
    renderBoard();
    renderCurrentPiece();
    renderHoldPiece();
    renderNextPieces();
    updateGameInformation();
}

// 3

function scheduleVisibleRefresh(){
    if(gameState.visibilityTimer){
        clearTimeout(gameState.visibilityTimer);
        gameState.visibilityTimer = null;
    }
    if(gameState.selectedLevel !== 3 || !gameBoardElement){
        return;
    }
    const now = Date.now();
    let nextUpdateTime = gameState.displayBoardUntil > now ? gameState.displayBoardUntil : Infinity;
    for(let row = 0; row <ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (gameState.board[row][col] === 0) {
                continue;
            }
            const visibleUntil = gameState.boardVisibleUntil[row][col];
            if(visibleUntil > now && visibleUntil < nextUpdateTime){
                nextUpdateTime = visibleUntil;
            }
        }
    }
    if (nextUpdateTime === Infinity) {
        return;
    }
    const delay = Math.max(0, nextUpdateTime - Date.now());
    gameState.visibilityTimer = window.setTimeout(() => {
        gameState.visibilityTimer = null;
        renderGame();
        scheduleVisibleRefresh();
    }   , delay);
}

function displayLockedBoard(duration){
    if (gameState.selectedLevel !== 3){
        return;
    }
    const newVisibleUntil = Date.now() + duration;
    gameState.displayBoardUntil = Math.max(gameState.displayBoardUntil, newVisibleUntil);
    scheduleVisibleRefresh();
}

function showOverlay(id) {
    const overlay = getElement(id);
    if (overlay) {
        overlay.classList.remove("hidden");
    }
}

function hideOverlay(id) {
    const overlay = getElement(id);
    if (overlay) {
        overlay.classList.add("hidden");
    }
}

function getHighScores() {
    try {
        const savedScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY) || "[]");
        if (!Array.isArray(savedScores)) {
            return [];
        }
        return savedScores
            .filter(score => typeof score === "number" && Number.isFinite(score))
            .sort((a, b) => b - a)
            .slice(0, 5);
    } catch (error) {
        return [];
    }
}

function saveHighScore(score) {
    const scores = getHighScores();
    scores.push(score);
    scores.sort((a, b) => b - a);
    try {
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores.slice(0, 5)));
    } catch (error) {
        console.warn("Không thể lưu điểm cao trên trình duyệt.");
    }
}

function resetHighScores() {
    try {
        localStorage.removeItem(HIGH_SCORE_KEY);
    } catch (error) {
        console.warn("Không thể xóa điểm cao trên trình duyệt.");
    }
    renderHighScoreList();
    renderGameOverScores();
}

function renderHighScoreList() {
    const list = document.querySelector(".high-score-list");
    if (!list) {
        return;
    }
    const scores = getHighScores();
    list.innerHTML = "";
    for (let index = 0; index < 5; index++) {
        const row = document.createElement("div");
        const rank = document.createElement("span");
        const playerName = document.createElement("span");
        const playerScore = document.createElement("span");
        row.className = "score-row";
        rank.className = "rank";
        playerName.className = "player-name";
        playerScore.className = "player-score";
        rank.textContent = index + 1;
        playerName.textContent = scores[index] === undefined ? "—" : "PLAYER";
        playerScore.textContent = scores[index] === undefined ? "—" : scores[index];
        row.append(rank, playerName, playerScore);
        list.appendChild(row);
    }
}

function renderGameOverScores() {
    const list = document.querySelector(".game-over-score-list");

    if (!list) {
        return;
    }
    const scores = getHighScores();
    list.innerHTML = "";
    for (let index = 0; index < 5; index++) {
        const item = document.createElement("div");
        item.textContent = scores[index] === undefined ? "—" : scores[index];
        list.appendChild(item);
    }
}

function resetGameState() {
    gameState.board = createEmptyBoard();
    gameState.cells = [];
    gameState.currentPiece = null;
    gameState.holdPiece = null;
    gameState.canHold = true;
    gameState.nextQueue = [];
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = gameState.selectedLevel;
    gameState.isPaused = false;
    gameState.isGameOver = false;

    hideOverlay("pause-overlay");
    hideOverlay("settings-overlay");
    hideOverlay("game-over-overlay");

    // 3
    if(gameState.visibilityTimer !== null){
        clearTimeout(gameState.visibilityTimer);
        gameState.visibilityTimer = null;
    }
    gameState.boardVisibleUntil = createEmptyVisibilityBoard();
    gameState.displayBoardUntil = 0;
}

function startDropLoop() {
    stopDropLoop();
    gameState.timer = window.setInterval(
        dropPiece,
        DROP_INTERVAL
    );
}

function stopDropLoop() {
    if (gameState.timer !== null) {
        window.clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

function startGame() {
    if (!gameBoardElement) {
        return;
    }
    stopDropLoop();
    resetGameState();
    createBoardCells();
    fillNextQueue();
    spawnNextPiece();
    renderGame();
    if (!gameState.isGameOver) {
        startDropLoop();
    }
}

function movePiece(offsetX, offsetY) {
    if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
        return;
    }
    if (canPlacePiece(gameState.currentPiece, offsetX, offsetY)) {
        gameState.currentPiece.x += offsetX;
        gameState.currentPiece.y += offsetY;
    }
    renderGame();
}
// màn 2
function reverseButtons(direction){
   let moveDirection = direction;
   if(gameState.selectedLevel === 2){
       moveDirection = -direction;
   }
   movePiece(moveDirection, 0);
}

function dropPiece() {
    if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
        return;
    }
    if (canPlacePiece(gameState.currentPiece, 0, 1)) {
        gameState.currentPiece.y++;
        renderGame();
        return;
    }
    lockCurrentPiece();
}

function rotateCurrentPiece() {
    if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
        return;
    }
    const piece = gameState.currentPiece;
    const oldShape = piece.shape;
    const oldX = piece.x;
    piece.shape = rotateMatrix(oldShape);
    const offsets = [0, -1, 1, -2, 2, -3, 3];
    for (const offset of offsets) {
        piece.x = oldX + offset;
        if (canPlacePiece(piece)) {
            renderGame();
            return;
        }
    }
    piece.shape = oldShape;
    piece.x = oldX;
    renderGame();
}

function hardDrop() {
    if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
        return;
    }
    while (canPlacePiece(gameState.currentPiece, 0, 1)) {
        gameState.currentPiece.y++;
    }
    lockCurrentPiece(true);
}

function lockCurrentPiece(isHardDrop = false) {
    if (!gameState.currentPiece || gameState.isGameOver) {
        return;
    }
    mergePiece(gameState.currentPiece);
    clearLinesAndUpdateScore();
    if(isHardDrop){
        displayLockedBoard(1500);
    }
    gameState.canHold = true;
    spawnNextPiece();
    scheduleVisibleRefresh();
    if (!gameState.isGameOver) {
        renderGame();
    }
}

function holdCurrentPiece() {
    if (!gameState.currentPiece || !gameState.canHold || gameState.isPaused || gameState.isGameOver) {
        return;
    }
    if (!gameState.holdPiece) {
        gameState.holdPiece = gameState.currentPiece;
        spawnNextPiece();
    } else {
        const oldCurrentPiece = gameState.currentPiece;
        gameState.currentPiece = gameState.holdPiece;
        gameState.holdPiece = oldCurrentPiece;
        setSpawnPosition(gameState.currentPiece);
        if (!canPlacePiece(gameState.currentPiece)) {
            endGame();
            return;
        }
    }
    if (gameState.isGameOver) {
        return;
    }
    gameState.canHold = false;
    renderGame();
}

function togglePause() {
    if (gameState.isGameOver) {
        return;
    }
    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
        stopDropLoop();
        showOverlay("pause-overlay");
        return;
    }
    hideOverlay("pause-overlay");
    hideOverlay("settings-overlay");
    startDropLoop();
}

function endGame() {
    if (gameState.isGameOver) {
        return;
    }
    gameState.isGameOver = true;
    stopDropLoop();
    saveHighScore(gameState.score);
    renderHighScoreList();
    renderGameOverScores();
    showOverlay("game-over-overlay");
}

// menu chọn màn
function getSelectedLevel() {
    const selectedInput = document.querySelector(
        'input[name="level"]:checked'
    );

    return selectedInput ? Number(selectedInput.value) : 1;
}

function prepareLevelOptions() {
    const levelInputs = Array.from(document.querySelectorAll('input[name="level"]'));
    let hasSelectedLevel = false;
    levelInputs.forEach((input, index) => {
        input.value = String(index + 1);
        if (input.checked && !hasSelectedLevel) {
            hasSelectedLevel = true;
        } else {
            input.checked = false;
        }
        input.addEventListener("change", () => {
            if (input.checked) {levelInputs.forEach(otherInput => {
                    if (otherInput !== input) {
                        otherInput.checked = false;}});
            } else if (!levelInputs.some(otherInput => otherInput.checked)) {
                input.checked = true;
            }
            updateLevelNote(getSelectedLevel());
        });
    });

    if (levelInputs.length > 0 && !levelInputs.some(input => input.checked)) {
        levelInputs[0].checked = true;
    }
    updateLevelNote(getSelectedLevel());
}

function updateLevelNote(level) {
    const noteLevel = document.querySelector(".note-level");
    const noteTitle = document.querySelector(".note-content h3");
    const noteParagraphs = document.querySelectorAll(".note-content p");
    const note = LEVEL_NOTES[level];
    if (noteLevel) {
        noteLevel.textContent = `MÀN ${level}`;
    }
    if (!note) {
        if (noteTitle) {
            noteTitle.textContent = "CHƯA TRIỂN KHAI";
        }
        noteParagraphs.forEach((paragraph, index) => {
            paragraph.textContent = index === 0 ? "Màn chơi này chưa được triển khai. Hiện tại chỉ có Màn 1 hoạt động." : "";});

        return;
    }
    if (noteTitle) {
        noteTitle.textContent = note.title;
    }
    noteParagraphs.forEach((paragraph, index) => {
        paragraph.textContent = note.paragraphs[index] || "";
    });
}

function initializeMenu() {
    if (!getElement("play-button")) {
        return;
    }
    prepareLevelOptions();
    renderHighScoreList();
    addClickEvent("play-button", () => {
        const selectedLevel = getSelectedLevel();
        window.location.href = `./game.html?level=${selectedLevel}`;
    });
    addClickEvent("settings-button", () => {
        try {
            sessionStorage.setItem("openSettingsOnStart", "true");
        } catch (error) {
        }
        window.location.href = `./game.html?level=${getSelectedLevel()}`;
    });
}

// di chuyển, điều khiển
function initializeGameControls() {
    document.addEventListener("keydown", event => {
        switch (event.code) {
            case "ArrowLeft":
                event.preventDefault();
                reverseButtons(-1);
                break;

            case "ArrowRight":
                event.preventDefault();
                reverseButtons(1);
                break;

            case "ArrowDown":
                event.preventDefault();
                if(gameState.selectedLevel === 2){
                    rotateCurrentPiece();
                }else {
                    dropPiece();
                }
                break;

            case "ArrowUp":
                event.preventDefault();
                if (gameState.selectedLevel === 2) {
                    dropPiece();
                }else{
                    rotateCurrentPiece();
                }
                break;

            case "Space":
                event.preventDefault();
                hardDrop();
                break;

            case "KeyC":
                holdCurrentPiece();
                break;

            case "KeyP":
                togglePause();
                break;
        }
    });
    addClickEvent("pause-button", togglePause);
    addClickEvent("resume-button", togglePause);
    addClickEvent("replay-button", startGame);
    addClickEvent("home-button", () => {window.location.href = "./index.html";});
    addClickEvent("exit-button", () => {window.location.href = "./index.html";});
    addClickEvent("pause-settings-button", () => {hideOverlay("pause-overlay");showOverlay("settings-overlay");});
    addClickEvent("setting-back-button", () => {hideOverlay("settings-overlay");showOverlay("pause-overlay");});
    addClickEvent("reset-score-button", resetHighScores);
    addClickEvent("more-games-button", () => {alert("Các màn chơi tiếp theo chưa được triển khai.");});
}

function initializeGamePage() {
    if (!gameBoardElement) {
        return;
    }
    const param = new URLSearchParams(window.location.search);
    const requestedLevel = Number(param.get("level"));
    if([1, 2, 3, 4, 5, 6].includes(requestedLevel)) {
        gameState.selectedLevel = requestedLevel;
    }else{
        gameState.selectedLevel = 1;
    }
    initializeGameControls();
    startGame();
    let shouldOpenSettings = false;
    try {
        shouldOpenSettings = sessionStorage.getItem("openSettingsOnStart") === "true";
        sessionStorage.removeItem("openSettingsOnStart");
    } catch (error) {
        shouldOpenSettings = false;
    }
    if (shouldOpenSettings) {
        togglePause();
        hideOverlay("pause-overlay");
        showOverlay("settings-overlay");
    }
}

// âm thanh
const clearLineSound = new Audio("../sounds/clear-line.mp3");
clearLineSound.volume = 0.6;

function playClearLineSound(){
    const soundSetting = document.querySelector(".sound-setting");
    if(soundSetting && !soundSetting.checked){
        return;
    }
    clearLineSound.currentTime = 0;
    clearLineSound.play().catch(error =>{
        console.warn("Không thể phát âm xóa hàng:", error);
    });
}

function clearLinesAndUpdateScore(){
    const clearedLines = clearFullLines();
    if(clearedLines === 0){
        return;
    }
    displayLockedBoard(2000);
    playClearLineSound();
    const scoreByLines = [0, 100, 300, 500, 800];
    gameState.lines += clearedLines;
    gameState.score += scoreByLines[clearedLines] || 0;
}

initializeMenu();
initializeGamePage();