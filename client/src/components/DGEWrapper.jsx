import React, { Component } from "react";
import {
  Typography,
  Button,
  Paper,
  TextField,
  FormGroup,
  CircularProgress,
} from "@material-ui/core";
import Title from "./Plots/PlotTitle.jsx";
import ScatterPlot from "./Plots/ScatterPlot.jsx";
import generateCSV from "../functions/generateCSV.jsx";

const paragraph = "rgba(0, 0, 0, 0.54)";
const blue = "#80d8ff";
const red = "#ff80ab";

const Plot = (props) => {
  const { data, getColor } = props;
  const obj = [{ id: "", data: data && data.length > 0 ? data : [] }];

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} type={"dge"} />
    </div>
  );

  return (
    <div>
      <Paper className="volcano" variant="outlined" elevation={3}>
        <Title title="Volcano Plot" />
        {Scatterplot}
      </Paper>
    </div>
  );
};

const TypedInput = (props) => {
  const { setX, setY } = props;
  return (
    <FormGroup row style={{ marginTop: "7px" }}>
      <TextField
        style={{ width: "100px", marginRight: "15px" }}
        color="secondary"
        helperText="Reference Cluster #"
        defaultValue="-1"
        onChange={setX}
      />
      <TextField
        style={{ width: "100px", marginRight: "15px" }}
        color="secondary"
        helperText="Non-Reference Cluster #"
        defaultValue="1"
        onChange={setY}
      />
    </FormGroup>
  );
};

class DGEWrapper extends Component {
  state = {
    x: -1,
    y: 1,
  };

  getColor = (node) => {
    if (node) {
      const { type } = node;
      return type === "upregulated"
        ? red
        : type === "downregulated"
        ? blue
        : "black";
    }
    return "black";
  };

  run = () => {
    const { computeDGE, numClusters, reportError } = this.props;
    const { x, y } = this.state;
    if (isNaN(x) || isNaN(y) || (x < 1 && x !== -1) || y < 1) {
      reportError(
        "Please specify a positive integer value for each cluster number.\n"
      );
      return;
    }
    if (x === y) {
      reportError("Please compare different clusters.\n");
      return;
    }

    if (x > numClusters || y > numClusters) {
      reportError("Please specify clusters that exist.\n");
      return;
    }
    computeDGE(x, y);
  };

  // set reference cluster #
  setX = (event) => {
    const num = Number.parseInt(event.target.value);
    this.setState({ x: num });
  };

  // function to allow user to download DGE results
  download = (data) => {
    if (!data[0]) {
      this.props.reportError("Please run DGE first.\n");
      return;
    }

    const table = [["feature", "-log10(p-value)", "log2(fold-change)"]];
    data.forEach((gene) => {
      table.push([gene.name, gene.p, gene.fc]);
    });

    generateCSV(table, "dge_results.csv");
  };

  // set non-reference cluster #
  setY = (event) => {
    const num = Number.parseInt(event.target.value);
    this.setState({ y: num });
  };

  render = () => {
    const { dgeSolution } = this.props;

    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500 }}
          color="primary"
          variant="h5"
        >
          Differential Gene Expression (DGE) Analysis
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          This analysis identifies genes that are significantlly expressed at
          different levels between two conditions (e.g. cluster 1 vs cluster 2).
          To compare a cluster against all other clusters, set reference cluster
          # as -1.
        </Typography>

        <div style={{ display: "flex" }}>
          <TypedInput setX={this.setX} setY={this.setY} />
          {this.props.loading && (
            <CircularProgress
              disableShrink
              size={40}
              thickness={5}
              style={{ color: blue, marginTop: "15px", marginLeft: "30px" }}
            />
          )}
        </div>

        <div style={{ paddingTop: "15px" }}></div>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ marginRight: "10px" }}
          onClick={this.run}
        >
          Run DGE
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => this.download(dgeSolution)}
        >
          Download Results
        </Button>

        <div style={{ paddingTop: "20px" }}></div>
        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <Plot data={dgeSolution} getColor={this.getColor} />
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  };
}

export default DGEWrapper;
