const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");

let isXTurn = true;

cellElements.forEach((cell) => {
  cell.addEventListener("click", handleClick, { once: true });
});

function handleClick(e) {
  const cell = e.target;
  placeMark(cell, isXTurn);
  isXTurn = !isXTurn;
  setBoardHoverClass();
}

function placeMark(cell, isXTurn) {
  const currentClass = isXTurn ? "x" : "o";
  cell.classList.add(currentClass);
}

setBoardHoverClass();
function setBoardHoverClass() {
  board.classList.remove("x");
  board.classList.remove("o");
  if (isXTurn) {
    board.classList.add("x");
  } else {
    board.classList.add("o");
  }
}





// function simulateClicks() {
//     cellElements[0].dispatchEvent(new Event('click'));
//     cellElements[1].dispatchEvent(new Event('click'));
//     cellElements[2].dispatchEvent(new Event('click'));
//   }
  
  
//   simulateClicks();