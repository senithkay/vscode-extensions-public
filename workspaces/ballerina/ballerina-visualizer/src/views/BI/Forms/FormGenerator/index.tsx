/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    EVENT_TYPE,
    FlowNode,
    LineRange,
    NodePosition,
    SubPanel,
    VisualizerLocation,
    TRIGGER_CHARACTERS,
    TriggerCharacter,
    FormDiagnostics,
    ConfigVariable,
    TextEdit,
    FunctionKind
} from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues, Form, ExpressionFormField, FormExpressionEditorProps, HelperPaneData, HelperPaneCompletionItem } from "@wso2-enterprise/ballerina-side-panel";
import {
    convertBalCompletion,
    convertNodePropertiesToFormFields,
    convertToFnSignature,
    convertToHelperPaneConfigurableVariable,
    convertToHelperPaneFunction,
    convertToHelperPaneVariable,
    convertToVisibleTypes,
    enrichFormPropertiesWithValueConstraint,
    extractFunctionInsertText,
    getFormProperties,
    updateLineRange,
    updateNodeProperties,
} from "../../../../utils/bi";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { RecordEditor } from "../../../RecordEditor/RecordEditor";
import { RemoveEmptyNodesVisitor, traverseNode } from "@wso2-enterprise/bi-diagram";
import IfForm from "../IfForm";
import { CompletionItem } from "@wso2-enterprise/ui-toolkit";
import { debounce, set } from "lodash";
import { URI, Utils } from "vscode-uri";

interface FormProps {
    fileName: string;
    node: FlowNode;
    nodeFormTemplate?: FlowNode; // used in edit forms
    connections?: FlowNode[];
    clientName?: string;
    targetLineRange: LineRange;
    projectPath?: string;
    editForm?: boolean;
    onSubmit: (node?: FlowNode, isDataMapper?: boolean) => void;
    isActiveSubPanel?: boolean;
    openSubPanel?: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
}

