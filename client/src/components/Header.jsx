import React from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

const background = "#fffffe";
const primary = "#094067";

const Title = (
  <>
    <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 500 }}>
      <Link style={{ color: primary }} underline="none" href="/">
        SpatialTranscriptomics.js
      </Link>
    </Typography>
  </>
);

const About = (
  <>
    <Typography style={{ fontSize: "1.1em", fontWeight: 500 }}>
      <Link style={{ color: primary }} underline="none" href="/about">
        about
      </Link>
    </Typography>
  </>
);

const Github = (
  <>
    <IconButton
      disableRipple
      edge="end"
      style={{
        marginLeft: "5px",
        marginRight: "-10px",
        marginBottom: "-4px",
        color: primary,
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
  </>
);

const Header = () => (
  <>
    <AppBar
      style={{
        backgroundColor: background,
        boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 12px",
      }}
    >
      <Toolbar>
        {Title}
        {About}
        {Github}
      </Toolbar>
    </AppBar>
  </>
);

export default Header;
