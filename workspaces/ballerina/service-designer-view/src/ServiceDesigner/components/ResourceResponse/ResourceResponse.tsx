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
import { ResponseItem } from './ResponseItem';
import { ResponseEditor } from './ResponseEditor';
import { ResponseConfig } from '../../definitions';

export interface ResourceParamProps {
    response: ResponseConfig[];
    onChange?: (parameters: ResponseConfig[]) => void,
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export function Response(props: ResourceParamProps) {
    const { response, readonly, onChange } = props;
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [isNew, setIsNew] = useState(false);

    const onEdit = (param: ResponseConfig) => {
        setEditingSegmentId(param.id);
    };

    const onAddClick = () => {
        const updatedParameters = [...response];
        setEditingSegmentId(updatedParameters.length);
        const newResp: ResponseConfig = {
            id: updatedParameters.length,
            code: 200,
            type: "json"
        };
        updatedParameters.push(newResp);
        onChange(updatedParameters);
        setIsNew(true);
    };

    const onDelete = (param: ResponseConfig) => {
        const updatedParameters = [...response];
        const indexToRemove = param.id;
        if (indexToRemove >= 0 && indexToRemove < updatedParameters.length) {
            updatedParameters.splice(indexToRemove, 1);
        }
        const reArrangedParameters = updatedParameters.map((item, index) => ({
            ...item,
            id: index
        }));
        onChange(reArrangedParameters);
    };

    const onChangeParam = (paramConfig: ResponseConfig) => {
        const updatedParameters = [...response];
        const index = updatedParameters.findIndex(param => param.id === paramConfig.id);
        if (index !== -1) {
            updatedParameters[index] = paramConfig;
        }
        onChange(updatedParameters);
    };

    const onSaveParam = (paramConfig: ResponseConfig) => {
        const updatedParameters = [...response];
        const index = updatedParameters.findIndex(param => param.id === paramConfig.id);
        if (index !== -1) {
            updatedParameters[index] = paramConfig;
        }
        setEditingSegmentId(-1);
        setIsNew(false);
        onChange(updatedParameters);
    };

    const onParamEditCancel = (id?: number) => {
        setEditingSegmentId(-1);
        if (isNew) {
            onDelete({ id });
        }
        setIsNew(false);
    };

    const paramComponents: React.ReactElement[] = [];
    response
        .forEach((param: ResponseConfig, index) => {
            if (editingSegmentId === index) {
                paramComponents.push(
                    <ResponseEditor
                        response={{
                            id: index,
                            type: param.type,
                            code: param.code
                        }}
                        isEdit={true}
                        onChange={onChangeParam}
                        onSave={onSaveParam}
                        onCancel={onParamEditCancel}
                    />
                )
            } else if ((editingSegmentId !== index)) {
                paramComponents.push(
                    <ResponseItem
                        response={{
                            id: index,
                            type: param.type,
                            code: param.code
                        }}
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
                        <>Add Response</>
                    </LinkButton>
                </AddButtonWrapper>
            )}
        </div>
    );
}
