/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    EVENT_TYPE,
    LineRange,
    NodePosition,
    SubPanel,
    VisualizerLocation,
    TRIGGER_CHARACTERS,
    TriggerCharacter,
    Type,
    NodeKind
} from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues, Form, ExpressionFormField, FormExpressionEditorProps, HelperPaneData, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import {
    convertBalCompletion,
    convertToHelperPaneFunction,
    convertToHelperPaneVariable,
    convertToVisibleTypes,
} from "../../../../utils/bi";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { CompletionItem, FormExpressionEditorRef } from "@wso2-enterprise/ui-toolkit";
import { debounce } from "lodash";
import { getHelperPane } from "../../HelperPane";
import { RecordEditor } from "../../../RecordEditor/RecordEditor";
import { TypeEditor } from "@wso2-enterprise/type-editor";

interface FormProps {
    fileName: string;
    fields: FormField[];
    targetLineRange: LineRange;
    projectPath?: string;
    submitText?: string;
    onBack?: () => void;
    editForm?: boolean;
    isGraphqlEditor?: boolean;
    onSubmit: (data: FormValues) => void;
    isActiveSubPanel?: boolean;
    openSubPanel?: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    onTypeChange?: (type: Type) => void;
    selectedNode?: NodeKind;
}

export function FormGeneratorNew(props: FormProps) {
    const {
        fileName,
        fields,
        targetLineRange,
        projectPath,
        submitText,
        onBack,
        onSubmit,
        openSubPanel,
        updatedExpressionField,
        isGraphqlEditor,
        resetUpdatedExpressionField,
        onTypeChange,
        selectedNode
    } = props;

    const { rpcClient } = useRpcContext();
    console.log("======FormGeneratorNew======,", fields)

    const [showRecordEditor, setShowRecordEditor] = useState(false);

    /* Expression editor related state and ref variables */
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [isLoadingHelperPaneInfo, setIsLoadingHelperPaneInfo] = useState<boolean>(false);
    const [variableInfo, setVariableInfo] = useState<HelperPaneData>();
    const [functionInfo, setFunctionInfo] = useState<HelperPaneData>();
    const [libraryBrowserInfo, setLibraryBrowserInfo] = useState<HelperPaneData>();
    const [openTypeEditor, setOpenTypeEditor] = useState<boolean>(false);
    const triggerCompletionOnNextRequest = useRef<boolean>(false);

    const [fieldsValues, setFields] = useState<FormField[]>(fields);

    useEffect(() => {
        handleFormOpen();

        return () => {
            handleFormClose();
        };
    }, []);

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

    const handleOpenView = async (filePath: string, position: NodePosition) => {
        console.log(">>> open view: ", { filePath, position });
        const context: VisualizerLocation = {
            documentUri: filePath,
            position: position,
        };
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
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
                        startLine: targetLineRange.startLine,
                        offset: offset,
                        node: undefined,
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
    ), [rpcClient, completions, fileName, targetLineRange, triggerCompletionOnNextRequest.current]);

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
                position: targetLineRange.startLine,
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


    const getHelperPaneData = useCallback(
        (type: string, searchText: string) => {
            setIsLoadingHelperPaneInfo(true);
            switch (type) {
                case 'variables': {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getVisibleVariableTypes({
                            filePath: fileName,
                            position: {
                                line: targetLineRange.startLine.line,
                                offset: targetLineRange.startLine.offset
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
                case 'functions': {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getFunctions({
                            position: targetLineRange,
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
                            position: targetLineRange,
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
        },
        [rpcClient, targetLineRange, fileName]
    );

    const handleGetHelperPaneData = useCallback(debounce(getHelperPaneData, 1100), [getHelperPaneData]);

    const handleCompletionItemSelect = async () => {
        debouncedRetrieveCompletions.cancel();
        debouncedGetVisibleTypes.cancel();
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    const handleGetHelperPane = (
        exprRef: RefObject<FormExpressionEditorRef>,
        value: string,
        onChange: (value: string, updatedCursorPosition: number) => void,
        changeHelperPaneState: (isOpen: boolean) => void
    ) => {
        return getHelperPane({
            fileName: fileName,
            targetLineRange: targetLineRange,
            exprRef: exprRef,
            onClose: () => changeHelperPaneState(false),
            currentValue: value,
            onChange: onChange
        });
    }

    const handleTypeChange = async (type: Type) => {
        setOpenTypeEditor(false);

        // Update fields to reflect the new type
        const updatedFields = fieldsValues.map(field => {
            if (field.key.includes('returnType')) {
                return {
                    ...field,
                    value: type.name
                };
            }
            return field;
        });

        setFields(updatedFields);

        // Notify parent component about type change
        onTypeChange?.(type);
    };

    const handleOpenRecordEditor = (isOpen: boolean, f: FormValues) => {
        if (isGraphqlEditor) {
            setOpenTypeEditor(isOpen);
            // return;
        }
        // Get f.value and assign that value to field value
        const updatedFields = fields.map((field) => {
            const updatedField = { ...field };
            if (f[field.key]) {
                updatedField.value = f[field.key];
            }
            return updatedField;
        });
        setFields(updatedFields);
    };

    const defaultType = (): Type => {
        return {
            name: "MyType",
            editable: true,
            metadata: {
                label: "",
                description: ""
            },
            codedata: {
                node: "CLASS"
            },
            properties: {},
            members: [],
            includes: [] as string[],
            functions: []
        };
    }

    const onCloseTypeEditor = () => {
        setOpenTypeEditor(false);
    }

    const expressionEditor = useMemo(() => {
        return {
            completions: filteredCompletions,
            triggerCharacters: TRIGGER_CHARACTERS,
            retrieveCompletions: handleRetrieveCompletions,
            types: filteredTypes,
            retrieveVisibleTypes: handleGetVisibleTypes,
            getHelperPane: handleGetHelperPane,
            onCompletionItemSelect: handleCompletionItemSelect,
            onBlur: handleExpressionEditorBlur,
            onCancel: handleExpressionEditorCancel,
            helperPaneOrigin: "right"
        } as FormExpressionEditorProps;
    }, [
        filteredCompletions,
        filteredTypes,
        isLoadingHelperPaneInfo,
        variableInfo,
        functionInfo,
        libraryBrowserInfo,
        handleRetrieveCompletions,
        handleGetVisibleTypes,
        handleGetHelperPaneData
    ]);

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
    };

    // default form
    return (
        <>
            {fields && fields.length > 0 && (
                <Form
                    formFields={fieldsValues}
                    projectPath={projectPath}
                    openRecordEditor={handleOpenRecordEditor}
                    onCancelForm={onBack}
                    submitText={submitText}
                    onSubmit={handleSubmit}
                    openView={handleOpenView}
                    openSubPanel={openSubPanel}
                    expressionEditor={expressionEditor}
                    targetLineRange={targetLineRange}
                    fileName={fileName}
                    updatedExpressionField={updatedExpressionField}
                    resetUpdatedExpressionField={resetUpdatedExpressionField}
                    selectedNode={selectedNode}
                />
            )}
            {showRecordEditor && !isGraphqlEditor && (
                <RecordEditor
                    fields={fields}
                    isRecordEditorOpen={showRecordEditor}
                    onClose={() => setShowRecordEditor(false)}
                    updateFields={(updatedFields) => setFields(updatedFields)}
                    rpcClient={rpcClient}
                />
            )}
            {isGraphqlEditor && openTypeEditor &&
                <PanelContainer title={"New Type"} show={true} onClose={onCloseTypeEditor}>
                    <TypeEditor
                        type={defaultType()}
                        newType={true}
                        isGraphql={true}
                        rpcClient={rpcClient}
                        onTypeChange={handleTypeChange}
                    />
                </PanelContainer>
            }

        </>
    );
}

export default FormGeneratorNew;
