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
import { useFormContext } from '../../context';

export interface ParamProps {
    parameter: Parameter;
    paramFields: FormField[];
    onSave: (param: Parameter) => void;
    onCancelEdit: (param?: Parameter) => void;
}

export function ParamEditor(props: ParamProps) {
    const { parameter, paramFields, onSave, onCancelEdit } = props;
    const { expressionEditor: { completions, retrieveCompletions, retrieveVisibleTypes, getExpressionDiagnostics, onCancel } } = useFormContext();

    const [fields, setFields] = useState<FormField[]>(paramFields);

    const handleOnSave = (data: FormValues) => {
        setFields([]);
        parameter.formValues = data;
        onSave(parameter);
    }

    return (
        <EditorContainer>
            <Form
                formFields={fields}
                onSubmit={handleOnSave}
                onCancelForm={() => onCancelEdit(parameter)}
                expressionEditor={{
                    completions,
                    onCancel,
                    retrieveCompletions,
                    retrieveVisibleTypes,
                    getExpressionDiagnostics
                }}
            />
        </EditorContainer >
    );
}
