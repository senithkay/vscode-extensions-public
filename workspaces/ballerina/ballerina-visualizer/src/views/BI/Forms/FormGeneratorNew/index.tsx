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
    TextEdit,
    NodeKind,
    ExpressionProperty,
    RecordTypeField
} from "@wso2-enterprise/ballerina-core";
import {
    FormField,
    FormValues,
    Form,
    ExpressionFormField,
    FormExpressionEditorProps,
    PanelContainer
} from "@wso2-enterprise/ballerina-side-panel";
import { TypeEditor } from "@wso2-enterprise/type-editor";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { CompletionItem, FormExpressionEditorRef, HelperPaneHeight, Overlay, ThemeColors } from "@wso2-enterprise/ui-toolkit";

import {
    convertBalCompletion,
    convertToVisibleTypes,
    updateLineRange
} from "../../../../utils/bi";
import { debounce, set } from "lodash";
import { getHelperPane } from "../../HelperPane";
import { FormTypeEditor } from "../../TypeEditor";
import { getTypeHelper } from "../../TypeHelper";
import { EXPRESSION_EXTRACTION_REGEX } from "../../../../constants";

interface TypeEditorState {
    isOpen: boolean;
    field?: FormField; // Optional, to store the field being edited
}

interface FormProps {
    fileName: string;
    fields: FormField[];
    targetLineRange: LineRange;
    projectPath?: string;
    submitText?: string;
    cancelText?: string;
    onBack?: () => void;
    editForm?: boolean;
    isGraphqlEditor?: boolean;
    onSubmit: (data: FormValues) => void;
    isActiveSubPanel?: boolean;
    openSubPanel?: (subPanel: SubPanel) => void;
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
    selectedNode?: NodeKind;
    nestedForm?: boolean;
    compact?: boolean;
    helperPaneSide?: 'right' | 'left';
    recordTypeFields?: RecordTypeField[];
    disableSaveButton?: boolean;
}

