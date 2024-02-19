/* Modules de base */
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";

/* Bibliothèques externes */
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

/* Modules internes */
import apiRouter from "./routes/api.js";

/* Middlewares */
import bodyParser from "body-parser";
import session from "express-session";
import errorHandler from "./middleware/authentication/error.middleware.js";
import menuManagement from "./middleware/menu-management.middleware.js";
import checkLogin from "./middleware/check-login.middleware.js";

const app = express();
const port = parseInt(process.env.PORT, 10);

const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "twig");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(menuManagement);

server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  if (login === "admin" && password === "admin") {
    req.session.user = login;
    res.redirect("/home");
  } else {
    res.send("Identifiants invalides");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    console.log("Déconnecté");
  });
  res.redirect("/login");
});

app.get("/home", checkLogin, (req, res) => {
  res.render("home", { activePage: "/home" });
});

app.get("/api", checkLogin, (req, res) => {
  res.render("api", { activePage: "/api" });
});

app.get("/download", checkLogin, async (req, res) => {
  const currentDate = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const formattedDate = `${currentDate.slice(0, 4)}-${currentDate.slice(
    4,
    6
  )}-${currentDate.slice(6, 8)}_${currentDate.slice(8, 10)}-${currentDate.slice(
    10,
    12
  )}-${currentDate.slice(12, 14)}`;

  const file = path.join("downloads", `${formattedDate}.txt`);

  fs.writeFileSync(file, formattedDate, { encoding: "utf-8" });

  res.download(file, (error) => {
    console.log(error);
  });
});

app.get("/chat", checkLogin, (req, res) => {
  res.render("chat", { activePage: "/chat" });
});

app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).render("notFound");
});

io.on("connection", (socket) => {
  socket.on("userConnection", (username) => {
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

    // Vérifier si le message contient des mots interdits
    const containsBadWord = badWords.some((badWord) => {
      // Utiliser includes() pour vérifier la présence du mot interdit (insensible à la casse)
      return msg.text.toLowerCase().includes(badWord);
    });

    // Si le message contient un mot interdit, le remplacer par des astérisques
    if (containsBadWord) {
      // Remplacer chaque occurrence du mot interdit par des astérisques
      badWords.forEach((badWord) => {
        const regex = new RegExp(badWord, "gi");
        msg.text = msg.text.replace(regex, (match) => "*".repeat(match.length));
      });
    }

    socket.broadcast.emit("chat", msg);
  });
});
