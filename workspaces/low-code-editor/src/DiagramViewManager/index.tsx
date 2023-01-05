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
import React, { useEffect, useState } from "react";
import { STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { EditorProps } from "../DiagramGenerator/vscode/Diagram";
import { OverviewDiagram } from "../OverviewDiagram";

import { DiagramFocusActionTypes, useDiagramFocus } from "./hooks/diagram-focus";
import { getLowcodeST, getSyntaxTree } from "../DiagramGenerator/generatorUtil";
import { STFindingVisitor } from "../Diagram/visitors/st-finder-visitor";


/**
 * Handles the rendering of the Diagram views(lowcode, datamapper, service etc.)
 */
export function DiagramViewManager(props: EditorProps) {
    console.log('>>> view manager', props);
    // ViewManager behavior:
    //  - should be able to handle switching to lowcode whatever the mode user interacts in
    //      - user can open a lowcode element by selecting a component from the component overview
    //      - user can open a lowcode element by clicking on the code lense in the code editor
    //      - if it's the code lense user will provide object with data specifying which file and which position
    //        through props(should alter the openInDiagram prop)
    //          structure:
    //              - filepath => string
    //              - position => NodePosition
    //      - if it is the through the view manager, a callback should be passed to that component notify the view
    //        manager to fetch the related syntax tree
    //
    // ToDo:
    //  - fetch syntaxtree for particular file
    //  - Handle switching between views based on type of the syntax tree fetched(datamapper, graphql, service designer)
    //  - Handle switching to code from standalone code segment
    //  - Implement top bar to handle navigation

    const {
        lastUpdatedAt,
        langClientPromise,
        experimentalEnabled,
        projectPaths,
        diagramFocus
    } = props;

    const [diagramFocusState, diagramFocusSend] = useDiagramFocus();
    const [selectedST, setSelectedST] = useState<STNode>();


    useEffect(() => {
        if (diagramFocus) {
            const { filePath, position } = diagramFocus;

            (async () => {
                try {
                    const langClient = await langClientPromise;
                    const generatedST = await getSyntaxTree(filePath, langClient);
                    const visitedST = await getLowcodeST(generatedST, filePath, langClient, experimentalEnabled);

                    const stFindingVisitor = new STFindingVisitor();
                    stFindingVisitor.setPosition(position);
                    traversNode(visitedST, stFindingVisitor);
                    setSelectedST(stFindingVisitor.getSTNode());
                } catch (err) {
                    // tslint:disable-next-line: no-console
                    console.error(err);
                }
            })();
        }
    }, [lastUpdatedAt, diagramFocusState]);

    useEffect(() => {
        diagramFocusSend({ type: DiagramFocusActionTypes.UPDATE_STATE, payload: diagramFocus });
    }, [diagramFocus])

    const isOverviewDiagramVisible = !!diagramFocusState;
    const isDiagramShown = !!diagramFocusState && !!selectedST;

    return (
        <div>
            {isOverviewDiagramVisible && <OverviewDiagram {...props} />}
            Hello world
        </div>
    )
}

