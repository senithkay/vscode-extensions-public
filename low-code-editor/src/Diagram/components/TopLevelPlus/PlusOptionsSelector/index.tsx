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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline object-literal-shorthand align
import React, { useState } from "react";

import { STKindChecker, STNode } from "@ballerina/syntax-tree";

import { useDiagramContext } from "../../../../Contexts/Diagram";
import { STModification } from "../../../../Definitions";
import { DraftInsertPosition, DraftUpdatePosition } from "../../../view-state/draft";
import { FormGenerator } from "../../FormGenerator";
import { Margin } from "../index";
import { ModuleLevelPlusOptions } from "../ModuleLevelPlusOptions";
import { PlusOptionRenderer } from "../PlusOptionRenderer";

export interface PlusOptionsProps {
    kind: string
    margin?: Margin;
    onClose: () => void;
    targetPosition?: DraftUpdatePosition;
}

export interface PlusMenuEntry {
    name: string,
    type: string,
}

const moduleLevelEntries: PlusMenuEntry[] = [
    { name: 'Service', type: 'ServiceDeclaration' },
    { name: 'Variable', type: 'ModuleVarDecl' },
    { name: 'Listener', type: 'ListenerDeclaration' },
    { name: 'Type Definition', type: 'TypeDefinition' },
    { name: 'Class', type: 'ClassDefinition' },
    { name: 'Constant', type: 'ConstDeclaration' },
    { name: 'Function', type: 'FunctionDefinition' }
];

const classMemberEntries: PlusMenuEntry[] = [
    { name: 'Variable', type: 'ObjectField' },
    { name: 'Resource', type: 'ResourceAccessorDefinition' },
    { name: 'Function', type: 'ObjectMethodDefinition' }
]

export const PlusOptionsSelector = (props: PlusOptionsProps) => {
    const { onClose, targetPosition, kind } = props;
    const { props: { stSymbolInfo }, api: { code: { modifyDiagram } } } = useDiagramContext();
    const [selectedOption, setSelectedOption] = useState<PlusMenuEntry>(undefined);

    let menuEntries: PlusMenuEntry[] = [];

    const handleOnClose = () => {
        setSelectedOption(undefined);
        onClose();
    }

    const handleOnSave = (modifications: STModification[]) => {
        // todo: handle save logic
        console.log('modification >>>', modifications);
        modifyDiagram(modifications);
    }



    const onOptionSelect = (option: PlusMenuEntry) => {
        setSelectedOption(option)
    }

    switch (kind) {
        case 'ModulePart':
            menuEntries = moduleLevelEntries;
            break;
        case 'ServiceDeclaration':
            menuEntries = classMemberEntries;
            break;
        default:
    }

    return (
        <>
            {
                !selectedOption && (
                    <PlusOptionRenderer
                        entries={menuEntries}
                        onClose={handleOnClose}
                        onOptionSelect={onOptionSelect}
                        targetPosition={targetPosition}
                    />
                )
            }
            {
                selectedOption && (
                    <FormGenerator
                        targetPosition={targetPosition}
                        configOverlayFormStatus={{ formType: selectedOption.type, isLoading: false, formArgs: { stSymbolInfo } }}
                        onCancel={handleOnClose}
                        onSave={handleOnSave}
                    />
                )
            }
        </>
    );
};
