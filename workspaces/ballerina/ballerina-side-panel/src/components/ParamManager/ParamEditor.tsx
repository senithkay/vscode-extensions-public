/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { EditorContainer, EditorContent } from './styles';
import { Parameter } from './ParamManager';
import Form, { FormProps } from '../Form';
import { FormField, FormValues } from '../Form/types';
import { CompletionItem } from '@wso2-enterprise/ui-toolkit';

export interface ParamProps {
    parameter: Parameter;
    paramFields: FormProps;
    isTypeReadOnly?: boolean;
    onSave?: (param: Parameter) => void;
    onCancel?: (param?: Parameter) => void;
}

export function ParamEditor(props: ParamProps) {
    const { parameter, paramFields, onSave, onCancel } = props;

    const [fields, setFields] = useState<FormField[]>(paramFields.formFields);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);

    // <------------- Expression Editor Util functions list start --------------->
    const handleGetVisibleTypes = async (value: string, cursorPosition: number) => {
        const { visibleTypes, filteredTypes } = await paramFields.expressionEditor.retrieveVisibleTypes(value, cursorPosition) as any;
        setTypes(visibleTypes);
        setFilteredTypes(filteredTypes);
    };

    const handleCompletionSelect = async () => {
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorCancel = () => {
        setFilteredTypes([]);
        setTypes([]);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };
    // <------------- Expression Editor Util functions list end --------------->


    const handleOnSave = (data: FormValues) => {
        setFields([]);
        parameter.formValues = data;
        console.log("paramFields", paramFields);
        onSave(parameter);
    }

    fields.forEach(field => {
        field.value = parameter.formValues[field.key];
    })

    return (
        <EditorContainer>
            <Form
                {...paramFields}
                expressionEditor={
                    {
                        completions: filteredTypes,
                        retrieveVisibleTypes: handleGetVisibleTypes,
                        onCompletionSelect: handleCompletionSelect,
                        onCancel: handleExpressionEditorCancel,
                        onBlur: handleExpressionEditorBlur
                    }
                }
                formFields={fields}
                onSubmit={handleOnSave}
            />
        </EditorContainer >
    );
}
