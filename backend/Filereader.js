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

  let filePath =
    "../data/filtered_feature_bc_matrix/filtered/filtered_matrix.mtx";
  // filePath = "../data/filtered_feature_bc_matrix/matrix.mtx";
  const instream = fs.createReadStream(filePath);
  instream.on("error", function () {
    res.status(400).send("Matrix file was not found.\n");
    return 0;
  });

  let matrix = null;
  let rows = null;
  let cols = null;
  let minRow = null;
  let maxRow = null;

  let exit = false;
  let indexLineReached = false;

  instream.pipe(es.split()).pipe(
    es
      .mapSync(function (line) {
        if (line.trim().charAt(0) !== "%" && !exit) {
          if (!indexLineReached) {
            const delimited = line.split(" ");
            rows = Number.parseInt(delimited[0]);
            cols = Number.parseInt(delimited[1]);
            if (
              Number.isNaN(rows) ||
              Number.isNaN(cols) ||
              Number.isNaN(Number.parseInt(delimited[2])) ||
              Number.parseInt(delimited[2]) > rows * cols
            ) {
              exit = true;
            } else {
              minRow = 1 + count * Math.ceil(rows / numBatches);
              maxRow = 1 + (count + 1) * Math.ceil(rows / numBatches);
              console.log(minRow + " -> " + maxRow);
              matrix = new SparseMatrix(rows, cols);
              indexLineReached = true;
            }
          } else {
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
              if (line.trim().length !== 0) {
                exit = true;
              }
            } else if (matrix && i >= minRow && i < maxRow) {
              matrix.set(i - 1, j - 1, value);
            }
          }
        } else if (exit) {
          return 0;
        }
      })
      .on("end", function () {
        if (matrix && !exit) {
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
