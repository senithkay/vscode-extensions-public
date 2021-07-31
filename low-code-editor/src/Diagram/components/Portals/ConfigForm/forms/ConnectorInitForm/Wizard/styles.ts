
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: "auto",
            display: 'flex',
            flexDirection: 'column',
        },
        stepper: {
            marginTop: '5rem',
        },
        genStepperWrapper: {
            position: 'absolute',
            background: '#fff',
            zIndex: 900,
            marginTop: '-1rem',
            padding: '2rem 0',
        },
        genStepWrapper: {
            height: 6,
            width: 103,
            zIndex: 1,
            fontSize: 0,
            backgroundColor: '#cbcedb',
            overflow: 'hidden',
        },
        genStepContainer: {},
        genStepLabel: {},
        genCompletedStep: {
            zIndex: 1,
            height: 6,
            width: 103,
            fontSize: 0,
            backgroundColor: '#5567d5',
            overflow: 'hidden',
        },
        genCurrentStep: {
            height: 6,
            width: 103,
        },
        genStepActive: {
            backgroundColor: '#5567d5',
        },
    })
);
