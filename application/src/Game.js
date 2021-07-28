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
    const colorSetup = [
        "-1", "1", "1", "1", "1", "1", "1", "-1", "-1", "-1",
        "0", "-1", "-1", "1", "1", "-1", "-1", "-1", "1", "-1",
        "0", "-1", "-1", "-1", "1", "1", "-1", "1", "-1", "-1",
        "0", "0", "-1", "-1", "-1", "1", "1", "-1", "-1", "1",
        "0", "0", "0", "-1", "-1", "-1", "1", "1", "-1", "1",
        "0", "-1", "0", "0", "-1", "-1", "-1", "1", "1", "1",
        "0", "-1", "-1", "0", "0", "-1", "-1", "-1", "1", "1",
        "-1", "-1", "0", "-1", "0", "0", "-1", "-1", "-1", "1",
        "-1", "0", "-1", "-1", "-1", "0", "0", "-1", "-1", "1",
        "-1", "-1", "-1", "0", "0", "0", "0", "0", "0", "-1"
    ];
    const setup = Array(100).fill()
        .map(() => ({
            pole: [],
            side: -1,
        }));
    for (let i = 0; i < 100; i++) {
        setup[i].pole.push({
            player: colorSetup[i],
            type: boardSetup[i]
        });
    }
    let redCoords;
    let blueCoords;
    for (let i = 0; i < 10; i++) {
        for(let j = 0;j < i;j++) {
            blueCoords = { x: i, y: j };
            setup[toIndex(blueCoords)].side = 1;
            redCoords = { x: 10-i-1, y: 10-(j+1) };
            setup[toIndex(redCoords)].side = 0;
        }
    }

    return setup;
}

function setActivePiece(G, ctx, square, height, type, load = { type: "", player: -1 }) {
    G.activePiece.square = square;
    G.activePiece.height = height;
    G.activePiece.type = type;
    G.activePiece.player = ctx.currentPlayer;
    G.activePiece.load = load;
}

function resetActivePiece(G) {
    G.activePiece.square = -1;
    G.activePiece.height = -1;
    G.activePiece.type = "";
    G.activePiece.player = -1;
    G.activePiece.load.type = "";
    G.activePiece.load.player = -1;
}

function getCoordinates(index) {
    let xCoord;
    let yCoord;
    xCoord = index % 10;
    yCoord = Math.floor(index / 10);
    return { x: xCoord, y: yCoord };
}

function toIndex(coords) {
    return 10 * coords.y + coords.x;
}

function offset(coords, dx, dy) {
    return { x: coords.x + dx, y: coords.y + dy };
}

function onBoard(coords) {
    return coords.x >= 0 && coords.x < 10 && coords.y >= 0 && coords.y < 10;
}


function markValidMovesByStep(G, index, heightInd, steps) {
    if (steps <= 0) {
        return;
    }
    let newSteps = steps - 1;
    let coords = getCoordinates(index);
    let tempCoords;
    for (let i = 0; i < 3; i++) {
        let dy = i-1;
        for (let j = 0; j < 3; j++) {
            let dx = j-1;
            tempCoords = offset(coords, dx, dy);
            if (Math.abs(dx) != Math.abs(dy) && onBoard(tempCoords)) {
                let newIndex = toIndex(tempCoords);
                if (G.squares[newIndex].pole[G.squares[newIndex].pole.length - 1].type != "H") {
                    let heightDifference = heightInd - (G.squares[newIndex].pole.length - 1);           //0,1,2,3,4 height = 5
                    if (heightDifference <= 1 && heightDifference >= -1) {                             //0,1,2 height = 3
                        G.squares[newIndex].valid = true;                                           //0,1,2,3 height = 4
                        // steps--;
                        markValidMovesByStep(G, newIndex, G.squares[newIndex].pole.length, newSteps); //0,1,2,3 height = 3
                    }
                }
            }
            // dx++;
        }
        // dy++;
    }
}

function markValidMovesByFlight(G, index, moves) {
    if (moves <= 0) {
        return;
    }
    let newMoves = moves - 1;
    let coords = getCoordinates(index);
    let tempCoords;
    for (let i = 0; i < 3; i++) {
        let dy = i-1;
        for (let j = 0; j < 3; j++) {
            let dx = j-1;
            tempCoords = offset(coords, dx, dy);
            if (Math.abs(dx) != Math.abs(dy) && onBoard(tempCoords)) {
                let newIndex = toIndex(tempCoords);
                if (G.squares[newIndex].pole[G.squares[newIndex].pole.length - 1].type != "H") {
                    G.squares[newIndex].valid = true;
                    markValidMovesByFlight(G, newIndex, newMoves);
                }
            }
        }
    }
}

