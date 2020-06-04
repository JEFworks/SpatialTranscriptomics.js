import React, { Component } from "react";
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

export default class Page404 extends Component {
  render() {
    return (
      <>
        <div className="site-container">
          <h2 style={{ paddingTop: "20px" }}>
            Oops, we can't find the page you're looking for.
          </h2>
          <h5>
            Click <Link to={"/"}>here</Link> to go back to the main page.
          </h5>
        </div>
      </>
    );
  }
}
