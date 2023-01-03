/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { Theme, withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

const DocumentationSwitchToggle = withStyles((theme: Theme) => ({
    root: {
        width: theme.spacing(5.25),
        height: theme.spacing(3),
        padding: 0,
        display: 'flex',
        marginLeft: '9px'
    },
    switchBase: {
        padding: theme.spacing(0.375),
        '&.MuiIconButton-root:hover': {
            backgroundColor: "transparent"
        },
        '&.Mui-checked': {
            transform: 'translateX(18px)',
            '& .MuiSwitch-thumb': {
                color: `${theme.palette.success.main} !important`,
            },
            '& + $track': {
                opacity: 1,
                background: "linear-gradient(180deg, #F5F5F9 0%, #FFFFFF 100%)",
                boxShadow: "inset 0 0 0 1px #36B475, 0 1px 2px -1px rgba(141,145,163,0.21)",
            },
        },
    },
    track: {
        borderRadius: theme.spacing(2),
        opacity: 1,
        background: "linear-gradient(180deg, #F5F5F9 0%, #FFFFFF 100%)",
        boxShadow: "inset 0 0 0 1px #CBCEDB, 0 1px 2px -1px rgba(141,145,163,0.21)",
    },
    thumb: {
        width: theme.spacing(2.25),
        height: theme.spacing(2.25),
        boxShadow: 'none',
        color: theme.palette.grey[400]
    },
    checked: {},
}))(Switch) as typeof Switch;

export default DocumentationSwitchToggle;
