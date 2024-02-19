const notFound = (req, res, next) => {
  res.status(404).render("notFound");
};

export default notFound;
