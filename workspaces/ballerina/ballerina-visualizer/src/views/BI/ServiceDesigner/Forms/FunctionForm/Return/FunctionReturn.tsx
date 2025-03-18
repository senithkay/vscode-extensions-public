/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { PropertyModel } from '@wso2-enterprise/ballerina-core';

const NameContainer = styled.div`
    display: flex;
	flex-direction: row;
`;

export interface FunctionReturnProps {
    returnType: PropertyModel;
    onChange: (returnType: PropertyModel) => void;
    readonly?: boolean;
}

export function FunctionReturn(props: FunctionReturnProps) {
    const { returnType, onChange, readonly } = props;

    const handleNameChange = (value: string) => {
        onChange({ ...returnType, value });
    };

    return (
        <>
            <NameContainer>
                <TextField
                    sx={{ marginLeft: 15, flexGrow: 1 }}
                    disabled={readonly}
                    errorMsg={""}
                    label="Return Type"
                    size={70}
                    onTextChange={(input) => {
                        const trimmedInput = input.trim();
                        handleNameChange(trimmedInput);
                    }}
                    placeholder={returnType.valueTypeConstraint}
                    value={returnType.value}
                />
            </NameContainer>
        </>
    );
}
