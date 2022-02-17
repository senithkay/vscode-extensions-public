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
import React, { useState } from "react";

import { FormControl } from "@material-ui/core";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { ViewContainer, ViewProps } from "../components/ViewContainer/ViewContainer";

export const useStatementEditor = (props: ViewProps) => {
    const {
        onCancel,
        experimentalEnabled,
        ...restProps
    } = props;

    const [isStmtEditor, setIsStmtEditor] = useState(false);

    const handleStmtEditorToggle = () => {
        setIsStmtEditor(!isStmtEditor);
    };

    const stmtEditorComponent =
        isStmtEditor && (
            <FormControl data-testid="property-form">
                <FormHeaderSection
                    onCancel={onCancel}
                    formTitle={"lowcode.develop.configForms.statementEditor.title"}
                    defaultMessage={"Statement Editor"}
                    statementEditor={true}
                    handleStmtEditorToggle={handleStmtEditorToggle}
                    toggleChecked={true}
                    experimentalEnabled={experimentalEnabled}
                />
                <ViewContainer
                    onCancel={onCancel}
                    {...restProps}
                />
            </FormControl>
        );

    return {
        stmtEditorComponent,
        handleStmtEditorToggle
    }
}
