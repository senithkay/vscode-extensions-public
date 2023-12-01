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

import styled from '@emotion/styled';
import { ActionButtons, TextField } from '@wso2-enterprise/ui-toolkit';
import { ResponseConfig } from '../../definitions';

const ParamContainer = styled.div`
    display: flex;
    margin: 10px 0;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid var(--vscode-dropdown-border);
`;

const ParamContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px 0;
`;

export interface ParamProps {
    response: ResponseConfig;
    isEdit: boolean;
    onChange: (param: ResponseConfig) => void;
    onCancel?: (id?: number) => void;
}

export function ResponseEditor(props: ParamProps) {
    const { response, onChange, onCancel } = props;

    const [type, setTypeValue] = React.useState(response.type);
    const [code, setCode] = React.useState(response.code);

    const handleCodeChange = (value: string) => {
        setCode(parseInt(value));
    };

    const handleOnCancel = () => {
        onCancel(response.id);
    };

    const handleOnSave = () => {
        const newParam: ResponseConfig = {
            id: response.id,
            type: type,
            code: code,
        };
        onChange(newParam);
    };

    return (
        <ParamContainer>
            <TextField
                size={30}
                label='Code'
                required
                placeholder='Enter code'
                value={`${code}`}
                onChange={handleCodeChange}
            />
            <ParamContent>
                <TextField
                    size={30}
                    label='Type'
                    required
                    placeholder='Enter type'
                    value={type}
                    onChange={setTypeValue}
                />
            </ParamContent>
            <ActionButtons
                primaryButton={{ text : "Save", onClick: handleOnSave }}
                secondaryButton={{ text : "Cancel", onClick: handleOnCancel }}
                sx={{justifyContent: "flex-end"}}
            />
        </ParamContainer >
    );
}
