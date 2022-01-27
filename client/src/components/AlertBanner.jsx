import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

const AlertBanner = (props) => {
  const { errors, open, handleClose } = props;

  // create error string
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
};

export default AlertBanner;
