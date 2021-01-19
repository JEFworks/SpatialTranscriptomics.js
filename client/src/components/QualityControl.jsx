import React, { Component } from "react";
import {
  Typography,
  Paper,
  Slider,
  Button,
  CircularProgress,
} from "@material-ui/core";
import Histogram from "./Plots/Histogram.jsx";

const primary = "#094067";
const paragraph = "#5f6c7b";
const tertiary = "#90b4ce";
const blue = "#80d8ff";

const Figure = (rowsums, colsums, thresholds, changeThreshold, type) => {
  const sums = !rowsums ? [] : type === "rowsum" ? rowsums : colsums;

  let leftBound = 0;
  let rightBound = 0;
  if (sums && sums.length > 0) {
    leftBound = sums[0].range;
    rightBound = sums[sums.length - 1].range;
  }

  const Title = (
    <Typography
      variant="body1"
      align="center"
      style={{ paddingBottom: "5px", fontWeight: 500, color: primary }}
    >
      {type === "rowsum"
        ? "# of Reads of a Gene"
        : "# of Genes Detected in a Cell"}
    </Typography>
  );

  const HistogramPlot = (
    <div style={{ width: "100%", height: "110%" }}>
      <Histogram
        xLabel={
          type === "rowsum"
            ? "log10(# of reads of a gene + 1)"
            : "log10(# of genes detected in a cell + 1)"
        }
        data={sums}
        min={type === "rowsum" ? thresholds.minRowSum : thresholds.minColSum}
      />
    </div>
  );

  const Toggle = (
    <Slider
      style={{ marginLeft: "20px", width: "90%", color: tertiary }}
      onChange={(_event, value) =>
        changeThreshold(
          type === "rowsum" ? value : null,
          type === "colsum" ? value : null
        )
      }
      defaultValue={type === "rowsum" ? 2.0 : 1.0}
      step={type === "rowsum" ? 0.5 : 0.1}
      min={leftBound}
      max={rightBound}
      valueLabelDisplay="auto"
    />
  );

  return (
    <div
      style={{
        height: "250px",
        width: "100%",
        paddingRight: "20px",
        paddingBottom: "125px",
      }}
    >
      <Paper
        style={{
          padding: "15px 20px 90px 15px",
          width: "370px",
          height: "100%",
          backgroundColor: "transparent",
        }}
        variant="outlined"
        elevation={3}
      >
        {Title}
        {HistogramPlot}
        {Toggle}
      </Paper>
    </div>
  );
};

class QualityControl extends Component {
  state = {
    minRowSum: this.props.thresholds.minRowSum,
    minColSum: this.props.thresholds.minColSum,
    status0: false,
    status1: false,
  };

  changeThreshold = this.changeThreshold.bind(this);
  run = this.run.bind(this);

  changeThreshold(minRowSum, minColSum) {
    if (minRowSum != null) {
      this.setState({ minRowSum, status0: true });
    }
    if (minColSum != null) {
      this.setState({ minColSum, status1: true });
    }
  }

  run() {
    const { handleFilter } = this.props;
    const { minRowSum, minColSum } = this.state;
    if (this.state.status0) {
      handleFilter(minRowSum, null);
    }
    if (this.state.status1) {
      handleFilter(null, minColSum);
    }
    this.setState({ status0: false, status1: false });
  }

  render() {
    const { rowsums, colsums, loading } = this.props;
    const { minRowSum, minColSum } = this.state;
    const thresholds = { minRowSum: minRowSum, minColSum: minColSum };

    return (
      <>
        <div style={{ display: "flex" }}>
          <Typography
            style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
            variant="h5"
          >
            Quality Control (QC)
          </Typography>
          {loading && (
            <CircularProgress
              disableShrink
              size={40}
              thickness={5}
              style={{ color: blue, marginTop: "-5px", marginLeft: "30px" }}
            />
          )}
        </div>
        <Typography
          style={{ marginBottom: "20px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Use the range selectors to set the minimum threshold for each QC
          metric.
          <br></br>
          Cells and genes below these thresholds are removed from the expression
          matrix for downstream analysis. Genes not expressed in any cells were
          automatically removed.
        </Typography>

        <div style={{ width: "100%", display: "flex" }}>
          <div style={{ width: "50%" }}></div>
          <div className="QC-flex">
            {Figure(
              rowsums,
              colsums,
              thresholds,
              this.changeThreshold,
              "rowsum"
            )}
            {Figure(
              rowsums,
              colsums,
              thresholds,
              this.changeThreshold,
              "colsum"
            )}
          </div>
          <div style={{ width: "50%" }}></div>
        </div>

        <Button
          variant="contained"
          size="small"
          color="primary"
          style={{ backgroundColor: primary }}
          onClick={() => this.run()}
        >
          Apply QC Filters
        </Button>
      </>
    );
  }
}

export default QualityControl;
