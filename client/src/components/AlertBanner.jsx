import React, { Component } from "react";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

class AlertBanner extends Component {
  state = { open: true };

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    // produce error message
    const { errors } = this.props;
    let errorMsg = "";
    if (errors.includes("Server not responding.\n")) {
      errorMsg = "Server not responding.\n";
    } else {
      for (let i = 0; i < errors.length; i++) {
        errorMsg += errors[i];
      }
    }

    return (
      <Snackbar open={errorMsg.length > 0 && this.state.open}>
        <Alert onClose={() => this.handleClose()} severity="error">
          {errorMsg}
        </Alert>
      </Snackbar>
    );
  }
}

export default AlertBanner;
