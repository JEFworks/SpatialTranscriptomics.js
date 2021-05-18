import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Homepage from "./components/Homepage.jsx";
import Page404 from "./components/404.jsx";

const primary = "#094067";
const tertiary = "#90b4ce";
const theme = createMuiTheme({
  palette: {
    primary: {
      main: primary,
      contrastText: "#fff", // white
    },
    secondary: {
      main: tertiary,
    },
  },
});

const App = () => (
  <MuiThemeProvider theme={theme}>
    <Router>
      <Switch>
        <Route path="/" exact component={Homepage} />
        <Route component={Page404} />
      </Switch>
    </Router>
  </MuiThemeProvider>
);

export default App;
