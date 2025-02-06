/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef } from 'react';
import { Type, TypeFunctionModel } from '@wso2-enterprise/ballerina-core';
import { Codicon, Button, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';

namespace S {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
    `;

    export const Header = styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 8px;
    `;

    export const SectionTitle = styled.div`
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-editor-foreground);
        margin-bottom: 4px;
    `;

    export const FunctionRow = styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px;
        background-color: var(--vscode-editor-background);
        border-radius: 4px;
    `;

    export const FunctionList = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
}

interface ClassEditorProps {
    type: Type;
    onChange: (type: Type) => void;
}

export function ClassEditor({ type, onChange }: ClassEditorProps) {
    const nameInputRefs = useRef<HTMLInputElement[]>([]);

    const addFunction = () => {
        const functionCount = type.functions?.length || 0;
        const newFunction: TypeFunctionModel = {
            name: `resource${functionCount + 1}`,
            kind: "RESOURCE",
            accessor: "get",
            qualifiers: [],
            parameters: [],
            refs: [],
            returnType: "string"
        };

        onChange({
            ...type,
            functions: [...(type.functions || []), newFunction]
        });
    };

    const updateFunction = (index: number, updates: Partial<TypeFunctionModel>) => {
        const updatedFunctions = [...(type.functions || [])];
        updatedFunctions[index] = {
            ...updatedFunctions[index],
            ...updates
        };

        onChange({
            ...type,
            functions: updatedFunctions
        });
    };

    const deleteFunction = (index: number) => {
        const updatedFunctions = (type.functions || []).filter((_, i) => i !== index);
        onChange({
            ...type,
            functions: updatedFunctions
        });
    };

    return (
        <S.Container>
            <S.Header>
                <S.SectionTitle>Class</S.SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button appearance="icon" onClick={addFunction}><Codicon name="add" /></Button>
                </div>
            </S.Header>
            {type.functions?.map((func, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                    <TextField
                        value={func.name}
                        ref={(el) => nameInputRefs.current[index] = el}
                        onChange={(e) => updateFunction(index, { name: e.target.value })}
                        placeholder="Resource name"
                    />
                    <TextField
                        value={typeof func.returnType === 'string' ? func.returnType : func.returnType?.name}
                        onChange={(e) => updateFunction(index, { returnType: e.target.value })}
                        placeholder="Return type"
                    />
                    <Button appearance="icon" onClick={() => deleteFunction(index)}><Codicon name="trash" /></Button>
                </div>
            ))}
        </S.Container>
    );
} 
