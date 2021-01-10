import React, { Component } from "react";
import axios from "axios";
import api from "../api.jsx";
import { v4 as uuidv4 } from "uuid";
import { SparseMatrix } from "ml-sparse-matrix";

import rowSums from "../functions/rowSums.jsx";
import colSums from "../functions/colSums.jsx";
import getFilteredData from "../functions/getFilteredData.jsx";
import GetRGB from "../functions/GetRGB.jsx";
import MinMaxNormalize from "../functions/MinMaxNormalize.jsx";
import MinMaxStats from "../functions/MinMaxStats.jsx";

import Header from "./Header.jsx";
import DataUpload from "./DataUpload.jsx";
import QualityControl from "./QualityControl.jsx";
import PCAWrapper from "./PCA.jsx";
import TSNEWrapper from "./tSNE.jsx";
import SpatialVis from "./SpatialVis.jsx";

import Worker_PCA from "workerize-loader!../workers/worker-pca.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_TSNE from "workerize-loader!../workers/worker-tsne.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_KMEANS from "workerize-loader!../workers/worker-kmeans.jsx"; // eslint-disable-line import/no-webpack-loader-syntax

const pca_WorkerInstance = Worker_PCA();
const tSNE_WorkerInstance = Worker_TSNE();
const kmeans_WorkerInstance = Worker_KMEANS();

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
    eigenvalues: [],
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
      eigenvalues: [],
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
    this.filterPCs(num, this.state.pcs);
  }

  filterPCs(num, pcs) {
    if (pcs == null) {
      return;
    }
    const filteredPCs = [];
    pcs.forEach((pc) => {
      filteredPCs.push(pc.slice(0, num));
    });
    this.setState({ filteredPCs });
    if (this.state.colorOption === "cluster") {
      this.getColorsByClusters(filteredPCs, this.state.k);
    }
  }

  computePCA(num) {
    const m = this.state.filteredMatrix.slice();
    if (!m[0] || m[0].length < 1) {
      return;
    }
    pca_WorkerInstance.performPCA(m);
    let count = 0;
    pca_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.eigenvectors && count < 1) {
        const pca = message.data;
        this.setState({ pcs: pca.eigenvectors, eigenvalues: pca.eigenvalues });
        this.filterPCs(num, pca.eigenvectors);
        count++;
      }
    });
  }

  computeTSNE(tsneSettings) {
    const { filteredPCs } = this.state;
    const { epsilon, perplexity, iterations } = tsneSettings;
    if (!filteredPCs[0] || filteredPCs[0].length < 1) {
      alert("Please run PCA first.");
      return [];
    }

    const opt = {};
    opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
    opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    tSNE_WorkerInstance.performTSNE(filteredPCs, opt, iterations);
    let count = 0;
    tSNE_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.solution && count < 1) {
        const tsne = message.data;
        this.setState({ tsneSolution: tsne.solution });
        count++;
      }
    });
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
    if (!this.state.filteredPCs[0]) {
      alert("Please run PCA first.");
      return;
    }
    this.setState({ k, colorOption: "cluster" });
    this.getColorsByClusters(this.state.filteredPCs, k);
  }

  getColorsByClusters(pcs, num) {
    kmeans_WorkerInstance.performKMeans(pcs, num);
    let count = 0;
    kmeans_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.colors && count < 1) {
        const result = message.data;
        this.setState({ colors: result.colors });
        count++;
      }
    });
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
            eigenvectors={this.state.pcs}
            eigenvalues={this.state.eigenvalues}
            setNumPCs={this.setNumPCs}
            colors={colors}
            displayAllowed={this.state.pcs[0]}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <TSNEWrapper
            computeTSNE={this.computeTSNE}
            tsneSolution={this.state.tsneSolution}
            colors={colors}
            pcs={this.state.filteredPCs}
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
