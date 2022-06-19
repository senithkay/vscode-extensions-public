/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { Box, FormControl, List, ListItem, Typography } from "@material-ui/core";
import { BallerinaConnectorInfo, FunctionDefinitionInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection, PrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from "../../../../../../Contexts/Diagram";
import { createObjectDeclaration, getAllVariables, getInitialSource } from "../../../../../utils";
import { genVariableName, getFormattedModuleName } from "../../../../Portals/utils";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import useStyles from "../style";
import { getDefaultParams, getFormFieldReturnType } from "../util";

interface ActionListProps {
    actions: FunctionDefinitionInfo[];
    onSelect: (action: FunctionDefinitionInfo) => void;
}

export function ActionList(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();

    const { model, targetPosition, onCancel, onSave, configOverlayFormStatus } = props;
    const { isLoading, formArgs } = configOverlayFormStatus;
    const { actions, onSelect } = formArgs as ActionListProps;

    const {
        props: { currentFile, stSymbolInfo, syntaxTree, experimentalEnabled },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library,
        },
    } = useContext(Context);

    const actionElementList = actions?.map((action) => {
        if(action.name === "init"){
            return;
        }
        const name = action.displayAnnotation?.label || action.name;
        const handleOnSelect = () => {
            onSelect(action);
        };
        return (
            <ListItem
                key={`action-${action.name.toLowerCase()}`}
                data-testid={`${action.name.toLowerCase().replaceAll(" ", "-")}`}
                button={true}
                onClick={handleOnSelect}
            >
                <Typography variant="h4">{name}</Typography>
            </ListItem>
        );
    });

    return (
        <FormControl data-testid="endpoint-list-form" className={formClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.configForms.endpointList.title"}
                defaultMessage={"Action"}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div className={classes.container}>
                        {isLoading && (<Box>
                            <Typography className={classes.emptyTitle}>
                               Loading...
                            </Typography>
                        </Box>)}

                        {!isLoading && actions && (
                            <>
                                <Typography>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.endpoint.subtitle"
                                        defaultMessage="Select an action"
                                    />
                                </Typography>
                                <List>{actionElementList}</List>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
