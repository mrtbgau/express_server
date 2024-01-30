const messages = document.querySelector(".messages");
const join = document.querySelector(".join");
const btnJoin = document.querySelector("#btnJoin");
const btnSend = document.querySelector("#btnSend");
const messageInput = document.querySelector(".messages input");

const socket = io();

btnJoin.addEventListener("click", () => {
  messages.classList.remove("disable");
  join.style.display = "none";

  let username = document.querySelector("#pseudo").value;
  if (username.length == 0) {
    alert("Saisis ton pseudo");
    messages.classList.add("disable");
    join.style.display = "flex";
  }
  socket.emit("userConnection", send("notif", username));
});

btnSend.addEventListener("click", () => {
  let message = messageInput.value;

  if (message.length == 0) {
    alert("Saisis ton message");
  }
  messageInput.value = "";
});

function send(type, content) {
  switch (type) {
    case "notif":
      const div = document.createElement("div");
      div.classList.add("notif");
      div.innerHTML = `<p>${content} a rejoint le chat</p>`;
      messages.appendChild(div);
      break;
    // case "me":
    //   break;
    // case "other":
    //   break;

    default:
      break;
  }
}
