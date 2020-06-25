import React, { Component } from "react";
import { Typography, Link } from "@material-ui/core";

const headline = "#094067";
const highlight = "#90b4ce";

class Page404 extends Component {
  render() {
    return (
      <>
        <div className="site-container">
          <img
            style={{
              display: "block",
              marginTop: "-15px",
              marginLeft: "auto",
              marginRight: "auto",
              width: "60%",
              minWidth: "350px",
            }}
            src="/images/icon404.svg"
            alt="404"
          />
          <Typography
            variant="h5"
            style={{
              fontWeight: "400",
              color: headline,
              textAlign: "center",
              marginLeft: "auto",
              marginRight: "auto",
              paddingLeft: "50px",
              paddingRight: "50px",
            }}
          >
            Click{" "}
            <Link style={{ color: highlight }} href="/">
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
