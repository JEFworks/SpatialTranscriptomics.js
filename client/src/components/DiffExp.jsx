import React, { Component } from "react";
import {
  Typography,
  Button,
  Paper,
  TextField,
  FormGroup,
  CircularProgress,
} from "@material-ui/core";
import ScatterPlot from "./Plots/ScatterPlot.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";
const blue = "#80d8ff";

const Plot = (data, getColor) => {
  const obj = [{ data: [] }];

  if (data && data.length > 0) {
    let maxP = 0;
    let maxFC = 0;
    let minFC = data[0].fc;
    data.forEach((gene) => {
      if (isFinite(gene.p) && gene.p > maxP) {
        maxP = gene.p;
      }
      if (isFinite(gene.fc) && gene.fc > maxFC) {
        maxFC = gene.fc;
      }
      if (isFinite(gene.fc) && gene.fc < minFC) {
        minFC = gene.fc;
      }
    });

    data.forEach((gene, index) => {
      const { fc, p } = gene;

      const y = p == Number.POSITIVE_INFINITY ? maxP + 1 : p;
      let x = fc;
      if (gene.fc == Number.POSITIVE_INFINITY) {
        x = maxFC + 1;
      } else if (gene.fc == Number.NEGATIVE_INFINITY) {
        x = minFC - 1;
      }

      obj[0].data.push({ x: x, y: y, index: index });
    });
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
    >
      {"Volcano Plot"}
    </Typography>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} type={"diffExp"} />
    </div>
  );

  return (
    <div>
      <Paper
        className="volcano"
        style={{
          padding: "15px 15px 40px 15px",
          backgroundColor: "transparent",
        }}
        variant="outlined"
        elevation={3}
      >
        {Title}
        {Scatterplot}
      </Paper>
    </div>
  );
};

class DiffExp extends Component {
  state = {};

  getColor(node) {
    return "black";
  }

  run() {
    const { computeDiffExp } = this.props;
    computeDiffExp();
  }

  render() {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Differential Expression
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Click me
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          {Plot(this.props.diffExpSolution, this.getColor)}
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default DiffExp;
