const PORT = 7000;

const cors = require("cors");
const express = require("express");
const router = express.Router();
const app = express();
const multer = require("multer");
const shell = require("shelljs");
const gunzip = require("gunzip-file");
const isGzip = require("is-gzip");
const axios = require("axios");
const { omimApiKey } = require("./omimApiKey.jsx");

// delete localhost from this list when deploying
const corsOptions = {
  origin: ["https://stjs.me", "https://www.stjs.me"],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.options("*", cors());

const fs = require("fs");
const es = require("event-stream");

const { SparseMatrix } = require("ml-sparse-matrix");

const defaultFileNum = 0; // 0 is filtered coronal brains, 1 is original coronal brain, 2 is olfactory bulb, 3 is preoptic
let dir = process.cwd();
if (dir === "/home/ubuntu") {
  dir += "/SpatialTranscriptomics.js/backend";
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { uuid } = req.query;
    shell.mkdir("-p", `${dir}/data/${uuid}`);
    const path = `${dir}/data/${uuid}/`;
    cb(null, path);
  },
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("file");

app.get("/api", (_req, res) => {
  res.send("Welcome to the ST.js backend :).\n");
});

app.get("/api/omim", (req, res) => {
  const { geneName } = req.query;
  const key = omimApiKey;
  axios
    .get(
      `https://api.omim.org/api/entry/search?search=${geneName}&include=text:description&include=text:cloning&format=json&start=0&limit=1&apiKey=${key}`
    )
    .then((response) => {
      const data = response.data.omim.searchResponse.entryList[0].entry;
      const { textSectionList, titles } = data;
      res.json(
        JSON.stringify({
          title: titles.preferredTitle,
          textArray: textSectionList,
        })
      );
    })
    .catch((_error) => {
      res.status(400).send("Gene info could not be retrieved from OMIM.\n");
    });
});

app.get("/api/genesets", (_req, res) => {
  try {
    const data = fs.readFileSync(`${dir}/go/gene_sets.json`);
    const jsonData = JSON.parse(data);
    res.json(JSON.stringify(jsonData));
  } catch (err) {
    res.status(400).json("Gene sets failed to load.");
  }
});

app.post("/api/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json("Files could not be uploaded.");
    } else if (err) {
      return res.status(500).json("Files could not be uploaded.");
    }
    return res.send(req.file);
  });
});

app.get("/api/matrix", (req, res) => {
  const count = Number.parseInt(req.query.count);
  const numBatches = Number.parseInt(req.query.numBatches);

  if (count < 0 || numBatches < 0 || count > numBatches) {
    res.status(400).send("GET request has invalid parameters.\n");
    return 0;
  }

  let filePath =
    defaultFileNum === 0
      ? `${dir}/example_data/coronal_brain/filtered_feature_bc_matrix/filtered/filtered_matrix.mtx`
      : defaultFileNum === 1
      ? `${dir}/example_data/coronal_brain/filtered_feature_bc_matrix/matrix.mtx`
      : defaultFileNum === 2
      ? `${dir}/example_data/olfactory_bulb/filtered_feature_bc_matrix/matrix.mtx`
      : `${dir}/example_data/preoptic_region/filtered_feature_bc_matrix/matrix.mtx`;

  const { uuid } = req.query;
  if (uuid != null) {
    filePath = `${dir}/data/${uuid}/matrix.mtx`;
  }

  try {
    if (!isGzip(fs.readFileSync(filePath + ".gz"))) {
      throw new Error();
    }
  } catch (err) {
    res.status(400).send(`Matrix file was not found.\n`);
    return 0;
  }

  gunzip(filePath + ".gz", filePath, () => {
    const instream = fs.createReadStream(filePath);
    instream.on("error", () => {
      res.status(400).send(`Matrix file was not found.\n`);
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
        .mapSync((line) => {
          if (line.trim().charAt(0) !== "%" && !exit) {
            if (!indexLineReached) {
              let delimited = line.split(" ");
              if (delimited.length === 1) {
                delimited = delimited[0].split("\t");
              }
              if (delimited.length === 1) {
                delimited = delimited[0].split(",");
              }

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
              let delimited = line.split(" ");
              if (delimited.length === 1) {
                delimited = delimited[0].split("\t");
              }
              if (delimited.length === 1) {
                delimited = delimited[0].split(",");
              }

              const i = Number.parseInt(delimited[0]);
              const j = Number.parseInt(delimited[1]);
              const value = Number.parseFloat(delimited[2]);
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
              } else if (matrix && i >= minRow && i < maxRow && value > 0) {
                matrix.set(i - 1, j - 1, value);
              }
            }
          } else if (exit) {
            return 0;
          }
        })
        .on("end", () => {
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
            res.status(400).send("Matrix file is not properly formatted.\n");
          }
        })
    );
  });
});

