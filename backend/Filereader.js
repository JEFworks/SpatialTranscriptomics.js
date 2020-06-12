const PORT = 4000;

const cors = require("cors");
const express = require("express");
const router = express.Router();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const fs = require("fs");
const es = require("event-stream");

const { SparseMatrix } = require("ml-sparse-matrix");

app.get("/:count/:numBatches", function (req, res) {
  const count = Number.parseInt(req.params.count);
  const numBatches = Number.parseInt(req.params.numBatches);

  if (count < 0 || numBatches < 0 || count > numBatches) {
    res.status(400).send("GET request has invalid parameters.\n");
    return 0;
  }

  const instream = fs.createReadStream("../data/matrix/matrix.mtx");
  instream.on("error", function () {
    res.status(400).send("Matrix file was not found.\n");
    return 0;
  });

  let matrix = null;
  let rows = null;
  let cols = null;
  let numElements = null;

  let maxLine = null;
  let minLine = null;
  let lineCount = 0;
  let lastLineReached = false;
  let indexLineReached = false;

  instream.pipe(es.split()).pipe(
    es
      .mapSync(function (line) {
        if (line.trim().charAt(0) !== "%" && !lastLineReached) {
          if (!indexLineReached) {
            const delimited = line.split(" ");
            rows = Number.parseInt(delimited[0]);
            cols = Number.parseInt(delimited[1]);
            numElements = Number.parseInt(delimited[2]);
            if (
              Number.isNaN(rows) ||
              Number.isNaN(cols) ||
              Number.isNaN(numElements) ||
              numElements > rows * cols
            ) {
              lastLineReached = true;
            } else {
              maxLine = Math.min(
                (count + 1) * Math.ceil(numElements / numBatches) +
                  lineCount +
                  1,
                numElements + lineCount + 1
              );
              minLine =
                count * Math.ceil(numElements / numBatches) + lineCount + 1;
              matrix = new SparseMatrix(rows, cols);
              indexLineReached = true;
            }
          }
          if (lineCount >= minLine && lineCount < maxLine) {
            const delimited = line.split(" ");
            const i = Number.parseInt(delimited[0]);
            const j = Number.parseInt(delimited[1]);
            const value = Number.parseInt(delimited[2]);
            if (
              Number.isNaN(i) ||
              Number.isNaN(j) ||
              Number.isNaN(value) ||
              i > rows ||
              j > cols
            ) {
              matrix = null;
              lastLineReached = true;
            } else if (matrix) {
              matrix.set(i, j, value);
            }
          } else if (lineCount >= maxLine) {
            lastLineReached = true;
          }
        } else if (lastLineReached) {
          return 0;
        }
        lineCount++;
      })
      .on("end", function () {
        console.log(minLine + " -> " + maxLine);
        if (matrix) {
          console.log(
            "Sparse matrix with " +
              matrix.elements.distinct +
              " non-zero elements sent successfully."
          );
          res.json(
            JSON.stringify({
              rows: matrix.rows,
              columns: matrix.columns,
              elements: matrix.elements,
              count: count,
            })
          );
        } else {
          console.log(
            "GET request unsuccessful due to improperly formatted .mtx file."
          );
          res
            .status(400)
            .send(
              "GET request unsuccessful due to improperly formatted .mtx file.\n"
            );
        }
      })
  );
});

app.use("/", router);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
