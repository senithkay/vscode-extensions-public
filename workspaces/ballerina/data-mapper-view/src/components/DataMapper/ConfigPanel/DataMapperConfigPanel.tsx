/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { FocusEvent, useContext, useEffect, useMemo, useRef, useState } from "react";

import styled from "@emotion/styled";
import {
    BallerinaProjectComponents,
    createFunctionSignature,
    STModification,
    updateFunctionSignature,
} from "@wso2-enterprise/ballerina-core";
import { LangServerRpcClient } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, ComponentCard, Popover, Divider, Typography, Codicon } from "@wso2-enterprise/ui-toolkit";
import {
    ExpressionFunctionBody,
    FunctionDefinition,
    NodePosition,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import { camelCase } from "lodash";

import { CurrentFileContext } from "../Context/current-file-context";
import { isArraysSupported } from "../utils";

import { FunctionNameEditor } from "./FunctionNameEditor";
import { InputParamsPanel } from "./InputParamsPanel/InputParamsPanel";
import { DataMapperInputParam, DataMapperOutputParam } from "./InputParamsPanel/types";
import { OutputTypePanel } from "./OutputTypePanel/OutputTypePanel";
import { CompletionResponseWithModule } from "./TypeBrowser";
import {
    getFnNameFromST,
    getModifiedTargetPosition
} from "./utils";

export const DM_DEFAULT_FUNCTION_NAME = "transform";
export const REDECLARED_SYMBOL_ERROR_CODE = "BCE2008";

export interface DataMapperConfigPanelProps {
    fnST: FunctionDefinition;
    targetPosition?: NodePosition;
    importStatements: string[];
    projectComponents?: BallerinaProjectComponents;
    filePath: string;
    inputs: DataMapperInputParam[];
    output: DataMapperOutputParam;
    currentFile?: {
        content: string,
        path: string,
        size: number
    };
    ballerinaVersion: string;
    onSave: (funcName: string, inputParams: DataMapperInputParam[], outputType: DataMapperOutputParam) => void;
    onClose: () => void;
    applyModifications: (modifications: STModification[]) => Promise<void>;
    langServerRpcClient: LangServerRpcClient;
    recordPanel?: (props: { targetPosition: NodePosition, closeAddNewRecord: () => void }) => JSX.Element;
}


export function DataMapperConfigPanel(props: DataMapperConfigPanelProps) {
    const {
        fnST,
        targetPosition,
        importStatements,
        projectComponents,
        filePath,
        inputs,
        output,
        currentFile,
        ballerinaVersion,
        onSave,
        onClose,
        applyModifications,
        langServerRpcClient,
        recordPanel
    } = props;
    const { path, content } = useContext(CurrentFileContext);

    const [fnNameFromST, setFnNameFromST] = useState(getFnNameFromST(fnST));
    const [inputParams, setInputParams] = useState<DataMapperInputParam[]>(inputs);
    const [fnName, setFnName] = useState(fnNameFromST === undefined ? DM_DEFAULT_FUNCTION_NAME : fnNameFromST);
    const [outputType, setOutputType] = useState<DataMapperOutputParam>(output);
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [isAddExistType, setAddExistType] = useState(false);
    const [dmFuncDiagnostic, setDmFuncDiagnostic] = useState("");
    const [showOutputType, setShowOutputType] = useState(false);
    const [newRecordBy, setNewRecordBy] = useState<"input" | "output">(undefined);
    const [newRecords, setNewRecords] = useState<string[]>([]);
    const [initiated, setInitiated] = useState(false);
    const [isValidationInProgress, setValidationInProgress] = useState(false);
    const [popoverAnchorEl, setPopoverAnchorEl] = React.useState(null);
    const [isClicked, setIsClicked] = React.useState<boolean>(false);
    const editConfirmMessage = useRef<string>();
    const editConfirmPopoverOpen = Boolean(popoverAnchorEl);
    const id = editConfirmPopoverOpen ? 'edit-confirm-popover' : undefined;

    const isValidConfig = useMemo(() => {
        const hasInvalidInputs = inputParams.some(input => input.isUnsupported);
        return fnName
            && inputParams.length > 0
            && !hasInvalidInputs
            && outputType.type !== ""
            && !outputType.isUnsupported
            && dmFuncDiagnostic === "";
    }, [fnName, inputParams, outputType, dmFuncDiagnostic])

    useEffect(() => {
        void (async () => {
            setValidationInProgress(true);
            try {
                const diagnostics = await langServerRpcClient.getDiagnosticsForFnName({
                    name: fnName, 
                    inputParams,
                    outputType: outputType.type,
                    fnST,
                    targetPosition,
                    currentFileContent: content,
                    filePath
                });
                if (diagnostics.length > 0) {
                    const redeclaredSymbol = diagnostics.some((diagnostic) => {
                        return diagnostic.code === REDECLARED_SYMBOL_ERROR_CODE
                    });
                    if (fnNameFromST === undefined && redeclaredSymbol) {
                        const defaultFnName = await langServerRpcClient.getDefaultFnName({ filePath, targetPosition });
                        setFnName(defaultFnName);
                    } else {
                        setDmFuncDiagnostic(diagnostics[0]?.message);
                    }
                }
            } finally {
                setValidationInProgress(false);
            }
            setInitiated(true);
        })();
    }, []);
    const [fetchingCompletions, setFetchingCompletions] = useState(false);

    const [recordCompletions, setRecordCompletions] = useState<CompletionResponseWithModule[]>([]);

    useEffect(() => {
        void (async () => {
            if (initiated) {
                setFetchingCompletions(true);
                const allCompletions = await langServerRpcClient.getRecordCompletions({
                    currentFileContent: content,
                    importStatements,
                    fnSTPosition: fnST?.position as NodePosition || targetPosition,
                    path
                });
                setRecordCompletions(allCompletions);
                setFetchingCompletions(false);
            }
        })();
    }, [content, initiated]);

    const onSaveForm = () => {
        handleClosePopover();
        const parametersStr = inputParams
            .map((item) => `${item.type}${item.isArray ? '[]' : ''} ${item.name}`)
            .join(",");

        const returnTypeStr = `returns ${outputType.type}${outputType.isArray ? '[]' : ''}`;

        const modifications: STModification[] = [];
        if (fnST && STKindChecker.isFunctionDefinition(fnST)) {
            // check previous output signature and decide whether or not to reset the signature
            modifications.push(
                updateFunctionSignature(fnName, parametersStr, returnTypeStr, {
                    ...fnST?.functionSignature?.position as NodePosition,
                    startColumn: (fnST?.functionName?.position as NodePosition)?.startColumn,
                })
            );

            let functionExpression: STNode = (fnST.functionBody as ExpressionFunctionBody)?.expression;
            if (functionExpression && STKindChecker.isLetExpression(functionExpression)) {
                functionExpression = functionExpression.expression
            }
            if (
                functionExpression &&
                (STKindChecker.isNilLiteral(functionExpression) ||
                    outputType.type !== output?.type ||
                    outputType?.isArray !== output?.isArray)
            ) {
                // if function returns () or if output type has changed
                // reset function body with {} or []
                modifications.push({
                    type: "INSERT",
                    config: { STATEMENT: outputType.isArray ? "[]" : "{}" },
                    ...functionExpression.position,
                });
            }
        } else {
            modifications.push(
                createFunctionSignature(
                    "",
                    fnName,
                    parametersStr,
                    returnTypeStr,
                    targetPosition,
                    false,
                    true,
                    outputType.isArray ? '[]' : '{}'
                )
            );
        }
        onSave(fnName, inputParams, outputType);
        void applyModifications(modifications);
    };

    useEffect(() => {
        setInputParams(inputs);
        setOutputType(output);
        setFnNameFromST(getFnNameFromST(fnST));
    }, [inputs, output]);

    useEffect(() => {
        if (fnST) {
            if (fnNameFromST === undefined) {
                setFnNameFromST(getFnNameFromST(fnST));
            }
        }
    }, [fnST]);


    useEffect(() => {
        void (async () => {
            setValidationInProgress(true);
            try {
                if (fnNameFromST) {
                    const diagnostics = await langServerRpcClient.getDiagnosticsForFnName({
                        name: fnNameFromST,
                        inputParams,
                        outputType: outputType.type,
                        fnST,
                        targetPosition,
                        currentFileContent: content,
                        filePath
                    });
                    if (diagnostics.length > 0) {
                        setDmFuncDiagnostic(diagnostics[0]?.message);
                    }
                    setFnName(fnNameFromST);
                }
            } finally {
                setValidationInProgress(false);
            }
        })();
    }, [fnNameFromST]);

    // For Input Value
    const enableAddNewRecord = () => {
        setIsNewRecord(true);
        setNewRecordBy("input");
    };

    const closeAddNewRecord = (createdNewRecord?: string) => {
        setIsNewRecord(false);
        if (createdNewRecord) {
            const constantWord = "type";
            const pattern = new RegExp(`${constantWord}\\s+(\\w+)`);
            const match = createdNewRecord.match(pattern);
            const newRecordType = match ? match[1] : "";
            if (newRecordBy === "input") {
                setInputParams([...inputParams, {
                    name: camelCase(newRecordType),
                    type: newRecordType,
                    isUnsupported: false,
                    isArray: false
                }])
            }
            if (newRecordBy === "output") {
                setOutputType({ type: newRecordType, isUnsupported: false, isArray: false });
            }
            setNewRecords([...newRecords, newRecordType]);
        }
        setNewRecordBy(undefined);
    };

    const handleShowOutputType = () => {
        setShowOutputType(true);
    };

    const handleHideOutputType = () => {
        setShowOutputType(false);
    }

    // For Output Value
    const handleShowRecordEditor = () => {
        enableAddNewRecord();
        setNewRecordBy("output");
    };

    const handleOutputDeleteClick = () => {
        setOutputType({ type: undefined, isUnsupported: true, isArray: false });
        setShowOutputType(false);
    };

    const handleOutputTypeChange = (type: string, isArray: boolean) => {
        setOutputType({ type, isUnsupported: false, isArray })
    }

    const breadCrumb = (
        <FormTitleContainer>
            <Typography variant="h4">Data Mapper</Typography>
            <FormSecondTitle>
                <Codicon name="chevron-right" />
                <Typography variant="h4">Record</Typography>
            </FormSecondTitle>
            <Button
                appearance="icon"
                onClick={closeAddNewRecord}
            >
                <Codicon name="close" />
            </Button>
        </FormTitleContainer>
    );

    const onNameOutFocus = async (value: string) => {
        const name = value;
        if (name === "") {
            setDmFuncDiagnostic("missing function name");
        } else if (name !== fnNameFromST) {
            setValidationInProgress(true);
            try {
                const diagnostics = await langServerRpcClient.getDiagnosticsForFnName({
                    name: value,
                    inputParams,
                    outputType: outputType.type,
                    fnST,
                    targetPosition,
                    currentFileContent: content,
                    filePath
                });
                if (diagnostics.length > 0) {
                    setDmFuncDiagnostic(diagnostics[0]?.message);
                }
            } finally {
                setValidationInProgress(false);
            }
        }
    };

    const onNameChange = (name: string) => {
        setFnName(name);
        setDmFuncDiagnostic("");
    };

    const isArraySupported = useMemo(() => isArraysSupported(ballerinaVersion), [ballerinaVersion]);

    const handleClosePopover = () => {
        setPopoverAnchorEl(null);
    };

    const onSaveInit = (event: React.MouseEvent<HTMLElement>) => {
        // only show confirm popover if something has changed and if its the edit flow
        if (fnST && STKindChecker.isFunctionDefinition(fnST)) {
            const outputChanged =
                outputType.type !== output?.type ||
                outputType?.isArray !== output?.isArray;
            const inputsChanged = !inputs?.every((item) =>
                inputParams?.some(
                    (newInput) =>
                        newInput.isArray === item.isArray &&
                        newInput.name === item.name &&
                        newInput.type === item.type
                )
            );
            if (outputChanged || inputsChanged) {
                let confirmMessage = "";
                if (outputChanged) {
                    confirmMessage = "Modifying the output type will reset the function body. "
                } else if (inputsChanged) {
                    confirmMessage += "Modifying the existing input types might make any existing mappings invalid. "
                }
                confirmMessage += "Are you sure you want to proceed?";
                editConfirmMessage.current = confirmMessage;
                setPopoverAnchorEl(event.currentTarget);
            } else {
                onSaveForm();
            }
        } else {
            onSaveForm();
        }
    };

    const handleSave = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!isClicked) {
            setIsClicked(true);
            onSaveInit(event);
        }
    }

    return (
        <div onClick={onClose}>
            <WizardFormControlExtended
                data-testid="data-mapper-form"
            >
                {(isNewRecord && breadCrumb) || (
                    <FormTitleContainer>
                        <Typography variant="h4">Data Mapper</Typography>
                        <Button
                            appearance="icon"
                            onClick={onClose}
                        >
                            <Codicon name="close" />
                        </Button>
                    </FormTitleContainer>
                )}
                {isNewRecord &&
                    recordPanel({
                        targetPosition: getModifiedTargetPosition(newRecords, targetPosition, projectComponents, currentFile.path),
                        closeAddNewRecord
                    })
                }
                {!isNewRecord && (
                    <>
                        <FormBody>
                            <FunctionNameEditor
                                value={fnName}
                                onBlur={(event: FocusEvent<HTMLInputElement>) => onNameOutFocus(event.target.value)}
                                onChange={onNameChange}
                                isValidating={!initiated || isValidationInProgress}
                                errorMessage={dmFuncDiagnostic}
                            />
                            <FormDivider />
                            <InputParamsPanel
                                inputParams={inputParams}
                                onUpdateParams={setInputParams}
                                enableAddNewRecord={enableAddNewRecord}
                                setAddExistType={setAddExistType}
                                isAddExistType={isAddExistType}
                                loadingCompletions={fetchingCompletions}
                                completions={recordCompletions}
                                isArraySupported={isArraySupported}
                            />
                            <FormDivider />
                            <OutputTypePanel
                                outputType={outputType}
                                fetchingCompletions={fetchingCompletions}
                                completions={recordCompletions}
                                showOutputType={showOutputType}
                                handleShowOutputType={handleShowOutputType}
                                handleHideOutputType={handleHideOutputType}
                                handleOutputTypeChange={handleOutputTypeChange}
                                handleShowRecordEditor={handleShowRecordEditor}
                                handleOutputDeleteClick={handleOutputDeleteClick}
                                isArraySupported={isArraySupported}
                            />
                        </FormBody>
                        <Button
                            tooltip="Save"
                            onClick={undefined}
                        />
                        <Button
                            tooltip="Cancel"
                            onClick={onClose}
                        />
                        <Button
                            appearance="secondary"
                            onClick={onClose}
                        >
                            <Typography variant="h5">Cancel</Typography>
                        </Button>
                        <Button
                            appearance="primary"
                            disabled={isClicked || !isValidConfig}
                            onClick={handleSave}
                        >
                            <Typography variant="h5">Save</Typography>
                        </Button>
                        <Popover
                            id={id}
                            open={editConfirmPopoverOpen}
                            anchorEl={popoverAnchorEl}
                            // onClose={handleClosePopover}
                        >
                            <ComponentCard sx={{width:400}}>
                                <span>{editConfirmMessage.current}</span>
                                <ComponentCard sx={{display:'flex', justifyContent:'flex-end'}}>
                                    <Button
                                        appearance="secondary"
                                        data-testid="dm-save-popover-cancel-btn"
                                        onClick={handleClosePopover}
                                    >
                                        <Typography variant="h5">Cancel</Typography>
                                    </Button>
                                    <Button
                                        appearance="primary"
                                        data-testid="dm-save-popover-continue-btn"
                                        onClick={onSaveForm}
                                    >
                                        <Typography variant="h5">Continue</Typography>
                                    </Button>
                                    <Button
                                        tooltip="Cancel"
                                        onClick={handleClosePopover}
                                    />
                                    <Button
                                        tooltip="Continue"
                                        onClick={onSaveForm}
                                    />
                                </ComponentCard>
                            </ComponentCard>
                        </Popover>
                    </>
                )}
            </WizardFormControlExtended>
        </div>
    );
}

const FormTitleContainer = styled.div`
    display: 'flex';
    flex-direction: 'row';
    align-items: 'center';
    justify-content: 'space-around';
    border-bottom: '1px solid #d8d8d8';
    padding-left: '12px'
`;

const FormSecondTitle = styled.div`
    position: 'absolute';
    left: 124;
    display: 'flex';
    align-items: 'center';
    
    & svg {
        margin-top: 4
    }
`;

const FormBody = styled.div`
    width: 100%;
    flex-direction: row;
    padding: 15px 20px;
    font-family: Gilmer;
`;

const FormDivider = styled(Divider)`
    margin: 1.5rem 0;
`;

const WizardFormControlExtended = styled.div`
    width: 600;
`;

export const Title = styled.div(() => ({
    fontSize: "13px",
    letterSpacing: "normal",
    textTransform: "capitalize",
    margin: "0 0 8px",
    fontFamily: "Gilmer",
    lineHeight: "1rem",
    paddingBottom: "0.6rem",
    fontWeight: 500,
}));