export function FormGeneratorNew(props: FormProps) {
    const {
        fileName,
        fields,
        targetLineRange,
        projectPath,
        submitText,
        cancelText,
        onBack,
        onSubmit,
        isGraphqlEditor,
        openSubPanel,
        updatedExpressionField,
        resetUpdatedExpressionField,
        selectedNode,
        nestedForm,
        compact = false,
        helperPaneSide,
        recordTypeFields,
        disableSaveButton = false
    } = props;

    const { rpcClient } = useRpcContext();
    // console.log("======FormGeneratorNew======,", fields)

    const [typeEditorState, setTypeEditorState] = useState<TypeEditorState>({ isOpen: false });

    /* Expression editor related state and ref variables */
    const prevCompletionFetchText = useRef<string>("");
    const [completions, setCompletions] = useState<CompletionItem[]>([]);
    const [filteredCompletions, setFilteredCompletions] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const triggerCompletionOnNextRequest = useRef<boolean>(false);
    const expressionOffsetRef = useRef<number>(0); // To track the expression offset on adding import statements

    const [fieldsValues, setFields] = useState<FormField[]>(fields);

    useEffect(() => {
        if (fields) {
            setFields(fields);
        }
    }, [fields]);

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

    const debouncedRetrieveCompletions = useCallback(
        debounce(
            async (
                value: string,
                property: ExpressionProperty,
                offset: number,
                triggerCharacter?: string
            ) => {
                let expressionCompletions: CompletionItem[] = [];
                const { parentContent, currentContent } = value
                    .slice(0, offset)
                    .match(EXPRESSION_EXTRACTION_REGEX)?.groups ?? {};
                if (
                    completions.length > 0 &&
                    !triggerCharacter &&
                    parentContent === prevCompletionFetchText.current
                ) {
                    expressionCompletions = completions
                        .filter((completion) => {
                            const lowerCaseText = currentContent.toLowerCase();
                            const lowerCaseLabel = completion.label.toLowerCase();

                            return lowerCaseLabel.includes(lowerCaseText);
                        })
                        .sort((a, b) => a.sortText.localeCompare(b.sortText));
                } else {
                    let completions = await rpcClient.getBIDiagramRpcClient().getExpressionCompletions({
                        filePath: fileName,
                        context: {
                            expression: value,
                            startLine: updateLineRange(targetLineRange, expressionOffsetRef.current).startLine,
                            offset: offset,
                            codedata: undefined,
                            property: property
                        },
                        completionContext: {
                            triggerKind: triggerCharacter ? 2 : 1,
                            triggerCharacter: triggerCharacter as TriggerCharacter
                        }
                    });

                    // Convert completions to the ExpressionEditor format
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
                                const lowerCaseText = currentContent.toLowerCase();
                                const lowerCaseLabel = completion.label.toLowerCase();

                                return lowerCaseLabel.includes(lowerCaseText);
                            })
                            .sort((a, b) => a.sortText.localeCompare(b.sortText));
                    }
                }

                prevCompletionFetchText.current = parentContent ?? "";
                setFilteredCompletions(expressionCompletions);
            },
            250
        ),
        [rpcClient, completions, fileName, targetLineRange]
    );

    const handleRetrieveCompletions = useCallback(async (
        value: string,
        property: ExpressionProperty,
        offset: number,
        triggerCharacter?: string
    ) => {
        await debouncedRetrieveCompletions(value, property, offset, triggerCharacter);

        if (triggerCharacter) {
            await debouncedRetrieveCompletions.flush();
        }
    }, [debouncedRetrieveCompletions]);

    const debouncedGetVisibleTypes = useCallback(debounce(async (value: string, cursorPosition: number, typeConstraint: string) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const types = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: fileName,
                position: updateLineRange(targetLineRange, expressionOffsetRef.current).startLine,
                typeConstraint: typeConstraint,
            });

            visibleTypes = convertToVisibleTypes(types);
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

    const handleGetVisibleTypes = useCallback(async (value: string, cursorPosition: number, typeConstraint?: string) => {
        await debouncedGetVisibleTypes(value, cursorPosition, typeConstraint);
    }, [debouncedGetVisibleTypes]);

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

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };

    const handleGetHelperPane = (
        exprRef: RefObject<FormExpressionEditorRef>,
        anchorRef: RefObject<HTMLDivElement>,
        defaultValue: string,
        value: string,
        onChange: (value: string, updatedCursorPosition: number) => void,
        changeHelperPaneState: (isOpen: boolean) => void,
        helperPaneHeight: HelperPaneHeight,
        recordTypeField?: RecordTypeField
    ) => {
        const handleHelperPaneClose = () => {
            changeHelperPaneState(false);
            handleExpressionEditorCancel();
        }

        return getHelperPane({
            fileName: fileName,
            targetLineRange: updateLineRange(targetLineRange, expressionOffsetRef.current),
            exprRef: exprRef,
            anchorRef: anchorRef,
            onClose: handleHelperPaneClose,
            defaultValue: defaultValue,
            currentValue: value,
            onChange: onChange,
            helperPaneHeight: helperPaneHeight,
            recordTypeField: recordTypeField
        });
    };

    const handleGetTypeHelper = (
        typeBrowserRef: RefObject<HTMLDivElement>,
        currentType: string,
        currentCursorPosition: number,
        typeHelperState: boolean,
        onChange: (newType: string, newCursorPosition: number) => void,
        changeHelperPaneState: (isOpen: boolean) => void,
        typeHelperHeight: HelperPaneHeight
    ) => {
        return getTypeHelper({
            typeBrowserRef: typeBrowserRef,
            filePath: fileName,
            targetLineRange: updateLineRange(targetLineRange, expressionOffsetRef.current),
            currentType: currentType,
            currentCursorPosition: currentCursorPosition,
            helperPaneHeight: typeHelperHeight,
            typeHelperState: typeHelperState,
            onChange: onChange,
            changeTypeHelperState: changeHelperPaneState
        });
    }

    const handleTypeChange = async (type: Type) => {
        setTypeEditorState({ isOpen: false });

        if (typeEditorState.field) {
            const updatedFields = fieldsValues.map(field => {
                if (field.key === typeEditorState.field.key) {
                    // Only handle parameter type if editingField is a parameter
                    if (typeEditorState.field.type === 'PARAM_MANAGER'
                        && field.type === 'PARAM_MANAGER'
                        && field.paramManagerProps.formFields
                    ) {
                        return {
                            ...field,
                            paramManagerProps: {
                                ...field.paramManagerProps,
                                formFields: field?.paramManagerProps?.formFields.map(subField =>
                                    subField.key === 'type' ? { ...subField, value: type.name } : subField
                                )
                            }
                        };
                    }
                    // Handle regular fields
                    return {
                        ...field,
                        value: type.name
                    };
                }
                return field;
            });
            setFields(updatedFields);
        }
    };

    const handleOpenTypeEditor = (isOpen: boolean, f: FormValues, editingField?: FormField) => {
        // Get f.value and assign that value to field value
        const updatedFields = fields.map((field) => {
            const updatedField = { ...field };
            if (f[field.key]) {
                updatedField.value = f[field.key];
            }
            return updatedField;
        });
        setFields(updatedFields);
        setTypeEditorState({ isOpen, field: editingField });
    };

    const defaultType = (): Type => {
        if (typeEditorState.field.type === 'PARAM_MANAGER') {
            return {
                name: "MyType",
                editable: true,
                metadata: {
                    label: "",
                    description: "",
                },
                codedata: {
                    node: "RECORD",
                },
                properties: {},
                members: [],
                includes: [] as string[],
                allowAdditionalFields: false
            };
        }
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
        setTypeEditorState({ isOpen: false });
    };

    const expressionEditor = useMemo(() => {
        return {
            completions: filteredCompletions,
            triggerCharacters: TRIGGER_CHARACTERS,
            retrieveCompletions: handleRetrieveCompletions,
            types: filteredTypes,
            retrieveVisibleTypes: handleGetVisibleTypes,
            getHelperPane: handleGetHelperPane,
            getTypeHelper: handleGetTypeHelper,
            onCompletionItemSelect: handleCompletionItemSelect,
            onBlur: handleExpressionEditorBlur,
            onCancel: handleExpressionEditorCancel,
            helperPaneOrigin: helperPaneSide || "right",
            helperPaneHeight: "3/4"
        } as FormExpressionEditorProps;
    }, [
        filteredCompletions,
        filteredTypes,
        handleRetrieveCompletions,
        handleGetVisibleTypes,
        handleGetHelperPane,
        handleCompletionItemSelect,
        handleExpressionEditorBlur,
        handleExpressionEditorCancel
    ]);

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
    };

    const renderTypeEditor = (isGraphql: boolean) => (
        <>
            <PanelContainer
                title={"New Type"}
                show={true}
                onClose={onCloseTypeEditor}
            >
                <FormTypeEditor
                    newType={true}
                    onTypeChange={handleTypeChange}
                    {...(isGraphql && { type: defaultType(), isGraphql: true })}
                />
            </PanelContainer>
            <Overlay sx={{ background: `${ThemeColors.SURFACE_CONTAINER}`, opacity: `0.3`, zIndex: 1000 }} />
        </>
    );

    // default form
    return (
        <>
            {fields && fields.length > 0 && (
                <Form
                    nestedForm={nestedForm}
                    formFields={fieldsValues}
                    projectPath={projectPath}
                    openRecordEditor={handleOpenTypeEditor}
                    onCancelForm={onBack}
                    submitText={submitText}
                    cancelText={cancelText}
                    onSubmit={handleSubmit}
                    openView={handleOpenView}
                    openSubPanel={openSubPanel}
                    expressionEditor={expressionEditor}
                    targetLineRange={targetLineRange}
                    fileName={fileName}
                    updatedExpressionField={updatedExpressionField}
                    resetUpdatedExpressionField={resetUpdatedExpressionField}
                    selectedNode={selectedNode}
                    compact={compact}
                    recordTypeFields={recordTypeFields}
                    disableSaveButton={disableSaveButton}
                />
            )}
            {typeEditorState.isOpen && (
                renderTypeEditor(isGraphqlEditor)
            )}
        </>
    );
}

export default FormGeneratorNew;
