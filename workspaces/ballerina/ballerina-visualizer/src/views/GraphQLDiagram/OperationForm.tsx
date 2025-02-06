/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from 'react';
import { FunctionModel, LineRange, ParameterModel, PropertyModel, ConfigProperties, Type } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { FormGeneratorNew } from '../BI/Forms/FormGeneratorNew';
import { FormField, FormValues, Parameter } from '@wso2-enterprise/ballerina-side-panel';

interface OperationFormProps {
    model: FunctionModel;
    filePath: string;
    lineRange: LineRange;
    onSave: (model: FunctionModel) => void;
    onClose: () => void;
}

export function OperationForm(props: OperationFormProps) {
    console.log("OperationForm props: ", props);
    const { model, onSave, onClose, filePath, lineRange } = props;
    const [fields, setFields] = useState<FormField[]>([]);
    const [formValues, setFormValues] = useState<FormValues>({
        name: model.name.value || '',
        parameters: model.parameters.map((param, index) => convertParameterToParamValue(param, index)),
        returnType: model.returnType.value || ''
    });

    console.log("====Form Values==== ", formValues);

    const handleParamChange = (param: Parameter) => {
        const name = `${param.formValues['variable']}`;
        const type = `${param.formValues['type']}`;
        const hasDefaultValue = Object.keys(param.formValues).includes('defaultable') && 
            param.formValues['defaultable'] !== undefined && 
            param.formValues['defaultable'] !== '';
        
        const defaultValue = hasDefaultValue ? `${param.formValues['defaultable']}`.trim() : '';
        let value = `${type} ${name}`;
        if (defaultValue) {
            value += ` = ${defaultValue}`;
        }
        return {
            ...param,
            key: name,
            value: value
        }
    };

    const getFunctionParametersList = (params: Parameter[]) => {
        const paramList: ParameterModel[] = [];
        const paramFields = convertSchemaToFormFields(model.schema);
        
        params.forEach(param => {
            // Find matching field configurations from schema
            const typeField = paramFields.find(field => field.key === 'type');
            const nameField = paramFields.find(field => field.key === 'variable');
            const defaultField = paramFields.find(field => field.key === 'defaultable');
    
            paramList.push({
                kind: 'REQUIRED',
                enabled: typeField?.enabled ?? true,
                editable: typeField?.editable ?? true,
                advanced: typeField?.advanced ?? false,
                optional: typeField?.optional ?? false,
                type: {
                    value: param.formValues['type'] as string,
                    valueType: typeField?.type,
                    isType: true,
                    optional: typeField?.optional,
                    advanced: typeField?.advanced,
                    addNewButton: false,
                    enabled: typeField?.enabled,
                    editable: typeField?.editable,
                },
                name: {
                    value: param.formValues['variable'] as string,
                    valueType: nameField?.type,
                    isType: false,
                    optional: nameField?.optional,
                    advanced: nameField?.advanced,
                    addNewButton: false,
                    enabled: nameField?.enabled,
                    editable: nameField?.editable
                },
                defaultValue: {
                    value: param.formValues['defaultable'],
                    valueType: defaultField?.type || 'string',
                    isType: false,
                    optional: defaultField?.optional,
                    advanced: defaultField?.advanced,
                    addNewButton: false,
                    enabled: defaultField?.enabled,
                    editable: defaultField?.editable
                }
            });
        });
        return paramList;
    }

    // Initialize form fields
    useEffect(() => {
        console.log("Current form values:", formValues);
        const initialFields = [
            {
                key: 'name',
                label: model.name.metadata?.label || 'Operation Name',
                type: 'IDENTIFIER',
                optional: false,
                editable: model.name.editable,
                advanced: model.name.advanced,
                documentation: model.name.metadata?.description || '',
                value: formValues.name,
                valueTypeConstraint: model.name.valueTypeConstraint || ''
            },
            {
                key: 'parameters',
                label: 'Parameters',
                type: 'PARAM_MANAGER',
                optional: true,
                editable: true,
                documentation: '',
                value: formValues.parameters,
                paramManagerProps: {
                    paramValues: Array.isArray(formValues.parameters) ? formValues.parameters : model.parameters.map((param, index) => convertParameterToParamValue(param, index)),
                    formFields: convertSchemaToFormFields(model.schema),
                    handleParameter: handleParamChange
                },
                valueTypeConstraint: ''
            },
            {
                key: 'returnType',
                label: model.returnType.metadata?.label || 'Return Type',
                type: 'TYPE',
                optional: false,
                editable: true,
                advanced: model.returnType.advanced,
                documentation: model.returnType.metadata?.description || '',
                value: formValues.returnType,
                valueTypeConstraint: model.returnType.valueTypeConstraint || ''
            }
        ];
        setFields(initialFields);
    }, [model, formValues]);

    const handleFunctionCreate = (data: FormValues) => {
        console.log("Function create with data:", data);
        setFormValues(data);
        const { name, returnType, parameters: params } = data;
        const paramList = params ? getFunctionParametersList(params) : [];
        const newFunctionModel = {...model};
        newFunctionModel.name.value = name;
        newFunctionModel.returnType.value = returnType;
        newFunctionModel.parameters = paramList;
        onSave(newFunctionModel);
    };

    const handleTypeChange = (type: Type) => {
        console.log("Type change with:", type.name);
        // Preserve all existing form values when updating the type
        setFormValues(prev => ({
            ...prev,
            returnType: type.name
        }));
    };

    return (
        <>
            {fields.length > 0 && (
                <FormGeneratorNew
                    isGraphqlEditor={true}
                    fileName={filePath}
                    targetLineRange={lineRange}
                    fields={fields}
                    onSubmit={handleFunctionCreate}
                    onBack={onClose}
                    submitText="Save"
                    onTypeChange={handleTypeChange}
                />
            )}
        </>
    );
}

export function convertSchemaToFormFields(schema: ConfigProperties): FormField[] {
    const formFields: FormField[] = [];

    // Get the parameter configuration if it exists
    const parameterConfig = schema["parameter"] as ConfigProperties;
    if (parameterConfig) {
        // Iterate over each parameter field in the parameter config
        for (const key in parameterConfig) {
            if (parameterConfig.hasOwnProperty(key)) {
                const parameter = parameterConfig[key];
                if (parameter.metadata && parameter.metadata.label) {
                    const formField = convertParameterToFormField(key, parameter as ParameterModel);
                    console.log("Form Field: ", formField);
                    formFields.push(formField);
                }
            }
        }
    }

    return formFields;
}

export function convertParameterToFormField(key: string, param: ParameterModel): FormField {
    return {
        key: key === "defaultValue" ? "defaultable" : key === "name" ? "variable" : key,
        label: param.metadata?.label,
        type: param.valueType || 'string',
        optional: param.optional || false,
        editable: param.editable || false,
        advanced: key === "defaultValue" ? true : param.advanced,
        documentation: param.metadata?.description || '',
        value: param.value || '',
        valueTypeConstraint: param?.valueTypeConstraint || '',
        enabled: param.enabled || true
    };
}

function convertParameterToParamValue(param: ParameterModel, index: number) {
    return {
        id: index,
        key: param.name.value,
        value: `${param.type.value} ${param.name.value}${param.defaultValue?.value ? ` = ${param.defaultValue.value}` : ''}`,
        formValues: {
            variable: param.name.value,
            type: param.type.value,
            defaultable: param.defaultValue?.value || ''
        },
        icon: 'symbol-variable'
    };
}