import React, { Component } from "react";
import {
  Typography,
  Paper,
  Button,
  FormGroup,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import LineChart from "./Plots/LineChart.jsx";
import ScatterPlot from "./Plots/ScatterPlot.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";
const blue = "#80d8ff";

const Biplot = (eigenvectors, getColor, displayAllowed) => {
  const obj = [{ data: [] }];
  if (displayAllowed && eigenvectors) {
    eigenvectors.forEach((vector, index) => {
      const x = vector[0];
      const y = vector[1];
      obj[0].data.push({ x: x, y: y, index: index });
    });
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
    >
      {"Biplot"}
    </Typography>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} />
    </div>
  );

  return (
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
  );
};

const ScreePlot = (eigenvalues, numPCs, displayAllowed) => {
  const obj = [{ data: [] }];
  if (displayAllowed && eigenvalues) {
    eigenvalues.slice(0, 20).forEach((eigenvalue, index) => {
      obj[0].data.push({ x: index + 1, y: eigenvalue });
    });
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
    >
      {"Scree Plot"}
    </Typography>
  );

  const Linechart = (
    <div style={{ width: "100%", height: "100%" }}>
      <LineChart data={obj} max={numPCs} />
    </div>
  );

  return (
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
  );
};

const TypedInput = (selectNumPCs) => {
  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "150px", marginRight: "15px" }}
        helperText="Number of PCs"
        defaultValue="10"
        onChange={selectNumPCs}
      />
    </FormGroup>
  );
};

class PCAWrapper extends Component {
  state = {
    numPCs: 10,
    updatedNumPCs: 10,
  };

  getColor = this.getColor.bind(this);
  selectNumPCs = this.selectNumPCs.bind(this);

  getColor(node) {
    if (node.index) {
      return this.props.colors[node.index];
    }
    return "blue";
  }

  run() {
    const { computePCA } = this.props;
    const { updatedNumPCs } = this.state;

    computePCA(updatedNumPCs);
    this.setState({ numPCs: updatedNumPCs });
  }

  applySettings() {
    const { setNumPCs } = this.props;
    const { updatedNumPCs } = this.state;
    setNumPCs(updatedNumPCs);
    this.setState({ numPCs: updatedNumPCs });
  }

  selectNumPCs(event) {
    const num = Number.parseInt(event.target.value);
    if (!isNaN(num)) {
      this.setState({ updatedNumPCs: num === 0 ? 1 : Math.min(num, 20) });
    }
  }

  render() {
    const { selectNumPCs, getColor } = this;
    const { numPCs } = this.state;
    const { eigenvectors, eigenvalues, displayAllowed, loading } = this.props;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Principal Component Analysis (PCA)
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        <div style={{ display: "flex" }}>
          {TypedInput(selectNumPCs)}
          {loading && (
            <CircularProgress
              disableShrink
              size={50}
              thickness={5}
              style={{ color: blue, marginTop: "5px", marginLeft: "40px" }}
            />
          )}
        </div>

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
            {ScreePlot(eigenvalues, numPCs, displayAllowed)}
            {Biplot(eigenvectors, getColor, displayAllowed)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default PCAWrapper;
