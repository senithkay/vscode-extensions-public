/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';

import styled from '@emotion/styled';
import { ParamEditor } from './ParamEditor';
import { ParamItem } from './ParamItem';
import { Param } from './TypeResolver';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ExpressionFieldValue } from '../ExpressionField/ExpressionInput';
import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';
import { FilterType } from '../Keylookup/Keylookup';

export interface ParamValue {
    value: string | boolean | ExpressionFieldValue | ParamConfig;
    isEnabled?: boolean;
}

export interface ParamValueConfig {
    id: number;
    paramValues: ParamValue[];
    key: string;
    value: string;
    icon?: string | React.ReactElement; // Icon for the parameter. Icon name or React element should be passed
}
export interface Parameters {
    id: number;
    parameters: Param[];
    key: string;
    value: string;
    icon?: string | React.ReactElement; // Icon for the parameter. Icon name or React element should be passed
}

export interface ConditionParams {
    [key: number]: string;
}

export interface EnableCondition {
    [key: string]: ConditionParams[];
}

export interface ParamField {
    id?: number;
    type: "TextField" | "Dropdown" | "Checkbox" | "TextArea" | "AutoComplete" | "KeyLookup" | "ParamManager";
    label?: string;
    defaultValue?: string | boolean;
    isRequired?: boolean;
    values?: string[]; // For Dropdown and AutoComplete
    nullable?: boolean;
    allowItemCreate?: boolean;
    noItemsFoundMessage?: string;
    enableCondition?: (ConditionParams | string)[];
    openExpressionEditor?: () => void; // For ExpressionField
    canChange?: boolean; // For ExpressionField
    filter?: (value: string) => boolean; // For KeyLookup
    filterType?: FilterType; // For KeyLookup
    paramManager?: ParamManagerProps; // For nested ParamManager
}

export interface ParamConfig {
    paramValues: ParamValueConfig[];
    paramFields: ParamField[];
}

export interface ParamManagerProps {
    paramConfigs: ParamConfig;
    onChange?: (parameters: ParamConfig) => void,
    readonly?: boolean;
    addParamText?: string;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export function convertToObject(input: (ConditionParams | string)[]): EnableCondition {
    if (!input) {
        return null;
    }
    const result: EnableCondition = {};
    let currentKey: string | null = null;
    let currentValues: ConditionParams[] = [];

    for (const item of input) {
        if (typeof item === 'string') {
            if (currentValues.length > 0) {
                result[currentKey!] = currentValues;
                currentValues = [];
            }
            currentKey = item;
        } else {
            if (!currentKey) {
                currentKey = null;
            }
            currentValues.push(item);
        }
    }
    if (currentValues.length > 0) {
        result[currentKey!] = currentValues;
    }
    return result;
}

// This function is used to check the field is enabled or not on the eneble condition
export function isFieldEnabled(params: Param[], enableCondition?: EnableCondition): boolean {
    let paramEnabled = false;
    enableCondition["OR"]?.forEach(item => {
        params.forEach(par => {
            if (item[par.id]) {
                const satisfiedConditionValue = item[par.id];
                // if one of the condition is satisfied, then the param is enabled
                if (par.value === satisfiedConditionValue) {
                    paramEnabled = true;
                }
            }
        });
    });
    enableCondition["AND"]?.forEach(item => {
        paramEnabled = !paramEnabled ? false : paramEnabled;
        for (const par of params) {
            if (item[par.id]) {
                const satisfiedConditionValue = item[par.id];
                // if all of the condition is not satisfied, then the param is enabled
                paramEnabled = (par.value === satisfiedConditionValue);
                if (!paramEnabled) {
                    break;
                }
            }
        }
    });
    enableCondition["NOT"]?.forEach(item => {
        for (const par of params) {
            if (item[par.id]) {
                const satisfiedConditionValue = item[par.id];
                // if the condition is not satisfied, then the param is enabled
                paramEnabled = !(par.value === satisfiedConditionValue);
                if (!paramEnabled) {
                    break;
                }
            }
        }
    });
    enableCondition["null"]?.forEach(item => {
        params.forEach(par => {
            if (item[par.id]) {
                const satisfiedConditionValue = item[par.id];
                // if the condition is not satisfied, then the param is enabled
                paramEnabled = (par.value === satisfiedConditionValue);
            }
        });
    });
    return paramEnabled;
}

const getNewParam = (fields: ParamField[], index: number): Parameters => {
    const paramInfo: Param[] = [];
    fields.forEach((field, index) => {
        paramInfo.push({
            id: index,
            label: field.label,
            type: field.type,
            value: field.defaultValue || field?.paramManager?.paramConfigs,
            values: field.values,
            isRequired: field.isRequired,
            enableCondition: field.enableCondition ? convertToObject(field.enableCondition) : undefined
        });
    });
    // Modify the fields to set field is enabled or not
    const modifiedParamInfo = paramInfo.map(param => {
        if (param.enableCondition) {
            const paramEnabled = isFieldEnabled(paramInfo, param.enableCondition);
            param.isEnabled = paramEnabled;
        }
        return param;
    });
    return {
        id: index,
        parameters: modifiedParamInfo,
        key: "",
        value: ""
    };
};

export function findFieldFromParam(field: ParamField[], value: Param): ParamField {
    return field?.find(item => item.label === value?.label) || null;
}

export const getParamFieldLabelFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.label;
}

const getParamFieldTypeFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.type;
}

const getParamFieldIsRequiredFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.isRequired;
}

const getParamFieldValuesFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.values;
}

const getParamFieldNullableFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.nullable;
}

const getParamFieldNoItemsFoundMessageFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.noItemsFoundMessage;
}

const getParamFieldAllowItemCreateFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.allowItemCreate;
}

const getParamFieldEnableConditionFromParamId = (paramFields: ParamField[], paramId: number): EnableCondition => {
    const paramField = paramFields[paramId];
    const enableCondition = convertToObject(paramField.enableCondition);
    return enableCondition === null ? undefined : enableCondition;
}

const getParamFieldOpenExpressionEditorFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.openExpressionEditor;
}

const getPramFieldCanChangeFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.canChange;
}

const getPramFilterFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.filter;
}

const getPramFilterTypeFromParamId = (paramFields: ParamField[], paramId: number) => {
    const paramField = paramFields[paramId];
    return paramField?.filterType;
}

export function ParamManager(props: ParamManagerProps) {
    const { paramConfigs, readonly, addParamText = "Add Parameter", onChange } = props;
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState(false);

    const onEdit = (param: Parameters) => {
        setEditingSegmentId(param.id);
    };

    const paramValues: Parameters[] = paramConfigs.paramValues.map(paramValue => {
        const params: Param[] = paramValue.paramValues.map((paramVal, id) => {
            const param: Param = {
                id: id,
                label: getParamFieldLabelFromParamId(paramConfigs.paramFields, id),
                type: getParamFieldTypeFromParamId(paramConfigs.paramFields, id),
                value: paramVal.value,
                isEnabled: paramVal.isEnabled,
                isRequired: getParamFieldIsRequiredFromParamId(paramConfigs.paramFields, id),
                values: getParamFieldValuesFromParamId(paramConfigs.paramFields, id),
                enableCondition: getParamFieldEnableConditionFromParamId(paramConfigs.paramFields, id),
                openExpressionEditor: getParamFieldOpenExpressionEditorFromParamId(paramConfigs.paramFields, id),
                canChange: getPramFieldCanChangeFromParamId(paramConfigs.paramFields, id),
                nullable: getParamFieldNullableFromParamId(paramConfigs.paramFields, id),
                allowItemCreate: getParamFieldAllowItemCreateFromParamId(paramConfigs.paramFields, id),
                noItemsFoundMessage: getParamFieldNoItemsFoundMessageFromParamId(paramConfigs.paramFields, id),
                filter: getPramFilterFromParamId(paramConfigs.paramFields, id),
                filterType: getPramFilterTypeFromParamId(paramConfigs.paramFields, id)
            };
            return param;
        });
        return { ...paramValue, parameters: params };
    });

    const onAddClick = () => {
        const updatedParameters: ParamValueConfig[] = [...paramConfigs.paramValues];
        setEditingSegmentId(updatedParameters.length);
        const newParams: Parameters = getNewParam(paramConfigs.paramFields, updatedParameters.length);
        const paramValues = newParams.parameters.map(param => {
            return {
                value: param.value,
                isEnabled: param.isEnabled
            };
        });
        updatedParameters.push({
            ...newParams,
            paramValues: paramValues
        });
        onChange({ ...paramConfigs, paramValues: updatedParameters });
        setIsNew(true);
    };

    const onDelete = (param: Parameters) => {
        const updatedParameters = [...paramConfigs.paramValues];
        const indexToRemove = param.id;
        if (indexToRemove >= 0 && indexToRemove < updatedParameters.length) {
            updatedParameters.splice(indexToRemove, 1);
        }
        const reArrangedParameters = updatedParameters.map((item, index) => ({
            ...item,
            id: index
        }));
        onChange({ ...paramConfigs, paramValues: reArrangedParameters });
    };

    const onChangeParam = (paramConfig: Parameters) => {
        const updatedParameters: ParamValueConfig[] = [...paramConfigs.paramValues];
        const index = updatedParameters.findIndex(param => param.id === paramConfig.id);
        if (index !== -1) {
            const paramValues = paramConfig.parameters.map(param => {
                return {
                    value: param.value,
                    isEnabled: param.isEnabled
                };
            });
            updatedParameters[index] = {
                ...paramConfig,
                paramValues: paramValues
            };
        }
        onChange({ ...paramConfigs, paramValues: updatedParameters });
    };

    const onSaveParam = (paramConfig: Parameters) => {
        onChangeParam(paramConfig);
        setEditingSegmentId(-1);
        setIsNew(false);
    };

    const onParamEditCancel = (param: Parameters) => {
        setEditingSegmentId(-1);
        if (isNew) {
            onDelete(param);
        }
        setIsNew(false);
    };

    // Function to handle reordering of items after moving
    const moveItem = (dragIndex: number, hoverIndex: number) => {
        const updatedParameters = [...paramConfigs.paramValues];
        const draggedItem = updatedParameters[dragIndex];
        updatedParameters.splice(dragIndex, 1);
        updatedParameters.splice(hoverIndex, 0, draggedItem);
        const reArrangedParameters = updatedParameters.map((item, index) => ({
            ...item,
            id: index
        }));
        onChange({ ...paramConfigs, paramValues: reArrangedParameters });
    };

    const paramComponents: React.ReactElement[] = [];
    paramValues
        .forEach((param, index) => {
            if (editingSegmentId === index) {
                paramComponents.push(
                    <ParamEditor
                        parameters={param}
                        paramFields={paramConfigs.paramFields}
                        isTypeReadOnly={false}
                        onSave={onSaveParam}
                        onChange={onChangeParam}
                        onCancel={onParamEditCancel}
                    />
                )
            } else if ((editingSegmentId !== index)) {
                paramComponents.push(
                    <DndProvider backend={HTML5Backend}>
                        <ParamItem
                            moveItem={moveItem}
                            key={param.id}
                            index={index}
                            params={param}
                            readonly={editingSegmentId !== -1 || readonly}
                            onDelete={onDelete}
                            onEditClick={onEdit}
                        />
                    </DndProvider>
                );
            }
        });

    return (
        <div>
            {paramComponents}
            {(editingSegmentId === -1) && (
                <AddButtonWrapper>
                    <LinkButton sx={readonly && { color: "var(--vscode-badge-background)" }} onClick={!readonly && onAddClick} >
                        <Codicon name="add" />
                        <>{addParamText}</>
                    </LinkButton>
                </AddButtonWrapper>
            )}
        </div>
    );
}
