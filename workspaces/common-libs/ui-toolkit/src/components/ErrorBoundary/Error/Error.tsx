/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as React from "react";

import { useStyles } from "./style";
import { Typography } from "../../Typography/Typography";
import { Codicon } from "../../Codicon/Codicon";

export interface ErrorProps {
    errorMsg?: string;
}

export function ErrorScreen (props: ErrorProps) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Codicon name="error" sx={{height: "100px", width: "100px"}} iconSx={{ fontSize: 100, color: "var(--vscode-errorForeground)" }} />
            <Typography variant="h4" className={classes.errorTitle}>
                {props.errorMsg ? props.errorMsg : "A problem occurred."}
            </Typography>
            <Typography variant="body2" className={classes.errorMsg}>
                Please raise an issue in our <a href="https://github.com/wso2/ballerina-plugin-vscode/issues">issue tracker</a>
            </Typography>
        </div>
    );
}
