import React, { Component } from "react";
import { Typography, Paper, Slider, Button } from "@material-ui/core";
import BarGraph from "./BarGraph.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";
const sliderColor = "#90b4ce";

const marks = (min, max) => {
  const list = [];
  for (let i = min; i < max; i += 0.5)
    list.push({ value: i, label: i.toFixed(1) });
  return list;
};

const Figure = (rowsums, colsums, thresholds, changeThreshold, type) => {
  const sums = !rowsums ? [] : type === "rowsum" ? rowsums : colsums;

  let minIndex = 0;
  let maxIndex = 10;
  if (sums && sums.length > 0) {
    minIndex = -1;
    maxIndex = sums.length;
    sums.forEach((datum, index) => {
      if (datum.frequency > 0 && minIndex === -1) minIndex = index;
      if (datum.frequency > 0) maxIndex = index;
    });
    minIndex = Math.max(0, minIndex - 1);
    maxIndex = Math.min(maxIndex + 2, sums.length);
  }

  const Title = (
    <>
      <Typography
        variant="body1"
        align="center"
        style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
      >
        {type === "rowsum" ? "log10(rowSum + 1)" : "log10(colSum + 1)"}
      </Typography>
    </>
  );

  const Histogram = (
    <>
      <div style={{ width: "100%", height: "100%" }}>
        <BarGraph
          xLabel={type === "rowsum" ? "log10(rowSum + 1)" : "log10(colSum + 1)"}
          data={sums}
          min={type === "rowsum" ? thresholds.minRowSum : thresholds.minColSum}
          lowerLimit={minIndex}
          upperLimit={maxIndex}
        />
      </div>
    </>
  );

  const Toggle = (
    <>
      <Slider
        style={{ marginLeft: "20px", width: "90%", color: sliderColor }}
        onChangeCommitted={(_event, value) =>
          changeThreshold(
            type === "rowsum" ? value : null,
            type === "colsum" ? value : null
          )
        }
        marks={marks(minIndex / 2, maxIndex / 2)}
        defaultValue={2.0}
        step={0.5}
        min={minIndex / 2}
        max={maxIndex / 2 - 0.5}
        valueLabelDisplay="auto"
      />
    </>
  );

  return (
    <>
      <div
        style={{
          height: "250px",
          width: "100%",
          paddingRight: "15px",
          paddingLeft: "15px",
          paddingBottom: "125px",
        }}
      >
        <Paper
          style={{
            padding: "15px 20px 90px 15px",
            width: "370px",
            height: "100%",
            backgroundColor: "transparent",
          }}
          variant="outlined"
          elevation={3}
        >
          {Title}
          {Histogram}
          {Toggle}
        </Paper>
      </div>
    </>
  );
};

class QualityControl extends Component {
  constructor(props) {
    super(props);
    const { thresholds } = props;
    this.state = {
      minRowSum: thresholds.minRowSum,
      minColSum: thresholds.minColSum,
    };

    this.changeThreshold = this.changeThreshold.bind(this);
    this.run = this.run.bind(this);
  }

  changeThreshold(minRowSum, minColSum) {
    if (minRowSum) this.setState({ minRowSum });
    if (minColSum) this.setState({ minColSum });
  }

  run() {
    const { props } = this;
    const { minRowSum, minColSum } = this.state;
    props.handleFilter(minRowSum, minColSum);
  }

  render() {
    const { props, state } = this;
    const { rowsums, colsums } = props;
    const { minRowSum, minColSum } = state;
    const thresholds = { minRowSum: minRowSum, minColSum: minColSum };

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Quality Control
        </Typography>
        <Button variant="contained" color="primary" onClick={() => this.run()}>
          Run
        </Button>

        <Typography
          style={{ marginBottom: "20px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Use the range selectors to change the minimum threshold for each
          quality control metric. Cells and genes below these thresholds will be
          removed from the expression matrix for downstream analysis. Genes not
          expressed in any cells were removed before computing quality control.
        </Typography>

        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="QC-flex">
            {Figure(
              rowsums,
              colsums,
              thresholds,
              this.changeThreshold,
              "rowsum"
            )}
            {Figure(
              rowsums,
              colsums,
              thresholds,
              this.changeThreshold,
              "colsum"
            )}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default QualityControl;
