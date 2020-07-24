import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import { PCA } from "ml-pca";
import * as d3 from "d3";
import QualityControl from "./QualityControl.jsx";
import FeatureVis from "./FeatureVis.jsx";
import PCAWrapper from "./PCA.jsx";

const normalize = (val, min, max) => {
  return (val - min) / (max - min);
};

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

    const mean = d3.mean(filteredGene);
    const sd = d3.deviation(filteredGene);
    const upperLimit = mean + 2 * sd;
    const lowerLimit = mean - 2 * sd;
    const max = Math.min(d3.max(filteredGene), upperLimit);
    const min = Math.max(lowerLimit, d3.min(filteredGene));

    filteredMatrix[index] = filteredGene.map((cell) => {
      return normalize(cell, min, max);
    });
  });

  return {
    matrix: filteredMatrix,
    features: filteredFeatures,
    barcodes: filteredBarcodes,
  };
};

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    };

    this.handleFilter = this.handleFilter.bind(this);
    this.computePCA = this.computePCA.bind(this);
  }

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
    const matrix = this.state.filteredMatrix;
    if (!matrix[0] || matrix[0].length < 1) return {};
    const pca = new PCA(matrix, {
      method: "SVD",
      center: true,
      scale: true,
      ignoreZeroVariance: true,
    });
    const vectors = pca.getEigenvectors().data;
    const values = pca.getEigenvalues();
    return { eigenvectors: vectors, eigenvalues: values };
  }

  render() {
    const { filteredMatrix } = this.state;
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
            matrix={filteredMatrix}
            features={this.state.filteredFeatures}
            barcodes={this.state.filteredBarcodes}
          />
          <div style={{ paddingTop: "35px" }}></div>
          <PCAWrapper
            matrix={filteredMatrix}
            features={this.state.filteredFeatures}
            computePCA={this.computePCA}
          />
          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
