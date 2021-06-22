import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { CloseRounded } from "@material-ui/icons";

import { AddIcon } from "../../../../../../../../../assets/icons";
import { ButtonWithIcon } from "../../../../../../../../../Diagram/components/Portals/ConfigForm/Elements/Button/ButtonWithIcon";
import { Path, PathSegment } from "../../types";
import { convertPathStringToSegments, genrateBallerinaResourcePath } from "../../util";

import { PathSegmentItem } from "./pathSegement";
import { PathSegmentEditor } from "./segmentEditor";
import { useStyles } from './style';


interface PathEditorProps {
    pathString: string;
    defaultValue?: string;
    onChange?: (text: string) => void;
}

export function PathEditor(props: PathEditorProps) {
    const { pathString, defaultValue, onChange } = props;
    const path: Path = convertPathStringToSegments(pathString);
    const classes = useStyles();

    const [pathState, setPathState] = useState<Path>(path);
    const [addingSegment, setAddingSegment] = useState<boolean>(false);

    const onDelete = (segment: PathSegment) => {
        const id = segment.id;
        if (id > -1) {
            const pathClone: Path = {
                segments: pathState.segments
            };
            pathClone.segments.splice(id, 1);
            setPathState(pathClone);
            if (onChange) {
                onChange(genrateBallerinaResourcePath(pathClone));
            }
        }
    };

    const pathSegements: React.ReactElement[] = [];
    pathState.segments.forEach((value, index) => {
        pathSegements.push(<PathSegmentItem segment={value} onDelete={onDelete} />);
    });

    const onSave = (pathSegment: PathSegment) => {
        pathState.segments.push(pathSegment);
        setPathState(pathState);
        setAddingSegment(!addingSegment);
        if (onChange) {
            onChange(genrateBallerinaResourcePath(pathState));
        }
    };

    const onCancel = () => {
        setAddingSegment(!addingSegment);
    };

    const addPathBtn = () => {
        setAddingSegment(!addingSegment);
    }

    return (
        <div>
            <div id="listOfPaths" >
                {pathSegements}
            </div>
            {addingSegment &&
                <div>
                    <PathSegmentEditor id={pathState.segments.length} onCancel={onCancel} onSave={onSave} />
                </div>
            }
            {!addingSegment &&
                <div id="">
                    <button
                        onClick={addPathBtn}
                        className={classes.addPathBtn}
                    >
                        <div className={classes.addPathBtnWrap}>
                            <AddIcon />
                            <p><FormattedMessage id="lowcode.develop.apiConfigWizard.addPathSegment.title" defaultMessage="Add Path Segment" /></p>
                        </div>
                    </button>
                </div>
            }
        </div>
    );
}
