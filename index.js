const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const path = require("path");
const router = require("./routes");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//route
app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.get("/uploads/:filename", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", req.params.filename));
});

app.use("/api", router);

//start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
