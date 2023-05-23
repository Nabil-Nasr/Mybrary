export const globalError = (err, req, res, next) => {
  if (err.statusCode == 404) {
    err.ejsView="errors/404"
  }
  res.status(err.statusCode).render(err.ejsView, err.ejsOptions);
};
