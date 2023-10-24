/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { render } from "react-dom";
import { CMLocation as Location, GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { DesignDiagram } from "./DesignDiagram";
import { WebviewEditLayerAPI } from "./editing";

export function renderDesignDiagrams(
    isEditable: boolean,
    isChoreoProject: boolean,
    selectedNodeId: string,
    isCellView: boolean,
    getComponentModel: () => Promise<GetComponentModelResponse>,
    showChoreoProjectOverview: () => Promise<void>,
    deleteComponent: (location: Location, deletePkg: boolean) => Promise<void>,
    target: HTMLElement
) {
    render(
        <DesignDiagram
            isEditable={isEditable}
            isChoreoProject={isChoreoProject}
            selectedNodeId={selectedNodeId}
            isCellView={isCellView}
            getComponentModel={getComponentModel}
            showChoreoProjectOverview={showChoreoProjectOverview}
            editLayerAPI={WebviewEditLayerAPI.getInstance()}
            deleteComponent={deleteComponent}
        />,
        target
    );
}

export { DesignDiagram } from "./DesignDiagram";