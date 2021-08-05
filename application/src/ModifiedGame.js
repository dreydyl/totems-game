import { INVALID_MOVE } from "boardgame.io/core";

let heightMap = new Map();
heightMap.set("V", 1);
heightMap.set("C", 2);
heightMap.set("A", 1);
heightMap.set("F", 1);
heightMap.set("B", 1);
heightMap.set("R", 1);
heightMap.set("E", 2);
heightMap.set("W", 2);
heightMap.set("H", 3);
heightMap.set("S", 1);
heightMap.set("T", 2);

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
            id: 0,
            stack: [],
            stackHeight: 0,
            side: -1,
            valid: false,
            winning: false
        }));
    let pieceId = 0;
    for (let i = 0; i < 100; i++) {
        setup[i].id = i;
        if (boardSetup[i] != "") {
            setup[i].stack.push({
                id: pieceId,
                currentSquare: i,
                player: colorSetup[i],
                type: boardSetup[i],
                valid: false
            });
            setup[i].stackHeight = heightMap.get(boardSetup[i]);
            pieceId++;
        }
    }
    let redCoords;
    let blueCoords;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < i; j++) {
            blueCoords = { x: i, y: j };
            setup[toIndex(blueCoords)].side = 1;
            redCoords = { x: 10 - i - 1, y: 10 - (j + 1) };
            setup[toIndex(redCoords)].side = 0;
        }
    }

    return setup;
}

function getHeight(stack) {
    let height = 0;
    for (let i = 0; i < stack.length; i++) {
        height += heightMap.get(stack[i].type);
    }
    return height;
}

function getLevel(stack, index) {
    let level = 0;
    for (let i = 0; i < index; i++) {
        level += heightMap.get(stack[i].type);
    }
    return level;
}

function isAtTop(G, piece) {
    if (G.activeSquare.stack[G.activeSquare.stack.length - 1] == piece) {
        return true;
    }
    return false;
}

