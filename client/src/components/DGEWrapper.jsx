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
const red = "#ff80ab";

const Plot = (props) => {
  const { data, getColor } = props;
  const obj = [{ id: "", data: data && data.length > 0 ? data : [] }];

  const Title = (
    <Typography
      variant="body1"
      align="center"
      color="primary"
      style={{ paddingBottom: "5px", fontWeight: 500 }}
    >
      {"Volcano Plot"}
    </Typography>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} type={"dge"} />
    </div>
  );

  return (
    <div>
      <Paper
        className="volcano"
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

const TypedInput = (props) => {
  const { setX, setY } = props;
  return (
    <FormGroup row style={{ marginTop: "7px" }} className="dgeFlex">
      <TextField
        style={{ width: "100px", marginRight: "15px" }}
        color="secondary"
        helperText="Reference Cluster #"
        defaultValue="-1"
        onChange={(event) => setX(event)}
      />
      <TextField
        style={{ width: "100px", marginRight: "15px" }}
        color="secondary"
        helperText="Non-Reference Cluster #"
        defaultValue="1"
        onChange={(event) => setY(event)}
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

  setX = (event) => {
    const num = Number.parseInt(event.target.value);
    this.setState({ x: num });
  };

  download = (data) => {
    if (!data[0]) {
      this.props.reportError("Please run DGE first.\n");
      return;
    }

    const results = ["feature,-log10(p-value),log2(fold-change)"];
    data.forEach((gene) => {
      results.push(`${gene.name},${gene.p},${gene.fc}`);
    });
    const CSV = results.join("\n");

    const element = document.createElement("a");
    const file = new Blob([CSV], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = "dge_results.csv";
    document.body.appendChild(element);
    element.click();
  };

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
          First line of description...
          <br></br>
          Second line of description... (-1 for comparison against all other
          clusters)
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
