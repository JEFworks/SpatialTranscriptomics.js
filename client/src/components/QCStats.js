import React, { Component } from "react";
import { Typography } from "@material-ui/core";

import BarGraph from "./BarGraph";

const rowSums = (batches) => {
  const rowSums = new Array(10).fill(0);
  batches.forEach((batch) => {
    const array = batch.to2DArray();
    array.forEach((gene, i) => {
      let count = gene.reduce((n, x) => n + (x > 0), 0);
      if (count > 0) {
        count /= gene.length;
        let index = Math.min(Math.floor(count * 10), 9);
        rowSums[index]++;
      }
    });
  });

  const obj = [];
  rowSums.forEach((i, index) => {
    obj.push({
      range: Number(index / 10).toFixed(1),
      frequency: i,
    });
  });
  return obj;
};

class QCStats extends Component {
  getData(loading) {
    if (loading) {
      return [];
    } else {
      return rowSums(this.props.batches);
    }
  }

  render() {
    return (
      <>
        <Typography variant="h5">Quality Control</Typography>
        <div style={{ height: "350px", width: "600px" }}>
          <BarGraph data={this.getData(this.props.loading)} min={0.6} />
        </div>
      </>
    );
  }
}

export default QCStats;
