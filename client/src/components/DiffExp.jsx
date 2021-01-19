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

class DiffExp extends Component {
  state = {};

  render() {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Differential Expression
        </Typography>
        <Typography
          style={{ marginBottom: "0px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>
      </>
    );
  }
}

export default DiffExp;
