/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from 'react';
import { Member, Type } from '@wso2-enterprise/ballerina-core';
import { Codicon, Icon } from '@wso2-enterprise/ui-toolkit';
import { Button } from '@wso2-enterprise/ui-toolkit';
import { TextField } from '@wso2-enterprise/ui-toolkit';

interface RecordEditorProps {
    type: Type;
    onChange: (type: Type) => void;
    onImportJson: () => void;
    onImportXml: () => void;
}

export const RecordEditor: React.FC<RecordEditorProps> = (props) => {
    const { type, onChange, onImportJson, onImportXml } = props;
    const nameInputRefs = useRef<HTMLInputElement[]>([]);

    const handleMemberNameChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMembers: Member[] = [...type.members];
        newMembers[index].name = e.target.value;
        onChange({ ...type, members: newMembers });
    };

    const handleMemberTypeChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMembers: Member[] = [...type.members];
        newMembers[index].type = e.target.value;
        onChange({ ...type, members: newMembers });
    };

    const handleDeleteMember = (index: number) => () => {
        const newMembers = [...type.members];
        newMembers.splice(index, 1);
        onChange({ ...type, members: newMembers });
    };

    const addMember = () => {
        const memberCount = Object.keys(type.members).length;
        const newMemberName = `name${memberCount + 1}`;
        const newMember: Member = {
            name: newMemberName,
            type: "string",
            kind: "FIELD",
            refs: [],
            docs: ""
        }
        onChange({ ...type, members: [...type.members, newMember] });
    }

    const handleImportJson = () => {
        onImportJson();
    }

    const handleImportXml = () => {
        onImportXml();
    }

    return (
        <div className="record-editor">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>Record</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button appearance="icon">
                        <Codicon name="arrow-circle-down" onClick={handleImportJson} /> JSON
                    </Button>
                    <Button appearance="icon">
                        <Codicon name="arrow-circle-down" onClick={handleImportXml} /> XML
                    </Button>
                    <Button appearance="icon" onClick={addMember}><Codicon name="add" /></Button>
                </div>
            </div>
            {type.members.map((member, index) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <TextField
                        value={member.name}
                        ref={(el) => nameInputRefs.current[index] = el}
                        onBlur={handleMemberNameChange(index)}
                    />
                    <TextField
                        value={typeof member.type === 'string' ? member.type : member.type.name}
                        onChange={handleMemberTypeChange(index)}
                    />
                    <Button appearance="icon"><Codicon name="case-sensitive" /></Button>
                    <Button appearance="icon" onClick={handleDeleteMember(index)}><Codicon name="trash" /></Button>
                </div>
            ))}
        </div>
    );
};
