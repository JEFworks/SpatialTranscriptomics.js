import React, { Component } from "react";
import { Typography, Paper, Slider } from "@material-ui/core";
import BarGraph from "./BarGraph.jsx";

const headline = "#094067";
const paragraph = "#5f6c7b";
const slider = "#90b4ce";

const rowSums = (matrix) => {
  if (!matrix[0]) return [];
  const sums = new Array(10).fill(0);
  matrix.forEach((gene) => {
    let cellCount = gene.reduce((n, x) => n + (x > 0), 0);
    cellCount /= gene.length;
    cellCount = Math.min(Math.floor(cellCount * 10), 9);
    sums[cellCount]++;
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
    let geneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) geneCount++;
    }
    geneCount /= numGenes;
    geneCount = Math.min(Math.floor(geneCount * 10), 9);
    sums[geneCount]++;
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
    let geneCount = 0;
    let mtGeneCount = 0;
    for (let j = 0; j < numGenes; j++) {
      if (matrix[j][i] > 0) {
        geneCount++;
        if (matrix[j].feature && matrix[j].feature.substring(0, 3) === "mt-")
          mtGeneCount++;
      }
    }
    if (geneCount > 0) {
      let nonMT = (geneCount - mtGeneCount) / geneCount;
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

const marks = [];
for (let i = 0; i < 100; i += 10) {
  marks.push({ value: i, label: i + "%" });
}

const Figure = (props, type) => {
  return (
    <>
      <div
        style={{
          height: "250px",
          width: "100%",
          paddingRight: "15px",
          paddingLeft: "15px",
          paddingBottom:
            type === "rowsum" || type === "colsum" ? "125px" : "0px",
        }}
      >
        <Paper
          style={{
            padding: "12px 15px 90px 10px",
            width: "330px",
            height: "100%",
          }}
          variant="outlined"
          elevation={3}
        >
          <Typography
            variant="body1"
            align="center"
            style={{
              fontWeight: "500",
              paddingBottom: "5px",
              color: headline,
            }}
          >
            {type === "rowsum"
              ? "% of cells detected per gene"
              : type === "colsum"
              ? "% of genes detected per cell"
              : "% non-MT gene expression per cell"}
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
            style={{ marginLeft: "20px", width: "90%", color: slider }}
            onChangeCommitted={(_event, value) =>
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
        <Typography
          style={{ marginBottom: "10px", fontWeight: "500", color: headline }}
          variant="h5"
        >
          Quality Control
        </Typography>
        <Typography
          style={{ marginBottom: "20px", fontWeight: "400", color: paragraph }}
          variant="body1"
        >
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
