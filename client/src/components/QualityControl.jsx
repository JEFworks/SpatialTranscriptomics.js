import React, { Component } from "react";
import { Typography, Paper, Slider } from "@material-ui/core";
import BarGraph from "./BarGraph.jsx";

const headline = "#094067";
const paragraph = "#5f6c7b";
const slider = "#90b4ce";

const rowSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(20).fill(0);
  matrix.forEach((gene) => {
    const cellCount = gene.reduce((a, b) => {
      return a + b;
    }, 0);
    const index = Math.floor(Math.log10(cellCount + 1) * 2);
    sums[index]++;
  });

  const obj = [];
  sums.forEach((i, index) => {
    obj.push({
      range: index / 2,
      frequency: i,
    });
  });
  return obj;
};

const colSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(20).fill(0);
  const numCells = matrix[0].length;
  const numGenes = matrix.length;

  for (let i = 0; i < numCells; i++) {
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) geneCount += matrix[j][i];
    const index = Math.floor(Math.log10(geneCount + 1) * 2);
    sums[index]++;
  }

  const obj = [];
  sums.forEach((i, index) => {
    obj.push({
      range: index / 2,
      frequency: i,
    });
  });
  return obj;
};

const marks = (min, max) => {
  const m = [];
  for (let i = min; i < max; i += 0.5) {
    m.push({ value: i, label: Number(i).toFixed(1) });
  }
  return m;
};

const Figure = (props, type) => {
  const sums = props.loading
    ? []
    : type === "rowsum"
    ? rowSums(props.matrix)
    : colSums(props.matrix);

  let minIndex;
  let maxIndex;
  if (sums) {
    minIndex = -1;
    maxIndex = sums.length;
    sums.forEach((datum, index) => {
      if (datum.frequency > 0 && minIndex === -1) {
        minIndex = index;
      }
      if (datum.frequency > 0) {
        maxIndex = index;
      }
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
              leftLimit={minIndex}
              rightLimit={maxIndex}
            />
          </div>
          <Slider
            style={{ marginLeft: "20px", width: "90%", color: slider }}
            onChangeCommitted={(_event, value) =>
              props.handleFilter(type, value)
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
