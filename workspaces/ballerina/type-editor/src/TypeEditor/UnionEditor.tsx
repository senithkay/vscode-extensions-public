/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { Dropdown, Button, Icon, Codicon } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { Type, Member, TypeWithIdentifier, VisibleType } from "@wso2-enterprise/ballerina-core";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";

namespace S {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    `;

    export const TypeRow = styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px;
        background-color: var(--vscode-editor-background);
        border-radius: 4px;
    `;

    export const TypeName = styled.span`
        flex-grow: 1;
        color: var(--vscode-editor-foreground);
    `;

    export const Header = styled.div`
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
    `;

    export const SectionTitle = styled.div`
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-editor-foreground);
    `;

    export const TypeList = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-top: 8px;
    `;

    export const TypeSelector = styled.div`
        width: 100%;
    `;
}

interface UnionEditorProps {
    type: Type;
    onChange: (type: Type) => void;
    rpcClient: BallerinaRpcClient;
}

export function UnionEditor({ type, onChange, rpcClient }: UnionEditorProps) {
    const [availableTypes, setAvailableTypes] = useState<TypeWithIdentifier[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                    filePath: type.codedata.lineRange.fileName,
                    position: type.codedata.lineRange.startLine
                });
                if (response.types) {
                    const typeIdentifiers: TypeWithIdentifier[] = response.types.map(t => ({
                        name: t,
                        type: {
                            typeName: t,
                            name: t
                        }
                    }));
                    setAvailableTypes(typeIdentifiers);
                }
            } catch (error) {
                console.error("Error fetching types:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();
    }, [type.codedata.lineRange.fileName, rpcClient]);

    const addType = (selectedType: string) => {
        const typeInfo = availableTypes.find(t => t.name === selectedType);
        if (!typeInfo) return;

        const newMember: Member = {
            kind: "TYPE",
            type: typeInfo.name,
            refs: [],
            name: typeInfo.name
        };

        onChange({
            ...type,
            members: [...type.members, newMember]
        });
    };

    const removeType = (index: number) => {
        const updatedMembers = type.members.filter((_, i) => i !== index);
        onChange({
            ...type,
            members: updatedMembers
        });
    };

    const getFilteredTypes = () => {
        const selectedTypes = new Set(type.members.map(m => m.name));
        return availableTypes.filter(t => !selectedTypes.has(t.name));
    };

    if (loading) {
        return <div>Loading available types...</div>;
    }

    return (
        <S.Container>
            <S.Header>
                <S.SectionTitle>Union Type</S.SectionTitle>
                <S.TypeSelector>
                    <Dropdown
                        id="type-selector"
                        label="Add Type"
                        items={getFilteredTypes().map(t => ({ label: t.name, value: t.name }))}
                        onChange={(e) => addType(e.target.value)}
                    />
                </S.TypeSelector>
            </S.Header>
            <S.TypeList>
                {type.members.map((member, index) => (
                    <S.TypeRow key={index}>
                        <S.TypeName>{typeof member.type === 'string' ? member.type : member.name}</S.TypeName>
                        <Button appearance="icon" onClick={() => removeType(index)}><Codicon name="trash" /></Button>
                    </S.TypeRow>
                ))}
            </S.TypeList>
        </S.Container>
    );
} 
