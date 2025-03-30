/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Member, Type } from "@wso2-enterprise/ballerina-core";
import React from "react";
import { TypeField } from "./TypeField";

interface ArrayEditorProps {
    type: Type;
    onChange: (type: Type) => void;
}

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
}
export function ArrayEditor(props: ArrayEditorProps) {
    console.log(props.type);
    const newMember: Member = {
        kind: "TYPE",
        type: "string",
        refs: [],
        name: ""
    };
    
    const member = props.type?.members?.length > 0 ? props.type.members[0] : newMember;
    const updateMember = (newType: string) => {
        props.onChange({
            ...props.type,
            members: [{ ...member, type: newType }]
        });
    };

    return (
        <S.Container>
            <S.Header>
                <TypeField
                    type={member.type}
                    memberName={typeof member.type === 'string' ? member.type : member.name}
                    onChange={(newType) => updateMember(newType)}
                    placeholder="Enter type"
                    sx={{ flexGrow: 1 }}
                    label="Array Type"
                />
            </S.Header>
        </S.Container>
    );
}