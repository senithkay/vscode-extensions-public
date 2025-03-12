/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { TextField, Position } from '@wso2-enterprise/ui-toolkit';
import { Member, Type } from '@wso2-enterprise/ballerina-core';
import { typeToSource } from './TypeUtil';
import { TypeHelper } from '../TypeHelper';

interface TypeFieldProps {
    type: string | Type;
    memberName: string;
    onChange: (value: string) => void;
    placeholder?: string;
    sx?: React.CSSProperties;
}

// TODO: User TypeField for all the Type fields in TypeEditor
export const TypeField = forwardRef<HTMLInputElement, TypeFieldProps>((props, ref) => {
    const { type, onChange, placeholder, sx, memberName } = props;

    const typeFieldRef = useRef<HTMLInputElement>(null);
    const typeHelperRef = useRef<HTMLDivElement>(null);
    const typeBrowserRef = useRef<HTMLDivElement>(null);
    const [typeFieldCursorPosition, setTypeFieldCursorPosition] = useState<number>(0);
    const [helperPaneOffset, setHelperPaneOffset] = useState<Position>({ top: 0, left: 0 });
    const [helperPaneOpened, setHelperPaneOpened] = useState<boolean>(false);

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleTypeHelperChange = (newType: string, newCursorPosition: number) => {
        onChange(newType);
        setTypeFieldCursorPosition(newCursorPosition);

        // Focus the type field
        typeFieldRef.current?.focus();
        // Set cursor position
        typeFieldRef.current?.shadowRoot
            ?.querySelector('input')
            ?.setSelectionRange(newCursorPosition, newCursorPosition);
    };

    const handleTypeFieldFocus = () => {
        const rect = typeFieldRef.current.getBoundingClientRect();
        const sidePanelLeft = window.innerWidth - 400; // Side panel width
        const helperPaneLeftOffset = sidePanelLeft - rect.left;
        setHelperPaneOffset({ top: 0, left: helperPaneLeftOffset });
        setHelperPaneOpened(true);
    };

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

    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection) {
            return;
        }

        const range = selection.getRangeAt(0);

        if (typeFieldRef.current.parentElement.contains(range.startContainer)) {
            setTypeFieldCursorPosition(
                typeFieldRef.current.shadowRoot.querySelector('input').selectionStart ?? 0
            );
        }
    };

    /* Track cursor position */
    useEffect(() => {
        const typeField = typeFieldRef.current;
        if (!typeField) {
            return;
        }

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [typeFieldRef.current]);

    return (
        <>
            <TextField
                ref={typeFieldRef}
                placeholder={placeholder}
                sx={sx}
                value={memberName}
                onChange={handleTypeChange}
                onFocus={handleTypeFieldFocus}
                onBlur={handleTypeFieldBlur}
            />
            <TypeHelper
                ref={typeHelperRef}
                typeFieldRef={typeFieldRef}
                typeBrowserRef={typeBrowserRef}
                currentType={typeToSource(type)}
                currentCursorPosition={typeFieldCursorPosition}
                onChange={handleTypeHelperChange}
                positionOffset={helperPaneOffset}
                open={helperPaneOpened}
                onClose={() => setHelperPaneOpened(false)}
            />
        </>
    );
});
