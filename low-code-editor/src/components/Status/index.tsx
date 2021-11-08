import React, {useEffect, useState} from "react";

import Typography from '@material-ui/core/Typography';
import classNames from "classnames";

import {
    API_STATE_BLOCKED,
    API_STATE_BLOCKED_C,
    API_STATE_CREATED,
    API_STATE_CREATED_C, API_STATE_DEPRECATED, API_STATE_DEPRECATED_C,
    API_STATE_PROTOTYPED,
    API_STATE_PROTOTYPED_C, API_STATE_PUBLISHED,
    API_STATE_PUBLISHED_C, API_STATE_RETIRED, API_STATE_RETIRED_C, CONNECTION_TYPE_CONNECTED
} from "../../api/models";

import { useStyles } from "./style";

export function Component(props: { text: string, filledColor: string }) {
    const { text } = props;
    const classes = useStyles(props);

    return (
        <div className={classNames(classes.statusContainer, `${text}`)}>
            <span className={classNames(classes.dot)}/>
            <Typography data-testid="active-status" className={classNames(classes.statusText)}>
                {text}
            </Typography>
        </div>
    );
}


export function Status(props: { type: string }) {
    const { type } = props;
    const [data, setData] = useState({text: '', color: ''});

    const handleData = (status: string) => {
        switch (status) {
            case 'running':
                setData({text: "Active", color: "#6ac7a7"});
                break;
            case 'stopped':
                setData({text: "Inactive", color: "#ffcc8c"});
                break;
            case API_STATE_CREATED_C:
                setData({text: API_STATE_CREATED, color: "#ffcc8c"});
                break;
            case API_STATE_PROTOTYPED_C:
                setData({text: API_STATE_PROTOTYPED, color: "#a6b3ff"});
                break;
            case API_STATE_PUBLISHED_C:
                setData({text: API_STATE_PUBLISHED, color: "#6ac7a7"});
                break;
            case API_STATE_BLOCKED_C:
                setData({text: API_STATE_BLOCKED, color: "#fd8677"});
                break;
            case API_STATE_DEPRECATED_C:
                setData({text: API_STATE_DEPRECATED, color: "#8d91a3"});
                break;
            case API_STATE_RETIRED_C:
                setData({text: API_STATE_RETIRED, color: "#8d91a3"});
                break;
            case CONNECTION_TYPE_CONNECTED:
                setData({text: CONNECTION_TYPE_CONNECTED, color: "#6ac7a7"});
        }
    }

    useEffect(() => {
        handleData(type);
    }, [type]);

    return (
        <React.Fragment>
            <Component text={data.text} filledColor={data.color}/>
        </React.Fragment>
    )
}
