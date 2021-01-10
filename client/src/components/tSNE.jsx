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

const Plot = (data, getColor, displayAllowed) => {
  const obj = [{ data: [] }];
  if (displayAllowed && data) {
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
      <ScatterPlot data={obj} getColor={getColor} tSNE={true} />
    </div>
  );

  return (
    <div
      style={{
        height: "450px",
        width: "800px",
        paddingLeft: "15px",
        paddingRight: "15px",
        paddingBottom: "50px",
      }}
    >
      <Paper
        style={{
          padding: "15px 15px 15px 15px",
          width: "100%",
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

class tSNEWrapper extends Component {
  state = {
    tsneSettings: {
      epsilon: 10,
      perplexity: 30,
      iterations: 500,
    },
    pcs: [],
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
      tsneSettings.epsilon = newSetting;
    } else if (type === "perplexity") {
      tsneSettings.perplexity = newSetting;
    } else if (type === "iterations") {
      tsneSettings.iterations = newSetting;
    }

    this.setState({ tsneSettings });
  }

  run() {
    const { computeTSNE, pcs } = this.props;
    computeTSNE(this.state.tsneSettings);
    this.setState({ pcs });
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
          Enter description here.
        </Typography>

        <div style={{ display: "flex" }}>
          {TypedInput(changeSettings)}
          {this.props.loading && (
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
          Run tSNE
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="PC-flex">
            {Plot(
              this.props.tsneSolution,
              this.getColor,
              this.state.pcs === this.props.pcs
            )}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default tSNEWrapper;
