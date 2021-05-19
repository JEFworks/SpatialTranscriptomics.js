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

const Plot = (data, getColor) => {
  const obj = [{ id: "", data: [] }];

  if (data && data.length > 0) {
    data.forEach((gene) => {
      const { fc, p, name, type } = gene;
      obj[0].data.push({
        x: gene.capped_fc ? gene.capped_fc : fc,
        y: gene.capped_p ? gene.capped_p : p,
        name: name,
        type: type,
      });
    });
  }

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

const TypedInput = (setX, setY) => {
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

  getColor = this.getColor.bind(this);
  setX = this.setX.bind(this);
  setY = this.setY.bind(this);

  getColor(node) {
    if (node) {
      const { type } = node;
      return type === "upregulated"
        ? red
        : type === "downregulated"
        ? blue
        : "black";
    }
    return "black";
  }

  run() {
    const { computeDGE, numClusters } = this.props;
    const { x, y } = this.state;
    if (isNaN(x) || isNaN(y) || (x < 1 && x !== -1) || y < 1) {
      alert("Please specify a positive integer value for each group number.");
      return;
    }
    if (x === y) {
      alert("Please compare different clusters.");
      return;
    }

    if (x > numClusters || y > numClusters) {
      alert("Please specify clusters that exist.");
      return;
    }
    computeDGE(x, y);
  }

  setX(event) {
    const num = Number.parseInt(event.target.value);
    this.setState({ x: num });
  }

  download(data) {
    if (!data[0]) {
      alert("Please run DGE first.");
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
  }

  setY(event) {
    const num = Number.parseInt(event.target.value);
    this.setState({ y: num });
  }

  render() {
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
          {TypedInput(this.setX, this.setY)}
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
          onClick={() => this.run()}
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
          {Plot(dgeSolution, this.getColor)}
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default DGEWrapper;
