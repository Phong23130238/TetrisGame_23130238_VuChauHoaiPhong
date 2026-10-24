// ttinh
const ROWS = 20;
const COLS = 10;
const DROP_INTERVAL = 700;
const NEXT_COUNT = 3;
const PREVIEW_SIZE = 4;
const HIGH_SCORE_KEY = "tetrisHighScores";
// 5
const GRAY_COLOR = "#858585";
// 6
const SHIELD_DELAY = 3000;
const SHIELD_TICK = 100;
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
        title: "LV3 - KHỐI TÀNG HÌNH",
        paragraphs: [
            "Trong màn này, khối đã rơi xuống và khóa chỉ hiển thị trong 1,5 giây sau đó bị ẩn đi.",
            "Để hiển thị các khối trước đó người chơi cần:",
            "-Xóa hàng, bàn cờ hiện lại trong 2 giây. Hard Drop khóa khối, bàn cờ hiện lại trong 1,5 giây."
        ]
    },
    4: {
        title: "LV4 - RÁC TRỒI LÊN & TỰ ĐỘNG XOAY",
        paragraphs: [
            "Sau mỗi 4 giây không xóa được hàng, một hàng rác sẽ trồi lên từ đáy bàn cờ. Hàng rác có một ô trống ngẫu nhiên và đẩy các hàng phía trên lên.",
            "Khối đang rơi tự xoay theo chiều kim đồng hồ sau mỗi 0,5 giây. Người chơi không thể xoay khối thủ công.",
            "Người chơi có thể di chuyển khối sang trái/phải, tăng tốc độ rơi bằng phím xuống và thả khối nhanh bằng Space. Xóa ít nhất một hàng sẽ đặt lại bộ đếm rác.",
            "Tránh để các khối bị đẩy vượt khỏi đỉnh bàn cờ hoặc khiến bạn không còn vị trí hợp lệ để tiếp tục."
        ]
    },
    5: {
        title: "LV5 - KHỐI CÙNG MÀU",
        paragraphs: [
            "Các khối Color và Gray xuất hiện luân phiên; khối xám có thể hấp thụ màu khi tiếp xúc theo khối có màu khác.",
            "Chỉ hàng đầy gồm 10 ô cùng màu hợp lệ mới được xóa.",
            "Hàng đầy sai màu có thể được giải cứu khi người chơi xóa hàng giống màu trùng màu mục tiêu. Mỗi hàng chỉ có một cơ hội giải cứu.",
            "Màu mục tiêu: nếu 1 hàng đã đầy nhưng có 2 hoặc nhiều màu khác nhau trong cùng hàng, màu chiếm số lượng ô ít nhất là màu mục tiêu."
        ]
    },
    6: {
        title: "LV6 - KHÓA KHỐI BẰNG KHIÊN",
        paragraphs: [
            "Mỗi khối bắt đầu đếm 3 giây kể từ khi được khóa xuống bàn cờ, sau 3 giây nhận khiên bảo vệ. Khiên phát sáng theo màu gốc của khối.",
            "Hàng đầy không có khối được bảo vệ sẽ bị xóa bình thường.",
            "Nếu hàng có khối được bảo vệ cùng màu, các ô được bảo vệ được giữ lại. Nếu hàng đầy và có nhiều màu khiên khác nhau, toàn bộ hàng được xóa.",
            "Phá khiên cộng hưởng màu: phá khiên của các khối cùng màu ở nơi khác trên bàn cờ. Thời gian khi mở menu tạm dừng không được tính vào bộ đếm."
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
    isLevelComplete: false,
    timer: null,
// 3
    boardVisibleUntil: [],
    displayBoardUntil: 0,
    visibilityTimer: null,
// 4
    garbageTimer: null,
    autoRotateTimer: null,
    lastLineClearTime: 0,
// 5
    boardPieceIds: [],
    boardGreyCells: [],
    rescueRows: [],
    nextPieceIsGray: null,
    nextPieceId: 0,
// 6
    shieldTimer: null,
    shieldStages: {}
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
        y: 0,
        pieceId: ++gameState.nextPieceId,
        isGray: false
    };
}

