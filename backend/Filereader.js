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

  const instream = fs.createReadStream("../data/matrix/matrix.mtx");
  const outstream = new stream();
  const rl = readline.createInterface(instream, outstream);

  let matrix = null;
  let rows = null;
  let cols = null;
  let numElements = null;

  let maxLine = null;
  let minLine = null;
  let lineCount = 0;
  let lastLineReached = false;
  let indexLineReached = false;

  rl.on("line", function (line) {
    if (line.trim().charAt(0) !== "%" && !lastLineReached) {
      if (!indexLineReached) {
        const delimited = line.split(" ");
        rows = Number.parseInt(delimited[0]);
        cols = Number.parseInt(delimited[1]);
        numElements = Number.parseInt(delimited[2]);
        if (
          Number.isNaN(rows) ||
          Number.isNaN(cols) ||
          Number.isNaN(numElements)
        ) {
          console.log("Matrix file is not properly formatted.");
          lastLineReached = true;
        } else {
          maxLine = Math.min(
            (count + 1) * Math.ceil(numElements / numBatches) + lineCount + 1,
            numElements + lineCount + 1
          );
          minLine = count * Math.ceil(numElements / numBatches) + lineCount + 1;
          matrix = new SparseMatrix(rows, cols);
          console.log(minLine + " -> " + maxLine);
          indexLineReached = true;
        }
      }
      if (lineCount >= minLine && lineCount < maxLine) {
        const delimited = line.split(" ");
        const i = Number.parseInt(delimited[0]);
        const j = Number.parseInt(delimited[1]);
        const value = Number.parseInt(delimited[2]);
        if (Number.isNaN(i) || Number.isNaN(j) || Number.isNaN(value)) {
          console.log("Matrix file is not properly formatted.");
          matrix = null;
        } else if (i > rows || j > cols) {
          console.log("Matrix file is not properly formatted.");
          matrix = null;
        } else if (matrix) {
          matrix.set(i, j, value);
        }
      } else if (lineCount >= maxLine) {
        lastLineReached = true;
      }
    } else if (lastLineReached) {
      rl.close();
      rl.removeAllListeners();
    }
    lineCount++;
  }).on("close", function () {
    if (matrix) {
      console.log("done");
      res.json(
        JSON.stringify({
          rows: matrix.rows,
          columns: matrix.columns,
          elements: matrix.elements,
          count: count,
        })
      );
    } else {
      res.status(400).send("Matrix file is not properly formatted.");
    }
  });
});

app.use("/", router);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
