import React, { Component } from "react";
import axios from "axios";
import api from "../api.jsx";
import { v4 as uuidv4 } from "uuid";
import { SparseMatrix } from "ml-sparse-matrix";

import GetRGB from "../functions/GetRGB.jsx";
import MinMaxNormalize from "../functions/MinMaxNormalize.jsx";
import MinMaxStats from "../functions/MinMaxStats.jsx";

import Header from "./Header.jsx";
import DataUpload from "./DataUpload.jsx";
import QualityControl from "./QualityControl.jsx";
import PCAWrapper from "./PCA.jsx";
import TSNEWrapper from "./tSNE.jsx";
import SpatialVis from "./SpatialVis.jsx";

import Worker_FILTER from "workerize-loader!../workers/worker-filter.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_PCA from "workerize-loader!../workers/worker-pca.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_TSNE from "workerize-loader!../workers/worker-tsne.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_KMEANS from "workerize-loader!../workers/worker-kmeans.jsx"; // eslint-disable-line import/no-webpack-loader-syntax

let filter_WorkerInstance = Worker_FILTER();
let pca_WorkerInstance = Worker_PCA();
let tsne_WorkerInstance = Worker_TSNE();
let kmeans_WorkerInstance = Worker_KMEANS();

class Homepage extends Component {
  state = {
    uuid: null,
    files: {
      matrix: null,
      barcodes: null,
      features: null,
      pixels: null,
      image: null,
    },
    matrix: [],
    filteredMatrix: [],
    features: [],
    adjustedFeatures: [],
    filteredFeatures: [],
    barcodes: [],
    filteredBarcodes: [],
    thresholds: { minRowSum: 2, minColSum: 2 },
    rowsums: [],
    colsums: [],
    colors: [],
    pcs: [],
    eigenvalues: [],
    filteredPCs: [],
    feature: "camk2n1",
    tsneSolution: [],
    k: 10,
    colorOption: "gene",
    loading: {
      upload: true,
      pca: false,
      tsne: false,
      kmeans: false,
      image: false,
    },
    errors: [],
    imageLink: "",
  }; // remember to update in resetState() too

  // file handlers
  matrixFileHandler = this.matrixFileHandler.bind(this);
  barcodesFileHandler = this.barcodesFileHandler.bind(this);
  pixelsFileHandler = this.pixelsFileHandler.bind(this);
  featuresFileHandler = this.featuresFileHandler.bind(this);
  imageFileHandler = this.imageFileHandler.bind(this);
  uploadFiles = this.uploadFiles.bind(this);

  // quality control functions
  setNumPCs = this.setNumPCs.bind(this);
  handleFilter = this.handleFilter.bind(this);

  // for coloring
  setFeature = this.setFeature.bind(this);
  setK = this.setK.bind(this);

  // analysis functions
  computePCA = this.computePCA.bind(this);
  computeTSNE = this.computeTSNE.bind(this);

  componentDidMount() {
    // get uuid from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get("session");

    this.setState({ uuid }, () => {
      this.loadEverything();
    });
  }

  reportError(error) {
    if (error.response) {
      this.state.errors.push(error.response.data);
    }
  }

