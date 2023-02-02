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
import React, { useContext, useEffect, useRef, useState } from "react";

import { IBallerinaLangClient } from "@wso2-enterprise/ballerina-languageclient";
import {
    ConfigOverlayFormStatus,
    NavigationBarDetailContainer,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    NodePosition,
    ServiceDeclaration,
    STKindChecker,
    STNode,
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Contexts/Diagram";
import { FormGenerator, FormGeneratorProps } from "../FormComponents/FormGenerator";
import { ServiceDesign } from "../ServiceDesign";

import { ServiceDesignStyles } from "./style";

export interface ServiceDesignProps {
    model?: STNode;
    targetPosition?: NodePosition;
    onCancel?: () => void;
}

export function ServiceDesignOverlay(props: ServiceDesignProps) {
    const { onCancel: onClose, model } = props;

    const serviceDesignClasses = ServiceDesignStyles();

    const {
        props: { currentFile },
        api: {
            ls: { getDiagramEditorLangClient },
        },
    } = useContext(Context);

    const [serviceST, setFunctionST] = React.useState<ServiceDeclaration>(undefined);

    useEffect(() => {
        if (model && STKindChecker.isServiceDeclaration(model)) {
            setFunctionST(model);
        }
    }, [model]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formConfig, setFormConfig] = useState<FormGeneratorProps>(undefined);

    const handleFormEdit = (
        stModel: STNode,
        targetPosition: NodePosition,
        configOverlayFormStatus: ConfigOverlayFormStatus,
        onClosex?: () => void,
        onSave?: () => void
    ) => {
        setFormConfig({
            model: stModel,
            configOverlayFormStatus,
            onCancel: () => {
                setIsFormOpen(false);
                if (onClosex) {
                    onClose();
                }
            },
            onSave: () => {
                setIsFormOpen(false);
                if (onSave) {
                    onSave();
                }
            },
            targetPosition
        });
        setIsFormOpen(true);
    };

    return (
        <div className={serviceDesignClasses.container}>
            <ServiceDesign
                model={serviceST}
                langClientPromise={
                    getDiagramEditorLangClient() as unknown as Promise<IBallerinaLangClient>
                }
                currentFile={currentFile}
                onClose={onClose}
                handleDiagramEdit={handleFormEdit}
            />
            {isFormOpen && (
                <FormGenerator {...formConfig} />
            )}
        </div>
    );
}