function markValidMoves(G, ctx) {
    // resetValidMoves(G);
    let index = G.activePiece.square;
    let height = G.activePiece.height;
    if (G.activePiece.type == "W" && G.activePiece.load.player >= 0) {
        height--;
    }
    if (height < G.squares[index].length - 1) {
        return;
    }
    if (G.activePiece.type == "V"
        || G.activePiece.type == "C"
        || G.activePiece == "F"
        || G.activePiece == "A"
        || G.activePiece == "H") {
        markValidMovesByStep(G, index, height, 2);
    } else if (G.activePiece.type == "E" || G.activePiece.type == "W") {
        // if (G.activePiece.type == "W" && G.activePiece.load.player >= 0) {
        //     height--;
        // }
        markValidMovesByStep(G, index, height, 3);
    } else if (G.activePiece.type == "B") {
        markValidMovesByFlight(G, index, 4);
    }
}

function resetValidMoves(G) {
    for (let i = 0; i < 100; i++) {
        G.squares[i].valid = false;
    }
}

export const Totems = {
    setup: () => ({
        squares: createStartingArray(),
        activeSquare: -1,
        activePiece: {
            square: -1,
            height: -1,
            type: "",
            player: -1,
            load: { type: "", player: -1 }
        },
        stage: ["Select a piece", ""]
    }),

    moves: {
    },

    turn: {
        onBegin: (G, ctx) => {
            ctx.events.setStage('selectPiece');
        },
        stages: {
            examinePiece: {
                moves: {
                    clickSquare: (G, ctx, id) => {

                    },
                    clickPiece: (G, ctx, id) => {

                    }
                }
            },
            selectPiece: {
                moves: {
                    clickSquare: (G, ctx, id) => {
                        //view totem pole
                        //if turn and if player == player, active piece
                        resetActivePiece(G);
                        resetValidMoves(G);
                        let clickedSquare = G.squares[id];
                        G.activeSquare = id;
                        if (clickedSquare.pole.length > 0) {
                            let clickedPiece = clickedSquare.pole[clickedSquare.pole.length - 1];
                            if (clickedPiece.player == ctx.currentPlayer) {
                                setActivePiece(G, ctx, id, clickedSquare.pole.length - 1, clickedPiece.type);
                                markValidMoves(G, ctx);
                            }
                        }
                    },
                    clickPiece: (G, ctx, id) => {
                        //if player == player and (at top or is elephant), active piece
                        let clickedPiece = G.activeSquare.pole[id];
                        if (clickedPiece.player == ctx.currentPlayer
                            && (clickedPiece.height == G.activeSquare.pole.length - 1
                                || (
                                    (clickedPiece.type == "E" || clickedPiece == "F")
                                    && clickedPiece.height == G.activeSquare.pole.length - 2
                                )
                            )
                        ) {
                            let load = { type: "", player: -1 };
                            if (clickedPiece.type == "E" && clickedPiece.height != G.activeSquare.pole.length) { //0,1,2,3,4
                                load.type = G.activeSquare.pole[G.activeSquare.pole.length - 1].type;
                                load.player = G.activeSquare.pole[G.activeSquare.pole.length - 1].player;
                            }
                            setActivePiece(G, ctx, G.activeSquare, clickedPiece.height, clickedPiece.type, load);
                            markValidMoves(G, ctx);
                        } else {
                            resetActivePiece(G);
                        }
                    },
                    confirm: (G, ctx) => {
                        ctx.events.setStage('movePiece');
                        G.stage = "Move piece";
                        return;
                    }
                }
            },
            movePiece: {
                moves: {
                    loadPiece: (G, ctx) => {
                        if (G.activePiece.type == "F") {
                            G.stage = "Select a piece to carry";
                            ctx.events.setStage('carry');
                        } else if (G.activePiece.type == "W") {
                            load.type = G.activeSquare.pole[G.activeSquare.pole.length].type;
                            load.player = G.activeSquare.pole[G.activeSquare.pole.length - 1].player;
                        } else {
                            //invalid move
                        }
                    },
                    clickSquare: (G, ctx, id) => {
                        let clickedSquare = G.squares[id];
                        if (clickedSquare.valid) {
                            G.activeSquare = id;
                        }
                    },
                    cancel: (G, ctx) => {
                        G.stage = "Select a piece";
                        ctx.events.setStage('selectPiece');
                    },
                    confirm: (G, ctx) => {
                        if (G.activePiece.type == "W") {
                            let load = { player: G.activePiece.load.player, type: G.activePiece.load.type };
                            if (load.player >= 0) {
                                G.squares[G.activeSquare].pole.push(load);
                            }
                        }
                        G.squares[G.activeSquare].pole.push({ type: G.activePiece.type, player: G.activePiece.player });
                        if (G.activePiece.type == "E") {
                            let load = { player: G.activePiece.load.player, type: G.activePiece.load.type };
                            if (load.player >= 0) {
                                G.squares[G.activeSquare].pole.push(load);
                            }
                        }

                        resetActivePiece(G);
                        resetValidMoves(G);
                        G.stage = "Select a piece";
                        ctx.events.endTurn();
                    }
                }
            },
            carry: {
                moves: {
                    clickSquare: {

                    },
                    confirmPiece: {

                    }
                }
            }
        }
    }
}