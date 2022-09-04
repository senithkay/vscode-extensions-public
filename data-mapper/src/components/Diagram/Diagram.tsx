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
// tslint:disable: jsx-no-multiline-js
import * as React from 'react';

import createEngine, { DagreEngine, DefaultDiagramState, DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import "reflect-metadata";
import {container} from "tsyringe";

import { useDMStore } from '../../store/store';
import { DataMapperDIContext } from '../../utils/DataMapperDIContext/DataMapperDIContext';

import { DataMapperCanvasContainerWidget } from './Canvas/DataMapperCanvasContainerWidget';
import { DataMapperCanvasWidget } from './Canvas/DataMapperCanvasWidget';
import * as Labels from "./Label";
import * as Links from "./Link";
import { DataMapperLinkModel } from './Link/model/DataMapperLink';
import { DefaultState as LinkState } from './LinkState/DefaultState';
import * as Nodes from "./Node";
import { DataMapperNodeModel } from './Node/commons/DataMapperNode';
import { LinkConnectorNode } from './Node/LinkConnector';
import { QueryExpressionNode } from './Node/QueryExpression';
import * as Ports from "./Port";
import { NodePosition, STNode } from '@wso2-enterprise/syntax-tree';
import { ExpressionFunctionBodyNode, RequiredParamNode } from './Node';
import { SelectClauseNode } from './Node/SelectClause';

interface DataMapperDiagramProps {
	nodes?: DataMapperNodeModel[];
	links?: DataMapperLinkModel[];
}

function initDiagramEngine() {
	// START TODO: clear this up
	// this is a hack to load all modules for DI to work properly
	const _NF = Nodes;
	const _PF = Ports;
	const _LF = Links;
	const _LAF = Labels;
	// END TODO

	const diContext = container.resolve(DataMapperDIContext);
	const engine = createEngine();

	diContext.nodeFactories.forEach((nf) =>
		engine.getNodeFactories().registerFactory(nf));
	diContext.portFactories.forEach((pf) =>
		engine.getPortFactories().registerFactory(pf));
	diContext.linkFactories.forEach((lf) =>
		engine.getLinkFactories().registerFactory(lf));
	diContext.labelFactories.forEach((lbf) =>
		engine.getLabelFactories().registerFactory(lbf));

	const state = engine.getStateMachine().getCurrentState();
	if (state instanceof DefaultDiagramState) {
		state.dragNewLink.config.allowLooseLinks = false;
	}

	engine.getStateMachine().pushState(new LinkState());
	return engine;
}

function DataMapperDiagram(props: DataMapperDiagramProps): React.ReactElement {

	const { nodes } = props;

	const [engine, setEngine] = React.useState<DiagramEngine>(initDiagramEngine());
	const [model, setModel] = React.useState(new DiagramModel());

	const fnST = useDMStore((state) => state.functionST);

	const dagreEngine = new DagreEngine({
		graph: {
			rankdir: 'LR',
			ranksep: 600,
			align: 'UL',
			nodesep: 300,
			ranker: 'longest-path',
			marginx: 30,
			marginy: 50,
			fit: true
		},
	});

	React.useEffect(() => {
		async function genModel() {
			const model = new DiagramModel();
			model.addAll(...nodes);
			for (let i = 0; i < nodes.length; i++) {
				const node = nodes[i];
				node.setModel(model);
				await node.initPorts();
				await node.initLinks();
				engine.repaintCanvas();
			}
			model.setLocked(true);
			engine.setModel(model);
			if (model.getLinks().length > 0){
				dagreEngine.redistribute(model);
				engine.repaintCanvas(true);
			}
			let requiredParamFields = 0;
			let numberOfRequiredParamNodes = 0;
			nodes.forEach((node) => {
				if ( node instanceof LinkConnectorNode || node instanceof QueryExpressionNode 
					|| node instanceof ExpressionFunctionBodyNode || node instanceof SelectClauseNode){
						node.updatePosition()
				}
				if ( node instanceof RequiredParamNode ){
					node.setPosition(100, (requiredParamFields* 40) + 100 * (numberOfRequiredParamNodes + 1));
					requiredParamFields = requiredParamFields + node.numberOfFields;
					numberOfRequiredParamNodes = numberOfRequiredParamNodes + 1;
				}
			});
			setModel(model);
        }
        genModel();
	}, [nodes]);

	return (
		<>
			{engine && engine.getModel() && (
				<DataMapperCanvasContainerWidget>
					<DataMapperCanvasWidget engine={engine} />
				</DataMapperCanvasContainerWidget>
			)}
		</>
	);


};

export default React.memo(DataMapperDiagram);
