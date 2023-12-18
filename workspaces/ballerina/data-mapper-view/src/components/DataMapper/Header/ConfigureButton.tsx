/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { Button } from '@material-ui/core';
import { css } from "@emotion/css";
import { withStyles } from "@material-ui/core/styles";
import TooltipBase from "@material-ui/core/Tooltip";

import RoundEditIcon from "../../../assets/icons/EditIcon";

import {headerStyles} from "./DataMapperHeader";
import { useMediaQuery } from "../utils";

const useStyles = () => ({
    button: css({
        textTransform: 'none',
        boxSizing: 'border-box',
        background: 'var(--vscode-editorWidget-background)',
        border: '1px solid var(--vscode-editorHoverWidget-statusBarBackground)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '5px',
        color: 'var(--vscode-icon-foreground)',
        fontSize: '13px',
        fontWeight: 400
    })
});

interface ConfigureButtonProps {
    onClick: () => void;
}

export default function ConfigureButton(props: ConfigureButtonProps) {
    const { onClick } = props;
    const classes = useStyles();
    const showText = useMediaQuery('(min-width:500px)');
    const TooltipComponent = withStyles(headerStyles)(TooltipBase);

    return (
        <TooltipComponent
            interactive={false}
            arrow={true}
            title={"Edit data mapper name, inputs and the output"}
        >
            <Button
                onClick={onClick}
                variant="outlined"
                startIcon={<RoundEditIcon />}
                className={classes.button}
            >
                {showText ? 'Configure' : null}
            </Button>
        </TooltipComponent>
    );
}
