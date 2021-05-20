import React, { Component } from "react";
import axios from "axios";
import api from "../api.jsx";
import { v4 as uuidv4 } from "uuid";
import { SparseMatrix } from "ml-sparse-matrix";

import GetRGB from "../functions/GetRGB.jsx";
import MinMaxNormalize from "../functions/MinMaxNormalize.jsx";
import MinMaxStats from "../functions/MinMaxStats.jsx";
import QuartileStats from "../functions/QuartileStats.jsx";

import Header from "./Header.jsx";
import Legend from "./Legend.jsx";
import AlertBanner from "./AlertBanner.jsx";
import DataUpload from "./DataUpload.jsx";
import QualityControl from "./QualityControl.jsx";
import PCAWrapper from "./PCAWrapper.jsx";
import TSNEWrapper from "./TSNEWrapper.jsx";
import SpatialVis from "./SpatialVis.jsx";
import DGEWrapper from "./DGEWrapper.jsx";
import GSEWrapper from "./GSEWrapper.jsx";
import GeneInfo from "./GeneInfo.jsx";

import Worker_FILTER from "workerize-loader!../workers/worker-filter.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_PCA from "workerize-loader!../workers/worker-pca.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_TSNE from "workerize-loader!../workers/worker-tsne.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_KMEANS from "workerize-loader!../workers/worker-kmeans.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_DGE from "workerize-loader!../workers/worker-dge.jsx"; // eslint-disable-line import/no-webpack-loader-syntax
import Worker_GSE from "workerize-loader!../workers/worker-gse.jsx"; // eslint-disable-line import/no-webpack-loader-syntax

