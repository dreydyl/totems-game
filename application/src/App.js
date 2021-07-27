import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { Totems } from './Game';

class TotemsClient {
    constructor(rootElement, { playerID }) {
        this.client = Client({
            game: Totems,
            multiplayer: Local(),
            playerID
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
        for(let i = 0;i < 100;i++) {
            div = document.createElement("div");
            div.className = "square";
            div.dataset.id = i;

            board.appendChild(div);
        }
        main.appendChild(board);
        //stack
        let stack = document.createElement("div");
        stack.className = "stack";

        let confirmButton = document.createElement("div");
        confirmButton.id = "confirm-button";
        confirmButton.textContent = "Confirm";

        let cancelButton = document.createElement("div");
        cancelButton.id = "cancel-button";
        cancelButton.textContent = "Cancel";

        stack.appendChild(confirmButton);
        stack.appendChild(cancelButton);

        main.appendChild(stack);

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
    }

    update(state) {
        const confirmButton = this.rootElement.querySelector('#confirm-button');
        confirmButton.style.display = "none";
        const cancelButton = this.rootElement.querySelector('#cancel-button');
        cancelButton.style.display = "none";
        if(state.G.activePiece.player >= 0) {
            confirmButton.style.display = "block";
        }
        if(state.G.stage == "Move piece") {
            cancelButton.style.display = "block";
        }
        const squares = this.rootElement.querySelectorAll('.square');
        if(this.client.playerID == 0 && state.ctx.currentPlayer == 0) {
            squares.forEach(square => {
                const squareID = parseInt(square.dataset.id);
                const squareValue = state.G.squares[squareID].pole[state.G.squares[squareID].pole.length-1].type;
                const squareColor = state.G.squares[squareID].pole[state.G.squares[squareID].pole.length-1].player;
                square.textContent = squareValue;
                square.style.color = squareColor < 0 ? "#f0f0f0" : (squareColor == 0 ? "red" : "blue");
                if(state.G.squares[squareID].side < 0) {
                    if(state.G.activeSquare == squareID) {
                        square.style.backgroundColor = "#80d072";
                    } else {
                        square.style.backgroundColor = "#797";
                    }
                } else if(state.G.squares[squareID].side == 0) {
                    if(state.G.activeSquare == squareID) {
                        square.style.backgroundColor = "#ff9292";
                    } else {
                        square.style.backgroundColor = "#999292";
                    }
                } else {
                    if(state.G.activeSquare == squareID) {
                        square.style.backgroundColor = "#9992f0";
                    } else {
                        square.style.backgroundColor = "#929299";
                    }
                }
                if(state.G.squares[squareID].valid) {
                    square.style.border = "1px solid white";
                } else {
                    square.style.border = "1px solid green";
                }
            });
        } else if(this.client.playerID == 1 && state.ctx.currentPlayer == 1) {
            let oppSquares = [];
            for(let i = 0;i < 100;i++) {
                oppSquares.push(state.G.squares[99-i]);
            }
            squares.forEach(square => {
                const squareID = parseInt(square.dataset.id);
                const squareValue = state.G.squares[squareID].pole[state.G.squares[squareID].pole.length-1].type;
                square.textContent = squareValue;
                if(state.G.squares[squareID].side < 0) {
                    if(state.G.activeSquare == squareID) {
                        square.style.backgroundColor = "#72d080";
                    } else {
                        square.style.backgroundColor = "#797";
                    }
                } else if(state.G.squares[squareID].side == 0) {
                    if(state.G.activeSquare == squareID) {
                        square.style.backgroundColor = "#f09299";
                    } else {
                        square.style.backgroundColor = "#999292";
                    }
                } else {
                    if(state.G.activeSquare == squareID) {
                        square.style.backgroundColor = "#9292ff";
                    } else {
                        square.style.backgroundColor = "#929299";
                    }
                }
            });
        }
    }
}

const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map(playerID => {
  const rootElement = document.createElement('div');
  appElement.append(rootElement);
  return new TotemsClient(rootElement, { playerID });
});