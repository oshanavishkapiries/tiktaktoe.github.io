const POCKETBASE_URL = "https://tiktaktoi-poketbase-server.glitch.me";
const COLLECTION_NAME = "games";
const cellElements = document.querySelectorAll("[data-cell]");
const board = document.getElementById("board");
const modal = document.getElementById("modal");
const join_modal = document.getElementById("join-modal");
const waiting_modal = document.getElementById("waiting-modal");
const modalMessage = document.getElementById("modal-message");
let gameId = null;
let currentPlayer = "player1";
let isXTurn = true;
let pollingInterval = null;

async function createGame() {
  const response = await fetch(
    `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player1: "player1",
        board: Array(9).fill(null),
        currentTurn: "player1",
        status: "waiting",
      }),
    }
  );
  const game = await response.json();
  return game.id;
}

async function joinGame(gameId) {
  const response = await fetch(
    `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records/${gameId}`
  );
  const game = await response.json();

  if (game.status !== "waiting") {
    throw new Error("Game is not available to join.");
  }

  await fetch(
    `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records/${gameId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player2: "player2",
        status: "in-progress",
      }),
    }
  );

  currentPlayer = "player2";
  updateBoard(game.board);
  setBoardHoverClass();
  startPolling(gameId);
}

async function updateGame(gameId, board, currentTurn) {
  await fetch(
    `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records/${gameId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board: board,
        currentTurn: currentTurn,
      }),
    }
  );
}

async function getGame(gameId) {
  const response = await fetch(
    `${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records/${gameId}`
  );
  return response.json();
}

function handleClick(e) {
  const cell = e.target;
  const cellIndex = Array.from(cellElements).indexOf(cell);

  getGame(gameId).then((game) => {
    if (game.currentTurn !== currentPlayer) return;

    game.board[cellIndex] = currentPlayer === "player1" ? "x" : "o";
    game.currentTurn = currentPlayer === "player1" ? "player2" : "player1";

    updateGame(gameId, game.board, game.currentTurn);
    updateBoard(game.board);
    isXTurn = !isXTurn;
    setBoardHoverClass();

    if (checkWin(game.board)) {
      endGame(currentPlayer === "player1" ? "You win!" : "Opponent wins!");
    } else if (checkDraw(game.board)) {
      endGame("It's a draw!");
    } else {
      toggleWaitingPopup(true);
    }
  });
}

function placeMark(cell, isXTurn) {
  const currentClass = isXTurn ? "x" : "o";
  cell.classList.add(currentClass);
}

function setBoardHoverClass() {
  board.classList.remove("x");
  board.classList.remove("o");
  if (isXTurn) {
    board.classList.add("x");
  } else {
    board.classList.add("o");
  }
}

function updateBoard(boardState) {
  cellElements.forEach((cell, index) => {
    cell.classList.remove("x", "o");
    if (boardState[index]) {
      cell.classList.add(boardState[index]);
    }
  });
}

function toggleWaitingPopup(show) {
  if (show) {
    waiting_modal.style.display = "flex";
  } else {
    waiting_modal.style.display = "none";
  }
}

function startPolling(gameId) {
  pollingInterval = setInterval(async () => {
    const game = await getGame(gameId);
    updateBoard(game.board);
    isXTurn = game.currentTurn === "player1";
    setBoardHoverClass();
    if (game.currentTurn === currentPlayer) {
      toggleWaitingPopup(false);
    }
    if (checkWin(game.board)) {
      endGame(
        game.currentTurn !== currentPlayer ? "You win!" : "Opponent wins!"
      );
      clearInterval(pollingInterval);
    } else if (checkDraw(game.board)) {
      endGame("It's a draw!");
      clearInterval(pollingInterval);
    }
  }, 3000);
}

restartButton.addEventListener("click", restartGame);

function restartGame() {
  window.location.href = "/tiktaktoe.github.io/play-online.html";
}

function checkWin(board) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  return winPatterns.some((pattern) => {
    const [a, b, c] = pattern;
    return board[a] && board[a] === board[b] && board[a] === board[c];
  });
}

function checkDraw(board) {
  return board.every((cell) => cell !== null);
}

function endGame(message) {
  modalMessage.innerText = message;
  modal.style.display = "flex";
}
join_modal.style.display = "flex";

document
  .getElementById("createGameButton")
  .addEventListener("click", async () => {
    if (gameId) {
      join_modal.style.display = "none";
      toggleWaitingPopup(false);
    } else {
      gameId = await createGame();
      const gameLink = `https://oshanavishkapiries.github.io/tiktaktoe.github.io/play-online.html?gameId=${gameId}`;
      document.getElementById("gameLink").value = gameLink;
      document.getElementById("createGameButton").innerText = "Play";
      toggleWaitingPopup(true);
      startPolling(gameId);
    }
});

document
  .getElementById("joinGameButton")
  .addEventListener("click", async () => {
    const gameIdInput = prompt("Enter Game ID:");
    gameId = gameIdInput;
    try {
      await joinGame(gameId);
      toggleWaitingPopup(true);
      join_modal.style.display = "none";
    } catch (error) {
      alert(error.message);
    }
});

const urlParams = new URLSearchParams(window.location.search);
const gameIdFromUrl = urlParams.get("gameId");
if (gameIdFromUrl) {
  gameId = gameIdFromUrl;
  joinGame(gameId)
    .then(() => {
      join_modal.style.display = "none";
    })
    .catch((error) => alert(error.message));
}

cellElements.forEach((cell) => {
  cell.addEventListener("click", handleClick, { once: true });
});

setBoardHoverClass();