// 5
function createPieceForCurrentLevel(){
    const piece = createRandomPiece();
    if(gameState.selectedLevel !== 5){
        return piece;
    }
    if(gameState.nextPieceIsGray === null){
        gameState.nextPieceIsGray = Math.random() < 0.5;
    }
    piece.isGray = gameState.nextPieceIsGray;
    if(piece.isGray){
        piece.color = GRAY_COLOR;
    }
    gameState.nextPieceIsGray = !gameState.nextPieceIsGray;
    return piece;
}

function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}
// 5
function createEmptyPieceIdBoard(){
    return Array.from({length : ROWS}, () => Array(COLS).fill(null));
}

function createEmptyGreyBoard(){
    return Array.from({length : ROWS}, () => Array(COLS).fill(false));
}

function createEmptyRescueRow(){
    return Array(ROWS).fill(null);
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

// 4
// cơ chế 1_ hàng rác
function createGarbageRow(){
    const emptyCol = Math.floor(Math.random() * COLS);
    return Array.from({length: COLS}, (_, col) => col === emptyCol ? null : "#777777");
}

function addGarbageRow(){
    if(gameState.selectedLevel !== 4 || gameState.isPaused || gameState.isGameOver){
        return;
    }
    const removedRow = gameState.board.shift();
    gameState.boardVisibleUntil.shift();
    gameState.boardPieceIds.shift();
    gameState.boardGreyCells.shift();
    gameState.rescueRows.shift();
    gameState.board.push(createGarbageRow());
    gameState.boardVisibleUntil.push(Array(COLS).fill(0));
    gameState.boardPieceIds.push(Array(COLS).fill(null));
    gameState.boardGreyCells.push(Array(COLS).fill(false));
    gameState.rescueRows.push(null);
    if(removedRow.some(cell => cell !== null)){
        renderGame();
        endGame();
        return;
    }
    if(gameState.currentPiece && !canPlacePiece(gameState.currentPiece)) {
        while(gameState.currentPiece.y > -gameState.currentPiece.shape.length && !canPlacePiece(gameState.currentPiece)){
            gameState.currentPiece.y--;
        }
        if(!canPlacePiece(gameState.currentPiece)){
            renderGame();
            endGame();
            return;
        }
    }
    renderGame();
}

function startGarbageTimer(){
    stopGarbageTimer();
    gameState.lastLineClearTime = Date.now();
    gameState.garbageTimer = window.setInterval(() => {
        if(gameState.selectedLevel !== 4 || gameState.isPaused || gameState.isGameOver){
            return;
        }
        const elapsed = Date.now() - gameState.lastLineClearTime;
        if(elapsed >= 4000){
            addGarbageRow();
            gameState.lastLineClearTime = Date.now();
        }
    }, 100);
}

function stopGarbageTimer(){
    if(gameState.garbageTimer !== null){
        clearInterval(gameState.garbageTimer);
        gameState.garbageTimer = null;
    }
}

// cơ chế 2_tự rotate
function autoRotatePiece(){
    if(gameState.selectedLevel !== 4 || gameState.isPaused || gameState.isGameOver || !gameState.currentPiece){
        return;
    }
    const piece = gameState.currentPiece;
    const oldShape = piece.shape;
    const oldX = piece.x;
    const oldY = piece.y;
    piece.shape = rotateMatrix(oldShape);
    const offsets = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2,0], [0, -1]];
    for(const [offsetX, offsetY] of offsets){
        piece.x = oldX + offsetX;
        piece.y = oldY + offsetY;
        if(canPlacePiece(piece)){
            renderGame();
            return;
        }
        piece.shape = oldShape;
        piece.x = oldX;
        piece.y = oldY;
        renderGame();
    }
}

