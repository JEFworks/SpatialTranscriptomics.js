import React, { Component } from "react";
import axios from "axios";
import { api } from "../api.js";
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
    numPCs: 10,
    feature: "camk2n1",
  }; // remember to update state in loadEverything()

  matrixFileHandler = this.matrixFileHandler.bind(this);
  barcodesFileHandler = this.barcodesFileHandler.bind(this);
  pixelsFileHandler = this.pixelsFileHandler.bind(this);
  featuresFileHandler = this.featuresFileHandler.bind(this);
  uploadFiles = this.uploadFiles.bind(this);

  setNumPCs = this.setNumPCs.bind(this);
  setFeature = this.setFeature.bind(this);

  handleFilter = this.handleFilter.bind(this);
  computePCA = this.computePCA.bind(this);
  computeTSNE = this.computeTSNE.bind(this);

  async componentDidMount() {
    this.loadEverything();
  }

  async resetState() {
    this.setState({
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
      thresholds: { minRowSum: 2, minColSum: 2 },
      rowsums: [],
      colsums: [],
      colors: [],
      pcs: [],
      numPCs: 10,
      feature: "camk2n1",
    });
  }

  async loadEverything() {
    await this.resetState();
    await this.loadFeatures();
    await this.loadBarcodes();
    await this.loadMatrix().catch(() => {});
  }

  matrixFileHandler(event) {
    const { files } = this.state;
    files.matrix = event.target.files[0];
    this.setState({ files });
  }

  featuresFileHandler(event) {
    const { files } = this.state;
    files.features = event.target.files[0];
    this.setState({ files });
  }

  pixelsFileHandler(event) {
    const { files } = this.state;
    files.pixels = event.target.files[0];
    this.setState({ files });
  }

  barcodesFileHandler(event) {
    const { files } = this.state;
    files.barcodes = event.target.files[0];
    this.setState({ files });
  }

  async uploadFiles() {
    const { files } = this.state;
    if (!files.matrix || !files.barcodes || !files.features || !files.pixels)
      return;

    const data = new FormData();
    data.append("file", files.matrix);
    data.append("file", files.features);
    data.append("file", files.barcodes);
    data.append("file", files.pixels);

    const uuid = uuidv4();
    await axios.post(`${api}/upload/${uuid}`, data, {}).then((_res) => {});
    this.setState({ uuid });
    this.loadEverything();
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
      .catch(() => {
        return [];
      });
  }

  async loadPixels(barcodes) {
    const { uuid } = this.state;
    axios
      .get(`${api}/pixels/${uuid}`)
      .then((response) => {
        const pixels = JSON.parse(response.data);
        pixels.forEach((pixel) => {
          const index = barcodes.indexOf(pixel.barcode);
          if (index !== -1) barcodes[index] = pixel;
        });
        this.setState({ barcodes });
      })
      .catch(() => {});
  }

  async loadMatrix() {
    const { uuid } = this.state;
    let count = 0;
    const numBatches = 4;
    while (count < numBatches) {
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
                    if (feature) adjustedFeatures.push(feature.toLowerCase());
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
          this.setState({ matrix: [] });
          console.log(error);
        });
      count++;
    }

    const { thresholds } = this.state;
    this.handleFilter(thresholds.minRowSum, thresholds.minColSum);
  }

  handleFilter(minRowSum, minColSum) {
    const { matrix } = this.state;
    if (!matrix[0]) return;
    const { thresholds, adjustedFeatures, barcodes } = this.state;
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

    this.setState({
      filteredMatrix: filteredData.matrix,
      filteredFeatures: filteredData.features,
      filteredBarcodes: filteredData.barcodes,
      thresholds,
      rowsums,
      colsums,
      pcs: [],
    });
  }

  getGene(name) {
    const { filteredMatrix, filteredFeatures } = this.state;
    return filteredMatrix[filteredFeatures.indexOf(name)];
  }

  getColorsByGene() {
    const colors = [];
    const gene = this.getGene(this.state.feature);

    if (gene) {
      const { max, min } = MinMaxStats(gene);
      gene.forEach((cell) => {
        colors.push(GetRGB(MinMaxNormalize(cell, min, max)));
      });
    }

    return colors;
  }

  performKMeans(num) {
    const kmean = new KMeans({ k: num });
    const { pcs } = this.state;

    if (pcs.length > 0) {
      kmean.fit(pcs);
      const clusters = kmean.toJSON().clusters;
      return clusters;
    }
    return null;
  }

  getColorsByClusters(num) {
    const clusters = this.performKMeans(num);

    const hashmap = new Map();
    const { pcs } = this.state;
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

  setFeature(name) {
    this.setState({ feature: name });
  }

  setNumPCs(num) {
    this.setState({ numPCs: num });
  }

  computePCA() {
    const m = this.state.filteredMatrix.slice();
    if (!m[0] || m[0].length < 1) return {};

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
    const { pcs, numPCs } = this.state;
    const { epsilon, perplexity, iterations } = tsneSettings;
    if (!pcs[0] || pcs[0].length < 1) {
      alert("Please run PCA first.");
      return [];
    }

    const filteredPCs = [];
    pcs.forEach((pc) => {
      filteredPCs.push(pc.slice(0, numPCs));
    });
    let dists = euclideanDists(filteredPCs);
    dists = normalizeDists(dists);

    const opt = {};
    opt.epsilon = epsilon; // epsilon is learning rate (10 = default)
    opt.perplexity = perplexity; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataDist(dists);

    for (let k = 0; k < iterations; k++) tsne.step(); // default 500 iterations
    const Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    return Y;
  }

  render() {
    const numCells = this.state.filteredMatrix[0]
      ? this.state.filteredMatrix[0].length
      : 0;
    const geneColors = this.getColorsByGene();
    const clusterColors = this.getColorsByClusters(10);

    return (
      <>
        <div style={{ marginBottom: "40px" }}>
          <Header setFeature={this.setFeature} />
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
            colors={geneColors}
            displayAllowed={this.state.pcs[0]}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <TSNEWrapper
            computeTSNE={this.computeTSNE}
            colors={geneColors}
            displayAllowed={this.state.pcs[0]}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <SpatialVis
            barcodes={this.state.filteredBarcodes}
            colors={clusterColors}
            numCells={numCells}
          />

          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
