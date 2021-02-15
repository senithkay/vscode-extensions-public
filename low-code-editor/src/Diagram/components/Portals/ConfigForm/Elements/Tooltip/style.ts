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

export const tooltipStyles = {
    tooltip: {
        color: "#ffffff",
        borderRadius: "4px",
        backgroundColor: "#40404B",
        boxShadow: "0 1px 10px 0 rgba(0,0,0,0.22)",
        padding: "1rem"
    },
    arrow: {
        color: "#40404B"
    }
};

export const tooltipInvertedStyles = {
    tooltip: {
        color: "#8d91a3",
        backgroundColor: "#fdfdfd",
        border: "1px solid #e6e7ec",
        borderRadius: "4px",
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
            marginRight: "0.5rem",
            alignSelf: "center"
        },
        buttonLink: {
            color: "#526acf",
            cursor: "pointer",
            "&:hover": {
                textDecoration: "underline"
            }
        },
        pre: {
            margin: 0,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            // whiteSpace: "-moz-pre-wrap",
            // whiteSpace: "-pre-wrap",
            // whiteSpace: "-o-pre-wrap",
            wordWrap: "break-word"
        },
        code: {
            color: "#2f3e9c",
            fontSize: "12px"
        },
        exampleCodeWrap: {
            display: "flex",
            alignItems: "baseline"
        },
        codeExample: {
            backgroundColor: "#eff1f5",
            color: "#526acf",
            fontSize: "12px",
            marginLeft: "5px",
            padding: "5px"
        },
        heading: {
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: '#3f414a',
            marginBottom: 9,
        }
    }),
);

export default useStyles;
