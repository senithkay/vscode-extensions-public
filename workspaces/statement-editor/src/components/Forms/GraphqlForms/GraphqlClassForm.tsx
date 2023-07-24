/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// tslint:disable: jsx-no-multiline-js jsx-no-lambda no-console
import React, { useContext, useState } from "react";

import { Box, FormControl } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { LiteTextField } from "@wso2-enterprise/ballerina-expression-editor";
import {
    dynamicConnectorStyles as connectorStyles,
    FormActionButtons,
    FormHeaderSection,
    TextPreLoader
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    ClassDefinition,
    ModulePart,
    NodePosition,
    STKindChecker,
    SyntaxDiagnostics
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModulePart, getRenameEdits } from "../../../utils/ls-utils";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";

export interface ClassFormProps {
    model: ClassDefinition;
    completions: SuggestionItem[];
}

export function GraphqlClassForm(props: ClassFormProps) {
    const { model } = props;

    const { onCancel, onSave, getLangClient, fullST, currentFile, renameSymbol } = useContext(FormEditorContext);

    const connectorClasses = connectorStyles();

    const [className, setClassName] = useState<string>(model?.className.value);
    const [diagnostics, setDiagnostics] = useState<SyntaxDiagnostics[]>(undefined);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const handleClassNameChange = (value: string) => {
        const name = value.trim();
        setClassName(name);
        changeClassName(name);
    };

    const handleFormSave = async () => {
        setIsUpdating(true);
        const classNamePosition = getClassNamePosition();
        const workspaceEdit = await getRenameEdits(currentFile.path, className.trim(), classNamePosition, getLangClient);
        await renameSymbol(workspaceEdit);
        setIsUpdating(false);
        onSave();
    };

    const changeClassName = debounce(async (name: string) => {
        // find class name position from fullST
        const classNamePosition = getClassNamePosition();
        // update the class name
        const updatedContent = getUpdatedSource(name.trim(), fullST?.source, classNamePosition, undefined, true);
        const partialST = await getPartialSTForModulePart({ codeSnippet: updatedContent.trim() }, getLangClient);
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
                        <LiteTextField
                            value={className}
                            onChange={handleClassNameChange}
                            isLoading={false}
                            diagnostics={
                                diagnostics?.length > 0 ? diagnostics : model?.className?.viewState?.diagnostics
                            }
                        />
                    </div>
                </div>

                <FormActionButtons
                    cancelBtnText="Cancel"
                    cancelBtn={true}
                    saveBtnText="Save"
                    onSave={handleFormSave}
                    onCancel={onCancel}
                    validForm={true}
                />
                {isUpdating && (
                    <Box display="flex" justifyContent="center">
                        <TextPreLoader position="absolute" text="Renaming constructs..." />
                    </Box>
                )}
            </>
        );
    };

    return (
        <FormControl data-testid="graphql-resource-form" className={connectorClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Configure GraphQL Class"}
                defaultMessage={"Configure GraphQL Class"}
            />
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