function startAutoRotateTimer(){
    stopAutoRotateTimer();
    if(gameState.selectedLevel !== 4){
        return;
    }
    gameState.autoRotateTimer = window.setInterval(() => {
        autoRotatePiece();
    }, 500);
}

function stopAutoRotateTimer(){
    if(gameState.autoRotateTimer !== null){
        clearTimeout(gameState.autoRotateTimer);
        gameState.autoRotateTimer = null;
    }
}

function scheduleAutoRotate(){
    stopAutoRotateTimer();
    if(gameState.selectedLevel !== 4 || gameState.isPaused || gameState.isGameOver){
        return;
    }
    gameState.autoRotateTimer = window.setTimeout(() => {
        autoRotatePiece();
        scheduleAutoRotate();
    }, 500);
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
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
                continue;
            }
            gameState.board[y][x] = piece.color;
            gameState.boardPieceIds[y][x] = piece.pieceId;
            gameState.boardGreyCells[y][x] = gameState.selectedLevel === 5 && piece.isGray;
            gameState.boardVisibleUntil[y][x] = gameState.selectedLevel === 3 ? visibleUntil : 0;
        }
    }
    if(gameState.selectedLevel === 6 && hasPieceOnBoard(piece.pieceId)){
        gameState.shieldStages[piece.pieceId] = {status: "charging", elapsed: 0, color: piece.color};
    }
}

function clearFullLines() {
    if(gameState.selectedLevel === 5){
        return clearFullLinesLevel5();
    }
    if(gameState.selectedLevel === 6){
        return clearFullLinesLevel6();
    }
    const remainingRows = [];
    for(let row = 0; row < ROWS; row++) {
        if (gameState.board[row].some(cell => cell === null)){
            remainingRows.push(row);
        }
    }
    const clearedLines = ROWS - remainingRows.length;
    gameState.board = remainingRows.map(row => gameState.board[row]);
    gameState.boardVisibleUntil = remainingRows.map(row => gameState.boardVisibleUntil[row]);
    gameState.boardPieceIds = remainingRows.map(row => gameState.boardPieceIds[row]);
    gameState.boardGreyCells = remainingRows.map(row => gameState.boardGreyCells[row]);
    gameState.rescueRows = remainingRows.map(row => gameState.rescueRows[row]);
    while(gameState.board.length < ROWS){
        gameState.board.unshift(Array(COLS).fill(null));
        gameState.boardVisibleUntil.unshift(Array(COLS).fill(0));
        gameState.boardPieceIds.unshift(Array(COLS).fill(null));
        gameState.boardGreyCells.unshift(Array(COLS).fill(false));
        gameState.rescueRows.unshift(null);
    }
    return clearedLines;
}
// 5
function isSameColorRow(row){
    const cells = gameState.board[row];
    if(cells.some(color => color === null)){
        return false;
    }
    if(cells.some((color, col) => gameState.boardGreyCells[row][col] || !COLORS.includes(color))){
        return false;
    }
    return cells.every(color => color === cells[0]);
}

function getRescueTargetColors(row){
    const cells = gameState.board[row];
    if(cells.some(color => color === null) || cells.some((color, col) => gameState.boardGreyCells[row][col] || !COLORS.includes(color))){
        return null;
    }
    const counts = new Map();
    for(const color of cells){
        counts.set(color, (counts.get(color) || 0) + 1);
    }
    if(counts.size <= 1){
        return null;
    }
    const minimum = Math.min(...counts.values());
    return COLORS.filter(color => counts.has(color) && counts.get(color) === minimum);
}

