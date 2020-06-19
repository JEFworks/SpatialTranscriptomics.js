import React, { Component } from "react";
import { Typography, Paper, Slider } from "@material-ui/core";
import BarGraph from "./BarGraph";

const rowSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(10).fill(0);
  matrix.forEach((gene) => {
    let count = gene.reduce((n, x) => n + (x > 0), 0);
    count /= gene.length;
    count = Math.min(Math.floor(count * 10), 9);
    sums[count]++;
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
      count = Math.min(Math.floor(count * 10), 9);
      sums[count]++;
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

const mtSums = (matrix) => {
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
      let nonMT = (count - mtCount) / count;
      nonMT = Math.min(Math.floor(nonMT * 10), 9);
      sums[nonMT]++;
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

const marks = [
  {
    value: 0,
    label: "0%",
  },
  {
    value: 10,
    label: "10%",
  },
  {
    value: 20,
    label: "20%",
  },
  {
    value: 30,
    label: "30%",
  },
  {
    value: 40,
    label: "40%",
  },
  {
    value: 50,
    label: "50%",
  },
  {
    value: 60,
    label: "60%",
  },
  {
    value: 70,
    label: "70%",
  },
  {
    value: 80,
    label: "80%",
  },
  {
    value: 90,
    label: "90%",
  },
];

const Figure = (props, type) => {
  return (
    <>
      <div
        style={{
          height: "250px",
          width: "100%",
          paddingRight: type === "rowsum" || type === "colsum" ? "20px" : "0px",
          paddingBottom: "120px",
        }}
      >
        <Paper
          style={{
            padding: "10px 15px 90px 10px",
            width: "330px",
            height: "100%",
          }}
          variant="outlined"
          elevation={3}
        >
          <Typography variant="h6" align="center">
            {type === "rowsum"
              ? "Figure 1"
              : type === "colsum"
              ? "Figure 2"
              : "Figure 3"}
          </Typography>
          <div style={{ width: "100%", height: "100%" }}>
            <BarGraph
              xLabel={
                type === "rowsum"
                  ? "% of cells detected per gene"
                  : type === "colsum"
                  ? "% of genes detected per cell"
                  : "% non-MT gene expression per cell"
              }
              data={
                props.loading
                  ? []
                  : type === "rowsum"
                  ? rowSums(props.matrix)
                  : type === "colsum"
                  ? colSums(props.matrix)
                  : mtSums(props.matrix)
              }
              min={
                type === "rowsum"
                  ? props.thresholds[0]
                  : type === "colsum"
                  ? props.thresholds[1]
                  : props.thresholds[2]
              }
            />
          </div>
          <Slider
            style={{ marginLeft: "20px", width: "90%", color: "#0091ea" }}
            onChangeCommitted={(event, value) =>
              props.handleFilter(type, value)
            }
            marks={marks}
            defaultValue={60}
            step={10}
            min={0}
            max={90}
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
        <Typography style={{ marginBottom: "10px" }} variant="h5">
          Quality Control
        </Typography>
        <Typography style={{ marginBottom: "20px" }} variant="body1">
          Use the range selectors to change the minimum threshold for each
          quality control metric. Cells and genes below these thresholds will be
          removed from the expression matrix, thereby improving downstream
          analysis. Genes not expressed in any cells were removed before
          computing quality control.
        </Typography>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="GC-flex">
            {Figure(props, "rowsum")}
            {Figure(props, "colsum")}
            {Figure(props, "mt")}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default QualityControl;
