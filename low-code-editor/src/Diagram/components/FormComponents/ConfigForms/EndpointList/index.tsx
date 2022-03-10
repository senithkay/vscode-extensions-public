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
import React, { ReactNode, useContext } from "react";
import { FormattedMessage } from "react-intl";

import { Box, FormControl, List, ListItem, Typography } from "@material-ui/core";
import { FormHeaderSection, PrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { FormGeneratorProps } from "../../FormGenerator";
import { wizardStyles as useFormStyles } from "../style";

import useStyles from "./style";

export interface EndpointListProps {
    functionNode: STNode,
    onSelect: (actionInvo: STNode) => void;
    onCancel: () => void;
    onAddConnector: () => void;
}

export function EndpointList(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();
    const {
        props: {
            stSymbolInfo: { moduleEndpoints, localEndpoints },
        },
    } = useContext(Context);
    const { onCancel } = props;
    const { functionNode, onSelect, onAddConnector } = props.configOverlayFormStatus.formArgs as EndpointListProps;
    let isEndpointExists = false;
    const endpointList: ReactNode[] = [];

    const getListComponent = (node: STNode, name: string) => {
        const handleOnSelect = () => {
            onSelect(node);
        };
        return (
            <ListItem key={`endpoint-${name.toLowerCase()}`} button={true} onClick={handleOnSelect}>
                <Typography variant="h4">{name}</Typography>
            </ListItem>
        );
    };

    moduleEndpoints?.forEach((node, name) => {
        endpointList.push(getListComponent(node, name));
        isEndpointExists = true;
    });

    localEndpoints?.forEach((node, name) => {
        if (
            functionNode.position.startLine < node.position.startLine &&
            functionNode.position.endLine > node.position.endLine
        ) {
            endpointList.push(getListComponent(node, name));
            isEndpointExists = true;
        }
    });

    return (
        <FormControl data-testid="endpoint-list-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                statementEditor={false}
                formTitle={"lowcode.develop.configForms.endpointList.title"}
                defaultMessage={"Action"}
                toggleChecked={false}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div className={classes.container}>
                        {!isEndpointExists && (
                            <Box>
                                <Typography className={classes.emptyTitle}>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.endpoint.empty"
                                        defaultMessage="No existing connectors found"
                                    />
                                </Typography>
                                <Box marginY={2}>
                                    <PrimaryButton
                                        text="Add Connector"
                                        fullWidth={false}
                                        onClick={onAddConnector}
                                    />
                                </Box>
                            </Box>
                        )}
                        {isEndpointExists && (
                            <>
                                <Typography>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.endpoint.subtitle"
                                        defaultMessage="Select a connector"
                                    />
                                </Typography>
                                <List>{endpointList}</List>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
