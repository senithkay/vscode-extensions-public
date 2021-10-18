/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const recordStyles = makeStyles((theme: Theme) =>
    createStyles({
        recordFieldWrapper: {
            marginLeft: 10,
            height: "85%",
            overflow: "scroll",
            "&::-webkit-scrollbar": {
                width: 3
            },
            "&::-webkit-scrollbar-thumb": {
                background: "#e6e7ec",
                borderRadius: 2
            },
            "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent"
            }
        },
        recordConfigTitleWrapper: {
            width: "auto",
            marginLeft: 20,
            marginTop: 20
        },
        fieldEditorWrapper: {
            boxSizing: "border-box",
            width: "100%",
            border: "1px solid #EEEEEE",
            backgroundColor: "#F7F8FB",
            padding: `15.5px 24px`,
            marginTop: 15.5
        },
        itemContentWrapper: {
            background: 'white',
            padding: 7,
            borderRadius: 5,
            border: '1px solid #E6E7EC',
            margin: '1rem 0 0.25rem',
            flexDirection: 'row',
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
        },
        activeItemContentWrapper: {
            background: 'white',
            padding: 7,
            borderRadius: 5,
            border: '1px solid #A6B3FF',
            margin: '1rem 0 0.25rem',
            flexDirection: 'row',
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
        },
        itemWrapper: {
            display: 'flex',
            flexDirection: `row`,
            marginLeft: 10,
            marginRight: 10,
            minWidth: 200
        },
        itemLabel: {
            width: "80%"
        },
        btnWrapper: {
            display: "flex",
            flexDirection: "row",
            width: "20%",
            alignItems: "center"
        },
        actionBtnWrapper: {
            cursor: "pointer",
            width: 25
        },
        iconBtn: {
            padding: 0
        },
        draftBtnWrapper: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        },
        addFieldBtn: {
            outline: "none",
            marginLeft: 24,
            marginTop: 10,
            color: "#5567D5",
            fontSize: 12,
            letterSpacing: 0,
            lineHeight: "16px",
            cursor: "pointer",
            background: "#fff",
            border: "1px solid #5567d55c",
            padding: "4px 8px",
            borderRadius: 8
        },
        addFieldBtnWrap: {
            margin: 10,
            color: "#5567D5",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            "& .MuiSvgIcon-root": {
                height: '18px !important',
            }
        },
        recordEditorWrapper: {
            minWidth: 200,
            margin: 10,
            padding: 10,
            boxSizing: "border-box",
            border: "1px solid #E6E7EC",
            borderRadius: 4
        },
        activeRecordEditorWrapper: {
            minWidth: 200,
            margin: 10,
            padding: 10,
            boxSizing: "border-box",
            border: "1px solid #A6B3FF",
            borderRadius: 4
        },
        recordCode: {
            color: '#0095FF'
        },
        buttonWrapper: {
            height: 'auto',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            zIndex: 100,
            paddingTop: '2rem',
            paddingRight: 24
        },
    }),
);
