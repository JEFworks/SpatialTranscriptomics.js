import React, { Component } from "react";
import { Button } from "@material-ui/core";

class UploadCenter extends Component {
  render() {
    const {
      matrixFileHandler,
      featuresFileHandler,
      barcodesFileHandler,
      pixelsFileHandler,
      uploadFiles,
    } = this.props;

    return (
      <>
        <div style={{ marginTop: "50px", display: "flex" }}>
          <div style={{ marginRight: "20px" }}>
            <input
              accept="*"
              style={{ display: "none" }}
              id="file-button1"
              type="file"
              onChange={matrixFileHandler}
            />
            <label htmlFor="file-button1">
              <Button variant="contained" color="primary" component="span">
                Matrix Upload
              </Button>
            </label>
          </div>
          <div style={{ marginRight: "20px" }}>
            <input
              accept="*"
              style={{ display: "none" }}
              id="file-button2"
              type="file"
              onChange={featuresFileHandler}
            />
            <label htmlFor="file-button2">
              <Button variant="contained" color="primary" component="span">
                Features Upload
              </Button>
            </label>
          </div>
          <div style={{ marginRight: "20px" }}>
            <input
              accept="*"
              style={{ display: "none" }}
              id="file-button3"
              type="file"
              onChange={barcodesFileHandler}
            />
            <label htmlFor="file-button3">
              <Button variant="contained" color="primary" component="span">
                Barcodes Upload
              </Button>
            </label>
          </div>
          <div style={{ marginRight: "20px" }}>
            <input
              accept="*"
              style={{ display: "none" }}
              id="file-button4"
              type="file"
              onChange={pixelsFileHandler}
            />
            <label htmlFor="file-button4">
              <Button variant="contained" color="primary" component="span">
                Pixels Upload
              </Button>
            </label>
          </div>
        </div>

        <div style={{ marginTop: "30px", marginBottom: "50px" }}>
          <Button
            variant="contained"
            color="primary"
            component="span"
            onClick={uploadFiles}
          >
            Upload All
          </Button>
        </div>
      </>
    );
  }
}

export default UploadCenter;
