import React, { useContext, useEffect, useState } from "react";

import styled from "@emotion/styled";
import Divider from "@material-ui/core/Divider/Divider";
import FormControl from "@material-ui/core/FormControl/FormControl";
import DeleteOutLineIcon from "@material-ui/icons/DeleteOutline";
import {
    addToTargetPosition,
    CompletionParams,
    createFunctionSignature,
    STModification,
    updateFunctionSignature,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ButtonWithIcon,
    FormActionButtons,
    FormHeaderSection,
    Panel,
    useStyles as useFormStyles,
    WarningBanner,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ExpressionFunctionBody, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Uri } from "monaco-editor";
import { CompletionItemKind } from "vscode-languageserver-protocol";


import { LSClientContext } from "../Context/ls-client-context";
import { DataMapperProps } from "../DataMapper";

import { FunctionNameEditor } from "./FunctionNameEditor";
import { InputParamsPanel } from "./InputParamsPanel/InputParamsPanel";
import { DataMapperInputParam, DataMapperOutputParam } from "./InputParamsPanel/types";
import { RecordButtonGroup } from "./RecordButtonGroup";
import { CompletionResponseWithModule, TypeBrowser } from "./TypeBrowser";
import {
    isValidOutput,
    getDefaultFnName,
    getDiagnosticsForFnName,
    getFnNameFromST,
    getInputsFromST,
    getModifiedTargetPosition,
    getOutputTypeFromST
} from "./utils";
import { CurrentFileContext } from "../Context/current-file-context";
import { getRecordCompletions } from "../../Diagram/utils/ls-utils";

export const DM_DEFAULT_FUNCTION_NAME = "transform";
export const REDECLARED_SYMBOL_ERROR_CODE = "BCE2008";

