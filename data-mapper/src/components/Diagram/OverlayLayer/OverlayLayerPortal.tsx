import * as React from 'react';
import ReactDOM from 'react-dom';

import { OverlayContainerID } from './OverlayLayerWidget';

export const OverlayLayerPortal: React.FC<{}> = (props) => {
    const container = document.getElementById(OverlayContainerID);
	return container instanceof HTMLElement ? ReactDOM.createPortal(props.children, container) : <></>;
}
