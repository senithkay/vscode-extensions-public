import React, { useEffect, useState } from "react";

import styled from "@emotion/styled";
import Divider from "@material-ui/core/Divider/Divider";
import FormControl from "@material-ui/core/FormControl/FormControl";
import {
    createFunctionSignature,
    STModification,
    updateFunctionSignature,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import DeleteOutLineIcon from "@material-ui/icons/DeleteOutline";

import {
    ButtonWithIcon,
    FormActionButtons,
    FormHeaderSection,
    Panel,
    useStyles as useFormStyles,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ExpressionFunctionBody, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperProps } from "../DataMapper";

import { FunctionNameEditor } from "./FunctionNameEditor";
import { InputParamsPanel } from "./InputParamsPanel/InputParamsPanel";
import { DataMapperInputParam } from "./InputParamsPanel/types";
import { TypeBrowser } from "./TypeBrowser";
import { getFnNameFromST, getInputsFromST, getOutputTypeFromST } from "./utils";
import { RecordButtonGroup } from "./RecordButtonGroup";

export function DataMapperConfigPanel(props: DataMapperProps) {
    const {
        onClose,
        fnST,
        applyModifications,
        targetPosition,
        onSave,
        recordPanel,
    } = props;
    const formClasses = useFormStyles();

    const [fnName, setFnName] = useState(getFnNameFromST(fnST) || "transform");
    const [inputParams, setInputParams] = useState<DataMapperInputParam[]>([]);
    const [outputType, setOutputType] = useState("");
    const [inputType, setInputType] = useState("");
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [isAddExistType, setAddExistType] = useState(false);

    const [showOutputType, setShowOutputType] = useState(false);
    const [newRecordBy, setNewRecordBy] = useState<"input" | "output">(undefined);

    const isValidConfig = fnName && inputParams.length > 0 && outputType !== "";

    const onSaveForm = () => {
        const parametersStr = inputParams
            .map((item) => `${item.type} ${item.name}`)
            .join(",");

        const returnTypeStr = `returns ${outputType}`;

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
                    true
                )
            );
        }
        onSave(fnName);
        applyModifications(modifications);
    };

    useEffect(() => {
        if (fnST) {
            const inputs = getInputsFromST(fnST);
            if (inputs && inputs.length > 0) {
                setInputParams(getInputsFromST(fnST));
            }
            const output = getOutputTypeFromST(fnST);
            if (output && output.length > 0) {
                setOutputType(getOutputTypeFromST(fnST));
            }
        }
    }, [fnST]);

    useEffect(() => {
        if (outputType) {
            setShowOutputType(true);
        }
    }, [outputType]);

    // For Input Value
    const enableAddNewRecord = () => {
        setIsNewRecord(true);
        setNewRecordBy("input");
    };

    const closeAddNewRecord = (createdNewRecord?: string) => {
        setIsNewRecord(false);
        if (createdNewRecord) {
            if (newRecordBy === "input") {
                setInputType(createdNewRecord.split(" ")[1]);
            }
            if (newRecordBy === "output") {
                setOutputType(createdNewRecord.split(" ")[1]);
            }
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
        setOutputType("");
        setShowOutputType(false);
    };

    const breadCrumb = (
        <FormHeaderSection
            onCancel={closeAddNewRecord}
            formTitle={"lowcode.develop.configForms.dataMapper.titleExtend"}
            defaultMessage={"Data Mapper"}
            formTitleSecond={"lowcode.develop.configForms.dataMapper.titleRecord"}
            defaultMessageSecond={"Record"}
        />
    );

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
                {isNewRecord && recordPanel({ closeAddNewRecord: closeAddNewRecord })}
                {!isNewRecord && (
                    <>
                        <FormBody>
                            <FunctionNameEditor value={fnName} onChange={setFnName} />
                            <FormDivider />
                            <InputParamsPanel
                                newRecordParam={inputType}
                                inputParams={inputParams}
                                onUpdateParams={setInputParams}
                                enableAddNewRecord={enableAddNewRecord}
                                setAddExistType={setAddExistType}
                                isAddExistType={isAddExistType}
                            />
                            <FormDivider />
                            <OutputTypeConfigPanel>
                                <Title>Output Type</Title>
                                {!outputType ? (
                                    <>
                                        {showOutputType && <TypeBrowser type={outputType} onChange={setOutputType} />}
                                        <RecordButtonGroup openRecordEditor={handleShowRecordEditor} showTypeList={handleShowOutputType} />
                                    </>
                                ) : (
                                    <OutputTypeContainer>
                                        <TypeName>{outputType}</TypeName>
                                        <DeleteButton onClick={handleOutputDeleteClick} icon={<DeleteOutLineIcon fontSize="small" />} />
                                    </OutputTypeContainer>
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

const OutputTypeContainer = styled.div((props) => ({
    background: "white",
    padding: 10,
    borderRadius: 5,
    border: "1px solid #dee0e7",
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
