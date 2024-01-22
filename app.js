/* Modules de base */
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";

/* Bibliothèques externes */
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { buildSchema } from "graphql";
import { graphqlHTTP } from "express-graphql";

/* Modules internes */
import apiRouter from "./routes/api.js";

/* Middlewares */
import bodyParser from "body-parser";
import session from "express-session";

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => {
    return "Hello world!";
  },
};

const app = express();
const port = 8080;

const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "twig");
app.set("views", "./views");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

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

app.use((req, res, next) => {
  res.locals.pages = [
    { name: "Accueil", url: "/home" },
    { name: "Messagerie", url: "/chat" },
    { name: "Télécharger", url: "/download" },
    { name: "Not Found", url: "/undefined"},
    { name: "API", url: "/api" },
    { name: "Se déconnecter", url: "/logout" },
  ];
  next();
});

const checkLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.render("unauthorized");
  }
};

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

app.get("/logout", checkLogin, (req, res) => {
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

app.get("/chat", (req, res) => {
  res.render("chat", { activePage: "/chat" });
});

app.use((req, res, next) => {
  res.status(404).render("notFound");
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});
