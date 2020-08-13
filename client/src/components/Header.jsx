import React, { Component } from "react";
import {
  AppBar,
  IconButton,
  Link,
  Toolbar,
  Typography,
  Button,
  FormGroup,
  TextField,
} from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";

const background = "#fffffe";
const primary = "#094067";

const Title = (updateColors, selectGene, feature) => (
  <>
    <Typography variant="h6" style={{ flexGrow: 1, fontWeight: 500 }}>
      <Link style={{ color: primary }} underline="none" href="/">
        ST.js
      </Link>
      <FormGroup row>
        <TextField
          style={{ width: "150px", marginRight: "15px" }}
          helperText="Gene name"
          defaultValue="Camk2n1"
          onChange={selectGene}
        />
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => updateColors(feature)}
        >
          Update Colors
        </Button>
      </FormGroup>
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

class Header extends Component {
  state = {
    feature: "camk2n1",
  };

  selectGene = this.selectGene.bind(this);

  selectGene(event) {
    this.setState({ feature: event.target.value.trim().toLowerCase() });
  }

  render() {
    return (
      <>
        <AppBar
          style={{
            backgroundColor: background,
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 12px",
          }}
        >
          <Toolbar>
            {Title(
              this.props.updateColors,
              this.selectGene,
              this.state.feature
            )}
            {About}
            {Github}
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

export default Header;
