import React, { Component } from "react";
import { Typography, Paper, Slider } from "@material-ui/core";
import BarGraph from "./BarGraph";

const rowSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(10).fill(0);
  matrix.forEach((gene) => {
    let count = gene.reduce((n, x) => n + (x > 0), 0);
    count /= gene.length;
    const index = Math.min(Math.floor(count * 10), 9);
    sums[index]++;
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
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) count++;
    }
    if (count >= 0) {
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

const mtSums = (matrix, features) => {
  if (!matrix[0]) return [];
  const sums = new Array(10).fill(0);
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
      const nonMT = (count - mtCount) / count;
      const index = Math.min(Math.floor(nonMT * 10), 9);
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

class QualityControl extends Component {
  render() {
    const { props } = this;
    console.log(props.filteredMatrix);
    return (
      <>
        <Typography style={{ marginBottom: "10px" }} variant="h5">
          Quality Control
        </Typography>
        <Typography style={{ marginBottom: "15px" }} variant="body1">
          Use the range selectors to change the minimum threshold for each
          quality control metric. Cells and genes below these thresholds will be
          removed from the expression matrix, thereby improving downstream
          analysis. Genes not expressed in any cells were removed before
          computing quality control.
        </Typography>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="GC-flex">
            <div
              style={{
                height: "225px",
                width: "100%",
                paddingRight: "20px",
                paddingBottom: "80px",
              }}
            >
              <Paper
                style={{
                  padding: "10px 20px 50px 10px",
                  width: "300px",
                  height: "100%",
                }}
                variant="outlined"
                elevation={3}
              >
                <Typography variant="h6" align="center">
                  Figure 1
                </Typography>
                <div style={{ width: "100%", height: "100%" }}>
                  <BarGraph
                    xLabel={"% of cells detected per gene"}
                    data={props.loading ? [] : rowSums(props.matrix)}
                    min={props.thresholds[0]}
                  />
                </div>
                <Slider
                  style={{ color: "#0091ea" }}
                  onChangeCommitted={(e, value) =>
                    props.changeThreshold("rowsum", value)
                  }
                  defaultValue={60}
                  step={10}
                  marks
                  min={0}
                  max={90}
                  valueLabelDisplay="auto"
                />
              </Paper>
            </div>
            <div
              style={{
                height: "225px",
                width: "100%",
                paddingRight: "20px",
                paddingBottom: "80px",
              }}
            >
              <Paper
                onClick={() => props.changeThreshold("hi", "hi")}
                style={{
                  padding: "10px 20px 50px 10px",
                  width: "300px",
                  height: "100%",
                }}
                variant="outlined"
                elevation={3}
              >
                <Typography variant="h6" align="center">
                  Figure 2
                </Typography>
                <div style={{ width: "100%", height: "100%" }}>
                  <BarGraph
                    xLabel={"% of genes detected per cell"}
                    data={props.loading ? [] : colSums(props.matrix)}
                    min={props.thresholds[1]}
                  />
                </div>
              </Paper>
            </div>
            <div style={{ height: "225px", width: "100%" }}>
              <Paper
                style={{
                  padding: "10px 20px 50px 10px",
                  width: "300px",
                  height: "100%",
                }}
                variant="outlined"
                elevation={3}
              >
                <Typography variant="h6" align="center">
                  Figure 3
                </Typography>
                <div style={{ width: "100%", height: "100%" }}>
                  <BarGraph
                    xLabel={"% non-MT gene expression per cell"}
                    data={
                      props.loading ? [] : mtSums(props.matrix, props.features)
                    }
                    min={props.thresholds[2]}
                  />
                </div>
              </Paper>
            </div>
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default QualityControl;