function toCoordinates(index) {
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

const validMovesBySteps = (G, index, steps, height = null) => {
    if (steps <= 0) {
        return;
    }
    let newSteps = steps - 1;
    let coords = toCoordinates(index);
    let newCoords;
    for (let i = 0; i < 3; i++) {
        let dy = i - 1;
        for (let j = 0; j < 3; j++) {
            let dx = j - 1;
            newCoords = offset(coords, dx, dy);
            if (Math.abs(dy) != Math.abs(dx) && onBoard(newCoords)) {
                let newIndex = toIndex(newCoords);
                let heightDifference;
                if (height !== null) {
                    heightDifference = (index != G.activePiece.currentSquare ? G.squares[index].stackHeight :
                        getLevel(G.squares[index].stack, G.squares[index].stack.length - 1)) - G.squares[newIndex].stackHeight;
                } else {
                    heightDifference = (index != G.activePiece.currentSquare ? G.squares[index].stackHeight :
                        getLevel(G.squares[index].stack, G.squares[index].stack.length - 2)) - G.squares[newIndex].stackHeight;
                }
                if (G.activePiece.type == "W" || G.activePiece.type == "E") {
                    if (G.load !== null) {
                        heightDifference = (index != G.activePiece.currentSquare ? G.squares[index].stackHeight :
                            getLevel(G.squares[index].stack, G.squares[index].stack.length - 2)) - G.squares[newIndex].stackHeight;
                    }
                }
                if (heightDifference <= 1 && heightDifference >= -1) {
                    if (height !== null) {
                        if (G.squares[newIndex].stackHeight <= 0) return;
                        height += heightDifference;
                    }
                    G.squares[newIndex].valid = true;
                    validMovesBySteps(G, newIndex, newSteps, height);
                }
            }
        }
    }
};
const validMovesByFlight = (G, index, moves) => {
    if (moves <= 0) {
        return;
    }
    let newMoves = moves - 1;
    let coords = toCoordinates(index);
    let newCoords;
    for (let i = 0; i < 3; i++) {
        let dy = i - 1;
        for (let j = 0; j < 3; j++) {
            let dx = j - 1;
            newCoords = offset(coords, dx, dy);
            if (Math.abs(dy) != Math.abs(dx) && onBoard(newCoords)) {
                let newIndex = toIndex(newCoords);
                G.squares[newIndex].valid = true;
                validMovesByFlight(G, newIndex, newMoves);
            }
        }
    }
};
const validMovesByCharge = (G, index, moves) => {
    let coords = toCoordinates(index);
    let newCoords;
    let lastIndex;
    let lastCoords;
    for (let i = 0; i < 3; i++) {
        let dy = i - 1;
        for (let j = 0; j < 3; j++) {
            let dx = j - 1;
            let brokenPath = false;
            lastIndex = index;
            for (let k = 0; k < moves; k++) {
                if (brokenPath) break;
                lastCoords = toCoordinates(lastIndex);
                let dist = k + 1;
                newCoords = offset(lastCoords, dx, dy);
                if (Math.abs(dy) != Math.abs(dx) && onBoard(newCoords)) {
                    let newIndex = toIndex(newCoords);
                    let heightDifference = (lastIndex != G.activePiece.currentSquare ? G.squares[lastIndex].stackHeight :
                        getLevel(G.squares[lastIndex].stack, G.squares[lastIndex].stack.length - 1)) - G.squares[newIndex].stackHeight;
                    if (heightDifference <= 1 && heightDifference >= -1) {
                        G.squares[newIndex].valid = true;
                        lastIndex = newIndex;
                    } else {
                        brokenPath = true;
                    }
                }
            }
        }
    }
};
let movesMap = new Map();
movesMap.set("V", { movement: validMovesBySteps, moves: 2 });
movesMap.set("C", { movement: validMovesBySteps, moves: 2 });
movesMap.set("A", { movement: validMovesBySteps, moves: 2 });
movesMap.set("F", { movement: validMovesBySteps, moves: 2 });
movesMap.set("B", { movement: validMovesByFlight, moves: 4 });
movesMap.set("R", { movement: validMovesByCharge, moves: 6 });
movesMap.set("E", { movement: validMovesBySteps, moves: 3 });
movesMap.set("W", { movement: validMovesBySteps, moves: 3 });
movesMap.set("H", { movement: validMovesBySteps, moves: 2 });

function markValidMoves(G) {
    let piece = movesMap.get(G.activePiece.type);
    piece.movement(G, G.activePiece.currentSquare, piece.moves);
    G.squares[G.activePiece.currentSquare].valid = false;
}

function unmarkValidMoves(G) {
    for (let i = 0; i < 100; i++) {
        G.squares[i].valid = false;
    }
}

function markValidLoads(G) {
    let piece = movesMap.get(G.activePiece.type);
    validMovesBySteps(G, G.activePiece.currentSquare, piece.moves, G.squares[G.activePiece.currentSquare].stackHeight);
    G.squares[G.activePiece.currentSquare].valid = false;
}

function markValidPieces(G) {

}

export const Totems = {
    setup: () => ({
        squares: createStartingArray(),
        activeSquare: null,
        // activeSquare: -1, //index
        activePiece: null,
        // activePiece: {
        //     currentSquare: -1, //index
        //     index: -1,
        //     // level: -1, //height of stack below
        //     type: "",
        //     player: -1
        // },
        load: null,
        // load: {
        //     currentSquare: -1,
        //     index: -1,
        // }
        stage: "Select a piece"
    }),

    moves: {
        clickSquare: (G, ctx, id) => {
            G.activePiece = null;
            G.load = null;
            unmarkValidMoves(G);
            let clickedSquare = G.squares[id];
            G.activeSquare = clickedSquare;
            if (clickedSquare.stack.length > 0) {
                let clickedPiece = clickedSquare.stack[clickedSquare.stack.length - 1];
                if (clickedPiece.player == ctx.currentPlayer) {
                    G.activePiece = clickedPiece;
                    markValidMoves(G);
                }
            }
        },
        clickPiece: (G, ctx, index) => {
            G.load = null;
            let clickedPiece = G.activeSquare.stack[index];
            if (clickedPiece.player == ctx.currentPlayer) {
                if (index == G.activeSquare.stack.length - 1) {
                    G.activePiece = null;
                    unmarkValidMoves(G);
                    G.activePiece = clickedPiece;
                    markValidMoves(G);
                } else if (index == G.activeSquare.stack.length - 2) {
                    if (clickedPiece.type == "E" || clickedPiece.type == "F") {
                        G.activePiece = null;
                        unmarkValidMoves(G);
                        G.activePiece = clickedPiece;
                        G.load = G.activeSquare.stack[index + 1];
                        markValidMoves(G);
                    }
                }
            }
        },
        confirm: (G, ctx) => {
            if (G.activePiece.type == "F" && G.load !== null && G.activeSquare.stack[G.activeSquare.stack.length - 2].id == G.activePiece.id) {
                G.stage = "Select a space to move load";
                // ctx.events.setStage('moveLoad');
                G.activePiece = G.load;
            } else {
                G.stage = "Select a space to move";
            }
            ctx.events.setStage('movePiece');
            return;
        }
    },

    turn: {
        onBegin: (G, ctx) => {
            // ctx.events.setActivePlayers({
            //     currentPlayer: { stage: 'selectPiece' },
            //     others: { stage: 'examinePiece' }
            // });
            unmarkValidMoves(G);
            markValidPieces(G);
            // G.stage = "Select a piece";
            // ctx.events.setStage('selectPiece');
        },
        stages: {
            examinePiece: {
                moves: {
                    clickSquare: (G, ctx, index) => {

                    },
                    clickPiece: (G, ctx, index) => {

                    }
                }
            },
            movePiece: {
                moves: {
                    loadPiece: (G, ctx) => {
                        if (G.activePiece.type == "F") {
                            unmarkValidMoves(G);
                            markValidLoads(G);
                            G.activeSquare = G.squares[G.activePiece.currentSquare];
                            G.activePiece = null;
                            G.stage = "Select a piece to carry";
                            ctx.events.setStage('carry');
                        } else if (G.activePiece.type == "W") {
                            let activeSquare = G.squares[G.activePiece.currentSquare];
                            G.load = activeSquare.stack[activeSquare.stack.length - 2];
                            if (!G.load) {
                                G.load = null;
                            }
                        }
                    },
                    unloadPiece: (G, ctx) => {
                        G.load = null;
                    },
                    clickSquare: (G, ctx, id) => {
                        G.activeSquare = G.squares[id];
                    },
                    cancel: (G, ctx) => {
                        G.load = null;
                        G.activeSquare = G.squares[G.activePiece.currentSquare];
                        G.stage = "Select a piece";
                        ctx.events.endStage();
                    },
                    confirm: (G, ctx) => {
                        let destID = G.activeSquare.id;
                        let initialID = G.activePiece.currentSquare;

                        if (G.activePiece.type == "W" && G.load !== null) {
                            G.load.currentSquare = destID;
                            G.squares[destID].stack.push(G.load);
                            G.squares[destID].stackHeight += heightMap.get(G.load.type);
                        }
                        G.activePiece.currentSquare = destID;
                        G.squares[destID].stack.push(G.activePiece);
                        G.squares[destID].stackHeight += heightMap.get(G.activePiece.type);
                        if (G.activePiece.type == "E" && G.load !== null) {
                            G.load.currentSquare = destID;
                            G.squares[destID].stack.push(G.load);
                            G.squares[destID].stackHeight += heightMap.get(G.load.type);
                        }

                        G.squares[initialID].stack.pop();
                        G.squares[initialID].stackHeight -= heightMap.get(G.activePiece.type);
                        if (G.load !== null && (G.activePiece.type == "W" || G.activePiece.type == "E") && G.stage != "Select a space to move load") {
                            G.squares[initialID].stack.pop();
                            G.squares[initialID].stackHeight -= heightMap.get(G.activePiece.type);
                        }
                        G.load = null;
                        G.activePiece = null;
                        unmarkValidMoves(G);
                        G.activeSquare = null;
                        G.stage = "Select a piece";
                        // ctx.events.setStage('selectPiece');
                        ctx.events.endTurn();
                    }
                }
            },
            carry: {
                moves: {
                    clickSquare: (G, ctx, id) => {
                        let clickedSquare = G.squares[id];
                        if (clickedSquare.valid) {
                            G.activePiece = clickedSquare.stack[clickedSquare.stack.length - 1];
                        }
                    },
                    confirm: (G, ctx) => {
                        let destID = G.activeSquare.id;
                        let initialID = G.activePiece.currentSquare;

                        G.squares[destID].stack.push(G.activePiece);
                        G.squares[destID].stackHeight += heightMap.get(G.activePiece.type);

                        G.squares[initialID].stack.pop();
                        G.squares[initialID].stackHeight -= heightMap.get(G.activePiece.type);
                        G.squares[destID].stack[G.squares[destID].stack.length - 1].currentSquare = destID;

                        G.activePiece = null;
                        unmarkValidMoves(G);
                        G.activeSquare = null;
                        G.stage = "Select a piece";
                        ctx.events.endTurn();
                    },
                    cancel: (G, ctx) => {
                        G.activePiece = G.activeSquare.stack[G.activeSquare.stack.length - 1];
                        markValidMoves(G);
                        G.stage = "Select a space to move";
                        ctx.events.setStage('movePiece');
                    }
                }
            },
            moveLoad: {
                moves: {
                    clickSquare: (G, ctx, id) => {
                        console.log("HERE");
                        G.activePiece = G.load;
                    },
                    confirm: (G, ctx) => {

                    },
                    cancel: (G, ctx) => {

                    }
                }
            }
        }
    },

    endIf: (G, ctx) => {
        // if(isVictory(G)) {
        //     return { winner: ctx.currentPlayer };
        // }
        // if(isDraw(G)) {
        //     return { draw: true };
        // }
    }
};