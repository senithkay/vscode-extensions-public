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
import { LinkButton } from '../LinkButton/LinkButton';
import { Codicon } from '../Codicon/Codicon';
import { Param, Type } from './TypeResolver';

export interface Parameters {
    id: number;
    parameters: Param[];
}

export interface ParamField {
    type: Type;
    label: string;
    defaultValue: string | boolean;
    isRequired?: boolean;
}

export interface ParamConfig {
    param: Parameters[];
    paramFields: ParamField[];
}

export interface ParamManagerProps {
    paramConfigs: ParamConfig;
    onChange?: (parameters: ParamConfig) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

const getNewParam = (fields: ParamField[], index: number): Parameters => {
    const paramInfo: Param[] = [];
    fields.forEach((field, index) => {
        paramInfo.push({
            id: index,
            label: field.label,
            type: field.type,
            value: field.defaultValue,
            isRequired: field.isRequired            
        });
    });
    return {
        id: index,
        parameters: paramInfo
    };
};

export function ParamManager(props: ParamManagerProps) {
    const { paramConfigs , readonly, onChange } = props;
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState(false);


    const onEdit = (param: Parameters) => {
        setEditingSegmentId(param.id);
    };

    const onAddClick = () => {
        const updatedParameters = [...paramConfigs.param];
        setEditingSegmentId(updatedParameters.length);
        const newParams: Parameters = getNewParam(paramConfigs.paramFields, updatedParameters.length);
        updatedParameters.push(newParams);
        onChange({ ...paramConfigs, param: updatedParameters });
        setIsNew(true);
    };

    const onDelete = (param: Parameters) => {
        const updatedParameters = [...paramConfigs.param];
        const indexToRemove = param.id;
        if (indexToRemove >= 0 && indexToRemove < updatedParameters.length) {
            updatedParameters.splice(indexToRemove, 1);
        }
        const reArrangedParameters = updatedParameters.map((item, index) => ({
            ...item,
            id: index
        }));
        onChange({ ...paramConfigs, param: reArrangedParameters });
    };

    const onChangeParam = (paramConfig: Parameters) => {
        const updatedParameters = [...paramConfigs.param];
        const index = updatedParameters.findIndex(param => param.id === paramConfig.id);
        if (index !== -1) {
            updatedParameters[index] = paramConfig;
        }
        onChange({ ...paramConfigs, param: updatedParameters });
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

    const paramComponents: React.ReactElement[] = [];
    paramConfigs?.param
        .forEach((param: Parameters, index) => {
            if (editingSegmentId === index) {
                paramComponents.push(
                    <ParamEditor
                        parameters={param}
                        isTypeReadOnly={false}
                        onSave={onSaveParam}
                        onChange={onChangeParam}
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
