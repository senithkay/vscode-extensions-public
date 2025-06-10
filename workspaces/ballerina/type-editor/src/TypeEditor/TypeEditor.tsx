/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { SidePanelBody, ProgressRing, Tabs } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BallerinaRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { Member, Type, TypeNodeKind, Imports, AddImportItemResponse } from "@wso2-enterprise/ballerina-core";
import { TypeHelperCategory, TypeHelperItem, TypeHelperOperator } from "../TypeHelper";
import { TypeHelperContext } from "../Context";
import { ImportTab } from "./Tabs/ImportTab";
import { TypeCreatorTab } from "./Tabs/TypeCreatorTab";

namespace S {
    export const Container = styled(SidePanelBody)`
        display: flex;
        flex-direction: column;
        padding: 0px;
    `;
}

interface TypeEditorProps {
    type?: Type;
    imports?: Imports;
    rpcClient: BallerinaRpcClient;
    onTypeChange: (type: Type) => void;
    newType: boolean;
    newTypeValue?: string;
    isGraphql?: boolean;
    typeHelper: {
        loading?: boolean;
        loadingTypeBrowser?: boolean;
        referenceTypes: TypeHelperCategory[];
        basicTypes: TypeHelperCategory[];
        importedTypes: TypeHelperCategory[];
        operators: TypeHelperOperator[];
        typeBrowserTypes: TypeHelperCategory[];
        onSearchTypeHelper: (searchText: string, isType?: boolean) => void;
        onSearchTypeBrowser: (searchText: string) => void;
        onTypeItemClick: (item: TypeHelperItem) => Promise<AddImportItemResponse>;
        onCloseCompletions?: () => void;
    }
}


export function TypeEditor(props: TypeEditorProps) {
    console.log("===TypeEditorProps===", props);
    const { isGraphql, newType } = props;

    let initialTypeKind = props.type?.codedata?.node;// TODO: RECHECK LOGIC HERE

    const type: Type = (() => {
        if (props.type) {
            return props.type;
        }
        // Initialize with default type for new types
        const defaultType = {
            name: props.newTypeValue ?? "",
            members: [] as Member[],
            editable: true,
            metadata: {
                description: "",
                deprecated: false,
                readonly: false,
                label: ""
            },
            properties: {},
            codedata: {
                node: "RECORD" as TypeNodeKind
            },
            includes: [] as string[],
            allowAdditionalFields: false
        };
        if (!initialTypeKind) {
            initialTypeKind = defaultType.codedata.node;
        }
        return defaultType as unknown as Type;
    })();

    const [activeTab, setActiveTab] = useState<string>("create-from-scratch");


    const onTypeSave = async (type: Type) => {
        const name = type.name;
        // IF type nodeKind is CLASS then we call graphqlEndpoint
        // TODO: for TypeDiagram we need to give a generic class creation
        if (type.codedata.node === "CLASS") {
            const response = await props.rpcClient
                .getBIDiagramRpcClient()
                .createGraphqlClassType({ filePath: type.codedata?.lineRange?.fileName || 'types.bal', type, description: "" });

        } else {
            const response = await props.rpcClient
                .getBIDiagramRpcClient()
                .updateType({ filePath: type.codedata?.lineRange?.fileName || 'types.bal', type, description: "" });
        }
        props.onTypeChange(type);
    }

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    }

    return (
        <TypeHelperContext.Provider value={props.typeHelper}>
            <S.Container>
                {!type ? (
                    <ProgressRing />
                ) : newType ? (
                    <Tabs
                        views={[
                            { id: 'create-from-scratch', name: 'Create from Scratch' },
                            { id: 'import', name: 'Import' }
                        ]}
                        currentViewId={activeTab}
                        onViewChange={handleTabChange}
                    >
                        <div id="create-from-scratch" style={{ padding: '10px' }}>
                            <TypeCreatorTab
                                editingType={type}
                                newType={newType}
                                isGraphql={isGraphql}
                                initialTypeKind={initialTypeKind}
                                onTypeSave={onTypeSave}
                            />
                        </div>
                        <div id="import" style={{ padding: '10px' }}>
                            <ImportTab
                                type={type}
                                onTypeSave={onTypeSave}
                            />
                        </div>
                    </Tabs>
                ) : (
                    <div style={{ padding: '10px' }}>
                        <TypeCreatorTab
                            editingType={type}
                            newType={newType}
                            isGraphql={isGraphql}
                            initialTypeKind={initialTypeKind}
                            onTypeSave={onTypeSave}
                        />
                    </div>
                )}
            </S.Container>
        </TypeHelperContext.Provider>
    );
}
