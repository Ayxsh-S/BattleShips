import "./style.css";

class Ship {
    constructor(length, timesHit = 0, sunk = false, name = "") {
        this.length = length;
        this.timesHit = timesHit;
        this.sunk = sunk;
        this.name = name;
        this.hitCells = [];
    }
    hit(x, y) {
        this.timesHit += 1;
        this.hitCells.push([x,y]);
    }
    isSunk() {
        this.sunk = this.timesHit === this.length;
    }
    isHitAt(x,y) {
        return this.hitCells.some(([hx,hy]) => hx === x && hy === y);
    }
}

class GameBoard {
    constructor(size = 10) {
        this.size = size;
        this.board = Array.from({ length: size }, () => Array(size).fill(null));
        this.ships = [];
        this.missedShots = [];
    }
    placeShip(ship, x, y, isHorizontal = false) {
        if (isHorizontal) {
            if (x + ship.length > this.size) return false;
            for (let i = 0; i < ship.length; i++) {
                if (this.board[y][x+i]!== null) return false;
            }
            for (let i = 0; i < ship.length; i++) {
                this.board[y][x+i] = ship;
            }
        } else {
                if (y + ship.length > this.size) return false;
                for (let i = 0; i < ship.length; i++) {
                     if (this.board[y+i][x]!== null) return false;
                }
                for (let i = 0; i < ship.length; i++) {
                this.board[y+i][x] = ship;
            }
        }
        this.ships.push(ship);
        return true;
    }
    receiveHit(x, y) {
        const target = this.board[y][x];
        if (target === null) {
            this.missedShots.push([x, y]);
            return { result: "miss", ship: null };
        } else {
            target.hit(x, y);
            target.isSunk();
            return { result: target.sunk ? "ship sunk" : "hit", ship: target };
        }
    }
    allShipsSunk() {
        return this.ships.every(ship => ship.sunk);
    }
}

class Player {
    constructor(name) {
        this.name = name;
        this.gameboard = new GameBoard();
        this.isTurn = false;
        this.placedShips = 0;
    }
}

// module.exports = { Ship, GameBoard, Player };
const board = document.getElementById("gameboard");
const gameboard = new GameBoard();
board.classList.remove("board-glow");
let player1 = new Player("Player 1");
let player2 = new Player("Player 2");
let currentPlayer = "player1";
const secondgameboard = new GameBoard();

for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;
        board.appendChild(cell);
    }
}

let draggedShip = null;

function initaliseShip(ship) {
    const length = parseInt(ship.dataset.length);
    if (ship.dataset.orientation === "horizontal") {
        ship.style.width = `${length * 40}px`;
        ship.style.height = "40px";
    } else {
        ship.style.height = `${length * 40}px`;
        ship.style.width = "40px";
    }
    
    ship.addEventListener("dragstart", () => {
        draggedShip = ship;
        ship.classList.add("dragging");
    });
    ship.addEventListener("dragend", () => {
        draggedShip = null;
        ship.classList.remove("dragging");
    });
    const rotateBtn = ship.closest(".wrapper").querySelector(".rotate-btn");
    rotateBtn.addEventListener("click", () => {
        if (ship.dataset.orientation === "horizontal") {
            ship.dataset.orientation = "vertical";
            ship.classList.remove("horizontal");
            ship.classList.add("vertical");
            ship.style.height = `${length * 40}px`;
            ship.style.width = "40px";
        }
        else {
            ship.dataset.orientation = "horizontal";
            ship.classList.remove("vertical");
            ship.classList.add("horizontal");
            ship.style.width = `${length * 40}px`;
            ship.style.height = "40px";
        }
    });
}

document.querySelectorAll(".ship").forEach(ship => initaliseShip(ship));

