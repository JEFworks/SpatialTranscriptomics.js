import React, { Component } from "react";
import axios from "axios";
import api from "../api.jsx";
import { v4 as uuidv4 } from "uuid";
import { SparseMatrix } from "ml-sparse-matrix";
import { PCA } from "ml-pca";
import { KMeans } from "machinelearn/cluster";

import rowSums from "../functions/rowSums.jsx";
import colSums from "../functions/colSums.jsx";
import getFilteredData from "../functions/getFilteredData.jsx";
import cpmNormalize from "../functions/cpmNormalize.jsx";
import euclideanDists from "../functions/euclideanDists.jsx";
import normalizeDists from "../functions/normalizeDists.jsx";
import GetRGB from "../functions/GetRGB.jsx";
import MinMaxNormalize from "../functions/MinMaxNormalize.jsx";
import MinMaxStats from "../functions/MinMaxStats.jsx";
import tsnejs from "../functions/tsne.js";
import palette from "../functions/palette.jsx";

import Header from "./Header.jsx";
import DataUpload from "./DataUpload.jsx";
import QualityControl from "./QualityControl.jsx";
import PCAWrapper from "./PCA.jsx";
import TSNEWrapper from "./tSNE.jsx";
import SpatialVis from "./SpatialVis.jsx";

class Homepage extends Component {
  state = {
    uuid: null,
    files: {
      matrix: null,
      barcodes: null,
      features: null,
      pixels: null,
    },
    matrix: [],
    filteredMatrix: [],
    features: [],
    adjustedFeatures: [],
    filteredFeatures: [],
    barcodes: [],
    filteredBarcodes: [],
    thresholds: { minRowSum: 4, minColSum: 2 },
    rowsums: [],
    colsums: [],
    colors: [],
    pcs: [],
    filteredPCs: [],
    feature: "camk2n1",
    k: 10,
    colorOption: "gene",
  }; // remember to update in resetState() too

  // for coloring
  setFeature = this.setFeature.bind(this);
  setK = this.setK.bind(this);

  // file handlers
  matrixFileHandler = this.matrixFileHandler.bind(this);
  barcodesFileHandler = this.barcodesFileHandler.bind(this);
  pixelsFileHandler = this.pixelsFileHandler.bind(this);
  featuresFileHandler = this.featuresFileHandler.bind(this);
  uploadFiles = this.uploadFiles.bind(this);

  // quality control functions
  setNumPCs = this.setNumPCs.bind(this);
  handleFilter = this.handleFilter.bind(this);

