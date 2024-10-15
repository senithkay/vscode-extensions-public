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

import { Button, Codicon, Tooltip } from "@wso2-enterprise/ui-toolkit";

import { useMediaQuery } from "../utils";
import { css } from '@emotion/css';

const useStyles = () => ({
    configureBtn: css({
        "& > vscode-button": {
            textTransform: 'none',
            boxSizing: 'border-box',
            color: 'var(--vscode-sideBarSectionHeader-foreground)',
            fontWeight: 300,
            height: '26px',
            marginLeft: '10px'
        }
    })
});

interface ConfigureButtonProps {
    onClick: () => void;
}

export default function ConfigureButton(props: ConfigureButtonProps) {
    const { onClick } = props;
    const classes = useStyles();
    const showText = useMediaQuery("(min-width:500px)");

    return (
        <Tooltip content={"Edit data mapper name, inputs and the output"} position="bottom-start">
            <Button
                onClick={onClick}
                appearance="secondary"
                className={classes.configureBtn}
            >
                <Codicon sx={{ marginRight: 5 }} name="edit" />
                {showText ? "Configure" : null}
            </Button>
        </Tooltip>
    );
}
