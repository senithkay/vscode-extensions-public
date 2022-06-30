import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paramContainer: {
            marginTop: 5,
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
            width: '30%',
            marginLeft: 5
        },
        headerWrapper: {
            display: 'flex',
        },
        headerLabel: {
            background: 'white',
            borderRadius: 5,
            border: '1px solid #dee0e7',
            marginTop: 8,
            display: 'flex',
            width: '100%',
            height: 40,
            alignItems: 'center',
        },
        headerLabelWithCursor: {
            background: 'white',
            padding: 10,
            borderRadius: 5,
            cursor: "pointer",
            border: '1px solid #dee0e7',
            marginTop: 8,
            justifyContent: 'space-between',
            display: 'flex',
            height: 40,
            width: '100%',
            alignItems: 'center',
        },
        enabledHeaderLabel: {
            cursor: "pointer",
            width: "80%",
            marginTop: 7,
            marginLeft: 10,
            lineHeight: "24px"
        },
        disabledHeaderLabel: {
            width: "80%",
            color: "rgba(0, 0, 0, 0.26)",
            marginTop: 7,
            marginLeft: 10,
            lineHeight: "24px"
        },
        iconSection: {
            display: "flex",
            flexDirection: "row",
            height: 40,
            width: 140,
            borderRadius: "4px 0 0 4px",
            backgroundColor: "#F0F1FB",
        },
        iconWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 13,
            marginBottom: 13,
            marginLeft: 10,
            backgroundColor: "#FFF",
        },
        iconTextWrapper: {
            marginTop: 13,
            marginLeft: 5,
            lineHeight: "14px",
            fontSize: 12
        },
        contentSection: {
            display: "flex",
            flexDirection: "row",
            height: 40,
            width: "100%"
        },
        contentIconWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 13,
            marginBottom: 13,
            marginLeft: 10.5
        },
        deleteButtonWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 12,
            marginBottom: 13,
            marginLeft: 10.5
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

