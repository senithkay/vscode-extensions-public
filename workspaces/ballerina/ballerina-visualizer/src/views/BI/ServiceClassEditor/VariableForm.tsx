/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from 'react';
import { FieldType, LineRange, Type } from '@wso2-enterprise/ballerina-core';
import { FormGeneratorNew } from '../Forms/FormGeneratorNew';
import { FormField, FormValues } from '@wso2-enterprise/ballerina-side-panel';

interface VariableFormProps {
    model: FieldType;
    filePath: string;
    lineRange: LineRange;
    onSave: (model: FieldType) => void;
    onClose: () => void;
}

export function VariableForm(props: VariableFormProps) {
    const { model, onSave, onClose, filePath, lineRange } = props;
    const [fields, setFields] = useState<FormField[]>([]);

    // Initialize form fields
    useEffect(() => {
        const initialFields = [
            {
                key: 'name',
                label: model.name.metadata?.label || 'Variable Name',
                type: 'IDENTIFIER',
                optional: model.name.optional,
                editable: model.name.editable,
                advanced: model.name.advanced,
                enabled: model.name.enabled,
                documentation: model.name.metadata?.description,
                value: model?.name.value || '',
                valueTypeConstraint: model.name?.valueTypeConstraint || '',
                lineRange: model?.name?.codedata?.lineRange
            },
            {
                key: 'returnType',
                label: model.type.metadata?.label || 'Type',
                type: 'TYPE',
                optional: model.type.optional,
                editable: model.type.editable,
                advanced: model.type.advanced,
                enabled: model.type.enabled,
                documentation: model.type.metadata?.description,
                value: model?.type.value || '',
                valueTypeConstraint: model.type?.valueTypeConstraint || ''
            },
            {
                key: 'expression',
                label: 'Default Value',
                type: 'EXPRESSION',
                optional: true, // TODO: need to fix for LS
                editable: model.defaultValue?.editable || false,
                advanced: model.defaultValue?.advanced || false,
                enabled: model.defaultValue?.enabled ?? true,
                documentation: model.defaultValue?.metadata?.description,
                value: model?.defaultValue?.value || '',
                valueTypeConstraint: model.defaultValue?.valueTypeConstraint || ''
            }
        ];
        setFields(initialFields);
    }, [model]);

    const handleVariableSave = (data: FormValues) => {
        const updatedVariable: FieldType = {
            ...model,
            name: { ...model.name, value: data.name },
            type: { ...model.type, value: data.returnType },
            defaultValue: { ...model.defaultValue, value: data.expression }
        };
        onSave(updatedVariable);
    };

    return (
        <>
            {fields.length > 0 && (
                <FormGeneratorNew
                    fileName={filePath}
                    targetLineRange={lineRange}
                    fields={fields}
                    onSubmit={handleVariableSave}
                    onBack={onClose}
                    submitText="Save"
                    isGraphql={true}
                />
            )}
        </>
    );
}
