import React, { Component } from "react";
import axios from "axios";

import { SparseMatrix } from "ml-sparse-matrix";

import QCStats from "./QCStats";

class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matrix: [],
      loading: true,
    };
  }

  async loadData() {
    let count = 0;
    let merged = [];
    const numBatches = 4;
    const limit = numBatches;
    while (count < limit) {
      await axios
        .get(`http://localhost:4000/${count}/${numBatches}`)
        .then((response) => {
          const res = JSON.parse(response.data);
          const batchNum = Number.parseInt(res.count);
          const matrix = new SparseMatrix(res.rows, res.columns);

          const elements = matrix.elements;
          elements.distinct = res.elements.distinct;
          elements.freeEntries = res.elements.freeEntries;
          elements.highWaterMark = res.elements.highWaterMark;
          elements.lowWaterMark = res.elements.lowWaterMark;
          elements.maxLoadFactor = res.elements.maxLoadFactor;
          elements.minLoadFactor = res.elements.minLoadFactor;
          elements.state = res.elements.state;
          elements.table = res.elements.table;
          elements.values = res.elements.values;

          if (elements.distinct !== 0)
            merged = merged.concat(matrix.to2DArray());
          console.log("Loaded batch #" + (batchNum + 1));
        })
        .catch((error) => {
          console.log(error);
        });
      count++;
    }

    this.setState({
      loading: false,
      matrix: merged,
    });
  }

  componentDidMount() {
    this.loadData().catch((error) => {
      console.log(error);
    });
  }

  render() {
    return (
      <>
        <div className="site-container">
          <QCStats matrix={this.state.matrix} loading={this.state.loading} />
        </div>
      </>
    );
  }
}

export default Homepage;
