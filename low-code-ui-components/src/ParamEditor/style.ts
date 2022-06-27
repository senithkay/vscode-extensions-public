import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paramContainer: {
            display: 'flex',
            flexDirection: `column`,
            borderRadius: 5,
            border: '1px solid #dee0e7',
            padding: 5
        },
        paramContent: {
            display: 'flex',
            flexDirection: `row`,
        },
        paramTypeWrapper: {
            display: 'block',
            width: "40%"
        },
        paramItemWrapper: {
            marginLeft: 5
        },
        headerWrapper: {
            display: 'flex',
        },
        headerLabel: {
            background: 'white',
            padding: 10,
            borderRadius: 5,
            border: '1px solid #dee0e7',
            margin: '1rem 0 0.25rem',
            justifyContent: 'space-between',
            display: 'flex',
            width: '100%',
            alignItems: 'center',
        },
        headerLabelWithCursor: {
            background: 'white',
            padding: 10,
            borderRadius: 5,
            cursor: "pointer",
            border: '1px solid #dee0e7',
            margin: '1rem 0 0.25rem',
            justifyContent: 'space-between',
            display: 'flex',
            width: '100%',
            alignItems: 'center',
        },
        headerLabelCursor: {
            cursor: "pointer",
            width: "100%"
        },
        disabledColor: {
            color: "rgba(0, 0, 0, 0.26)"
        },
        iconBtn: {
            padding: 0
        },
        btnContainer: {
            display: "flex",
            justifyContent: "flex-end"
        },
        actionBtn: {
            fontSize: 13,
        },
    }),
);

