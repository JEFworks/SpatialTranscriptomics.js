import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import GitHubIcon from "@material-ui/icons/GitHub";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
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
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              SpatialTranscriptomics.js
            </Typography>
            <Button color="inherit">About</Button>
            <Button color="inherit">
              <GitHubIcon />
            </Button>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
    </>
  );
}
