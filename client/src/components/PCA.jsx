import React, { Component } from "react";
import { PCA } from "ml-pca";
import { Typography } from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";

class PCAWrapper extends Component {
  render() {
    const { props } = this;
    const { matrix } = props;

    // compute eigenvectors
    if (matrix.length > 0) {
      const pca = new PCA(matrix, {
        method: "SVD",
        center: true,
        scale: true,
        ignoreZeroVariance: true,
      });
      console.log(pca.getEigenvectors());
    }

    // how to get top 10?

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

export default PCAWrapper;
