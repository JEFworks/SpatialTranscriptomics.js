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
  Fade,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

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
  ];
};

const getStepContent = (
  step,
  matrixFileHandler,
  barcodesFileHandler,
  featuresFileHandler,
  pixelsFileHandler
) => {
  switch (step) {
    case 0:
      return (
        <div style={{ marginBottom: "10px" }}>
          <input
            accept=".mtx"
            id="file-button1"
            type="file"
            onChange={matrixFileHandler}
            style={{ outline: "none" }}
          />
        </div>
      );
    case 1:
      return (
        <div style={{ marginBottom: "10px" }}>
          <input
            accept=".tsv"
            id="file-button1"
            type="file"
            onChange={featuresFileHandler}
            style={{ outline: "none" }}
          />
        </div>
      );
    case 2:
      return (
        <div style={{ marginBottom: "10px" }}>
          <input
            accept=".tsv"
            id="file-button1"
            type="file"
            onChange={barcodesFileHandler}
            style={{ outline: "none" }}
          />
        </div>
      );
    case 3:
      return (
        <div style={{ marginBottom: "10px" }}>
          <input
            accept=".csv"
            id="file-button1"
            type="file"
            onChange={pixelsFileHandler}
            style={{ outline: "none" }}
          />
        </div>
      );
    default:
      return "Unknown step";
  }
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
    if (
      (step === 0 && files.matrix == null) ||
      (step === 1 && files.features == null) ||
      (step === 2 && files.barcodes == null) ||
      (step === 3 && files.pixels == null)
    ) {
      this.alertUser();
      return;
    }

    if (step === 3) {
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

    const { handleNext, handleBack, handleReset } = this;
    const {
      matrixFileHandler,
      barcodesFileHandler,
      featuresFileHandler,
      pixelsFileHandler,
    } = this.props;

    return (
      <div>
        <MuiThemeProvider theme={theme}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel style={{ color: primary }}>{label}</StepLabel>
                <StepContent>
                  <Typography>
                    {getStepContent(
                      index,
                      matrixFileHandler,
                      barcodesFileHandler,
                      featuresFileHandler,
                      pixelsFileHandler
                    )}
                  </Typography>
                  <div>
                    <div>
                      <Button disabled={activeStep === 0} onClick={handleBack}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                      >
                        {activeStep === steps.length - 1 ? "Finish" : "Next"}
                      </Button>
                    </div>
                  </div>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </MuiThemeProvider>

        {activeStep === steps.length && (
          <Paper square elevation={0} style={{ marginBottom: "30px" }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button
              onClick={handleReset}
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
      uploadFiles,
      files,
      error,
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
          <Fade
            style={{
              marginLeft: "20px",
              marginTop: "12px",
              width: "400px",
            }}
            in
            timeout={1500}
          >
            <Alert
              severity={error.length > 0 ? "error" : "none"}
              style={{
                textOverflow: "ellipsis",
                overflowY: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {error}
            </Alert>
          </Fade>
        </div>

        <Typography
          style={{ marginTop: "10px", fontWeight: 400, color: paragraph }}
          variant="body1"
        >
          Enter description here.
        </Typography>

        <VerticalLinearStepper
          files={files}
          matrixFileHandler={matrixFileHandler}
          featuresFileHandler={featuresFileHandler}
          barcodesFileHandler={barcodesFileHandler}
          pixelsFileHandler={pixelsFileHandler}
          uploadFiles={uploadFiles}
        />
      </>
    );
  }
}

export default DataUpload;
