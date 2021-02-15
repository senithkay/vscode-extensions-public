/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const drawerWidth = 350;

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
        },
        appBar: {
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
        appBarShift: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        hide: {
            display: 'none',
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },
        drawerPaper: {
            width: drawerWidth,
            padding: '1.5rem',
        },
        drawerHeader: {
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0, 1),
            // necessary for content to be below app bar
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end',
        },
        configTitle: {
            fontWeight: 300,
            color: '#333',
            fontSize: '1.2rem !important',
            paddingRight: theme.spacing(10)
        },
        triggerTitile: {
            fontWeight: 600,
            color: '#333',
            fontSize: '1.2rem !important',
            paddingBottom: theme.spacing(3)
        },
        close: {
            width: '1rem'
        },

        configWrapper: {
            border: '2px solid #EAE7F9',
            padding: theme.spacing(2),
            marginTop: theme.spacing(3),
            borderRadius: '10px',
            backgroundColor: '#fbfbfb',
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginLeft: -drawerWidth,
        },
        contentShift: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
        },
        triggerConfig: {
            padding: '30px',
        },
        inputUrl: {
            width: '100%'
        },
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            width: 150
        },
        primaryBtn: {
            borderRadius: 20,
            height: 40,
            textTransform: "capitalize",
            backgroundColor: theme.palette.primary.main,
            color: "#FFFFFF",
            boxShadow: "none",
            fontSize: 14,
            "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: "#FFFFFF",
            },
            "&:focus": {
                backgroundColor: theme.palette.primary.main,
                color: "#FFFFFF"
            },
            "&:active": {
                backgroundColor: theme.palette.primary.main,
                color: "#FFFFFF"
            }
        },
        panelBackground: {
            backgroundColor: "#fff",
            padding: '1rem',
            marginRight: 1,
            width: '349px',
            height: '100vh',
            overflow: 'scroll',
            marginBottom: '2rem',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            zIndex: 200,
            '&::-webkit-scrollbar': {
                width: '5px',
                marginLeft: '10px',
                backgroundColor: '#e6e8ef',
            },
            '&::-webkit-scrollbar-track': {
                backgroundColor: '#fff',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#e6e8ef',
            }
        },
        panelBackgroundNone: {
            display: 'none',
        },
        formError: {
            backgroundImage: "url('/images/form-error.svg')",
            width: 276,
            height: 250,
            margin: '50% auto',
        },
        closeBtn: {
            color: '#CBCEDB',
            border: 0,
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '10px',
            cursor: 'pointer',
            outline: 'none',
            fontSize: '1rem !important',
            background: 'none',
            borderRadius: '50%',
            zIndex: 1000,
            marginRight: '2px',
        }
    }),
);
