/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LineRange } from '@wso2-enterprise/ballerina-core';
import { CompletionItem } from '@wso2-enterprise/ui-toolkit';
import React, { createContext, FC, useContext } from 'react';
import { 
    Control,
    FieldValues, 
    UseFormWatch, 
    UseFormRegister, 
    UseFormSetValue, 
    UseFormUnregister, 
    UseFormSetError,
    UseFormClearErrors,
} from 'react-hook-form';

export interface FormContext {
    form: {
        control: Control<FieldValues, any>;
        setValue: UseFormSetValue<FieldValues>;
        watch: UseFormWatch<any>;
        register: UseFormRegister<FieldValues>;
        unregister: UseFormUnregister<FieldValues>;
        setError: UseFormSetError<FieldValues>;
        clearErrors: UseFormClearErrors<FieldValues>;
    };
    expressionEditor?: {
        completions: CompletionItem[];
        triggerCharacters?: readonly string[];
        retrieveCompletions?: (
            value: string,
            offset: number,
            triggerCharacter?: string,
            onlyVariables?: boolean
        ) => Promise<void>;
        retrieveVisibleTypes?: (value: string, cursorPosition: number) => Promise<void>;
        extractArgsFromFunction?: (value: string, cursorPosition: number) => Promise<{
            label: string;
            args: string[];
            currentArgIndex: number;
        }>;
        getExpressionDiagnostics?: (
            expression: string,
            allowEmpty: boolean,
            key: string,
            setError: UseFormSetError<FieldValues>,
            clearErrors: UseFormClearErrors<FieldValues>
        ) => Promise<void>;
        onFocus?: () => void | Promise<void>;
        onBlur?: () => void | Promise<void>;
        onCompletionSelect?: (value: string) => void | Promise<void>;
        onSave?: (value: string) => void | Promise<void>;
        onCancel: () => void;
    };
    targetLineRange: LineRange;
    fileName: string;
    typeFieldValue?: string; // If there is a type field in the form
}

const defaultState: any = {};
export const Context = createContext<FormContext>(defaultState);

export const Provider: FC<FormContext> = (props) => {
    const { children, ...restProps } = props;

    return <Context.Provider value={restProps}>{children}</Context.Provider>;
};

export const useFormContext = () => useContext(Context);
