import React from "react";
export interface ProjectTypeCardProps {
    isCurrentMonoRepo: boolean;
    onChange: (type: boolean) => void;
    isMonoRepo: boolean;
    label: string;
}
export declare const ProjectTypeCard: React.FC<ProjectTypeCardProps>;
