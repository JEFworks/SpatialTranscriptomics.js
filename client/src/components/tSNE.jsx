import React, { Component } from "react";
import { Typography, Button } from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";

class TSNEWrapper extends Component {
  run() {}

  render() {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          tSNE
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
      </>
    );
  }
}

export default TSNEWrapper;
