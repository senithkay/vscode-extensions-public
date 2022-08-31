import styled from "@emotion/styled";
import Divider from "@material-ui/core/Divider/Divider";
import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormHeaderSection, Panel, useStyles as useFormStyles } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import React, { useEffect, useState } from "react";
import { DataMapperProps } from "../DataMapper";
import { FunctionNameEditor, getFnNameFromST } from "./FunctionNameEditor";
import { InputParamsPanel } from "./InputParamsPanel/InputParamsPanel";
import { DataMapperInputParam } from "./InputParamsPanel/types";
import { TypeBrowser } from "./TypeBrowser";

export function DataMapperConfigPanel(props: DataMapperProps) {
    const { onClose, fnST, langClientPromise, applyModifications, stSymbolInfo } = props;
    const formClasses = useFormStyles();

    const [fnName, setFnName] = useState("transform");
    const [inputParams, setInputParams] = useState<DataMapperInputParam[]>([]);
    const [outputType, setOutputType] = useState("");

    useEffect(() => {
        if (fnST) {
            setFnName(getFnNameFromST(fnST));
        }
    }, [fnST]);

    return (
        <Panel onClose={onClose}>
            <FormControl data-testid="data-mapper-form" className={formClasses.wizardFormControl}  >
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
                    <TypeBrowser type={outputType} onChange={setOutputType} />
                </FormBody>
            </FormControl>
        </Panel>
    );
}

const FormBody = styled.div`
    width: 100%;
    flexDirection: row;
    padding: 15px 20px;
`;

const FormDivider = styled(Divider)`
    margin: 1.5rem 0
`;