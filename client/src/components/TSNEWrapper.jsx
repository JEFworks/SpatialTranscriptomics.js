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

const paragraph = "rgba(0, 0, 0, 0.54)";
const blue = "#80d8ff";

const Plot = (props) => {
  const { data, getColor } = props;
  const obj = [{ id: "", data: data }];

  const Title = (
    <Typography
      variant="body1"
      align="center"
      color="primary"
      style={{ paddingBottom: "5px", fontWeight: 500 }}
    >
      {"tSNE"}
    </Typography>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} type={"tsne"} />
    </div>
  );

  return (
    <div>
      <Paper
        className="tsne-plot"
        style={{
          padding: "15px 15px 15px 15px",
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

const TypedInput = (props) => {
  const { changeSettings } = props;
  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "50px", marginRight: "15px" }}
        color="secondary"
        helperText="Epsilon"
        defaultValue="10"
        onChange={(event) => changeSettings(event, "epsilon")}
      />
      <TextField
        style={{ width: "60px", marginRight: "15px" }}
        color="secondary"
        helperText="Perplexity"
        defaultValue="30"
        onChange={(event) => changeSettings(event, "perplexity")}
      />
      <TextField
        style={{ width: "60px" }}
        color="secondary"
        helperText="Iterations"
        defaultValue="500"
        onChange={(event) => changeSettings(event, "iterations")}
      />
    </FormGroup>
  );
};

class TSNEWrapper extends Component {
  state = {
    tsneSettings: {
      epsilon: 10,
      perplexity: 30,
      iterations: 500,
    },
  };

  getColor = (node) => {
    return node.index ? this.props.colors[node.index] : "blue";
  };

  changeSettings = (event, type) => {
    const newSetting = Number.parseInt(event.target.value);
    const { tsneSettings } = this.state;

    if (type === "epsilon") {
      tsneSettings.epsilon = newSetting;
    } else if (type === "perplexity") {
      tsneSettings.perplexity = newSetting;
    } else if (type === "iterations") {
      tsneSettings.iterations = newSetting;
    }

    this.setState({ tsneSettings });
  };

  run = () => {
    const { computeTSNE, reportError } = this.props;
    const { tsneSettings } = this.state;

    const { epsilon, perplexity, iterations } = tsneSettings;
    if (
      isNaN(epsilon) ||
      isNaN(perplexity) ||
      isNaN(iterations) ||
      epsilon < 1 ||
      perplexity < 1 ||
      iterations < 1
    ) {
      reportError(
        "Please specify positive integer values for epsilon, perplexity, and iterations.\n"
      );
      return;
    }

    computeTSNE(tsneSettings);
  };

  render() {
    const { tsneSolution } = this.props;

    return (
      <>
        <Typography
          color="primary"
          style={{ marginBottom: "10px", fontWeight: 500 }}
          variant="h5"
        >
          t-distributed Stochastic Neighbor Embedding (tSNE)
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Produce a tSNE map to map the principal components onto a 2D space,
          while preserving local distances between cells.
          <br></br>
          Epsilon is the learning rate, perplexity is the # of neighboring cells
          each cell influences, and iterations is the # of steps tSNE should
          undergo.
        </Typography>

        <div style={{ display: "flex" }}>
          <TypedInput changeSettings={this.changeSettings} />
          {this.props.loading && (
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
          Run tSNE
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <Plot data={tsneSolution} getColor={this.getColor} />
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default TSNEWrapper;
