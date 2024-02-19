import {
  toggleJoinDisplay,
  sendMessageDisplay,
  sendMessage,
} from "./functions.js";

const messages = document.querySelector(".messages");
const join = document.querySelector(".join");
const btnJoin = document.querySelector("#btnJoin");
const btnSend = document.querySelector("#btnSend");
const messageInput = document.querySelector(".messages input");

const socket = io();

let pseudo;

const messagesHistory = [];

btnJoin.addEventListener("click", () => {
  toggleJoinDisplay(false, messages, join);

  const username = document.querySelector("#pseudo").value;

  if (username.length == 0) {
    alert("Saisis ton pseudo");
    toggleJoinDisplay(true, messages, join);
  }

  socket.emit("userConnection", username);
  pseudo = username;
});

messageInput.addEventListener("focus", () => {
  socket.emit("typing", pseudo);
});

messageInput.addEventListener("blur", () => {
  socket.emit("stopTyping");
});

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    messageInput.blur();
    sendMessage(messages, messageInput, pseudo, socket);
  }
});

btnSend.addEventListener("click", () => {
  sendMessage(messages, messageInput, pseudo, socket);
});

socket.on("notif", (notif) => {
  sendMessageDisplay("notif", notif, messages);
});

socket.on("chat", (chat) => {
  sendMessageDisplay("other", chat, messages);
});

socket.on("stopTyping", () => {
  if (messages.lastElementChild) {
    messages.removeChild(messages.lastElementChild);
  }
});

window.addEventListener("beforeunload", () => {
  socket.emit("userDeconnection", pseudo);
});
