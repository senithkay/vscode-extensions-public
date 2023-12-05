/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { PARAM_TYPES, ParameterConfig } from '../../definitions';
import { ParamEditor } from '../ResourceParam/ParamEditor';
import { ParamItem } from '../ResourceParam/ParamItem';

export interface ResourceParamProps {
    parameters: ParameterConfig[];
    onChange?: (parameters: ParameterConfig[]) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export function AdvancedParams(props: ResourceParamProps) {
    const { parameters, readonly, onChange } = props;
    const [editingComponent, setEditingComponent] = useState<string>();

    const onEdit = () => {
        setEditInprogress(true);
    };

    const onAddClick = () => {
        setEditInprogress(true);
        const newParam: ParameterConfig = {
            id: 0,
            name: "param",
            type: "string",
            option: PARAM_TYPES.PAYLOAD,
            defaultValue: ""
        };
        onChange(newParam);
    };

    const onDelete = () => {
        onChange(undefined);
    };

    parameters.forEach((param) => {
        if (param.option === PARAM_TYPES.REQUEST) {
            const onChangeParam = (param: ParameterConfig) => {
                setEditingComponent(PARAM_TYPES.REQUEST);
                const updatedParameters = [...parameters];
                const indexToChange = parameters.findIndex((item) => item.option === param.option);
                if (indexToChange >= 0 && indexToChange < updatedParameters.length) {
                    updatedParameters[indexToChange] = param;
                }
                onChange && onChange(parameters);
            };

            const onParamEditCancel = () => {
                setEditingComponent(undefined);
            };

            const onChangeParam = (param: ParameterConfig) => {
                onChange(param);
                setEditInprogress(false);
            };

            const request = (
                <div>
                    {editingComponent === PARAM_TYPES.REQUEST ? (
                        <ParamEditor
                            param={{
                                id: 0,
                                name: param.name,
                                option: PARAM_TYPES.REQUEST,
                            }}
                            hideType={true}
                            hideDefaultValue={true}
                            isEdit={true}
                            onChange={onChangeParam}
                            onCancel={onParamEditCancel}
                        />
                    ) : (
                        <>
                            {param ? (
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
                            ) : (
                                <AddButtonWrapper>
                                    <LinkButton sx={readonly && { color: "var(--vscode-badge-background)" }} onClick={!readonly && onAddClick} >
                                        <Codicon name="add"/>
                                        <>Add Request</>
                                    </LinkButton>
                                </AddButtonWrapper>
                            )}
                        </>
                    )}
                </div>
            )
        }
    });

    return (
        <div>
            {editInprogress ? (
                <ParamEditor
                    param={{
                        id: 0,
                        name: parameter.name,
                        type: parameter.type,
                        option: PARAM_TYPES.PAYLOAD,
                        defaultValue: parameter.defaultValue,
                    }}
                    isEdit={true}
                    option={parameter.option}
                    onChange={onChangeParam}
                    onCancel={onParamEditCancel}
                />
            ) : (
                <>
                    {parameter ? (
                        <ParamItem
                            param={{
                                id: 0,
                                name: parameter.name,
                                type: parameter.type,
                                option: parameter.option,
                                defaultValue: parameter.defaultValue
                            }}
                            readonly={readonly}
                            onDelete={onDelete}
                            onEditClick={onEdit}
                        />
                    ) : (
                        <AddButtonWrapper>
                            <LinkButton sx={readonly && { color: "var(--vscode-badge-background)" }} onClick={!readonly && onAddClick} >
                                <Codicon name="add"/>
                                <>Add Payload</>
                            </LinkButton>
                        </AddButtonWrapper>
                    )}
                </>
            )}
        </div>
    );
}
