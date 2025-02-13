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

import { EditorContainer } from './styles';
import { Parameter } from './ParamManager';
import Form from '../Form';
import { FormField, FormValues } from '../Form/types';
import { useFormContext } from '../../context';

export interface ParamProps {
    parameter: Parameter;
    paramFields: FormField[];
    onSave: (param: Parameter) => void;
    onCancelEdit: (param?: Parameter) => void;
    openRecordEditor?: (open: boolean) => void;
}

export function ParamEditor(props: ParamProps) {
    const { parameter, paramFields, onSave, onCancelEdit, openRecordEditor } = props;
    const { expressionEditor } = useFormContext();

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
                openRecordEditor={openRecordEditor}
                onSubmit={handleOnSave}
                onCancelForm={() => onCancelEdit(parameter)}
                expressionEditor={expressionEditor}
                submitText={"Add"}
            />
        </EditorContainer >
    );
}
