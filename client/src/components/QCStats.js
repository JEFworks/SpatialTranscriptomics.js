import React, { Component } from "react";
import { Typography } from "@material-ui/core";

import BarGraph from "./BarGraph";

const rowSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(10).fill(0);
  matrix.forEach((gene) => {
    let count = gene.reduce((n, x) => n + (x > 0), 0);
    if (count > 0) {
      count /= gene.length;
      const index = Math.min(Math.floor(count * 10), 9);
      sums[index]++;
    }
  });

  const obj = [];
  sums.forEach((i, index) => {
    obj.push({
      range: Number(index / 10).toFixed(1),
      frequency: i,
    });
  });
  return obj;
};

const colSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(10).fill(0);
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let count = 0;
    for (let j = 0; j < matrix.length; j++) {
      if (matrix[j][i] > 0) count++;
    }
    if (count > 0) {
      count /= numGenes;
      const index = Math.min(Math.floor(count * 10), 9);
      sums[index]++;
    }
  }

  const obj = [];
  sums.forEach((i, index) => {
    obj.push({
      range: Number(index / 10).toFixed(1),
      frequency: i,
    });
  });
  return obj;
};

class QCStats extends Component {
  render() {
    return (
      <>
        <Typography variant="h5">Quality Control</Typography>
        <div style={{ display: "flex" }}>
          <div style={{ height: "350px", width: "600px" }}>
            <BarGraph
              xLabel={"% of cells per detected gene"}
              data={this.props.loading ? [] : rowSums(this.props.matrix)}
              min={0.6}
            />
          </div>
          <div style={{ height: "350px", width: "600px" }}>
            <BarGraph
              xLabel={"% of detected genes per cell"}
              data={this.props.loading ? [] : colSums(this.props.matrix)}
              min={0.8}
            />
          </div>
        </div>
      </>
    );
  }
}

export default QCStats;
