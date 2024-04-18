import React, { FC, HTMLProps } from "react";
import classnames from 'classnames';

interface Props {
    className?: HTMLProps<HTMLElement>["className"];
}

export const SkeletonText: FC<Props> = ({ className }) => {
    return (
        <div className={classnames("animate-pulse h-4 my-0.5 bg-vsc-button-secondaryBackground rounded", className)}/>
    );
};