export function FormGenerator(props: FormProps) {
    const {
        fileName,
        node,
        nodeFormTemplate,
        connections,
        clientName,
        targetLineRange,
        projectPath,
        editForm,
        onSubmit,
        openSubPanel,
        isActiveSubPanel,
        updatedExpressionField,
        resetUpdatedExpressionField
    } = props;

    const { rpcClient } = useRpcContext();

    const [fields, setFields] = useState<FormField[]>([]);
    const [showRecordEditor, setShowRecordEditor] = useState(false);

    /* Expression editor related state and ref variables */
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [isLoadingHelperPaneInfo, setIsLoadingHelperPaneInfo] = useState<boolean>(false);
    const [variableInfo, setVariableInfo] = useState<HelperPaneData>();
    const [configVariableInfo, setConfigVariableInfo] = useState<HelperPaneData>();
    const [functionInfo, setFunctionInfo] = useState<HelperPaneData>();
    const [libraryBrowserInfo, setLibraryBrowserInfo] = useState<HelperPaneData>();
    const triggerCompletionOnNextRequest = useRef<boolean>(false);
    const expressionOffsetRef = useRef<number>(0); // To track the expression offset on adding import statements

    useEffect(() => {
        if (!node) {
            return;
        }
        if (node.codedata.node === "IF") {
            return;
        }
        initForm();
        handleFormOpen();

        return () => {
            handleFormClose();
        };
    }, [node]);

    const handleFormOpen = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .formDidOpen({ filePath: fileName })
            .then(() => {
                console.log('>>> Form opened');
            });
    };

    const handleFormClose = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .formDidClose({ filePath: fileName })
            .then(() => {
                console.log('>>> Form closed');
            });
    };

    const initForm = () => {
        const formProperties = getFormProperties(node);
        let enrichedNodeProperties;
        if (nodeFormTemplate) {
            const formTemplateProperties = getFormProperties(nodeFormTemplate);
            enrichedNodeProperties = enrichFormPropertiesWithValueConstraint(formProperties, formTemplateProperties);
            console.log(">>> Form properties", { formProperties, formTemplateProperties, enrichedNodeProperties });
        }
        if (Object.keys(formProperties).length === 0) {
            // update node position
            node.codedata.lineRange = {
                ...targetLineRange,
                fileName: fileName,
            };
            // add node to source code
            onSubmit();
            return;
        }

        // hide connection property if node is a REMOTE_ACTION_CALL or RESOURCE_ACTION_CALL node
        if (node.codedata.node === "REMOTE_ACTION_CALL" || node.codedata.node === "RESOURCE_ACTION_CALL") {
            if (enrichedNodeProperties) {
                enrichedNodeProperties.connection.optional = true;
            } else {
                formProperties.connection.optional = true;
            }
        }

        // get node properties
        setFields(convertNodePropertiesToFormFields(enrichedNodeProperties || formProperties, connections, clientName));
    };

    const handleOnSubmit = (data: FormValues) => {
        console.log(">>> on form generator submit", data);
        if (node && targetLineRange) {
            let updatedNode: FlowNode = {
                ...node,
                codedata: {
                    ...node.codedata,
                    lineRange: {
                        ...node.codedata.lineRange,
                        startLine: targetLineRange.startLine,
                        endLine: targetLineRange.endLine,
                    },
                },
            };

            // assign to a existing variable
            if ("update-variable" in data) {
                data["variable"] = data["update-variable"];
                data["type"] = "";
            }

            if (node.branches?.at(0)?.properties) {
                // branch properties
                // TODO: Handle multiple branches
                const updatedNodeProperties = updateNodeProperties(data, node.branches.at(0).properties);
                updatedNode.branches.at(0).properties = updatedNodeProperties;
            } else if (node.properties) {
                // node properties
                const updatedNodeProperties = updateNodeProperties(data, node.properties);
                updatedNode.properties = updatedNodeProperties;
            } else {
                console.error(">>> Error updating source code. No properties found");
            }
            console.log(">>> Updated node", updatedNode);

            // check all nodes and remove empty nodes
            const removeEmptyNodeVisitor = new RemoveEmptyNodesVisitor(updatedNode);
            traverseNode(updatedNode, removeEmptyNodeVisitor);
            const updatedNodeWithoutEmptyNodes = removeEmptyNodeVisitor.getNode();

            const isDataMapperFormUpdate = data["isDataMapperFormUpdate"];

            onSubmit(updatedNodeWithoutEmptyNodes, isDataMapperFormUpdate);
        }
    };

    const handleOpenView = async (filePath: string, position: NodePosition) => {
        console.log(">>> open view: ", { filePath, position });
        const context: VisualizerLocation = {
            documentUri: filePath,
            position: position,
        };
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
    };

    const handleOpenRecordEditor = (isOpen: boolean, f: FormValues) => {
        // Get f.value and assign that value to field value
        const updatedFields = fields.map((field) => {
            const updatedField = { ...field };
            if (f[field.key]) {
                updatedField.value = f[field.key];
            }
            return updatedField;
        });
        setFields(updatedFields);
        setShowRecordEditor(isOpen);
    };

    /* Expression editor related functions */
    const handleExpressionEditorCancel = () => {
        setFilteredCompletions([]);
        setCompletions([]);
        setFilteredTypes([]);
        setTypes([]);
        triggerCompletionOnNextRequest.current = false;
    };

    const debouncedRetrieveCompletions = useCallback(debounce(
        async (value: string, key: string, offset: number, triggerCharacter?: string, onlyVariables?: boolean) => {
            let expressionCompletions: CompletionItem[] = [];
            const effectiveText = value.slice(0, offset);
            const completionFetchText = effectiveText.match(/[a-zA-Z0-9_']+$/)?.[0] ?? "";
            const endOfStatementRegex = /[\)\]]\s*$/;
            if (offset > 0 && endOfStatementRegex.test(effectiveText)) {
                // Case 1: When a character unrelated to triggering completions is entered
                setCompletions([]);
            } else if (
                completions.length > 0 &&
                completionFetchText.length > 0 &&
                !triggerCharacter &&
                !onlyVariables &&
                !triggerCompletionOnNextRequest.current
            ) {
                // Case 2: When completions have already been retrieved and only need to be filtered
                expressionCompletions = completions
                    .filter((completion) => {
                        const lowerCaseText = completionFetchText.toLowerCase();
                        const lowerCaseLabel = completion.label.toLowerCase();

                        return lowerCaseLabel.includes(lowerCaseText);
                    })
                    .sort((a, b) => a.sortText.localeCompare(b.sortText));
            } else {
                // Case 3: When completions need to be retrieved from the language server
                // Retrieve completions from the ls
                let completions = await rpcClient.getBIDiagramRpcClient().getExpressionCompletions({
                    filePath: fileName,
                    context: {
                        expression: value,
                        startLine: updateLineRange(targetLineRange, expressionOffsetRef.current).startLine,
                        offset: offset,
                        node: node,
                        property: key
                    },
                    completionContext: {
                        triggerKind: triggerCharacter ? 2 : 1,
                        triggerCharacter: triggerCharacter as TriggerCharacter
                    }
                });

                if (onlyVariables) {
                    // If only variables are requested, filter out the completions based on the kind
                    // 'kind' for variables = 6
                    completions = completions?.filter((completion) => completion.kind === 6);
                    triggerCompletionOnNextRequest.current = true;
                } else {
                    triggerCompletionOnNextRequest.current = false;
                }

                // Convert completions to the ExpressionBar format
                let convertedCompletions: CompletionItem[] = [];
                completions?.forEach((completion) => {
                    if (completion.detail) {
                        // HACK: Currently, completion with additional edits apart from imports are not supported
                        // Completions that modify the expression itself (ex: member access)
                        convertedCompletions.push(convertBalCompletion(completion));
                    }
                });
                setCompletions(convertedCompletions);

                if (triggerCharacter) {
                    expressionCompletions = convertedCompletions;
                } else {
                    expressionCompletions = convertedCompletions
                        .filter((completion) => {
                            const lowerCaseText = completionFetchText.toLowerCase();
                            const lowerCaseLabel = completion.label.toLowerCase();

                            return lowerCaseLabel.includes(lowerCaseText);
                        })
                        .sort((a, b) => a.sortText.localeCompare(b.sortText));
                }
            }

            setFilteredCompletions(expressionCompletions);
        },
        250
    ), [rpcClient, completions, fileName, targetLineRange, node, triggerCompletionOnNextRequest.current]);

    const handleRetrieveCompletions = useCallback(async (
        value: string,
        key: string,
        offset: number,
        triggerCharacter?: string,
        onlyVariables?: boolean
    ) => {
        await debouncedRetrieveCompletions(value, key, offset, triggerCharacter, onlyVariables);

        if (triggerCharacter) {
            await debouncedRetrieveCompletions.flush();
        }
    }, [debouncedRetrieveCompletions]);

    const debouncedGetVisibleTypes = useCallback(debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: fileName,
                position: updateLineRange(targetLineRange, expressionOffsetRef.current).startLine,
            });

            visibleTypes = convertToVisibleTypes(response.types);
            setTypes(visibleTypes);
        }

        const effectiveText = value.slice(0, cursorPosition);
        let filteredTypes = visibleTypes.filter((type) => {
            const lowerCaseText = effectiveText.toLowerCase();
            const lowerCaseLabel = type.label.toLowerCase();

            return lowerCaseLabel.includes(lowerCaseText);
        });

        setFilteredTypes(filteredTypes);
    }, 250), [rpcClient, types, fileName, targetLineRange]);

    const handleGetVisibleTypes = useCallback(async (value: string, cursorPosition: number) => {
        await debouncedGetVisibleTypes(value, cursorPosition);
    }, [debouncedGetVisibleTypes]);

    const extractArgsFromFunction = async (value: string, key: string, cursorPosition: number) => {
        const signatureHelp = await rpcClient.getBIDiagramRpcClient().getSignatureHelp({
            filePath: fileName,
            context: {
                expression: value,
                startLine: updateLineRange(targetLineRange, expressionOffsetRef.current).startLine,
                offset: cursorPosition,
                node: node,
                property: key
            },
            signatureHelpContext: {
                isRetrigger: false,
                triggerKind: 1
            }
        });

        return convertToFnSignature(signatureHelp);
    };

    const handleExpressionFormDiagnostics = useCallback(debounce(async (
        showDiagnostics: boolean,
        expression: string,
        key: string,
        setDiagnosticsInfo: (diagnostics: FormDiagnostics) => void,
        shouldUpdateNode?: boolean,
        variableType?: string
    ) => {
        if (!showDiagnostics) {
            setDiagnosticsInfo({ key, diagnostics: [] });
            return;
        }

        // HACK: For variable nodes, update the type value in the node
        if (shouldUpdateNode) {
            node.properties["type"].value = variableType;
        }

        const response = await rpcClient.getBIDiagramRpcClient().getExpressionDiagnostics({
            filePath: fileName,
            context: {
                expression: expression,
                startLine: updateLineRange(targetLineRange, expressionOffsetRef.current).startLine,
                offset: 0,
                node: node,
                property: key
            },
        });

        setDiagnosticsInfo({ key, diagnostics: response.diagnostics });
    }, 250), [rpcClient, fileName, targetLineRange, node]);

    const getHelperPaneData = useCallback(
        debounce((type: string, searchText: string) => {
            const updatedTargetLineRange = updateLineRange(targetLineRange, expressionOffsetRef.current);
            switch (type) {
                case 'variables': {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getVisibleVariableTypes({
                            filePath: fileName,
                            position: {
                                line: updatedTargetLineRange.startLine.line,
                                offset: updatedTargetLineRange.startLine.offset
                            }
                        })
                        .then((response) => {
                            if (response.categories?.length) {
                                setVariableInfo(convertToHelperPaneVariable(response.categories));
                            }
                        })
                        .then(() => setIsLoadingHelperPaneInfo(false));
                    break;
                }
                case 'configurable': {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getVisibleVariableTypes({
                            filePath: fileName,
                            position: {
                                line: updatedTargetLineRange.startLine.line,
                                offset: updatedTargetLineRange.startLine.offset
                            }
                        })
                        .then((response) => {
                            if (response.categories?.length) {
                                setConfigVariableInfo(convertToHelperPaneConfigurableVariable(response.categories));
                            }
                        })
                        .then(() => setIsLoadingHelperPaneInfo(false));
                    break;
                }
                case 'functions': {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getFunctions({
                            position: updatedTargetLineRange,
                            filePath: fileName,
                            queryMap: {
                                q: searchText.trim(),
                                limit: 12,
                                offset: 0
                            }
                        })
                        .then((response) => {
                            if (response.categories?.length) {
                                setFunctionInfo(convertToHelperPaneFunction(response.categories));
                            }
                        })
                        .then(() => setIsLoadingHelperPaneInfo(false));
                    break;
                }
                case 'libraries': {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getFunctions({
                            position: updatedTargetLineRange,
                            filePath: fileName,
                            queryMap: {
                                q: searchText.trim(),
                                limit: 12,
                                offset: 0,
                                includeAvailableFunctions: "true"
                            }
                        })
                        .then((response) => {
                            if (response.categories?.length) {
                                setLibraryBrowserInfo(convertToHelperPaneFunction(response.categories));
                            }
                        })
                        .then(() => setIsLoadingHelperPaneInfo(false));
                    break;
                }
            }
        }, 1100),
        [rpcClient, targetLineRange, fileName]
    );

    const handleGetHelperPaneData = useCallback((type: string, searchText: string) => {
        setIsLoadingHelperPaneInfo(true);
        getHelperPaneData(type, searchText);
    }, [getHelperPaneData]);

    const handleCompletionItemSelect = async (value: string, additionalTextEdits?: TextEdit[]) => {
        if (additionalTextEdits?.[0].newText) {
            const response = await rpcClient.getBIDiagramRpcClient().updateImports({
                filePath: fileName,
                importStatement: additionalTextEdits[0].newText
            });
            expressionOffsetRef.current += response.importStatementOffset;
        }
        debouncedRetrieveCompletions.cancel();
        debouncedGetVisibleTypes.cancel();
        handleExpressionEditorCancel();
    };

    const handleFunctionItemSelect = async (item: HelperPaneCompletionItem) => {
        const response = await rpcClient.getBIDiagramRpcClient().addFunction({
            filePath: fileName,
            codedata: item.codedata,
            kind: item.kind as FunctionKind
        })

        if (response.template) {
            return extractFunctionInsertText(response.template);
        }

        return "";
    }

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    function handleSaveConfigurables(values: any): void {

        const variable: ConfigVariable = {
            "id": "",
            "metadata": {
                "label": "Config",
                "description": "Create a configurable variable"
            },
            "codedata": {
                "node": "CONFIG_VARIABLE",
                "lineRange": {
                    "fileName": "config.bal",
                    "startLine": {
                        "line": 0,
                        "offset": 0
                    },
                    "endLine": {
                        "line": 0,
                        "offset": 0
                    }
                }
            },
            "returning": false,
            "properties": {
                "type": {
                    "metadata": {
                        "label": "Type",
                        "description": "Type of the variable"
                    },
                    "valueType": "TYPE",
                    "value": "",
                    "optional": false,
                    "advanced": false,
                    "editable": true
                },
                "variable": {
                    "metadata": {
                        "label": "Variable",
                        "description": "Name of the variable"
                    },
                    "valueType": "IDENTIFIER",
                    "value": "",
                    "optional": false,
                    "advanced": false,
                    "editable": true,
                },
                "defaultable": {
                    "metadata": {
                        "label": "Default value",
                        "description": "Default value for the config, if empty your need to provide a value at runtime"
                    },
                    "valueType": "EXPRESSION",
                    "value": "",
                    "optional": true,
                    "advanced": true,
                    "editable": true
                }
            },
            branches: []
        };

        variable.properties.variable.value = values.confName;
        variable.properties.defaultable.value =
        values.confValue === "" || values.confValue === null ?
                "?"
                : '"' + values.confValue + '"';
        variable.properties.defaultable.optional = true;
        variable.properties.type.value = "anydata";

        rpcClient.getVisualizerLocation().then((location) => {
            rpcClient
                .getBIDiagramRpcClient()
                .updateConfigVariables({
                    configVariable: variable,
                    configFilePath: Utils.joinPath(URI.file(location.projectUri), 'config.bal').fsPath
                })
                .then((response: any) => {
                    console.log(">>> Config variables------", response);
                    getHelperPaneData('configurable', '');
                });
        });
    }

    const expressionEditor = useMemo(() => {
        return {
            completions: filteredCompletions,
            triggerCharacters: TRIGGER_CHARACTERS,
            retrieveCompletions: handleRetrieveCompletions,
            extractArgsFromFunction: extractArgsFromFunction,
            types: filteredTypes,
            retrieveVisibleTypes: handleGetVisibleTypes,
            isLoadingHelperPaneInfo: isLoadingHelperPaneInfo,
            variableInfo: variableInfo,
            configVariableInfo: configVariableInfo,
            functionInfo: functionInfo,
            libraryBrowserInfo: libraryBrowserInfo,
            getHelperPaneData: handleGetHelperPaneData,
            onFunctionItemSelect: handleFunctionItemSelect,
            getExpressionFormDiagnostics: handleExpressionFormDiagnostics,
            onCompletionItemSelect: handleCompletionItemSelect,
            onBlur: handleExpressionEditorBlur,
            onCancel: handleExpressionEditorCancel,
            onSaveConfigurables: handleSaveConfigurables,
        } as FormExpressionEditorProps;
    }, [
        filteredCompletions,
        filteredTypes,
        isLoadingHelperPaneInfo,
        variableInfo,
        configVariableInfo,
        functionInfo,
        libraryBrowserInfo,
        handleRetrieveCompletions,
        handleGetVisibleTypes,
        handleGetHelperPaneData,
        handleFunctionItemSelect,
        handleExpressionFormDiagnostics
    ]);

    // handle if node form
    if (node?.codedata.node === "IF") {
        return (
            <IfForm
                fileName={fileName}
                node={node}
                targetLineRange={targetLineRange}
                expressionEditor={expressionEditor}
                onSubmit={onSubmit}
                openSubPanel={openSubPanel}
                updatedExpressionField={updatedExpressionField}
                isActiveSubPanel={isActiveSubPanel}
                resetUpdatedExpressionField={resetUpdatedExpressionField}
            />
        );
    }

    // default form
    return (
        <>
            {fields && fields.length > 0 && (
                <Form
                    formFields={fields}
                    projectPath={projectPath}
                    selectedNode={node.codedata.node}
                    openRecordEditor={handleOpenRecordEditor}
                    onSubmit={handleOnSubmit}
                    openView={handleOpenView}
                    openSubPanel={openSubPanel}
                    isActiveSubPanel={isActiveSubPanel}
                    expressionEditor={expressionEditor}
                    targetLineRange={targetLineRange}
                    fileName={fileName}
                    updatedExpressionField={updatedExpressionField}
                    resetUpdatedExpressionField={resetUpdatedExpressionField}
                />
            )}
            {showRecordEditor && (
                <RecordEditor
                    fields={fields}
                    isRecordEditorOpen={showRecordEditor}
                    onClose={() => setShowRecordEditor(false)}
                    updateFields={(updatedFields) => setFields(updatedFields)}
                    rpcClient={rpcClient}
                />
            )}
        </>
    );
}

export default FormGenerator;
