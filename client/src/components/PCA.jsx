import React, { Component } from "react";
import { PCA } from "ml-pca";
import { Typography, Paper } from "@material-ui/core";
import LineChart from "./LineChart.jsx";
import ScatterPlot from "./ScatterPlot.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";

const Biplot = (eigenvectors) => {
  // console.log(eigenvectors);
  const obj = [{ data: [] }];
  if (eigenvectors) {
    eigenvectors.slice(0, 500).forEach((eigenvector, index) => {
      const x = -1 * eigenvector[0];
      const y = -1 * eigenvector[1];
      obj[0].data.push({ x: x, y: y });
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
      <ScatterPlot data={obj} />
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
            width: "500px",
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
          paddingBottom: "50px",
        }}
      >
        <Paper
          style={{
            padding: "15px 20px 40px 15px",
            width: "500px",
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
  render() {
    const { props } = this;
    const { data } = props;
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          PCA
        </Typography>
        <Typography
          style={{ marginBottom: "20px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="PC-flex">
            {ScreePlot(data.eigenvalues)}
            {Biplot(data.eigenvectors)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default PCAWrapper;
