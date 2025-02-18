/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { ResourceAccessorDefinition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { Button, Icon, Switch, View, ThemeColors } from "@wso2-enterprise/ui-toolkit";
import { BIFlowDiagram } from "../FlowDiagram";
import { BISequenceDiagram } from "../SequenceDiagram";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { TitleBar } from "../../../components/TitleBar";
import { EVENT_TYPE } from "@wso2-enterprise/ballerina-core";
import { VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import styled from "@emotion/styled";

const ActionButton = styled(Button)`
    display: flex;
    align-items: center;
    gap: 4px;
`;

const SubTitleWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const AccessorType = styled.span`
    background-color: ${ThemeColors.SURFACE_BRIGHT};
    color: ${ThemeColors.BADGE};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
`;

const Path = styled.span`
    color: ${ThemeColors.ON_SURFACE};
    font-family: var(--vscode-editor-font-family);
    font-size: 13px;
`;

const Parameters = styled.span`
    color: var(--vscode-textPreformat-foreground);
    font-family: var(--vscode-editor-font-family);
    font-size: 13px;
`;

export interface DiagramWrapperProps {
    syntaxTree: STNode;
    projectPath: string;
}

export function DiagramWrapper(param: DiagramWrapperProps) {
    const { syntaxTree, projectPath } = param;
    const { rpcClient } = useRpcContext();

    const [showSequenceDiagram, setShowSequenceDiagram] = useState(false);
    const [enableSequenceDiagram, setEnableSequenceDiagram] = useState(false);
    const [loadingDiagram, setLoadingDiagram] = useState(false);
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        rpcClient.getVisualizerLocation().then((location) => {
            if (location.metadata?.enableSequenceDiagram) {
                setEnableSequenceDiagram(true);
            }
        });
    }, [rpcClient]);

    const handleToggleDiagram = () => {
        setShowSequenceDiagram(!showSequenceDiagram);
    };

    const handleUpdateDiagram = () => {
        setLoadingDiagram(true);
    };

    const handleReadyDiagram = (fileName?: string) => {
        setLoadingDiagram(false);
        if (fileName) {
            setFileName(fileName);
        }
    };

    const handleEdit = (fileUri?: string) => {
        const context: VisualizerLocation = {
            view: MACHINE_VIEW.BIFunctionForm,
            identifier: (syntaxTree as ResourceAccessorDefinition).functionName.value,
            documentUri: fileUri
        };
        rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
    };

    let isResource = false;
    let method = "";

    if (STKindChecker.isResourceAccessorDefinition(syntaxTree)) {
        isResource = true;
        method = (syntaxTree as ResourceAccessorDefinition).functionName.value;
    } else if (STKindChecker.isFunctionDefinition(syntaxTree)) {
        isResource = false;
        method = syntaxTree.functionName.value;
    }

    return (
        <View>
            <TopNavigationBar />
            {isResource && (
                <TitleBar
                    title={"Resource"}
                    subtitleElement={
                        <SubTitleWrapper>
                            <AccessorType>{method}</AccessorType>
                            <Path>{getResourcePath(syntaxTree)}</Path>
                            <Parameters>({getParameters(syntaxTree)})</Parameters>
                        </SubTitleWrapper>
                    }
                />
            )}
            {!isResource && (
                <TitleBar
                    title={"Function"}
                    subtitleElement={
                        <SubTitleWrapper>
                            <Path>{method}</Path>
                            <Parameters>({getParameters(syntaxTree)})</Parameters>
                        </SubTitleWrapper>
                    }
                    actions={
                        <ActionButton appearance="secondary" onClick={() => handleEdit(fileName)}>
                            <Icon name="bi-edit" sx={{ marginRight: 5, width: 16, height: 16, fontSize: 14 }} />
                            Edit
                        </ActionButton>
                    }
                />
            )}
            {enableSequenceDiagram && (
                <Switch
                    leftLabel="Flow"
                    rightLabel="Sequence"
                    checked={showSequenceDiagram}
                    checkedColor="var(--vscode-button-background)"
                    enableTransition={true}
                    onChange={handleToggleDiagram}
                    sx={{
                        margin: "auto",
                        position: "fixed",
                        top: "120px",
                        right: "16px",
                        zIndex: "3",
                        border: "unset",
                    }}
                    disabled={loadingDiagram}
                />
            )}
            {showSequenceDiagram ? (
                <BISequenceDiagram onUpdate={handleUpdateDiagram} onReady={handleReadyDiagram} />
            ) : (
                <BIFlowDiagram
                    syntaxTree={syntaxTree}
                    projectPath={projectPath}
                    onUpdate={handleUpdateDiagram}
                    onReady={handleReadyDiagram}
                />
            )}
        </View>
    );
}

function getResourcePath(resource: STNode) {
    let resourcePath = "";
    if (STKindChecker.isResourceAccessorDefinition(resource)) {
        resource.relativeResourcePath?.forEach((path, index) => {
            resourcePath += STKindChecker.isResourcePathSegmentParam(path) ? path.source : path?.value;
        });
    }
    return resourcePath;
}

function getParameters(syntaxTree: STNode) {
    if (STKindChecker.isResourceAccessorDefinition(syntaxTree)) {
        return syntaxTree.functionSignature.parameters
            .map((param) => {
                if (!STKindChecker.isCommaToken(param)) {
                    return `${param.paramName.value}: ${param.typeName.source.trim()}`;
                }
                return null;
            })
            .filter(Boolean)
            .join(", ");
    } else if (STKindChecker.isFunctionDefinition(syntaxTree)) {
        return syntaxTree.functionSignature.parameters
            .map((param) => {
                if (!STKindChecker.isCommaToken(param)) {
                    return `${param.paramName.value}: ${param.typeName.source.trim()}`;
                }
                return null;
            })
            .filter(Boolean)
            .join(", ");
    }
    return "";
}

export default DiagramWrapper;
