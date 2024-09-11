/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { Button, Codicon, Tooltip } from "@wso2-enterprise/ui-toolkit";

import { useMediaQuery } from "../utils";
import { css } from '@emotion/css';

const useStyles = () => ({
    autoMapButton: css({
        "& > vscode-button": {
            textTransform: 'none',
            boxSizing: 'border-box',
            color: 'var(--vscode-sideBarSectionHeader-foreground)',
            fontWeight: 300,
            height: '26px'
        }
    })
});

interface AutoMapButtonProps {
    onClick: () => void;
}

export default function AutoMapButton(props: AutoMapButtonProps) {
    const { onClick } = props;
    const classes = useStyles();
    const showText = useMediaQuery('(min-width:800px)');

    return (
        <Tooltip content={"Create mapping using AI"} position="bottom-start">
            <Button
                onClick={onClick}
                appearance="secondary"
                className={classes.autoMapButton}
            >
                <Codicon name="wand" sx={{ marginRight: 5 }} />
                {showText ? 'Auto Map' : null}
            </Button>
        </Tooltip>
    );
}
