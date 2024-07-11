/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { Button, Icon } from "@wso2-enterprise/ui-toolkit";
import { css } from "@emotion/css";

const useStyles = () => ({
    importButton: css({
        "& > vscode-button": {
            width: "100%",
            height: "30px",
            margin: "10px 0px"
        }
    }),
});

interface ImportDataButtonsProps {
    onImportTypeChange: (importType: string) => void;
}
const importTypes = [
    { type: "JSON", label: "JSON" },
    { type: "JSON_SCHEMA", label: "JSON Schema" },
    { type: "XML", label: "XML" },
    { type: "CSV", label: "CSV" }
];

export function ImportDataButtons(props: ImportDataButtonsProps) {
    const { onImportTypeChange } = props;
    const classes = useStyles();

    const handleImportTypeChange = (importType: string) => {
        onImportTypeChange(importType);
    };

    const createImportButton = (type: string, label: string) => (
        <Button
            appearance="primary"
            onClick={() => handleImportTypeChange(type)}
            disabled={false}
            className={classes.importButton}
            sx={{ width: "100%" }}
        >
            <Icon
                sx={{ height: "18px", width: "18px", marginRight: "4px" }}
                iconSx={{ fontSize: "18px" }}
                name="import"
            />
            Import from {label}
        </Button>
    );

    return (
        <>
            {importTypes.map(({ type, label }) => (
                createImportButton(type, label)
            ))}
        </>
    );
}