function attachEventListeners(boardElement) {
boardElement.querySelectorAll(".cell").forEach(cell => {
    cell.addEventListener("dragover", e => {
        e.preventDefault();
        if (!draggedShip) return;
        boardElement.querySelectorAll(".cell").forEach(cell => cell.classList.remove("highlight", "invalid"));
        const length = parseInt(draggedShip.dataset.length);
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const horizontal = draggedShip.dataset.orientation === "horizontal";
        let valid = true;
        const cellsToHighlight = [];
        for (let i = 0; i < length; i++) {
            const cx = horizontal ? x + i : x;
            const cy = horizontal ? y : y + i;
            const targetCell = boardElement.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);
            if (!targetCell || targetCell.classList.contains("ship")) {
                valid = false;
            }
            if (targetCell) cellsToHighlight.push(targetCell);
        }
        cellsToHighlight.forEach(cell => cell.classList.add(valid ? "highlight" : "invalid"));
    });
    cell.addEventListener("dragleave", () => {
        boardElement.querySelectorAll(".cell").forEach(cell => cell.classList.remove("highlight", "invalid"));
    });
    cell.addEventListener("drop", e => {
        e.preventDefault();
        if (!draggedShip) return;
        boardElement.querySelectorAll(".cell").forEach(cell => cell.classList.remove("highlight", "invalid"));
        const length = parseInt(draggedShip.dataset.length);
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        const horizontal = draggedShip.dataset.orientation === "horizontal";
        const name = draggedShip.dataset.name;
        const ship = new Ship(length, 0, false, name);
        let activeGameBoard = currentPlayer === "player1" ? gameboard : secondgameboard;
        const placed = activeGameBoard.placeShip(ship, x, y, horizontal);
        if (!placed) {
            return;
        }
        for (let i = 0; i < length; i++) {
            const cx = horizontal ? x + i : x;
            const cy = horizontal ? y : y + i;
            const targetCell = boardElement.querySelector(`.cell[data-x="${cx}"][data-y="${cy}"]`);
            if (targetCell) {
                if (targetCell) targetCell.classList.add("ship");
                if (i === 0) targetCell.classList.add("ship-start");
                if (i === length - 1) targetCell.classList.add("ship-end");
            }
        }
        draggedShip.closest(".wrapper").remove();
        document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("highlight", "invalid"));
        if (currentPlayer === "player1") player1.placedShips++;
        if (currentPlayer === "player2") player2.placedShips++;
        updateConfirmBtn();
        updateTwoConfirmBtn();
    });
});
}
const boards = document.querySelectorAll("#gameboard, #aigameboard, #second-gameboard");
boards.forEach(board => {
    board.addEventListener("mouseleave", () => {
        board.classList.add("no-hover");
    });
    board.addEventListener("mouseenter", () => {
        requestAnimationFrame(() => {
            board.classList.remove("no-hover");
        });
    });
})

const aigameboard = new GameBoard();
let playerTurn = false;
let hasWon = false;

function placeAiShips() {
    let tries = 0;
    const shipLengths = [{length: 5, name: "Aircraft Carrier"}, 
        {length: 4, name: "Battleship"}, 
        {length: 3, name: "Submarine"}, 
        {length: 3, name: "Cruiser"}, 
        {length: 2, name: "Destroyer"}];
    shipLengths.forEach(length => {
        let placed = false;
        while(!placed) {
            while (!placed && tries < 500) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const horizontal = Math.random() < 0.5;
            let name = length.name;
            const ship = new Ship(length.length, 0, false, length.name);
            placed = aigameboard.placeShip(ship, x, y, horizontal);
            tries++;
            }
        }
    });
}

const aiBoard = document.getElementById("ai-gameboard");
aiBoard.classList.remove("board-glow");
aiBoard.classList.add("hidden");
for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;
        aiBoard.appendChild(cell);
    }
}

const confirmBtn = document.querySelector(".confirmBtn");
const resetBtn = document.querySelector(".resetBtn");
let hasVisitedSecondBoard = false;

function updateConfirmBtn() {
    if (currentPlayer === "player1") {
        confirmBtn.disabled = player1.placedShips !== 5;
    }
}

function updateTwoConfirmBtn() {
    if (currentPlayer === "player2") {
        twoPlayerConfirmBtn.disabled = player2.placedShips !== 5;
        returnBtnTwo.disabled = player2.placedShips !== 5;
    }
}

updateConfirmBtn();
updateTwoConfirmBtn();

