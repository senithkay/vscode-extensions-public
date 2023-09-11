import ReactDOM from "react-dom";

export interface DiagramOverlayContainerProps {
    children: React.ReactElement | React.ReactElement[];
    forceRender?: boolean;
    divId?: string;
}

export function NavigationBarDetailContainer(props: DiagramOverlayContainerProps) {
    const { children, forceRender } = props;
    if (!forceRender) {
        return null;
    }

    const overlayDiv = document.querySelector('#nav-bar-main div.component-details');
    if (overlayDiv) {
        return ReactDOM.createPortal(children, overlayDiv);
    } else {
        return null;
    }

}

