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
import React, { useContext, useEffect } from "react";

import { BallerinaConnectorInfo, BallerinaConnectorsRequest, BallerinaModuleResponse, DiagramEditorLangClientInterface } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { UserState } from "../../../../../types";
import { APIHeightStates } from "../../../LowCodeDiagram/Components/DialogBoxes/PlusHolder";
import { PlusViewState } from "../../../LowCodeDiagram/ViewState";
import { FormGeneratorProps } from "../../FormGenerator";
import { BallerinaModuleType, FilterStateMap, Marketplace, SearchQueryParams } from "../Marketplace";
import { ADD_CONNECTOR, EVENT_TYPE_AZURE_APP_INSIGHTS, LowcodeEvent } from "../../../../models";

export interface ConnectorListProps {
    onSelect: (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void;
    onCancel?: () => void;
}

export function ConnectorList(props: FormGeneratorProps) {
    const {
        api: {
            ls: { getDiagramEditorLangClient },
            insights: { onEvent }
        }
    } = useContext(Context);
    const { onSelect, onCancel } = props.configOverlayFormStatus.formArgs as ConnectorListProps;

    //Insight event to send when loading the component
    useEffect(() => {
        const event: LowcodeEvent = {
            type: ADD_CONNECTOR,
            name: '',
            property: ''
        };
        onEvent(event);
    }, []);

    const fetchConnectorsList = async (
        queryParams: SearchQueryParams,
        currentFilePath: string,
        userInfo?: UserState
    ): Promise<BallerinaModuleResponse> => {
        const { query, category, filterState, limit, page } = queryParams;
        const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient();
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

