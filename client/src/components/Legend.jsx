import React, { Component } from "react";
import { Grid } from "@material-ui/core";

class Legend extends Component {
  render() {
    const { colors } = this.props;
    if (colors.length === 0) return <></>;

    return (
      <div className="legend">
        <Grid container direction="column">
          {colors.map((color, i) => {
            return (
              <div
                style={{
                  display: "flex",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
                key={i}
              >
                <div
                  style={{
                    backgroundColor: color,
                    width: "15px",
                    height: "15px",
                  }}
                ></div>
                <div
                  style={{
                    marginTop: "-1px",
                    width: "40px",
                    textAlign: "center",
                  }}
                >
                  {i + 1}
                </div>
              </div>
            );
          })}
        </Grid>
      </div>
    );
  }
}

export default Legend;
