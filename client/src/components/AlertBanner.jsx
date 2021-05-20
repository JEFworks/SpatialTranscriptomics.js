import React, { Component } from "react";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

class AlertBanner extends Component {
  render() {
    // produce error message
    const { errors, open, handleClose } = this.props;
    let errorMsg = "";
    if (errors.includes("Network Error")) {
      errorMsg = "Server not responding.\n";
    } else {
      for (let i = 0; i < errors.length; i++) {
        errorMsg += errors[i];
      }
    }

    return (
      <Snackbar open={open}>
        <Alert onClose={handleClose} severity="error">
          {errorMsg}
        </Alert>
      </Snackbar>
    );
  }
}

export default AlertBanner;
