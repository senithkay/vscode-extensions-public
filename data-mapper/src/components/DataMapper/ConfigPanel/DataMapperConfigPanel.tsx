import styled from "@emotion/styled";
import Divider from "@material-ui/core/Divider/Divider";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { createFunctionSignature, STModification, updateFunctionSignature } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection, Panel, useStyles as useFormStyles } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import React, { useEffect, useState } from "react";
import { DataMapperProps } from "../DataMapper";
import { FunctionNameEditor, getFnNameFromST } from "./FunctionNameEditor";
import { InputParamsPanel } from "./InputParamsPanel/InputParamsPanel";
import { DataMapperInputParam } from "./InputParamsPanel/types";
import { TypeBrowser } from "./TypeBrowser";

export function DataMapperConfigPanel(props: DataMapperProps) {
    const { onClose, fnST, applyModifications, targetPosition, onSave } = props;
    const formClasses = useFormStyles();

    const [fnName, setFnName] = useState("transform");
    const [inputParams, setInputParams] = useState<DataMapperInputParam[]>([]);
    const [outputType, setOutputType] = useState("");

    const isValidConfig = fnName && inputParams.length > 0 && outputType !== "";

    const onSaveForm = () => {
        const parametersStr = inputParams
            .map((item) => `${item.type} ${item.name}`)
            .join(",");

        const returnTypeStr = `returns ${outputType}`;

        const modifications: STModification[] = [];
        if (fnST && STKindChecker.isFunctionDefinition(fnST)) {
            modifications.push(
                updateFunctionSignature(
                    fnName,
                    parametersStr,
                    returnTypeStr,
                    {
                        ...fnST?.functionSignature?.position,
                        startColumn: fnST?.functionName?.position?.startColumn,
                    }
                )
            );
        } else {
            modifications.push(
                createFunctionSignature(
                    "public",
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
            setFnName(getFnNameFromST(fnST));
        }
    }, [fnST]);

    return (
        <Panel onClose={onClose}>
            <FormControl variant="outlined" data-testid="data-mapper-form" className={formClasses.wizardFormControl}  >
                <FormHeaderSection
                    onCancel={onClose}
                    formTitle={"lowcode.develop.configForms.dataMapper.title"}
                    defaultMessage={"Data Mapper"}
                />
                <FormBody>
                    <FunctionNameEditor value={fnName} onChange={setFnName} />
                    <FormDivider />
                    <InputParamsPanel inputParams={inputParams} onUpdateParams={setInputParams} />
                    <FormDivider />
                    <OutputTypeConfigPanel>
                        <Title>Output Type</Title>
                        <TypeBrowser type={outputType} onChange={setOutputType} />
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
            </FormControl>
        </Panel>
    );
}

const FormBody = styled.div`
    width: 100%;
    flexDirection: row;
    padding: 15px 20px;
    fontFamily: Gilmer;
`;

const FormDivider = styled(Divider)`
    margin: 1.5rem 0
`;

const OutputTypeConfigPanel = styled.div`
    width: 100%;
`;

export const Title = styled.div(() => ({
    fontSize: '13px',
    letterSpacing: 'normal',
    textTransform: 'capitalize',
    margin: '0 0 8px',
    fontFamily: 'Gilmer',
    lineHeight: '1rem',
    paddingBottom: '0.6rem',
    fontWeight: 500
}));
