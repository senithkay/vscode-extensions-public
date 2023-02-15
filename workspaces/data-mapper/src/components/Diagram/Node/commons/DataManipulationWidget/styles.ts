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
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        treeLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium",
            fontSize: "13px",
            minWidth: "100px",
            backgroundColor: "#FFFFFF",
            display: "flex",
            minHeight: "24px",
            width: "100%",
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        treeLabelPortSelected: {
            backgroundColor: '#DFE2FF',
        },
        treeLabelParentHovered: {
            backgroundColor: '#F0F1FB',
        },
        treeLabelDisableHover: {
            '&:hover': {
                backgroundColor: '#F4F5FB',
            }
        },
        treeLabelDisabled: {
            backgroundColor: "#F7F8FB",
            '&:hover': {
                backgroundColor: '#F7F8FB',
            },
            cursor: 'not-allowed'
        },
        treeLabelArray: {
            flexDirection: "column"
        },
        ArrayFieldRow: {
            display: "flex",
            alignItems: 'center',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        ArrayFieldRowDisabled: {
            '&:hover': {
                backgroundColor: '#F7F8FB'
            }
        },
        innerTreeLabel: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "inherit",
            padding: "10px 12px",
            margin: "10px",
            background: "#F7F8FB",
            border: "1px #A9D7DD solid",
            borderRadius: "4px",
            flex: "none",
            order: 1,
            flexGrow: 0
        },
        treeLabelOutPort: {
            float: "right",
            width: 'fit-content',
            marginLeft: "auto",
            display: "flex",
            alignItems: "center"
        },
        treeLabelInPort: {
            float: "left",
            marginRight: "5px",
            width: 'fit-content',
            display: "flex",
            alignItems: "center"
        },
        typeLabel: {
            marginLeft: "3px",
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerRegular",
            fontSize: "13px",
            minWidth: "100px",
            marginRight: "24px",
            fontWeight: 400
        },
        typeLabelDisabled: {
            backgroundColor: "#F7F8FB",
            color: "#40404B",
            opacity: 0.5
        },
        value: {
            verticalAlign: "middle",
            padding: "5px",
            backgroundColor: "#f5f1fb",
            borderRadius: "5px",
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'border 0.2s',
            border: `1px solid #f5f1fb`,
            '&:hover': {
                border: `1px solid ${theme.palette.grey[300]}`
            }
        },
        valueWithError: {
            verticalAlign: "middle",
            padding: "5px",
            backgroundColor: theme.palette.error.light,
            borderRadius: "5px",
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'border 0.2s',
            border: `1px solid ${theme.palette.error.light}`,
            '&:hover': {
                border: `1px solid ${theme.palette.error.main}`
            }
        },
        errorIconWrapper: {
            height: "22px",
            width: "22px",
            marginLeft: '5px',
            verticalAlign: 'middle',
        },
        valueLabel: {
            verticalAlign: "middle",
            padding: "5px",
            color: "#222228",
            fontFamily: "GilmerMedium",
            fontSize: "13px",
        },
        valueLabelDisabled: {
            backgroundColor: "#F7F8FB",
            color: "#1D2028",
            opacity: 0.5
        },
        group: {
            marginLeft: "0px",
            paddingLeft: "0px",
            paddingBottom: "5px"
        },
        content: {
            borderTopRightRadius: theme.spacing(2),
            borderBottomRightRadius: theme.spacing(2),
            paddingRight: theme.spacing(1),
        },
        addIcon: {
            color: "#5567D5",
            padding: "5px",
            textTransform: "none",
            justifyContent: "left",
            fontStyle: "normal",
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "24px"
        },
        editButton: {
            float: "right",
            width: 'fit-content',
            marginLeft: "auto"
        },
        label: {
            width: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pointerEvents: "none",
            "&:hover": {
                overflow: "visible"
            }
        },
        expandIcon: {
            cursor: "pointer",
            pointerEvents: "all",
            color:  theme.palette.common.black,
            height: "25px",
            width: "25px",
            marginLeft: "auto"
        },
        expandIconDisabled: {
            color: "#9797a9",
        },
        requiredMark: {
            color: theme.palette.error.main,
            margin: '0 2px',
            fontSize: '18px'
        },
        loader: {
            float: "right",
            marginLeft: "auto",
            marginRight: '3px',
            alignSelf: 'center'
        }
    }),
);
