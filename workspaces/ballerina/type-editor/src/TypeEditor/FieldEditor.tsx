import React, { useEffect, useRef, useState } from 'react';
import { Member, Type } from '@wso2-enterprise/ballerina-core';
import { Button, CheckBox, Codicon, Position, TextField } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { typeToSource, defaultAnonymousRecordType, isValidBallerinaIdentifier } from './TypeUtil';
import { RecordEditor } from './RecordEditor';
import { TypeHelper } from '../TypeHelper';
import { AdvancedOptions } from './AdvancedOptions';

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
    const typeFieldRef = useRef<HTMLInputElement>(null);
    const typeHelperRef = useRef<HTMLDivElement>(null);
    const typeBrowserRef = useRef<HTMLDivElement>(null);
    const [typeFieldCursorPosition, setTypeFieldCursorPosition] = useState<number>(0);
    const [helperPaneOffset, setHelperPaneOffset] = useState<Position>({ top: 0, left: 0 });
    const [helperPaneOpened, setHelperPaneOpened] = useState<boolean>(false);
    const [nameError, setNameError] = useState<string>('');

    const toggleOptional = () => {
        onChange({
            ...member,
            optional: !member.optional
        });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            docs: e.target.value
        });
    }

    const handleMemberNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            name: e.target.value
        });
    }

    const handleMemberNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {        
        if (!isValidBallerinaIdentifier( e.target.value)) {
            setNameError('Invalid Identifier.');
        } else {
            setNameError('');
        }
    }

    const handleMemberTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...member,
            type: e.target.value
        });
    }

    const handleTypeHelperChange = (newType: string, newCursorPosition: number) => {
        onChange({
            ...member,
            type: newType
        });
        setTypeFieldCursorPosition(newCursorPosition);

        // Focus the type field
        typeFieldRef.current?.focus();
        // Set cursor position
        typeFieldRef.current?.shadowRoot
            ?.querySelector('input')
            ?.setSelectionRange(newCursorPosition, newCursorPosition);
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

    const handleTypeFieldFocus = () => {
        const rect = typeFieldRef.current.getBoundingClientRect();
        const sidePanelLeft = window.innerWidth - 400; // Side panel width
        const helperPaneLeftOffset = sidePanelLeft - rect.left;
        setHelperPaneOffset({ top: 0, left: helperPaneLeftOffset });
        setHelperPaneOpened(true);
    }

    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return;
        }

        const range = selection.getRangeAt(0);

        if (typeFieldRef.current?.parentElement?.contains(range.startContainer)) {
            setTypeFieldCursorPosition(
                typeFieldRef.current.shadowRoot.querySelector('input').selectionStart ?? 0
            );
        }
    }

    /* Track cursor position */
    useEffect(() => {
        const typeField = typeFieldRef.current;
        if (!typeField) {
            return;
        }

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        }
    }, [typeFieldRef.current]);

    const handleTypeFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        /* Prevent blur event when clicked on the type helper */
        const searchElements = Array.from(document.querySelectorAll('#helper-pane-search'));
        if (
            (typeHelperRef.current?.contains(e.relatedTarget as Node) ||
                typeBrowserRef.current?.contains(e.relatedTarget as Node)) &&
            !searchElements.some(element => element.contains(e.relatedTarget as Node))
        ) {
            e.preventDefault();
            e.stopPropagation();
            typeFieldRef.current?.shadowRoot?.querySelector('input')?.focus();
        }
    };

    return (
        <>
            <div style={{ display: 'flex', gap: '8px' }}>
                <CheckBox label="" checked={selected} onChange={() => { selected ? onDeselect() : onSelect(); }} />
                <TextField
                    value={member.name}
                    onChange={handleMemberNameChange}
                    onBlur={handleMemberNameBlur}
                    errorMsg={nameError}
                />
                <TextField
                    ref={typeFieldRef}
                    value={typeToSource(member.type)}
                    onChange={handleMemberTypeChange}
                    onFocus={handleTypeFieldFocus}
                    onBlur={handleTypeFieldBlur}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--vscode-welcomePage-tileBorder)', marginLeft: '25px', marginBottom: '10px', padding: '8px', borderRadius: '4px' }}>
                    <TextField label='Default Value' value={member.defaultValue} onChange={handleMemberDefaultValueChange} style={{ width: '180px' }} />
                    <TextField label='Description' value={member.docs} onChange={handleDescriptionChange} style={{ width: '180px' }} />
                    <CheckBox
                        label="Is Optional Field"
                        checked={member?.optional}
                        onChange={toggleOptional}
                    />
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
                    <AdvancedOptions type={member.type as Type} onChange={(type: Type) => onChange({ ...member, type })} />
                </div>
            )}
            <TypeHelper
                ref={typeHelperRef}
                typeFieldRef={typeFieldRef}
                typeBrowserRef={typeBrowserRef}
                currentType={typeToSource(member.type)}
                currentCursorPosition={typeFieldCursorPosition}
                onChange={handleTypeHelperChange}
                positionOffset={helperPaneOffset}
                open={helperPaneOpened}
                onClose={() => setHelperPaneOpened(false)}
            />
        </>
    );
};