  // load data
  async loadEverything() {
    this.loadImage();
    await this.loadFeatures();
    await this.loadBarcodes();
    await this.loadMatrix().catch((error) => {
      this.reportError(error);
      const { loading } = this.state;
      loading.upload = false;
      this.setState({ loading });
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
        image: null,
      },
      matrix: [],
      filteredMatrix: [],
      features: [],
      adjustedFeatures: [],
      filteredFeatures: [],
      barcodes: [],
      filteredBarcodes: [],
      thresholds: { minRowSum: 2, minColSum: 2 },
      rowsums: [],
      colsums: [],
      colors: [],
      pcs: [],
      eigenvalues: [],
      filteredPCs: [],
      feature: "camk2n1",
      tsneSolution: [],
      k: 10,
      colorOption: "gene",
      loading: {
        upload: false,
        pca: false,
        tsne: false,
        kmeans: false,
        image: false,
      },
      errors: [],
      imageLink: "",
    });
  }

  // save matrix file to state
  matrixFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "matrix.mtx", { type: file.type });
    files.matrix = newFile;
    this.setState({ files, errors: [] });
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

  // save tissue_positions file to state
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

  // save image file to state
  imageFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "tissue_image.png", {
      type: file.type,
    });
    files.image = newFile;
    this.setState({ files });
  }

  loadImage() {
    const { loading, uuid } = this.state;
    loading.image = false;
    axios
      .get(`${api}/static/${uuid}/tissue_image.png`)
      .then((_res) => {
        this.setState({
          imageLink: `${api}/static/${uuid}/tissue_image.png`,
          loading,
        });
      })
      .catch(() => {
        this.state.errors.push("Tissue image file was not found.\n");
        this.setState({ loading });
      });
  }

  // upload files to server
  async uploadFiles() {
    const { files, loading } = this.state;
    if (!files.matrix) {
      return;
    }

    const data = new FormData();
    data.append("file", files.matrix);
    data.append("file", files.features);
    data.append("file", files.barcodes);
    data.append("file", files.pixels);
    data.append("file", files.image);

    const uuid = uuidv4(); // generate unique user session ID

    // add uuid to URL
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("session", uuid);
    window.history.pushState(null, null, `/?${urlParams.toString()}`);

    this.resetState();
    loading.upload = true;
    loading.image = true;

    this.setState({ uuid, loading }, () => {
      axios
        .post(`${api}/upload/${uuid}`, data, {})
        .then((_res) => {
          this.loadEverything();
        })
        .catch((error) => {
          this.reportError(error);
        });
    });
  }

  async loadFeatures() {
    const { uuid } = this.state;
    axios
      .get(`${api}/features/${uuid}`)
      .then((response) => {
        const features = JSON.parse(response.data);
        this.setState({ features });
      })
      .catch((error) => {
        this.reportError(error);
      });
  }

  async loadBarcodes() {
    const { uuid } = this.state;
    axios
      .get(`${api}/barcodes/${uuid}`)
      .then((response) => {
        const barcodes = JSON.parse(response.data);
        this.setState({ barcodes }, () => {
          this.loadPixels();
        });
      })
      .catch((error) => {
        this.reportError(error);
        axios.get(`${api}/pixels/${uuid}`).catch((error) => {
          this.reportError(error);
        });
      });
  }

  async loadPixels() {
    const { uuid, barcodes } = this.state;
    axios
      .get(`${api}/pixels/${uuid}`)
      .then((response) => {
        const pixels = JSON.parse(response.data);
        // augment barcodes array with pixel info (e.g. "ENG1" -> {barcode: "ENG1", x: 10, y: 5})
        pixels.forEach((pixel) => {
          const index = barcodes.indexOf(pixel.barcode);
          if (index !== -1) {
            barcodes[index] = pixel;
          }
        });
        this.setState({ barcodes });
      })
      .catch((error) => {
        this.reportError(error);
      });
  }

  async loadMatrix() {
    const { uuid } = this.state;
    let count = 0;
    const numBatches = 4;
    let errorOccured = false;

    // load the matrix in 4 batches
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
                  // if we find that the gene is expressed in any of the cells, add the gene's name to adjustedFeatures
                  if (cell > 0) {
                    const feature = this.state.features[index];
                    if (feature) {
                      adjustedFeatures.push(feature.toLowerCase());
                    }
                    return true; // this gene is expressed so add it to the matrix
                  }
                }
                return false; // this gene is not expressed, so don't add it to the matrix
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
    const {
      matrix,
      thresholds,
      barcodes,
      feature,
      adjustedFeatures,
      loading,
      rowsums,
      colsums,
    } = this.state;
    if (!matrix[0]) {
      return;
    }

    pca_WorkerInstance.terminate();
    tsne_WorkerInstance.terminate();
    kmeans_WorkerInstance.terminate();

    loading.upload = true;
    loading.pca = false;
    loading.tsne = false;
    loading.kmeans = false;
    this.setState({
      loading,
      pcs: [],
      eigenvalues: [],
      filteredPCs: [],
      tsneSolution: [],
    });

    // worker filters the data
    filter_WorkerInstance = Worker_FILTER();
    filter_WorkerInstance.filter(
      matrix,
      thresholds,
      barcodes,
      adjustedFeatures,
      rowsums,
      colsums,
      minRowSum,
      minColSum
    );

    filter_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.filteredData) {
        const data = message.data;
        const { filteredData } = data;

        // compute colors based on a specific gene
        const colors = this.getColorsByGene(
          filteredData.matrix,
          filteredData.features,
          feature
        );

        loading.upload = false;
        this.setState({
          filteredMatrix: filteredData.matrix,
          filteredFeatures: filteredData.features,
          filteredBarcodes: filteredData.barcodes,
          thresholds: data.thresholds,
          rowsums: data.rowsums,
          colsums: data.colsums,
          colorOption: "gene",
          colors,
          loading,
        });
        filter_WorkerInstance.terminate();
      }
    });
  }

  setNumPCs(num) {
    tsne_WorkerInstance.terminate();
    kmeans_WorkerInstance.terminate();

    const { loading } = this.state;
    loading.pca = true;
    loading.tsne = false;
    loading.kmeans = false;
    this.setState({ loading, filteredPCs: [], tsneSolution: [] }, () => {
      this.filterPCs(num);
    });
  }

  // filter based on user-specified # of PCs
  filterPCs(num) {
    const { pcs, loading, colorOption, k } = this.state;
    if (!pcs[0]) {
      loading.pca = false;
      this.setState({ loading });
      return;
    }

    const filteredPCs = [];
    pcs.forEach((pc) => {
      filteredPCs.push(pc.slice(0, num));
    });

    loading.pca = false;
    this.setState({ filteredPCs, loading });
    if (colorOption === "cluster") {
      this.getColorsByClusters(filteredPCs, k);
    }
  }

  computePCA(num) {
    const m = this.state.filteredMatrix.slice();
    if (!m[0] || m[0].length < 1) {
      return;
    }

    tsne_WorkerInstance.terminate();
    kmeans_WorkerInstance.terminate();

    const { loading } = this.state;
    loading.pca = true;
    loading.tsne = false;
    loading.kmeans = false;
    this.setState({ loading, filteredPCs: [], tsneSolution: [] });

    pca_WorkerInstance = Worker_PCA();
    pca_WorkerInstance.performPCA(m);
    pca_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.eigenvectors) {
        const pca = message.data;
        this.setState(
          {
            pcs: pca.eigenvectors,
            eigenvalues: pca.eigenvalues,
          },
          () => {
            this.filterPCs(num);
          }
        );
        pca_WorkerInstance.terminate();
      }
    });
  }

  computeTSNE(tsneSettings) {
    const { filteredPCs, loading } = this.state;
    const { epsilon, perplexity, iterations } = tsneSettings;
    if (!filteredPCs[0] || filteredPCs[0].length < 1) {
      alert("Please run PCA first.");
      return;
    }

    loading.tsne = true;
    this.setState({ loading });
    const opt = {};
    opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
    opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    tsne_WorkerInstance = Worker_TSNE();
    tsne_WorkerInstance.performTSNE(filteredPCs, opt, iterations);
    tsne_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.solution) {
        const tsne = message.data;
        loading.tsne = false;
        this.setState({ tsneSolution: tsne.solution, loading });
        tsne_WorkerInstance.terminate();
      }
    });
  }

  // set gene name and compute colors based on expression of this gene
  setFeature(name) {
    const { filteredMatrix, filteredFeatures } = this.state;
    const colors = this.getColorsByGene(filteredMatrix, filteredFeatures, name);
    this.setState({ feature: name, colorOption: "gene", colors });
  }

  getGene(matrix, features, name) {
    return matrix[features.indexOf(name)];
  }

  getColorsByGene(matrix, features, featureName) {
    const colors = [];
    const gene = this.getGene(matrix, features, featureName);

    if (gene != null) {
      // produce heatmap
      const { max, min } = MinMaxStats(gene);
      gene.forEach((cell) => {
        colors.push(GetRGB(MinMaxNormalize(cell, min, max)));
      });
    } else if (matrix[0]) {
      matrix[0].forEach(() => {
        colors.push("black");
      });
    }

    return colors;
  }

  // set K and compute colors by clusters
  setK(k) {
    const { filteredPCs } = this.state;
    if (!filteredPCs[0]) {
      alert("Please run PCA first.");
      return;
    }
    this.setState({ k, colorOption: "cluster" });
    this.getColorsByClusters(filteredPCs, k);
  }

  getColorsByClusters(pcs, k) {
    const { loading } = this.state;
    loading.kmeans = true;
    this.setState({ loading });

    kmeans_WorkerInstance = Worker_KMEANS();
    kmeans_WorkerInstance.performKMeans(pcs, k);
    kmeans_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.colors) {
        const result = message.data;
        loading.kmeans = false;
        this.setState({ loading, colors: result.colors });
        kmeans_WorkerInstance.terminate();
      }
    });
  }

  render() {
    // produce error message
    const { errors } = this.state;
    let errorMsg = "";
    for (let i = 0; i < errors.length; i++) {
      errorMsg += errors[i];
    }

    return (
      <>
        <div style={{ marginBottom: "40px" }}>
          <Header
            setFeature={this.setFeature}
            setK={this.setK}
            loading={this.state.loading.kmeans}
          />
        </div>

        <div className="site-container">
          <DataUpload
            matrixFileHandler={this.matrixFileHandler}
            barcodesFileHandler={this.barcodesFileHandler}
            featuresFileHandler={this.featuresFileHandler}
            pixelsFileHandler={this.pixelsFileHandler}
            imageFileHandler={this.imageFileHandler}
            uploadFiles={this.uploadFiles}
            files={this.state.files}
            error={errorMsg}
          />

          <QualityControl
            thresholds={this.state.thresholds}
            rowsums={this.state.rowsums.sums}
            colsums={this.state.colsums.sums}
            handleFilter={this.handleFilter}
            loading={this.state.loading.upload}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <PCAWrapper
            computePCA={this.computePCA}
            eigenvectors={this.state.pcs}
            eigenvalues={this.state.eigenvalues}
            setNumPCs={this.setNumPCs}
            colors={this.state.colors}
            loading={this.state.loading.pca}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <TSNEWrapper
            computeTSNE={this.computeTSNE}
            tsneSolution={this.state.tsneSolution}
            colors={this.state.colors}
            loading={this.state.loading.tsne}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <SpatialVis
            barcodes={this.state.filteredBarcodes}
            colors={this.state.colors}
            imageLink={this.state.imageLink}
            loading={this.state.loading.image}
          />

          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
