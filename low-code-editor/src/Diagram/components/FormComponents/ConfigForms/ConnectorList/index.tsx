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
import React, { useContext } from "react";

import { LocalVarDecl } from "@ballerina/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { DiagramEditorLangClientInterface } from "../../../../../Definitions/diagram-editor-lang-client-interface";
import { BallerinaConnectorInfo, BallerinaConnectorsRequest, BallerinaModuleResponse } from "../../../../../Definitions/lang-client-extended";
import { UserState } from "../../../../../types";
import { APIHeightStates } from "../../../LowCodeDiagram/Components/DialogBoxes/PlusHolder";
import { PlusViewState } from "../../../LowCodeDiagram/ViewState";
import { FormGeneratorProps } from "../../FormGenerator";
import { BallerinaModuleType, FilterStateMap, Marketplace } from "../Marketplace";

export interface ConnectorListProps {
    onSelect: (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void;
}

export function ConnectorList(props: FormGeneratorProps) {
    const {
        props: { langServerURL },
        api: {
            ls: { getDiagramEditorLangClient },
        }
    } = useContext(Context);
    const { onSelect } = props.configOverlayFormStatus.formArgs as ConnectorListProps;
    const fetchConnectorsList = async (searchQuery: string, selectedCategory: string, connectorLimit: number, currentFilePath: string,
                                       filterState: FilterStateMap, userInfo: UserState, page?: number): Promise<BallerinaModuleResponse> => {
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient(langServerURL);
        const request: BallerinaConnectorsRequest = {
            targetFile: currentFilePath,
            query: searchQuery,
            keyword: selectedCategory,
            limit: connectorLimit,
        };

        const hasUserOrgFilter = filterState.hasOwnProperty("My Organization") ? filterState["My Organization"] : false;
        if (hasUserOrgFilter && userInfo) {
            request.organization = userInfo.selectedOrgHandle;
        }

        if (page) {
            request.offset = (page - 1) * connectorLimit;
        }

        return langClient.getConnectors(request);

    };
    return (
        <Marketplace
            balModuleType={BallerinaModuleType.Connector}
            onSelect={onSelect}
            fetchModulesList={fetchConnectorsList}
            title="API Calls"
            shortName="APIs"
        />
    );
}

