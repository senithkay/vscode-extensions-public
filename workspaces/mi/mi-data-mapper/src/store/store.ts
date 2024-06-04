/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { InputOutputPortModel } from 'src/components/Diagram/Port';
import { create } from 'zustand';

export interface DataMapperSearchState {
    inputSearch: string;
    setInputSearch: (inputSearch: string) => void;
    outputSearch: string;
    setOutputSearch: (outputSearch: string) => void;
    resetSearchStore: () => void;
}

export interface DataMapperCollapsedFieldsState {
    collapsedFields: string[];
    setCollapsedFields: (fields: string[]) => void;
}

export interface DataMapperSidePanelState {
    sidePanelOpen: boolean;
    setSidePanelOpen: (sidePanelOpen: boolean) => void;
    sidePanelIOType: string;
    setSidePanelIOType: (sidePanelIOType: string) => void;
    isSchemaOverridden: boolean;
    setIsSchemaOverridden: (isSchemaOverridden: boolean) => void;
}

export interface DataMapperExpressionBarState {
    focusedPort: InputOutputPortModel;
    inputPort: InputOutputPortModel;
    setFocusedPort: (port: InputOutputPortModel) => void;
    setInputPort: (port: InputOutputPortModel) => void;
    resetFocusedPort: () => void;
    resetInputPort: () => void;
}

export const useDMSearchStore = create<DataMapperSearchState>((set) => ({
    inputSearch: "",
    outputSearch: "",
    setInputSearch: (inputSearch: string) => set({ inputSearch }),
    setOutputSearch: (outputSearch: string) => set({ outputSearch }),
    resetSearchStore: () => set({ inputSearch: '', outputSearch: '' })
}));

export const useDMCollapsedFieldsStore = create<DataMapperCollapsedFieldsState>((set) => ({
    collapsedFields: [],
    setCollapsedFields: (collapsedFields: string[])  => set({ collapsedFields }),
}));

export const useDMSidePanelStore = create<DataMapperSidePanelState>((set) => ({
    sidePanelOpen: false,
    setSidePanelOpen: (sidePanelOpen: boolean) => set({ sidePanelOpen }),
    sidePanelIOType: 'input',
    setSidePanelIOType: (sidePanelIOType: string) => set({ sidePanelIOType }),
    isSchemaOverridden: false,
    setIsSchemaOverridden: (isSchemaOverridden: boolean) => set({ isSchemaOverridden }),
}));

export const useDMExpressionBarStore = create<DataMapperExpressionBarState>((set) => ({
    focusedPort: undefined,
    setFocusedPort: (focusedPort: InputOutputPortModel) => set({ focusedPort }),
    inputPort: undefined,
    setInputPort: (inputPort: InputOutputPortModel) => set({ inputPort }),
    resetFocusedPort: () => set({ focusedPort: undefined }),
    resetInputPort: () => set({ inputPort: undefined })
}));
