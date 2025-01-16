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
import _ from 'lodash';
import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { ResponseItem } from './ResponseItem';
import { ResponseEditor } from './ResponseEditor';
import { HTTP_METHOD } from '../../../utils';
import { ReturnTypeModel, StatusCodeResponse } from '@wso2-enterprise/ballerina-core';

export interface ResourceParamProps {
    method: HTTP_METHOD;
    response: ReturnTypeModel;
    onChange?: (response: ReturnTypeModel) => void;
    readonly?: boolean;
}

const AddButtonWrapper = styled.div`
	margin: 8px 0;
`;

export function ResourceResponse(props: ResourceParamProps) {
    const { method, response, readonly, onChange } = props;

    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);

    const [editModel, setEditModel] = useState<StatusCodeResponse>(undefined);

    const onEdit = (param: StatusCodeResponse, id: number) => {
        setEditingSegmentId(id);
        setEditModel(param);
    };

    const onAddClick = () => {
        setEditingSegmentId(999);
        setEditModel(_.cloneDeep(response.schema["statusCodeResponse"]) as StatusCodeResponse);
    };

    const onDelete = (indexToRemove: number) => {
        const updatedParameters = [...response.responses];
        updatedParameters.splice(indexToRemove, 1);
        onChange({ ...response, responses: updatedParameters });
    };

    const onChangeParam = (param: StatusCodeResponse) => {
        console.log("Response Changed:", param);
        setEditModel(param);
    };

    const onSaveParam = (param: StatusCodeResponse, index: number) => {
        const updatedParameters: StatusCodeResponse[] = [...response.responses];
        if (updatedParameters.length > index) {
            updatedParameters[index] = param;
        } else {
            param.enabled = true;
            updatedParameters.push(param);
        }
        let enabled = false;
        if (updatedParameters.length > 0) {
            enabled = true;
        }
        onChange({ ...response, enabled, responses: updatedParameters });
        setEditingSegmentId(-1);
        setEditModel(undefined);
    };

    const onParamEditCancel = (id?: number) => {
        setEditModel(undefined);
        setEditingSegmentId(-1);
    };

    return (
        <div>
            {response.responses.map((response: StatusCodeResponse, index) => (
                <ResponseItem
                    key={index}
                    method={method}
                    response={response}
                    readonly={editingSegmentId !== -1 || readonly}
                    onDelete={() => onDelete(index)}
                    onEditClick={() => onEdit(response, index)}
                />
            ))}
            {!editModel && (
                <AddButtonWrapper>
                    <LinkButton sx={readonly && { color: "var(--vscode-badge-background)" }} onClick={!readonly && onAddClick} >
                        <Codicon name="add" />
                        <>Add Response</>
                    </LinkButton>
                </AddButtonWrapper>
            )}
            {editModel &&
                <ResponseEditor
                    index={editingSegmentId}
                    response={{ ...editModel }}
                    isEdit={editingSegmentId !== 999}
                    schema={_.cloneDeep(response.schema["statusCodeResponse"]) as StatusCodeResponse}
                    onChange={onChangeParam}
                    onSave={onSaveParam}
                    onCancel={onParamEditCancel}
                />
            }
        </div>
    );
}