function clearFullLinesLevel5(){
    const clearRows = [];
    for(let row = 0; row < ROWS; row++) {
        if(isSameColorRow(row)){
            clearRows.push(row);
        }
    }
    const clearedColors = clearRows.map(row => gameState.board[row][0]);
    const clearSet = new Set(clearRows);
    if(clearRows.length > 0){
        for(let row = 0; row < ROWS; row++) {
            const rescue = gameState.rescueRows[row];
            if(!rescue || rescue.status !== "pending"){
                continue;
            }
            const matchingColors = [...new Set(clearedColors.filter(color => rescue.targetColors.includes(color)))];
            if(matchingColors.length > 0){
                for(let col = 0; col < COLS; col++) {
                    if(matchingColors.includes(gameState.board[row][col])){
                        gameState.board[row][col] = null;
                        gameState.boardPieceIds[row][col] = null;
                        gameState.boardGreyCells[row][col] = false;
                    }
                }
                gameState.rescueRows[row] = null;
            }else{
                gameState.rescueRows[row] = {status: 'expired', targetColors: rescue.targetColors.slice()};
            }
        }
    }
    const remainingRows = [];
    for(let row = 0; row < ROWS; row++) {
        if(!clearSet.has(row)){
            remainingRows.push(row);
        }
    }
    gameState.board = remainingRows.map(row => gameState.board[row]);
    gameState.boardPieceIds = remainingRows.map(row => gameState.boardPieceIds[row]);
    gameState.boardGreyCells = remainingRows.map(row => gameState.boardGreyCells[row]);
    gameState.boardVisibleUntil = remainingRows.map(row => gameState.boardVisibleUntil[row]);
    gameState.rescueRows = remainingRows.map(row => gameState.rescueRows[row]);
    while(gameState.board.length < ROWS){
        gameState.board.unshift(Array(COLS).fill(null));
        gameState.boardPieceIds.unshift(Array(COLS).fill(null));
        gameState.boardGreyCells.unshift(Array(COLS).fill(false));
        gameState.boardVisibleUntil.unshift(Array(COLS).fill(0));
        gameState.rescueRows.unshift(null);
    }
    for(let row = 0; row < ROWS; row++) {
        if(gameState.rescueRows[row] !== null){
            continue;
        }
        const targets = getRescueTargetColors(row);
        if(targets !== null){
            gameState.rescueRows[row] = {status: 'pending', targetColors: targets};
        }
    }
    return clearRows.length;
}

function setSpawnPosition(piece) {
    piece.x = Math.floor((COLS - piece.shape[0].length) / 2);
    piece.y = 0;
}

// 6
function hasPieceOnBoard(pieceId){
    return gameState.boardPieceIds.some(row => row.includes(Number(pieceId)));
}

function stopShieldTimer() {
    if (gameState.shieldTimer !== null) {
        clearInterval(gameState.shieldTimer);
        gameState.shieldTimer = null;
    }
}

function updateShieldStatus(){
    let shieldChanged = false;
    for(const pieceId of Object.keys(gameState.shieldStages)){
        const shield = gameState.shieldStages[pieceId];
        if(shield.status !== "charging"){
            continue;
        }
        if(!hasPieceOnBoard(pieceId)){
            delete gameState.shieldStages[pieceId];
            continue;
        }
        shield.elapsed += SHIELD_TICK;
        if(shield.elapsed >= SHIELD_DELAY){
            shield.status = "active";
            shieldChanged = true;
        }
    }
    if(shieldChanged){
        renderGame();
    }
}

function getActiveShield(pieceId){
    if(pieceId === null && pieceId === undefined){
        return null;
    }
    const shield = gameState.shieldStages[pieceId];
    return shield && shield.status === "active" ? shield : null;
}

function classifyShieldRow(row){
    const protectedPieceId = new Set();
    const shieldColor = new Set();
    for(let col = 0; col < COLS; col++) {
        const pieceId = gameState.boardPieceIds[row][col];
        const shield = getActiveShield(pieceId);
        if(shield){
            protectedPieceId.add(Number(pieceId));
            shieldColor.add(shield.color);
        }
    }
    let type = "normal";
    if(shieldColor.size === 1){
        type = "partial";
    }else if(shieldColor.size > 1){
        type = "multi-color";
    }
    return {row, type, protectedPieceId, color: [...shieldColor]};
}

