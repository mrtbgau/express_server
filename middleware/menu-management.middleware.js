const menuManagement = (req, res, next) => {
  res.locals.pages = [
    { name: "Accueil", url: "/home" },
    { name: "API", url: "/api" },
    { name: "Messagerie", url: "/chat" },
    { name: "Télécharger", url: "/download" },
    { name: "Not Found", url: "/undefined" },
    { name: "Se déconnecter", url: "/logout" },
  ];
  next();
};

export default menuManagement;
