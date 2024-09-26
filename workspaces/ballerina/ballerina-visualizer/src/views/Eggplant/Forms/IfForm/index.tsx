/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Codicon, LinkButton } from "@wso2-enterprise/ui-toolkit";

import { FlowNode, Branch, LineRange } from "@wso2-enterprise/ballerina-core";
import { Colors } from "../../../../resources/constants";
import { FormValues, EditorFactory } from "@wso2-enterprise/ballerina-side-panel";
import { FormStyles } from "../styles";
import { convertNodePropertyToFormField } from "../../../../utils/eggplant";
import {  cloneDeep } from "lodash";
import { RemoveEmptyNodesVisitor, traverseNode } from "@wso2-enterprise/eggplant-diagram";

interface IfFormProps {
    node: FlowNode;
    targetLineRange: LineRange;
    onSubmit?: (data: FormValues) => void;
}

export function IfForm(props: IfFormProps) {
    const { node, targetLineRange, onSubmit } = props;
    const { getValues, register, setValue, handleSubmit, reset } = useForm<FormValues>();

    const [branches, setBranches] = useState<Branch[]>(cloneDeep(node.branches));

    console.log(">>> form fields", { node, values: getValues() });

    const handleOnSave = (data: FormValues) => {
        console.log(">>> on form submit", {data, branches});
        if (node && targetLineRange) {
            let updatedNode = cloneDeep(node);

            // loop data and update branches (properties.condition.value)
            branches.forEach((branch, index) => {
                if(branch.label === "Else"){
                    return;
                }
                const conditionValue = data[branch.label];
                if (conditionValue) {
                    branch.properties.condition.value = conditionValue;
                }
            });

            updatedNode.branches = branches;
            console.log(">>> Updated node", updatedNode);

            // check all nodes and remove empty nodes
            const removeEmptyNodeVisitor = new RemoveEmptyNodesVisitor(updatedNode);
            traverseNode(updatedNode, removeEmptyNodeVisitor);
            const updatedNodeWithoutEmptyNodes = removeEmptyNodeVisitor.getNode();

            onSubmit(updatedNodeWithoutEmptyNodes);
        }
    };

    const addNewCondition = () => {
        // create new branch obj
        const newBranch: Branch = {
            label: "branch-" + branches.length,
            kind: "block",
            codedata: {
                node: "CONDITIONAL",
                lineRange: {
                    fileName: "pett.bal",
                    startLine: {
                        line: 0,
                        offset: 0,
                    },
                    endLine: {
                        line: 0,
                        offset: 0,
                    },
                },
            },
            repeatable: "ONE_OR_MORE",
            properties: {
                condition: {
                    metadata: {
                        label: "Condition",
                        description: "Boolean Condition",
                    },
                    valueType: "EXPRESSION",
                    value: "true",
                    optional: false,
                    editable: true,
                },
            },
            children: [],
        };
        // add new branch to branches and add branch to before last branch
        setBranches([...branches.slice(0, -1), newBranch, branches[branches.length - 1]]);
    };

    // TODO: support multiple type fields
    return (
        <FormStyles.Container>
            {branches.map((branch) => {
                if (branch.properties?.condition) {
                    const field = convertNodePropertyToFormField(branch.label, branch.properties.condition);
                    return (
                        <FormStyles.Row key={branch.label}>
                            <EditorFactory field={field} register={register} />
                        </FormStyles.Row>
                    );
                }
            })}

            <LinkButton onClick={addNewCondition} sx={{ fontSize: 12, padding: 8, color: Colors.PRIMARY, gap: 4 }}>
                <Codicon name={"add"} iconSx={{ fontSize: 12 }} sx={{ height: 12 }} />
                Add Condition
            </LinkButton>

            {onSubmit && (
                <FormStyles.Footer>
                    <Button appearance="primary" onClick={handleSubmit(handleOnSave)}>
                        Save
                    </Button>
                </FormStyles.Footer>
            )}
        </FormStyles.Container>
    );
}

export default IfForm;
