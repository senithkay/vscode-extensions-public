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
import styled from "@emotion/styled";
import { Controller, useForm } from 'react-hook-form';
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { FileExtension, ImportType } from "./ImportDataForm";

const ErrorMessage = styled.span`
   color: var(--vscode-errorForeground);
   font-size: 12px;
`;

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
    importType: ImportType;
    extension: FileExtension;
    rowRange?: RowRange;
    onSave: (text: string) => void;
}

export function ImportDataPanel(props: ImportDataPanelProps) {
    const { importType, extension, rowRange, onSave } = props;
    const classes = useStyles();
    const { clearErrors, control, formState: { errors }, setError, watch } = useForm();

    const [rows, setRows] = useState(rowRange.start || 1);
    const [fileContent, setFileContent] = useState("");

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const hiddenFileInput = useRef(null);

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

    useEffect(() => {
        if (!fileContent) return;
        try {
            switch (importType.type) {
                case 'JSON':
                    JSON.parse(fileContent);
                    clearErrors("payload");
                    break;
                case 'CSV':
                    const rows = fileContent.trim().split("\n");
                  
                    const columnCount = rows[0].split(',').length;
                  
                    for (let i = 1; i < rows.length; i++) {
                      const columns = rows[i].split(',');
                      if (columns.length !== columnCount) {
                        // Row has different number of columns
                        throw new Error();
                      }
                    }
                    clearErrors("payload");
                    break;
                case 'XML':
                    const parser = new DOMParser();
                    const parsedDocument = parser.parseFromString(fileContent, "application/xml");
                    const parserError = parsedDocument.getElementsByTagName("parsererror");
                    if (parserError.length > 0) {
                        throw new Error();
                    }
                    clearErrors("payload");
                    break;
                case 'JSON_SCHEMA':
                    const ajv = new Ajv();
                    addFormats(ajv);
                    try {
                        const schema = JSON.parse(fileContent);
                        const valid = ajv.validateSchema(schema);
                        if (!valid) {
                            throw new Error();
                        }
                    } catch (error) {
                        throw new Error();
                    }
                    clearErrors("payload");
                    break;
                default:
                    break;
            }
        } catch (error) {
            setError("payload", { message: `Invalid ${importType.type} format.` });
        }
    }, [fileContent, importType]);

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
        setFileContent(e.target.value);
    };

    const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
        hiddenFileInput.current.click();
    };

    const showFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const reader = new FileReader();
        const ext = e.target.files[0].name.split(".").pop().toLowerCase();
        reader.readAsText(e.target.files[0]);
        reader.onload = async (loadEvent: any) => {
            if (`.${ext}` === extension) {
                const text = loadEvent.target.result as string;
                setFileContent(text);
            }
        };
    };

    const handleSave = () => {
        onSave(fileContent);
    };

    const generatePlaceholder = useMemo(() => {
        switch (importType.type) {
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

    const fileUploadText = useMemo(() => `Upload ${importType.label} file`, [importType]);

    return (
        <>
            <input hidden={true} accept={extension} type="file" onChange={showFile} ref={hiddenFileInput} />
            <LinkButton
                onClick={handleClick}
                sx={{ padding: "5px", gap: "2px"}}
            >
                <Icon
                    iconSx={{ fontSize: "12px" }}
                    name="file-upload"
                />
                    <p className={classes.fileUploadText}>{fileUploadText}</p>
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
                        value={fileContent}
                    />
                )}
            />
            {errors.payload && <ErrorMessage>{errors.payload.message.toString()}</ErrorMessage>}
            <div style={{ textAlign: "right", marginTop: "10px", float: "right" }}>
                <Button
                    appearance="primary"
                    onClick={handleSave}
                    disabled={false}
                >
                    Save
                </Button>
            </div>
        </>
    );
}
