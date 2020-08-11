import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import { PCA } from "ml-pca";
import tsnejs from "../functions/tsne.js";
import QualityControl from "./QualityControl.jsx";
import FeatureVis from "./FeatureVis.jsx";
import PCAWrapper from "./PCA.jsx";
import TSNE from "./tSNE.jsx";

const rowSums = (matrix, threshold) => {
  if (!matrix[0]) return {};
  const sums = new Array(20).fill(0);
  const badGenes = [];

  matrix.forEach((gene, index) => {
    const cellCount = gene.reduce((a, b) => {
      return a + b;
    }, 0);

    const log = Math.log10(cellCount + 1);
    sums[Math.floor(log * 2)]++;
    if (log < threshold) badGenes.push(index);
  });

  const obj = [];
  sums.forEach((freq, index) => {
    obj.push({
      range: index / 2,
      frequency: freq,
    });
  });
  return { sums: obj, badGenes: badGenes };
};

const colSums = (matrix, threshold) => {
  if (!matrix[0]) return {};
  const sums = new Array(20).fill(0);
  const numCells = matrix[0].length;
  const numGenes = matrix.length;
  const badCells = [];

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) geneCount += matrix[j][i];

    const log = Math.log10(geneCount + 1);
    sums[Math.floor(log * 2)]++;
    if (log < threshold) badCells.push(i);
  }

  const obj = [];
  sums.forEach((freq, index) => {
    obj.push({
      range: index / 2,
      frequency: freq,
    });
  });
  return { sums: obj, badCells: badCells };
};

const getFilteredData = (matrix, features, barcodes, badGenes, badCells) => {
  const filteredFeatures = [];
  const filteredBarcodes = [];

  // rowsum filtering
  const filteredMatrix = matrix.filter((_gene, index) => {
    const badGene = badGenes.includes(index);
    if (features.length > 0 && !badGene) filteredFeatures.push(features[index]);
    return !badGene;
  });

  // colsum filtering
  filteredMatrix.forEach((gene, index) => {
    const filteredGene = gene.filter((_cell, i) => {
      const badCell = badCells.includes(i);
      if (barcodes.length > 0 && index === 0 && !badCell)
        filteredBarcodes.push(barcodes[i]);
      return !badCell;
    });

    filteredMatrix[index] = filteredGene;
  });

  return {
    matrix: filteredMatrix,
    features: filteredFeatures,
    barcodes: filteredBarcodes,
  };
};

const cpmNormalize = (m) => {
  const matrix = m.slice();
  matrix.forEach((gene, index) => {
    const totalReads = gene.reduce((a, b) => {
      return a + b;
    }, 0);
    matrix[index] = gene.map((cell) => {
      const cpm = (cell * Math.pow(10, 6)) / totalReads;
      return Math.log10(cpm + 1);
    });
  });
  return matrix;
};

const euclideanDists = (matrix) => {
  const dists = new Array(Math.min(1000, matrix.length));
  for (let i = 0; i < dists.length; i++)
    dists[i] = new Array(dists.length).fill(0);

  for (let i = 0; i < dists.length; i++) {
    for (let j = i + 1; j < dists.length; j++) {
      for (let d = 0; d < matrix[0].length; d++) {
        dists[i][j] += Math.pow(matrix[i][d] - matrix[j][d], 2);
      }
      dists[i][j] = Math.sqrt(dists[i][j]);
      dists[j][i] = dists[i][j];
    }
  }

  return dists;
};

const normalizeDists = (d) => {
  const dists = d.slice();
  let max_dist = 0;
  for (let i = 0; i < dists.length; i++) {
    for (let j = i + 1; j < dists.length; j++) {
      if (dists[i][j] > max_dist) max_dist = dists[i][j];
    }
  }
  for (let i = 0; i < dists.length; i++) {
    for (let j = 0; j < dists.length; j++) {
      dists[i][j] /= max_dist;
    }
  }
  return dists;
};

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
    pcs: [],
  };

  handleFilter = this.handleFilter.bind(this);
  computePCA = this.computePCA.bind(this);
  getGene = this.getGene.bind(this);
  computeTSNE = this.computeTSNE.bind(this);

  async componentDidMount() {
    await this.loadFeatures();
    await this.loadBarcodes();
    this.loadMatrix().catch(() => {});
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
    });
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

  getGene(name) {
    const { filteredMatrix, filteredFeatures } = this.state;
    return filteredMatrix[filteredFeatures.indexOf(name)];
  }

  computeTSNE() {
    // const m = this.state.filteredMatrix.slice();
    const { pcs } = this.state;
    if (!pcs[0] || pcs[0].length < 1) return [];

    // const matrix = cpmNormalize(m);
    const filteredPCs = [];
    pcs.forEach((pc) => {
      filteredPCs.push(pc.slice(0, 10));
    });
    // console.log(data);
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
    return (
      <>
        <div className="site-container">
          <QualityControl
            thresholds={this.state.thresholds}
            rowsums={this.state.rowsums.sums}
            colsums={this.state.colsums.sums}
            handleFilter={this.handleFilter}
          />

          <div style={{ paddingTop: "30px" }}></div>
          <FeatureVis
            getGene={this.getGene}
            barcodes={this.state.filteredBarcodes}
          />

          <div style={{ paddingTop: "35px" }}></div>
          <PCAWrapper getGene={this.getGene} computePCA={this.computePCA} />

          <div style={{ paddingTop: "10px" }}></div>
          <TSNE computeTSNE={this.computeTSNE} />

          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
