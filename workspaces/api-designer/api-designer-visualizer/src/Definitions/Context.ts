import { Views } from "../constants";
import { OpenAPI } from "./ServiceDefinitions";

/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export interface APIDesignerContext {
    props: {
        openAPIVersion: string;
        openAPI: OpenAPI;
        selectedComponent?: string | undefined;
        view?: Views;
        isNewFile?: boolean;
        currentView?: Views;
    };
    api: {
        onOpenAPIDefinitionChange: (openAPI: OpenAPI, selectedComponent?: string, currentView?: Views) => void;
        onSelectedComponentChange?: (component: string) => void;
        onIsNewFileChange?: (isNewFile: boolean) => void;
        onCurrentViewChange?: (currentView: Views) => void;
    };
}