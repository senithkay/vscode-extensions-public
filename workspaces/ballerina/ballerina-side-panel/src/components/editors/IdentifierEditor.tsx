/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback, useState, useRef } from "react";
import { FormField } from "../Form/types";
import { Button, TextField, Typography, Icon, ProgressRing, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { useFormContext } from "../../context";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { debounce } from "lodash";
import { getPropertyFromFormField } from "./utils";

const EditRow = styled.div`
    display: flex;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
`;

const InputWrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: flex-start;
`;

const TextFieldWrapper = styled.div`
    flex: 1;
`;

const EditButton = styled(Button)`
    margin-top: 39px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 2px;
    margin-top: 38px;
`;

const StyledButton = styled(Button)`
    font-size: 14px;
`;

const WarningText = styled(Typography)`
    color: var(--vscode-textLink-foreground);
    font-size: 12px;
    margin-top: 4px;
`;

const EditableRow = styled.div`
    display: flex;
    align-items: flex-start;
    width: 100%;
    flex-direction: column;
`;

export namespace S {
    export const Container = styled.div({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontFamily: 'var(--font-family)',
    });

    export const TitleContainer = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    export const LabelContainer = styled.div({
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    });

    export const HeaderContainer = styled.div({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '4px',
    });

    export const Header = styled.div({
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    });

    export const Label = styled.label`
        color: var(--vscode-foreground);
        font-family: GilmerMedium;
        font-size: 14px;
        line-height: 1.4;
    `;

    export const Description = styled.div`
        color: var(--vscode-descriptionForeground);
        font-family: GilmerRegular;
        font-size: 12px;
        line-height: 1.4;
    `;
}

interface IdentifierEditorProps {
    field: FormField;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
    showWarning?: boolean;
    onEditingStateChange?: (isEditing: boolean) => void;
}

export function IdentifierEditor(props: IdentifierEditorProps) {
    const { field, handleOnFieldFocus, autoFocus, showWarning, onEditingStateChange } = props;
    const { form } = useFormContext();
    const { rpcClient } = useRpcContext();
    const { register, setValue, getValues } = form;
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(field.value || "");
    const [identifierErrorMsg, setIdentifierErrorMsg] = useState<string>(field.diagnostics?.map((diagnostic) => diagnostic.message).join("\n"));
    const [isIdentifierValid, setIsIdentifierValid] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState(false);
    const saveButtonClicked = useRef(false);

    const errorMsg = field.diagnostics?.map((diagnostic) => diagnostic.message).join("\n");

    const startEditing = () => {
        const currentFormValue = getValues(field.key);
        setTempValue(currentFormValue || field.value || "");
        saveButtonClicked.current = false;
        setIsEditing(true);
        onEditingStateChange?.(true);
    };

    const cancelEditing = () => {
        if (typeof field.value === 'string' && !saveButtonClicked.current) {
            validateIdentifierName(field.value);
        }
        setTempValue("");
        saveButtonClicked.current = false;
        setIsEditing(false);
        onEditingStateChange?.(false);
    };

    const saveEdit = async () => {
        saveButtonClicked.current = true;
        if (!tempValue || tempValue === field.value) {
            cancelEditing();
            return;
        }

        setIsSaving(true);
        try {
            await rpcClient.getBIDiagramRpcClient().renameIdentifier({
                fileName: field.lineRange?.fileName,
                position: {
                    line: field.lineRange?.startLine?.line,
                    character: field.lineRange?.startLine?.offset
                },
                newName: String(tempValue)
            });

            setValue(field.key, tempValue);
            field.value = tempValue;
            setIsEditing(false);
            onEditingStateChange?.(false);
        } catch (error) {
            console.error('Error renaming identifier:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const validateIdentifierName = useCallback(debounce(async (value: string) => {
        // Skip validation if we're saving or not editing
        if (saveButtonClicked.current || !isEditing) {
            return;
        }
        
        console.log("Validating identifier name:", getPropertyFromFormField(field), value);

        const response = await rpcClient.getBIDiagramRpcClient().getExpressionDiagnostics({
            filePath: field.lineRange?.fileName,
            context: {
                expression: value,
                startLine: {
                    line: field.lineRange?.startLine?.line,
                    offset: field.lineRange?.startLine?.offset
                },
                offset: 0,
                lineOffset: 0,
                codedata: field.codedata,
                property: getPropertyFromFormField(field)
            }
        });

        if (response.diagnostics.length > 0) {
            setIdentifierErrorMsg(response.diagnostics[0].message);
            setIsIdentifierValid(false);
        } else {
            setIdentifierErrorMsg("");
            setIsIdentifierValid(true);
        }
    }, 250), [rpcClient, field, isEditing]);

    const handleOnBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!saveButtonClicked.current) {
            validateIdentifierName(e.target.value);
        }
    }

    const handleOnFocus = (e: React.ChangeEvent<HTMLInputElement>) => {
        validateIdentifierName(e.target.value);
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempValue(e.target.value);
        validateIdentifierName(e.target.value);
    }


    return (
        <>
            {!field.editable && !isEditing && (
                <InputWrapper>
                    <TextFieldWrapper>
                        <TextField
                            id={field.key}
                            name={field.key}
                            {...register(field.key, { required: !field.optional && !field.placeholder, value: field.value })}
                            label={field.label}
                            required={!field.optional}
                            description={field.documentation}
                            placeholder={field.placeholder}
                            errorMsg={errorMsg}
                            readOnly={!field.editable}
                            onFocus={() => handleOnFieldFocus?.(field.key)}
                            autoFocus={autoFocus}
                        />
                    </TextFieldWrapper>
                    <EditButton appearance="icon" onClick={startEditing} tooltip="Rename">
                        <Icon name="bi-edit" sx={{ width: 18, height: 18, fontSize: 18 }} />
                    </EditButton>
                </InputWrapper>
            )}
            {isEditing && (
                <>
                    <EditableRow>
                        <EditRow>
                            <TextFieldWrapper>
                                <TextField
                                    id={field.key}
                                    label={field.label}
                                    value={tempValue}
                                    onChange={(e) => handleOnChange(e)}
                                    description={field.documentation}
                                    required={!field.optional}
                                    placeholder={field.placeholder}
                                    errorMsg={identifierErrorMsg}
                                    onBlur={(e) => handleOnBlur(e)}
                                    onFocus={(e) => handleOnFocus(e)}
                                    autoFocus
                                />
                            </TextFieldWrapper>
                            <ButtonGroup>
                                <StyledButton
                                    appearance="secondary"
                                    onClick={cancelEditing}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </StyledButton>
                                {!isSaving && 
                                    <StyledButton
                                        appearance="primary"
                                        onClick={saveEdit}
                                        disabled={!tempValue || !isIdentifierValid}
                                    >
                                        Save
                                    </StyledButton>
                                }
                                {isSaving && 
                                    <StyledButton
                                        appearance="primary"
                                        disabled={true}
                                    >
                                        <ProgressRing sx={{ width: 14, height: 14, marginRight: 3 }} color={ThemeColors.ON_PRIMARY} /> 
                                        Saving
                                    </StyledButton>
                                }
                            </ButtonGroup>
                        </EditRow>

                        <WarningText variant="body3">
                            Note: Renaming will update all references across the project
                        </WarningText>
                    </EditableRow>
                </>
            )}
        </>
    );
}