function breakShieldByColors(colors){
    const colorSet = new Set(colors);
    for(const shield of Object.values(gameState.shieldStages)){
        if(shield.status === "active" && colorSet.has(shield.color)){
            shield.status = "broken";
        }
    }
}

function clearFullLinesLevel6(){
    const fullRows = [];
    for(let row = 0; row < ROWS; row++) {
        if (gameState.board[row].every(cell => cell !== null)) {
            fullRows.push(classifyShieldRow(row));
        }
    }
    if(fullRows.length === 0){
            return 0;
    }
    const linkedColors = new Set();
    for(const rowInfo of fullRows){
        if(rowInfo.type !== "normal"){
            rowInfo.color.forEach(color => {linkedColors.add(color)} );
        }
    }
    breakShieldByColors([...linkedColors]);
    const rowsToRemove = new Set();
    for(const rowInfo of fullRows){
        if(rowInfo.type !== "partial"){
            rowsToRemove.add(rowInfo.row);
            continue;
        }
        for(let col = 0; col < COLS; col++) {
            const pieceId = gameState.boardPieceIds[rowInfo.row][col];
            if(!rowInfo.protectedPieceId.has(pieceId)){
                gameState.board[rowInfo.row][col] = null;
                gameState.boardPieceIds[rowInfo.row][col] = null;
                gameState.boardGreyCells[rowInfo.row][col] = false;
                gameState.boardVisibleUntil[rowInfo.row][col] = 0;
            }
        }
    }
    const remainingRows = [];
    for(let row = 0; row < ROWS; row++) {
        if(!rowsToRemove.has(row)){
            remainingRows.push(row);
        }
    }
    gameState.board = remainingRows.map( row => gameState.board[row] );
    gameState.boardPieceIds = remainingRows.map(row => gameState.boardPieceIds[row]);
    gameState.boardGreyCells = remainingRows.map(row => gameState.boardGreyCells[row]);
    gameState.boardVisibleUntil = remainingRows.map(row => gameState.boardVisibleUntil[row]);
    gameState.rescueRows = remainingRows.map(row => gameState.rescueRows[row]);
    while(gameState.board.length < ROWS){
        gameState.board.unshift(Array(COLS).fill(null));
        gameState.boardPieceIds.unshift(Array(COLS).fill(null));
        gameState.boardGreyCells.unshift(Array(COLS).fill(false));
        gameState.boardVisibleUntil.unshift(Array(COLS).fill(0));
        gameState.rescueRows.unshift(null);
    }
    for(const pieceId of Object.keys(gameState.shieldStages)){
        if(!hasPieceOnBoard(pieceId)){
            delete gameState.shieldStages[pieceId];
        }
    }
    return rowsToRemove.size;
}

function startShieldTimer(){
    if(gameState.selectedLevel !== 6 || gameState.isPaused || gameState.isGameOver || gameState.shieldTimer !== null){
        return;
    }
    gameState.shieldTimer = window.setInterval(updateShieldStatus, SHIELD_TICK);
}

function fillNextQueue() {
    while (gameState.nextQueue.length < NEXT_COUNT) {
        gameState.nextQueue.push(createPieceForCurrentLevel());
    }
}

