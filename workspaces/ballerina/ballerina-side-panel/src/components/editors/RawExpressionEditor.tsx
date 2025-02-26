/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Control, Controller, FieldValues, UseFormWatch } from "react-hook-form";
import styled from "@emotion/styled";
import {
    CompletionItem,
    ErrorBanner,
    FormExpressionEditor,
    FormExpressionEditorRef,
    RequiredFormInput,
} from "@wso2-enterprise/ui-toolkit";
import { FormField, FormExpressionEditorProps } from "../Form/types";
import { useFormContext } from "../../context";
import { LineRange } from "@wso2-enterprise/ballerina-core";
import { SubPanelView } from "@wso2-enterprise/ballerina-core";
import { SubPanel } from "@wso2-enterprise/ballerina-core";

type ContextAwareRawExpressionEditorProps = {
    field: FormField;
    openSubPanel?: (subPanel: SubPanel) => void;
    subPanelView?: SubPanelView;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
    visualizable?: boolean;
};

type RawExpressionEditorProps = ContextAwareRawExpressionEditorProps &
    FormExpressionEditorProps & {
        control: Control<FieldValues, any>;
        watch: UseFormWatch<any>;
        targetLineRange?: LineRange;
        fileName: string;
    };

type EditorState = {
    isHelperPaneOpen: boolean;
    cursorPosition?: number;
};

export namespace S {
    export const Container = styled.div({
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        fontFamily: "var(--font-family)",
    });

    export const HeaderContainer = styled.div({
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
    });

    export const Header = styled.div({
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    });

    export const LabelContainer = styled.div({
        display: "flex",
        alignItems: "center",
    });

    export const Label = styled.label({
        color: "var(--vscode-editor-foreground)",
        textTransform: "capitalize",
    });

    export const Description = styled.div({
        color: "var(--vscode-list-deemphasizedForeground)",
    });
}

export const ContextAwareRawExpressionEditor = forwardRef<
    FormExpressionEditorRef,
    ContextAwareRawExpressionEditorProps
>((props, ref) => {
    const { form, expressionEditor, targetLineRange, fileName } = useFormContext();

    return (
        <RawExpressionEditor
            ref={ref}
            fileName={fileName}
            {...targetLineRange}
            {...props}
            {...form}
            {...expressionEditor}
        />
    );
});

const useEditorState = (
    field: FormField,
    fieldValue: string,
    getExpressionEditorDiagnostics?: (isRequired: boolean, value: string, key: string) => void
) => {
    const [state, setState] = useState<EditorState>({
        isHelperPaneOpen: false,
    });
    const exprRef = useRef<FormExpressionEditorRef>(null);
    const fetchInitialDiagnostics = useRef<boolean>(true);

    useEffect(() => {
        if (getExpressionEditorDiagnostics && fieldValue !== undefined && fetchInitialDiagnostics.current) {
            fetchInitialDiagnostics.current = false;
            getExpressionEditorDiagnostics(!field.optional || fieldValue !== "", getRawExp(fieldValue), field.key);
        }
    }, [fieldValue, field, getExpressionEditorDiagnostics]);

    return {
        state,
        setState,
        exprRef,
    };
};

