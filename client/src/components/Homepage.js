import React, { Component } from "react";
import axios from "axios";
import { SparseMatrix } from "ml-sparse-matrix";
import QualityControl from "./QualityControl";

const poorGene = (gene, threshold) => {
  const count = gene.reduce((n, x) => n + (x > 0), 0);
  return count / gene.length < threshold;
};

const poorCells = (matrix, threshold) => {
  const list = [];
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let count = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) count++;
    }
    if (count >= 0) {
      if ((count /= numGenes) < threshold) list.push(i);
    }
  }

  return list;
};

const poorCellsMT = (matrix, threshold) => {
  const list = [];
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let count = 0;
    let mtCount = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) {
        count++;
        if (matrix[j].feature && matrix[j].feature.substring(0, 3) === "mt-")
          mtCount++;
      }
    }
    if (count > 0) {
      if ((count - mtCount) / count < threshold) list.push(i);
    }
  }

  return list;
};

const getFilteredMatrix = (matrix, thresholds) => {
  // rowSum filtering
  const filteredMatrix = matrix.filter((gene) => {
    return !poorGene(gene, thresholds[0]);
  });

  // colSum filtering and MT filtering
  const badCells = poorCells(matrix, thresholds[1]);
  const badCellsMT = poorCellsMT(matrix, thresholds[2]);
  filteredMatrix.forEach((gene, index) => {
    filteredMatrix[index] = gene.filter((cell, index) => {
      return !badCells.includes(index) && !badCellsMT.includes(index);
    });
  });

  return filteredMatrix;
};

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matrix: [],
      merged: [],
      filteredMatrix: [],
      features: [],
      thresholds: [0.6, 0.6, 0.6],
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
      .catch((error) => {
        console.log(error);
      });
  }

  async loadMatrix() {
    let count = 0;
    const numBatches = 4;
    while (count < numBatches) {
      await axios
        .get(`http://localhost:4000/matrix/${count}/${numBatches}`)
        .then((response) => {
          const res = JSON.parse(response.data);
          const batchNum = Number.parseInt(res.count);
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
              merged: this.state.merged.concat(
                m.to2DArray().filter((gene, index) => {
                  const ret = gene.reduce((n, x) => n + (x > 0), 0) > 0;
                  if (ret) gene.feature = this.state.features[index];
                  return ret;
                })
              ),
            });
          }
          console.log(`Loaded batch #${batchNum + 1}`);
        })
        .catch((error) => {
          this.setState({
            loading: false,
            merged: [],
          });
          console.log(error);
          throw Error;
        });
      count++;
    }

    this.setState({
      matrix: this.state.merged,
      filteredMatrix: getFilteredMatrix(
        this.state.merged,
        this.state.thresholds
      ),
      loading: false,
    });
  }

  componentDidMount() {
    this.loadFeatures();
    this.loadMatrix().catch(() => {});
  }

  handleFilter(filterType, threshold) {
    const matrix = this.state.matrix;
    if (!matrix[0]) return 0;

    const thresholds = this.state.thresholds;
    if (filterType === "rowsum") thresholds[0] = threshold / 100;
    if (filterType === "colsum") thresholds[1] = threshold / 100;
    if (filterType === "mt") thresholds[2] = threshold / 100;

    let filteredMatrix = getFilteredMatrix(matrix, thresholds);
    this.setState({
      thresholds,
      filteredMatrix,
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
        </div>
      </>
    );
  }
}

export default Homepage;
