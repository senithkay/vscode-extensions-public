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

// NOTE: This component contains three updates in the language server extension.
//      phase one - simple visibleEndpoint object ( GA Release)
//      phase two - update the visibleEndpoint object with package names and versions ( RC 1 patch)
//      phase three - update visibleEndpoint object with position and add visibleEndpoints to every blockStatement
// We need to remove these extra code blocks once VS Code plugin sync with latests changes.

import React, { ReactNode, useContext } from "react";
import { FormattedMessage } from "react-intl";

import { Box, FormControl, List, ListItem, Typography } from "@material-ui/core";
import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormHeaderSection, PrimaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STKindChecker, STNode, VisibleEndpoint } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { FormGeneratorProps } from "../../../FormGenerator";
import { wizardStyles as useFormStyles } from "../../style";
import useStyles from "../style";
import { getConnectorFromVisibleEp, getMatchingConnector, getTargetBlock } from "../util";

export interface EndpointListProps {
    functionNode: STNode;
    onSelect: (connector: BallerinaConnectorInfo, endpointName: string) => void;
    addNewEndpoint: () => void;
}

export function EndpointList(props: FormGeneratorProps) {
    const classes = useStyles();
    const formClasses = useFormStyles();
    const {
        props: {
            stSymbolInfo: { moduleEndpoints, localEndpoints },
        },
    } = useContext(Context);
    const { targetPosition, onCancel } = props;
    const { functionNode, onSelect, addNewEndpoint } = props.configOverlayFormStatus.formArgs as EndpointListProps;

    const endpointElementList: ReactNode[] = [];
    const visitedEndpoints: string[] = [];
    let isEndpointExists = false;
    let executePhaseOne = false;
    let executePhaseTwo = false;

    const getListComponent = (connector: BallerinaConnectorInfo, name: string) => {
        const handleOnSelect = () => {
            onSelect(connector, name);
        };
        return (
            <ListItem
                key={`endpoint-${name.toLowerCase()}`}
                data-testid={`${name.toLowerCase().replaceAll(" ", "-")}`}
                button={true}
                onClick={handleOnSelect}
            >
                <Typography variant="h4">{name}</Typography>
            </ListItem>
        );
    };

    if (
        targetPosition &&
        functionNode &&
        (STKindChecker.isFunctionDefinition(functionNode) ||
            STKindChecker.isResourceAccessorDefinition(functionNode)) &&
        STKindChecker.isFunctionBodyBlock(functionNode.functionBody)
    ) {
        const targetBlock = getTargetBlock(targetPosition, functionNode.functionBody);

        if (
            targetBlock.VisibleEndpoints &&
            targetBlock.VisibleEndpoints.length > 0 &&
            targetBlock.VisibleEndpoints[0].position
        ) {
            const blockVisibleEndpoints: VisibleEndpoint[] = targetBlock?.VisibleEndpoints;
            blockVisibleEndpoints?.forEach((endpoint) => {
                if (endpoint.position && endpoint.position.endLine < targetPosition.startLine) {
                    const connector = getConnectorFromVisibleEp(endpoint);
                    endpointElementList.push(getListComponent(connector, endpoint.name));
                    isEndpointExists = true;
                }
            });
        } else if (
            targetBlock?.VisibleEndpoints === undefined ||
            (targetBlock.VisibleEndpoints.length > 0 && targetBlock.VisibleEndpoints[0].position === undefined)
        ) {
            // INFO: enable phase two. phase three need position information.
            executePhaseTwo = true;
        }
    }

    // INFO: this code block use to work with phase two.
    if (
        executePhaseTwo &&
        (STKindChecker.isFunctionDefinition(functionNode) || STKindChecker.isResourceAccessorDefinition(functionNode))
    ) {
        functionNode.functionBody.VisibleEndpoints?.forEach((endpoint) => {
            if (!(endpoint.packageName && endpoint.version)) {
                // INFO: enable phase one. phase two need package name and version information.
                executePhaseOne = true;
                return;
            }
            if (visitedEndpoints.indexOf(endpoint.name) < 0) {
                const connector = getConnectorFromVisibleEp(endpoint);
                endpointElementList.push(getListComponent(connector, endpoint.name));
            }
            visitedEndpoints.push(endpoint.name);
            isEndpointExists = true;
        });
    }

    // INFO: this code block use to work with phase one.
    if (executePhaseOne) {
        const getListComponentFromNode = (node: STNode, epName: string) => {
            const connector = getMatchingConnector(node);
            if (!connector) {
                return <></>;
            }
            return getListComponent(connector, epName);
        };

        moduleEndpoints?.forEach((node, name) => {
            endpointElementList.push(getListComponentFromNode(node, name));
            isEndpointExists = true;
        });

        localEndpoints?.forEach((node, name) => {
            if (
                functionNode.position &&
                node.position &&
                targetPosition &&
                functionNode.position.startLine < node.position.startLine &&
                node.position.endLine < targetPosition.startLine
            ) {
                endpointElementList.push(getListComponentFromNode(node, name));
                isEndpointExists = true;
            }
        });
    }

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
                        {!isEndpointExists && (
                            <Box>
                                <Typography className={classes.emptyTitle}>
                                    <FormattedMessage
                                        id="lowcode.develop.configForms.endpoint.empty"
                                        defaultMessage="No existing connectors found"
                                    />
                                </Typography>
                                <Box marginY={2}>
                                    <PrimaryButton text="Add Connector" fullWidth={false} onClick={addNewEndpoint} />
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
                                <List>{endpointElementList}</List>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </FormControl>
    );
}
