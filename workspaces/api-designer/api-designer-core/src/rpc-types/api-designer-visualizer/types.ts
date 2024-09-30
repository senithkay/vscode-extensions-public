/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { HistoryEntry } from "../../history";
import { EVENT_TYPE, PopupVisualizerLocation, VisualizerLocation } from "../../state-machine-types";

export interface OpenViewRequest {
    type: EVENT_TYPE;
    location: VisualizerLocation | PopupVisualizerLocation;
    isPopup?: boolean;
}

export interface HistoryEntryResponse {
    history: HistoryEntry[];
}

export interface GoToSourceRequest {
    filePath: string;
    position?: Range;
}

export interface Range {
    start: {
        line: number;
        column: number;
    };
    end: {
        line: number;
        column: number;
    };
}

export interface GetOpenAPIContentResponse {
    content: string;
    type: "yaml" | "json" | undefined;
}

export interface GetOpenAPIContentRequest {
    filePath: string;
}

export interface WriteOpenAPIContentRequest {
    filePath: string;
    content: string;
}

export interface WriteOpenAPIContentResponse {
    success: boolean;
}
