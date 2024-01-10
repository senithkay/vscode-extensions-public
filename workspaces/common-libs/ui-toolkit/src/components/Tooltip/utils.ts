import { OffsetMultiplier, Position, PositionType } from "./Tooltip";

export const getOffsetMultiplier = (position: PositionType): OffsetMultiplier => {
    let hoverEl: Position = { top: 0, bottom: 0, left: 0, right: 0 };
    let tooltipEl: Position = { top: 0, bottom: 0, left: 0, right: 0 };
    switch (position) {
        case "bottom":
            hoverEl = { ...hoverEl, top: 0.9, left: 0.5 }
            tooltipEl = { ...tooltipEl, left: -0.5 }
            break;
        case "bottom-end":
            hoverEl = { ...hoverEl, top: 0.9, left: 0.5 }
            break;
        case "bottom-start":
            hoverEl = { ...hoverEl, top: 0.9, right: 0.5 }
            break;
        case "left":
            hoverEl = { ...hoverEl, top: 0.5, right: 0.9 }
            tooltipEl = { ...tooltipEl, top: -0.5 }
            break;
        case "left-end":
            hoverEl = { ...hoverEl, top: 0.5, right: 0.9 }
            tooltipEl = { ...tooltipEl, top: 0, left: 0 }
            break;
        case "left-start":
            hoverEl = { ...hoverEl, bottom: 0.5, right: 0.9 }
            tooltipEl = { ...tooltipEl, top: 0, left: 0 }
            break;
        case "right":
            hoverEl = { ...hoverEl, top: 0.5, left: 0.9 }
            tooltipEl = { ...tooltipEl, top: -0.5 }
            break;
        case "right-end":
            hoverEl = { ...hoverEl, top: 0.5, left: 0.9 }
            break;
        case "right-start":
            hoverEl = { ...hoverEl, bottom: 0.5, left: 0.9 }
            break;
        case "top":
            hoverEl = { ...hoverEl, bottom: 0.9, left: 0.5 }
            tooltipEl = { ...tooltipEl, left: -0.5 }
            break;
        case "top-end":
            hoverEl = { ...hoverEl, bottom: 0.9, left: 0.5 }
            break;
        case "top-start":
            hoverEl = { ...hoverEl, bottom: 0.9, right: 0.5 }
            break;
    }

    return { hoverEl, tooltipEl }
}