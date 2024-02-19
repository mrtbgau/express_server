export const toggleJoinDisplay = (display, divMessages, divJoin) => {
  divMessages.classList.toggle("disable", display);
  divJoin.style.display = display ? "flex" : "none";
};

export const sendMessageDisplay = (type, content, divMessages) => {
  const currentTime = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
  const hour = parseInt(currentTime.slice(8, 10)) + 1;
  const minute = currentTime.slice(10, 12);

  const div = document.createElement("div");

  if (type === "me" || type === "other") {
    div.classList.add("message", `${type}`);
    div.innerHTML = `<div><div class="name"><b>${
      type === "me" ? "moi" : content.pseudo
    }</b> ${hour}:${minute}</div><div class="text">${content.text}</div></div>`;
  } else {
    div.classList.add("notif");
    div.innerText = content;
  }
  divMessages.appendChild(div);
};

export const sendMessage = (divMessages, messageInput, pseudo, socket) => {
  messageInput.blur();

  let message = messageInput.value;

  if (message.length != 0) {
    const badWords = ["merde", "connard", "fils de pute", ""];

    const replacementChar = "*";

    badWords.forEach((word) => {
      message = message.replace(new RegExp(word, "gi"), (match) => {
        return replacementChar.repeat(match.length);
      });
    });

    sendMessageDisplay(
      "me",
      {
        pseudo: pseudo,
        text: message,
      },
      divMessages
    );

    socket.emit("chat", {
      pseudo: pseudo,
      text: message,
    });

    messageInput.value = "";
  } else {
    alert("Saisis ton message");
  }
};
