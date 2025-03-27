/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { TextField, Button, Icon, Codicon } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { Type, Member } from "@wso2-enterprise/ballerina-core";

namespace S {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
    `;

    export const MemberRow = styled.div`
        display: flex;
        gap: 8px;
        justify-content: space-between;
        margin-bottom: 8px;
    `;

    export const Header = styled.div`
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 8px 0px;
        margin-bottom: 8px;
    `;

    export const SectionTitle = styled.div`
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-editor-foreground);
        margin-bottom: 4px;
    `;

    export const AddButton = styled(Button)`
        margin-top: 8px;
    `;

    export const DeleteButton = styled(Button)`
        min-width: 32px;
        height: 32px;
        padding: 0;
    `;

    export const ExpandIconButton = styled(Button)`
        padding: 4px;
        &:hover {
            background: transparent;
        }
    `;

    export const ConstantExpressionContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid var(--vscode-welcomePage-tileBorder);
        margin-left: 25px;
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 4px;
    `;
}

interface EnumEditorProps {
    type: Type;
    onChange: (type: Type) => void;
}

export function EnumEditor({ type, onChange }: EnumEditorProps) {
    const [expandedFunctions, setExpandedFunctions] = useState<number[]>([]);

    const toggleFunctionExpand = (index: number) => {
        setExpandedFunctions(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const addMember = () => {
        const newMember: Member = {
            kind: "ENUM_MEMBER",
            name: "",
            type: "string",
            refs: []
        };

        onChange({
            ...type,
            members: [...type.members, newMember]
        });
    };

    const updateMember = (index: number, name: string) => {
        const updatedMembers = [...type.members];
        updatedMembers[index] = {
            ...updatedMembers[index],
            name
        };

        onChange({
            ...type,
            members: updatedMembers
        });
    };

    const deleteMember = (index: number) => {
        const updatedMembers = type.members.filter((_, i) => i !== index);
        onChange({
            ...type,
            members: updatedMembers
        });
    };

    const handleMemberDefaultValueChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedMembers = [...type.members];
        updatedMembers[index] = {
            ...updatedMembers[index],
            defaultValue: e.target.value
        };

        onChange({
            ...type,
            members: updatedMembers
        });
    };

    return (
        <S.Container>
            <S.Header>
                <S.SectionTitle>Members</S.SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button appearance="icon" onClick={addMember}><Codicon name="add" /></Button>
                </div>
            </S.Header>
            {type.members.map((member, index) => (
                <>
                    <S.MemberRow key={index}>
                        <S.ExpandIconButton
                            appearance="icon"
                            onClick={() => toggleFunctionExpand(index)}
                        >
                            <Codicon name={expandedFunctions.includes(index) ? "chevron-down" : "chevron-right"} />
                        </S.ExpandIconButton>
                        <TextField
                            value={member.name}
                            onChange={(e) => updateMember(index, e.target.value)}
                            placeholder="Enum member name"
                            sx={{ flexGrow: 1 }}
                        />
                        <Button appearance="icon" onClick={() => deleteMember(index)}><Codicon name="trash" /></Button>
                    </S.MemberRow>
                    {expandedFunctions.includes(index) && (
                        <S.ConstantExpressionContainer>
                            <TextField label='Constant Expression' value={member.defaultValue} onChange={(e) => handleMemberDefaultValueChange(index, e)} style={{ width: '180px' }} />
                        </S.ConstantExpressionContainer>
                    )}
                </>
            ))}
        </S.Container>
    );
} 
