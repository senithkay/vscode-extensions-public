/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from "react";


import { LocalVarDecl } from "@wso2-enterprise/syntax-tree";
import { BallerinaConnectorInfo, BallerinaModuleResponse, BallerinaConnectorsRequest, BallerinaConstruct, STModification } from "@wso2-enterprise/ballerina-core";


import { BallerinaModuleType, Marketplace, SearchQueryParams } from "../Marketplace";
import { BallerinaRpcClient, useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { fetchConnectorInfo, getConnectorImports, getInitialSourceForConnectors } from "./utils";
import { set } from "lodash";
import { useVisualizerContext } from "../../../Context";
import { PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { StatementEditorComponent } from "../../StatementEditorComponent";
import { getSymbolInfo } from "@wso2-enterprise/ballerina-low-code-diagram";
import { URI } from "vscode-uri";


export interface ConnectorListProps {
    // onSelect: (connector: BallerinaConnectorInfo, selectedConnector: LocalVarDecl) => void;
    // onChange?: (type: string, subType: string, connector?: BallerinaConnectorInfo) => void;
    // onCancel?: () => void;
    applyModifications: (modifications: STModification[]) => Promise<void>;
}

export function ConnectorList(props: ConnectorListProps) {
    // const { onCancel } = props;
    // const { onSelect } = props.configOverlayFormStatus.formArgs as ConnectorListProps;
    const { applyModifications } = props;
    const [filePath, setFilePath] = useState<string>();
    const [pullingPackage, setPullingPackage] = useState(false);
    const [selectedConnector, setSelectedConnector] = useState<BallerinaConnectorInfo>();
    const [showStatementEditor, setShowStatementEditor] = useState<boolean>(false);
    const [initialSource, setInitialSource] = useState<string>();
    const { activeFileInfo, statementPosition, setActivePanel } = useVisualizerContext();
    const [fullST, setFullST] = useState<any>();


    const { rpcClient } = useRpcContext();

    useEffect(() => {
        rpcClient?.getVisualizerLocation().then(async (location) => {
            const fullST = await rpcClient.getLangClientRpcClient().getST({ documentIdentifier: { uri: URI.file(location.documentUri).toString()} });
            setFilePath(location.documentUri);
            setFullST(fullST);
        });


    }, []);

    useEffect( () => {
        if (
            !pullingPackage &&
            selectedConnector?.package?.organization &&
            selectedConnector.package.name
        ) {
            setPullingPackage(true);
            const imports = getConnectorImports(fullST.syntaxTree, selectedConnector.package.organization, selectedConnector.moduleName, true);
            if (imports && imports?.size > 0) {
                let pullCommand = "";
                imports.forEach((impt) => {
                    if (pullCommand !== "") {
                        pullCommand += ` && `;
                    }
                    pullCommand += `bal pull ${impt.replace(" as _", "")}`;
                });
                rpcClient.getCommonRpcClient().runBackgroundTerminalCommand({ command: pullCommand })
                    .then((res) => {
                        if (res.error && !res.message.includes("already exists")) {
                            // TODO: Handle error properly
                            console.error('Something wrong when pulling package: ', res.message);
                        }
                    })
                    .catch((err) => {
                        // TODO: Handle error properly
                        console.error('Something wrong when pulling package: ', err);
                    })
                    .finally(async () => {
                        setPullingPackage(false);
                        // get the initial source
                        const stSymbolInfo = getSymbolInfo();
                        const initialSource = await getInitialSourceForConnectors(selectedConnector, statementPosition, stSymbolInfo );
                        setInitialSource(initialSource);
                        setShowStatementEditor(true);
                    });
            } else {
                // get the initial source
                console.log("==no imports");

            }
        }
    }, [selectedConnector]);

    const fetchConnectorsList = async (
        queryParams: SearchQueryParams,
        currentFilePath: string,
        langClient: BallerinaRpcClient,
    ): Promise<BallerinaModuleResponse> => {
        const { query, category, filterState, limit, page } = queryParams;
        const request: BallerinaConnectorsRequest = {
            targetFile: currentFilePath,
            query,
            limit: limit,
        };
        if (category) {
            request.keyword = category;
        }
        // if (userInfo && filterState && filterState.hasOwnProperty("My Organization")) {
        //     request.organization = userInfo.selectedOrgHandle;
        // }
        if (page) {
            request.offset = (page - 1) * (limit || 5);
        }
        return langClient.getConnectorWizardRpcClient().getConnectors(request);
    };

    const onSelect = async (balModule: BallerinaConstruct, langClient: BallerinaRpcClient) => {
        // get metadata
        // create a get connector implementation
        const connectorMetadata = await fetchConnectorInfo(balModule, langClient, filePath);
        console.log ("connectorMetadata", connectorMetadata);
        setSelectedConnector(connectorMetadata);
        // pull the module
        // generate initialSource
        // do ST modification
    
    }

    const closeStatementEditor = () => {
        setShowStatementEditor(false);
        setActivePanel({ isActive: false });
    }

    const cancelStatementEditor = () => {
        setShowStatementEditor(false);
    }

    return (
        <>
            {pullingPackage && 
            (
                <PanelContainer title="PUlling pkgs" show={true} onClose={() => setActivePanel({ isActive: false })}>
                    <div>
                        <p>Fetching connector package</p>
                    </div>
                </PanelContainer>
            )}
            {filePath && !selectedConnector &&
                <Marketplace
                    currentFilePath={filePath}
                    onSelect={onSelect}
                    fetchModulesList={fetchConnectorsList}
                    title={"Connectors"}
                    shortName="connectors"
                />
            }
            {selectedConnector && !pullingPackage && filePath && showStatementEditor &&
                <PanelContainer title="Add Connector" show={true} onClose={() => setShowStatementEditor(false)}>
                    (
                    <StatementEditorComponent
                        label={"Connector"}
                        config={{ type: "Connector", model: null }}
                        initialSource={initialSource}
                        applyModifications={applyModifications}
                        currentFile={{
                            content: activeFileInfo?.fullST?.source || "",
                            path: filePath,
                            size: 1
                        }}
                        onCancel={cancelStatementEditor}
                        onClose={closeStatementEditor}
                        syntaxTree={activeFileInfo?.fullST}
                        targetPosition={statementPosition}
                        skipSemicolon={false}

                    />
                )
                </PanelContainer>

            }
        </>
    );
}

