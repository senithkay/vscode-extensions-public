/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda no-console
import React, { useContext, useState } from "react";

import { Divider, FormControl, TextField } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { dynamicConnectorStyles as connectorStyles, FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { ClassDefinition, ModulePart, NodePosition, STKindChecker, SyntaxDiagnostics } from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModulePart } from "../../../utils/ls-utils";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";

export interface ClassFormProps {
    model: ClassDefinition;
    completions: SuggestionItem[];
}

export function GraphqlClassForm(props: ClassFormProps) {
    const { model } = props;

    const { applyModifications, onCancel, onSave, getLangClient, fullST } = useContext(FormEditorContext);

    const classes = useStyles();
    const connectorClasses = connectorStyles();

    const [className, setClassName] = useState<string>(model?.className.value);
    const [diagnostics, setDiagnostics] = useState<SyntaxDiagnostics[]>(undefined);

    console.log(">>> model", model);
    console.log(">>> fullST", fullST);

    const handleClassNameChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const name = event.target?.value.trim();
        setClassName(name);
        changeClassName(name);
    };

    const handleFormSave = () => {
        const modifications: STModification[] = [];
        // update the class name
        const classNamePosition = getClassNamePosition();
        modifications.push({
            type: "INSERT",
            config: { STATEMENT: className.trim() },
            endColumn: classNamePosition.endColumn,
            endLine: classNamePosition.endLine,
            startColumn: classNamePosition.startColumn,
            startLine: classNamePosition.endLine,
        });
        // update the class attributes

        // apply all modifications
        applyModifications(modifications);
        onSave();
    };

    const changeClassName = debounce(async (name: string) => {
        // find class name position from fullST
        const classNamePosition = getClassNamePosition();
        // update the class name
        const updatedContent = getUpdatedSource(name.trim(), fullST?.source, classNamePosition, undefined, true);
        const partialST = await getPartialSTForModulePart({ codeSnippet: updatedContent.trim() }, getLangClient);
        console.log(">>> partialST", partialST);
        if (!partialST.syntaxDiagnostics.length) {
            // onChange(updatedContent, partialST, undefined, { model: model }, name, completionEditorTypeKinds, 0, { startLine: -1, startColumn: -4 });
            setDiagnostics(undefined);
        } else {
            setDiagnostics(partialST.syntaxDiagnostics);
        }
    }, 275);

    const formContent = () => {
        return (
            <>
                <div className={connectorClasses.formContentWrapper}>
                    <div className={connectorClasses.formNameWrapper}>
                        <FieldTitle title="Class Name" optional={false} />
                        <TextField
                            id="outlined-helperText"
                            size="small"
                            defaultValue={className}
                            onChange={handleClassNameChange}
                            variant="outlined"
                            fullWidth={true}
                        />
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                    </div>
                </div>

                <FormActionButtons cancelBtnText="Cancel" cancelBtn={true} saveBtnText="Save" onSave={handleFormSave} onCancel={onCancel} validForm={true} />
            </>
        );
    };

    return (
        <FormControl data-testid="graphql-resource-form" className={connectorClasses.wizardFormControlExtended}>
            <FormHeaderSection onCancel={onCancel} formTitle={"Configure GraphQL Class"} defaultMessage={"Configure GraphQL Class"} />
            {formContent()}
        </FormControl>
    );

    function getClassNamePosition(): NodePosition {
        let classNamePosition: NodePosition;
        (fullST as ModulePart).members.forEach((member) => {
            if (STKindChecker.isClassDefinition(member) && member.className.value === model?.className.value) {
                classNamePosition = member.className.position;
            }
        });
        return classNamePosition;
    }
}

export const useStyles = makeStyles(() =>
    createStyles({
        textField: {
            '& .MuiInputBase-input .MuiOutlinedInput-input': {
                padding: "8px 16px !important",
            },
            '& .MuiFormControl-root .MuiTextField-root': {
                width: "100%",
            }
        },
    })
);
