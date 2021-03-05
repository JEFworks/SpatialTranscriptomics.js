import React, { Component } from "react";
import { Typography } from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";

class GSEAWrapper extends Component {
  render() {
    return (
      <>
        <Typography
          style={{ marginBottom: "10px", fontWeight: 500, color: primary }}
          variant="h5"
        >
          Gene Set Enrichment Analysis (GSEA)
        </Typography>

        <Typography
          style={{ fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          First line of description...
          <br></br>
          Second line of description...
        </Typography>
      </>
    );
  }
}

export default GSEAWrapper;
