/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useState } from "react";

import { DiagramModel } from '@projectstorm/react-diagrams';

import { GraphqlDiagramCanvasWidget } from "../Canvas/GraphqlDiagramCanvasWidget";
import { GraphqlHeader } from "../GraphqlHeader";
import { GraphqlDesignModel } from "../resources/model";
import { OperationTypes } from "../TypeFilter";
import { graphqlModelGenerator } from "../utils/model-generators/serviceModelGenerator";

interface GraphqlDiagramContainerProps {
    designModel: GraphqlDesignModel;
}

export function GraphqlDiagramContainer(props: GraphqlDiagramContainerProps) {
    const { designModel } = props;
    const [graphqlServiceModel, setGraphqlServiceModel] = useState<DiagramModel>(undefined);
    const [operationType, setOperationType] = useState<OperationTypes>(OperationTypes.All_Operations);

    useEffect(() => {
        setGraphqlServiceModel(graphqlModelGenerator(designModel, operationType));
    }, [designModel, operationType]);

    const updateFilter = (type: OperationTypes) => {
        setOperationType(type);
    }

    return (
        <>
            {graphqlServiceModel &&
            <>
                <GraphqlHeader updateFilter={updateFilter} />
                <GraphqlDiagramCanvasWidget model={graphqlServiceModel} />
            </>
            }
        </>
    );
}
