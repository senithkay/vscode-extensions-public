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
import { Codicon, ErrorBanner, LinkButton, RequiredFormInput } from '@wso2-enterprise/ui-toolkit';
import { FormField, FormValues } from '../Form/types';
import { Controller } from 'react-hook-form';
import { useFormContext } from '../../context';
import { NodeKind } from '@wso2-enterprise/ballerina-core';

export interface Parameter {
    id: number;
    formValues: FormValues;
    key: string;
    value: string;
    icon: string;
    identifierEditable: boolean;
    identifierRange: any;
}


export interface ParamConfig {
    paramValues: Parameter[];
    formFields: FormField[];
    handleParameter: (parameter: Parameter) => Parameter;
}

export interface ParamManagerProps {
    paramConfigs: ParamConfig;
    onChange?: (parameters: ParamConfig) => void,
    openRecordEditor?: (open: boolean) => void;
    readonly?: boolean;
    selectedNode?: NodeKind;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

const ParamContainer = styled.div`
	display: block;
    width: 100%;
`;

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Description = styled.div`
    color: var(--vscode-list-deemphasizedForeground);
`;

const LabelContainer = styled.label`
    display: flex;
    align-items: center;
`;

const Label = styled.label`
    color: var(--vscode-editor-foreground);
`;

export interface ParamManagerEditorProps {
    field: FormField;
    handleOnFieldFocus?: (key: string) => void;
    openRecordEditor?: (open: boolean) => void;
    selectedNode?: NodeKind;
}

export function ParamManagerEditor(props: ParamManagerEditorProps) {
    const { field, openRecordEditor, selectedNode } = props;
    const { form } = useFormContext();
    const { control, setValue } = form;
    return (
        <ParamContainer>
            <HeaderContainer>
                <LabelContainer>
                    <Label>{field.label}</Label>
                    {!field.optional && <RequiredFormInput />}
                </LabelContainer>
                <Description>{field.documentation}</Description>
            </HeaderContainer>
            <Controller
                control={control}
                name={field.key}
                rules={{
                    required: {
                        value: !field.optional && !field.placeholder,
                        message: `${selectedNode === "DATA_MAPPER_DEFINITION" ? 'Input type' : field.label} is required`
                    }
                }}
                render={({ field: { onChange }, fieldState: { error } }) => (
                    <>
                        <ParamManager
                            paramConfigs={field.paramManagerProps}
                            openRecordEditor={openRecordEditor}
                            onChange={async (config: ParamConfig) => {
                                onChange(config.paramValues);
                            }}
                            selectedNode={selectedNode}
                        />
                        {error && <ErrorBanner errorMsg={error.message.toString()} />}
                    </>
                )}
            />
        </ParamContainer>
    );

}

export function ParamManager(props: ParamManagerProps) {
    const { paramConfigs, readonly, onChange, openRecordEditor, selectedNode } = props;
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
            icon: "",
            identifierEditable: true,
            identifierRange: undefined
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
    }, [parameters, editingSegmentId, paramConfigs]);

    const renderParams = () => {
        const render: React.ReactElement[] = [];
        parameters
            .forEach((param, index) => {
                if (editingSegmentId === index) {
                    const newParamConfig = {
                        ...paramConfigs,
                        formFields: paramConfigs.formFields.map(field => ({ ...field }))
                    };
                    newParamConfig.formFields.forEach(field => {
                        if (param.formValues[field.key]) {
                            field.value = param.formValues[field.key];
                            field.editable = param.identifierEditable;
                            field.lineRange = param.identifierRange;
                        }
                    })
                    render.push(
                        <ParamEditor
                            parameter={param}
                            paramFields={newParamConfig.formFields}
                            onSave={onSaveParam}
                            onCancelEdit={onParamEditCancel}
                            openRecordEditor={openRecordEditor}
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
                        <>{`Add ${selectedNode === "DATA_MAPPER_DEFINITION" ? "Input" : "Parameter"}`}</>
                    </LinkButton>
                </AddButtonWrapper>
            )}
        </div>
    );
}
