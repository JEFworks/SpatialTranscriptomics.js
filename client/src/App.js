import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import Page404 from "./components/404";

const App = () => (
  <>
    <div style={{ marginBottom: "60px" }}>
      <Header />
    </div>
    <Router>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route component={Page404} />
      </Switch>
    </Router>
  </>
);

export default App;