confirmBtn.addEventListener("click", () => {
    document.querySelectorAll(".ship").forEach(ship => {
        ship.draggable = false;
    });
    if (gameMode === "single") {
    board.classList.add("board-glow");
    document.getElementById("ship-container").classList.add("hidden");
    confirmBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");
    returnBtn.classList.add("hidden");
    aiBoard.classList.remove("hidden");
    placeAiShips();
    const shipCells = document.querySelectorAll(".cell.ship");
    shipCells.forEach(cell => {
        cell.classList.add("opaque");
    });
    if (!aiBoard.parentElement.classList.contains("ai-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("ai-wrapper");
        aiBoard.parentNode.insertBefore(wrapper, aiBoard);
        wrapper.appendChild(aiBoard);
    }
    updateBox("attack", "");
    setTimeout(() => {
        playerTurn = true;
        enableAttacks();
    }, 1000);
} else {
    attachEventListeners(secondBoard);
    currentPlayer = "player2";
    board.classList.add("hidden");
    secondBoard.classList.remove("hidden");
    secondBoardClass.classList.remove("hidden");
    document.getElementById("ship-container").classList.add("hidden");
    confirmBtn.classList.add("hidden");
    resetBtn.classList.add("hidden");
    returnBtn.classList.add("hidden");
    document.querySelector(".player-board").classList.add("hidden");
    document.querySelector(".second-board-btns").classList.remove("hidden");
    updateBox("Player 2 place your ships to start", "");
    returnBtnTwo.classList.remove("hidden");
    twoPlayerConfirmBtn.classList.remove("hidden");
    resetBtnTwo.classList.remove("hidden");
    document.getElementById("ship-container").classList.remove("hidden");
    if (!hasVisitedSecondBoard) {
        rebuildShipContainer();
        player2.placedShips = 0;
        updateTwoConfirmBtn();
    }
    hasVisitedSecondBoard = true;
}
});

function resetBoard(gameBoardID) {
    const gameBoard = gameBoardID === "gameboard" ? gameboard : secondgameboard;
    gameBoard.board = Array.from({ length: 10 }, () => Array(10).fill(null));
    gameBoard.ships = [];
    updateConfirmBtn();
    updateTwoConfirmBtn();
    document.querySelectorAll(`#${gameBoardID} .cell`).forEach(cell => {
        cell.classList.remove("ship", "ship-start", "ship-end");
    });
    if (gameBoardID === "gameboard") {
        player1.placedShips = 0;
    } else {
        player2.placedShips = 0;
    }
    const shipContainer = document.getElementById("ship-container");
    shipContainer.innerHTML = "";
    const shipLengths = [ {length: 5, name: "Aircraft Carrier"}, {length: 4, name: "Battleship"}, {length: 3, name: "Submarine"}, {length: 3, name: "Cruiser"}, {length: 2, name: "Destroyer"}];
    shipLengths.forEach(length => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");

        const ship = document.createElement("div");
        ship.classList.add("ship", "horizontal");
        ship.dataset.length = length.length;
        ship.dataset.orientation = "horizontal";
        ship.dataset.name = length.name;
        ship.draggable = true;
        ship.textContent = "🚢".repeat(length.length);

        const rotateBtn = document.createElement("button");
        rotateBtn.textContent = "Rotate ↻";
        rotateBtn.classList.add("rotate-btn");

        wrapper.appendChild(ship);
        wrapper.appendChild(rotateBtn);
        shipContainer.appendChild(wrapper);
        initaliseShip(ship);
        attachEventListeners(document.getElementById(gameBoardID));
    });
}

function rebuildShipContainer() {
    document.querySelectorAll("#second-gameboard .cell").forEach(cell => {
        cell.classList.remove("ship", "ship-start", "ship-end");
    });
    player2.placedShips = 0;
    updateConfirmBtn();
    const shipContainer = document.getElementById("ship-container");
    shipContainer.innerHTML = "";
    const shipLengths = [{length: 5, name: "Aircraft Carrier"}, 
        {length: 4, name: "Battleship"}, 
        {length: 3, name: "Submarine"}, 
        {length: 3, name: "Cruiser"}, 
        {length: 2, name: "Destroyer"}];
    shipLengths.forEach(length => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");

        const ship = document.createElement("div");
        ship.classList.add("ship", "horizontal");
        ship.dataset.length = length.length;
        ship.dataset.orientation = "horizontal";
        ship.dataset.name = length.name;
        ship.draggable = true;
        ship.textContent = "🚢".repeat(length.length);

        const rotateBtn = document.createElement("button");
        rotateBtn.textContent = "Rotate ↻";
        rotateBtn.classList.add("rotate-btn");

        wrapper.appendChild(ship);
        wrapper.appendChild(rotateBtn);
        shipContainer.appendChild(wrapper);
        initaliseShip(ship);
    });
}

