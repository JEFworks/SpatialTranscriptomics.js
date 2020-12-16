import React, { Component } from "react";
import { Typography, Button, Paper } from "@material-ui/core";
import ScatterPlot from "./plots/ScatterPlot.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";

const Plot = (data, getColor, displayAllowed) => {
  const obj = [{ data: [] }];
  if (displayAllowed && data) {
    data.forEach((point, index) => {
      const x = point[0];
      const y = point[1];
      obj[0].data.push({ x: x, y: y, index: index });
    });
  }

  const Title = (
    <>
      <Typography
        variant="body1"
        align="center"
        style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
      >
        {"tSNE"}
      </Typography>
    </>
  );

  const Scatterplot = (
    <div style={{ width: "100%", height: "100%" }}>
      <ScatterPlot data={obj} getColor={getColor} tSNE={true} />
    </div>
  );

  return (
    <>
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
    </>
  );
};

class tSNEWrapper extends Component {
  state = {
    data: [],
  };

  getColor = this.getColor.bind(this);

  getColor(node) {
    if (node.index) return this.props.colors[node.index];
    return "blue";
  }

  run() {
    const { computeTSNE } = this.props;
    const data = computeTSNE();
    this.setState({ data });
  }

  render() {
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
            {Plot(this.state.data, this.getColor, this.props.displayAllowed)}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>
      </>
    );
  }
}

export default tSNEWrapper;