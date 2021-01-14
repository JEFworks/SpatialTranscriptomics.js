import React from "react";
import { Typography, Link } from "@material-ui/core";
import Header from "./Header.jsx";

const primary = "#094067";
const secondary = "#90b4ce";

const Graphic = <img className="icon-404" src="/icon404.svg" alt="404" />;

const Text = (
  <Typography
    variant="h5"
    style={{
      fontWeight: "400",
      color: primary,
      textAlign: "center",
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: "50px",
      paddingRight: "50px",
    }}
  >
    Click{" "}
    <Link style={{ color: secondary }} href="/">
      here
    </Link>{" "}
    to go back to the main page.
  </Typography>
);

const Page404 = () => (
  <>
    <Header noshow={true} />

    <div className="site-container">
      {Graphic}
      {Text}
    </div>
  </>
);

export default Page404;