resetBtn.addEventListener("click", () => resetBoard("gameboard"));
const resetBtnTwo = document.querySelector(".resetBtn2");
resetBtnTwo.addEventListener("click", () => resetBoard("second-gameboard"));

function enableAttacks() {
    board.classList.remove("board-glow");
    aiBoard.classList.remove("board-glow");
    if (playerTurn) board.classList.add("board-glow");
    const aiCells = document.querySelectorAll("#ai-gameboard .cell");
    aiCells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (!playerTurn) return;
            if (cell.classList.contains("hit") || cell.classList.contains("miss")) return;
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const targetShip = aigameboard.board[y][x];
            const { result, ship } = aigameboard.receiveHit(x, y);
            if (result === "ship sunk") {
                updateBox(`${ship.name} has sunk`, "sunk");
                sunkShipsAi(ship);
                cell.classList.add("hit");
            } else if (result === "hit") {
                cell.classList.add("hit");
                 updateBox("you hit a ship", "hit");
            } else {
                cell.classList.add("miss");
                 updateBox("you missed", "miss")
            }
            if (!aigameboard.allShipsSunk()) endPlayerTurn();
            if (aigameboard.allShipsSunk()) {
                setTimeout(() => {
                    updateBox("you win", "win")
                    endgame();
                    return;
                }, 2500);
            }
        });
    });
}

function endPlayerTurn() {
    playerTurn = false;
    setTimeout(boardGlow, 1000)
    setTimeout(aiTurn, 2500);
}

function boardGlow() {
    board.classList.remove("board-glow");
    aiBoard.classList.add("board-glow")
}

let memory = { mode: "hunt", lastHits: [], potentialTargets: [], remainingShips: [5, 4, 3, 3, 2] };

function aiTurn() {
    const playerCells = document.querySelectorAll("#gameboard .cell");
    let target;
    const largestRemainingShip = Math.max(...memory.remainingShips);
    if (memory.mode === "target" && memory.potentialTargets.length > 0) {
        const coords = memory.potentialTargets.shift();
        target = document.querySelector(`.cell[data-x="${coords.x}"][data-y="${coords.y}"]`)
    } else {
        memory.mode = "hunt";
        let attempts = 0;
        while (attempts < 100) {
            attempts++;
        const index = Math.floor(Math.random() * playerCells.length);
        target = playerCells[index];
        const x = parseInt(target.dataset.x);
        const y = parseInt(target.dataset.y);
        if ((x + y) % 2 !== 0) continue;
        if (target.classList.contains("hit") || target.classList.contains("miss")) continue;
        if (!canShipFit(gameboard.board, x, y, largestRemainingShip)) continue;
        break;
        }
        if (attempts >= 100) {
            if (!target) return;
            target = Array.from(playerCells).find(cell => !cell.classList.contains("hit") && !cell.classList.contains("miss"));
        }
    }
    if (!target) return;
    const x = parseInt(target.dataset.x);
    const y = parseInt(target.dataset.y);
    const { result, ship } = gameboard.receiveHit(x, y);
    if (result === "ship sunk") {
        if (ship) {
            updateBox(`${ship.name} has sunk`, "sunk");
            sunkShipsPlayer(ship);
            const idx = memory.remainingShips.indexOf(ship.length);
            if (idx !== -1) memory.remainingShips.splice(idx, 1);
        }
        target.classList.add("hit");
        memory.lastHits = [];
        memory.potentialTargets = [];
        memory.mode = "hunt";
        if (gameboard.allShipsSunk()) {
            updateBox("you lose", "lose");
            endgame();
            return;
        }
    } else if (result === "hit") {
        updateBox("your ship got hit", "hit");
        target.classList.add("hit");
        memory.lastHits.push({x, y});
        memory.mode = "target";
        let newTargets = [];
        if (memory.lastHits.length === 1) {
        const directions = [ {x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1} ];
        
        directions.forEach(direction => {
            if (direction.x >= 0 && direction.x < 10 && direction.y >= 0 && direction.y < 10) {
                const cell = document.querySelector(`.cell[data-x="${direction.x}"][data-y="${direction.y}"]`);
                if (!cell.classList.contains("hit") && !cell.classList.contains("miss")) {
                    if (!memory.potentialTargets.some(cell => cell.x === direction.x && cell.y === direction.y)) {
                    memory.potentialTargets.push({x: direction.x, y: direction.y});
                    }
                }
            }
        });
    } else if (memory.lastHits.length > 1) {
        const first = memory.lastHits[0];
        const second = memory.lastHits[1];
        const isHorizontal = first.y === second.y;
        const sortedHits = memory.lastHits.slice().sort((a,b) => isHorizontal ? a.x - b.x : a.y - b.y);
        if (isHorizontal) {
            const left = {x: sortedHits[0].x - 1, y: sortedHits[0].y};
            const right = {x: sortedHits[sortedHits.length - 1].x + 1, y: sortedHits[0].y};
            [left, right].forEach(direction => {
                if (direction.x >= 0 && direction.x < 10) {
                    const cell = document.querySelector(`.cell[data-x="${direction.x}"][data-y="${direction.y}"]`);
                    if (!cell.classList.contains("hit") && !cell.classList.contains("miss")) {
                        newTargets.push({x: direction.x, y: direction.y});
                    }
                }
            });
        } else {
            const top = {x: sortedHits[0].x, y: sortedHits[0].y - 1};
            const bottom = {x: sortedHits[0].x, y: sortedHits[sortedHits.length - 1].y + 1};
            [top, bottom].forEach(direction => {
                if (direction.y >= 0 && direction.y < 10) {
                    const cell = document.querySelector(`.cell[data-x="${direction.x}"][data-y="${direction.y}"]`);
                    if (!cell.classList.contains("hit") && !cell.classList.contains("miss")) {
                        newTargets.push({x: direction.x, y: direction.y});
                    }
                }
            })
        }
    }
    newTargets.forEach(newTarget => {
        if (!memory.potentialTargets.some(pTarget => pTarget.x === newTarget.x && pTarget.y === newTarget.y)) {
            memory.potentialTargets.push(newTarget);
        }
    });
    } else {
        updateBox("ai missed", "miss");
        target.classList.add("miss");
    }
    setTimeout(() => {
        playerTurn = true;
        enableAttacks();
    }, 2000);
}

