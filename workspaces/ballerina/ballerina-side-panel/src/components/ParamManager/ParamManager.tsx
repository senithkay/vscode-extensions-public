/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import { ParamEditor } from './ParamEditor';
import { ParamItem } from './ParamItem';
import { Codicon, LinkButton, Typography } from '@wso2-enterprise/ui-toolkit';
import { FormProps } from '../Form';
import { FormField, FormValues } from '../Form/types';
import { Controller } from 'react-hook-form';
import { useFormContext } from '../../context';
import { FlowNode } from '@wso2-enterprise/ballerina-core';

export interface Parameter {
    id: number;
    formValues: FormValues;
    key: string;
    value: string;
    icon: string;
}


export interface ParamConfig {
    paramValues: Parameter[];
    formFields: FormField[];
    handleParameter: (parameter: Parameter) => Parameter;
}

export interface ParamManagerProps {
    paramConfigs: ParamConfig;
    node: FlowNode;
    onChange?: (parameters: ParamConfig) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

const ParamContainer = styled.div`
	display: block;
    width: 100%;
`;

export interface ParamManagerEditorProps {
    field: FormField;
    node: FlowNode;
    handleOnFieldFocus?: (key: string) => void;
}

export function ParamManagerEditor(props: ParamManagerEditorProps) {
    const { field, node } = props;
    const { form } = useFormContext();
    const { control, setValue } = form;
    return (
        <ParamContainer>
            <Typography variant='h4'>Parameters</Typography>
            <Controller
                control={control}
                name={field.key}
                render={({ field: { onChange } }) => (
                    <ParamManager
                        paramConfigs={field.paramManagerProps}
                        node={node}
                        onChange={async (config: ParamConfig) => {
                            onChange(config.paramValues);
                        }}
                    />
                )}
            />
        </ParamContainer>
    );

}

export function ParamManager(props: ParamManagerProps) {
    const { paramConfigs, node, readonly, onChange } = props;
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState(false);
    const [parameters, setParameters] = useState<Parameter[]>(paramConfigs.paramValues);
    const [paramComponents, setParamComponents] = useState<React.ReactElement[]>([]);

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
        const updatedParameters = [...parameters];
        setEditingSegmentId(updatedParameters.length);
        const newParams: Parameter = getNewParam(paramConfigs.formFields, updatedParameters.length);
        updatedParameters.push(newParams);
        setParameters(updatedParameters);
        setIsNew(true);
    };

    const onDelete = (param: Parameter) => {
        const updatedParameters = [...parameters];
        const indexToRemove = param.id;
        if (indexToRemove >= 0 && indexToRemove < updatedParameters.length) {
            updatedParameters.splice(indexToRemove, 1);
        }
        const reArrangedParameters = updatedParameters.map((item, index) => ({
            ...item,
            id: index
        }));
        setParameters(reArrangedParameters);
        onChange({ ...paramConfigs, paramValues: reArrangedParameters });
    };

    const onChangeParam = (updatedParams: Parameter) => {
        const updatedParameters = [...parameters];
        const index = updatedParameters.findIndex(param => param.id === updatedParams.id);
        if (index !== -1) {
            updatedParameters[index] = paramConfigs.handleParameter(updatedParams);
        }
        setParameters(updatedParameters);
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

    useEffect(() => {
        renderParams();
    }, [parameters, editingSegmentId]);

    const renderParams = () => {
        const render: React.ReactElement[] = [];
        parameters
            .forEach((param, index) => {
                if (editingSegmentId === index) {
                    paramConfigs.formFields.forEach(field => {
                        field.value = param.formValues[field.key];
                    })
                    render.push(
                        <ParamEditor
                            parameter={param}
                            paramFields={paramConfigs.formFields}
                            node={node}
                            onSave={onSaveParam}
                            onCancelEdit={onParamEditCancel}
                        />
                    )
                } else if ((editingSegmentId !== index)) {
                    render.push(
                        <ParamItem
                            params={param}
                            readonly={editingSegmentId !== -1 || readonly}
                            onDelete={onDelete}
                            onEditClick={onEdit}
                        />
                    );
                }
            });
        setParamComponents(render);
    }

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
