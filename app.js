/* Modules de base */
import path from "path";
import { fileURLToPath } from "url";

/* Bibliothèques externes */
import express from "express";
import { createServer } from "http";
import { graphql, buildSchema } from "graphql";
import { graphqlHTTP } from "express-graphql";

/* Modules internes */
import apiRouter from "./routes/api.js";
import router from "./routes/staticRoute.js";
import setupSocket from "./chat/chat-server.js";
import { schema, root } from "./graphql/graphql.js";

/* Middlewares */
import bodyParser from "body-parser";
import session from "express-session";
import errorHandler from "./middleware/authentication/error.middleware.js";
import menuManagement from "./middleware/menu-management.middleware.js";
import notFound from "./middleware/not-found.middleware.js";

const app = express();
const port = parseInt(process.env.PORT, 10);

const server = createServer(app);
setupSocket(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

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

app.use(menuManagement);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(router);
app.use("/api", apiRouter);

app.use(notFound);

server.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