function canShipFit(board, x, y, length) {
    const directions = [ {dirx: 1, diry: 0}, {dirx: -1, diry: 0}, {dirx: 0, diry:1}, {dirx: 0, diry: -1} ];
    for (let dir of directions) {
        let count = 1;
        for (let step = 1; step < length; step++) {
            let newX = x + dir.dirx * step;
            let newY = y + dir.diry * step;
            if (newX < 0 || newX >= 10 || newY < 0 || newY >= 10) break;
            if (board[newY][newX] === "hit" || board[newY][newX] === "miss") break;
            count++;
        }
        if (count >= length) return true;
     }
     return false;
}

const box = document.getElementById("box");
let boxQueue = [];
let isTyping = false;

function updateBox(message, type) {
    boxQueue.push({ message, type });
    if (!isTyping) processQueue();
}

function processQueue() {
    if (boxQueue.length === 0) {
        isTyping = false;
        return;
    }
    isTyping = true;
    const { message, type } = boxQueue.shift();
    box.classList.remove("box-hit", "box-miss", "box-sunk", "box-win", "box-lose");
    box.textContent = "";
    let index = 0;
    if (type === "sunk") {
        box.classList.add("box-sunk");
    } else if (type === "hit") {
        box.classList.add("box-hit");
    } else if (type === "miss") {
        box.classList.add("box-miss");
    } else if (type === "win") {
         box.classList.add("box-win");
    } else if (type === "lose") {
         box.classList.add("box-lose");
    } 
    let interval = setInterval(() => {
        box.textContent += message[index];
        index++;

        if (index === message.length) {
            clearInterval(interval);
            setTimeout(() => {
                box.classList.remove("box-hit", "box-miss", "box-sunk", "box-win", "box-lose");
            }, 800);
            setTimeout(() => {
                processQueue();
            }, 500);
        }
    }, 25);
}

