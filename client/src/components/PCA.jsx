import React, { Component } from "react";
import { Typography, Paper, Button } from "@material-ui/core";
import LineChart from "./LineChart.jsx";
import ScatterPlot from "./ScatterPlot.jsx";
import GetRGB from "../functions/GetRGB.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";

const Biplot = (eigenvectors, getColor) => {
  const obj = [{ data: [] }];
  if (eigenvectors) {
    eigenvectors.forEach((eigenvector, index) => {
      const x = eigenvector[0];
      const y = eigenvector[1];
      obj[0].data.push({ x: x, y: y, index: index });
    });
  }

  const Title = (
    <>
      <Typography
        variant="body1"
        align="center"
        style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
      >
        {"PC1 vs PC2"}
      </Typography>
    </>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} />
    </div>
  );

  return (
    <>
      <div
        style={{
          height: "300px",
          width: "100%",
          paddingLeft: "15px",
          paddingRight: "15px",
          paddingBottom: "50px",
        }}
      >
        <Paper
          style={{
            padding: "15px 20px 40px 15px",
            width: "420px",
            height: "100%",
            backgroundColor: "transparent",
          }}
          variant="outlined"
          elevation={3}
        >
          {Title}
          {Scatterplot}
        </Paper>
      </div>
    </>
  );
};

const ScreePlot = (eigenvalues) => {
  const obj = [{ data: [] }];
  if (eigenvalues) {
    eigenvalues.slice(0, 20).forEach((eigenvalue, index) => {
      obj[0].data.push({ x: index + 1, y: eigenvalue });
    });
  }

  const Title = (
    <>
      <Typography
        variant="body1"
        align="center"
        style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
      >
        {"Scree Plot"}
      </Typography>
    </>
  );

  const Linechart = (
    <div style={{ width: "100%", height: "100%" }}>
      <LineChart data={obj} max={10} />
    </div>
  );

  return (
    <>
      <div
        style={{
          height: "300px",
          width: "100%",
          paddingLeft: "15px",
          paddingRight: "15px",
          paddingBottom: "80px",
        }}
      >
        <Paper
          className="scree-plot"
          style={{
            padding: "15px 20px 40px 15px",
            height: "100%",
            backgroundColor: "transparent",
          }}
          variant="outlined"
          elevation={3}
        >
          {Title}
          {Linechart}
        </Paper>
      </div>
    </>
  );
};

class PCAWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [], feature: "nptxr" };
    this.getColor = this.getColor.bind(this);
  }

  getColor(node) {
    const { props } = this;
    const gene = props.matrix[props.features.indexOf(this.state.feature)];
    if (gene && node.index) return GetRGB(gene[node.index]);
    return "black";
  }

  run() {
    const { computePCA } = this.props;
    const data = computePCA();
    this.setState({ data });
  }

  render() {
    const { data } = this.state;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Principal Component Analysis
        </Typography>
        <Typography
          style={{ marginBottom: "15px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Run PCA
        </Button>
        <div style={{ paddingTop: "20px" }}></div>

        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="PC-flex">
            {ScreePlot(data.eigenvalues)}
            {Biplot(data.eigenvectors, this.getColor)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default PCAWrapper;
