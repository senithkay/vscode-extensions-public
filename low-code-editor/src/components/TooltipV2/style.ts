/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

export const tooltipBaseStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: 6,
        padding: "1rem"
    },
    arrow: {
        color: "#fdfdfd"
    }
};

const useStyles = makeStyles(() =>
    createStyles({
        componentWrapper: {
            display: "flex",
            justifyContent: "space-between",
        },
        iconWrapper: {
            alignSelf: "center"
        },
        buttonLink: {
            color: "#5567D5",
            cursor: "pointer",
            marginTop: 5,
            "&:hover": {
                textDecoration: "underline"
            }
        },
        pre: {
            margin: 0,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word"
        },
        code: {
            color: "#2f3e9c",
            fontSize: 12
        },
        exampleTag: {
            color: "#CBCEDB"
        },
        codeExample: {
            backgroundColor: "#eff1f5",
            color: "#526acf",
            fontSize: 12,
            marginLeft: 5,
            padding: 5
        },
        divider: {
            margin: '5px 0px'
        },
        editorLink: {
            color: "#5567D5",
            fontSize: 12,
            marginTop: 10,
            cursor: 'pointer',
            transition: "all 0.2s",
            '&:hover': {
                color: "#8190ef",
            },
            fontFamily: "'Gilmer', sans-serif"
        },
        heading: {
            fontSize: 13,
            fontWeight: 600,
            color: '#1D2028',
            marginBottom: '0.5rem'
        },
        subHeading: {
            fontSize: 12,
            fontWeight: 400,
            color: '#40404B'
        },
        exampleContent: {
            fontSize: 12,
            color: '#40404B',
            fontFamily: "Gilmer",
            align: "left",
            fontWeight: 100
        },
        codeWrapper: {
            padding: 5,
            backgroundColor: "#eff1f5",
            marginTop: 6,
            borderRadius: 4
        },
        diagnosticWrapper: {
            width: '231px',
            color: '#FE523C',
            fontFamily: "Droid Sans Mono",
            fontSize: '12px',
            letterSpacing: '0',
        }
    }),
);

export default useStyles;
