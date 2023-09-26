/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { colors } from '@wso2-enterprise/ui-toolkit';

export const useStyles = makeStyles(() =>
    createStyles({
        root: {
            flexGrow: 1,
            height: "100%",
            overflow: "hidden",
            background: colors.vscodeEditorBackground
        },
        serviceList: {
            overflowY: "scroll",
            maxHeight: "90%",
            color: colors.editorForeground
        },
        expandAll: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginRight: "20px",
        },
        collapseBtn: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            flexDirection: "row",
            width: "max-content",
            padding: "4px 4px 4px 8px",
            marginTop: "4px",
            borderRadius: "4px",
            color: "#8d91a3",
            cursor: "pointer",
            "&:hover": {
                backgroundColor: "#e6e7ec",
            },
            "& #config-showed-options": {
                fill: "#8d91a3",
            },
        },
        gridContainer: {
            marginTop: "5%"
        }
    }),
);
