import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paramRoot: {
            display: 'flex',
            borderRadius: 5,
            border: '1px solid #dee0e7',
            padding: 5
        },
        paramContent: {
            display: 'flex',
            flexDirection: "column"
        },
        paramTypeWrapper: {
            display: 'block',
            width: "40%"
        },
        paramItemWrapper: {
            marginLeft: 5
        }
    }),
);

