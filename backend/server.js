const PORT = 4000;

const cors = require("cors");
const express = require("express");
const router = express.Router();
const app = express();
const multer = require("multer");
const shell = require("shelljs");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const fs = require("fs");
const es = require("event-stream");

const { SparseMatrix } = require("ml-sparse-matrix");

const filesMap = new Map(); // map of all user sessions and their associated files
const defaultFileNum = 0; // 0 is filtered coronal brains, 1 is original coronal brain, 2 is olfactory bulb

const storage = multer.diskStorage({
  destination: function (req, _file, cb) {
    shell.mkdir("-p", "./data/" + req.params.uuid);
    const path = "data/" + req.params.uuid + "/";
    cb(null, path);
  },
  filename: function (_req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("file");

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/upload/:uuid", function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }

    const files = req.files;
    const paths = {
      matrix: null,
      features: null,
      barcodes: null,
      pixels: null,
    };

    paths.matrix = files[0].path;
    paths.features = files[1].path;
    paths.barcodes = files[2].path;
    paths.pixels = files[3].path;

    filesMap.set(req.params.uuid, paths);
    return res.status(200).send(req.file);
  });
});

app.get("/matrix/:uuid/:count/:numBatches", function (req, res) {
  const count = Number.parseInt(req.params.count);
  const numBatches = Number.parseInt(req.params.numBatches);

  if (count < 0 || numBatches < 0 || count > numBatches) {
    res.status(400).send("GET request has invalid parameters.\n");
    return 0;
  }

  let filePath =
    defaultFileNum === 0
      ? "./example_data/coronal_brain/filtered_feature_bc_matrix/filtered/filtered_matrix.mtx"
      : defaultFileNum === 1
      ? "./example_data/coronal_brain/filtered_feature_bc_matrix/matrix.mtx"
      : "./example_data/olfactory_bulb/filtered_feature_bc_matrix/matrix.mtx";
  const files = filesMap.get(req.params.uuid);
  if (files != null && files.matrix != null) {
    filePath = files.matrix;
  }

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
              maxRow = Math.min(
                1 + (count + 1) * Math.ceil(rows / numBatches),
                1 + rows
              );
              console.log("Sending genes [" + minRow + "," + maxRow + ")");
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
            })
          );
        } else {
          res
            .status(400)
            .send(
              "GET request unsuccessful due to improperly formatted .mtx file.\n"
            );
        }
      })
  );
});

app.get("/features/:uuid", function (req, res) {
  let filePath =
    defaultFileNum === 0
      ? "./example_data/coronal_brain/filtered_feature_bc_matrix/filtered/filtered_features.tsv"
      : defaultFileNum === 1
      ? "./example_data/coronal_brain/filtered_feature_bc_matrix/features.tsv"
      : "./example_data/olfactory_bulb/filtered_feature_bc_matrix/features.tsv";
  const files = filesMap.get(req.params.uuid);
  if (files != null && files.features != null) {
    filePath = files.features;
  }

  const instream = fs.createReadStream(filePath);
  instream.on("error", function () {
    res.status(400).send("Features tsv file was not found.\n");
    return 0;
  });

  const array = [];
  let exit = false;

  instream.pipe(es.split()).pipe(
    es
      .mapSync(function (line) {
        if (!exit) {
          const delimited = line.split("\t");
          const geneName = delimited[1];
          if (geneName && geneName.length > 0) {
            array.push(geneName);
          } else if (line.trim().length !== 0) {
            exit = true;
          }
        }
      })
      .on("end", function () {
        if (array.length > 0 && !exit) {
          res.json(JSON.stringify(array));
        } else {
          res
            .status(400)
            .send(
              "GET request unsuccessful due to improperly formatted features.tsv file.\n"
            );
        }
      })
  );
});

app.get("/barcodes/:uuid", function (req, res) {
  let filePath =
    defaultFileNum === 0
      ? "./example_data/coronal_brain/filtered_feature_bc_matrix/filtered/barcodes.tsv"
      : defaultFileNum === 1
      ? "./example_data/coronal_brain/filtered_feature_bc_matrix/barcodes.tsv"
      : "./example_data/olfactory_bulb/filtered_feature_bc_matrix/barcodes.tsv";
  const files = filesMap.get(req.params.uuid);
  if (files != null && files.barcodes != null) {
    filePath = files.barcodes;
  }

  const instream = fs.createReadStream(filePath);
  instream.on("error", function () {
    res.status(400).send("Barcodes tsv file was not found.\n");
    return 0;
  });

  const array = [];

  instream.pipe(es.split()).pipe(
    es
      .mapSync(function (line) {
        const delimited = line.split("\t");
        const str = delimited[delimited.length - 1].trim();
        if (str.length > 0) array.push(str);
      })
      .on("end", function () {
        if (array.length > 0) {
          res.json(JSON.stringify(array));
        } else {
          res
            .status(400)
            .send("GET request unsuccessful due to empty barcodes.tsv file.\n");
        }
      })
  );
});

app.get("/pixels/:uuid", function (req, res) {
  let filePath =
    defaultFileNum === 0
      ? "./example_data/coronal_brain/spatial/tissue_positions_list.csv"
      : defaultFileNum === 1
      ? "./example_data/coronal_brain/spatial/tissue_positions_list.csv"
      : "./example_data/olfactory_bulb/spatial/tissue_positions_list.csv";
  const files = filesMap.get(req.params.uuid);
  if (files != null && files.pixels != null) {
    filePath = files.pixels;
  }

  const instream = fs.createReadStream(filePath);
  instream.on("error", function () {
    res.status(400).send("Positions csv file was not found.\n");
    return 0;
  });

  const array = [];
  let exit = false;

  instream.pipe(es.split()).pipe(
    es
      .mapSync(function (line) {
        if (!exit) {
          let delimited = line.split(",");
          if (delimited.length == 1) delimited = delimited[0].split("\t");
          if (delimited.length >= 3) {
            const barcode = delimited[0].trim();
            const x = delimited[delimited.length - 2].trim();
            const y = delimited[delimited.length - 1].trim();
            array.push({
              barcode: barcode,
              x: x,
              y: y,
            });
          } else if (line.trim().length !== 0) {
            exit = true;
          }
        }
      })
      .on("end", function () {
        if (array.length > 0 && !exit) {
          res.json(JSON.stringify(array));
        } else {
          res
            .status(400)
            .send(
              "GET request unsuccessful due to poorly formatted positions.csv file.\n"
            );
        }
      })
  );
});

app.use("/", router);

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
});
