import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { Totems } from './ModifiedGame';

class TotemsClient {
    // constructor(rootElement, { playerID }) {
    constructor(rootElement) {
        this.client = Client({
            game: Totems,
            // multiplayer: Local(),
            // playerID
        });
        this.client.start();
        this.rootElement = rootElement;
        this.createBoard();
        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    createBoard() {
        let main = document.createElement("div");
        main.className = "main";
        //board
        let boardFlex = document.createElement("div");
        boardFlex.className = "board-flex";
        let board = document.createElement("div");
        board.className = "board";
        let div;
        let topPiece;
        for (let i = 0; i < 100; i++) {
            div = document.createElement("div");
            div.className = "square";
            div.dataset.id = i;
            topPiece = document.createElement("div");
            topPiece.className = "top-piece";
            topPiece.dataset.id = i;
            div.appendChild(topPiece);

            board.appendChild(div);
        }
        boardFlex.appendChild(board);
        main.appendChild(boardFlex);
        //stack
        let initialStack = document.createElement("div");
        initialStack.className = "init-stack";
        let stack = document.createElement("div");
        stack.className = "stack";

        main.appendChild(initialStack);
        main.appendChild(stack);

        let buttonStack = document.createElement("div");
        buttonStack.className = "button-stack";

        let confirmButton = document.createElement("div");
        confirmButton.id = "confirm-button";
        confirmButton.className = "button";
        confirmButton.textContent = "Confirm";

        let cancelButton = document.createElement("div");
        cancelButton.id = "cancel-button";
        cancelButton.className = "button";
        cancelButton.textContent = "Cancel";

        let carryButton = document.createElement("div");
        carryButton.id = "carry-button";
        carryButton.className = "button";
        carryButton.textContent = "Carry";

        let unloadButton = document.createElement("div");
        unloadButton.id = "unload-button";
        unloadButton.className = "button";
        unloadButton.textContent = "Unload";

        buttonStack.appendChild(confirmButton);
        buttonStack.appendChild(carryButton);
        buttonStack.appendChild(unloadButton);
        buttonStack.appendChild(cancelButton);

        main.appendChild(buttonStack);

        this.rootElement.appendChild(main);
    }

    attachListeners() {
        const handleSquareClick = event => {
            const id = parseInt(event.target.dataset.id);
            this.client.moves.clickSquare(id);
        };
        const squares = this.rootElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.onclick = handleSquareClick;
        });
        const handleConfirmClick = () => {
            this.client.moves.confirm();
        };
        const confirmButton = this.rootElement.querySelector('#confirm-button');
        confirmButton.onclick = handleConfirmClick;
        const handleCancelClick = () => {
            this.client.moves.cancel();
        };
        const cancelButton = this.rootElement.querySelector('#cancel-button');
        cancelButton.onclick = handleCancelClick;
        const handleCarryClick = () => {
            this.client.moves.loadPiece();
        };
        const carryButton = this.rootElement.querySelector('#carry-button');
        carryButton.onclick = handleCarryClick;
        const handleUnloadClick = () => {
            this.client.moves.unloadPiece();
        };
        const unloadButton = this.rootElement.querySelector('#unload-button');
        unloadButton.onclick = handleUnloadClick;
    }

    updateListeners(state) {
        const handlePieceClick = event => {
            const index = parseInt(event.target.dataset.id);
            if (index == -1) {
                this.client.moves.confirm();
            } else {
                this.client.moves.clickPiece(index);
            }
        };
        const pieces = this.rootElement.querySelectorAll('.stack-piece');
        pieces.forEach(piece => {
            piece.onclick = handlePieceClick;
        });
    }

    update(state) {
        const confirmButton = this.rootElement.querySelector('#confirm-button');
        confirmButton.style.display = "none";
        const cancelButton = this.rootElement.querySelector('#cancel-button');
        cancelButton.style.display = "none";
        const carryButton = this.rootElement.querySelector('#carry-button');
        carryButton.style.display = "none";
        const unloadButton = this.rootElement.querySelector('#unload-button');
        unloadButton.style.display = "none";
        if (state.G.activePiece !== null && state.G.activePiece.player >= 0 && state.G.activeSquare !== null) {
            confirmButton.style.display = "block";
            if (state.G.stage.startsWith("Select a space to move") && !state.G.activeSquare.valid) {
                confirmButton.style.display = "none";
            }
        }
        if (state.G.stage.startsWith("Select a space to move")) {
            cancelButton.style.display = "block";
            if (state.G.load === null) {
                if (state.G.activePiece !== null && state.G.activePiece.type == "F") {
                    carryButton.style.display = "block";
                }
                if (state.G.activePiece !== null && state.G.activePiece.type == "W" && state.G.squares[state.G.activePiece.currentSquare].stackHeight > 2) {
                    carryButton.style.display = "block";
                }
            }
        }
        if (state.G.stage == "Select a piece to carry") {
            cancelButton.style.display = "block";
            if (state.G.activePiece !== null) {
                confirmButton.style.display = "block";
            }
        }
        if (state.G.load !== null && state.G.activePiece.type == "W" && state.G.stage != "Select a space to move load") {
            unloadButton.style.display = "block";
        }

        const squares = this.rootElement.querySelectorAll('.square');
        squares.forEach(square => {
            const squareID = parseInt(square.dataset.id);
            const piece = state.G.squares[squareID].stack[state.G.squares[squareID].stack.length - 1];
            let squareValue = "";
            let squareColor = -1;
            if (piece !== undefined) {
                squareValue = piece.type;
                squareColor = piece.player;
            }
            square.classList.add(
                "square-side" + state.G.squares[squareID].side
            )
            square.classList.remove("valid-stage2");
            if (state.G.squares[squareID].valid) {
                square.classList.add("valid-" + (state.G.stage == "Select a piece" ? "square" + state.ctx.currentPlayer : "stage2"));
            } else {
                square.classList.remove("valid-square0");
                square.classList.remove("valid-square1");
            }
            if (state.G.activePiece !== null && state.G.activePiece.currentSquare == squareID) {
                square.classList.add("active-piece" + state.ctx.currentPlayer);
            } else {
                square.classList.remove("active-piece0");
                square.classList.remove("active-piece1");
            }
            if (state.G.activeSquare !== null && state.G.activeSquare.id == squareID) {
                square.classList.add("active-square" + state.ctx.currentPlayer);
            } else {
                square.classList.remove("active-square0");
                square.classList.remove("active-square1");
            }
        });

        const boardPieces = this.rootElement.querySelectorAll('.top-piece');
        boardPieces.forEach(piece => {
            piece.style.display = "none";
            let stack = state.G.squares[piece.dataset.id].stack;
            if (stack.length > 0) {
                piece.style.display = "block";
                for (let i = 0; i < 3; i++) {
                    piece.classList.remove("top-piece-player" + (i - 1))
                }
                piece.classList.add("top-piece-player" + stack[stack.length - 1].player);
                if (stack[stack.length - 1].type == "T") {
                    piece.classList.add("top-piece-tree");
                } else {
                    piece.classList.remove("top-piece-tree");
                }
                piece.textContent = stack[stack.length - 1].type;
            }
        })

        const initialStack = this.rootElement.querySelector(".init-stack");
        const stack = this.rootElement.querySelector(".stack");

        let stackedPieces = this.rootElement.querySelectorAll(".init-stack-piece");
        stackedPieces.forEach(piece => {
            initialStack.removeChild(piece);
        });
        stackedPieces = this.rootElement.querySelectorAll(".stack-piece");
        stackedPieces.forEach(piece => {
            stack.removeChild(piece);
        });


        if (state.G.activeSquare !== null && state.G.activePiece !== null && state.G.activeSquare.id != state.G.activePiece.currentSquare) {
            if (state.G.stage != "Select a piece") {
                for (let i = 0; i < state.G.squares[state.G.activePiece.currentSquare].stack.length; i++) {
                    let stackPiece = document.createElement("div");
                    stackPiece.className = "init-stack-piece";
                    stackPiece.dataset.id = i;
                    stackPiece.textContent = state.G.squares[state.G.activePiece.currentSquare].stack[i].type;
                    stackPiece.classList.add(
                        "piece-" + state.G.squares[state.G.activePiece.currentSquare].stack[i].type,
                        "piece-player" + state.G.squares[state.G.activePiece.currentSquare].stack[i].player
                    );
                    if (state.G.squares[state.G.activePiece.currentSquare].stack[i] == state.G.activePiece) {
                        stackPiece.classList.add("selected-piece");
                    }
                    initialStack.appendChild(stackPiece);
                }
            }
        }

        if (state.G.activeSquare !== null) {
            for (let j = 0; j < state.G.activeSquare.stack.length; j++) {
                let stackPiece = document.createElement("div");
                stackPiece.className = "stack-piece";
                stackPiece.dataset.id = j;
                stackPiece.textContent = state.G.activeSquare.stack[j].type;
                stackPiece.classList.add(
                    "piece-" + state.G.activeSquare.stack[j].type,
                    "piece-player" + state.G.activeSquare.stack[j].player
                );
                if (state.G.stage != "Select a space to move" && state.G.activeSquare.stack[j].player == state.ctx.currentPlayer
                    && (j == state.G.activeSquare.stack.length - 1 || (j == state.G.activeSquare.stack.length - 2
                        && (state.G.activeSquare.stack[j].type == "F" || state.G.activeSquare.stack[j].type == "E")))) {
                    stackPiece.classList.add("clickable-piece");
                    if (state.G.activePiece !== null && state.G.activeSquare.stack[j].id != state.G.activePiece.id) {
                        stackPiece.classList.add("clickable-piece" + state.G.activeSquare.stack[j].player);
                    }
                }
                if (state.G.activeSquare.stack[j] == state.G.activePiece) {
                    stackPiece.classList.add("selected-piece");
                }
                if (state.G.activeSquare.stack[j] == state.G.load) {
                    stackPiece.classList.add("loaded-piece");
                }
                stack.appendChild(stackPiece);
            }
            if ((state.G.stage.startsWith("Select a space to move") && state.G.activeSquare.valid)
                || (state.G.stage == "Select a piece to carry" && state.G.activePiece !== null)) {
                if (state.G.load !== null && state.G.activePiece.type == "W") {
                    let stackPiece = document.createElement("div");
                    stackPiece.className = "stack-piece";
                    stackPiece.dataset.id = -1;
                    stackPiece.textContent = state.G.load.type;
                    stackPiece.classList.add(
                        "piece-" + state.G.load.type,
                        "piece-player" + state.G.load.player,
                        "phantom-piece" + state.G.load.player,
                        "clickable-piece"
                    );
                    stack.appendChild(stackPiece);
                }
                let stackPiece = document.createElement("div");
                stackPiece.className = "stack-piece";
                stackPiece.dataset.id = -1;
                stackPiece.textContent = state.G.activePiece.type;
                stackPiece.classList.add(
                    "piece-" + state.G.activePiece.type,
                    "piece-player" + state.G.activePiece.player,
                    "phantom-piece" + state.G.activePiece.player,
                    "clickable-piece"
                );
                stack.appendChild(stackPiece);
                if (state.G.load !== null && state.G.activePiece.type == "E") {
                    let stackPiece = document.createElement("div");
                    stackPiece.className = "stack-piece";
                    stackPiece.dataset.id = -1;
                    stackPiece.textContent = state.G.load.type;
                    stackPiece.classList.add(
                        "piece-" + state.G.load.type,
                        "piece-player" + state.G.load.player,
                        "phantom-piece" + state.G.load.player,
                        "clickable-piece"
                    );
                    stack.appendChild(stackPiece);
                }
            }
            this.updateListeners(state);
        }
    }
}

const appElement = document.getElementById('app');
const app = new TotemsClient(appElement);
// const playerIDs = ['0', '1'];
// const clients = playerIDs.map(playerID => {
//   const rootElement = document.createElement('div');
//   appElement.append(rootElement);
//   return new TotemsClient(rootElement, { playerID });
// });