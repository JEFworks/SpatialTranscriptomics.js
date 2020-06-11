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

const { SparseMatrix } = require("ml-sparse-matrix");

app.get("/:count/:numBatches", function (req, res) {
  const count = Number.parseInt(req.params.count);
  const numBatches = Number.parseInt(req.params.numBatches);
  const matrix = new SparseMatrix(31053, 2698);

  const instream = fs.createReadStream("../data/matrix/matrix.mtx");
  const outstream = new stream();
  const rl = readline.createInterface(instream, outstream);

  const numElements = Math.ceil(15430028 / numBatches);
  const maxLine = Math.min((count + 1) * numElements + 2, 15430028 + 2);
  const minLine = count * numElements + 2;
  console.log(minLine + " -> " + maxLine);
  let lineCount = 0;

  rl.on("line", function (line) {
    if (lineCount >= maxLine) {
      rl.close();
      rl.removeAllListeners();
    }
    if (lineCount >= minLine && lineCount < maxLine) {
      const delimited = line.split(" ");
      try {
        const i = Number.parseInt(delimited[0]);
        const j = Number.parseInt(delimited[1]);
        const value = Number.parseInt(delimited[2]);
        matrix.set(i, j, value);
      } catch (e) {}
    }
    lineCount++;
  }).on("close", function () {
    console.log("done");
    rl.removeAllListeners();
    res.json(
      JSON.stringify({
        rows: matrix.rows,
        columns: matrix.columns,
        elements: matrix.elements,
        count: count,
      })
    );
  });
});

app.use("/", router);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
