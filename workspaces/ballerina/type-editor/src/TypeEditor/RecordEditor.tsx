/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Member, Type } from '@wso2-enterprise/ballerina-core';
import { Codicon, Icon, CheckBox } from '@wso2-enterprise/ui-toolkit';
import { Button } from '@wso2-enterprise/ui-toolkit';
import { TextField } from '@wso2-enterprise/ui-toolkit';
import { FieldEditor } from './FieldEditor';

interface RecordEditorProps {
    type: Type;
    isAnonymous: boolean;
    onChange: (type: Type) => void;
    onImportJson: () => void;
    onImportXml: () => void;
}

export const RecordEditor = forwardRef<{ addMember: () => void }, RecordEditorProps>((props, ref) => {
    const { type, isAnonymous = false, onChange, onImportJson, onImportXml } = props;
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

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

    useImperativeHandle(ref, () => ({
        addMember
    }));

    const handleImportJson = () => {
        onImportJson();
    }

    const handleImportXml = () => {
        onImportXml();
    }

    const deleteSelected = () => {
        const newMembers = type.members.filter((_, index) => !selectedMembers.includes(index));
        setSelectedMembers([]);
        onChange({ ...type, members: newMembers });
    }

    const onSelect = (index: number) => () => {
        setSelectedMembers([...selectedMembers, index]);
    }

    const onDeselect = (index: number) => () => {
        setSelectedMembers(selectedMembers.filter(i => i !== index));
    }

    const handleMemberChange = (index: number) => (member: Member) => {
        const newMembers = [...type.members];
        newMembers[index] = member;
        onChange({ ...type, members: newMembers });
    }

    return (
        <div className="record-editor">
            {!isAnonymous &&
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3>Record</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button appearance="icon">
                            <Codicon name="arrow-circle-down" onClick={handleImportJson} />&nbsp;JSON
                        </Button>
                        <Button appearance="icon">
                            <Codicon name="arrow-circle-down" onClick={handleImportXml} />&nbsp;XML
                        </Button>
                        <Button appearance="icon" onClick={addMember}><Codicon name="add" /></Button>
                        <Button appearance="icon" onClick={deleteSelected}><Codicon name="trash" /></Button>
                        {/* <Button appearance="icon"><Codicon name="kebab-vertical" /></Button> */}
                    </div>
                </div>
            }
            {type.members.map((member, index) => (
                <>
                    <FieldEditor selected={selectedMembers.includes(index)} member={member} onChange={handleMemberChange(index)} onSelect={onSelect(index)} onDeselect={onDeselect(index)} />
                </>
            ))}
        </div >
    );
});
