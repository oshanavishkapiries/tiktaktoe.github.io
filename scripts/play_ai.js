const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const restartButton = document.getElementById("restartButton");

let isXTurn = true;
const X_CLASS = "x";
const O_CLASS = "o";
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

cellElements.forEach((cell) => {
  cell.addEventListener("click", handleClick, { once: true });
});

restartButton.addEventListener("click", restartGame);

function handleClick(e) {
  const cell = e.target;
  const currentClass = isXTurn ? X_CLASS : O_CLASS;
  placeMark(cell, currentClass);

  if (checkWin(currentClass)) {
    endGame(false, currentClass);
  } else if (isDraw()) {
    endGame(true);
  } else {
    isXTurn = !isXTurn;
    setBoardHoverClass();
    if (!isXTurn) {
      aiMove();
    }
  }
}

function placeMark(cell, currentClass) {
  cell.classList.add(currentClass);
}

function setBoardHoverClass() {
  board.classList.remove(X_CLASS);
  board.classList.remove(O_CLASS);
  if (isXTurn) {
    board.classList.add(X_CLASS);
  } else {
    board.classList.add(O_CLASS);
  }
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((index) => {
      return cellElements[index].classList.contains(currentClass);
    });
  });
}

function isDraw() {
  return [...cellElements].every((cell) => {
    return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
  });
}

function endGame(draw, winner) {
  if (draw) {
    modalMessage.innerText = "It's a draw!";
  } else {
    modalMessage.innerText = `${winner.toUpperCase()} wins!`;
  }
  modal.style.display = "flex";
}

function restartGame() {
  isXTurn = true;
  cellElements.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(O_CLASS);
    cell.addEventListener("click", handleClick, { once: true });
  });
  setBoardHoverClass();
  modal.style.display = "none";
}

function aiMove() {
  const availableCells = [...cellElements].filter(
    (cell) =>
      !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)
  );
  if (availableCells.length === 0) return;
  const randomCell =
    availableCells[Math.floor(Math.random() * availableCells.length)];
  randomCell.click();
}

setBoardHoverClass();
