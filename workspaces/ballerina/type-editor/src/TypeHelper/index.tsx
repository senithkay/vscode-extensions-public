/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { throttle } from 'lodash';
import React, { forwardRef, ReactNode, RefObject, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styled from '@emotion/styled';
import { Transition } from '@headlessui/react';
import {
    ARROW_HEIGHT,
    CompletionItemKind,
    Position
} from '@wso2-enterprise/ui-toolkit';

import { ANIMATION } from './constant';
import { getArrowPosition, getHelperPanePosition } from '../utils';
import { TypeHelperComponent } from './TypeHelper';
import { CodeData, FunctionKind } from '@wso2-enterprise/ballerina-core';

/* Types */
export type TypeHelperItem = {
    name: string;
    insertText: string;
    sortText?: string;
    type: CompletionItemKind;
    codedata?: CodeData;
    kind?: FunctionKind;
};

export type TypeHelperCategory = {
    category: string;
    subCategory?: TypeHelperCategory[];
    items?: TypeHelperItem[];
    sortText?: string;
};

type InsertTypeConditionalProps =
    | {
          insertType: 'global';
          insertText: string;
          insertLocation: 'start' | 'end';
      }
    | {
          insertType: 'local';
          insertText: string;
          insertLocation?: never;
      };

export type TypeHelperOperator = InsertTypeConditionalProps & {
    name: string;
    getIcon: () => ReactNode;
};

type TypeHelperProps = {
    // Reference to the focused type field element
    typeFieldRef: RefObject<HTMLElement>;
    // Reference to the type browser element
    typeBrowserRef: RefObject<HTMLDivElement>;
    // Offset position of the helper pane
    positionOffset?: Position;
    // Whether the helper pane is open
    open: boolean;
    // Current type of the type field
    currentType: string;
    // Current cursor position of the type field
    currentCursorPosition: number;
    // Callback function to update the type field
    onChange: (newType: string, newCursorPosition: number) => void;
    // Callback function to close the helper pane
    onClose: () => void;
    // Callback function to close the completions
    onCloseCompletions?: () => void;
    /* Context props */
    loading?: boolean;
    loadingTypeBrowser?: boolean;
    referenceTypes: TypeHelperCategory[];
    basicTypes: TypeHelperCategory[];
    importedTypes: TypeHelperCategory[];
    operators: TypeHelperOperator[];
    typeBrowserTypes: TypeHelperCategory[];
    onSearchTypeHelper: (searchText: string, isType: boolean) => void;
    onSearchTypeBrowser: (searchText: string) => void;
    onTypeItemClick: (item: TypeHelperItem) => Promise<string>;
    onTypeCreate?: (typeName?: string) => void;
};

type StyleBase = {
    sx?: React.CSSProperties;
};

/* Styles */
namespace S {
    export const Container = styled.div<StyleBase>`
        position: absolute;
        z-index: 2001;
        filter: drop-shadow(0 3px 8px rgb(0 0 0 / 0.2));

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        ${(props) => props.sx && { ...props.sx }}
    `;

    export const OperatorContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    export const Operator = styled.div`
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 2px 4px;
        cursor: pointer;

        &:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
    `;

    export const OptionIcon = styled.div`
        margin-top: 2px;
    `;

    export const CategoryContainer = styled.div`
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
    `;

    export const ItemContainer = styled.div`
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    `;

    export const Item = styled.div`
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px;
        border-radius: 4px;
    `;

    export const Arrow = styled.div<StyleBase>`
        position: absolute;
        height: ${ARROW_HEIGHT}px;
        width: ${ARROW_HEIGHT}px;
        background-color: var(--vscode-dropdown-background);
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        transform: rotate(90deg);

        ${(props) => props.sx && { ...props.sx }}
    `;
}

export const TypeHelper = forwardRef<HTMLDivElement, TypeHelperProps>((props, ref) => {
    const {
        typeFieldRef,
        typeBrowserRef,
        positionOffset = { top: 0, left: 0 },
        open,
        onClose,
        ...rest
    } = props;

    const typeHelperRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Record<string, Position>>({
        helperPane: { top: 0, left: 0 },
        arrow: { top: 0, left: 0 }
    });

    useImperativeHandle(ref, () => typeHelperRef.current);

    const updatePosition = throttle(() => {
        if (typeFieldRef.current) {
            setPosition({
                helperPane: getHelperPanePosition(typeFieldRef, positionOffset),
                arrow: getArrowPosition(typeFieldRef, position.helperPane)
            });
        }
    }, 10);

    useEffect(() => {
        updatePosition();

        // Handle window resize
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('resize', updatePosition);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, positionOffset]);

    /* Close the helper pane on outside click */
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (
                !typeFieldRef.current.parentElement.contains(e.target as Node) &&
                !typeHelperRef.current.contains(e.target as Node) &&
                !typeBrowserRef.current?.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [typeFieldRef.current, typeBrowserRef.current, onClose]);

    return (
        <>
            {/* If a type field is focused */}
            {typeFieldRef.current &&
                createPortal(
                    <S.Container tabIndex={0} ref={typeHelperRef} sx={position.helperPane}>
                        <Transition show={open} {...ANIMATION}>
                            <TypeHelperComponent
                                open={open}
                                typeBrowserRef={typeBrowserRef}
                                onClose={onClose}
                                {...rest}
                            />
                            <S.Arrow sx={position.arrow} />
                        </Transition>
                    </S.Container>,
                    document.body
                )}
        </>
    );
});
TypeHelper.displayName = 'TypeHelper';
