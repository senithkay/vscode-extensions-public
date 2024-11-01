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
import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';
import { FormProps } from '../Form';
import { FormField, FormValues } from '../Form/types';

export interface Parameter {
    id: number;
    formValues: FormValues;
    key: string;
    value: string;
    icon: string;
}


export interface ParamConfig {
    paramValues: Parameter[];
    formConfig: FormProps;
}

export interface ParamManagerProps {
    paramConfigs: ParamConfig;
    onChange?: (parameters: ParamConfig) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;


export function ParamManager(props: ParamManagerProps) {
    const { paramConfigs, readonly, onChange } = props;
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState(false);

    const onEdit = (param: Parameter) => {
        setEditingSegmentId(param.id);
    };

    const getNewParam = (fields: FormField[], index: number): Parameter => {
        const paramInfo: FormValues = {};
        fields.forEach((field) => {
            paramInfo[field.key] = "";
        });
        return {
            id: index,
            formValues: paramInfo,
            key: "",
            value: "",
            icon: ""
        };
    };

    const onAddClick = () => {
        const updatedParameters = [...paramConfigs.paramValues];
        setEditingSegmentId(updatedParameters.length);
        const newParams: Parameter = getNewParam(paramConfigs.formConfig.formFields, updatedParameters.length);
        updatedParameters.push(newParams);
        onChange({ ...paramConfigs, paramValues: updatedParameters });
        setIsNew(true);
    };

    const onDelete = (param: Parameter) => {
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

    const onChangeParam = (updatedParams: Parameter) => {
        const updatedParameters = [...paramConfigs.paramValues];
        const index = updatedParameters.findIndex(param => param.id === updatedParams.id);
        if (index !== -1) {
            updatedParameters[index] = updatedParams;
        }
        onChange({ ...paramConfigs, paramValues: updatedParameters });
    };

    const onSaveParam = (paramConfig: Parameter) => {
        onChangeParam(paramConfig);
        setEditingSegmentId(-1);
        setIsNew(false);
    };

    const onParamEditCancel = (param: Parameter) => {
        setEditingSegmentId(-1);
        if (isNew) {
            onDelete(param);
        }
        setIsNew(false);
    };

    const paramComponents: React.ReactElement[] = [];
    paramConfigs?.paramValues
        .forEach((param, index) => {
            if (editingSegmentId === index) {
                paramComponents.push(
                    <ParamEditor
                        parameter={param}
                        paramFields={paramConfigs.formConfig}
                        isTypeReadOnly={false}
                        onSave={onSaveParam}
                        onCancel={onParamEditCancel}
                    />
                )
            } else if ((editingSegmentId !== index)) {
                paramComponents.push(
                    <ParamItem
                        params={param}
                        readonly={editingSegmentId !== -1 || readonly}
                        onDelete={onDelete}
                        onEditClick={onEdit}
                    />
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
                        <>Add Parameter</>
                    </LinkButton>
                </AddButtonWrapper>
            )}
        </div>
    );
}
