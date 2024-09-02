/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { create } from "zustand";
import { Node } from "ts-morph";

import { InputOutputPortModel } from "../components/Diagram/Port";
import { SubMappingConfigForm } from "src/components/DataMapper/SidePanel/SubMappingConfig/SubMappingConfigForm";

interface SubMappingConfig {
    isSMConfigPanelOpen: boolean;
    nextSubMappingIndex: number;
    suggestedNextSubMappingName: string;
}

export interface SubMappingConfigFormData {
    mappingName: string;
    mappingType: string | undefined;
    isArray: boolean;
}

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

export interface DataMapperIOConfigPanelState {
    isIOConfigPanelOpen: boolean;
    setIsIOConfigPanelOpen: (isIOConfigPanelOpen: boolean) => void;
    ioConfigPanelType: string;
    setIOConfigPanelType: (ioConfigPanelType: string) => void;
    isSchemaOverridden: boolean;
    setIsSchemaOverridden: (isSchemaOverridden: boolean) => void;
}

export interface DataMapperSubMappingConfigPanelState {
    subMappingConfig: SubMappingConfig;
    setSubMappingConfig: (subMappingConfig: SubMappingConfig) => void;
    resetSubMappingConfig: () => void;
    subMappingConfigFormData: SubMappingConfigFormData;
    setSubMappingConfigFormData: (subMappingConfigFormData: SubMappingConfigFormData) => void
}

export interface DataMapperExpressionBarState {
    focusedPort: InputOutputPortModel;
    lastFocusedPort: InputOutputPortModel;
    focusedFilter: Node;
    lastFocusedFilter: Node;
    inputPort: InputOutputPortModel;
    savedNodeValue: string;
    lastSavedNodeValue: string;
    setFocusedPort: (port: InputOutputPortModel) => void;
    setFocusedFilter: (port: Node) => void;
    setLastFocusedPort: (port: InputOutputPortModel) => void;
    setLastFocusedFilter: (port: Node) => void;
    setInputPort: (port: InputOutputPortModel) => void;
    setSavedNodeValue: (value: string) => void;
    setLastSavedNodeValue: (value: string) => void;
    resetFocus: () => void;
    resetInputPort: () => void;
    resetLastFocusedPort: () => void;
    resetLastFocusedFilter: () => void;
    resetSavedNodeValue: () => void;
    resetLastSavedNodeValue: () => void;
}

export interface DataMapperArrayFiltersState {
    addedNewFilter: boolean;
    isCollapsed: boolean;
    setAddedNewFilter: (addedNewFilter: boolean) => void;
    setIsCollapsed: (isCollapsed: boolean) => void;
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
    setCollapsedFields: (collapsedFields: string[]) => set({ collapsedFields }),
}));

export const useDMIOConfigPanelStore = create<DataMapperIOConfigPanelState>((set) => ({
    isIOConfigPanelOpen: false,
    setIsIOConfigPanelOpen: (isIOConfigPanelOpen: boolean) => set({ isIOConfigPanelOpen }),
    ioConfigPanelType: 'input',
    setIOConfigPanelType: (ioConfigPanelType: string) => set({ ioConfigPanelType }),
    isSchemaOverridden: false,
    setIsSchemaOverridden: (isSchemaOverridden: boolean) => set({ isSchemaOverridden }),
}));

export const useDMSubMappingConfigPanelStore = create<DataMapperSubMappingConfigPanelState>((set) => ({
    subMappingConfig: {
        isSMConfigPanelOpen: false,
        nextSubMappingIndex: -1,
        suggestedNextSubMappingName: undefined
    },
    setSubMappingConfig: (subMappingConfig: SubMappingConfig) => set({ subMappingConfig }),
    resetSubMappingConfig: () => set({
        subMappingConfig: {
            isSMConfigPanelOpen: false,
            nextSubMappingIndex: -1,
            suggestedNextSubMappingName: undefined
        },
        subMappingConfigFormData: undefined
    }),
    subMappingConfigFormData: undefined,
    setSubMappingConfigFormData: (subMappingConfigFormData: SubMappingConfigFormData) => set({ subMappingConfigFormData })
}));

export const useDMExpressionBarStore = create<DataMapperExpressionBarState>((set) => ({
    focusedPort: undefined,
    focusedFilter: undefined,
    lastFocusedPort: undefined,
    lastFocusedFilter: undefined,
    savedNodeValue: undefined,
    lastSavedNodeValue: undefined,
    inputPort: undefined,
    setFocusedPort: (focusedPort: InputOutputPortModel) => set({ focusedPort }),
    setFocusedFilter: (focusedFilter: Node) => set({ focusedFilter }),
    setLastFocusedPort: (lastFocusedPort: InputOutputPortModel) => set({ lastFocusedPort }),
    setLastFocusedFilter: (lastFocusedFilter: Node) => set({ lastFocusedFilter }),
    setSavedNodeValue: (savedNodeValue: string) => set({ savedNodeValue }),
    setLastSavedNodeValue: (lastSavedNodeValue: string) => set({ lastSavedNodeValue }),
    setInputPort: (inputPort: InputOutputPortModel) => set({ inputPort }),
    resetFocus: () => set({ focusedPort: undefined, focusedFilter: undefined }),
    resetInputPort: () => set({ inputPort: undefined }),
    resetLastFocusedPort: () => set({ lastFocusedPort: undefined }),
    resetLastFocusedFilter: () => set({ lastFocusedFilter: undefined }),
    resetSavedNodeValue: () => set({ savedNodeValue: undefined }),
    resetLastSavedNodeValue: () => set({ lastSavedNodeValue: undefined }),
}));

export const useDMArrayFilterStore = create<DataMapperArrayFiltersState>((set) => ({
    addedNewFilter: false,
    setAddedNewFilter: (addedNewFilter: boolean) => set({ addedNewFilter }),
    isCollapsed: false,
    setIsCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
}));
