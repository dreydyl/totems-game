import { INVALID_MOVE } from "boardgame.io/core";

function createStartingArray() {
    const boardSetup = [
        "S", "H", "V", "F", "F", "F", "F", "", "", "",
        "H", "S", "", "V", "B", "", "", "", "C", "",
        "V", "", "S", "", "V", "R", "", "E", "", "",
        "F", "V", "", "T", "", "V", "W", "", "", "A",
        "F", "B", "V", "", "T", "", "V", "R", "", "A",
        "F", "", "R", "V", "", "T", "", "V", "B", "A",
        "F", "", "", "W", "V", "", "T", "", "V", "A",
        "", "", "E", "", "R", "V", "", "S", "", "V",
        "", "C", "", "", "", "B", "V", "", "S", "H",
        "", "", "", "A", "A", "A", "A", "V", "H", "S"
    ];
    const setup = Array(100).fill()
    .map(() => ({
        pole: [],
        valid: false,
        winning: false
    }))
    .map(i => {
        setup[i].push(boardSetup[i]);
    });

    return setup;
}

export const Totems = {
    setup: () => ({
        squares: createStartingArray(),
        activeSquare: -1,
        activePiece: { square: -1, type: "", player: -1 },
        stage: "Select a square"
    }),

    moves: {
        clickSquare: (G, ctx, id) => {
            //view totem pole
            //if turn and if player == player, select piece
        }
    },

    turns: {
        stages: {
            selectPiece: {
                moves: {
                    clickSquare: (G, ctx, id) => {
                        //view totem pole
                        //if turn and if player == player, active piece = id
                        let clickedSquare = G.squares[id];
                        G.activeSquare = id;
                        if(clickedSquare.pole.length > 0 && clickedSquare.pole.last().player == ctx.currentPlayer) {
                            G.activePiece = clickedSquare.pole.last();
                        } else {
                            G.activePiece.square = -1;
                            G.activePiece.type = "";
                            G.activePiece.player = -1;
                        }
                    },
                    clickPiece: (G, ctx, id) => {
                        //if player == player and (at top or is elephant), active piece = id
                        let clickedPiece = G.activeSquare.pole[id];
                        if(clickedPiece.player == ctx.currentPlayer
                            && (id == G.activeSquare.pole.length-1 || clickedPiece.type == "E")) {
                            G.activePiece = clickedPiece;
                        } else {
                            G.activePiece.square = -1;
                            G.activePiece.type = "";
                            G.activePiece.player = -1;
                        }
                    },
                    confirmPiece: (G, ctx) => {
                        ctx.events.setStage('movePiece');
                        G.stage = "Move piece";
                        return;
                    }
                }
            },
            movePiece: {
                moves: {
                    clickSquare: (G, ctx, id) => {
                        let clickedSquare = G.squares[id];
                    },
                    clickPiece: (G, ctx, id) => {
                        let clickedSquare
                    },
                    submitMoves: (G, ctx) => {

                    },
                    resetMoves: (G, ctx) => {

                    },
                    undoMove: (G, ctx) => {

                    }
                }
            }
        }
    }
}