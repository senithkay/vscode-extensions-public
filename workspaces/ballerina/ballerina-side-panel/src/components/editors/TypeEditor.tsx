/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from "react";
import {
    Codicon,
    ErrorBanner,
    FormExpressionEditor,
    FormExpressionEditorRef,
    RequiredFormInput,
    Typography
} from "@wso2-enterprise/ui-toolkit";
import { FormField } from "../Form/types";
import { useFormContext } from "../../context";
import { Controller } from "react-hook-form";
import { S } from "./ExpressionEditor";
import { sanitizeType } from "./utils";
import { debounce } from "lodash";

interface TypeEditorProps {
    field: FormField;
    openRecordEditor: (open: boolean) => void;
    handleOnFieldFocus?: (key: string) => void;
    handleOnTypeChange?: () => void;
    autoFocus?: boolean;
}

const getDefaultCompletion = () => (
    <S.TitleContainer>
        <Codicon name="add" />
        <Typography variant="body3" sx={{ fontWeight: 600 }}>
            Add Type
        </Typography>
    </S.TitleContainer>
);

export function TypeEditor(props: TypeEditorProps) {
    const { field, openRecordEditor, handleOnFieldFocus, handleOnTypeChange, autoFocus } = props;
    const { form, expressionEditor } = useFormContext();
    const { control } = form;
    const {
        types,
        retrieveVisibleTypes,
        onFocus,
        onBlur,
        onCompletionItemSelect,
        onSave,
        onCancel,
    } = expressionEditor;

    const exprRef = useRef<FormExpressionEditorRef>(null);
    const cursorPositionRef = useRef<number | undefined>(undefined);
    const [showDefaultCompletion, setShowDefaultCompletion] = useState<boolean>(false);
    const [focused, setFocused] = useState<boolean>(false);

    const handleFocus = async (value: string) => {
        setFocused(true);
        // Trigger actions on focus
        await onFocus?.();
        await retrieveVisibleTypes(value, value.length);
        if (openRecordEditor) {
            setShowDefaultCompletion(true);
        }
        handleOnFieldFocus?.(field.key);
    };

    const handleBlur = async () => {
        setFocused(false);
        // Trigger actions on blur
        await onBlur?.();
        setShowDefaultCompletion(undefined);
        // Clean up memory
        cursorPositionRef.current = undefined;
    };

    const handleCompletionSelect = async (value: string) => {
        // Trigger actions on completion select
        await onCompletionItemSelect?.(value);

        // Set cursor position
        const cursorPosition = exprRef.current?.shadowRoot?.querySelector('textarea')?.selectionStart;
        cursorPositionRef.current = cursorPosition;
        setShowDefaultCompletion(false);
    };

    const handleCancel = () => {
        onCancel?.();
        setShowDefaultCompletion(false);
    }

    const handleDefaultCompletionSelect = () => {
        openRecordEditor(true);
        handleCancel();
    }

    const handleTypeEdit = (value: string) => {
        handleOnTypeChange && handleOnTypeChange();
    };

    const debouncedTypeEdit = debounce(handleTypeEdit, 300);

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
                {field.valueType && <S.Type isVisible={focused} title={field.valueType}>{sanitizeType(field.valueType)}</S.Type>}
            </S.HeaderContainer>
            <Controller
                control={control}
                name={field.key}
                defaultValue={field.value}
                rules={{
                    required: {
                        value: !field.optional && !field.placeholder,
                        message: `${field.label} is required`
                    }
                }}
                render={({ field: { name, value, onChange }, fieldState: { error } }) => (
                    <div>
                        <FormExpressionEditor
                            key={field.key}
                            ref={exprRef}
                            name={name}
                            completions={types}
                            showDefaultCompletion={showDefaultCompletion}
                            getDefaultCompletion={getDefaultCompletion}
                            value={value}
                            onChange={async (value: string, updatedCursorPosition: number) => {
                                onChange(value);
                                debouncedTypeEdit(value);
                                cursorPositionRef.current = updatedCursorPosition;

                                // Retrieve visible types
                                await retrieveVisibleTypes(value, updatedCursorPosition);
                            }}
                            onCompletionSelect={handleCompletionSelect}
                            onDefaultCompletionSelect={handleDefaultCompletionSelect}
                            onFocus={() => handleFocus(value)}
                            onBlur={handleBlur}
                            onSave={onSave}
                            onCancel={handleCancel}
                            placeholder={field.placeholder}
                            autoFocus={autoFocus}
                            sx={{ paddingInline: '0' }}
                        />
                        {error && <ErrorBanner errorMsg={error.message.toString()} />}
                    </div>
                )}
            />
        </S.Container>
    );
}
