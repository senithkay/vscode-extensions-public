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

import { ActionButtons, Dropdown, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { EditorContainer, EditorContent } from '../styles';
import { TypeBrowser } from '../../../components/TypeBrowser/TypeBrowser';
import { PARAM_TYPES } from '../definitions';
import { ParameterModel } from '@wso2-enterprise/ballerina-core';

const options = [{ id: "0", value: PARAM_TYPES.DEFAULT }, { id: "1", value: PARAM_TYPES.HEADER }];

export interface ParamProps {
    param: ParameterModel;
    onChange: (param: ParameterModel) => void;
    onSave: (param: ParameterModel) => void;
    onCancel: (param?: ParameterModel) => void;
}

export function PayloadEditor(props: ParamProps) {
    const { param, onChange, onSave, onCancel } = props;

    const handleTypeChange = (value: string) => {
        onChange({ ...param, type: { ...param.type, value } });
    };

    const handleNameChange = (value: string) => {
        param.name.value = value;
        onChange(param);
    };

    const handleOnCancel = () => {
        onCancel(param);
    };

    const handleOnSave = () => {
        onSave(param);
    };

    return (
        <EditorContainer>
            <EditorContent>
                <TypeBrowser
                    sx={{ zIndex: 1, position: "relative", width: "300px" }}
                    borderBox={true}
                    label="Type"
                    selectedItem={param.type.value}
                    onChange={handleTypeChange}
                />
                <TextField
                    label='Name'
                    size={21}
                    required
                    sx={{ width: "300px" }}
                    placeholder='Enter name'
                    value={param.name.value}
                    errorMsg={""}
                    onKeyDown={(event) => { if (event.code === 'Space') event.preventDefault() }}
                    onTextChange={handleNameChange}
                    onFocus={(e) => e.target.select()}
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
