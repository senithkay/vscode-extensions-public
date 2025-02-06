import React, { useRef, useState } from 'react';
import { Member, Type } from '@wso2-enterprise/ballerina-core';
import { Button, CheckBox, Codicon, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { parseType, typeToSource } from './TypeUtil';

interface FieldEditorProps {
    member: Member;
    onChange: (member: Member) => void;
    onSelectedChanged: (selected: boolean) => void;
}

const ButtonDeactivated = styled.div<{}>`
    opacity: 0.5;
`;

const ButtonActive = styled.div<{}>`
    opacity: 1;
    color: 'var(--vscode-editorWarning-foreground)';
`;

export const FieldEditor: React.FC<FieldEditorProps> = (props) => {
    const { member, onChange, onSelectedChanged } = props;
    const [panelOpened, setPanelOpened] = useState<boolean>(false);
    const [selected, setSelected] = useState<boolean>(false);

    const handleMemberNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            name: e.target.value
        });
    }

    const handleMemberTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            type: parseType(e.target.value)
        });
    }

    const handleMemberDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            defaultValue: e.target.value
        });
    }

    const toggleRecord = () => {
    }

    const isRecord = (type: string | Type): boolean => {
        // if type is not a string, check if it is a record
        if (typeof type === 'object') {
            return type.codedata.node === 'RECORD';
        }
        return false;
    }

    return (
        <>
            <div style={{ display: 'flex', gap: '8px' }}>
                <CheckBox label="" checked={selected} onChange={() => { setSelected(!selected); onSelectedChanged(selected); }} />
                <TextField
                    value={member.name}
                    onBlur={handleMemberNameChange}
                />
                <TextField
                    value={typeToSource(member.type)}
                    onChange={handleMemberTypeChange}
                />
                <Button appearance="icon" onClick={toggleRecord}>
                    {isRecord(member.type) ? <ButtonActive>{`{`}&nbsp;{`}`}</ButtonActive> : <ButtonDeactivated>{`{`}&nbsp;{`}`}</ButtonDeactivated>}
                </Button>
                <Button appearance="icon" onClick={() => setPanelOpened(!panelOpened)}><Codicon name="kebab-vertical" /></Button>
            </div>
            {panelOpened && (
                <div style={{ display: 'flex', gap: '8px', border: '1px solid var(--vscode-welcomePage-tileBorder)', marginBottom: '10px', padding: '8px', borderRadius: '4px' }}>
                    <Button appearance="icon">? Optional</Button>
                    <Button appearance="icon">[] Array</Button>
                    <TextField value={member.defaultValue} onChange={handleMemberDefaultValueChange} placeholder='Default Value' style={{ width: '180px' }} />
                    <Button appearance="icon" onClick={() => setPanelOpened(false)}><Codicon name="close" /></Button>
                </div >
            )}
        </>
    );
};
