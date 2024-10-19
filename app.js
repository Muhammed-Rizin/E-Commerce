const mongoose = require("mongoose");
const Express = require("express");
const app = Express();
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const oneDay = 1000 * 60 * 60 * 24;

const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.mongoDb)
  .then(() => console.log("Mongodb Server Connected"))
  .catch(() => console.log("Server Not Connected "));

app.use(Express.json());
app.use(Express.static(path.join(__dirname, "./public")));
app.use(Express.urlencoded({ extended: true }));
app.set("views");
app.set("view engine", "ejs");

app.use(
  session({
    secret: "rizin",
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: oneDay },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.set("Cache-control", "no-store,no-cache");
  next();
});

const userRoutes = require("./Routes/userRoute");
const adminRoute = require("./Routes/adminRoute");

app.use("/", userRoutes);
app.use("/admin", adminRoute);
app.use((req, res) => {
  try {
    res.status(404).render("user/404");
  } catch (error) {
    console.log(error.message);
    res.render("user/505");
  }
});

app.listen(5000, () => console.log("Server Connected"));
