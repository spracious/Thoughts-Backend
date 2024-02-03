const path = require("path");
let mongoose = require("mongoose");
let express = require("express");
const cors = require("cors");
let app = express();
require("dotenv").config();

let cinema = require("./routes/cinema");
const user = require("./routes/user");
const branch = require("./routes/branch");
const theater = require("./routes/theater");
const category = require("./routes/category");
const verification = require("./routes/verification");
const websettings = require("./routes/websettings");
const seat = require("./routes/seat");
const movieschedule = require("./routes/movieschedule");
const movie = require("./routes/movie");
const review = require("./routes/review");
const screen = require("./routes/screen");
const booking = require("./routes/booking");
const management = require("./routes/management");
const location = require("./routes/location");
const auth = require("./routes/auth");
const payment = require("./routes/transaction");
const genre = require("./routes/genre");
const admin = require("./routes/admin");

let PORT = process.env.PORT;
let MONGO_URL = process.env.MONGO_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("open", () => console.log("Mongo Server connected"));
mongoose.connection.on("error", (err) => console.log(err.message));

// app.get("/", (req, res) => {
//   // res.json({
//   //   msg: "Api is running",
//   // });
//   res.status(200).render("activate");
// });

app.use("/api/v1/cinemas", cinema);
app.use("/api/v1/users", user);
app.use("/api/v1/branches", branch);
app.use("/api/v1/categories", category);
app.use("/api/v1/theaters", theater);
app.use("/api/v1/verifications", verification);
app.use("/api/v1/websettings", websettings);
app.use("/api/v1/seats", seat);
app.use("/api/v1/movieschedule", movieschedule);
app.use("/api/v1/movies", movie);
app.use("/api/v1/reviews", review);
app.use("/api/v1/screens", screen);
app.use("/api/v1/bookings", booking);
app.use("/api/v1/auth", auth);
app.use("/api/v1/managements", management);
app.use("/api/v1/locations", location);
app.use("/api/v1/payments", payment);
app.use("/api/v1/genres", genre);
app.use("/api/v1/admins", admin);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT);
console.log("App runnning on port:" + PORT);
