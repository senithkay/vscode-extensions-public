import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() =>
    createStyles({
        projectSelectorOption: {
            padding: 10,
            cursor: "pointer",
            "&:hover": {
                backgroundColor: "#e6e7ec",
            }
        }
    })
)

export default useStyles;

