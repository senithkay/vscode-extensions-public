/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { Dropdown, Button, Icon, Codicon, TextField } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { Type, Member, TypeWithIdentifier, VisibleType } from "@wso2-enterprise/ballerina-core";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";

namespace S {
    export const Container = styled.div`
        display: flex;
        flex-direction: column;
    `;

    export const MemberRow = styled.div`
        display: flex;
        gap: 8px;
        justify-content: space-between;
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

    export const AddButton = styled(Button)`
        margin-top: 8px;
    `;

    export const DeleteButton = styled(Button)`
        min-width: 32px;
        height: 32px;
        padding: 0;
    `;
}

interface UnionEditorProps {
    type: Type;
    onChange: (type: Type) => void;
    rpcClient: BallerinaRpcClient;
}

export function UnionEditor({ type, onChange, rpcClient }: UnionEditorProps) {

    const addMember = () => {
        const newMember: Member = {
            kind: "TYPE",
            type: "",
            refs: [],
            name: ""
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
            type: name,
            name: name,
            refs: []
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


    return (
        <S.Container>
            <S.Header>
                <S.SectionTitle>Union</S.SectionTitle>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button appearance="icon" onClick={addMember}><Codicon name="add" /></Button>
                </div>
            </S.Header>
            {type.members.map((member, index) => (
                <S.MemberRow key={index}>
                    <TextField
                        value={typeof member.type === 'string' ? member.type : member.name}
                        onChange={(e) => updateMember(index, e.target.value)}
                        placeholder="Enter type"
                        sx={{ flexGrow: 1 }}
                    />
                    <Button appearance="icon" onClick={() => deleteMember(index)}><Codicon name="trash" /></Button>
                </S.MemberRow>
            ))}
        </S.Container>
    );
} 
