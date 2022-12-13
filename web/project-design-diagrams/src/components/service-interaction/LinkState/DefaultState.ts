import { MouseEvent, KeyboardEvent } from 'react';
import { State, Action, InputType, ActionEvent } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import { ServiceNodeModel } from '../ServiceNode/ServiceNodeModel';
import { ServiceTypes } from '../../../resources';

export class DefaultState extends State<DiagramEngine> {
    constructor() {
        super({ name: 'linking-state' });

        this.registerAction(
            new Action({
                type: InputType.MOUSE_UP,
                fire: (event: ActionEvent<MouseEvent>) => {
                    const element = this.engine.getActionEventBus().getModelForEvent(event);

                    if (element instanceof ServiceNodeModel && element.getServiceType() === ServiceTypes.HTTP) {
                        this.engine.getModel().fireEvent({ entity: element }, 'INIT_LINKING');
                    }
                }
            })
        );

        this.registerAction(
            new Action({
                type: InputType.KEY_UP,
                fire: (actionEvent: ActionEvent<KeyboardEvent>) => {
                    // on esc press remove any started link and pop back to default state
                    if (actionEvent.event.keyCode === 27) {
                        this.engine.getModel().fireEvent({}, 'ABORT_LINKING');
                    }
                }
            })
        );
    }
}
