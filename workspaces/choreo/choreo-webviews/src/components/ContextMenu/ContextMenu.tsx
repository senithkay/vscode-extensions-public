import React, { useState } from "react";
import { PropsWithChildren } from "react";
import { FC } from "react";
import { ClickAwayListener, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

export interface ContextMenuItem { label: string; onClick?: () => void }

interface Props extends PropsWithChildren {
    options: ContextMenuItem[];
    loading?: boolean;
}

export const ContextMenu: FC<Props> = ({ options, loading }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <span className="relative ">
                {loading ? (
                    <VSCodeProgressRing className="h-4 w-4" />
                ) : (
                    <VSCodeButton appearance="icon" onClick={() => setIsOpen(true)} title="More Actions">
                        <Codicon name="ellipsis" />
                    </VSCodeButton>
                )}
                {isOpen && (
                    <div className="absolute z-20 right-0 top-0 bg-vsc-menu-background shadow w-max border-1 border-vsc-dropdown-background">
                        {options.map((item) => (
                            <div
                                key={item.label}
                                className="px-2 py-1 hover:bg-vsc-menubar-selectionBackground hover:text-vsc-menubar-selectionForeground"
                                onClick={item.onClick}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                )}
            </span>
        </ClickAwayListener>
    );
};
