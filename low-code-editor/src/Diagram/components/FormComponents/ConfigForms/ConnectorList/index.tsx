/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { BallerinaConnectorInfo, BallerinaConnectorsRequest, BallerinaModuleResponse, DiagramEditorLangClientInterface } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { UserState } from "../../../../../types";
import { PlusViewState } from "../../../LowCodeDiagram/ViewState";
import { APIHeightStates } from "../../DialogBoxes/PlusHolder";
import { FormGeneratorProps } from "../../FormGenerator";
import { BallerinaModuleType, Marketplace, SearchQueryParams } from "../Marketplace";

export interface ConnectorListProps {
    onSelect: (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void;
    onCancel?: () => void;
}

export const fetchConnectorsList = async (
    queryParams: SearchQueryParams,
    currentFilePath: string,
    langClient: DiagramEditorLangClientInterface,
    userInfo?: UserState
): Promise<BallerinaModuleResponse> => {
    const { query, category, filterState, limit, page } = queryParams;
    const request: BallerinaConnectorsRequest = {
        targetFile: currentFilePath,
        query,
        limit,
    };
    if (category) {
        request.keyword = category;
    }
    if (userInfo && filterState && filterState.hasOwnProperty("My Organization")) {
        request.organization = userInfo.selectedOrgHandle;
    }
    if (page) {
        request.offset = (page - 1) * limit;
    }
    return langClient.getConnectors(request);
};

export function ConnectorList(props: FormGeneratorProps) {
    const { onSelect, onCancel } = props.configOverlayFormStatus.formArgs as ConnectorListProps;

    return (
        <Marketplace
            balModuleType={BallerinaModuleType.Connector}
            onSelect={onSelect}
            onCancel={onCancel}
            fetchModulesList={fetchConnectorsList}
            title="Connectors"
            shortName="connectors"
        />
    );
}

