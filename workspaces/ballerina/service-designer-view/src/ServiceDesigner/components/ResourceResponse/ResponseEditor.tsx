/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useState } from 'react';

import { ActionButtons, AutoComplete } from '@wso2-enterprise/ui-toolkit';
import { ResponseConfig } from '../../definitions';
import { EditorContainer, EditorContent } from '../../styles';
import { responseCodes } from '@wso2-enterprise/ballerina-core';

export interface ParamProps {
    response: ResponseConfig;
    isEdit: boolean;
    onChange: (param: ResponseConfig) => void;
    onSave?: (param: ResponseConfig) => void;
    onCancel?: (id?: number) => void;
    typeCompletions?: string[];
}

export function ResponseEditor(props: ParamProps) {
    const { response, onSave, onChange, onCancel, typeCompletions } = props;
    const [code, setCode] = useState("200 - OK");

    const handleCodeChange = (value: string) => {
        setCode(value);
        const code = responseCodes.find(code => code.title === value).code;
        onChange({ ...response, code: Number(code) });
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
                <AutoComplete
                    label="Code"
                    selectedItem={code}
                    items={responseCodes.map(code => code.title)}
                    onChange={handleCodeChange}
                />
                <AutoComplete
                    label="Type"
                    selectedItem={response.type}
                    items={typeCompletions}
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
