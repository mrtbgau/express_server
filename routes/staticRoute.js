import checkLogin from "../middleware/check-login.middleware.js";
import fs from "node:fs";
import { Router } from "express";
const router = Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  if (login === "admin" && password === "admin") {
    req.session.user = login;
    res.redirect("/home");
  } else {
    res.send("Identifiants invalides");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    console.log("Déconnecté");
  });
  res.redirect("/login");
});

router.get("/home", checkLogin, (req, res) => {
  res.render("home", { activePage: "/home" });
});

router.get("/api", checkLogin, (req, res) => {
  res.render("api", { activePage: "/api" });
});

router.get("/download", checkLogin, async (req, res) => {
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

router.get("/chat", checkLogin, (req, res) => {
  res.render("chat", { activePage: "/chat" });
});

export default router;
