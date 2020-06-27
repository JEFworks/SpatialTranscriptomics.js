import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import QualityControl from "./QualityControl.jsx";
import FeatureVis from "./FeatureVis.jsx";

const rowSums = (matrix, threshold) => {
  if (!matrix[0]) return [];
  const sums = new Array(20).fill(0);
  const badGenes = [];

  matrix.forEach((gene, index) => {
    const cellCount = gene.reduce((a, b) => {
      return a + b;
    }, 0);

    const log = Math.log10(cellCount + 1);
    sums[Math.floor(log * 2)]++;
    if (Math.floor(log) < threshold) badGenes.push(index);
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
  if (!matrix[0]) return [];
  const sums = new Array(20).fill(0);
  const numCells = matrix[0].length;
  const numGenes = matrix.length;
  const badCells = [];

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) geneCount += matrix[j][i];

    const log = Math.log10(geneCount + 1);
    sums[Math.floor(log * 2)]++;
    if (Math.floor(log) < threshold) badCells.push(i);
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

const getFilteredData = (matrix, features, barcodes, badCells, badGenes) => {
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
    filteredMatrix[index] = gene.filter((_cell, i) => {
      const badCell = badCells.includes(i);
      if (barcodes.length > 0 && index === 0 && !badCell)
        filteredBarcodes.push(barcodes[i]);
      return !badCell;
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
      colSums: [],
      rowSums: [],
      loading: true,
    };

    this.handleFilter = this.handleFilter.bind(this);
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
                let expressed = false;
                for (let cell of gene) {
                  if (cell > 0) {
                    expressed = true;
                    break;
                  }
                }

                if (expressed) {
                  adjustedFeatures.push(
                    this.state.features[index].toLowerCase()
                  );
                }
                return expressed;
              })
            );
            this.setState({ matrix, adjustedFeatures });
          }
        })
        .catch(() => {
          this.setState({
            matrix: [],
            loading: false,
          });
          throw Error("A batch failed, exiting early.");
        });
      count++;
    }

    const { matrix, thresholds, adjustedFeatures, barcodes } = this.state;
    const colsums = colSums(matrix, thresholds.minColSum);
    const rowsums = rowSums(matrix, thresholds.minRowSum);

    const filteredData = getFilteredData(
      matrix,
      adjustedFeatures,
      barcodes,
      colsums.badCells,
      rowsums.badGenes
    );

    this.setState({
      filteredMatrix: filteredData.matrix,
      filteredFeatures: filteredData.features,
      filteredBarcodes: filteredData.barcodes,
      colSums: colsums,
      rowSums: rowsums,
      loading: false,
    });
  }

  async componentDidMount() {
    await this.loadFeatures();
    await this.loadBarcodes(); // this loads pixels too
    this.loadMatrix().catch(() => {});
  }

  handleFilter(filterType, threshold) {
    const { matrix, thresholds, adjustedFeatures, barcodes } = this.state;
    if (!matrix[0]) return 0;

    if (filterType === "rowsum") thresholds.minRowSum = threshold;
    if (filterType === "colsum") thresholds.minColSum = threshold;

    const colsums = colSums(matrix, thresholds.minColSum);
    const rowsums = rowSums(matrix, thresholds.minRowSum);

    const filteredData = getFilteredData(
      matrix,
      adjustedFeatures,
      barcodes,
      colsums.badCells,
      rowsums.badGenes
    );

    this.setState({
      thresholds,
      filteredMatrix: filteredData.matrix,
      filteredFeatures: filteredData.features,
      filteredBarcodes: filteredData.barcodes,
      colSums: colsums,
      rowSums: rowsums,
    });
  }

  render() {
    return (
      <>
        <div className="site-container">
          <QualityControl
            matrix={this.state.matrix}
            thresholds={this.state.thresholds}
            colSums={this.state.colSums.sums}
            rowSums={this.state.rowSums.sums}
            handleFilter={this.handleFilter}
            loading={this.state.loading}
          />
          <br />
          <FeatureVis
            matrix={this.state.filteredMatrix}
            features={this.state.filteredFeatures}
            barcodes={this.state.filteredBarcodes}
          />
          <div style={{ paddingTop: "70px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