function endgame() {
    playerTurn = false;
    document.querySelectorAll("#aigameboard .cell").forEach(cell => {
        cell.style.pointerEvents = "none";
    });
    document.querySelectorAll("#gameboard .cell").forEach(cell => {
        cell.style.pointerEvents = "none";
    });
    document.querySelectorAll("#secondgameboard .cell").forEach(cell => {
        cell.style.pointerEvents = "none";
    });
    aiBoard.classList.remove("board-glow");
    board.classList.remove("board-glow");
    secondBoard.classList.remove("board-glow")
    revealShips();
    updateBox("Click here to return home", "");
    hasWon = true;
}

function revealShips() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const ship = aigameboard.board[y][x];
            if (ship) {
                const cell = document.querySelector(`#ai-gameboard .cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add("hit");
                }
            }
        }
    }
}

function sunkShipsPlayer(ship) {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (gameboard.board[y][x] === ship) {
                const cell = document.querySelector(`#gameboard .cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add("sunk");
                }
            }
        }
    }
}

function sunkShipsPlayer2(ship) {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (secondgameboard.board[y][x] === ship) {
                const cell = document.querySelector(`#second-gameboard .cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add("sunk");
                }
            }
        }
    }
}

function sunkShipsAi(ship) {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (aigameboard.board[y][x] === ship) {
                const cell = document.querySelector(`#ai-gameboard .cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add("sunk");
                }
            }
        }
    }
}

let gameMode = null;
document.getElementById("gameboard").classList.add("hidden");
document.getElementById("ship-container").classList.add("hidden");
document.querySelector(".board-buttons").classList.add("hidden");
document.getElementById("box").classList.add("hidden");
const startScreen = document.getElementById("start-screen");
const onePlayer = document.getElementById("one-player");
const twoPlayer = document.getElementById("two-player");
const returnBtn = document.getElementById("return-btn");
const instructionsBtn = document.getElementById("instructions-button");
const closeBtn = document.querySelector(".modal-close");
const modalOverlay = document.querySelector(".modal-overlay");
const secondBoard = document.getElementById("second-gameboard");
secondBoard.classList.remove("board-glow")
const secondBoardClass = document.querySelector(".second-player-board");
const secondBoardBtns = document.querySelector(".second-board-btns");
secondBoard.classList.add("hidden");
modalOverlay.classList.add("hidden");
secondBoardClass.classList.add("hidden");
secondBoardBtns.classList.add("hidden");

onePlayer.addEventListener("click", () => {
    gameMode = "single";
    startScreen.classList.add("hidden");
    attachEventListeners(board);
    document.getElementById("gameboard").classList.remove("hidden");
    document.getElementById("ship-container").classList.remove("hidden");
    document.querySelector(".board-buttons").classList.remove("hidden");
    document.getElementById("box").classList.remove("hidden");
    updateBox("Place your ships to start", "");
});

twoPlayer.addEventListener("click", () => {
    gameMode = "double";
    startScreen.classList.add("hidden");
    attachEventListeners(board);
    board.classList.remove("hidden");
    document.getElementById("box").classList.remove("hidden");
    document.querySelector(".board-buttons").classList.remove("hidden");
    document.getElementById("ship-container").classList.remove("hidden");
    updateBox("Player 1 place your ships to start", "");
});

returnBtn.addEventListener("click", () => {
    gameMode = null;
    startScreen.classList.remove("hidden");
    document.getElementById("gameboard").classList.add("hidden");
    document.getElementById("ship-container").classList.add("hidden");
    document.querySelector(".board-buttons").classList.add("hidden");
    document.getElementById("box").classList.add("hidden");
    resetBoard("gameboard");
});

instructionsBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("hidden");
    modalOverlay.style.display = "flex";
});

closeBtn.addEventListener("click", () => {
    modalOverlay.style.display = "none";
});

modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        modalOverlay.style.display = "none";
    }
});

for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;
        secondBoard.appendChild(cell);
    }
}

const returnBtnTwo = document.querySelector(".return-btn2");
returnBtnTwo.disabled = true;
const twoPlayerConfirmBtn = document.querySelector(".confirmBtn2");
returnBtnTwo.addEventListener("click", () => {
    attachEventListeners(board);
    renderBoard(secondgameboard, document.getElementById("second-gameboard"));
    player1.placedShips = 5;
    currentPlayer = "player1";
    board.classList.remove("hidden");
    secondBoard.classList.add("hidden");
    secondBoardClass.classList.add("hidden");
    document.getElementById("ship-container").classList.remove("hidden");
    confirmBtn.classList.remove("hidden");
    resetBtn.classList.remove("hidden");
    returnBtn.classList.remove("hidden");
    document.querySelector(".player-board").classList.remove("hidden");
    updateBox("Player 1 place your ships to start", "");
    returnBtnTwo.classList.add("hidden");
    resetBtnTwo.classList.add("hidden");
    twoPlayerConfirmBtn.classList.add("hidden");
});

