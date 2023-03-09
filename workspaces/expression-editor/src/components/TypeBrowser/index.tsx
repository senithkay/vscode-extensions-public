// tslint:disable: jsx-no-lambda jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import { Button, FormHelperText, LinearProgress, TextField } from "@material-ui/core";
import { TooltipCodeSnippet } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import Autocomplete from '@material-ui/lab/Autocomplete'
import { Diagnostic } from "vscode-languageserver-protocol";

import { useStyles as useFormStyles } from "../../themes";
import { DIAGNOSTIC_MAX_LENGTH } from "../ExpressionEditor/constants";
import { truncateDiagnosticMsg } from "../ExpressionEditor/utils";
import { SuggestionItem } from "../LiteExpressionEditor";


export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
    isLoading: boolean;
    recordCompletions: CompletionResponseWithModule[];
    createNew: (newType: string) => void;
    diagnostics: Diagnostic[]
}

export interface CompletionResponseWithModule extends SuggestionItem {
    module?: string;
}

function TypeBrowserC(props: TypeBrowserProps) {
    const { type, diagnostics, onChange, isLoading, recordCompletions, createNew } = props;
    const [selectedTypeStr, setSelectedTypeStr] = useState(type ? type : '');

    const [expressionDiagnosticMsg, setExpressionDiagnosticMsg] = useState("");

    useEffect(() => {
        setSelectedTypeStr(type ? type : '')
    }, [type])

    // Create new record and add it to the list
    const handleCreateNew = () => {
        const completion: CompletionResponseWithModule = {
            detail: "Record",
            insertText: selectedTypeStr,
            insertTextFormat: 2,
            kind: "Record",
            label: selectedTypeStr,
            sortText: "CA",
            suggestionType: 22,
            value: selectedTypeStr,
        }
        recordCompletions.push(completion);
        createNew(selectedTypeStr);
        setSelectedTypeStr(selectedTypeStr);
        setExpressionDiagnosticMsg("");
    }

    // When diagnostics are hit push the error message
    useEffect(() => {
        if (diagnostics) {
            if (diagnostics.length > 0) {
                setExpressionDiagnosticMsg(diagnostics[0].message);
            } else {
                setExpressionDiagnosticMsg("");
            }
        } else {
            setExpressionDiagnosticMsg("");
        }
    }, [diagnostics]);

    return (
        <>
            <Autocomplete
                freeSolo={true}
                key={`type-select-${isLoading.toString()}`}
                data-testid='type-select-dropdown'
                getOptionLabel={(option) => option?.insertText || selectedTypeStr}
                options={recordCompletions}
                disabled={isLoading}
                inputValue={selectedTypeStr}
                onInputChange={(_, value) => {
                    if (!isLoading) {
                        setSelectedTypeStr(value)
                        onChange(value);
                    }
                }}
                defaultValue={selectedTypeStr}
                onChange={(_, value: CompletionResponseWithModule) => onChange(value?.module ? `${value.module}:${value.insertText}` : value?.insertText)}
                renderInput={(params) => <TextFieldStyled {...params} autoFocus={!isLoading && !selectedTypeStr} />}
                renderOption={(item) =>
                (
                    <TypeSelectItem>
                        <TypeSelectItemLabel>{item.label}</TypeSelectItemLabel>
                        <TypeSelectItemModule>{item.module}</TypeSelectItemModule>
                    </TypeSelectItem>
                )
                }
                blurOnSelect={true}
            />
            {isLoading && <LinearProgress />}
            {selectedTypeStr && expressionDiagnosticMsg && (
                <>
                    {<DiagnosticView handleCreateNew={handleCreateNew} message={expressionDiagnosticMsg} />}
                </>
            )
            }
        </>
    );
}

function DiagnosticView(props: { handleCreateNew: () => void, message: string }) {
    const { message, handleCreateNew } = props;
    const formClasses = useFormStyles();

    return (
        <TooltipCodeSnippet disabled={message.length <= DIAGNOSTIC_MAX_LENGTH} content={message} placement="right" arrow={true}>
            <FormHelperText className={formClasses.invalidCode} data-testid="expr-diagnostics">
                {truncateDiagnosticMsg(message)}
                <Button className={formClasses.recordCreate} onClick={handleCreateNew} >Create Record</Button>
            </FormHelperText>
        </TooltipCodeSnippet>
    );
}

export const TypeBrowser = React.memo(TypeBrowserC);

const TypeSelectItem = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
`;

const TypeSelectItemLabel = styled.div`
    word-break: break-word;
    flex: 1;
`;

const TypeSelectItemModule = styled.div`
    color: #8d91a3;
    font-size: 11px;
`;

const TextFieldStyled = styled(TextField)`
    width: 100%;
    border: 1px solid #DEE0E7;
    border-radius: 5px;
    padding: 2px 6px;
    background-color: #ffffff;
`;
