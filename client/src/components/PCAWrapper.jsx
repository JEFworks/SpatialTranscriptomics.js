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

const paragraph = "rgba(0, 0, 0, 0.54)";
const blue = "#80d8ff";

const Biplot = (props) => {
  const { eigenvectors, getColor, pcX, pcY } = props;
  const obj = [{ id: "", data: [] }];
  if (eigenvectors[0]) {
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
      color="primary"
      style={{ paddingBottom: "5px", fontWeight: 500 }}
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

const ScreePlot = (props) => {
  const { eigenvalues, numPCs } = props;
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
      color="primary"
      style={{ paddingBottom: "5px", fontWeight: 500 }}
    >
      {"Scree Plot"}
    </Typography>
  );

  const Linechart = (
    <div style={{ width: "100%", height: "100%" }}>
      <LineChart
        data={obj}
        redLine={numPCs}
        max={eigenvalues[0] ? Math.min(eigenvalues.length, 20) : 0}
        xLabel="component #"
        yLabel="eigenvalue"
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

const TypedInput = (props) => {
  const { selectNumPCs, select_pcX, select_pcY } = props;
  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "60px", marginRight: "15px" }}
        color="secondary"
        helperText="# of PCs"
        defaultValue="10"
        onChange={selectNumPCs}
      />
      <TextField
        style={{ width: "80px", marginRight: "15px" }}
        color="secondary"
        helperText="PC on x-axis"
        defaultValue="1"
        onChange={select_pcX}
      />
      <TextField
        style={{ width: "80px" }}
        color="secondary"
        helperText="PC on y-axis"
        defaultValue="2"
        onChange={select_pcY}
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

  getColor = (node) => {
    return node.index ? this.props.colors[node.index] : "blue";
  };

  /**
   * Function to alert user if parameters are bad
   * @param {*} x the PC to plot on x-axis
   * @param {*} y the PC to plot on y-axis
   * @param {*} z number of PCs to use for downstream analysis
   * @returns true if there are no issues with parameters
   */
  alertParams = (x, y, z) => {
    const { reportError } = this.props;

    if (isNaN(x) || isNaN(x) || isNaN(y) || x < 1 || y < 1 || z < 1) {
      reportError(
        "Please specify a positive integer value for each parameter.\n"
      );
      return true;
    }

    if (
      this.props.eigenvalues[0] &&
      (x > this.props.eigenvalues.length || y > this.props.eigenvalues.length)
    ) {
      reportError("Please plot PCs that exist.\n");
      return true;
    }
    return false;
  };

  run = () => {
    const { computePCA } = this.props;
    const { updatedNumPCs, new_pcX, new_pcY } = this.state;

    if (!this.alertParams(new_pcX, new_pcY, updatedNumPCs)) {
      this.setState({ numPCs: updatedNumPCs, pcX: new_pcX, pcY: new_pcY });
      computePCA(updatedNumPCs);
    }
  };

  applySettings = () => {
    const { setNumPCs } = this.props;
    const { updatedNumPCs, new_pcX, new_pcY } = this.state;

    if (!this.alertParams(new_pcX, new_pcY, updatedNumPCs)) {
      this.setState({ pcX: new_pcX, pcY: new_pcY });

      if (updatedNumPCs !== this.state.numPCs) {
        this.setState({ numPCs: updatedNumPCs });
        setNumPCs(updatedNumPCs);
      }
    }
  };

  selectNumPCs = (event) => {
    const num = Number.parseInt(event.target.value);
    this.setState({ updatedNumPCs: num });
  };

  select_pcX = (event) => {
    const num = Number.parseInt(event.target.value);
    this.setState({ new_pcX: num });
  };

  select_pcY = (event) => {
    const num = Number.parseInt(event.target.value);
    this.setState({ new_pcY: num });
  };

  render = () => {
    const { numPCs, pcX, pcY } = this.state;
    const { eigenvectors, eigenvalues, loading } = this.props;

    return (
      <>
        <Typography
          color="primary"
          style={{ marginBottom: "10px", fontWeight: 500 }}
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
          <TypedInput
            selectNumPCs={this.selectNumPCs}
            select_pcX={this.select_pcX}
            select_pcY={this.select_pcY}
          />
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
          onClick={this.run}
        >
          Run PCA
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ marginLeft: "10px" }}
          onClick={this.applySettings}
        >
          Apply Settings
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="PC-flex">
            <ScreePlot eigenvalues={eigenvalues} numPCs={numPCs} />
            <Biplot
              eigenvectors={eigenvectors}
              getColor={this.getColor}
              pcX={pcX}
              pcY={pcY}
            />
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  };
}

export default PCAWrapper;
