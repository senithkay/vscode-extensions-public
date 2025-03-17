/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { NodeList, Category as PanelCategory, FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import {
    BIAvailableNodesRequest,
    Category,
    AvailableNode,
    LineRange,
    EVENT_TYPE,
    MACHINE_VIEW,
    FUNCTION_TYPE,
    ParentPopupData,
    BISearchRequest,
    CodeData,
    AgentToolRequest,
} from "@wso2-enterprise/ballerina-core";

import {
    convertBICategoriesToSidePanelCategories,
    convertFunctionCategoriesToSidePanelCategories,
} from "../../../utils/bi";
import FormGeneratorNew from "../Forms/FormGeneratorNew";
import { RelativeLoader } from "../../../components/RelativeLoader";
import styled from "@emotion/styled";

const LoaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

export enum SidePanelView {
    NODE_LIST = "NODE_LIST",
    TOOL_FORM = "TOOL_FORM",
}

export interface BIFlowDiagramProps {
    projectPath: string;
    onSubmit: (data: AgentToolRequest) => void;
}

export function AIAgentSidePanel(props: BIFlowDiagramProps) {
    const { projectPath, onSubmit } = props;
    const { rpcClient } = useRpcContext();

    const [sidePanelView, setSidePanelView] = useState<SidePanelView>(SidePanelView.NODE_LIST);
    const [categories, setCategories] = useState<PanelCategory[]>([]);
    const [selectedNodeCodeData, setSelectedNodeCodeData] = useState<CodeData>(undefined);
    const [loading, setLoading] = useState<boolean>(false);

    const targetRef = useRef<LineRange>({ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } });
    const initialCategoriesRef = useRef<PanelCategory[]>([]);

    useEffect(() => {
        fetchNodes();
    }, []);

    // Use effects to refresh the panel
    useEffect(() => {
        rpcClient.onProjectContentUpdated((state: boolean) => {
            console.log(">>> on project content updated", state);
            fetchNodes();
        });
        rpcClient.onParentPopupSubmitted((parent: ParentPopupData) => {
            console.log(">>> on parent popup submitted", parent);
            fetchNodes();
        });
    }, [rpcClient]);

    const fetchNodes = () => {
        setLoading(true);
        const getNodeRequest: BIAvailableNodesRequest = {
            position: targetRef.current.startLine,
            filePath: projectPath,
        };
        rpcClient
            .getBIDiagramRpcClient()
            .getAvailableNodes(getNodeRequest)
            .then(async (response) => {
                console.log(">>> Available nodes", response);
                if (!response.categories) {
                    console.error(">>> Error getting available nodes", response);
                    return;
                }
                const connectionsCategory = response.categories.filter(
                    (item) => item.metadata.label === "Connections"
                ) as Category[];
                console.log("connectionsCategory", connectionsCategory);
                const convertedCategories = convertBICategoriesToSidePanelCategories(connectionsCategory);
                console.log("convertedCategories", convertedCategories);

                const filteredFunctions = await handleSearchFunction("", FUNCTION_TYPE.REGULAR, false);
                console.log("filteredFunctions", filteredFunctions);

                const filteredCategories = convertedCategories.concat(filteredFunctions);
                setCategories(filteredCategories);
                console.log("filteredCategories", filteredCategories);
                initialCategoriesRef.current = filteredCategories; // Store initial categories
                setSidePanelView(SidePanelView.NODE_LIST);
                setLoading(false);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSearchFunction = async (
        searchText: string,
        functionType: FUNCTION_TYPE,
        isSearching: boolean = true
    ) => {
        const request: BISearchRequest = {
            position: {
                startLine: targetRef.current.startLine,
                endLine: targetRef.current.endLine,
            },
            filePath: projectPath,
            queryMap: searchText.trim()
                ? {
                      q: searchText,
                      limit: 12,
                      offset: 0,
                      includeAvailableFunctions: "true",
                  }
                : undefined,
            searchKind: "FUNCTION",
        };
        const response = await rpcClient.getBIDiagramRpcClient().search(request);
        if (isSearching && !searchText) {
            setCategories(initialCategoriesRef.current); // Reset the categories list when the search input is empty
            return;
        }
        if (isSearching && searchText) {
            setCategories(
                convertFunctionCategoriesToSidePanelCategories(response.categories as Category[], functionType)
            );
            return;
        }
        if (!response || !response.categories) {
            return [];
        }
        return convertFunctionCategoriesToSidePanelCategories(response.categories as Category[], functionType);
    };

    const handleOnSelectNode = (nodeId: string, metadata?: any) => {
        const { node } = metadata as { node: AvailableNode };
        // default node
        console.log(">>> on select node", { nodeId, metadata });
        setSelectedNodeCodeData(node.codedata);
        setSidePanelView(SidePanelView.TOOL_FORM);
    };

    const handleOnAddConnection = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.AddConnectionWizard,
                documentUri: projectPath,
            },
            isPopup: true,
        });
    };

    const handleOnAddFunction = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIFunctionForm,
            },
            isPopup: true,
        });
    };

    const handleToolSubmit = (data: FormValues) => {
        // Safely convert name to camelCase, handling any input
        const name = data["name"] || "";
        const camelCaseName =
            name
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, " ")
                .split(" ")
                .filter(Boolean)
                .map((word: string, index: number) =>
                    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join("") || "newTool";

        const toolModel: AgentToolRequest = {
            toolName: camelCaseName,
            description: data["description"],
            selectedCodeData: selectedNodeCodeData,
        };
        console.log("New Agent Tool:", toolModel);
        onSubmit(toolModel);
    };

    const fields: FormField[] = [
        {
            key: `name`,
            label: "Tool Name",
            type: "IDENTIFIER",
            optional: false,
            editable: true,
            documentation: "Enter the name of the tool.",
            value: "",
            valueTypeConstraint: "",
            enabled: true,
        },
        {
            key: `description`,
            label: "Description",
            type: "TEXTAREA",
            optional: true,
            editable: true,
            documentation: "Enter the description of the tool.",
            value: "",
            valueType: "STRING",
            valueTypeConstraint: "",
            enabled: true,
        },
    ];

    const handleOnCancel = () => {
        setSidePanelView(SidePanelView.NODE_LIST);
    };

    return (
        <>
            {loading && (
                <LoaderContainer>
                    <RelativeLoader />
                </LoaderContainer>
            )}
            {!loading && sidePanelView === SidePanelView.NODE_LIST && categories?.length > 0 && (
                <NodeList
                    categories={categories}
                    onSelect={handleOnSelectNode}
                    onAddConnection={handleOnAddConnection}
                    onSearchTextChange={(searchText) => handleSearchFunction(searchText, FUNCTION_TYPE.REGULAR, true)}
                    title={"Functions"}
                />
            )}
            {sidePanelView === SidePanelView.TOOL_FORM && (
                <FormGeneratorNew
                    fileName={projectPath}
                    targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                    fields={fields}
                    onBack={handleOnCancel}
                    onSubmit={handleToolSubmit}
                    submitText={"Save Tool"}
                />
            )}
        </>
    );
}
