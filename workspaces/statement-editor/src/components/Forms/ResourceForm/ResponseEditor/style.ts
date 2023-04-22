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
            display: 'flex'
        },
        paramTypeWrapper: {
            display: 'block',
            width: "50%",
            padding: 10
        },
        paramDataTypeWrapper: {
            width: '50%',
            padding: 10
        },
        anonyWrapper: {
            marginTop: -30,
            width: '50%',
            padding: 10
        },
        paramNameWrapper: {
            width: '50%'
        },
        headerNameWrapper: {
            width: '33%'
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
            width: "77%",
            marginTop: 7,
            marginLeft: 10,
            lineHeight: "24px"
        },
        disabledHeaderLabel: {
            width: "77%",
            color: "rgba(0, 0, 0, 0.26)",
            marginTop: 7,
            marginLeft: 10,
            lineHeight: "24px"
        },
        iconSection: {
            display: "flex",
            flexDirection: "row",
            cursor: "pointer",
            height: 40,
            width: 225,
            borderRadius: "4px 0 0 4px",
            backgroundColor: "#F0F1FB",
        },
        iconWrapper: {
            cursor: "pointer",
            height: 14,
            width: 14,
            marginTop: 13,
            marginBottom: 13,
            marginLeft: 10
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
            padding: theme.spacing(1.5),
            display: "flex",
            justifyContent: "flex-end"
        },
        actionBtn: {
            fontSize: 13,
        },
        addHeaderBtn: {
            paddingLeft: 0,
            marginTop: 6,
            textTransform: 'initial',
            marginLeft: -200
        },
        subType: {
            marginBottom: -5,
            marginTop: 10,
            width: 350
        },
        searchList: {
            width: "100%",
            border: "1px solid #DEE0E7",
            borderRadius: "5px",
            padding: "4px 10px",
            backgroundColor: "#ffffff",
            height: "36.44px"
        }
    }),
);

