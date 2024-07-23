import classnames from "classnames";
import React, { type FC, type HTMLProps } from "react";

interface Props {
	className?: HTMLProps<HTMLElement>["className"];
}

export const SkeletonText: FC<Props> = ({ className }) => {
	return <div className={classnames("my-0.5 h-4 animate-pulse rounded bg-vsc-button-secondaryBackground", className)} />;
};
