import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Homepage from "./components/Homepage.jsx";
import Page404 from "./components/404.jsx";

const App = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={Homepage} />
      <Route component={Page404} />
    </Switch>
  </Router>
);

export default App;
