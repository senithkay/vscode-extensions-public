/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { throttle } from 'lodash';
import React, { forwardRef, ReactNode, RefObject, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import styled from '@emotion/styled';
import { Transition } from '@headlessui/react';
import {
    ARROW_HEIGHT,
    COMPLETION_ITEM_KIND,
    Codicon,
    HelperPane,
    Position,
    Typography,
    getIcon
} from '@wso2-enterprise/ui-toolkit';

import { ANIMATION } from './constant';
import { getArrowPosition, getHelperPanePosition } from '../utils';

/* Types */
type HelperItem = {
    name: string;
    insertText: string;
    sortText: string;
};

type HelperCategory = {
    category: string;
    items: HelperItem[];
    sortText: string;
};

type InsertTypeConditionalProps = {
    insertType: 'global',
    insertText: string;
    insertLocation: 'start' | 'end';
} | {
    insertType: 'local',
    insertText: string;
    insertLocation?: never;
}

export type TypeHelperOption = InsertTypeConditionalProps & {
    name: string;
    getIcon: () => ReactNode;
};

type TypeHelperProps = {
    // Reference to the focused type field element
    typeFieldRef: RefObject<HTMLElement>;
    // Array of helper categories containing insertable items
    categories: HelperCategory[];
    // Array of helper options for type field completion
    options: TypeHelperOption[];
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

    export const OptionContainer = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    export const Option = styled.div`
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
        categories,
        options,
        positionOffset = { top: 0, left: 0 },
        open,
        currentType,
        currentCursorPosition,
        onChange,
        onClose
    } = props;
        const [searchValue, setSearchValue] = useState<string>('');
        const [position, setPosition] = useState<Record<string, Position>>({
            helperPane: { top: 0, left: 0 },
            arrow: { top: 0, left: 0 }
        });
    
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
    
        const handleOptionClick = (option: TypeHelperOption) => {
            if (option.insertType === 'global') {
                if (option.insertLocation === 'start') {
                    onChange(option.insertText + ' ' + currentType.trimStart(), currentCursorPosition + option.insertText.length + 1);
                } else {
                    onChange(currentType.trimEnd() + option.insertText, currentCursorPosition);
                }
            } else {
                const suffixRegex = /^[a-zA-Z0-9_']*/;
                const suffixMatch = currentType.slice(currentCursorPosition).match(suffixRegex);
    
                if (suffixMatch) {
                    const newCursorPosition = currentCursorPosition + suffixMatch[0].length;
                    onChange(
                        currentType.slice(0, newCursorPosition) + option.insertText + currentType.slice(newCursorPosition),
                        newCursorPosition + option.insertText.length
                    );
                }
            }
        };
    
        const handleCompletionItemClick = (item: HelperItem) => {
            const prefixRegex = /[a-zA-Z0-9_']*$/;
            const suffixRegex = /^[a-zA-Z0-9_']*/;
            const prefixMatch = currentType.slice(0, currentCursorPosition).match(prefixRegex);
            const suffixMatch = currentType.slice(currentCursorPosition).match(suffixRegex);
            const prefixCursorPosition = currentCursorPosition - (prefixMatch?.[0]?.length ?? 0);
            const suffixCursorPosition = currentCursorPosition + (suffixMatch?.[0]?.length ?? 0);
    
            onChange(
                currentType.slice(0, prefixCursorPosition)
                + item.insertText
                + currentType.slice(suffixCursorPosition),
                prefixCursorPosition + item.insertText.length
            );
        };
    
        const sortedCategories = useMemo(() => {
            // Sort categories by category sortText
            const sortedCategories = categories.sort((a, b) => {
                return a.sortText.localeCompare(b.sortText);
            });
    
            // Sort items by within categories by sortText
            const sortedCategoriesAndItems = sortedCategories.map((category) => {
                return {
                    ...category,
                    items: category.items.sort((a, b) => a.sortText.localeCompare(b.sortText))
                };
            });
    
            return sortedCategoriesAndItems;
        }, [categories]);
    
        return (
            <>
                {/* If a type field is focused */}
                {typeFieldRef.current &&
                    createPortal(
                        <S.Container tabIndex={0} ref={ref} sx={position.helperPane}>
                            <Transition show={open} {...ANIMATION}>
                                <HelperPane sx={{ height: '100vh' }}>
                                    <HelperPane.Header
                                        title="Type Helper"
                                        titleSx={{ fontFamily: 'GilmerRegular' }}
                                        onClose={onClose}
                                        searchValue={searchValue}
                                        onSearch={setSearchValue}
                                    />
                                    <HelperPane.Body>
                                        <HelperPane.Panels>
                                            {/* Type helper tabs */}
                                            <HelperPane.PanelTab title="Type" id={0} />
                                            <HelperPane.PanelTab title="Operators" id={1} />
    
                                            {/* Type helper panel views */}
                                            <HelperPane.PanelView id={0}>
                                                {sortedCategories?.length > 0 &&
                                                    sortedCategories.map((category) => (
                                                        <HelperPane.Section
                                                            key={category.category}
                                                            title={category.category}
                                                            titleSx={{ fontFamily: 'GilmerMedium' }}
                                                            columns={2}
                                                        >
                                                            {category.items.map((item) => (
                                                                <HelperPane.CompletionItem
                                                                    key={`${category.category}-${item.name}`}
                                                                    label={item.name}
                                                                    getIcon={() =>
                                                                        getIcon(COMPLETION_ITEM_KIND.TypeParameter)
                                                                    }
                                                                    onClick={() => handleCompletionItemClick(item)}
                                                                />
                                                            ))}
                                                        </HelperPane.Section>
                                                    ))}
                                            </HelperPane.PanelView>
                                            <HelperPane.PanelView id={1}>
                                                <S.OptionContainer>
                                                    {options?.length > 0 &&
                                                        options.map((option) => (
                                                            <S.Option
                                                                key={option.name}
                                                                onClick={() => handleOptionClick(option)}
                                                            >
                                                                <S.OptionIcon>{option.getIcon()}</S.OptionIcon>
                                                                <Typography variant="body3">{option.name}</Typography>
                                                            </S.Option>
                                                        ))}
                                                </S.OptionContainer>
                                            </HelperPane.PanelView>
                                        </HelperPane.Panels>
                                    </HelperPane.Body>
                                    <HelperPane.Footer>
                                        <HelperPane.IconButton
                                            title="Open type browser"
                                            getIcon={() => <Codicon name="library" />}
                                            onClick={() => console.log("Open type browser")}
                                        />
                                    </HelperPane.Footer>
                                    {/* TODO: Add type browser */}
                                </HelperPane>
                                <S.Arrow sx={position.arrow} />
                            </Transition>
                        </S.Container>,
                        document.body
                    )}
            </>
        );
});
TypeHelper.displayName = "TypeHelper";
