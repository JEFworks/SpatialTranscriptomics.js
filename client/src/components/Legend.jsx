import { Grid } from "@material-ui/core";

const LegendElement = (props) => {
  const { color, name } = props;
  return (
    <div
      style={{
        display: "flex",
        marginTop: "5px",
        marginBottom: "5px",
      }}
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
        {name}
      </div>
    </div>
  );
};

const Legend = (props) => {
  const { colors } = props;
  if (colors.length === 0) return <></>;

  return (
    <div className="legend">
      <Grid container direction="column">
        {colors.map((color, i) => {
          return <LegendElement key={i} color={color} name={i + 1} />;
        })}
      </Grid>
    </div>
  );
};

export default Legend;
