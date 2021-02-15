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
import { createStyles, makeStyles } from '@material-ui/core/styles';

export const wizardStyles = makeStyles(() =>
    createStyles({
        configWizardContainer: {
            backgroundColor: "#fff",
            padding: '1.75rem',
            marginRight: 1,
            width: '100%',
            height: "auto",
            marginBottom: '2rem',
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            overflowX: 'hidden',
            zIndex: 200,
            borderRadius: 5,
            boxShadow: '0 5px 10px 0 rgba(102, 103, 133, 0.27)',
            '&::-webkit-scrollbar': {
                width: 5,
                marginLeft: 10,
                backgroundColor: '#e6e8ef',
                borderRadius: 5,
                scrollMarginRight: '2em'
            },
            '&::-webkit-scrollbar-track': {
                backgroundColor: '#fff',
                borderRadius: 5,
                scrollMarginRight: '2em'
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#e6e8ef',
                borderRadius: 5,
            }
        },
        panelBackgroundNone: {
            display: 'none'
        },
        configTitle: {
            marginBottom: '1.5rem !important',
            fontWeight: 500,
            fontSize: 17
        },
        wizardBtnHolder: {
            display: "flex",
            justifyContent: "flex-end",
            height: "auto",
            marginTop: "2rem",
        },
        buttonSm: {
            height: "35px !important"
        },
        userDetailWrapper: {
            display: "flex",
            marginBottom: '0.5rem'
        },
        userIconWrapper: {
            width: "10%",
            paddingRight: "1rem"
        },
        userNameWrapper: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 0.5rem',
            width: 165,
        },
        operationLabel: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            padding: '0 0.5rem 0 0',
            width: 184,
        },
        changeSelection: {
            width: "auto",
            color: '#5567D5',
            opacity: 0.5,
            textDecoration: "underline",
            '&:hover': {
                cursor: "pointer",
                textDecoration: "none",
                opacity: 1
            }
        },
        marginTB: {
            margin: '1rem 0'
        },
        deleteBtn: {
            backgroundColor: '#fff !important',
            width: '12px !important',
            height: '12px !important',
            padding: '13px',
            marginLeft: '1rem',
        },
        formError: {
            backgroundImage: "url('/images/form-error.svg')",
            width: 276,
            height: 250,
            margin: '50% auto',
        },
        buttonWrapper: {
            height: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            zIndex: 100,
            paddingTop: '2rem',
        },
        expWrapper: {
            width: '100%',
        },
        imageRight: {
            float: "right",
            marginTop: "0.75rem"
        },
        buttonLink: {
            color: "#fff",
            padding: "0.25rem",
            textDecoration: "underline",
            "&:hover": {
                color: "#fff",
                textDecoration: "none",
            }
        }
    }),
);
