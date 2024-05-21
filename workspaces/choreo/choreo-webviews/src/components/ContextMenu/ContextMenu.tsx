import React, { FC } from "react";
import { Button } from "../Button";
import { Codicon } from "../Codicon";

interface Props {
    webviewSection: string;
    tooltip?: string;
    params?: object;
}

export const ContextMenu: FC<Props> = ({ webviewSection, tooltip="More Actions", params = {} }) => {
    return (
        <Button
            appearance="icon"
            onClick={(event) => {
                event.preventDefault();
                event.target.dispatchEvent(
                    new MouseEvent("contextmenu", {
                        bubbles: true,
                        clientX: event.currentTarget.getBoundingClientRect().left,
                        clientY: event.currentTarget.getBoundingClientRect().bottom,
                    })
                );
                event.stopPropagation();
            }}
            data-vscode-context={JSON.stringify({
                preventDefaultContextMenuItems: true,
                webviewSection,
                ...params,
            })}
            title={tooltip}
        >
            <Codicon name="ellipsis" />
        </Button>
    );
};
