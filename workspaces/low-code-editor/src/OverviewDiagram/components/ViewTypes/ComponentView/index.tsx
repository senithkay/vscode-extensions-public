/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable:jsx-no-multiline-js
import React from "react";

import { Typography } from "@material-ui/core";
import { getConstructIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ComponentCard } from "@wso2-enterprise/ui-toolkit";

import { ComponentViewInfo } from "../../../util";

import useStyles from "./style";
import './style.scss';

interface ComponentViewProps {
    type?: string;
    info: ComponentViewInfo;
    updateSelection: (info: ComponentViewInfo) => void;
}


export function ComponentView(props: ComponentViewProps) {
    const { info, updateSelection, type } = props;
    const classes = useStyles();

    const isComponentAllowed = () => {
        switch (type) {
            case 'classes':
            case 'objects':
            case 'types':
            case 'enums':
            case 'listeners':
            case 'constants':
            case 'moduleVariables':
                return false;
            default:
                return true;
        }
    }

    const handleComponentClick = () => {
        updateSelection(info);
    };

    const isAllowed = isComponentAllowed();

    return (
        <ComponentCard
            disabled={isAllowed}
            onClick={handleComponentClick}
            sx={{
                display: "flex", height: 50,
                width: 200,
                cursor: "pointer",
                borderRadius: 5,
                alignItems: "center",
                padding: 10,
                justifyContent: "left",
                marginRight: 16,
                marginBottom: 16,
                transition: "0.3s",
                border: "1px solid var(--vscode-editor-foreground)",
                "&:hover, &.active": {
                    color: "var(--vscode-editor-foreground)",
                    border: "1px solid var(--vscode-focusBorder)",
                    backgroundColor: "var(--vscode-pickerGroup-border)",
                    ".icon svg g": {
                        fill: "var(--vscode-editor-foreground)"
                    }
                }
            }}
        >
            <div className="icon">
                {getConstructIcon(`${iconNameTranslator(props.type)}Icon`)}
            </div>
            <Typography className={classes.label} variant="h4">{info.name.length ? info.name : '/'}</Typography>
        </ComponentCard>
    )
}

function iconNameTranslator(type: string) {
    switch (type) {
        case 'functions':
            return 'Function';
        case 'services':
            return 'Service';
        case 'records':
            return 'TypeDefinition';
        case 'objects':
            return 'Object';
        case 'classes':
            return 'Class';
        case 'types':
            return 'TypeDefinition';
        case 'constants':
            return 'Constant';
        case 'enums':
            return 'Enum';
        case 'listeners':
            return 'Listener';
        case 'moduleVariables':
            return 'Variable';
        default:
            return 'TypeDefinition';
    }
}

