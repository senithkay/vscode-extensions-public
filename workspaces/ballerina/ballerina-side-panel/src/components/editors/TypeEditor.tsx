/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from "react";
import { Codicon, ExpressionBar, ExpressionBarRef, RequiredFormInput, ThemeColors, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

import { FormField } from "../Form/types";
import { useFormContext } from "../../context";
import { Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { TIcon } from "@wso2-enterprise/ballerina-core";
import { Colors } from "../../resources/constants";

namespace S {
    export const Container = styled.div({
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontFamily: 'var(--font-family)',
    });

    export const LabelContainer = styled.div({
        display: 'flex',
        alignItems: 'center',
    });

    export const Label = styled.label({
        color: 'var(--vscode-editor-foreground)',
        textTransform: 'capitalize'
    });

    export const Description = styled.div({
        color: 'var(--vscode-list-deemphasizedForeground)',
    });

    export const Error = styled.div({
        color: Colors.ERROR,
    });

    export const TitleContainer = styled.div`
        display: flex;
        align-items: center;
        gap: 8px;
    `;
}

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

const getExpressionBarIcon = () => <TIcon sx={{ stroke: ThemeColors.PRIMARY }} />;

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

    // Use to disable the expression editor on save and completion selection
    const useTransaction = (fn: (...args: any[]) => Promise<any>) => {
        return useMutation({
            mutationFn: fn,
            networkMode: 'always',
        });
    };

    const handleFocus = async (value: string) => {
        // Trigger actions on focus
        await onFocus?.();
        setShowDefaultCompletion(true);
        await retrieveVisibleTypes(value, value.length);
        handleOnFieldFocus?.(field.key);
    };

    const handleBlur = async () => {
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
    };

    const handleCancel = () => {
        onCancel?.();
        setShowDefaultCompletion(false);
    }

    const handleDefaultCompletionSelect = () => {
        openRecordEditor(true);
        handleCancel();
    }

    const errorMsg = field.diagnostics?.map((diagnostic) => diagnostic.message).join("\n");

    return (
        <S.Container>
            <S.LabelContainer>
                <S.Label>{field.label}</S.Label>
                {!field.optional && <RequiredFormInput />}
            </S.LabelContainer>
            <S.Description>{field.documentation}</S.Description>
            <Controller
                control={control}
                name={field.key}
                defaultValue={field.value}
                rules={{ required: !field.optional && !field.placeholder }}
                render={({ field: { name, value, onChange } }) => (
                    <ExpressionBar
                        key={field.key}
                        ref={exprRef}
                        name={name}
                        completions={completions}
                        getExpressionBarIcon={getExpressionBarIcon}
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
                )}
            />
            {errorMsg && <S.Error>{errorMsg}</S.Error>}
        </S.Container>
    );
}
