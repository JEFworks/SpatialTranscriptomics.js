import React, { Component } from "react";
import { Typography } from "@material-ui/core";

import BarGraph from "./BarGraph";

const rowSums = (batches) => {
  const rowSums = new Array(10).fill(0);
  batches.forEach((batch) => {
    batch.to2DArray().forEach((gene) => {
      let count = gene.reduce((n, x) => n + (x > 0), 0);
      if (count > 0) {
        count /= gene.length;
        let index = Math.min(Math.floor(count * 10), 9);
        rowSums[index]++;
      }
    });
  });
  const obj = [];
  for (let i = 0; i < rowSums.length; i++) {
    obj.push({
      range: Number(i / 10)
        .toFixed(1)
        .toString(),
      frequency: rowSums[i],
    });
  }
  return obj;
};

class QCStats extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   rowSums: [
    //     {
    //       range: "Default",
    //       frequency: 134,
    //     },
    //     {
    //       range: "Default 2",
    //       frequency: 2600,
    //     },
    //   ],
    // };
  }

  //   componentDidMount() {
  //     if (!this.props.loading) {
  //       this.setState({
  //         rowSums: rowSums(this.props.batches),
  //       });
  //     }
  //   }

  getData(loading) {
    if (loading) {
      return [
        {
          range: "Default",
          frequency: 134,
        },
        {
          range: "Default 2",
          frequency: 2600,
        },
      ];
    } else {
      return rowSums(this.props.batches);
    }
  }

  render() {
    return (
      <>
        <Typography variant="h5">Quality Control</Typography>
        <div style={{ height: "350px", width: "600px" }}>
          <BarGraph data={this.getData(this.props.loading)} />
        </div>
      </>
    );
  }
}

export default QCStats;
