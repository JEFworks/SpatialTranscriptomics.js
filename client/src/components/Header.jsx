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

class Header extends Component {
  render() {
    return (
      <>
        <AppBar
          style={{
            backgroundColor: "#242424",
            boxShadow: "0 8px 16px rgba(10,10,10,.1)",
          }}
        >
          <Toolbar>
            <Typography
              style={{ flexGrow: 1, fontWeight: "400", fontSize: "1.4em" }}
            >
              <Link underline="none" href="/" color="inherit">
                SpatialTranscriptomics.js
              </Link>
            </Typography>
            <Button
              color="inherit"
              style={{
                fontWeight: "400",
                fontSize: "1em",
                marginBottom: "-2px",
              }}
            >
              About
            </Button>
            <IconButton
              edge="end"
              style={{ marginRight: "-10px", marginBottom: "-4px" }}
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
      </>
    );
  }
}

export default Header;
