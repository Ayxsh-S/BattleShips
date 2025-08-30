// const { Ship, GameBoard, Player } = require("./index.js");

// module.exports = {
//   testEnvironment: "node",
//   moduleNameMapper: {
//     "\\.css$": "<rootDir>/__mocks__/styleMock.js"
//   },
// };

// describe("Ship", () => {
//   test("initializes with defaults", () => {
//     const s = new Ship(3);
//     expect(s.length).toBe(3);
//     expect(s.timesHit).toBe(0);
//     expect(s.sunk).toBe(false);
//     expect(s.hitCells).toEqual([]);
//   });

//   test("hit records coords and increments timesHit", () => {
//     const s = new Ship(2);
//     s.hit(4, 7);
//     expect(s.timesHit).toBe(1);
//     expect(s.isHitAt(4, 7)).toBe(true);
//     expect(s.isHitAt(0, 0)).toBe(false);
//   });

//   test("isSunk toggles sunk when timesHit === length", () => {
//     const s = new Ship(2);
//     s.hit(0, 0);
//     s.isSunk();
//     expect(s.sunk).toBe(false);
//     s.hit(1, 0);
//     s.isSunk();
//     expect(s.sunk).toBe(true);
//   });
// });

// describe("GameBoard - placing ships", () => {
//   test("places a horizontal ship within bounds", () => {
//     const gb = new GameBoard();
//     const ship = new Ship(3, 0, false, "Cruiser");
//     const ok = gb.placeShip(ship, 2, 5, true);
//     expect(ok).toBe(true);
//     expect(gb.ships).toContain(ship);
//     expect(gb.board[5][2]).toBe(ship);
//     expect(gb.board[5][3]).toBe(ship);
//     expect(gb.board[5][4]).toBe(ship);
//   });

//   test("places a vertical ship within bounds", () => {
//     const gb = new GameBoard();
//     const ship = new Ship(4, 0, false, "Battleship");
//     const ok = gb.placeShip(ship, 0, 6, false);
//     expect(ok).toBe(true);
//     expect(gb.board[6][0]).toBe(ship);
//     expect(gb.board[7][0]).toBe(ship);
//     expect(gb.board[8][0]).toBe(ship);
//     expect(gb.board[9][0]).toBe(ship);
//   });

//   test("rejects placement that would go out of bounds (horizontal)", () => {
//     const gb = new GameBoard();
//     const ship = new Ship(5);
//     const ok = gb.placeShip(ship, 6, 2, true);
//     expect(ok).toBe(false);
//     expect(gb.ships).toHaveLength(0);
//   });

//   test("rejects placement that would overlap another ship", () => {
//     const gb = new GameBoard();
//     const s1 = new Ship(3);
//     const s2 = new Ship(2);
//     expect(gb.placeShip(s1, 1, 1, true)).toBe(true); 
//     expect(gb.placeShip(s2, 2, 1, false)).toBe(false);
//     expect(gb.ships).toEqual([s1]);
//   });
// });

// describe("GameBoard - hits & win condition", () => {
//   test("miss on empty water is recorded", () => {
//     const gb = new GameBoard();
//     const res = gb.receiveHit(0, 0);
//     expect(res).toEqual({ result: "miss", ship: null });
//     expect(gb.missedShots).toContainEqual([0, 0]);
//   });
//   test("hit and then sink a ship", () => {
//     const gb = new GameBoard();
//     const ship = new Ship(2, 0, false, "Destroyer");
//     gb.placeShip(ship, 3, 3, true); 
//     const r1 = gb.receiveHit(3, 3);
//     expect(r1.result).toBe("hit");
//     expect(ship.timesHit).toBe(1);
//     expect(ship.isHitAt(3, 3)).toBe(true);
//     expect(ship.sunk).toBe(false);
//     const r2 = gb.receiveHit(4, 3);
//     expect(r2.result).toBe("ship sunk");
//     expect(ship.sunk).toBe(true);
//     expect(gb.allShipsSunk()).toBe(true);
//   });

//   test("allShipsSunk is false until all ships are sunk", () => {
//     const gb = new GameBoard();
//     const a = new Ship(2);
//     const b = new Ship(3);
//     gb.placeShip(a, 0, 0, true); 
//     gb.placeShip(b, 0, 2, true); 
//     gb.receiveHit(0, 0);
//     gb.receiveHit(1, 0);
//     expect(a.sunk).toBe(true);
//     expect(b.sunk).toBe(false);
//     expect(gb.allShipsSunk()).toBe(false);
//     gb.receiveHit(0, 2);
//     gb.receiveHit(1, 2);
//     gb.receiveHit(2, 2);
//     expect(gb.allShipsSunk()).toBe(true);
//   });
// });

// describe("Player", () => {
//   test("initializes with a fresh board and defaults", () => {
//     const p = new Player("Alice");
//     expect(p.name).toBe("Alice");
//     expect(p.gameboard).toBeInstanceOf(GameBoard);
//     expect(p.isTurn).toBe(false);
//     expect(p.placedShips).toBe(0);
//   });
// });
