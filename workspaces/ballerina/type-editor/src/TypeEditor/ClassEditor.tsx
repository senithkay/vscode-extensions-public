/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from 'react';
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

    export const ParameterSection = styled.div`
        margin-left: 24px;
        padding: 8px;
        background-color: var(--vscode-editor-background);
        border-radius: 4px;
        margin-top: 8px;
    `;

    export const ButtonGroup = styled.div`
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 8px;
    `;

    export const ParameterForm = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    export const ParameterList = styled.div`
        margin-left: 24px;
        margin-top: 8px;
    `;

    export const ParameterSubHeader = styled.div`
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        margin-bottom: 4px;
    `;

    export const ParameterItem = styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 4px 8px;
        background-color: var(--vscode-editor-background);
        border-radius: 4px;
        margin-bottom: 4px;
        font-size: 12px;
        justify-content: space-between;
        cursor: pointer;
        &:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
    `;

    export const ParameterInfo = styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
    `;

    export const ParameterType = styled.span`
        color: var(--vscode-descriptionForeground);
    `;
}

interface ClassEditorProps {
    type: Type;
    onChange: (type: Type) => void;
}

interface ParameterFormData {
    name: string;
    type: string;
    defaultValue: string;
}

export function ClassEditor({ type, onChange }: ClassEditorProps) {
    const nameInputRefs = useRef<HTMLInputElement[]>([]);
    const [showParameterForm, setShowParameterForm] = useState<number | null>(null);
    const [parameterForm, setParameterForm] = useState<ParameterFormData>({
        name: '',
        type: '',
        defaultValue: ''
    });
    const [editingParamIndex, setEditingParamIndex] = useState<number | null>(null);

    const addFunction = () => {
        const functionCount = type.functions?.length || 0;
        const newFunction: TypeFunctionModel = {
            name: `name${functionCount + 1}`,
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

    const openParameterForm = (functionIndex: number, paramIndex?: number) => {
        if (paramIndex !== undefined) {
            // Editing existing parameter
            const param = type.functions[functionIndex].parameters[paramIndex];
            setParameterForm({
                name: String(param.name),
                type: String(param.type),
                defaultValue: param.defaultValue ? String(param.defaultValue) : ''
            });
            setEditingParamIndex(paramIndex);
        } else {
            // Adding new parameter
            setParameterForm({ name: '', type: '', defaultValue: '' });
            setEditingParamIndex(null);
        }
        setShowParameterForm(functionIndex);
    };

    const handleParameterSave = (functionIndex: number) => {
        const updatedFunctions = [...(type.functions || [])];
        const currentFunction = updatedFunctions[functionIndex];

        const updatedParameter = {
            kind: "PARAMETER" as const,
            refs: [] as string[],
            type: parameterForm.type,
            name: parameterForm.name,
            defaultValue: parameterForm.defaultValue || undefined,
            enabled: true,
            editable: true,
            optional: false,
            advanced: false
        };

        if (editingParamIndex !== null) {
            // Update existing parameter
            const updatedParameters = [...currentFunction.parameters];
            updatedParameters[editingParamIndex] = updatedParameter;
            updatedFunctions[functionIndex] = {
                ...currentFunction,
                parameters: updatedParameters
            };
        } else {
            // Add new parameter
            updatedFunctions[functionIndex] = {
                ...currentFunction,
                parameters: [...(currentFunction.parameters || []), updatedParameter]
            };
        }

        onChange({
            ...type,
            functions: updatedFunctions
        });

        // Reset form and hide it
        setParameterForm({ name: '', type: '', defaultValue: '' });
        setShowParameterForm(null);
        setEditingParamIndex(null);
    };

    const deleteParameter = (functionIndex: number, paramIndex: number) => {
        const updatedFunctions = [...(type.functions || [])];
        const currentFunction = updatedFunctions[functionIndex];

        const updatedParameters = currentFunction.parameters.filter((_, i) => i !== paramIndex);

        updatedFunctions[functionIndex] = {
            ...currentFunction,
            parameters: updatedParameters
        };

        onChange({
            ...type,
            functions: updatedFunctions
        });
    };

    return (
        <S.Container>
            <S.Header>
                <S.SectionTitle>Service Class</S.SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button appearance="icon" onClick={addFunction}><Codicon name="add" /></Button>
                </div>
            </S.Header>

            {type.functions?.map((func, index) => (
                <div key={index}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <TextField
                            value={func.name}
                            ref={(el) => nameInputRefs.current[index] = el}
                            onChange={(e) => updateFunction(index, { name: e.target.value })}
                            placeholder="Name"
                        />
                        <TextField
                            value={typeof func.returnType === 'string' ? func.returnType : func.returnType?.name}
                            onChange={(e) => updateFunction(index, { returnType: e.target.value })}
                            placeholder="Type"
                        />
                        <Button appearance="icon" onClick={() => deleteFunction(index)}><Codicon name="trash" /></Button>
                        <Button
                            appearance="icon"
                            onClick={() => openParameterForm(index)}
                            tooltip='Add Parameter'
                        >
                            <Codicon name="add" />
                        </Button>
                    </div>

                    {func.parameters && func.parameters.length > 0 && (
                        <S.ParameterList>
                            <S.ParameterSubHeader>Parameters</S.ParameterSubHeader>
                            {func.parameters.map((param, paramIndex) => (
                                <S.ParameterItem
                                    key={paramIndex}
                                    onClick={() => openParameterForm(index, paramIndex)}
                                >
                                    <S.ParameterInfo>
                                        <span>{String(param.name)}</span>
                                        <S.ParameterType>{String(param.type)}</S.ParameterType>
                                        {param.defaultValue && (
                                            <S.ParameterType>= {String(param.defaultValue)}</S.ParameterType>
                                        )}
                                    </S.ParameterInfo>
                                    <Button
                                        appearance="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteParameter(index, paramIndex);
                                        }}
                                    >
                                        <Codicon name="trash" />
                                    </Button>
                                </S.ParameterItem>
                            ))}
                        </S.ParameterList>
                    )}

                    {showParameterForm === index && (
                        <S.ParameterSection>
                            <S.ParameterForm>
                                <TextField
                                    placeholder="Parameter Name"
                                    value={parameterForm.name}
                                    onChange={(e) => setParameterForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <TextField
                                    placeholder="Parameter Type"
                                    value={parameterForm.type}
                                    onChange={(e) => setParameterForm(prev => ({ ...prev, type: e.target.value }))}
                                />
                                <TextField
                                    placeholder="Default Value"
                                    value={parameterForm.defaultValue}
                                    onChange={(e) => setParameterForm(prev => ({ ...prev, defaultValue: e.target.value }))}
                                />
                                <S.ButtonGroup>
                                    <Button onClick={() => {
                                        setShowParameterForm(null);
                                        setParameterForm({ name: '', type: '', defaultValue: '' });
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        appearance="primary"
                                        onClick={() => handleParameterSave(index)}
                                        disabled={!parameterForm.name || !parameterForm.type}
                                    >
                                        Save
                                    </Button>
                                </S.ButtonGroup>
                            </S.ParameterForm>
                        </S.ParameterSection>
                    )}
                </div>
            ))}
        </S.Container>
    );
} 