export function DataMapperConfigPanel(props: DataMapperProps) {
    const {
        onClose,
        fnST,
        applyModifications,
        targetPosition,
        onSave,
        recordPanel,
        currentFile,
        importStatements,
        syntaxTree,
        filePath
    } = props;
    const formClasses = useFormStyles();

    const langClientPromise = useContext(LSClientContext);

    const [fnNameFromST, setFnNameFromST] = useState(getFnNameFromST(fnST));
    const [inputParams, setInputParams] = useState<DataMapperInputParam[]>([]);
    const [fnName, setFnName] = useState(fnNameFromST === undefined ? DM_DEFAULT_FUNCTION_NAME : fnNameFromST);
    const [outputType, setOutputType] = useState<DataMapperOutputParam>({ type: '', inInvalid: false });
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [isAddExistType, setAddExistType] = useState(false);
    const [dmFuncDiagnostic, setDmFuncDiagnostic] = useState("");

    const [showOutputType, setShowOutputType] = useState(false);
    const [newRecordBy, setNewRecordBy] = useState<"input" | "output">(undefined);

    const [newRecords, setNewRecords] = useState<string[]>([]);
    const [initiated, setInitiated] = useState(false);

    const hasInvalidInputs = inputParams.some(input => input.inInvalid);
    const isValidConfig = fnName && inputParams.length > 0 && !hasInvalidInputs && outputType.type !== "" && !outputType.inInvalid && dmFuncDiagnostic === "";

    useEffect(() => {
        (async () => {
            const diagnostics = await getDiagnosticsForFnName(fnName, inputParams, outputType.type,
                fnST, targetPosition, currentFile.content, filePath, langClientPromise);
            if (diagnostics.length > 0) {
                const redeclaredSymbol = diagnostics.some((diagnostic) => {
                    return diagnostic.code === REDECLARED_SYMBOL_ERROR_CODE
                });
                if (fnNameFromST === undefined && redeclaredSymbol) {
                    const defaultFnName = await getDefaultFnName(filePath, targetPosition, langClientPromise);
                    setFnName(defaultFnName);
                } else {
                    setDmFuncDiagnostic(diagnostics[0]?.message);
                }
            }
            setInitiated(true);
        })();
    }, []);
    const [fetchingCompletions, setFetchingCompletions] = useState(false);

    const { path, content } = useContext(CurrentFileContext);

    const [recordCompletions, setRecordCompletions] = useState<CompletionResponseWithModule[]>([]);

    useEffect(() => {
        (async () => {
            setFetchingCompletions(true);
            const allCompletions = await getRecordCompletions(currentFile.content, langClientPromise, 
                                        importStatements,fnST?.position || targetPosition , path);
            setRecordCompletions(allCompletions);
            setFetchingCompletions(false);
        })();
    }, [content]);

    const onSaveForm = () => {
        const parametersStr = inputParams
            .map((item) => `${item.type} ${item.name}`)
            .join(",");

        const returnTypeStr = `returns ${outputType.type}`;

        const modifications: STModification[] = [];
        if (fnST && STKindChecker.isFunctionDefinition(fnST)) {
            modifications.push(
                updateFunctionSignature(fnName, parametersStr, returnTypeStr, {
                    ...fnST?.functionSignature?.position,
                    startColumn: fnST?.functionName?.position?.startColumn,
                })
            );

            const functionExpression = (fnST.functionBody as ExpressionFunctionBody)?.expression;
            if (functionExpression && STKindChecker.isNilLiteral(functionExpression)) {
                // if function returns (), replace it with {}
                modifications.push({
                    type: "INSERT",
                    config: { "STATEMENT": "{}" },
                    ...functionExpression.position
                })
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
                    `{}`
                )
            );
        }
        onSave(fnName);
        applyModifications(modifications);
    };

    useEffect(() => {
        if (fnST && initiated) {
            if (fnNameFromST === undefined) {
                setFnNameFromST(getFnNameFromST(fnST));
            }
            const inputs = getInputsFromST(fnST);
            if (inputs && inputs.length > 0 && inputParams.length === 0) {
                setInputParams(getInputsFromST(fnST));
            }
            const output = getOutputTypeFromST(fnST);
            if (output) {
                setOutputType({
                    type: getOutputTypeFromST(fnST),
                    inInvalid: !isValidOutput(fnST)
                });
            } else {
                setOutputType({ type: '', inInvalid: true });
            }
        }
    }, [fnST, initiated]);

    useEffect(() => {
        if (outputType.type) {
            setShowOutputType(true);
        }
    }, [outputType]);

    useEffect(() => {
        (async () => {
            if (fnNameFromST) {
                const diagnostics = await getDiagnosticsForFnName(fnNameFromST, inputParams, outputType.type, fnST,
                    targetPosition, currentFile.content, filePath, langClientPromise);
                if (diagnostics.length > 0) {
                    setDmFuncDiagnostic(diagnostics[0]?.message);
                }
                setFnName(fnNameFromST);
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
            const newRecordType = createdNewRecord.split(" ")[1];
            if (newRecordBy === "input") {
                setInputParams([...inputParams, {
                    name: newRecordType,
                    type: newRecordType,
                    inInvalid: false,
                }])
            }
            if (newRecordBy === "output") {
                setOutputType({ type: newRecordType, inInvalid: false });
            }
            setNewRecords([...newRecords, newRecordType]);
        }
        setNewRecordBy(undefined);
    };

    const handleShowOutputType = () => {
        setShowOutputType(true);
    };

    // For Output Value
    const handleShowRecordEditor = () => {
        enableAddNewRecord();
        handleShowOutputType();
        setNewRecordBy("output");
    };

    const handleOutputDeleteClick = () => {
        setOutputType({ type: '', inInvalid: true });
        setShowOutputType(false);
    };

    const handleOutputTypeChange = (type: string) => {
        setOutputType({ type, inInvalid: false })
    }

    const breadCrumb = (
        <FormHeaderSection
            onCancel={closeAddNewRecord}
            formTitle={"lowcode.develop.configForms.dataMapper.titleExtend"}
            defaultMessage={"Data Mapper"}
            formTitleSecond={"lowcode.develop.configForms.dataMapper.titleRecord"}
            defaultMessageSecond={"Record"}
        />
    );

    const onNameOutFocus = async (event: any) => {
        const name = event.target.value;
        if (name === "") {
            setDmFuncDiagnostic("missing function name");
        } else {
            const diagnostics = await getDiagnosticsForFnName(event.target.value, inputParams, outputType.type, fnST,
                targetPosition, currentFile.content, filePath, langClientPromise);
            if (diagnostics.length > 0) {
                setDmFuncDiagnostic(diagnostics[0]?.message);
            }
        }
    };

    const onNameChange = async (name: string) => {
        setFnName(name);
        setDmFuncDiagnostic("");
    };

    return (
        <Panel onClose={onClose}>
            <FormControl
                variant="outlined"
                data-testid="data-mapper-form"
                className={formClasses.wizardFormControlExtended}
            >
                {(isNewRecord && breadCrumb) || (
                    <FormHeaderSection
                        onCancel={onClose}
                        formTitle={"lowcode.develop.configForms.dataMapper.title"}
                        defaultMessage={"Data Mapper"}
                    />
                )}
                {isNewRecord && recordPanel({ targetPosition: getModifiedTargetPosition(newRecords, targetPosition, syntaxTree), closeAddNewRecord })}
                {!isNewRecord && (
                    <>
                        <FormBody>
                            <FunctionNameEditor
                                value={fnName}
                                onBlur={onNameOutFocus}
                                onChange={onNameChange}
                                errorMessage={dmFuncDiagnostic}
                            />
                            <FormDivider />
                            <InputParamsPanel
                                inputParams={inputParams}
                                onUpdateParams={setInputParams}
                                enableAddNewRecord={enableAddNewRecord}
                                setAddExistType={setAddExistType}
                                isAddExistType={isAddExistType}
                                currentFileContent={currentFile?.content}
                                fnSTPosition={fnST?.position || targetPosition}
                                imports={importStatements}
                                banner={fnST && hasInvalidInputs && <Warning message='Only records are currently supported as data mapper inputs' />}
                            />
                            <FormDivider />
                            <OutputTypeConfigPanel>
                                <Title>Output Type</Title>
                                {!outputType.type ? (
                                    <>
                                        {showOutputType && (
                                            <TypeBrowser
                                                type={outputType.type}
                                                onChange={handleOutputTypeChange}
                                                isLoading={fetchingCompletions}
                                                recordCompletions={recordCompletions}
                                            />
                                        )}
                                        <RecordButtonGroup openRecordEditor={handleShowRecordEditor} showTypeList={handleShowOutputType} />
                                    </>
                                ) : (
                                    <>
                                        {outputType.type && outputType.inInvalid && <Warning message='Only record type is currently supported as data mapper output' />}
                                        <OutputTypeContainer isInvalid={outputType.inInvalid}>
                                            <TypeName>{outputType.type}</TypeName>
                                            <DeleteButton onClick={handleOutputDeleteClick} icon={<DeleteOutLineIcon fontSize="small" />} />
                                        </OutputTypeContainer>
                                    </>
                                )}
                            </OutputTypeConfigPanel>
                        </FormBody>
                        <FormActionButtons
                            isMutationInProgress={false}
                            cancelBtn={true}
                            saveBtnText="Save"
                            cancelBtnText="Cancel"
                            validForm={isValidConfig}
                            onSave={onSaveForm}
                            onCancel={onClose}
                        />
                    </>
                )}
            </FormControl>
        </Panel>
    );
}

const FormBody = styled.div`
    width: 100%;
    flexdirection: row;
    padding: 15px 20px;
    fontfamily: Gilmer;
`;

const FormDivider = styled(Divider)`
    margin: 1.5rem 0;
`;

const OutputTypeConfigPanel = styled.div`
    width: 100%;
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

const OutputTypeContainer = styled.div(({ isInvalid }: { isInvalid?: boolean }) => ({
    background: "white",
    padding: 10,
    borderRadius: 5,
    border: "1px solid #dee0e7",
    color: `${isInvalid ? '#fe523c' : 'inherit'}`,
    margin: "1rem 0 0.25rem",
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
    alignItems: "center",
}));

const DeleteButton = styled(ButtonWithIcon)`
    padding: 0;
    color: #fe523c;
`;

const TypeName = styled.span`
    font-weight: 500;
`;

const Warning = styled(WarningBanner)`
    border-width: 1px !important;
    width: unset;
    margin: 5px 0;
`
