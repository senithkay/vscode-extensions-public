import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormHeaderSection, Panel, useStyles as useFormStyles } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import React from "react";
import { AddIOTypeNodeWidget } from "../../Diagram/Node/commons/AddIOTypeNodeWidget";
import { DataMapperProps } from "../DataMapper";
import { FunctionNameEditor } from "./FunctionNameEditor";
import { InputConfigWidget } from "./InputConfigPanel";


export function DataMapperConfigPanel(props: DataMapperProps) {
    const { onClose, fnST, langClientPromise, applyModifications, stSymbolInfo } = props;
    const formClasses = useFormStyles();

    return (
        <Panel onClose={onClose}>
            <FormControl data-testid="data-mapper-form" className={formClasses.wizardFormControl}  >
                <FormHeaderSection
                    onCancel={onClose}
                    formTitle={"lowcode.develop.configForms.dataMapper.title"}
                    defaultMessage={"Data Mapper"}
                />
                <FunctionNameEditor/>
                <InputConfigWidget/>
                

            </FormControl>
        </Panel>
    );
}