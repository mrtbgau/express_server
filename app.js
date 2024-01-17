import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "node:fs";
import { createServer } from "http";
import { Server } from "socket.io";
import { buildSchema } from "graphql";
import { graphqlHTTP } from "express-graphql";
import { PrismaClient } from "@prisma/client";

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

const prisma = new PrismaClient();

const app = express();
const port = 8080;

const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "twig");
app.set("views", "./views");
app.set("prisma", prisma);

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

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use((req, res, next) => {
  res.locals.pages = [
    { name: "Accueil", url: "/home" },
    { name: "Chapitre 1", url: "/chapter/1" },
    { name: "Messagerie", url: "/chat" },
    { name: "Autres", url: "/about" },
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

app.get("/chapter/:num", checkLogin, (req, res) => {
  const num = req.params.num;
  res.render("chapter", { num, activePage: `/chapter/${num}` });
});

app.get("/about", checkLogin, (req, res) => {
  res.render("about", { activePage: "/about" });
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

app.get("/styles", async (req, res) => {
  const styles = await prisma.style.findMany();
  res.json(styles);
});

app.get("/artistes", async (req, res) => {
  const artistes = await prisma.artiste.findMany();
  res.json(artistes);
});

app.get("/villes/:num/concerts", async (req, res) => {
  const num = req.params.num;
  const concertsParVille = await prisma.concert.findMany({
    select: {
      idConcert: true,
      Ville: {
        select: {
          nom: true,
        },
      },
    },
    where: {
      idVille: parseInt(num),
    },
  });
  res.json(concertsParVille);
});

app.get("/villes/:num/visiteurs", async (req, res) => {
  const num = req.params.num;
  const visiteursParVille = await prisma.visiteur.findMany({
    select: {
      idVisiteur: true,
      Ville: {
        select: {
          nom: true,
        },
      },
    },
    where: {
      idVille: parseInt(num),
    },
  });
  res.json(visiteursParVille);
});

app.get("/artistes/:num/concerts", async (req, res) => {
  const num = req.params.num;
  const concertsParArtistes = await prisma.artiste.findMany({
    select: {
      pseudo: true,
      Realise: {
        select: {
          Concert: {
            select: {
              idConcert: true,
            },
          },
        },
      },
    },
    where: {
      IdArtiste: parseInt(num),
    },
  });
  res.json(concertsParArtistes);
});

app.get("/villes/:numVille/styles/:numStyle/concerts", async (req, res) => {
  const numVille = req.params.numVille;
  const numStyle = req.params.numStyle;

  const concerts = await prisma.concert.findMany({
    select: {
      idConcert: true,
    },
    where: {
      Joue: {
        some: {
          Style: {
            idStyle: parseInt(numStyle),
          },
        },
      },
      idVille: parseInt(numVille),
    },
  });

  res.json(concerts);
});

app.use((req, res, next) => {
  res.status(404).render("notFound");
});

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});