app.get("/api/features", (req, res) => {
  const { uuid } = req.query;
  let filePath =
    defaultFileNum === 0
      ? `${dir}/example_data/coronal_brain/filtered_feature_bc_matrix/filtered/filtered_features.tsv`
      : defaultFileNum === 1
      ? `${dir}/example_data/coronal_brain/filtered_feature_bc_matrix/features.tsv`
      : defaultFileNum === 2
      ? `${dir}/example_data/olfactory_bulb/filtered_feature_bc_matrix/features.tsv`
      : `${dir}/example_data/preoptic_region/filtered_feature_bc_matrix/features.tsv`;

  if (uuid != null) {
    filePath = `${dir}/data/${uuid}/features.tsv`;
  }

  try {
    if (!isGzip(fs.readFileSync(filePath + ".gz"))) {
      throw new Error();
    }
  } catch (err) {
    res.status(400).send(`Features file was not found.\n`);
    return 0;
  }

  gunzip(filePath + ".gz", filePath, () => {
    const instream = fs.createReadStream(filePath);
    instream.on("error", () => {
      res.status(400).send("Features file was not found.\n");
      return 0;
    });

    const array = [];

    instream.pipe(es.split()).pipe(
      es
        .mapSync((line) => {
          let delimited = line.split("\t");
          if (delimited.length === 1) {
            delimited = delimited[0].split(" ");
          }
          if (delimited.length === 1) {
            delimited = delimited[0].split(",");
          }

          let geneName = delimited[1];
          if (geneName && geneName.length > 0) {
            array.push(geneName);
          } else if (line.trim().length !== 0) {
            geneName = delimited[0];
            array.push(geneName);
          }
        })
        .on("end", () => {
          if (array.length > 0) {
            res.json(JSON.stringify(array));
          } else {
            res.status(400).send("Features file is not properly formatted.\n");
          }
        })
    );
  });
});

app.get("/api/barcodes", (req, res) => {
  let filePath =
    defaultFileNum === 0
      ? `${dir}/example_data/coronal_brain/filtered_feature_bc_matrix/filtered/barcodes.tsv`
      : defaultFileNum === 1
      ? `${dir}/example_data/coronal_brain/filtered_feature_bc_matrix/barcodes.tsv`
      : defaultFileNum === 2
      ? `${dir}/example_data/olfactory_bulb/filtered_feature_bc_matrix/barcodes.tsv`
      : `${dir}/example_data/preoptic_region/filtered_feature_bc_matrix/barcodes.tsv`;

  const { uuid } = req.query;
  if (uuid != null) {
    filePath = `${dir}/data/${uuid}/barcodes.tsv`;
  }

  try {
    if (!isGzip(fs.readFileSync(filePath + ".gz"))) {
      throw new Error();
    }
  } catch (err) {
    res.status(400).send(`Barcodes file was not found.\n`);
    return 0;
  }

  gunzip(filePath + ".gz", filePath, () => {
    const instream = fs.createReadStream(filePath);
    instream.on("error", () => {
      res.status(400).send("Barcodes file was not found.\n");
      return 0;
    });

    const array = [];

    instream.pipe(es.split()).pipe(
      es
        .mapSync((line) => {
          let delimited = line.split("\t");
          if (delimited.length === 1) {
            delimited = delimited[0].split(" ");
          }
          if (delimited.length === 1) {
            delimited = delimited[0].split(",");
          }

          const str = delimited[delimited.length - 1].trim();
          if (str && str.length > 0) {
            array.push(str);
          }
        })
        .on("end", () => {
          if (array.length > 0) {
            res.json(JSON.stringify(array));
          } else {
            res.status(400).send("Barcodes file is not properly formatted.\n");
          }
        })
    );
  });
});

app.get("/api/pixels", (req, res) => {
  let filePath =
    defaultFileNum === 0 || defaultFileNum === 1
      ? `${dir}/example_data/coronal_brain/spatial/tissue_positions_list.csv`
      : defaultFileNum === 2
      ? `${dir}/example_data/olfactory_bulb/spatial/tissue_positions_list.csv`
      : `${dir}/example_data/preoptic_region/spatial/tissue_position_list.csv`;

  const { uuid } = req.query;
  if (uuid != null) {
    filePath = `${dir}/data/${uuid}/tissue_positions_list.csv`;
  }

  try {
    if (!isGzip(fs.readFileSync(filePath + ".gz"))) {
      throw new Error();
    }
  } catch (err) {
    res.status(400).send(`Tissue positions file was not found.\n`);
    return 0;
  }

  gunzip(filePath + ".gz", filePath, () => {
    const instream = fs.createReadStream(filePath);
    instream.on("error", () => {
      res.status(400).send("Tissue positions file was not found.\n");
      return 0;
    });

    const array = [];
    let exit = false;

    instream.pipe(es.split()).pipe(
      es
        .mapSync((line) => {
          if (!exit) {
            let delimited = line.split(",");
            if (delimited.length === 1) {
              delimited = delimited[0].split("\t");
            }
            if (delimited.length === 1) {
              delimited = delimited[0].split(" ");
            }

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
        .on("end", () => {
          if (array.length > 0 && !exit) {
            res.json(JSON.stringify(array));
          } else {
            res
              .status(400)
              .send("Tissue positions file is not properly formatted.\n");
          }
        })
    );
  });
});

app.use("/", router);

const imageURL =
  defaultFileNum === 0 || defaultFileNum === 1
    ? `${dir}/example_data/coronal_brain/spatial`
    : defaultFileNum === 2
    ? `${dir}/example_data/olfactory_bulb/spatial`
    : `${dir}/example_data/preoptic_region/spatial`;

app.use("/api/static", express.static(`${dir}/data`));
app.use("/api/static/null", express.static(imageURL));

app.listen(PORT, () => {
  console.log("Server is running on Port: " + PORT);
});
