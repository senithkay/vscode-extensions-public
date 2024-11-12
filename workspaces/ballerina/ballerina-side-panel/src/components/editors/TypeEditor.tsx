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
    ExpressionBar,
    ExpressionBarRef,
    RequiredFormInput,
    Typography
} from "@wso2-enterprise/ui-toolkit";
import { FormField } from "../Form/types";
import { useFormContext } from "../../context";
import { Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {S} from "../editors/ExpressionEditor";
import { sanitizeType } from "./utils";

interface TypeEditorProps {
    field: FormField;
    openRecordEditor: (open: boolean) => void;
    handleOnFieldFocus?: (key: string) => void;
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
    const { field, openRecordEditor, handleOnFieldFocus, autoFocus } = props;
    const { form, expressionEditor } = useFormContext();
    const { control } = form;
    const {
        completions,
        retrieveVisibleTypes,
        onFocus,
        onBlur,
        onCompletionSelect,
        onSave,
        onCancel,
    } = expressionEditor;

    const exprRef = useRef<ExpressionBarRef>(null);
    const cursorPositionRef = useRef<number | undefined>(undefined);
    const [showDefaultCompletion, setShowDefaultCompletion] = useState<boolean>(false);
    const [focused, setFocused] = useState<boolean>(false);

    // Use to disable the expression editor on save and completion selection
    const useTransaction = (fn: (...args: any[]) => Promise<any>) => {
        return useMutation({
            mutationFn: fn,
            networkMode: 'always',
        });
    };

    const handleFocus = async (value: string) => {
        setFocused(true);
        // Trigger actions on focus
        await onFocus?.();
        await retrieveVisibleTypes(value, value.length);
        setShowDefaultCompletion(true);
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
        await onCompletionSelect?.(value);

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
                rules={{ required: !field.optional && !field.placeholder }}
                render={({ field: { name, value, onChange }, fieldState: { error } }) => (
                    <div>
                        <ExpressionBar
                            key={field.key}
                            ref={exprRef}
                            name={name}
                            completions={completions}
                            showDefaultCompletion={showDefaultCompletion}
                            getDefaultCompletion={getDefaultCompletion}
                            value={value}
                            onChange={async (value: string, updatedCursorPosition: number) => {
                                onChange(value);
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
                            useTransaction={useTransaction}
                            shouldDisableOnSave={false}
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
