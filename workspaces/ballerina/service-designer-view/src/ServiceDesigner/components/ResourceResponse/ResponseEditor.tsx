/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React from 'react';

import { ActionButtons, TextField } from '@wso2-enterprise/ui-toolkit';
import { ResponseConfig } from '../../definitions';
import { EditorContainer, EditorContent } from '../../styles';

export interface ParamProps {
    response: ResponseConfig;
    isEdit: boolean;
    onChange: (param: ResponseConfig) => void;
    onSave?: (param: ResponseConfig) => void;
    onCancel?: (id?: number) => void;
}

export function ResponseEditor(props: ParamProps) {
    const { response, onSave, onChange, onCancel } = props;

    const handleCodeChange = (value: string) => {
        onChange({ ...response, code: Number(value) });
    };

    const handleTypeChange = (value: string) => {
        onChange({ ...response, type: value });
    };

    const handleOnCancel = () => {
        onCancel(response.id);
    };

    const handleOnSave = () => {
        const newParam: ResponseConfig = {
            id: response.id,
            type: response.type,
            code: response.code,
        };
        onSave(newParam);
    };

    return (
        <EditorContainer>
            <EditorContent>
                <TextField
                    size={34}
                    label='Code'
                    required
                    placeholder='Enter code'
                    value={`${response.code}`}
                    onChange={handleCodeChange}
                />
                <TextField
                    size={34}
                    label='Type'
                    placeholder='Enter type'
                    value={response.type}
                    onChange={handleTypeChange}
                />
            </EditorContent>
            <ActionButtons
                primaryButton={{ text: "Save", onClick: handleOnSave }}
                secondaryButton={{ text: "Cancel", onClick: handleOnCancel }}
                sx={{ justifyContent: "flex-end" }}
            />
        </EditorContainer >
    );
}
