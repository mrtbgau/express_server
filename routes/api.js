import { Router } from "express";
import express from "express";
import { PrismaClient } from "@prisma/client";

import validateAccessToken from "../middleware/authentication/auth0.middleware.js";

const app = express();

const apiRouter = Router();

const prisma = new PrismaClient();

app.set("prisma", prisma);

apiRouter.get("/styles", async (req, res) => {
  const styles = await prisma.style.findMany();
  res.json(styles);
});

apiRouter.get("/artistes", async (req, res) => {
  const artistes = await prisma.artiste.findMany();
  res.json(artistes);
});

apiRouter.get("/villes/:num/concerts", async (req, res) => {
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

apiRouter.get("/villes/:num/visiteurs", async (req, res) => {
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

apiRouter.get("/artistes/:num/concerts", async (req, res) => {
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

apiRouter.get(
  "/villes/:numVille/styles/:numStyle/concerts",
  async (req, res) => {
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
  }
);

apiRouter.get("/api/proportions", async (req, res) => {
  const numVille = req.params.numVille;
  const proportions = await prisma.ville.groupBy({
    by: ["idVille", { Joue: { idStyle: true } }],
    _count: {
      Joue: {
        distinct: true,
        idConcert: true,
      },
    },
    _sum: {
      Joue: {
        distinct: true,
        idConcert: true,
      },
    },
    _select: {
      Ville: {
        idVille: numVille,
        nom: true,
      },
      Joue: {
        Style: {
          libelle: true,
        },
      },
    },
    _orderBy: {
      idVille: "asc",
      Proportion: "desc",
    },
    _expression: {
      Proportion: `ROUND((COUNT(DISTINCT "J"."idConcert") / SUM(COUNT(DISTINCT "J"."idConcert")) OVER (PARTITION BY "V"."idVille")) * 100, 2)`,
    },
  });

  res.json(proportions);
});

export default apiRouter;
