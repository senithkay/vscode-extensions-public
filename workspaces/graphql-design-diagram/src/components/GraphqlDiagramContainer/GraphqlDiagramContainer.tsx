import React, { useEffect, useState } from "react";

import { DiagramModel } from '@projectstorm/react-diagrams';

import { GraphqlDiagramCanvasWidget } from "../Canvas/GraphqlDiagramCanvasWidget";
import { GraphqlDesignModel } from "../resources/model";
import { graphqlModelGenerator } from "../utils/model-generators/serviceModelGenerator";

interface GraphqlDiagramContainerProps {
    designModel: GraphqlDesignModel;
}
export function GraphqlDiagramContainer(props: GraphqlDiagramContainerProps) {
    const { designModel } = props;
    const [graphqlServiceModel, setGraphqlServiceModel] = useState<DiagramModel>(undefined);

    useEffect(() => {
        setGraphqlServiceModel(graphqlModelGenerator(designModel));
        // if (designModel.graphqlService){
        //     setGraphqlServiceModel(graphqlModelGenerator(designModel));
        // }

    }, [designModel]);

    return(
        <>
            {graphqlServiceModel &&  <GraphqlDiagramCanvasWidget model={graphqlServiceModel}/>}
        </>
    );
}