const getSanitizedExp = (value: string) => {
    if (value) {
        return value.replace(/`/g, "");
    }
    return value;
};

const getRawExp = (value: string) => {
    if (value && !value.startsWith("`") && !value.endsWith("`")) {
        return `\`${value}\``;
    }
    return value;
};

export const RawExpressionEditor = forwardRef<FormExpressionEditorRef, RawExpressionEditorProps>((props, ref) => {
    const {
        autoFocus,
        control,
        field,
        watch,
        completions,
        triggerCharacters,
        retrieveCompletions,
        extractArgsFromFunction,
        getExpressionEditorDiagnostics,
        getHelperPane,
        onFocus,
        onBlur,
        onCompletionItemSelect,
        onSave,
        onCancel,
        onRemove,
        handleOnFieldFocus,
        helperPaneOrigin,
    } = props;

    const fieldValue = watch(field.key);
    const { state, setState, exprRef } = useEditorState(field, fieldValue, getExpressionEditorDiagnostics);

    useImperativeHandle(ref, () => exprRef.current);

    const handleFocus = async () => {
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector("textarea")?.selectionStart;
        setState(prev => ({ ...prev, cursorPosition }));
        
        const triggerCharacter =
            cursorPosition > 0 ? triggerCharacters.find((char) => fieldValue[cursorPosition - 1] === char) : undefined;
            
        await retrieveCompletions(getRawExp(fieldValue), field.key, cursorPosition, triggerCharacter);
        await onFocus?.();
        handleOnFieldFocus?.(field.key);
    };

    const handleBlur = async () => {
        await onBlur?.();
        setState(prev => ({ ...prev, cursorPosition: undefined }));
    };

    const handleCompletionSelect = async (value: string, item: CompletionItem) => {
        await onCompletionItemSelect?.(value, item.additionalTextEdits);
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector("textarea")?.selectionStart;
        setState(prev => ({ ...prev, cursorPosition }));
    };

    const handleChangeHelperPaneState = (isHelperPaneOpen: boolean) => {
        setState(prev => ({ ...prev, isHelperPaneOpen }));
    };

    const handleGetHelperPane = (value: string, onChange: (value: string, updatedCursorPosition: number) => void) => {
        return getHelperPane?.(exprRef, field.placeholder, value, onChange, handleChangeHelperPaneState);
    };

    const handleExtractArgsFromFunction = async (value: string, cursorPosition: number) => {
        return await extractArgsFromFunction(value, field.key, cursorPosition);
    };

    return (
        <S.Container>
            <S.HeaderContainer>
                <S.Header>
                    <S.LabelContainer>
                        <S.Label>{field.label}</S.Label>
                        {!field.optional && <RequiredFormInput />}
                    </S.LabelContainer>
                    <S.Description>{field.documentation}</S.Description>
                </S.Header>
            </S.HeaderContainer>
            <Controller
                control={control}
                name={field.key}
                rules={{ required: !field.optional && !field.placeholder }}
                render={({ field: { name, value, onChange }, fieldState: { error } }) => (
                    <div>
                        <FormExpressionEditor
                            key={field.key}
                            ref={exprRef}
                            name={name}
                            completions={completions}
                            value={getSanitizedExp(value)}
                            autoFocus={autoFocus}
                            onChange={async (newValue: string, updatedCursorPosition: number) => {
                                const newRawExpValue = getRawExp(newValue);
                                onChange(newRawExpValue);
                                setState(prev => ({ ...prev, cursorPosition: updatedCursorPosition }));

                                if (getExpressionEditorDiagnostics) {
                                    getExpressionEditorDiagnostics(!field.optional || newRawExpValue !== "", newRawExpValue, field.key);
                                }

                                // Check if the current character is a trigger character
                                const triggerCharacter =
                                    updatedCursorPosition > 0
                                        ? triggerCharacters.find((char) => newRawExpValue[updatedCursorPosition - 1] === char)
                                        : undefined;

                                if (triggerCharacter) {
                                    await retrieveCompletions(
                                        newRawExpValue,
                                        field.key,
                                        updatedCursorPosition,
                                        triggerCharacter
                                    );
                                } else {
                                    await retrieveCompletions(newRawExpValue, field.key, updatedCursorPosition);
                                }
                            }}
                            extractArgsFromFunction={handleExtractArgsFromFunction}
                            onCompletionSelect={handleCompletionSelect}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onSave={onSave}
                            onCancel={onCancel}
                            onRemove={onRemove}
                            isHelperPaneOpen={state.isHelperPaneOpen}
                            changeHelperPaneState={handleChangeHelperPaneState}
                            helperPaneOrigin={helperPaneOrigin}
                            getHelperPane={handleGetHelperPane}
                            placeholder={field.placeholder}
                            sx={{ paddingInline: "0" }}
                        />
                        {error && <ErrorBanner errorMsg={error.message.toString()} />}
                    </div>
                )}
            />
        </S.Container>
    );
});