function renderBoard(gameBoardObj, boardElement) {
    boardElement.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("ship", "ship-start", "ship-end");
    });
    gameBoardObj.ships.forEach(ship => {
        for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (gameBoardObj.board[y][x] === ship) {
                const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
                if (cell) {
                    cell.classList.add("ship");
                }
            }
        }
    }
    });
}

let player1Turn = false;
twoPlayerConfirmBtn.addEventListener("click", () => {
    playerBtn.classList.remove("hidden");
    resetBtn.classList.add("hidden");
    returnBtn.classList.add("hidden");
    twoPlayerConfirmBtn.classList.add("hidden");
    returnBtnTwo.classList.add("hidden");
    resetBtnTwo.classList.add("hidden");
    document.getElementById("ship-container").classList.add("hidden");
    confirmBtn.classList.add("hidden");
    secondBoard.classList.add("hidden");
    updateBox("Switch to player 1", "");
});

function initAttackListeners() {
    const playerOneCells = document.querySelectorAll("#gameboard .cell");
    playerOneCells.forEach(cell => {
        cell.removeEventListener("click", playerOneHandler);
        cell.addEventListener("click", playerOneHandler);
    });
    const playerTwoCells = document.querySelectorAll("#second-gameboard .cell");
    playerTwoCells.forEach(cell => {
        cell.removeEventListener("click", playerTwoHandler);
        cell.addEventListener("click", playerTwoHandler);
    });
}

function handleAttack(cell, targetBoard, player) {
     if (cell.classList.contains("hit") || cell.classList.contains("miss") || cell.classList.contains("miss-noanimate") || cell.classList.contains("hit-noanimate")) return;
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const { result, ship } = targetBoard.receiveHit(x, y);
            if (result === "ship sunk") {
                updateBox(`${ship.name} has sunk`, "sunk");
                if (player === "Player 1") sunkShipsPlayer2(ship);
                else sunkShipsPlayer(ship);
                cell.classList.add("hit");
            } else if (result === "hit") {
                cell.classList.add("hit");
                 updateBox("you hit a ship", "hit");
            } else {
                cell.classList.add("miss");
                 updateBox("you missed", "miss")
            }
            if (targetBoard.allShipsSunk()) {
                setTimeout(() => {
                    updateBox(`${player} wins`, "win")
                    endgame();
                    return;
                }, 2500);
            }
        if (!targetBoard.allShipsSunk()) {    
            updateBox("Switching player", "")
            setTimeout(() => {
              showStatusBtn();
            }, 3000);
        }
}

function playerOneHandler(e) {
    if (player1Turn) return;
    handleAttack(e.target, gameboard, "Player 2");
}

function playerTwoHandler(e) {
    if (!player1Turn) return;
    handleAttack(e.target, secondgameboard, "Player 1");
}

function renderBoardForPlayer(gameBoardObj, boardElement, isCurrentPlayer) {
    boardElement.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("ship", "ship-start", "ship-end", "hit", "miss", "sunk", "miss-noanimate", "hit-noanimate", "opaque");
    });
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
            const ship = gameBoardObj.board[y][x];
            if (ship) {
                if (isCurrentPlayer) {
                    cell.classList.add("ship");
                    cell.classList.add("opaque");
                    const isStart = ((x === 0 || gameBoardObj.board[y][x-1] !== ship) && (y === 0 || gameBoardObj.board[y - 1][x] !== ship));
                    const isEnd = ((x === 9 || gameBoardObj.board[y][x + 1] !== ship) &&  (y === 9 || gameBoardObj.board[y + 1][x] !== ship));
                    if (isStart) cell.classList.add("ship-start");
                    if (isEnd) cell.classList.add("ship-end");
                }
            }
            const missed = gameBoardObj.missedShots.find(([mx, my]) => mx === x && my === y);
            if (missed) cell.classList.add("miss-noanimate");
            if (ship && ship.isHitAt(x,y)) {
                cell.classList.add("hit-noanimate");
            }
            if (ship && ship.sunk) {
                cell.classList.add("sunk");
            }
        }
    }
}

