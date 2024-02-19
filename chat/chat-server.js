import { Server } from "socket.io";

const setupSocket = (server) => {
  const io = new Server(server);

  let messagesHistory = [];

  io.on("connection", (socket) => {
    socket.on("userConnection", (username) => {
      socket.emit("messagesHistory", messagesHistory);
      socket.broadcast.emit("notif", username + " a rejoint le chat");
    });
    socket.on("userDeconnection", (username) => {
      socket.broadcast.emit("notif", username + " a quitté le chat");
    });
    socket.on("typing", (username) => {
      socket.broadcast.emit("notif", username + " est en train d'écrire...");
    });
    socket.on("stopTyping", () => {
      socket.broadcast.emit("stopTyping");
    });
    socket.on("chat", (msg) => {
      const badWords = ["merde", "putain", "connard", "fils de pute"];

      const containsBadWord = badWords.some((badWord) => {
        return msg.text.toLowerCase().includes(badWord);
      });

      if (containsBadWord) {
        badWords.forEach((badWord) => {
          const regex = new RegExp(badWord, "gi");
          msg.text = msg.text.replace(regex, (match) =>
            "*".repeat(match.length)
          );
        });
      }

      messagesHistory.push(msg);

      socket.broadcast.emit("chat", msg);
    });
  });
};

export default setupSocket;
