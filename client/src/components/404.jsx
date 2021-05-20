import React from "react";
import { Typography, Link } from "@material-ui/core";
import Header from "./Header.jsx";

const Graphic = <img className="icon-404" src="/icon404.svg" alt="404" />;

const Text = (
  <Typography
    variant="h5"
    color="primary"
    style={{
      fontWeight: "400",
      textAlign: "center",
      marginLeft: "auto",
      marginRight: "auto",
      paddingLeft: "50px",
      paddingRight: "50px",
    }}
  >
    Click{" "}
    <Link color="secondary" href="/">
      here
    </Link>{" "}
    to go back to the main page.
  </Typography>
);

const Page404 = () => (
  <>
    <Header hideInput={true} />
    <div className="site-container">
      {Graphic}
      {Text}
    </div>
  </>
);

export default Page404;