function spawnNextPiece() {
    fillNextQueue();
    gameState.currentPiece = gameState.nextQueue.shift();
    gameState.nextQueue.push(createPieceForCurrentLevel());
    if (!gameState.currentPiece || !gameState.currentPiece.shape) {
        console.error("Không thể tạo khối mới:", gameState.currentPiece);
        endGame();
        return;
    }
    setSpawnPosition(gameState.currentPiece);
    if (!canPlacePiece(gameState.currentPiece)) {
        endGame();
        return;
    }
    if(gameState.selectedLevel === 4){
        scheduleAutoRotate();
    }
}
// 5
function processColorAbsortion() {
    if (gameState.selectedLevel !== 5) {
        return;
    }
    const piece = gameState.currentPiece;
    if (!piece) {
        return;
    }
    if (piece.isGray) {
        const colorCounts = new Map();
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col] === 0) {
                    continue;
                }
                const x = piece.x + col;
                const y = piece.y + row;
                const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                for (const [nx, ny] of neighbors) {
                    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
                        continue;
                    }
                    const neighborColor = gameState.board[ny][nx];
                    const isNeighborGray = gameState.boardGreyCells[ny][nx];
                    if (neighborColor !== null && !isNeighborGray && COLORS.includes(neighborColor)) {
                        const count = colorCounts.get(neighborColor) || 0;
                        colorCounts.set(neighborColor, count + 1);
                    }
                }
            }
        }

        let selectedColor = null;
        let highestCount = 0;
        for (const color of COLORS) {
            const count = colorCounts.get(color) || 0;
            if (count > highestCount) {
                highestCount = count;
                selectedColor = color;
            }
        }
        if (selectedColor !== null) {
            piece.color = selectedColor;
            piece.isGray = false;
        }
    }
    if (!piece.isGray) {
        const touchedGreyPieceIds = new Set();
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if(piece.shape[row][col] === 0) {
                    continue;
                }
                const x = piece.x + col;
                const y = piece.y + row;
                const neighbors = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
                for (const [nx, ny] of neighbors) {
                    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
                        continue;
                    }
                    const neighborPieceId  = gameState.boardPieceIds[ny][nx];
                    const isNeighborGray = gameState.boardGreyCells[ny][nx];
                    if (isNeighborGray && neighborPieceId !== null) {
                        touchedGreyPieceIds.add(neighborPieceId);
                    }
                }
            }
        }
        if(touchedGreyPieceIds.size > 0) {
            for(let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const pieceId = gameState.boardPieceIds[row][col];
                    if(touchedGreyPieceIds.has(pieceId) && gameState.boardGreyCells[row][col]) {
                        gameState.board[row][col] = piece.color;
                        gameState.boardGreyCells[row][col] = false;
                    }
                }
            }
        }
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
            // 6
            const pieceId = gameState.boardPieceIds[row][col];
            const shield = gameState.selectedLevel === 6? getActiveShield(pieceId): null;
            const showShield = color !== null && shouldShow && shield !== null;
            cell.classList.toggle("shielded-cell", showShield);
            if(showShield){
                cell.style.setProperty("--shield-color", shield.color);
            }else {
                cell.style.removeProperty("--shield-color");
            }
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

function goToLevel(level){
    if(!Number.isInteger(level) || level < 1 || level > 6){
        return;
    }
    window.location.href = `./game.html?level=${level}`;
}

let hackReturnOverlayId = "pause-overlay";

function openHackLevelMenu(returnOverlayId){
    hackReturnOverlayId = returnOverlayId;
    hideOverlay(returnOverlayId);
    showOverlay("hack-level-overlay");
}

function closeHackLevelMenu(){
    hideOverlay("hack-level-overlay");
    showOverlay(hackReturnOverlayId);
}

