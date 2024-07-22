import classnames from "classnames";
import React, { type FC, type HTMLProps } from "react";

interface Props {
	className?: HTMLProps<HTMLElement>["className"];
}

export const SkeletonText: FC<Props> = ({ className }) => {
	return <div className={classnames("animate-pulse h-4 my-0.5 bg-vsc-button-secondaryBackground rounded", className)} />;
};
