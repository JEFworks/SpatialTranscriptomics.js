const PORT = 4000;

const express = require("express");
const cors = require("cors");
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const fs = require("fs");
const readline = require("readline");
const stream = require("stream");

app.get("/", function (req, res) {
  const array = new Array(31053).fill(0);
  for (let i = 0; i < array.length; i++) {
    array[i] = new Array(2698).fill(0);
  }
  const instream = fs.createReadStream("../data/matrix/matrix.mtx");
  const outstream = new stream();
  const rl = readline.createInterface(instream, outstream);
  console.log("Running...");
  var lineCount = 0;

  rl.on("line", function (line) {
    if (lineCount > 3000000) {
      rl.close();
      rl.removeAllListeners();
    }
    lineCount++;
    const delimited = line.split(" ");
    try {
      const i = Number.parseInt(delimited[0]);
      const j = Number.parseInt(delimited[1]);
      const value = Number.parseInt(delimited[2]);
      array[i][j] = value;
    } catch (e) {}
  }).on("close", function () {
    rl.removeAllListeners();
    res.json(JSON.stringify(array));
  });
});

app.use("/", router);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
