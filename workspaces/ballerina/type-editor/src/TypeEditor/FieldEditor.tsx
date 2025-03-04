import React, { useRef, useState } from 'react';
import { Member, Type } from '@wso2-enterprise/ballerina-core';
import { Button, CheckBox, Codicon, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { parseType, typeToSource, defaultAnonymousRecordType } from './TypeUtil';
import { RecordEditor } from './RecordEditor';


interface FieldEditorProps {
    member: Member;
    selected: boolean;
    onChange: (member: Member) => void;
    onSelect: () => void;
    onDeselect: () => void;
}

const ButtonDeactivated = styled.div<{}>`
    opacity: 0.5;
`;

const ButtonActive = styled.div<{}>`
    opacity: 1;
    color: 'var(--vscode-editorWarning-foreground)';
`;

export const FieldEditor: React.FC<FieldEditorProps> = (props) => {
    const { member, selected, onChange, onSelect, onDeselect } = props;
    const [panelOpened, setPanelOpened] = useState<boolean>(false);
    const recordEditorRef = useRef<{ addMember: () => void }>(null);

    const handleMemberNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            name: e.target.value
        });
    }

    const handleMemberTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            type: e.target.value
        });
    }

    const handleMemberDefaultValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            defaultValue: e.target.value
        });
    }

    const toggleRecord = () => {
        if (!isRecord(member.type)) {
            onChange({
                ...member,
                //@ts-ignore
                type: defaultAnonymousRecordType
            });
        } else {
            onChange({
                ...member,
                type: 'string'
            });
        }
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
                <CheckBox label="" checked={selected} onChange={() => { selected ? onDeselect() : onSelect(); }} />
                <TextField
                    value={member.name}
                    onBlur={handleMemberNameChange}
                />
                <TextField
                    value={typeToSource(member.type)}
                    onChange={handleMemberTypeChange}
                />
                {isRecord(member.type) &&
                    <Button appearance="icon" onClick={() => recordEditorRef.current?.addMember()}>
                        <Codicon name="add" />
                    </Button>
                }
                <Button appearance="icon" onClick={toggleRecord}>
                    {isRecord(member.type) ? <ButtonActive>{`{`}&nbsp;{`}`}</ButtonActive> : <ButtonDeactivated>{`{`}&nbsp;{`}`}</ButtonDeactivated>}
                </Button>
                <Button appearance="icon" onClick={() => setPanelOpened(!panelOpened)}><Codicon name="kebab-vertical" /></Button>
            </div>
            {panelOpened && (
                <div style={{ border: '1px solid var(--vscode-welcomePage-tileBorder)', marginLeft: '25px', marginBottom: '10px', padding: '8px', borderRadius: '4px' }}>
                    <TextField label='Default Value' value={member.defaultValue} onChange={handleMemberDefaultValueChange} style={{ width: '180px' }} />
                    <TextField label='Description' value={''} onChange={() => { }} style={{ width: '180px' }} />
                </div >
            )}
            {isRecord(member.type) && typeof member.type !== 'string' && (
                <div style={{ marginLeft: '24px' }}>
                    <RecordEditor
                        ref={recordEditorRef}
                        isAnonymous={true}
                        type={member.type as Type}
                        onChange={(type: Type) => onChange({ ...member, type })}
                        onImportJson={() => { }}
                        onImportXml={() => { }}
                    />
                </div>
            )}
        </>
    );
};
