/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { FunctionModel, LineRange, ParameterModel } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import FormGeneratorNew from '../BI/Forms/FormGeneratorNew';
import { FormField, FormValues, Parameter } from '@wso2-enterprise/ballerina-side-panel';

interface OperationFormProps {
    model: FunctionModel;
    filePath: string;
    lineRange: LineRange;
    onSave: (model: FunctionModel) => void;
    onClose: () => void;
}

export function OperationForm(props: OperationFormProps) {
    console.log("Operation Form Props: ", props.model);
    const { model, onSave, onClose, filePath, lineRange } = props;

    // Helper function to modify and set the visual information
    const handleParamChange = (param: Parameter) => {
        const name = `${param.formValues['variable']}`;
        const type = `${param.formValues['type']}`;
        const defaultValue = Object.keys(param.formValues).indexOf('defaultable') > -1 && `${param.formValues['defaultable']}`;
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
    console.log("Schema Parameters:", model.schema.parameters);
    const paramFields: FormField[] = [
        {
            key: `variable`,
            label: 'Name',
            type: 'string',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
            valueTypeConstraint: ""
        },
        {
            key: `type`,
            label: 'Type',
            type: 'TYPE',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
            valueTypeConstraint: ""
        },
        {
            key: `defaultable`,
            label: 'Default Value',
            type: 'string',
            optional: true,
            advanced: true,
            editable: true,
            documentation: '',
            value: '',
            valueTypeConstraint: ""
        }
    ];

    const formFields: FormField[] = [
        {
            key: 'name',
            label: model.name.metadata?.label || 'Operation Name',
            type: 'IDENTIFIER',
            optional: false,
            editable: model.name.editable,
            advanced: model.name.advanced,
            documentation: model.name.metadata?.description || '',
            value: model.name.value || '',
            valueTypeConstraint: model.name.valueTypeConstraint || ''
        },
        {
            key: 'params',
            label: 'Parameters',
            type: 'PARAM_MANAGER',
            optional: false,
            editable: true,
            advanced: false,
            documentation: '',
            value: '',
            paramManagerProps: {
                paramValues: model.parameters.map((param: any, index: number) => ({
                    id: index,
                    key: param.name.value,
                    value: `${param.type.value} ${param.name.value}${param.defaultValue?.value ? ` = ${param.defaultValue.value}` : ''}`,
                    formValues: {
                        variable: param.name.value,
                        type: param.type.value,
                        defaultable: param.defaultValue?.value || ''
                    },
                    icon: 'symbol-variable'
                })),
                formFields: paramFields,
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
            value: model.returnType.value || '',
            valueTypeConstraint: model.returnType.valueTypeConstraint || ''
        }
    ];

    const getFunctionParametersList = (params: Parameter[]) => {
        const paramList: ParameterModel[] = [];
        params.forEach(param => {
            paramList.push({
                kind: 'REQUIRED',
                enabled: true,
                editable: true,
                advanced: false,
                optional: false,
                type: {
                    value: param.formValues['type'] as string,
                    valueType: 'TYPE',
                    isType: true,
                    optional: false,
                    advanced: false,
                    addNewButton: false
                },
                name: {
                    value: param.formValues['variable'] as string,
                    valueType: 'IDENTIFIER',
                    isType: false,
                    optional: false,
                    advanced: false,
                    addNewButton: false
                },
                defaultValue: {
                    value: param.formValues['defaultable'] as string,
                    valueType: 'string',
                    isType: false,
                    optional: false,
                    advanced: false,
                    addNewButton: false
                }
            });
        })
        return paramList;
    }

    const handleFunctionCreate = async (data: FormValues) => {
        console.log("Function Form Data: ", data)
        const name = data['name'];
        const returnType = data['returnType'];
        const params = data['params'];
        const paramList = params ? getFunctionParametersList(params) : [];
        // map the data to the function model
        const newFunctionModel = {...model};
        newFunctionModel.name.value = name;
        newFunctionModel.returnType.value = returnType;
        newFunctionModel.parameters = paramList;
        console.log("New Function Model on Save: ", newFunctionModel);
        onSave(newFunctionModel);
    };

    return (
        <FormGeneratorNew
            fileName={filePath}
            targetLineRange={lineRange}
            fields={formFields}
            onSubmit={handleFunctionCreate}
            onBack={onClose}
            submitText="Save"
        />
    );
} 
