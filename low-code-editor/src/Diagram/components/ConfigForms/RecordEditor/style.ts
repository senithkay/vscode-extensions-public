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
        recordEditorContainer: {
            display: "flex",
            flexDirection: "row"
        },
        recordConfigSeparator: {
            position: "absolute",
            right: 310,
            top: 0,
            height: "100%",
            width: 1,
            borderLeft: "1px solid #d8d8d8",
        },
        recordFieldWrapper: {
            height: "83vh",
            marginRight: 10,
            paddingRight: 10,
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
            position: "absolute",
            width: "auto",
            height: 48,
            top: 0,
            display: "inline-flex",
            zIndex: 100
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
            marginLeft: 10,
            marginRight: 10,
            margin: `5px 0`,
            flexDirection: 'row',
            display: 'flex',
            width: '100%',
        },
        activeItemContentWrapper: {
            marginLeft: 10,
            marginRight: 10,
            backgroundColor: "#ededf1",
            margin: `5px 0`,
            flexDirection: 'row',
            display: 'flex',
            width: '100%'
        },
        itemWrapper: {
            display: 'flex',
            flexDirection: `row`,
            minWidth: 250,
            "&:hover": {
                background: "#ededf1",
                "& $btnWrapper": {
                    display: "flex"
                }
            }
        },
        itemLabelWrapper: {
            width: "80%",
            display: "flex",
            flexDirection: "row"
        },
        typeWrapper: {
            maxWidth: 80,
            color: '#00819C',
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        nameWrapper: {
            maxWidth: 80,
            color: "#000",
            marginLeft: 5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
        defaultValWrapper: {
            maxWidth: 40,
            color: '#B20002',
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        optionalNArray: {
            maxWidth: 15,
            color: "#000",
        },
        btnWrapper: {
            display: "none",
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
            width: "80%",
            display: "flex",
            flexDirection: "row",
            padding: 10,
            margin: "0 10px",
            borderRadius: 5,
            border: "1px solid #A6B3FF",
            justifyContent: "center"
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
            margin: `10px 10px 10px 5px`,
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
            minWidth: 250
        },
        activeRecordEditorWrapper: {
            minWidth: 250,
            boxSizing: "border-box",
            borderRadius: 4
        },
        recordHeader: {
            display: `flex`,
            flexDirection: `row`,
            "&:hover": {
                "& $recordHeaderBtnWrapper": {
                    display: "flex",
                    flexDirection: "row",
                    width: "25%",
                    alignItems: "center"
                },
                "& $recordExpandBtnWrapper": {
                    marginTop: 10,
                    marginLeft: 0
                },
                "& $typeDefEditBtnWrapper": {
                    display: "flex",
                    flexDirection: "row",
                    width: "10%",
                    marginTop: 5,
                    justifyContent: "flex-end"
                }
            }
        },
        recordHeading: {
            display: "flex",
            width: "80%"
        },
        typeNVisibilityWrapper: {
            maxWidth: 70,
            fontFamily: "inherit",
            color: '#1E00FF'
        },
        typeDefNameWrapper: {
            maxWidth: 130,
            marginLeft: 5,
            fontFamily: "inherit",
            color: '#00819C',
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        recordKeywordWrapper: {
            width: 40,
            marginLeft: 5,
            fontFamily: "inherit",
            color: '#1E00FF'
        },
        recordKeywordWithTypeWrapper: {
            width: 40,
            fontFamily: "inherit",
            color: '#1E00FF'
        },
        openBraceTokenWrapper: {
            width: 15,
            fontFamily: "inherit",
            color: '#000'
        },
        dotExpander: {
            marginLeft: 5,
            cursor: "pointer"
        },
        endRecordCode: {
            maxWidth: 200,
            marginLeft: 5,
            fontFamily: "inherit",
            color: '#000'
        },
        closeBraceTokenWrapper: {
            maxWidth: 40,
            fontFamily: "inherit",
            color: '#000'
        },
        endRecordCodeWrapper: {
            display: "flex",
            flexDirection: "row",
            marginLeft: 20,
        },
        singleTokenWrapper: {
            width: 10,
            color: "#000"
        },
        equalTokenWrapper: {
            margin: "0 5px",
            width: 10,
            color: "#000"
        },
        recordHeaderBtnWrapper: {
            display: "none",
            flexDirection: "row",
            width: "15%",
            alignItems: "center"
        },
        recordExpandBtnWrapper: {
            width: 20,
            marginTop: 10
        },
        typeDefEditBtnWrapper: {
            display: "none",
            cursor: "pointer",
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
        configButtonWrapper: {
            width: "auto",
            marginRight: 20,
        },
        fieldAddButtonWrapper: {
            height: 'auto',
            display: 'flex',
            marginTop: 10,
            justifyContent: 'flex-end',
            width: '100%',
            zIndex: 100,
        },
        jsonButtonWrapper: {
            marginRight: 20,
        },
        recordSubFieldWrapper: {
            display: `flex`,
            marginLeft: 20,
            flexDirection: `column`,
            borderLeft: `1px solid #e8e8e8`
        },
        activeRecordSubFieldWrapper: {
            display: `flex`,
            marginLeft: 20,
            flexDirection: `column`,
            borderLeft: `1px solid #cdcdcd`
        }
    }),
);
