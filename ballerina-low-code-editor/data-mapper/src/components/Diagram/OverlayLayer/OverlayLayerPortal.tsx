import * as React from 'react';
import ReactDOM from 'react-dom';

import { OverlayContainerID } from './OverlayLayerWidget';

// eslint-disable-next-line @typescript-eslint/ban-types
export const OverlayLayerPortal: React.FC<{}> = (props) => {
    const container = document.getElementById(OverlayContainerID);
	return container !== null ? ReactDOM.createPortal(props.children, container) : <></>;
}
