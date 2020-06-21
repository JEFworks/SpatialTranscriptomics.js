import React, { Component } from "react";
import { Typography, Link } from "@material-ui/core";

const darkgrey = "#37474f";

class Page404 extends Component {
  render() {
    return (
      <>
        <div className="site-container">
          <Typography
            variant="h5"
            style={{ marginBottom: "10px", fontWeight: "400" }}
          >
            Oops, we can't find the page you're looking for.
          </Typography>
          <Typography
            variant="body1"
            style={{ fontWeight: "300", color: darkgrey }}
          >
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

export default Page404;
