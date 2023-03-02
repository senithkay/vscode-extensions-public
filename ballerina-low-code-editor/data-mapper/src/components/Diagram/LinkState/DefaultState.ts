import { MouseEvent, TouchEvent } from 'react';

import {
	Action,
	ActionEvent,
	DragCanvasState,
	InputType,
	SelectingState,
	State
} from '@projectstorm/react-canvas-core';
import { DiagramEngine, DragDiagramItemsState, PortModel } from '@projectstorm/react-diagrams-core';

import { DMCanvasContainerID } from "../Canvas/DataMapperCanvasWidget";
import { DiagnosticTooltipID } from "../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";
import { ListConstructorNode, MappingConstructorNode, PrimitiveTypeNode, RequiredParamNode } from '../Node';
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { FromClauseNode } from '../Node/FromClause';
import { JoinClauseNode } from "../Node/JoinClause";
import { LetClauseNode } from "../Node/LetClause";
import { LetExpressionNode } from "../Node/LetExpression";
import { ModuleVariableNode } from "../Node/ModuleVariable";
import { LinkOverayContainerID } from '../OverriddenLinkLayer/LinkOverlayPortal';

import { CreateLinkState } from './CreateLinkState';

export class DefaultState extends State<DiagramEngine> {
	dragCanvas: DragCanvasState;
	createLink: CreateLinkState;
	dragItems: DragDiagramItemsState;

	constructor() {
		super({ name: 'starting-state' });
		this.childStates = [new SelectingState()];
		this.dragCanvas = new DragCanvasState();
		this.createLink = new CreateLinkState();
		this.dragItems = new DragDiagramItemsState();

		// determine what was clicked on
		this.registerAction(
			new Action({
				type: InputType.MOUSE_DOWN,
				fire: (event: ActionEvent<MouseEvent>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(event);

					// the canvas was clicked on, transition to the dragging canvas state
					if (!element) {
						const targetElement = event.event.target as Element;
						const dmCanvasContainer = targetElement.closest(`#${DMCanvasContainerID}`);
						const linkOverlayContainer = targetElement.closest(`#${LinkOverayContainerID}`);
						const diagnosticsTooltip = targetElement.closest(`#${DiagnosticTooltipID}`);
						if (linkOverlayContainer || diagnosticsTooltip) {
							// Clicked on a link overlay item or a diagnostic tooltip,
							// hence, do not propagate as a canvas drag
						} else if (dmCanvasContainer) {
							this.transitionWithEvent(this.dragCanvas, event);
						}
					}
					// initiate dragging a new link
					else if (element instanceof PortModel || element instanceof DataMapperNodeModel) {
						return;
					}
					// move the items (and potentially link points)
					else {
						this.transitionWithEvent(this.dragItems, event);
					}
				}
			})
		);

		// touch drags the canvas
		this.registerAction(
			new Action({
				type: InputType.TOUCH_START,
				fire: (event: ActionEvent<TouchEvent>) => {
					this.transitionWithEvent(new DragCanvasState(), event);
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (actionEvent: ActionEvent<MouseEvent>) => {
					const element = this.engine.getActionEventBus().getModelForEvent(actionEvent);
					const isExpandOrCollapse = (actionEvent.event.target as Element).closest('button[id^="button-wrapper"]');

					if (!isExpandOrCollapse && (element instanceof PortModel
						|| element instanceof MappingConstructorNode
						|| element instanceof ListConstructorNode
						|| element instanceof PrimitiveTypeNode
						|| element instanceof RequiredParamNode
						|| element instanceof FromClauseNode
						|| element instanceof LetExpressionNode
						|| element instanceof ModuleVariableNode
						|| element instanceof LetClauseNode
						|| element instanceof JoinClauseNode
					)) {
						this.transitionWithEvent(this.createLink, actionEvent);
					}
				}
			})
		);
	}
}
