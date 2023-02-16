import { createStyles, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() =>
    createStyles({
        selectorComponent: {
            // margin: "0 10px",
            "& .MuiSelect-root": {
                minWidth: "100px"
            },
            "& .MuiOutlinedInput-input": {
                padding: "5px 30px 5px 5px"
            }
        }
    })
)

export default useStyles;