function switchTurn() {
    statusBtn.classList.add("hidden");
    secondBoard.classList.remove("board-glow")
    board.classList.remove("board-glow");
    player1Turn = !player1Turn;
    if (player1Turn) {
        board.classList.add("board-glow");
    } else {
        secondBoard.classList.add("board-glow")
    }
    renderBoardForPlayer(gameboard, board, player1Turn);
    renderBoardForPlayer(secondgameboard, secondBoard, !player1Turn);
    board.classList.remove("hidden");
    secondBoard.classList.remove("hidden");
    updateBox(player1Turn ? "Player 1 attack" : "Player 2 attack", "");
}

const statusBtn = document.getElementById("status-btn")
statusBtn.classList.add("hidden");

function showStatusBtn() {
    statusBtn.classList.remove("hidden");
    board.classList.add("hidden");
    secondBoard.classList.add("hidden");
    updateBox("Has player switched?", "")
}

statusBtn.addEventListener("click", switchTurn);

const playerBtn = document.getElementById("player-confirm-btn");
playerBtn.classList.add("hidden");

playerBtn.addEventListener("click", () => {
    secondBoard.classList.remove("hidden");
    secondBoardClass.classList.remove("hidden");
    board.classList.remove("hidden");
    document.querySelector(".player-board").classList.remove("hidden");
    player1Turn = true;
    renderBoardForPlayer(gameboard, board, player1Turn);
    renderBoardForPlayer(secondgameboard, secondBoard, !player1Turn);
    updateBox("Player 1 attack", "");
    initAttackListeners();
    secondBoard.classList.remove("board-glow")
    board.classList.add("board-glow");
    secondBoard.classList.remove("hidden");
    playerBtn.classList.add("hidden");
});

function rebuildBoard(boardElement) {
    boardElement.innerHTML = "";
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;
            boardElement.appendChild(cell);
        }
    }
}

function resetToHome() {
    gameMode = null;
    playerTurn = false;
    currentPlayer = "player1";
    hasVisitedSecondBoard = false;
    boxQueue = [];
    isTyping = false;
    const emptyGrid = () => Array.from( { length: 10 }, () => Array(10).fill(null));
    gameboard.board = emptyGrid();
    gameboard.missedShots = [];
    gameboard.ships = [];
    secondgameboard.board = emptyGrid();
    secondgameboard.missedShots = [];
    secondgameboard.ships = [];
    aigameboard.board = emptyGrid();
    aigameboard.missedShots = [];
    aigameboard.ships = [];
    player1.placedShips = 0;
    player2.placedShips = 0;
    memory = { mode: "hunt", lastHits: [], potentialTargets: [], remainingShips: [5, 4, 3, 3, 2] };
    hasWon = false;

    document.querySelectorAll(".board-glow").forEach(el => el.classList.remove("board-glow"));
    document.querySelectorAll("#gameboard .cell, #ai-gameboard .cell, #secondgameboard .cell").forEach( cell => {
        cell.className = cell;
        cell.style.pointerEvents = "";
    });
    rebuildBoard(board);
    rebuildBoard(aiBoard);
    rebuildBoard(secondBoard);
    const aiWrapper = document.querySelector(".ai-wrapper");
    if (aiWrapper) {
        if (aiWrapper.parentNode) {
            aiWrapper.parentNode.insertBefore(aiBoard, aiWrapper);
        }
        aiWrapper.remove();
    }
    startScreen.classList.remove("hidden");
    board.classList.add("hidden");
    aiBoard.classList.add("hidden");
    secondBoard.classList.add("hidden");
    secondBoardClass.classList.add("hidden");
    resetBoard("gameboard");
    resetBoard("second-gameboard");
    confirmBtn.classList.remove("hidden");
    confirmBtn.disabled = true;
    resetBtn.classList.remove("hidden");
    resetBtnTwo.classList.add("hidden");
    returnBtn.classList.remove("hidden");
    returnBtnTwo.classList.add("hidden");
    updateConfirmBtn();
    updateTwoConfirmBtn();
    updateBox("Place your ships to start", "");
}

box.addEventListener("click", () => {
    if (hasWon) {
        resetToHome();
    }
});