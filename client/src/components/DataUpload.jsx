import React, { Component } from "react";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import {
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
} from "@material-ui/core";

const primary = "#094067";
const paragraph = "#5f6c7b";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: primary,
    },
  },
});

const getSteps = () => {
  return [
    "Select matrix file",
    "Select features file",
    "Select barcodes file",
    "Select tissue spatial positions file",
    "Select tissue image file",
  ];
};

const getStepDescription = (step) => {
  switch (step) {
    case 0:
      return (
        <>
          Your matrix file should be in Matrix Market coordinate format. Please
          submit a gzipped (.mtx.gz) file.
        </>
      );
    case 1:
      return (
        <>
          Your features file should be a TSV file, with features corresponding
          to row indices in your matrix.
          <br></br>
          Each feature's gene name should be stored in the second column. Please
          submit a gzipped (.tsv.gz) file.
        </>
      );
    case 2:
      return (
        <>
          Your barcodes file should be a TSV file, with barcodes corresponding
          to column indices in your matrix.
          <br></br>
          Each barcode's sequence should be stored in the last column. Please
          submit a gzipped (.tsv.gz) file.
        </>
      );
    case 3:
      return (
        <>
          Your tissue positions file should be a CSV file, containing a table
          with rows that corresponding to spots.
          <br></br>
          Barcode sequence should be stored in the first column, column pixel
          coordinate in the second-to-last column, and row pixel coordinate in
          the last column.
          <br></br>
          Please submit a gzipped (.csv.gz) file.
        </>
      );
    case 4:
      return (
        <>Please submit an unzipped tissue image file (.png, .jpg, or .jpeg).</>
      );
    default:
      return <>Unknown step</>;
  }
};

const getStepContent = (
  step,
  matrixFileHandler,
  featuresFileHandler,
  barcodesFileHandler,
  pixelsFileHandler,
  imageFileHandler
) => {
  return (
    <div style={{ marginBottom: "15px" }}>
      <Typography
        style={{ fontWeight: 400, color: "black", marginBottom: "10px" }}
        variant="body2"
      >
        {getStepDescription(step)}
      </Typography>
      <input
        accept={step === 4 ? ".png, .jpg, .jpeg" : ".gz"}
        id="file-button1"
        type="file"
        onChange={
          step === 0
            ? matrixFileHandler
            : step === 1
            ? featuresFileHandler
            : step === 2
            ? barcodesFileHandler
            : step === 3
            ? pixelsFileHandler
            : imageFileHandler
        }
        style={{ outline: "none" }}
      />
    </div>
  );
};

class VerticalLinearStepper extends Component {
  state = {
    activeStep: 0,
  };

  setActiveStep = this.setActiveStep.bind(this);
  handleNext = this.handleNext.bind(this);
  handleBack = this.handleBack.bind(this);
  handleReset = this.handleReset.bind(this);

  setActiveStep(activeStep) {
    this.setState({ activeStep });
  }

  alertUser() {
    alert("Please select file first.");
  }

  handleNext() {
    const step = this.state.activeStep;
    const { files, uploadFiles } = this.props;
    if (step === 0 && files.matrix == null) {
      this.alertUser();
      return;
    }

    if (step === 4) {
      uploadFiles();
    }
    this.setActiveStep(step + 1);
  }

  handleBack() {
    this.setActiveStep(this.state.activeStep - 1);
  }

  handleReset() {
    this.setActiveStep(0);
  }

  render() {
    const steps = getSteps();
    const { activeStep } = this.state;

    const {
      matrixFileHandler,
      barcodesFileHandler,
      featuresFileHandler,
      pixelsFileHandler,
      imageFileHandler,
    } = this.props;

    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel style={{ color: primary }}>{label}</StepLabel>
                <StepContent>
                  {getStepContent(
                    index,
                    matrixFileHandler,
                    featuresFileHandler,
                    barcodesFileHandler,
                    pixelsFileHandler,
                    imageFileHandler
                  )}
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={this.handleBack}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.handleNext}
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </MuiThemeProvider>

        {activeStep === steps.length && (
          <Paper square elevation={0} style={{ marginBottom: "30px" }}>
            <Typography>
              All steps completed - wait for data to load and for quality
              control statistics to appear
            </Typography>
            <Button
              onClick={this.handleReset}
              style={{
                backgroundColor: primary,
                marginTop: "10px",
                color: "white",
              }}
            >
              Reset
            </Button>
          </Paper>
        )}
      </div>
    );
  }
}

class DataUpload extends Component {
  render() {
    const {
      matrixFileHandler,
      featuresFileHandler,
      barcodesFileHandler,
      pixelsFileHandler,
      imageFileHandler,
      uploadFiles,
      files,
    } = this.props;

    return (
      <>
        <div style={{ display: "flex" }}>
          <Typography
            style={{
              marginTop: "20px",
              marginBottom: "10px",
              fontWeight: 500,
              color: primary,
              minWidth: "140px",
            }}
            variant="h5"
          >
            Data Upload
          </Typography>
        </div>

        <Typography
          style={{ fontWeight: 400, color: paragraph, marginBottom: "-5px" }}
          variant="body1"
        >
          By default, a dataset of 20 genes x 2698 cells from a coronal brain
          tissue is loaded.
          <br></br>
          To work with your own dataset, upload the appropriate files below. The
          only required file is the matrix file.
        </Typography>

        <VerticalLinearStepper
          files={files}
          matrixFileHandler={matrixFileHandler}
          featuresFileHandler={featuresFileHandler}
          barcodesFileHandler={barcodesFileHandler}
          pixelsFileHandler={pixelsFileHandler}
          imageFileHandler={imageFileHandler}
          uploadFiles={uploadFiles}
        />
      </>
    );
  }
}

export default DataUpload;
