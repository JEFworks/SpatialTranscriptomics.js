import React, { Component } from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

const background = "#fffffe";
const headline = "#094067";
const weight = "500";

class Header extends Component {
  render() {
    return (
      <>
        <AppBar
          style={{
            backgroundColor: background,
            boxShadow: "0 2px 20px rgba(10,10,10,.1)",
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              style={{
                flexGrow: 1,
                fontWeight: weight,
              }}
            >
              <Link style={{ color: headline }} underline="none" href="/">
                SpatialTranscriptomics.js
              </Link>
            </Typography>
            <Typography
              style={{
                fontSize: "1.1em",
                fontWeight: weight,
              }}
            >
              <Link style={{ color: headline }} underline="none" href="/about">
                about
              </Link>
            </Typography>
            <IconButton
              disableRipple
              edge="end"
              style={{
                marginLeft: "5px",
                marginRight: "-10px",
                marginBottom: "-4px",
                color: headline,
                backgroundColor: "transparent",
              }}
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