let filter_WorkerInstance = Worker_FILTER();
let pca_WorkerInstance = Worker_PCA();
let tsne_WorkerInstance = Worker_TSNE();
let kmeans_WorkerInstance = Worker_KMEANS();
let dge_WorkerInstance = Worker_DGE();
let gse_WorkerInstance = Worker_GSE();

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
    thresholds: { minRowSum: 2, minColSum: 1 },
    rowsums: {},
    colsums: {},
    eigenvalues: [],
    pcs: [],
    filteredPCs: [],
    tsneSolution: [],
    feature: "nptxr",
    k: 10,
    clusters: [],
    clusterLegend: [],
    colors: [],
    colorOption: "gene",
    dgeSolution: [],
    geneSets: {},
    gseSolution: {},
    boxplotData: [],
    loading: {
      upload: true,
      geneSets: true,
      pca: false,
      tsne: false,
      kmeans: false,
      dge: false,
      gse: false,
      image: true,
    },
    errors: [],
    alertOpen: false,
    imageLink: "",
  }; // remember to update in resetState() too

  componentDidMount() {
    // get uuid from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const uuid = urlParams.get("session");

    this.setState({ uuid }, () => {
      this.loadDataset();
      this.loadGeneSets();
    });
  }

  handleAlertClose() {
    this.setState({ alertOpen: false, errors: [] });
  }

  reportError(error) {
    const { errors } = this.state;
    if (error.response && !errors.includes(error.response.data)) {
      errors.push(error.response.data);
    } else if (
      error.message === "Network Error" &&
      !errors.includes(error.message)
    ) {
      errors.push(error.message);
    } else if (!errors.includes(error)) {
      errors.push(error);
    }
    this.setState({ errors, alertOpen: true });
  }

  terminateWorkers() {
    pca_WorkerInstance.terminate();
    tsne_WorkerInstance.terminate();
    kmeans_WorkerInstance.terminate();
    dge_WorkerInstance.terminate();
    gse_WorkerInstance.terminate();
  }

  // load data
  async loadDataset() {
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

  // load genesets
  async loadGeneSets() {
    const { loading } = this.state;
    axios
      .get(`${api}/genesets`)
      .then((response) => {
        const geneSets = JSON.parse(response.data);
        loading.geneSets = false;
        this.setState({ geneSets, loading });
      })
      .catch((error) => {
        this.reportError(error);
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
      rowsums: {},
      colsums: {},
      eigenvalues: [],
      pcs: [],
      filteredPCs: [],
      tsneSolution: [],
      clusters: [],
      clusterLegend: [],
      colors: [],
      colorOption: "gene",
      dgeSolution: [],
      gseSolution: {},
      loading: {
        upload: true,
        geneSets: false,
        pca: false,
        tsne: false,
        kmeans: false,
        dge: false,
        gse: false,
        image: true,
      },
      errors: [],
      alertOpen: false,
      imageLink: "",
    });
  }

  // save matrix file to state
  matrixFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "matrix.mtx.gz", { type: file.type });
    files.matrix = newFile;
    this.setState({ files, errors: [] });
  }

  // save features file to state
  featuresFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "features.tsv.gz", { type: file.type });
    files.features = newFile;
    this.setState({ files });
  }

  // save barcodes file to state
  barcodesFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "barcodes.tsv.gz", { type: file.type });
    files.barcodes = newFile;
    this.setState({ files });
  }

  // save tissue_positions file to state
  pixelsFileHandler(event) {
    const { files } = this.state;
    const file = event.target.files[0];
    const copy = file.slice(0, file.size, file.type);
    const newFile = new File([copy], "tissue_positions_list.csv.gz", {
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
    const imageLink = `${api}/static/${uuid}/tissue_image.png`;
    axios
      .get(imageLink)
      .catch(() => {
        this.reportError("Tissue image file was not found.\n");
      })
      .finally(() => {
        loading.image = false;
        this.setState({ loading, imageLink });
      });
  }

  // upload files to server
  async uploadFiles() {
    const { files } = this.state;
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

    this.setState({ uuid }, () => {
      axios
        .post(`${api}/upload/${uuid}`, data, {})
        .then((_response) => {
          this.loadDataset();
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

    // terminate any ongoing analyses
    filter_WorkerInstance.terminate();
    this.terminateWorkers();

    loading.upload = true;
    loading.pca = false;
    loading.tsne = false;
    loading.kmeans = false;
    loading.dge = false;
    loading.gse = false;
    this.setState({
      loading,
      filteredMatrix: [],
      filteredBarcodes: [],
      filteredFeatures: [],
      pcs: [],
      eigenvalues: [],
      filteredPCs: [],
      tsneSolution: [],
      clusters: [],
      clusterLegend: [],
      colors: [],
      colorOption: "gene",
      dgeSolution: [],
      gseSolution: {},
      boxplotData: [],
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
          colors,
          loading,
        });
        filter_WorkerInstance.terminate();
      }
    });
  }

  setNumPCs(num) {
    const m = this.state.filteredMatrix;
    if (!m[0] || m[0].length < 1) {
      return;
    }

    this.terminateWorkers();

    const { loading } = this.state;
    loading.pca = true;
    loading.tsne = false;
    loading.kmeans = false;
    loading.dge = false;
    loading.gse = false;

    this.setState(
      {
        loading,
        filteredPCs: [],
        tsneSolution: [],
        clusters: [],
        clusterLegend: [],
        dgeSolution: [],
        gseSolution: {},
        boxplotData: [],
      },
      () => {
        this.filterPCs(num);
      }
    );
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
      this.setColorsByClusters(filteredPCs, k);
    }
  }

  computePCA(num) {
    const m = this.state.filteredMatrix;
    if (!m[0] || m[0].length < 1) {
      this.reportError("The matrix is empty and/or has not loaded yet.\n");
      return;
    }

    // terminate ongoing analyses
    this.terminateWorkers();

    const { loading } = this.state;
    loading.pca = true;
    loading.tsne = false;
    loading.kmeans = false;
    loading.dge = false;
    loading.gse = false;

    this.setState({
      loading,
      filteredPCs: [],
      tsneSolution: [],
      clusters: [],
      clusterLegend: [],
      dgeSolution: [],
      gseSolution: {},
      boxplotData: [],
    });

    pca_WorkerInstance = Worker_PCA();
    pca_WorkerInstance.performPCA(m);
    pca_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.eigenvectors) {
        const { eigenvectors, eigenvalues } = message.data;
        this.setState(
          {
            pcs: eigenvectors,
            eigenvalues: eigenvalues,
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
      this.reportError("Please run PCA first.\n");
      return;
    }

    tsne_WorkerInstance.terminate();

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
        const { solution } = message.data;
        loading.tsne = false;
        this.setState({ tsneSolution: solution, loading });
        tsne_WorkerInstance.terminate();
      }
    });
  }

  // x is index of reference cluster, y is index of non-reference cluster
  computeDGE(x, y) {
    const { clusters, filteredMatrix, filteredFeatures, loading } = this.state;

    if (!clusters[0] || clusters.length < 2) {
      this.reportError("Please perform clustering with k >= 2 first.\n");
      return;
    }

    dge_WorkerInstance.terminate();
    gse_WorkerInstance.terminate();
    loading.dge = true;
    loading.gse = false;
    this.setState({ loading, gseSolution: {} });

    dge_WorkerInstance = Worker_DGE();
    dge_WorkerInstance.performDGE(
      clusters,
      filteredMatrix,
      filteredFeatures,
      x,
      y
    );
    dge_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.solution) {
        const { solution } = message.data;
        loading.dge = false;
        this.setState({ dgeSolution: solution, loading });
        dge_WorkerInstance.terminate();
      }
    });
  }

  // trying to implement gene set enrichment
  computeGSE() {
    const { dgeSolution, geneSets, loading, filteredFeatures } = this.state;

    if (Object.keys(geneSets).length === 0) {
      this.reportError(
        "Gene sets are still loading or failed to load. Please wait a few minutes.\n"
      );
      return;
    }
    if (filteredFeatures.length === 0) {
      this.reportError("Features information is empty and/or missing.\n");
      return;
    }
    if (!dgeSolution[0]) {
      this.reportError(
        "Please perform differential gene expression analysis first.\n"
      );
      return;
    }

    gse_WorkerInstance.terminate();
    loading.gse = true;
    this.setState({ loading });

    gse_WorkerInstance = Worker_GSE();
    gse_WorkerInstance.performGSE(geneSets, dgeSolution);

    gse_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.solution) {
        const { solution } = message.data;
        loading.gse = false;

        if (solution.GSE == null || solution.GSE.size === 0) {
          this.reportError("No enriched gene sets were found.\n");
        }
        this.setState({ gseSolution: solution, loading });
        gse_WorkerInstance.terminate();
      }
    });
  }

  // set gene name and compute colors based on expression of this gene
  setFeature(name) {
    const { filteredMatrix, filteredFeatures, loading } = this.state;
    kmeans_WorkerInstance.terminate();
    loading.kmeans = false;
    this.setState({ loading });

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
        colors.push("blue");
      });
    }

    return colors;
  }

  // set K and compute colors by clusters
  setK(k) {
    const { filteredPCs } = this.state;
    if (!filteredPCs[0]) {
      this.reportError("Please run PCA first.\n");
      return;
    }

    if (isNaN(k) || k < 1) {
      this.reportError("Please specify a positive integer value for k.\n");
      return;
    }

    kmeans_WorkerInstance.terminate();
    dge_WorkerInstance.terminate();
    gse_WorkerInstance.terminate();

    this.setState({
      k,
      colorOption: "cluster",
      clusters: [],
      clusterLegend: [],
      dgeSolution: [],
      gseSolution: {},
      boxplotData: [],
    });
    this.setColorsByClusters(filteredPCs, k);
  }

  setColorsByClusters(pcs, k) {
    const { loading } = this.state;
    loading.kmeans = true;
    loading.dge = false;
    loading.gse = false;
    this.setState({ loading });

    kmeans_WorkerInstance = Worker_KMEANS();
    kmeans_WorkerInstance.performKMeans(pcs, k);
    kmeans_WorkerInstance.addEventListener("message", (message) => {
      if (message.data.colors && message.data.clusters) {
        const { colors, clusters, clusterLegend } = message.data;
        loading.kmeans = false;
        this.setState({
          loading,
          colors,
          clusters,
          clusterLegend,
        });
        kmeans_WorkerInstance.terminate();
      }
    });
  }

  computeBoxplot(featureName) {
    const { filteredMatrix, filteredFeatures, clusters } = this.state;
    const boxplotData = [];

    if (!clusters[0]) {
      this.reportError("Please perform clustering with k >= 2 first.\n");
      return;
    }

    const gene = this.getGene(filteredMatrix, filteredFeatures, featureName);
    if (gene == null) {
      this.reportError("Gene could not be found in the matrix.\n");
      this.setState({ boxplotData: [] });
      return;
    }

    const overallStats = QuartileStats(gene);
    overallStats.x = "All";
    boxplotData.push(overallStats);

    clusters.forEach((cluster, i) => {
      const filteredGene = [];
      cluster.forEach((cellIndex) => {
        filteredGene.push(gene[cellIndex]);
      });
      const groupStats = QuartileStats(filteredGene);
      groupStats.x = (i + 1).toString();
      boxplotData.push(groupStats);
    });

    this.setState({ boxplotData });
  }

  render() {
    return (
      <>
        <Header
          setFeature={this.setFeature.bind(this)}
          setK={this.setK.bind(this)}
          loading={this.state.loading.kmeans}
        />

        <div className="site-container">
          <Legend colors={this.state.clusterLegend} />

          <AlertBanner
            open={this.state.alertOpen}
            handleClose={this.handleAlertClose.bind(this)}
            errors={this.state.errors}
          />

          <DataUpload
            matrixFileHandler={this.matrixFileHandler.bind(this)}
            barcodesFileHandler={this.barcodesFileHandler.bind(this)}
            featuresFileHandler={this.featuresFileHandler.bind(this)}
            pixelsFileHandler={this.pixelsFileHandler.bind(this)}
            imageFileHandler={this.imageFileHandler.bind(this)}
            uploadFiles={this.uploadFiles.bind(this)}
            files={this.state.files}
            reportError={this.reportError.bind(this)}
          />

          <div style={{ paddingTop: "5px" }}></div>
          <QualityControl
            thresholds={this.state.thresholds}
            rowsums={this.state.rowsums.sums}
            colsums={this.state.colsums.sums}
            handleFilter={this.handleFilter.bind(this)}
            loading={this.state.loading.upload}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <PCAWrapper
            computePCA={this.computePCA.bind(this)}
            eigenvectors={this.state.pcs}
            eigenvalues={this.state.eigenvalues}
            setNumPCs={this.setNumPCs.bind(this)}
            colors={this.state.colors}
            loading={this.state.loading.pca}
            reportError={this.reportError.bind(this)}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <TSNEWrapper
            computeTSNE={this.computeTSNE.bind(this)}
            tsneSolution={this.state.tsneSolution}
            colors={this.state.colors}
            loading={this.state.loading.tsne}
            reportError={this.reportError.bind(this)}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <SpatialVis
            barcodes={this.state.filteredBarcodes}
            colors={this.state.colors}
            imageLink={this.state.imageLink}
            loading={this.state.loading.image}
            reportError={this.reportError.bind(this)}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <DGEWrapper
            computeDGE={this.computeDGE.bind(this)}
            dgeSolution={this.state.dgeSolution}
            numClusters={this.state.k}
            loading={this.state.loading.dge}
            reportError={this.reportError.bind(this)}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <GSEWrapper
            computeGSE={this.computeGSE.bind(this)}
            gseSolution={this.state.gseSolution}
            loading={this.state.loading.gse || this.state.loading.geneSets}
            reportError={this.reportError.bind(this)}
          />

          <div style={{ paddingTop: "40px" }}></div>
          <GeneInfo
            reportError={this.reportError.bind(this)}
            computeBoxplot={this.computeBoxplot.bind(this)}
            boxplotData={this.state.boxplotData}
            colors={this.state.clusterLegend}
          />
        </div>
      </>
    );
  }
}

export default Homepage;
