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

const Biplot = (eigenvectors, getColor, pcX, pcY) => {
  const obj = [{ data: [] }];
  if (eigenvectors[0] && !isNaN(pcX) && !isNaN(pcY) && pcX > 0 && pcY > 0) {
    eigenvectors.forEach((vector, index) => {
      // plot pc2 against pc1
      const x = vector[Math.min(pcX - 1, eigenvectors[0].length - 1)];
      const y = vector[Math.min(pcY - 1, eigenvectors[0].length - 1)];
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
    <div>
      <Paper
        className="biplot"
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

const ScreePlot = (eigenvalues, numPCs) => {
  const obj = [{ data: [] }];
  if (eigenvalues[0]) {
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
    <div style={{ paddingRight: "20px" }}>
      <Paper
        className="scree-plot"
        style={{
          padding: "15px 15px 40px 15px",
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

const TypedInput = (selectNumPCs, set_pcX, set_pcY) => {
  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "70px", marginRight: "15px" }}
        helperText="# of PCs"
        defaultValue="10"
        onChange={selectNumPCs}
      />
      <TextField
        style={{ width: "90px", marginRight: "15px" }}
        helperText="PC on x-axis"
        defaultValue="1"
        onChange={set_pcX}
      />
      <TextField
        style={{ width: "90px" }}
        helperText="PC on y-axis"
        defaultValue="2"
        onChange={set_pcY}
      />
    </FormGroup>
  );
};

class PCAWrapper extends Component {
  state = {
    numPCs: 10,
    updatedNumPCs: 10,
    pcX: 1,
    pcY: 2,
    new_pcX: 1,
    new_pcY: 2,
  };

  getColor = this.getColor.bind(this);
  selectNumPCs = this.selectNumPCs.bind(this);
  set_pcX = this.set_pcX.bind(this);
  set_pcY = this.set_pcY.bind(this);

  getColor(node) {
    if (node.index) {
      return this.props.colors[node.index];
    }
    return "blue";
  }

  run() {
    const { computePCA } = this.props;
    const { updatedNumPCs, new_pcX, new_pcY } = this.state;
    this.setState({ numPCs: updatedNumPCs, pcX: new_pcX, pcY: new_pcY });
    computePCA(updatedNumPCs);
  }

  applySettings() {
    const { setNumPCs } = this.props;
    const { updatedNumPCs, new_pcX, new_pcY } = this.state;
    this.setState({ pcX: new_pcX, pcY: new_pcY });
    if (updatedNumPCs !== this.state.numPCs) {
      this.setState({ numPCs: updatedNumPCs });
      setNumPCs(updatedNumPCs);
    }
  }

  selectNumPCs(event) {
    const num = Number.parseInt(event.target.value);
    if (!isNaN(num) && num > 0) {
      this.setState({ updatedNumPCs: num });
    }
  }

  set_pcX(event) {
    const num = Number.parseInt(event.target.value);
    this.setState({ new_pcX: num });
  }

  set_pcY(event) {
    const num = Number.parseInt(event.target.value);
    this.setState({ new_pcY: num });
  }

  render() {
    const { selectNumPCs, getColor, set_pcX, set_pcY } = this;
    const { numPCs, pcX, pcY } = this.state;
    const { eigenvectors, eigenvalues, loading } = this.props;

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
          {TypedInput(selectNumPCs, set_pcX, set_pcY)}
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
            {ScreePlot(eigenvalues, numPCs)}
            {Biplot(eigenvectors, getColor, pcX, pcY)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default PCAWrapper;
