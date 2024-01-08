import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";

const app = express();
const port = 8080;

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

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  res.locals.pages = [
    { name: "Accueil", url: "/home" },
    { name: "Chapitre 1", url: "/chapter/1" },
    { name: "About", url: "/about" },
  ];
  next();
});

const checkLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send("Non autorisé");
  }
};

app.listen(port, () => {
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
  res.render("home");
});

app.get("/chapter/:num", checkLogin, (req, res) => {
  const num = req.params.num;
  res.render("chapter", { num });
});

app.get("/about", checkLogin, (req, res) => {
  res.render("about");
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

app.use((req, res, next) => {
  res.status(404).render("404");
});
