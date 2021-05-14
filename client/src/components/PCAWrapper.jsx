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
  const obj = [{ id: "", data: [] }];
  const visible = !isNaN(pcX) && !isNaN(pcY) && pcX > 0 && pcY > 0;
  if (eigenvectors[0] && visible) {
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
      <ScatterPlot
        data={obj}
        getColor={getColor}
        pcX={pcX}
        pcY={pcY}
        visible={visible}
        type={"pca"}
      />
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
  const obj = [{ id: "", data: [] }];
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
      <LineChart
        data={obj}
        max={numPCs}
        totalNumPCs={eigenvalues[0] ? eigenvalues.length : 0}
      />
    </div>
  );

  return (
    <div style={{ marginRight: "20px" }}>
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
        style={{ width: "60px", marginRight: "15px" }}
        helperText="# of PCs"
        defaultValue="10"
        onChange={selectNumPCs}
      />
      <TextField
        style={{ width: "80px", marginRight: "15px" }}
        helperText="PC on x-axis"
        defaultValue="1"
        onChange={set_pcX}
      />
      <TextField
        style={{ width: "80px" }}
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
    return node.index ? this.props.colors[node.index] : "blue";
  }

  // x = pcX, y = pcY, z = numPCs
  alertParams(x, y, z) {
    if (isNaN(x) || isNaN(x) || isNaN(y) || x < 1 || y < 1 || z < 1) {
      alert("Please specify a positive integer value for each parameter.");
      return true;
    }

    if (
      this.props.eigenvalues[0] &&
      (x > this.props.eigenvalues.length || y > this.props.eigenvalues.length)
    ) {
      alert("Please specify PCs that exist.");
      return true;
    }
    return false;
  }

  run() {
    const { computePCA } = this.props;
    const { updatedNumPCs, new_pcX, new_pcY } = this.state;

    if (!this.alertParams(new_pcX, new_pcY, updatedNumPCs)) {
      this.setState({ numPCs: updatedNumPCs, pcX: new_pcX, pcY: new_pcY });
      computePCA(updatedNumPCs);
    }
  }

  applySettings() {
    const { setNumPCs } = this.props;
    const { updatedNumPCs, new_pcX, new_pcY } = this.state;

    if (!this.alertParams(new_pcX, new_pcY, updatedNumPCs)) {
      this.setState({ pcX: new_pcX, pcY: new_pcY });

      if (updatedNumPCs !== this.state.numPCs) {
        this.setState({ numPCs: updatedNumPCs });
        setNumPCs(updatedNumPCs);
      }
    }
  }

  selectNumPCs(event) {
    const num = Number.parseInt(event.target.value);
    this.setState({ updatedNumPCs: num });
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
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Perform PCA to reduce the number of dimensions in the data and reduce
          noise.
          <br></br>
          The scree plot visualizes how much variation each PC captures, and the
          biplot plots two PCs against each other to visualize the data in a 2D
          space.
          <br></br>
          To run PCA, press "Run PCA." To set how many PCs should be used in
          downstream analysis or specify which PCs to plot in the biplot, press
          "Apply Settings."
        </Typography>

        <div style={{ display: "flex" }}>
          {TypedInput(this.selectNumPCs, this.set_pcX, this.set_pcY)}
          {loading && (
            <CircularProgress
              disableShrink
              size={40}
              thickness={5}
              style={{ color: blue, marginTop: "14px", marginLeft: "30px" }}
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
            {Biplot(eigenvectors, this.getColor, pcX, pcY)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default PCAWrapper;
