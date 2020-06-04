import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Homepage from "./components/Homepage";
import Page404 from "./components/404";
import "./App.css";

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={Homepage} />
      <Route component={Page404} />
    </Switch>
  </Router>
);

export default App;
