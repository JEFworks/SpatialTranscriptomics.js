import React, { Component } from "react";
import axios from "axios";

import { Typography } from "@material-ui/core";
import { SparseMatrix } from "ml-sparse-matrix";

const printBatches = (array) => {
  for (let i = 0; i < array.length; i++) {
    const batch = array[i];
    if (batch) console.log(batch.getNonZeros());
  }
};

class Homepage extends Component {
  intervalID;

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
    while (count < numBatches) {
      await axios
        .get(`http://localhost:4000/${count}/${numBatches}`)
        .then((response) => {
          const res = JSON.parse(response.data);
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
          matrix.elements = elements;
          const batches = this.state.batches;
          batches[res.count] = matrix;
          this.setState({
            batches,
          });
          console.log("Loaded batch #" + (res.count + 1));
        })
        .catch((error) => {
          console.log(error);
        });
      count++;
    }
    printBatches(this.state.batches);
    this.setState({
      loading: false,
    });
  }

  componentDidMount() {
    this.loadData().catch((error) => {});
  }

  render() {
    return (
      <>
        <div className="site-container">
          {this.state.loading && (
            <Typography variant="body1">Loading...</Typography>
          )}
          {!this.state.loading && (
            <Typography variant="body1">Data loaded :D</Typography>
          )}
        </div>
      </>
    );
  }
}

export default Homepage;
