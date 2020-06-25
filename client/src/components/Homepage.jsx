import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import QualityControl from "./QualityControl.jsx";
import TissueVisualization from "./TissueVisualization.jsx";

const poorGene = (gene, threshold) => {
  const cellCount = gene.reduce((n, x) => n + (x > 0), 0);
  return cellCount / gene.length < threshold;
};

const poorCells = (matrix, threshold) => {
  const list = [];
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) geneCount++;
    }
    if (geneCount / numGenes < threshold) list.push(i);
  }

  return list;
};

const poorCellsMT = (matrix, threshold) => {
  const list = [];
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    let mtGeneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) {
        geneCount++;
        if (matrix[j].feature && matrix[j].feature.substring(0, 3) === "mt-")
          mtGeneCount++;
      }
    }
    if (geneCount > 0) {
      if ((geneCount - mtGeneCount) / geneCount < threshold) list.push(i);
    }
  }

  return list;
};

const getFilteredData = (matrix, features, barcodes, thresholds) => {
  const filteredFeatures = [];
  const filteredBarcodes = [];
  // rowsum filtering
  const filteredMatrix = matrix.filter((gene, index) => {
    const badGene = poorGene(gene, thresholds.minRowSum);
    if (features.length > 0 && !badGene) filteredFeatures.push(features[index]);
    return !badGene;
  });

  // colsum filtering and mt filtering
  const badCells = poorCells(matrix, thresholds.minColSum);
  const badCellsMT = poorCellsMT(matrix, thresholds.minMTSum);
  filteredMatrix.forEach((gene, index) => {
    filteredMatrix[index] = gene.filter((_cell, i) => {
      const badCell = badCells.includes(i) || badCellsMT.includes(i);
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
      filteredFeatures: [],
      barcodes: [],
      filteredBarcodes: [],
      thresholds: { minRowSum: 0.3, minColSum: 0.3, minMTSum: 0.3 },
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
        this.setState({
          barcodes: pixels.filter((pixel) => {
            return barcodes.includes(pixel.barcode);
          }),
        });
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

            this.setState({
              matrix: this.state.matrix.concat(
                m.to2DArray().filter((gene) => {
                  return gene.reduce((n, x) => n + (x > 0), 0) > 0;
                })
              ),
            });
          }
        })
        .catch(() => {
          this.setState({
            matrix: [],
            loading: false,
          });
          throw Error("Batch failed, exiting early");
        });
      count++;
    }

    const filteredData = getFilteredData(
      this.state.matrix,
      this.state.features,
      this.state.barcodes,
      this.state.thresholds
    );

    this.setState({
      filteredMatrix: filteredData.matrix,
      filteredFeatures: filteredData.features,
      filteredBarcodes: filteredData.barcodes,
      loading: false,
    });
  }

  async componentDidMount() {
    await this.loadFeatures();
    await this.loadBarcodes(); // this loads pixels too
    this.loadMatrix().catch(() => {});
  }

  handleFilter(filterType, threshold) {
    const matrix = this.state.matrix;
    if (!matrix[0]) return 0;

    const thresholds = this.state.thresholds;
    if (filterType === "rowsum") thresholds.minRowSum = threshold / 100;
    if (filterType === "colsum") thresholds.minColSum = threshold / 100;
    if (filterType === "mt") thresholds.minMTSum = threshold / 100;

    const features = this.state.features;
    const barcodes = this.state.barcodes;
    const filteredData = getFilteredData(
      matrix,
      features,
      barcodes,
      thresholds
    );
    this.setState({
      thresholds,
      filteredMatrix: filteredData.matrix,
      filteredFeatures: filteredData.features,
      filteredBarcodes: filteredData.barcodes,
    });
  }

  render() {
    if (this.state.filteredMatrix.length > 0) {
      console.log(
        `Filtered matrix has ${this.state.filteredMatrix.length} genes and ${this.state.filteredMatrix[0].length} cells`
      );
    }
    return (
      <>
        <div className="site-container">
          <QualityControl
            matrix={this.state.matrix}
            thresholds={this.state.thresholds}
            handleFilter={this.handleFilter}
            loading={this.state.loading}
          />
          <br />
          <TissueVisualization
            matrix={this.state.filteredMatrix}
            features={this.state.filteredFeatures}
            barcodes={this.state.filteredBarcodes}
          />
          <div style={{ paddingTop: "100px" }}></div>
        </div>
      </>
    );
  }
}

export default Homepage;
