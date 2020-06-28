import React, { Component } from "react";
import { Typography, Paper, Slider } from "@material-ui/core";
import BarGraph from "./BarGraph.jsx";

const headline = "#094067";
const paragraph = "#5f6c7b";
const slider = "#90b4ce";

const marks = (min, max) => {
  const list = [];
  for (let i = min; i < max; i += 0.5) {
    list.push({ value: i, label: Number(i).toFixed(1) });
  }
  return list;
};

const Figure = (props, type) => {
  const sums = props.loading
    ? []
    : type === "rowsum"
    ? props.rowsums
    : props.colsums;

  let minIndex = 0;
  let maxIndex = 10;
  if (sums) {
    minIndex = -1;
    maxIndex = sums.length;
    sums.forEach((datum, index) => {
      if (datum.frequency > 0 && minIndex === -1) minIndex = index;
      if (datum.frequency > 0) maxIndex = index;
    });
    minIndex = Math.max(0, minIndex - 1);
    maxIndex = Math.min(maxIndex + 2, sums.length);
  }

  return (
    <>
      <div
        style={{
          height: "250px",
          width: "100%",
          paddingRight: "15px",
          paddingLeft: "15px",
          paddingBottom: type === "mtsum" ? "0px" : "125px",
        }}
      >
        <Paper
          style={{
            padding: "12px 15px 90px 10px",
            width: "330px",
            height: "100%",
            backgroundColor: "transparent",
          }}
          variant="outlined"
          elevation={3}
        >
          <Typography
            variant="body1"
            align="center"
            style={{ paddingBottom: "5px", fontWeight: 500, color: headline }}
          >
            {type === "rowsum" ? "log10(rowSum + 1)" : "log10(colSum + 1)"}
          </Typography>
          <div style={{ width: "100%", height: "100%" }}>
            <BarGraph
              xLabel={
                type === "rowsum" ? "log10(rowSum + 1)" : "log10(colSum + 1)"
              }
              data={sums}
              min={
                type === "rowsum"
                  ? props.thresholds.minRowSum
                  : props.thresholds.minColSum
              }
              lowerLimit={minIndex}
              upperLimit={maxIndex}
            />
          </div>
          <Slider
            style={{ marginLeft: "20px", width: "90%", color: slider }}
            onChangeCommitted={(_event, value) =>
              props.handleFilter(
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
        </Paper>
      </div>
    </>
  );
};

class QualityControl extends Component {
  render() {
    const { props } = this;
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: headline }}
          variant="h5"
        >
          Quality Control
        </Typography>
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
          <div className="GC-flex">
            {Figure(props, "rowsum")}
            {Figure(props, "colsum")}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default QualityControl;
