/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface GraphqlDesignModel {
    graphqlService: Service;
    records: Map<string, RecordComponent>;
    serviceClasses: Map<string, ServiceClassComponent>;
    enums: Map<string, EnumComponent>;
    unions: Map<string, UnionComponent>;
    interfaces: Map<string, InterfaceComponent>;
    hierarchicalResources : Map<string, HierarchicalResourceComponent>;
}

export interface Service {
    serviceName: string;
    position: Position;
    description: string;
    resourceFunctions: ResourceFunction[];
    remoteFunctions: RemoteFunction[];
}

export interface RecordComponent {
    name: string;
    position: Position;
    description: string;
    recordFields: RecordField[];
    isInputObject: boolean;
}

export interface ServiceClassComponent {
    serviceName: string;
    position: Position;
    description: string;
    functions: ServiceClassField[];
}

export interface EnumComponent {
    name: string;
    position: Position;
    description: string;
    enumFields: EnumField[];
}

export interface UnionComponent {
    name: string;
    position: Position;
    description: string;
    possibleTypes: Interaction[];
}

export interface InterfaceComponent {
    name: string;
    position: Position;
    description: string;
    possibleTypes: Interaction[];
    resourceFunctions: ResourceFunction[];
}

export interface HierarchicalResourceComponent {
    name: string;
    hierarchicalResources: ResourceFunction[];
}

export interface Position {
    filePath: string;
    startLine: LinePosition;
    endLine: LinePosition;
}

interface LinePosition {
    line: number;
    offset: number;
}

export interface ResourceFunction {
    identifier: string;
    subscription: boolean;
    returns: string;
    position: Position;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    parameters: Param[];
    interactions: Interaction[];
}

export interface RemoteFunction {
    identifier: string;
    returns: string;
    position: Position;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    parameters: Param[];
    interactions: Interaction[];
}

export interface RecordField {
    name: string;
    type: string;
    defaultValue: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    interactions: Interaction[];
}

export interface ServiceClassField {
    identifier: string;
    returnType: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
    parameters: Param[];
    interactions: Interaction[];
}

export interface EnumField {
    name: string;
    description: string;
    isDeprecated: boolean;
    deprecationReason: string;
}

export interface Param {
    type: string;
    name: string;
    description: string;
    defaultValue: string;
}

export interface Interaction {
    componentName: string;
    path: string;
}

// enums

export enum FunctionType {
    QUERY = "Query",
    MUTATION = "Mutation",
    SUBSCRIPTION = "Subscription",
    CLASS_RESOURCE = "ClassResource"
}

export enum DefaultColors {
    PRIMARY = "#5567D5",
    ON_PRIMARY = "#FFF",
    PRIMARY_CONTAINER = "#F0F1FB",

    SECONDARY = "#ffaf4d",
    ON_SECONDARY = "#FFF",
    SECONDARY_CONTAINER = "#fffaf2",

    SURFACE_BRIGHT = "#FFF",
    SURFACE = "#F7F8FB",
    SURFACE_DIM = "#CBCEDB",
    ON_SURFACE = "#000",
    ON_SURFACE_VARIANT = "#40404B",
    SURFACE_CONTAINER = "#cfd1f3",

    OUTLINE = "#393939",
    OUTLINE_VARIANT = "#a8a8a8",

    ERROR = "#ED2633",
}

export enum VSCodeColors {
    PRIMARY = "var(--vscode-button-background)",
    ON_PRIMARY = "var(--vscode-button-foreground)",
    PRIMARY_CONTAINER = "var(--vscode-sideBar-background)",

    SECONDARY = "var(--vscode-editorLightBulb-foreground)",
    ON_SECONDARY = "var(--vscode-button-foreground)",
    SECONDARY_CONTAINER = "var(--vscode-sideBar-background)",
    SECONDARY_BUTTON = "var(--button-secondary-background)",

    SURFACE_BRIGHT = "var(--vscode-editor-background)",
    SURFACE = "var(--vscode-sideBar-background)",
    SURFACE_DIM = "var(--vscode-menu-background)",
    SURFACE_DIM_2 = "var(--vscode-tab-unfocusedInactiveBackground)",
    ON_SURFACE = "var(--vscode-foreground)",
    ON_SURFACE_VARIANT = "var(--vscode-icon-foreground)",
    SURFACE_CONTAINER = "var(--vscode-editor-inactiveSelectionBackground)",

    OUTLINE = "var(--vscode-sideBar-border)",
    OUTLINE_VARIANT = "var(--vscode-dropdown-border)",

    ERROR = "var(--vscode-errorForeground)",
}

export const ThemeColors = {
    PRIMARY: VSCodeColors.PRIMARY || DefaultColors.PRIMARY,
    ON_PRIMARY: VSCodeColors.ON_PRIMARY || DefaultColors.ON_PRIMARY,
    PRIMARY_CONTAINER: VSCodeColors.PRIMARY_CONTAINER || DefaultColors.PRIMARY_CONTAINER,

    SECONDARY: VSCodeColors.SECONDARY || DefaultColors.SECONDARY,
    ON_SECONDARY: VSCodeColors.ON_SECONDARY || DefaultColors.ON_SECONDARY,
    SECONDARY_CONTAINER: VSCodeColors.SECONDARY_CONTAINER || DefaultColors.SECONDARY_CONTAINER,
    SECONDARY_BUTTON: VSCodeColors.SECONDARY_BUTTON || DefaultColors.SECONDARY,

    SURFACE_BRIGHT: VSCodeColors.SURFACE_BRIGHT || DefaultColors.SURFACE_BRIGHT,
    SURFACE: VSCodeColors.SURFACE || DefaultColors.SURFACE,
    SURFACE_DIM: VSCodeColors.SURFACE_DIM || DefaultColors.SURFACE_DIM,
    SURFACE_DIM_2: VSCodeColors.SURFACE_DIM_2 || DefaultColors.SURFACE_DIM,
    ON_SURFACE: VSCodeColors.ON_SURFACE || DefaultColors.ON_SURFACE,
    ON_SURFACE_VARIANT: VSCodeColors.ON_SURFACE_VARIANT || DefaultColors.ON_SURFACE_VARIANT,
    SURFACE_CONTAINER: VSCodeColors.SURFACE_CONTAINER || DefaultColors.SURFACE_CONTAINER,

    OUTLINE: VSCodeColors.OUTLINE || DefaultColors.OUTLINE,
    OUTLINE_VARIANT: VSCodeColors.OUTLINE_VARIANT || DefaultColors.OUTLINE_VARIANT,

    ERROR: VSCodeColors.ERROR || DefaultColors.ERROR,
};

