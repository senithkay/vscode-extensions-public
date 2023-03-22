// tslint:disable: jsx-no-lambda jsx-no-multiline-js jsx-wrap-multiline
import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import { Button, FormHelperText, LinearProgress, TextField } from "@material-ui/core";
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete'
import { CheckBoxGroup, TooltipCodeSnippet } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { CodeAction, Diagnostic } from "vscode-languageserver-protocol";

import { useStyles as useFormStyles } from "../../themes";
import { DIAGNOSTIC_MAX_LENGTH } from "../ExpressionEditor/constants";
import { truncateDiagnosticMsg } from "../ExpressionEditor/utils";
import { SuggestionItem } from "../LiteExpressionEditor";


interface StatementSyntaxDiagnostics {
    message: string;
    isPlaceHolderDiag?: boolean;
    diagnostic?: Diagnostic;
    codeActions?: CodeAction[];
}

export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
    isLoading: boolean;
    recordCompletions: CompletionResponseWithModule[];
    createNew: (newType: string) => void;
    diagnostics: StatementSyntaxDiagnostics[];
    isGraphqlForm?: boolean;
}

export interface CompletionResponseWithModule extends SuggestionItem {
    module?: string;
}

function TypeBrowserC(props: TypeBrowserProps) {
    const { type, diagnostics, onChange, isLoading, recordCompletions, createNew, isGraphqlForm } = props;
    const [selectedTypeStr, setSelectedTypeStr] = useState(type ? type : '');

    const [expressionDiagnosticMsg, setExpressionDiagnosticMsg] = useState("");

    useEffect(() => {
        setSelectedTypeStr(type ? type : '')
    }, [type])

    // Create new record and add it to the list
    const handleCreateNew = () => {
        const validName = selectedTypeStr.replace(/[\])}[{(]/g, '');
        const completion: CompletionResponseWithModule = {
            detail: "Record",
            insertText: validName,
            insertTextFormat: 2,
            kind: "Record",
            label: validName,
            sortText: "CA",
            suggestionType: 22,
            value: validName,
        }
        recordCompletions.push(completion);
        createNew(validName);
        setSelectedTypeStr(selectedTypeStr);
        setExpressionDiagnosticMsg("");
    }

    const handleCreatingNewConstruct = (nodeType : ConstructType) => {
        const validName = selectedTypeStr.replace(/[\])}[{(]/g, '');
        let codeSnippet : string = "";
        if (nodeType === ConstructType.RECORD_CONSTRUCT) {
            codeSnippet = `type ${validName} record {};`;
        } else if (nodeType === ConstructType.CLASS_CONSTRUCT) {
            codeSnippet = `service class ${validName} {}`
        }
        createNew(codeSnippet);
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

    const filterOptions = createFilterOptions({
        matchFrom: 'start',
        stringify: (option: any) => option.insertText,
    });

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
                filterOptions={filterOptions}
            />
            {isLoading && <LinearProgress />}
            {selectedTypeStr && expressionDiagnosticMsg && (
                <>
                    {<DiagnosticView
                        handleCreateNew={handleCreateNew}
                        message={expressionDiagnosticMsg}
                        isGraphqlForm={isGraphqlForm ? isGraphqlForm : false}
                        createNewConstruct={handleCreatingNewConstruct}
                    />}
                </>
            )
            }
        </>
    );
}

enum ConstructType {
    RECORD_CONSTRUCT = "Create Record",
    CLASS_CONSTRUCT = "Create Class"
}

function DiagnosticView(props: { handleCreateNew: () => void, message: string, isGraphqlForm?: boolean, createNewConstruct?: (constructType: ConstructType) => void }) {
    const { message, handleCreateNew, isGraphqlForm, createNewConstruct} = props;
    const formClasses = useFormStyles();

    const [selectedOption, setSelectedOption] = useState<string[]>(undefined);

    const handleConstructOption = async (mode: string[]) => {
        setSelectedOption(mode);
        createNewConstruct(mode[0] as ConstructType);
    }

    return (
        <>
            {!isGraphqlForm ? (
                <TooltipCodeSnippet disabled={message.length <= DIAGNOSTIC_MAX_LENGTH} content={message} placement="right" arrow={true}>
                    <FormHelperText className={formClasses.invalidCode} data-testid="expr-diagnostics">
                        {truncateDiagnosticMsg(message)}
                        <span className={formClasses.recordCreate} onClick={handleCreateNew} >Create Record</span>
                    </FormHelperText>
                </TooltipCodeSnippet>
                ) : (
                <TooltipCodeSnippet disabled={message.length <= DIAGNOSTIC_MAX_LENGTH} content={message} placement="right" arrow={true}>
                    <FormHelperText className={formClasses.invalidCode} data-testid="expr-diagnostics">
                        {truncateDiagnosticMsg(message)}
                        <CheckBoxGroup
                            // className={classes.subType}
                            values={[ConstructType.RECORD_CONSTRUCT, ConstructType.CLASS_CONSTRUCT]}
                            defaultValues={selectedOption ? selectedOption : []}
                            onChange={handleConstructOption}
                        />
                    </FormHelperText>
                </TooltipCodeSnippet>
                )
            }
        </>
        // <TooltipCodeSnippet disabled={message.length <= DIAGNOSTIC_MAX_LENGTH} content={message} placement="right" arrow={true}>
        //     <FormHelperText className={formClasses.invalidCode} data-testid="expr-diagnostics">
        //         {truncateDiagnosticMsg(message)}
        //         <span className={formClasses.recordCreate} onClick={handleCreateNew} >Create Record</span>
        //     </FormHelperText>
        // </TooltipCodeSnippet>
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
