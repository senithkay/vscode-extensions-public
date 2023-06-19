/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        chipRoot: {
            fontSize: theme.spacing(1.3),
            height: "auto",
            maxWidth: "100%",
            overflow: "hidden",
            padding: theme.spacing(0.25, 0.5, 0.25, 0),
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        },
        chiplabel: {
            lineHeight: "1.2em",
            paddingLeft: theme.spacing(0.25),
            paddingRight: theme.spacing(0.25),
        },
    }),
);
