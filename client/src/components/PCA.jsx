import React, { Component } from "react";
import { Typography } from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";

class PCA extends Component {
  render() {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          PCA
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

export default PCA;
