const messages = document.querySelector(".messages");
const join = document.querySelector(".join");
const btnJoin = document.querySelector("#btnJoin");
const btnSend = document.querySelector("#btnSend");
const messageInput = document.querySelector(".messages input");

const socket = io();

let pseudo;

btnJoin.addEventListener("click", () => {
  messages.classList.remove("disable");
  join.style.display = "none";

  let username = document.querySelector("#pseudo").value;
  if (username.length == 0) {
    alert("Saisis ton pseudo");
    messages.classList.add("disable");
    join.style.display = "flex";
  }
  socket.emit("userConnection", username);
  pseudo = username;
});

btnSend.addEventListener("click", () => {
  let message = messageInput.value;

  if (message.length != 0) {
    send("me", {
      pseudo: pseudo,
      text: message,
    });

    socket.emit("chat", {
      pseudo: pseudo,
      text: message,
    });

    messageInput.value = "";
  } else {
    alert("Saisis ton message");
  }
});

socket.on("notif", (notif) => {
  send("notif", notif);
});

socket.on("chat", (chat) => {
  send("other", chat);
});

function send(type, content) {
  switch (type) {
    case "notif":
      let divNotif = document.createElement("div");
      divNotif.classList.add("notif");
      divNotif.innerText = content;
      messages.appendChild(divNotif);
      break;
    case "me":
      let divMe = document.createElement("div");
      divMe.classList.add("message", "my-message");
      divMe.innerHTML = `<div class="name">You</div>
      <div class="text">${content.message}</div>`;
      messages.appendChild(divMe);
      break;
    case "other":
      let divOther = document.createElement("div");
      divOther.classList.add("message", "my-message");
      divOther.innerHTML = `<div class="name">${content.pseudo}</div>
      <div class="text">${content.message}</div>`;
      messages.appendChild(divOther);
      break;

    default:
      break;
  }
}
