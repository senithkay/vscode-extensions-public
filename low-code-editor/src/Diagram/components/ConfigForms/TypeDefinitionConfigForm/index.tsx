/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { NodePosition, RecordTypeDesc, STKindChecker, TypeDefinition } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import EditButton from "../../../../assets/icons/EditButton";
import { PrimaryButton } from "../../../../components/Buttons/PrimaryButton";
import { useDiagramContext } from "../../../../Contexts/Diagram";
import { mutateTypeDefinition } from "../../../utils/modification-util";
import { SecondaryButton } from "../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../Portals/ConfigForm/Elements/TextField/FormTextInput";
import { useStyles as useFormStyles } from "../../Portals/ConfigForm/forms/style";
import { RecordEditor } from "../RecordEditor";
import { recordStyles } from "../RecordEditor/style";
import { RecordModel } from "../RecordEditor/types";
import { getGeneratedCode, getRecordModel } from "../RecordEditor/utils";

interface TypeDefFormProps {
    model?: TypeDefinition;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

// FixMe: show validation messages to type definition name
export function TypeDefinitionConfigForm(props: TypeDefFormProps) {
    const { model, targetPosition, onCancel, onSave } = props;

    const formClasses = useFormStyles();
    const recordClasses = recordStyles();

    const { api: { code: { modifyDiagram } } } = useDiagramContext();

    let defaultName: string;
    let defaultVisibility: string;
    let defaultType: string;
    let defaultTypeDescConfig: string;
    let defaultRecordModel: RecordModel;
    if (model && STKindChecker.isTypeDefinition(model)) {
        defaultName = model.typeName.value;
        defaultVisibility = "public";
        if (STKindChecker.isRecordTypeDesc(model.typeDescriptor)) {
            defaultType = "record";
            defaultRecordModel = getRecordModel(model.typeDescriptor, model.typeName.value, true,
                "record");
            defaultTypeDescConfig = getGeneratedCode(defaultRecordModel, true);
        } else if (STKindChecker.isIntTypeDesc(model.typeDescriptor)) {
            defaultType = "int";
            defaultTypeDescConfig = model.typeDescriptor.source.substring(0, 20);
        } else if (STKindChecker.isBooleanTypeDesc(model.typeDescriptor)) {
            defaultType = "boolean";
            defaultTypeDescConfig = model.typeDescriptor.source.substring(0, 20);
        } else if (STKindChecker.isStringTypeDesc(model.typeDescriptor)) {
            defaultType = "string";
            defaultTypeDescConfig = model.typeDescriptor.source.substring(0, 20);
        } else {
            defaultType = "";
            defaultTypeDescConfig = model.typeDescriptor.source.substring(0, 20);
        }
    } else {
        defaultName = "";
        defaultVisibility = "";
        defaultType = "";
        defaultTypeDescConfig = "";
    }

    const [name, setName] = useState(defaultName);
    const [visibility, setVisibility] = useState(defaultVisibility);
    const [type, setType] = useState(defaultType);
    const [isValidName, setIsValidName] = useState(defaultType);
    const [typeDescConfigs, setTypeDescConfigs] = useState(defaultTypeDescConfig);
    const [typeDescModel, setTypeDescModel] = useState<RecordModel>(defaultRecordModel);
    const [isTypeDescConfigsProgress, setIsTypeDescConfigsProgress] = useState(false);

    const handleNameChange = (nameValue: string) => {
        setName(nameValue);
    };

    const handleTypeSelect = (typeSelected: string) => {
        setType(typeSelected);
    };

    const handleVisibilitySelect = (visibilitySelected: string) => {
        setVisibility(visibilitySelected);
    };

    const handleOnSave = () => {
        if (isTypeDescConfigsProgress || typeDescConfigs) {
            let isNewTypeDesc: boolean;
            if (model) {
                isNewTypeDesc = false;
                const modelPosition = model.position as NodePosition;
                const updatePosition = {
                    startLine: modelPosition.startLine,
                    startColumn: 0,
                    endLine: modelPosition.endLine,
                    endColumn: modelPosition.endColumn
                };

                modifyDiagram([
                    mutateTypeDefinition(
                        name,
                        typeDescConfigs,
                        updatePosition,
                        isNewTypeDesc
                    )
                ]);
            } else {
                isNewTypeDesc = true;
                modifyDiagram([
                    mutateTypeDefinition(name, typeDescConfigs, targetPosition, isNewTypeDesc)
                ]);
            }
            onSave();
        } else {
            setIsTypeDescConfigsProgress(true);
        }
    };

    const validateNameValue = (value: string) => {
        // TODO: Add name validations
        // const isNameAlreadyExists = addedFields.find(field => (field.name === value));
        // setIsValidName(!isNameAlreadyExists);
        // return !isNameAlreadyExists;
        return true;
    };

    const handleRecordEdit = () => {
        setIsTypeDescConfigsProgress(true);
    };

    const handleEditorComplete = (typeDesc: string, recModel: RecordModel) => {
        setIsTypeDescConfigsProgress(false);
        setTypeDescConfigs(typeDesc);
        setTypeDescModel(recModel);
    }

    const buttonText = (type === "record" && !isTypeDescConfigsProgress) ? "Continue" : "Save";

    return (
        <>
            {!isTypeDescConfigsProgress ? (
                <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
                    <div className={formClasses.formTitleWrapper}>
                        <Typography variant="h4">
                            <Box paddingTop={2} paddingBottom={2}>Type Definition</Box>
                        </Typography>
                    </div>
                    <FormTextInput
                        dataTestId="field-name"
                        customProps={{
                            validate: validateNameValue,
                        }}
                        defaultValue={name}
                        onChange={handleNameChange}
                        label={"Field name"}
                        errorMessage={!isValidName ? "Variable name already exists" : null}
                        placeholder={"Enter field name"}
                    />
                    <SelectDropdownWithButton
                        dataTestId="visibility"
                        defaultValue={visibility}
                        customProps={
                            {
                                values: ["public", "private"],
                                disableCreateNew: true
                            }
                        }
                        label="Visibility"
                        placeholder="Select Visibility"
                        onChange={handleVisibilitySelect}
                    />
                    <SelectDropdownWithButton
                        dataTestId="type"
                        defaultValue={type}
                        customProps={
                            {
                                values: ["int", "string", "record"],
                                disableCreateNew: true
                            }
                        }
                        label="Type"
                        placeholder="Select Type"
                        onChange={handleTypeSelect}
                    />
                    {typeDescConfigs && (
                        <div className={recordClasses.activeItemContentWrapper}>
                            <div className={recordClasses.itemLabel}>
                                {typeDescConfigs.substring(0, 20)}
                            </div>
                            <div className={recordClasses.btnWrapper}>
                                <div className={recordClasses.actionBtnWrapper} onClick={handleRecordEdit}>
                                    <EditButton />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={formClasses.wizardBtnHolder}>
                        <SecondaryButton
                            text="Cancel"
                            fullWidth={false}
                            onClick={onCancel}
                        />
                        <PrimaryButton
                            text={buttonText}
                            disabled={false}
                            fullWidth={false}
                            onClick={handleOnSave}
                        />
                    </div>
                </FormControl>
            ) : (
                <RecordEditor
                    name={name}
                    isNewModel={(targetPosition !== undefined) && (targetPosition !== null)}
                    existingModel={typeDescModel}
                    onSave={handleEditorComplete}
                    model={model?.typeDescriptor as RecordTypeDesc}
                    isTypeDefinition={true}
                    onCancel={null}
                />
            )}
        </>
    )
}
