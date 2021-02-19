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
const red = "#ff80ab";

const Plot = (data, getColor) => {
  const obj = [{ id: "", data: [] }];

  if (data && data.length > 0) {
    data.forEach((gene) => {
      const { fc, p, name } = gene;
      obj[0].data.push({ x: fc, y: p, name: name });
    });
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
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
        helperText="Reference Cluster #"
        defaultValue="1"
        onChange={(event) => setX(event)}
      />
      <TextField
        style={{ width: "100px", marginRight: "15px" }}
        helperText="Non-Reference Cluster #"
        defaultValue="2"
        onChange={(event) => setY(event)}
      />
    </FormGroup>
  );
};

class DGEWrapper extends Component {
  state = {
    x: 1,
    y: 2,
  };

  getColor = this.getColor.bind(this);
  setX = this.setX.bind(this);
  setY = this.setY.bind(this);

  getColor(node) {
    if (node) {
      const { x, y } = node;
      if (x >= 1 && y >= 1.5) {
        return red;
      } else if (x <= -1 && y >= 1.5) {
        return blue;
      }
    }
    return "black";
  }

  run() {
    const { computeDGE } = this.props;
    const { x, y } = this.state;
    if (isNaN(x) || isNaN(y) || x < 1 || y < 1) {
      alert("Please specify a positive integer value for each group number.");
      return;
    }
    computeDGE(x, y);
  }

  setX(event) {
    const num = Number.parseInt(event.target.value);
    this.setState({ x: num });
  }

  download(data) {
    const results = ["feature,log2(p-value),log2(fold-change)"];
    data.forEach((gene) => {
      results.push(`${gene.name},${gene.p},${gene.fc}`);
    });
    const CSV = results.join("\n");

    const element = document.createElement("a");
    const file = new Blob([CSV], { type: "text/csv" });
    element.href = URL.createObjectURL(file);
    element.download = "dgeResults.csv";
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
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
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
          Second line of description...
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
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Run DGE
        </Button>
        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary, marginLeft: "10px" }}
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
