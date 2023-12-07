/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles(
    (theme: Theme) =>
        createStyles({
            addIcon: {
                color: "#5567D5",
                padding: "5px",
                textTransform: "none",
                justifyContent: "left",
                fontStyle: "normal",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "24px",
            },
            typeLabel: {
                marginLeft: "3px",
                verticalAlign: "middle",
                padding: "5px",
                minWidth: "100px",
                marginRight: "24px",
            },
            treeLabelPortSelected: {
                backgroundColor: "#DFE2FF",
            },
            valueLabel: {
                verticalAlign: "middle",
                padding: "5px",
            },
            treeLabelOutPort: {
                float: "right",
                width: "fit-content",
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
            },
            treeLabelInPort: {
                float: "left",
                width: "fit-content",
                display: "flex",
                alignItems: "center",
            },
            label: {
                width: "300px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                display: "inline-block",
                textOverflow: "ellipsis",
                "&:hover": {
                    overflow: "visible",
                },
            },
            expandIcon: {
                color: theme.palette.common.black,
                height: "25px",
                width: "25px",
                marginLeft: "auto",
            },
            queryPortWrap: {
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
            },
            treeLabel: {
                verticalAlign: "middle",
                padding: "5px",
                minWidth: "100px",
                display: "flex",
                minHeight: "24px",
                background: "#FFF",
                '&:hover': {
                    backgroundColor: '#F0F1FB',
                }
            },
            headerTreeLabel: {
                verticalAlign: "middle",
                padding: "5px",
                minWidth: "100px",
                display: "flex",
                minHeight: "24px",
                backgroundColor: "#E6E8F0"
            },
            treeLabelParentHovered: {
                backgroundColor: '#F0F1FB',
            },
        }),
    { index: 1 }
);
