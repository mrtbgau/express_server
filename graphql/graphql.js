import { buildSchema } from "graphql";

const schema = buildSchema(`
  type Artiste {
    IdArtiste: Int
    pseudo: String
    idStyle: Int
    Style: Style
    Realise: [Realise]
  }

  type Concert {
    idConcert: Int
    dateConcert: String
    nbrPlaceDisponible: Int
    Ville: Ville
    Joue: [Joue]
    Participe: [Participe]
    Realise: [Realise]
  }

  type Ville {
    idVille: Int
    nom: String
    coordonnees: String
    Concert: [Concert]
    Visiteur: [Visiteur]
  }

  type Visiteur {
    idVisiteur: Int
    nom: String
    prenom: String
    email: String
    age: Int
    adresse: String
    idParrain: Int
    idVille: Int
    Participe: [Participe]
    Visiteur: Visiteur
    other_Visiteur: [Visiteur]
    Ville: Ville
  }

  type Realise {
    IdArtiste: Int
    idConcert: Int
    Artiste: Artiste
    Concert: Concert
  }

  type Style {
    idStyle: Int
    libelle: String
    description: String
    Artiste: [Artiste]
    Joue: [Joue]
  }

  type Participe {
    idConcert: Int
    idVisiteur: Int
    Concert: Concert
    Visiteur: Visiteur
  }

  type Joue {
    idConcert: Int
    idStyle: Int
    Concert: Concert
    Style: Style
  }

  type Query {
    artistes: [Artiste]
    concerts: [Concert]
    villes: [Ville]
    visiteurs: [Visiteur]
  }
`);

const root = {
  artistes: async () => {
    return await prisma.artiste.findMany();
  },
  concerts: async () => {
    return await prisma.concert.findMany();
  },
  villes: async () => {
    return await prisma.ville.findMany();
  },
  visiteurs: async () => {
    return await prisma.visiteur.findMany();
  },
};

export { schema, root };
