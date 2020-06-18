import React, { Component } from "react";
import {
  AppBar,
  Button,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

const ElevationScroll = (props) => {
  const { children } = props;
  return React.cloneElement(children, {
    elevation: 4,
  });
};

class Header extends Component {
  render() {
    return (
      <>
        <ElevationScroll>
          <AppBar style={{ backgroundColor: "#242424" }}>
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                <Link underline="none" href="/" color="inherit">
                  SpatialTranscriptomics.js
                </Link>
              </Typography>
              <Button color="inherit">About</Button>
              <IconButton
                edge="end"
                style={{ marginRight: "-10px" }}
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
}

export default Header;
