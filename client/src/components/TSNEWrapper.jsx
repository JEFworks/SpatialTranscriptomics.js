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
    // 2D embedding
    data.forEach((point, index) => {
      const x = point[0] * 7 + 450;
      const y = point[1] * 7 + 300;
      obj[0].data.push({ x: x, y: y, index: index });
    });
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
    >
      {"tSNE"}
    </Typography>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} tsne={true} />
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

const TypedInput = (changeSettings) => {
  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "50px", marginRight: "15px" }}
        helperText="Epsilon"
        defaultValue="10"
        onChange={(event) => changeSettings(event, "epsilon")}
      />
      <TextField
        style={{ width: "60px", marginRight: "15px" }}
        helperText="Perplexity"
        defaultValue="30"
        onChange={(event) => changeSettings(event, "perplexity")}
      />
      <TextField
        style={{ width: "60px" }}
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

  getColor = this.getColor.bind(this);
  changeSettings = this.changeSettings.bind(this);

  getColor(node) {
    return node.index ? this.props.colors[node.index] : "blue";
  }

  changeSettings(event, type) {
    const newSetting = Number.parseInt(event.target.value);
    const { tsneSettings } = this.state;

    if (type === "epsilon") {
      tsneSettings.epsilon = isNaN(newSetting) ? 0 : Math.max(0, newSetting);
    } else if (type === "perplexity") {
      tsneSettings.perplexity = isNaN(newSetting) ? 0 : Math.max(0, newSetting);
    } else if (type === "iterations") {
      tsneSettings.iterations = isNaN(newSetting) ? 0 : Math.max(0, newSetting);
    }

    this.setState({ tsneSettings });
  }

  run() {
    const { computeTSNE } = this.props;
    computeTSNE(this.state.tsneSettings);
  }

  render() {
    const { changeSettings } = this;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          t-distributed Stochastic Neighbor Embedding (tSNE)
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
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
          {TypedInput(changeSettings)}
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
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Run tSNE
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="PC-flex">
            {Plot(this.props.tsneSolution, this.getColor)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default TSNEWrapper;
