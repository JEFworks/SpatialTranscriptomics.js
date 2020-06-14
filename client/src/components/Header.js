import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import GitHubIcon from "@material-ui/icons/GitHub";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  button: {
    marginRight: -10,
  },
  title: {
    flexGrow: 1,
  },
}));

function ElevationScroll(props) {
  const { children } = props;
  return React.cloneElement(children, {
    elevation: true ? 4 : 0,
  });
}

export default function Header() {
  const classes = useStyles();
  return (
    <>
      <ElevationScroll>
        <AppBar style={{ backgroundColor: "#242424" }}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              <Link underline="none" href="/" color="inherit">
                SpatialTranscriptomics.js
              </Link>
            </Typography>
            <Button color="inherit">About</Button>
            <IconButton
              edge="end"
              className={classes.button}
              color="inherit"
              aria-label="menu"
            >
              <Link
                href="https://github.com/JEFworks/SpatialTranscriptomics.js"
                target="_blank"
                rel="noopener"
                color="inherit"
              >
                <GitHubIcon />
              </Link>
            </IconButton>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </>
  );
}
