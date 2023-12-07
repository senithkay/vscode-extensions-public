import { KeyboardEvent, MouseEvent } from 'react';

import { Action, ActionEvent, InputType, State } from '@projectstorm/react-canvas-core';

import { PortModel, LinkModel, DiagramEngine } from '@projectstorm/react-diagrams-core';
import { WorkerPortModel } from '../Port/WorkerPortModel';
import { WorkerLinkModel } from '../Link/LinkModel';

/**
 * This state is controlling the creation of a link.
 */
export class CreateLinkState extends State<DiagramEngine> {
	sourcePort: WorkerPortModel;
	link: WorkerLinkModel;

	constructor() {
		super({ name: 'create-new-link' });

		this.registerAction(
			new Action({
				type: InputType.MOUSE_UP,
				fire: (actionEventInput) => {
					
					// const {
					// 	event: { clientX, clientY }
					// } = actionEvent;
                    let actionEvent = actionEventInput as ActionEvent<MouseEvent>;
                    const element = this.engine.getActionEventBus().getModelForEvent(actionEvent);
                   

                    const clientX = actionEvent.event.clientX;
                    const clientY = actionEvent.event.clientY;
					const ox = this.engine.getModel().getOffsetX();
					const oy = this.engine.getModel().getOffsetY();

					if (element instanceof WorkerPortModel && !this.sourcePort) {
						this.sourcePort = element;

						/* would be cool if link creating could be done somewhat like
                        const link = createLink({
                            sourcePort: this.sourcePort,
                            points: [{ x: clientX, y: clientY }, { x: clientX, y: clientY }]
                        })
                        */
						const link = this.sourcePort.createLinkModel();
						link.setSourcePort(this.sourcePort);
						link.getFirstPoint().setPosition(clientX - ox, clientY - oy);
						link.getLastPoint().setPosition(clientX - ox + 20, clientY - oy + 20);


						// this.link = this.engine.getModel().addLink(link);
                        this.link = link as WorkerLinkModel;
					} else if (element instanceof WorkerPortModel && this.sourcePort && element != this.sourcePort) {
						if (this.sourcePort.canLinkToPort(element)) {
							this.link.setTargetPort(element);
							element.reportPosition();
							this.clearState();
							this.eject();
						}
					} else if (element === this.link.getLastPoint()) {
						this.link.point(clientX - ox, clientY - oy, -1);
					}

					this.engine.repaintCanvas();
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.MOUSE_MOVE,
				fire: (actionEventInput) => {
					if (!this.link) return;
					// const { event:  } =  { actionEvent.event.clientX, actionEvent.event.clientY };
                    let actionEvent = actionEventInput as ActionEvent<MouseEvent>;
					this.link.getLastPoint().setPosition(actionEvent.event.clientX, actionEvent.event.clientY);
					this.engine.repaintCanvas();
				}
			})
		);

		this.registerAction(
			new Action({
				type: InputType.KEY_UP,
				fire: (actionEventInput) => {
                    let actionEvent = actionEventInput as ActionEvent<KeyboardEvent>;
					// on esc press remove any started link and pop back to default state
					if (actionEvent.event.keyCode === 27) {
						this.link.remove();
						this.clearState();
						this.eject();
						this.engine.repaintCanvas();
					}
				}
			})
		);
	}

	clearState() {
		this.link = undefined;
		this.sourcePort = undefined;
	}
}