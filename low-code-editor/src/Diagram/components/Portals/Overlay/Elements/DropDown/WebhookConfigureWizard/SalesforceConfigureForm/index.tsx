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
import React, { useContext, useEffect, useState } from "react";

import {
    CaptureBindingPattern,
    FunctionBodyBlock,
    FunctionDefinition,
    ModulePart,
    ModuleVarDecl,
    STKindChecker
} from "@ballerina/syntax-tree";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../../../Definitions";
import { TRIGGER_TYPE_WEBHOOK } from "../../../../../../../models";
import { updatePropertyStatement } from "../../../../../../../utils/modification-util";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { FormTextInput } from "../../../../../ConfigForm/Elements/TextField/FormTextInput";
import { tooltipMessages } from "../../../../../utils/constants";
import { useStyles } from "../../styles";

interface SalesforceConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [ key: string ]: any;
}

export function SalesforceConfigureForm(props: SalesforceConfigureFormProps) {
    const { state } = useContext(DiagramContext);
    const {
        isMutationProgress: isFileSaving,
        isLoadingSuccess: isFileSaved,
        syntaxTree,
        onModify: dispatchModifyTrigger,
        originalSyntaxTree,
        onMutate: dispatchMutations,
        trackTriggerSelection
    } = state;
    const model: FunctionDefinition = syntaxTree as FunctionDefinition;
    const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
    const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
    const { onComplete } = props;
    const classes = useStyles();

    const [ triggerChanged, setTriggerChanged ] = useState(false);
    const [ topic, setTopic ] = useState("");
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");

    const Trigger = "Salesforce";

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [ isFileSaving, isFileSaved ]);

    const handleTopicOnChange = (value: string) => {
        setTopic(value);
    };
    const handleUsernameOnChange = (value: string) => {
        setUsername(value);
    };
    const handlePasswordOnChange = (value: string) => {
        setPassword(value);
    };

    // handle SFDC trigger update
    const updateSalesforceTrigger = () => {
        const moduleVarDecls: ModuleVarDecl[] = (originalSyntaxTree as ModulePart).members.filter(members =>
            STKindChecker.isModuleVarDecl(members)) as ModuleVarDecl[];
        const pushTopicsVarNode = moduleVarDecls.find(moduleVarDecl => ((moduleVarDecl.
            typedBindingPattern.bindingPattern) as CaptureBindingPattern).variableName.value === "pushTopic");
        const listenerConfigNode = (originalSyntaxTree as ModulePart).members?.find(member => (((member as ModuleVarDecl)?.
            typedBindingPattern?.bindingPattern) as CaptureBindingPattern)?.typeData?.
            typeSymbol?.name === "ListenerConfiguration");

        const pushTopicVarTemplate = `string pushTopic = "${topic}";`;
        const listenerConfigTemplate = `sfdc:ListenerConfiguration listenerConfig = {\n
                                            username: "${username}",\n
                                            password: "${password}"\n
                                        };\n`

        const modifications: STModification[] = [];
        if (pushTopicsVarNode && listenerConfigNode) {
            modifications.push(updatePropertyStatement(pushTopicVarTemplate, pushTopicsVarNode.position));
            modifications.push(updatePropertyStatement(listenerConfigTemplate, listenerConfigNode.position));

            dispatchMutations(modifications);
            setTriggerChanged(true);
        }
    }

    const createSalesforceTrigger = () => {
        setTriggerChanged(true);
        // dispatch and close the wizard
        dispatchModifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "salesforce",
            PUSH_TOPIC_NAME: topic,
            USER_NAME: username,
            PASSWORD: password,
        });
        trackTriggerSelection(Trigger);
    }

    // handle trigger configure complete
    const handleConfigureOnSave = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createSalesforceTrigger();
        } else {
            updateSalesforceTrigger();
        }
    };

    return (
        <>
            <div className={classes.customWrapper}>
                <FormTextInput
                    label="Username"
                    defaultValue={username}
                    onChange={handleUsernameOnChange}
                    customProps={ {
                        optional: false,
                        tooltipTitle: tooltipMessages.salesforceTrigger.username
                    } }
                />
                <FormTextInput
                    label="Password"
                    defaultValue={password}
                    onChange={handlePasswordOnChange}
                    customProps={ {
                        optional: false,
                        secret: true,
                        tooltipTitle: tooltipMessages.salesforceTrigger.password
                    } }
                />
                <FormTextInput
                    label="Topic"
                    defaultValue={topic}
                    onChange={handleTopicOnChange}
                    customProps={ {
                        optional: false,
                        tooltipTitle: tooltipMessages.salesforceTrigger.topic
                    } }
                />
            </div>
            { topic && username && password &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text="Save"
                            className={classes.saveBtn}
                            onClick={handleConfigureOnSave}
                            disabled={isFileSaving}
                        />
                    </div>
                ) }
        </>
    );
}
