import React, { Component } from "react";
import { Typography, Link } from "@material-ui/core";
import icon404 from "../icon404.svg";

const headline = "#094067";
const paragraph = "#5f6c7b";
const blue = "#90b4ce";

class Page404 extends Component {
  render() {
    return (
      <>
        <div className="site-container">
          {/* <Typography
            variant="h5"
            style={{ marginBottom: "10px", fontWeight: "500", color: headline }}
          >
            Oops, we can't find the page you're looking for.
          </Typography>
          <Typography
            variant="body1"
            style={{ fontWeight: "400", color: paragraph }}
          >
            Click{" "}
            <Link style={{ color: blue }} href="/">
              here
            </Link>{" "}
            to go back to the main page.
          </Typography> */}
          <img
            style={{
              display: "block",
              marginTop: "-15px",
              marginLeft: "auto",
              marginRight: "auto",
              width: "60%",
              minWidth: "350px",
            }}
            src={icon404}
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
            <Link style={{ color: blue }} href="/">
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
