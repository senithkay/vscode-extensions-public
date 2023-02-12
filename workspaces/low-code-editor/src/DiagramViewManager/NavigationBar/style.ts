import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() =>
    createStyles({
        componentSeperator: {
            margin: "0 10px 0 15px",
            fontSize: 20
        },
        selectorComponent: {
            // margin: "0 10px",
            "& .MuiSelect-root": {
                minWidth: "100px"
            },
            "& .MuiOutlinedInput-input": {
                padding: "5px 5px"
            }
        }
    })
)

export default useStyles;

