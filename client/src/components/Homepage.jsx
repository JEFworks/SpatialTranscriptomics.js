import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import QualityControl from "./QualityControl.jsx";
import FeatureVis from "./FeatureVis.jsx";

const poorGene = (gene, threshold) => {
  const cellCount = gene.reduce((a, b) => {
    return a + b;
  }, 0);
  return Math.floor(Math.log10(cellCount + 1)) < threshold;
};

const poorCells = (matrix, threshold) => {
  const list = [];
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      geneCount += matrix[j][i];
    }
    if (Math.floor(Math.log10(geneCount + 1)) < threshold) list.push(i);
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

  // colsum filtering
  const badCells = poorCells(matrix, thresholds.minColSum);
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
      filteredFeatures: [],
      barcodes: [],
      filteredBarcodes: [],
      thresholds: { minRowSum: 2, minColSum: 2 },
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
        const b = barcodes.slice();

        pixels.forEach((pixel) => {
          const index = b.indexOf(pixel.barcode);
          if (index >= 0) b[index] = pixel;
        });

        this.setState({
          barcodes: b,
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
    if (filterType === "rowsum") thresholds.minRowSum = threshold;
    if (filterType === "colsum") thresholds.minColSum = threshold;

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
          <FeatureVis
            key={Math.random(10000)}
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
