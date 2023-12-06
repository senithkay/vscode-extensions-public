/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { ReactElement, useState } from 'react';

import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { PARAM_TYPES, ParameterConfig } from '../../definitions';
import { ParamEditor } from '../ResourceParam/ParamEditor';
import { ParamItem } from '../ResourceParam/ParamItem';

export interface ResourceParamProps {
    parameters: Map<string, ParameterConfig>;
    onChange?: (parameters: Map<string, ParameterConfig>) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export function AdvancedParams(props: ResourceParamProps) {
    const { parameters, readonly, onChange } = props;
    const [editingComponent, setEditingComponent] = useState<PARAM_TYPES>();

    const getAddButton = (paramType: PARAM_TYPES, readonly: boolean) => {
        const addParam = (paramType: PARAM_TYPES) => {
            const updatedParamters = new Map(parameters);
            setEditingComponent(paramType);
            const newParam: ParameterConfig = {
                id: 0,
                name: "param",
                type: `http:${paramType === PARAM_TYPES.HEADER ? "Headers" : paramType}`,
                option: paramType,
            };
            updatedParamters.set(newParam.option, newParam);
            onChange(updatedParamters);
        };
        const onAddClick = () => {
            addParam(paramType);
        };
        return (
            <AddButtonWrapper>
                <LinkButton sx={readonly && { color: "var(--vscode-badge-background)" }} onClick={!readonly && onAddClick} >
                    <Codicon name="add"/>
                    <>{`Add ${paramType}`}</>
                </LinkButton>
            </AddButtonWrapper>
        );
    }

    const getParam = (param: ParameterConfig, paramType: PARAM_TYPES) => {
        if (param.option === paramType) {
            const updatedParamters = new Map(parameters);
            const onChangeParam = (param: ParameterConfig) => {
                updatedParamters.set(paramType, param);
                onChange && onChange(updatedParamters);
            };
            const onSave = () => {
                setEditingComponent(undefined);
                onChange(updatedParamters);
            };
    
            const onDelete = (param: ParameterConfig) => {
                updatedParamters.delete(param.option);
                onChange(updatedParamters);
            };

            const onEdit = () => {
                setEditingComponent(paramType);
            };
    
            const onParamEditCancel = () => {
                setEditingComponent(undefined);
                onDelete(param);
            };
    
            const component = (
                <div>
                    {editingComponent === paramType ? (
                        <ParamEditor
                            param={{
                                id: 0,
                                name: param.name,
                                option: paramType,
                            }}
                            hideType={true}
                            hideDefaultValue={true}
                            isEdit={true}
                            onSave={onSave}
                            onChange={onChangeParam}
                            onCancel={onParamEditCancel}
                        />
                    ) : (
                        <>
                            {param && (
                                <ParamItem
                                    param={{
                                        id: 0,
                                        name: param.name,
                                        type: param.type,
                                        option: param.option,
                                        defaultValue: param.defaultValue
                                    }}
                                    readonly={readonly}
                                    onDelete={onDelete}
                                    onEditClick={onEdit}
                                />
                            )}
                        </>
                    )}
                </div>
            )
            return component;
        }
    }

    const paramComponents: Map<string, ReactElement> = new Map();
    parameters.forEach((param: ParameterConfig, key: string) => {
        paramComponents.set(key, getParam(param, key as PARAM_TYPES));
    });

    return (
        <div>
            {paramComponents.has(PARAM_TYPES.REQUEST) ? paramComponents.get(PARAM_TYPES.REQUEST) : getAddButton(PARAM_TYPES.REQUEST, readonly)}
            {paramComponents.has(PARAM_TYPES.CALLER) ? paramComponents.get(PARAM_TYPES.CALLER) : getAddButton(PARAM_TYPES.CALLER, readonly)}
            {paramComponents.has(PARAM_TYPES.HEADER) ? paramComponents.get(PARAM_TYPES.HEADER) : getAddButton(PARAM_TYPES.HEADER, readonly)}
        </div>
    );
}
