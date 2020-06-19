import React, { Component } from "react";
import { Typography, Link } from "@material-ui/core";

export default class Page404 extends Component {
  render() {
    return (
      <>
        <div className="site-container">
          <Typography variant="h5" style={{ marginBottom: "10px" }}>
            Oops, we can't find the page you're looking for.
          </Typography>
          <Typography variant="body1">
            Click{" "}
            <Link style={{ color: "#0091ea" }} href="/">
              here
            </Link>{" "}
            to go back to the main page.
          </Typography>
        </div>
      </>
    );
  }
}
