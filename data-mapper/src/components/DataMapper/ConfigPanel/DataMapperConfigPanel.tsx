import FormControl from "@material-ui/core/FormControl/FormControl";
import { FormHeaderSection, Panel, useStyles as useFormStyles } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import React from "react";
import { DataMapperProps } from "../DataMapper";


export function DataMapperConfigPanel(props: DataMapperProps) {
    const { onClose } = props;
    const formClasses = useFormStyles();

    return (
        <Panel onClose={onClose}>
            <FormControl data-testid="data-mapper-form" className={formClasses.wizardFormControl}  >
                <FormHeaderSection
                    onCancel={onClose}
                    formTitle={"lowcode.develop.configForms.dataMapper.title"}
                    defaultMessage={"Data Mapper"}
                />

            </FormControl>
        </Panel>
    );
}