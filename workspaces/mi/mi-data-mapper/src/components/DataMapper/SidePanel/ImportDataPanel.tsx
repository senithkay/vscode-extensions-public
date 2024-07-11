/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Button, Icon, LinkButton, TextArea } from "@wso2-enterprise/ui-toolkit";
import { css } from "@emotion/css";
import { Controller, useForm } from 'react-hook-form';

const useStyles = () => ({
    fileUploadText: css({
        fontSize: "12px"
    })
});

interface RowRange {
    start: number;
    offset: number;
}

interface ImportDataPanelProps {
    importType: string;
    rowRange?: RowRange;
}

export function ImportDataPanel(props: ImportDataPanelProps) {
    const { importType, rowRange } = props;
    const classes = useStyles();
    const { control } = useForm();

    const [rows, setRows] = useState(rowRange.start || 1);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textAreaRef.current) {
            const textarea = textAreaRef.current.shadowRoot.querySelector("textarea");
            const handleOnKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Tab") {
                    event.preventDefault();
                    const selectionStart = textarea.selectionStart;
                    textarea.setRangeText("  ", selectionStart, selectionStart, "end");
                }
            };

            textarea.addEventListener("keydown", handleOnKeyDown);
            return () => {
                textarea.removeEventListener("keydown", handleOnKeyDown);
            };
        }
    }, [textAreaRef]);

    const growTextArea = (text: string) => {
        const { start, offset } = rowRange;
        const lineCount = text.split("\n").length;
        const newRows = Math.max(start, Math.min(start + offset, lineCount));
        setRows(newRows);
    };

    const handleChange = (e: any) => {
        if (rowRange) {
            growTextArea(e.target.value);
        }
        // onChange && onChange(e);
    };

    const generatePlaceholder = useMemo(() => {
        switch (importType) {
            case 'JSON':
                return '{"key":"value"}';
            case 'CSV':
                return 'column1,column2,column3';
            case 'XML':
                return '<root><element>value</element></root>';
            case 'JSON_SCHEMA':
                return `Enter JSON Schema`;
            default:
                return 'Enter your data';
        }
    }, [importType]);

    return (
        <>
            <LinkButton
                onClick={undefined}
                sx={{ padding: "5px", gap: "2px"}}
            >
                <Icon
                    iconSx={{ fontSize: "12px" }}
                    name="file-upload"
                />
                    <p className={classes.fileUploadText}>{`Upload ${importType} file`}</p>
            </LinkButton>
            <Controller
                name="payload"
                control={control}
                render={({ field }) => (
                    <TextArea
                        ref={textAreaRef}
                        onChange={handleChange}
                        rows={rows}
                        resize="vertical"
                        placeholder={generatePlaceholder}
                    />
                )}
            />
            <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                <Button
                    appearance="primary"
                    onClick={undefined}
                    disabled={false}
                >
                    Save
                </Button>
            </div>
        </>
    );
}
