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
        let board = document.createElement("div");
        board.className = "board";
        let div;
        for (let i = 0; i < 100; i++) {
            div = document.createElement("div");
            div.className = "square";
            div.dataset.id = i;

            board.appendChild(div);
        }
        main.appendChild(board);
        //stack
        let stack = document.createElement("div");
        stack.className = "stack";

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
        buttonStack.appendChild(cancelButton);
        buttonStack.appendChild(unloadButton);

        main.appendChild(stack);
        main.appendChild(buttonStack);

        this.rootElement.appendChild(main);
        // const rows = [];
        // for(let i = 0;i < 10;i++) {
        //     const squares = [];
        //     for(let j = 0;j < 10;j++) {
        //         const id = 10 * i + j;
        //         div = document.createElement("div");
        //         div.className = "square";
        //         div.dataset.id = id;
        //         squares.push(`<td class ="square" data-id="${id}"><td>`);
        //     }
        //     rows.push(`<tr class="board">${squares.join('')}</tr>`);
        // }

        // this.rootElement.innerHTML = `
        //     <table class="board">${rows.join('')}<table>
        // `;
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
        }
        if (state.G.stage == "Select a space to move") {
            cancelButton.style.display = "block";
            if(state.G.activePiece !== null && state.G.activePiece.type == "F") {
                carryButton.style.display = "block";
            }
            if(state.G.activePiece !== null && state.G.activePiece.type == "W" && state.G.squares[state.G.activePiece.currentSquare].stackHeight > 2) {
                carryButton.style.display = "block";
            }
        }
        if(state.G.stage == "Select a piece to carry") {
            cancelButton.style.display = "block";
            if(state.G.activePiece !== null) {
                confirmButton.style.display = "block";
            }
        }
        const squares = this.rootElement.querySelectorAll('.square');
        squares.forEach(square => {
            const squareID = parseInt(square.dataset.id);
            const piece = state.G.squares[squareID].stack[state.G.squares[squareID].stack.length - 1];
            let squareValue = "";
            let squareColor = -1;
            if(piece !== undefined) {
                squareValue = piece.type;
                squareColor = piece.player;
            }
            square.textContent = squareValue;
            square.style.color = squareColor < 0 ? "#f0f0f0" : (squareColor == 0 ? "red" : "blue");
            if (state.G.squares[squareID].side < 0) {
                if (state.G.activePiece !== null && state.G.activePiece.currentSquare == squareID) {
                    square.style.backgroundColor = "#80d072";
                } else {
                    square.style.backgroundColor = "#797";
                }
            } else if (state.G.squares[squareID].side == 0) {
                if (state.G.activePiece !== null && state.G.activePiece.currentSquare == squareID) {
                    square.style.backgroundColor = "#ff9292";
                } else {
                    square.style.backgroundColor = "#999292";
                }
            } else {
                if (state.G.activePiece !== null && state.G.activePiece.currentSquare == squareID) {
                    square.style.backgroundColor = "#9992f0";
                } else {
                    square.style.backgroundColor = "#929299";
                }
            }
            if (state.G.squares[squareID].valid) {
                square.style.border = "1px solid white";
            } else {
                square.style.border = "1px solid green";
            }
            if(state.G.activeSquare !== null && state.G.activeSquare.id == squareID) {
                square.style.border = "1px solid "+(state.ctx.currentPlayer == 0 ? "red" : "blue");
            }
        });
        const stack = this.rootElement.querySelector(".stack");
        const stackedPieces = this.rootElement.querySelectorAll(".stack-piece");
        stackedPieces.forEach(piece => {
            stack.removeChild(piece);
        });
        if(state.G.activeSquare !== null) {
            for(let i = 0;i < state.G.activeSquare.stack.length;i++) {
                let stackPiece = document.createElement("div");
                stackPiece.className = "stack-piece";
                stackPiece.dataset.id = i;
                stackPiece.textContent = state.G.activeSquare.stack[i].type;
                stackPiece.classList.add(
                    "piece-"+state.G.activeSquare.stack[i].type,
                    "piece-player"+state.G.activeSquare.stack[i].player
                );
                if(state.G.activeSquare.stack[i].player == state.ctx.currentPlayer) {
                    stackPiece.classList.add("clickable-piece");
                }
                stack.appendChild(stackPiece);
            }

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