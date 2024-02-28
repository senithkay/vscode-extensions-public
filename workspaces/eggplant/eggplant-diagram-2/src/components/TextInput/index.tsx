/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { TextField, Tooltip } from "@wso2-enterprise/ui-toolkit";
import { Expression } from "../../utils/types";
import styled from "@emotion/styled";

export namespace S {
    export const StyledText = styled.div`
        font-size: 14px;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    `;
}

interface TextInputProps {
    expression: Expression;
    onChange: (expression: Expression) => void;
}

export function TextInput(props: TextInputProps) {
    const { expression, onChange } = props;

    const handleOnChange = (value: string) => {
        onChange({ ...expression, value });
    };

    return (
        <S.Row>
            <Tooltip content={expression.documentation} sx={{
                fontFamily: "GilmerRegular",
                fontSize: "12px",
            }}>
                <S.StyledText>{expression.label} </S.StyledText>
            </Tooltip>
            <TextField value={expression.value.toString()} onBlur={handleOnChange} />
        </S.Row>
    );
}
