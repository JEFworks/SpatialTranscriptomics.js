import { Typography } from "@material-ui/core";

const Title = (props) => {
  return (
    <Typography
      variant="body1"
      align="center"
      color="primary"
      style={{ paddingBottom: "5px", fontWeight: 500 }}
    >
      {props.title}
    </Typography>
  );
};

export default Title;
