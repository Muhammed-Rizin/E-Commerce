const notlogged = (req, res, next) => {
  try {
    if (req.session.Admin) {
      res.redirect("/admin/dashboard");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
const Logged = (req, res, next) => {
  try {
    if (req.session.Admin) {
      next();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  Logged,
  notlogged,
};
