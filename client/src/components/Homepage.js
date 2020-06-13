import React, { Component } from "react";
import axios from "axios";

import { SparseMatrix } from "ml-sparse-matrix";

import QCStats from "./QCStats";

class Homepage extends Component {
  constructor(props) {
    super(props);
    const numBatches = 4;
    this.state = {
      batches: new Array(numBatches),
      numBatches,
      loading: true,
    };
  }

  async loadData() {
    let count = 0;
    const numBatches = this.state.numBatches;
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

          const batches = this.state.batches;
          batches[batchNum] = matrix;
          this.setState({
            loading: batchNum + 1 >= limit ? false : true,
            batches,
          });
          console.log("Loaded batch #" + (batchNum + 1));
        })
        .catch((error) => {
          console.log(error);
        });
      count++;
    }
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
          <QCStats batches={this.state.batches} loading={this.state.loading} />
        </div>
      </>
    );
  }
}

export default Homepage;
