import React, { Component } from "react";
import {
  Typography,
  Paper,
  Button,
  FormGroup,
  TextField,
} from "@material-ui/core";
import LineChart from "./LineChart.jsx";
import ScatterPlot from "./ScatterPlot.jsx";
import GetRGB from "../functions/GetRGB.jsx";
import MinMaxNormalize from "../functions/MinMaxNormalize.jsx";
import MinMaxStats from "../functions/MinMaxStats.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";

const Biplot = (eigenvectors, getColor) => {
  const obj = [{ data: [] }];
  if (eigenvectors) {
    const pc1 = eigenvectors[0];
    const pc2 = eigenvectors[1];
    if (pc1 && pc2) {
      pc1.forEach((cell, index) => {
        const x = cell;
        const y = pc2[index];
        obj[0].data.push({ x: x, y: y, index: index });
      });
    }
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

const ScreePlot = (eigenvalues, numPCs) => {
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
      <LineChart data={obj} max={numPCs} />
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

const TypedInput = (selectGene, selectNumPCs) => {
  return (
    <>
      <FormGroup row style={{ marginTop: "7px" }}>
        <TextField
          style={{ width: "150px", marginRight: "15px" }}
          helperText="Number of PCs"
          defaultValue="10"
          onChange={selectNumPCs}
        />
        <TextField
          style={{ width: "150px", marginRight: "15px" }}
          helperText="Feature name"
          defaultValue="Agt"
          onChange={selectGene}
        />
      </FormGroup>
    </>
  );
};

class PCAWrapper extends Component {
  state = {
    data: [],
    colors: [],
    feature: "agt",
    numPCs: 10,
    updatedNumPCs: 10,
  };

  getColor = this.getColor.bind(this);
  selectGene = this.selectGene.bind(this);
  selectNumPCs = this.selectNumPCs.bind(this);

  getColor(node) {
    if (node.index) return this.state.colors[node.index];
    return "blue";
  }

  getColors() {
    const { matrix, features } = this.props;
    const colors = [];
    const gene = matrix[features.indexOf(this.state.feature)];
    if (gene) {
      const { max, min } = MinMaxStats(gene);
      gene.forEach((cell) => {
        colors.push(GetRGB(MinMaxNormalize(cell, min, max)));
      });
    }
    return colors;
  }

  run() {
    const { computePCA } = this.props;
    const data = computePCA();

    const colors = this.getColors();
    this.setState({ data, colors });
  }

  applySettings() {
    const colors = this.getColors();
    this.setState({ colors, numPCs: this.state.updatedNumPCs });
  }

  selectNumPCs(event) {
    const num = Number.parseInt(event.target.value);
    if (!isNaN(num))
      this.setState({ updatedNumPCs: num === 0 ? 1 : Math.min(num, 20) });
  }

  selectGene(event) {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  }

  render() {
    const { selectGene, selectNumPCs } = this;
    const { data, numPCs } = this.state;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Principal Component Analysis
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        {TypedInput(selectGene, selectNumPCs)}

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Run PCA
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary, marginLeft: "10px" }}
          onClick={() => this.applySettings()}
        >
          Apply Settings
        </Button>
        <div style={{ paddingTop: "20px" }}></div>

        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="PC-flex">
            {ScreePlot(data.eigenvalues, numPCs)}
            {Biplot(data.eigenvectors, this.getColor)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default PCAWrapper;