function completeLevel(){
    if(gameState.isLevelComplete || gameState.isGameOver){
        return;
    }
    gameState.isLevelComplete = true;
    gameState.isPaused = true;
    stopDropLoop();
    stopGarbageTimer();
    stopAutoRotateTimer();
    stopShieldTimer();
    hideOverlay("pause-overlay");
    hideOverlay("settings-overlay");
    hideOverlay("hack-level-overlay");
    hideOverlay("game-over-overlay");
    const nextButton = getElement("next-level-button");
    if(nextButton){
        const hasNextLevel = gameState.selectedLevel < 6;
        nextButton.disabled = !hasNextLevel;
        nextButton.innerHTML = hasNextLevel ? '<i class="fa-solid fa-arrow-right"></i> MÀN TIẾP THEO' : "ĐÃ HOÀN THÀNH LEVEL CUỐI";
    }
    showOverlay("level-complete-overlay");
    renderGame();
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
    stopShieldTimer(); // 6
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
    gameState.isLevelComplete = false;
// 5
    gameState.boardPieceIds = createEmptyBoard();
    gameState.boardGreyCells = createEmptyGreyBoard();
    gameState.rescueRows = createEmptyRescueRow();
    gameState.nextPieceIsGray = null;
    gameState.nextPieceId = 0;
    gameState.shieldStages = {}; // 6

    hideOverlay("pause-overlay");
    hideOverlay("settings-overlay");
    hideOverlay("game-over-overlay");
    hideOverlay("hack-level-overlay");
    hideOverlay("level-complete-overlay");

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
    if(gameState.selectedLevel === 4 && !gameState.isGameOver) {
        startGarbageTimer();
        scheduleAutoRotate();
    }
    if(gameState.selectedLevel === 6 && !gameState.isGameOver) {
        startShieldTimer();
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
    processColorAbsortion();
    renderGame();
}
//2
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
        processColorAbsortion();
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
    processColorAbsortion();
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
    if (!gameState.currentPiece || gameState.isGameOver || gameState.isLevelComplete) {
        return;
    }
    processColorAbsortion();
    mergePiece(gameState.currentPiece);
    clearLinesAndUpdateScore();
    if(gameState.isLevelComplete){
        renderGame();
        return;
    }
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
    if (gameState.isGameOver || gameState.isLevelComplete) {
        return;
    }
    gameState.isPaused = !gameState.isPaused;
    if (gameState.isPaused) {
        stopDropLoop();
        stopGarbageTimer();
        stopAutoRotateTimer();
        stopShieldTimer();
        showOverlay("pause-overlay");
        return;
    }
    hideOverlay("pause-overlay");
    hideOverlay("settings-overlay");
    startDropLoop();
    if(gameState.selectedLevel === 4){
        startGarbageTimer();
        scheduleAutoRotate();
    }
    if(gameState.selectedLevel === 6){
        startShieldTimer();
    }
}

function endGame() {
    if (gameState.isGameOver || gameState.isLevelComplete) {
        return;
    }
    gameState.isGameOver = true;
    stopDropLoop();
    stopGarbageTimer();
    stopAutoRotateTimer();
    stopShieldTimer();
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
                if(gameState.selectedLevel !== 4) {
                    if (gameState.selectedLevel === 2) {
                        dropPiece();
                    } else {
                        rotateCurrentPiece();
                    }
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
    addClickEvent("pause-replay-button", startGame);
    addClickEvent("hack-level-button", () => {openHackLevelMenu("pause-overlay");});
    addClickEvent("hack-level-back-button", closeHackLevelMenu);
    document.querySelectorAll(".hack-level-option").forEach(button => {
        button.addEventListener("click", () => {
            const level = Number(button.dataset.level);
            goToLevel(level);
        });
    });
    addClickEvent("complete-home-button", () => {window.location.href = "./index.html";});
    addClickEvent("complete-replay-button", startGame);
    addClickEvent("next-level-button", () => {
        const nextLevel = gameState.selectedLevel + 1;
        goToLevel(nextLevel);
    });
    addClickEvent("complete-hack-level-button", () => {openHackLevelMenu("level-complete-overlay");});
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
    if(gameState.selectedLevel === 4){
        gameState.lastLineClearTime = Date.now();
    }
    displayLockedBoard(2000);
    playClearLineSound();
    const scoreByLines = [0, 100, 300, 500, 800];
    gameState.lines += clearedLines;
    gameState.score += scoreByLines[clearedLines] || 0;
    if (gameState.lines >= 20) {
        completeLevel();
    }
}

initializeMenu();
initializeGamePage();