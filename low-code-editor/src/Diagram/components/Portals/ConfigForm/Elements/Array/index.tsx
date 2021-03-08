/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { FormHelperText } from "@material-ui/core";
import AddRounded from "@material-ui/icons/AddRounded";
import CloseRounded from "@material-ui/icons/CloseRounded";
import classNames from "classnames";

import { FormField, getType } from "../../../../../../ConfigurationSpec/types";
import { getFormElement, getParams } from "../../../utils";
import "../../forms/ConnectorInitForm/Wizard/style.scss"
import { useStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { ButtonWithIcon } from "../Button/ButtonWithIcon";
import { IconBtnWithText } from "../Button/IconBtnWithText";

export interface ArrayProps {
    validate?: (field: string, isInvalid: boolean) => void;
}

export function Array(props: FormElementProps<ArrayProps>) {
    const { model, customProps, onChange } = props;
    const classes = useStyles();

    let arrayValues: React.ReactNode[];
    if (!model.fields) {
        model.fields = [];
    }

    const [arrayField, setArrayField] = useState(undefined);
    const [arrayLength, setArrayLength] = useState(model.fields.length);
    const [validForm, setValidForm] = useState(false);
    const [arrayValue, setArrayValue] = useState(undefined);

    if (arrayLength <= 0 && !model.optional && customProps?.validate) {
        customProps?.validate(model.name, arrayLength <= 0);
    }

    const fieldModel: FormField = {
        name: model.name,
        type: getType(model.collectionDataType),
        displayName: model.displayName
    };

    if (arrayValue) {
        fieldModel.value = arrayValue;
    }

    const validateField = (field: string, isInvalid: boolean) => {
        setValidForm(!isInvalid);
    };

    const onJsonChange = (json: string) => {
        setArrayValue(json);
    };

    const onCollectionChange = (collection: string) => {
        setArrayValue(collection);
    };

    const deleteItem = (index: number) => {
        if (model.fields && model.fields.length > 0) {
            model.fields.splice(index, 1);
            if (model.collectionDataType === "json" || model.collectionDataType === "xml") {
                onChange("[" + getParams(model.fields).toString() + "]");
            } else {
                if (onChange) {
                    onChange("[" + getParams(model.fields) + "]");
                }
            }
            setArrayLength(arrayLength - 1);
        }
    };

    const generateComponents = (addedValues: FormField[]) => {
        const components: React.ReactNode[] = [];
        addedValues.map((element, index) => {
            if (model.collectionDataType) {
                if (model.collectionDataType === "record") {
                    // TODO: Handle record
                } else if (model.collectionDataType === "collection") {
                    // TODO: Handle collection
                } else if (model.collectionDataType === "json") {
                    const getDelete = () => {
                        return () => deleteItem(index);
                    };
                    components.push(
                        <div key={index} className={classes.elementValueWrapper}>
                            <FormHelperText>{element.value}</FormHelperText>
                            <ButtonWithIcon
                                className={classes.deleteBtn}
                                onClick={getDelete()}
                                icon={<CloseRounded fontSize="small" />}
                            />
                        </div>
                    );
                } else if (model.collectionDataType === "xml") {
                    const getDelete = () => {
                        return () => deleteItem(index);
                    };
                    components.push(
                        <div className={classes.elementValueWrapper}>
                            <FormHelperText>{element.value}</FormHelperText>
                            <ButtonWithIcon
                                className={classes.deleteBtn}
                                onClick={getDelete()}
                                icon={<CloseRounded fontSize="small" />}
                            />
                        </div>
                    );
                } else if (element) {
                    const getDelete = () => {
                        return () => deleteItem(index);
                    };
                    components.push(
                        <div className={classes.elementValueWrapper}>
                            <FormHelperText className={classes.textlabel}>{element.value}</FormHelperText>
                            <ButtonWithIcon
                                className={classes.deleteBtn}
                                onClick={getDelete()}
                                icon={<CloseRounded fontSize="small" />}
                            />
                        </div>
                    );
                }
            }
        });
        return components;
    };

    const addValue = () => {
        fieldModel.type = getType(model.collectionDataType);
        fieldModel.collectionDataType  = model.collectionDataType;
        fieldModel.isParam = true;
        if (model.collectionDataType) {
            if (model.collectionDataType === "record") {
                // TODO: Handle record
            } else if (model.collectionDataType === "collection") {
                // TODO: Handle collection
            } else if (model.collectionDataType === "xml") {
                if (validForm && (arrayValue !== undefined) && (arrayValue !== '')) {
                    fieldModel.value = arrayValue;
                    model.fields.push(fieldModel);
                    setArrayLength(model.fields.length);
                    if (!model.optional && customProps?.validate) {
                        customProps?.validate(model.name, model.fields.length <= 0);
                    }
                    onChange("[" + getParams(model.fields) + "]");
                    model.value = undefined;
                    setArrayValue(undefined);
                }
            } else if (model.collectionDataType === "json") {
                if (validForm && (arrayValue !== undefined) && (arrayValue !== '')) {
                    fieldModel.value = arrayValue;
                    model.fields.push(fieldModel);
                    setArrayLength(model.fields.length);
                    if (!model.optional && customProps?.validate) {
                        customProps?.validate(model.name, model.fields.length <= 0);
                    }
                    onChange("[" + getParams(model.fields) + "]");
                    setArrayValue(undefined);
                    model.value = undefined;
                }
            } else {
                if ((arrayValue && (arrayValue !== '') && validForm) ||
                    // 2nd condition is to cater boolean values coming at the initial instance where array value state
                    // is empty
                    (model.collectionDataType === "boolean") && (arrayValue === undefined)) {
                    if (model.type === "collection") {
                        model.fields.push(fieldModel);
                        if (onChange) {
                            // Arrays coming from property-form
                            onChange("[" + getParams(model.fields) + "]");
                        }
                    } else {
                        model.fields.push(fieldModel);
                        onChange("[" + getParams(model.fields) + "]");
                    }
                    setArrayLength(model.fields.length);
                    if (!model.optional && customProps?.validate) {
                        customProps?.validate(model.name, model.fields.length <= 0);
                    }
                    if (model.collectionDataType !== "boolean") {
                        setArrayValue(undefined);
                        model.value = undefined;
                    }
                }
            }
        }
    };

    arrayValues = generateComponents(model.fields);

    React.useEffect(() => {
        if (model) {
            if (model.collectionDataType) {
                const elementProps: FormElementProps = {
                    model: fieldModel,
                };
                elementProps.customProps = {
                    validate: validateField,
                    statementType: fieldModel.type
                };
                if (model.collectionDataType === "json" || model.collectionDataType === "xml") {
                    elementProps.onChange = onJsonChange;
                    elementProps.defaultValue = arrayValue;
                } else if (model.collectionDataType === "boolean") {
                    elementProps.onChange = onCollectionChange;
                    elementProps.defaultValue = arrayValue;
                } else if (model.type === "collection") {
                    elementProps.onChange = onCollectionChange;
                }
                setArrayField(getFormElement(elementProps, model.collectionDataType));
            }
        }
        setArrayValue(undefined);
    }, [model]);

    return (
        <div data-testid="array" className={classes.groupedForm}>
            {/* code to be refactored keeping the connented code for refernce
            {
                (fieldModel.type === "json" || fieldModel.type === "xml" || fieldModel.type === "boolean") ? (
                    <div data-testid="ison-add-btn" className="json-add-container">
                        <div className="json-array-wrapper">
                            {arrayField}
                        </div>
                        <div className="add-json-btn">
                            <IconBtnWithText
                                onClick={addValue}
                                text="Add Value"
                                icon={<AddRounded fontSize="small" className={classes.iconButton} />}
                            />
                        </div>
                    </div>
                ) :
                    (
                        <div className="add-container">
                            <div className="label-inside-wapper"></div>
                            <div className="array-wrapper">
                                {arrayField}
                            </div>
                            <div data-testid="add-btn" className="add-btn">
                                <ButtonWithIcon
                                    className="add-button"
                                    onClick={addValue}
                                    icon={<AddRounded fontSize="small" />}
                                />
                            </div>
                        </div>
                    )
            }
            */}
            <div data-testid="ison-add-btn" className={classes.addContainer}>
                <div className={classes.arrayWrapperContent}>
                    {arrayField}
                </div>
                <div className={classes.addWrapperBtn} data-testid="add-btn">
                    <IconBtnWithText
                        onClick={addValue}
                        text="Add Value"
                        icon={<AddRounded fontSize="small" className={classes.iconButton} />}
                    />
                </div>
            </div>
            <div>
                <>
                    {arrayValues.length > 0 ? (
                        <div>
                            <div className={classes.divider} />
                            <FormHelperText className={classes.inputLabelWrapper}> Added Elements </FormHelperText>
                        </div>
                    )
                        : null
                    }
                </>
                <div className={classes.valueWrapper}>
                    {arrayValues}
                </div>
            </div>
        </div>
    );
}
