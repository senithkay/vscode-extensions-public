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

import { STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, List, ListItem, Typography } from "@material-ui/core";

import { Context } from "../../../../../Contexts/Diagram";
import { useFunctionContext } from "../../../../../Contexts/Function";
import { wizardStyles as useFormStyles } from "../../ConfigForms/style";
import useStyles from "./style";
import { FormGeneratorProps } from "../../FormGenerator";

export interface EndpointListProps {
    onSelect: (actionInvo: STNode) => void;
}

export function EndpointList(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();
    const {
        props: {
            stSymbolInfo: { moduleEndpoints, localEndpoints },
        },
    } = useContext(Context);
    const { functionNode } = useFunctionContext();
    const { onSelect } = props.configOverlayFormStatus.formArgs as EndpointListProps;
    const isEndpointExists = moduleEndpoints.size > 0 || localEndpoints.size > 0;
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
    });

    localEndpoints?.forEach((node, name) => {
        if (
            functionNode.position.startLine < node.position.startLine &&
            functionNode.position.endLine > node.position.endLine
        ) {
            endpointList.push(getListComponent(node, name));
        }
    });

    return (
        <FormControl data-testid="endpoint-list-form" className={classes.container}>
            <div className={formClasses.formWrapper}>
                <div className={formClasses.formFeilds}>
                    <div className={formClasses.formWrapper}>
                        <div className={formClasses.formTitleWrapper}>
                            <div className={formClasses.mainTitleWrapper}>
                                <Typography variant="h4">
                                    <Box paddingTop={2} paddingBottom={2}>
                                        <FormattedMessage
                                            id="lowcode.develop.configForms.endpoint.title"
                                            defaultMessage="API Invocation"
                                        />
                                    </Box>
                                </Typography>
                            </div>
                        </div>

                        <div className={classes.container}>
                            {!isEndpointExists && (
                                <Box>
                                    <Typography className={classes.emptyTitle}>
                                        <FormattedMessage
                                            id="lowcode.develop.configForms.endpoint.empty"
                                            defaultMessage="No API connections found"
                                        />
                                    </Typography>
                                </Box>
                            )}
                            {isEndpointExists && (
                                <>
                                    <Typography>
                                        <FormattedMessage
                                            id="lowcode.develop.configForms.endpoint.subtitle"
                                            defaultMessage="Select an API connection"
                                        />
                                    </Typography>
                                    <List>{endpointList}</List>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
