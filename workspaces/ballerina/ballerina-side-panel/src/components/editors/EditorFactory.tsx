/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { NodeKind, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";

import { FormField } from "../Form/types";
import { MultiSelectEditor } from "./MultiSelectEditor";
import { TextEditor } from "./TextEditor";
import { TypeEditor } from "./TypeEditor";
import { ContextAwareExpressionEditor } from "./ExpressionEditor";
import { FormExpressionEditorRef } from "@wso2-enterprise/ui-toolkit";
import { ParamManagerEditor } from "../ParamManager/ParamManager";
import { DropdownEditor } from "./DropdownEditor";
import { FileSelect } from "./FileSelect";
import { CheckBoxEditor } from "./CheckBoxEditor";
import { ArrayEditor } from "./ArrayEditor";
import { MapEditor } from "./MapEditor";
import { ChoiceForm } from "./ChoiceForm";
import { FormMapEditor } from "./FormMapEditor";

interface FormFieldEditorProps {
    field: FormField;
    selectedNode?: NodeKind;
    openRecordEditor?: (open: boolean) => void;
    openSubPanel?: (subPanel: SubPanel) => void;
    subPanelView?: SubPanelView;
    handleOnFieldFocus?: (key: string) => void;
    autoFocus?: boolean;
    handleOnTypeChange?: () => void;
    visualizableFields?: string[];
}

export const EditorFactory = React.forwardRef<FormExpressionEditorRef, FormFieldEditorProps>((props, ref) => {
    const {
        field,
        selectedNode,
        openRecordEditor,
        openSubPanel,
        subPanelView,
        handleOnFieldFocus,
        autoFocus,
        handleOnTypeChange,
        visualizableFields
    } = props;

    if (field.type === "MULTIPLE_SELECT") {
        let label: string;
        switch (selectedNode) {
            case "DATA_MAPPER":
                label = "Add Another Input";
                break;
            default:
                label = "Add Another";
                break;
        }
        return <MultiSelectEditor field={field} label={label} openSubPanel={openSubPanel} />;
    } else if (field.type === "CHOICE") {
        return <ChoiceForm field={field} />;
    } else if (field.type === "EXPRESSION_SET") {
        return <ArrayEditor field={field} label={"Add Another Value"} />;
    } else if (field.type === "MAPPING_EXPRESSION_SET") {
        return <MapEditor field={field} label={"Add Another Key-Value Pair"} />;
    } else if (field.type === "FLAG") {
        return <CheckBoxEditor field={field} />;
    } else if (field.type === "EXPRESSION" && field.key === "resourcePath") {
        // HACK: this should fixed with the LS API. this is used to avoid the expression editor for resource path field.
        return <TextEditor field={field} handleOnFieldFocus={handleOnFieldFocus} />;
    } else if (field.type.toUpperCase() === "ENUM") {
        // Enum is a dropdown field
        return <DropdownEditor field={field} />;
    } else if (field.type === "FILE_SELECT" && field.editable) {
        return <FileSelect field={field} />;
    } else if (field.type === "SINGLE_SELECT" && field.editable) {
        // HACK:Single select field is treat as type editor for now
        return <DropdownEditor field={field} openSubPanel={openSubPanel} />;
    } else if (!field.items && (field.key === "type" || field.type === "TYPE") && field.editable) {
        // Type field is a type editor
        return (
            <TypeEditor
                field={field}
                openRecordEditor={openRecordEditor}
                handleOnFieldFocus={handleOnFieldFocus}
                autoFocus={autoFocus}
                handleOnTypeChange={handleOnTypeChange}
            />
        );
    } else if (!field.items && field.type === "EXPRESSION" && field.editable) {
        // Expression field is a inline expression editor
        return (
            <ContextAwareExpressionEditor
                ref={ref}
                field={field}
                openSubPanel={openSubPanel}
                subPanelView={subPanelView}
                handleOnFieldFocus={handleOnFieldFocus}
                autoFocus={autoFocus}
                visualizable={visualizableFields?.includes(field.key)}
            />
        );
    } else if (field.type === "VIEW") {
        // Skip this property
        return <></>;
    } else if (field.type === "PARAM_MANAGER") {
        return <ParamManagerEditor field={field} openRecordEditor={openRecordEditor} handleOnFieldFocus={handleOnFieldFocus} />;
    } else if (field.type === "REPEATABLE_PROPERTY") {
        return <FormMapEditor field={field} label={"Add Another Key-Value Pair"} />;
    } else {
        // Default to text editor
        // Readonly fields are also treated as text editor
        return <TextEditor field={field} handleOnFieldFocus={handleOnFieldFocus} autoFocus={autoFocus} />;
    }
});