  // analysis functions
  computePCA = this.computePCA.bind(this);
  computeTSNE = this.computeTSNE.bind(this);

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    this.setState({ uuid: urlParams.get("session") });
    this.loadEverything();
  }

  // load data into the React state
  async loadEverything() {
    await this.loadFeatures();
    await this.loadBarcodes();
    await this.loadMatrix().catch((error) => {
      console.log(error);
    });
  }

  resetState() {
    this.setState({
      uuid: null,
      files: {
        matrix: null,
        barcodes: null,
        features: null,
        pixels: null,
      },
      matrix: [],
      filteredMatrix: [],
      features: [],
      adjustedFeatures: [],
      filteredFeatures: [],
      barcodes: [],
      filteredBarcodes: [],
      thresholds: { minRowSum: 4, minColSum: 2 },
      rowsums: [],
      colsums: [],
      colors: [],
      pcs: [],
      filteredPCs: [],
      feature: "camk2n1",
      k: 10,
      colorOption: "gene",
    });
  }

  // save matrix file to state
  matrixFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "matrix.mtx", { type: file.type });
    files.matrix = newFile;
    this.setState({ files });
  }

  // save features file to state
  featuresFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "features.tsv", { type: file.type });
    files.features = newFile;
    this.setState({ files });
  }

  // save barcodes file to state
  barcodesFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "barcodes.tsv", { type: file.type });
    files.barcodes = newFile;
    this.setState({ files });
  }

  // save tissue_positions files to state
  pixelsFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "tissue_positions_list.csv", {
      type: file.type,
    });
    files.pixels = newFile;
    this.setState({ files });
  }

  // upload files from state to the server
  async uploadFiles() {
    const { files } = this.state;
    if (!files.matrix || !files.barcodes || !files.features || !files.pixels) {
      return;
    }

    const data = new FormData();
    data.append("file", files.matrix);
    data.append("file", files.features);
    data.append("file", files.barcodes);
    data.append("file", files.pixels);

    const uuid = uuidv4(); // generate unique user session ID

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("session", uuid);
    window.history.pushState(null, null, `/?${urlParams.toString()}`);

    this.resetState();
    this.setState({ uuid });
    axios
      .post(`${api}/upload/${uuid}`, data, {})
      .then((_res) => {
        this.loadEverything();
      })
      .catch(() => {});
  }

  async loadFeatures() {
    const { uuid } = this.state;
    axios
      .get(`${api}/features/${uuid}`)
      .then((response) => {
        const features = JSON.parse(response.data);
        this.setState({ features });
      })
      .catch(() => {});
  }

  async loadBarcodes() {
    const { uuid } = this.state;
    axios
      .get(`${api}/barcodes/${uuid}`)
      .then((response) => {
        const barcodes = JSON.parse(response.data);
        this.setState({ barcodes });
        this.loadPixels(barcodes);
      })
      .catch(() => {});
  }

  async loadPixels(barcodes) {
    const { uuid } = this.state;
    axios
      .get(`${api}/pixels/${uuid}`)
      .then((response) => {
        const pixels = JSON.parse(response.data);
        pixels.forEach((pixel) => {
          const index = barcodes.indexOf(pixel.barcode);
          if (index !== -1) {
            barcodes[index] = pixel;
          }
        });
        this.setState({ barcodes });
      })
      .catch(() => {});
  }

  async loadMatrix() {
    const { uuid } = this.state;
    let count = 0;
    const numBatches = 4;
    let errorOccured = false;
    while (count < numBatches && !errorOccured) {
      await axios
        .get(`${api}/matrix/${uuid}/${count}/${numBatches}`)
        .then((response) => {
          const res = JSON.parse(response.data);
          const m = new SparseMatrix(res.rows, res.columns);

          if (res.elements.distinct !== 0) {
            const elements = m.elements;
            elements.distinct = res.elements.distinct;
            elements.freeEntries = res.elements.freeEntries;
            elements.highWaterMark = res.elements.highWaterMark;
            elements.lowWaterMark = res.elements.lowWaterMark;
            elements.maxLoadFactor = res.elements.maxLoadFactor;
            elements.minLoadFactor = res.elements.minLoadFactor;
            elements.state = res.elements.state;
            elements.table = res.elements.table;
            elements.values = res.elements.values;

            const { adjustedFeatures } = this.state;
            const matrix = this.state.matrix.concat(
              m.to2DArray().filter((gene, index) => {
                for (let cell of gene) {
                  const feature = this.state.features[index];
                  if (cell > 0) {
                    if (feature) {
                      adjustedFeatures.push(feature.toLowerCase());
                    }
                    return true;
                  }
                }
                return false;
              })
            );
            this.setState({ matrix, adjustedFeatures });
          }
        })
        .catch((error) => {
          this.setState({ matrix: [], adjustedFeatures: [] });
          throw error;
        });
      count++;
    }

    const { thresholds } = this.state;
    this.handleFilter(thresholds.minRowSum, thresholds.minColSum);
  }

  handleFilter(minRowSum, minColSum) {
    const { matrix } = this.state;
    if (!matrix[0]) {
      return;
    }
    const { thresholds, adjustedFeatures, barcodes, feature } = this.state;
    let { rowsums, colsums } = this.state;

    if (minRowSum !== null) {
      thresholds.minRowSum = minRowSum;
      rowsums = rowSums(matrix, thresholds.minRowSum);
    }
    if (minColSum !== null) {
      thresholds.minColSum = minColSum;
      colsums = colSums(matrix, thresholds.minColSum);
    }

    const filteredData = getFilteredData(
      matrix,
      adjustedFeatures,
      barcodes,
      rowsums.badGenes,
      colsums.badCells
    );
    const colors = this.getColorsByGene(
      filteredData.matrix,
      filteredData.features,
      feature
    );

    this.setState({
      filteredMatrix: filteredData.matrix,
      filteredFeatures: filteredData.features,
      filteredBarcodes: filteredData.barcodes,
      thresholds,
      rowsums,
      colsums,
      pcs: [],
      filteredPCs: [],
      colorOption: "gene",
      colors,
    });
  }

  setFeature(name) {
    const colors = this.getColorsByGene(
      this.state.filteredMatrix,
      this.state.filteredFeatures,
      name
    );
    this.setState({ feature: name, colorOption: "gene", colors });
  }

  setNumPCs(num) {
    const filteredPCs = [];
    this.state.pcs.forEach((pc) => {
      filteredPCs.push(pc.slice(0, num));
    });
    this.setState({ filteredPCs });
    if (this.state.colorOption === "cluster") {
      const colors = this.getColorsByClusters(filteredPCs, this.state.k);
      this.setState({ colors });
    }
  }

  computePCA() {
    const m = this.state.filteredMatrix.slice();
    if (!m[0] || m[0].length < 1) {
      return {};
    }

    const matrix = cpmNormalize(m);

    const pca = new PCA(matrix, {
      method: "SVD",
      center: true,
      scale: true,
      ignoreZeroVariance: true,
    });
    const pcs = pca.getEigenvectors().data;
    const eigenvalues = pca.getEigenvalues();

    const pcsCleaned = [];
    pcs.forEach((cell) => {
      pcsCleaned.push([].slice.call(cell));
    });

    this.setState({ pcs: pcsCleaned });
    return { eigenvectors: pcsCleaned, eigenvalues: eigenvalues };
  }

  computeTSNE(tsneSettings) {
    const { filteredPCs } = this.state;
    const { epsilon, perplexity, iterations } = tsneSettings;
    if (!filteredPCs[0] || filteredPCs[0].length < 1) {
      alert("Please run PCA first.");
      return [];
    }

    const dists = normalizeDists(euclideanDists(filteredPCs));

    const opt = {};
    opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
    opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataDist(dists);

    for (let k = 0; k < iterations; k++) {
      tsne.step(); // default 500 iterations
    }
    const Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    return Y;
  }

  getGene(matrix, features, name) {
    return matrix[features.indexOf(name)];
  }

  getColorsByGene(matrix, features, featureName) {
    const colors = [];
    const gene = this.getGene(matrix, features, featureName);

    if (gene) {
      const { max, min } = MinMaxStats(gene);
      gene.forEach((cell) => {
        colors.push(GetRGB(MinMaxNormalize(cell, min, max)));
      });
    }

    return colors;
  }

  setK(k) {
    const colors = this.getColorsByClusters(this.state.filteredPCs, k);
    this.setState({ k });
    if (this.state.filteredPCs[0]) {
      this.setState({ colorOption: "cluster", colors });
    }
  }

  performKMeans(pcs, num) {
    const kmean = new KMeans({ k: num });
    if (pcs[0]) {
      kmean.fit(pcs);
      const clusters = kmean.toJSON().clusters;
      return clusters;
    }
    alert("Please run PCA first.");
    return null;
  }

  getColorsByClusters(pcs, num) {
    const clusters = this.performKMeans(pcs, num);

    const hashmap = new Map();
    pcs.forEach((cell, index) => {
      hashmap.set(cell, index);
    });

    const colorsMap = new Map();
    let i = 0;
    if (clusters != null) {
      clusters.forEach((cluster) => {
        cluster.forEach((cell) => {
          const index = hashmap.get(cell);
          colorsMap.set(index, palette[i % palette.length]);
        });
        i++;
      });
    }

    const sorted = new Map(
      [...colorsMap].sort((a, b) => parseInt(a) - parseInt(b))
    );
    return [...sorted.values()];
  }

  render() {
    const { colors } = this.state;

    return (
      <>
        <div style={{ marginBottom: "40px" }}>
          <Header setFeature={this.setFeature} setK={this.setK} />
        </div>

        <div className="site-container">
          <DataUpload
            matrixFileHandler={this.matrixFileHandler}
            barcodesFileHandler={this.barcodesFileHandler}
            featuresFileHandler={this.featuresFileHandler}
            pixelsFileHandler={this.pixelsFileHandler}
            uploadFiles={this.uploadFiles}
            files={this.state.files}
          />

          <QualityControl
            thresholds={this.state.thresholds}
            rowsums={this.state.rowsums.sums}
            colsums={this.state.colsums.sums}
            handleFilter={this.handleFilter}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <PCAWrapper
            computePCA={this.computePCA}
            setNumPCs={this.setNumPCs}
            colors={colors}
            displayAllowed={this.state.pcs[0]}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <TSNEWrapper
            computeTSNE={this.computeTSNE}
            colors={colors}
            pcs={this.state.pcs}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <SpatialVis barcodes={this.state.filteredBarcodes} colors={colors} />

          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
