import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import { PCA } from "ml-pca";

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

import Header from "./Header.jsx";
import QualityControl from "./QualityControl.jsx";
import PCAWrapper from "./PCA.jsx";
import TSNEWrapper from "./tSNE.jsx";
import SpatialVis from "./SpatialVis.jsx";

class Homepage extends Component {
  state = {
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
  };

  handleFilter = this.handleFilter.bind(this);
  setNumPCs = this.setNumPCs.bind(this);
  setFeature = this.setFeature.bind(this);
  computePCA = this.computePCA.bind(this);
  computeTSNE = this.computeTSNE.bind(this);

  async componentDidMount() {
    await this.loadFeatures();
    await this.loadBarcodes();
    await this.loadMatrix().catch(() => {});
    this.getColors();
  }

  async loadFeatures() {
    axios
      .get(`http://localhost:4000/features`)
      .then((response) => {
        const features = JSON.parse(response.data);
        this.setState({ features });
      })
      .catch(() => {});
  }

  async loadBarcodes() {
    axios
      .get(`http://localhost:4000/barcodes`)
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
    axios
      .get(`http://localhost:4000/pixels`)
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
    let count = 0;
    const numBatches = 4;
    while (count < numBatches) {
      await axios
        .get(`http://localhost:4000/matrix/${count}/${numBatches}`)
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
          throw Error(error);
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

  getColors() {
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

  setNumPCs(num) {
    this.setState({ numPCs: num });
  }

  setFeature(name) {
    this.setState({ feature: name });
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

    this.setState({ pcs });
    return { eigenvectors: pcs, eigenvalues: eigenvalues };
  }

  computeTSNE() {
    const { pcs, numPCs } = this.state;
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
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataDist(dists);

    for (let k = 0; k < 500; k++) tsne.step(); // every time you call this, solution gets better
    const Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    return Y;
  }

  render() {
    const numCells = this.state.filteredMatrix[0]
      ? this.state.filteredMatrix[0].length
      : 0;
    const colors = this.getColors();

    return (
      <>
        <div style={{ marginBottom: "60px" }}>
          <Header setFeature={this.setFeature} />
        </div>

        <div className="site-container">
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
            displayAllowed={this.state.pcs[0]}
          />

          <div style={{ paddingTop: "20px" }}></div>
          <SpatialVis
            barcodes={this.state.filteredBarcodes}
            colors={colors}
            numCells={numCells}
          />

          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
