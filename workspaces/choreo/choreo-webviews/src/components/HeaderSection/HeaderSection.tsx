import React, { FC, ReactNode } from "react";
import { Button } from "../Button";
import { Divider } from "../Divider";
import { Codicon } from "../Codicon";

interface Props {
    title: string;
    secondaryTitle?: string;
    secondaryIcon?: ReactNode;
    tags?: { label: string; value: string }[];
    buttons?: { onClick: () => any; label: string }[];
}

export const HeaderSection: FC<Props> = ({ title, secondaryTitle, tags = [], buttons = [], secondaryIcon }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <div className="flex items-center flex-wrap gap-3 md:mb-1 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                    <h2 className="text-2xl md:text-3xl font-thin opacity-30 hidden sm:block">{secondaryTitle}</h2>
                </div>
                <span className="mt-1">{secondaryIcon}</span>
            </div>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 xl:gap-2">
                    {tags.map((item) => (
                        <div key={item.label}>
                            <span className="font-extralight">{item.label}:</span> {item.value}
                        </div>
                    ))}
                </div>
            )}
            {buttons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {buttons.map((item) => (
                        <Button key={item.label} appearance="secondary" onClick={item.onClick}>
                            {item.label}
                        </Button>
                    ))}
                </div>
            )}
            <Divider className="mt-2" />
        </div>
    );
};
