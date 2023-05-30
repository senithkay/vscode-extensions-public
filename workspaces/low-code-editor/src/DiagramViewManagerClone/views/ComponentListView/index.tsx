import { FormControl, InputAdornment, InputLabel, Select, TextField, Typography } from "@material-ui/core";
import { BallerinaProjectComponents, ComponentViewInfo, FileListEntry } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import React, { useEffect } from "react";
import SearchIcon from "../../../assets/icons/SearchIcon";
import { useDiagramContext } from "../../../Contexts/Diagram";
import { TopLevelActionButton } from "../../../OverviewDiagram/components/TopLevelActionButton";
import { ComponentCollection } from "../../../OverviewDiagram/util";
import { useHistoryContext } from "../../context/history";
import { ProjectComponentProcessor } from "./util/project-component-processor";

import useStyles from "./style";
import './style.scss';
import { ComponentView } from "./components/ComponentView";

interface ComponentListViewProps {
    lastUpdatedAt: string;
    projectComponents: BallerinaProjectComponents;
}

const ALL_FILES: string = 'All';

// shows a view that includes document/project symbols(functions, records, etc.)
// you can switch between files in the project and view the symbols in eachfile
// when you select a symbol, it will show the symbol's visualization in the diagram view
export function ComponentListView(props: ComponentListViewProps) {
    const { projectComponents } = props;
    const { history, historyPush } = useHistoryContext();
    const [searchQuery, setSearchQuery] = React.useState<string>("");
    let currentComponents: ComponentCollection;
    let fileList: FileListEntry[];
    const classes = useStyles();

    if (projectComponents) {
        const projectComponentProcessor = new ProjectComponentProcessor(projectComponents);
        projectComponentProcessor.process();
        if (history.length > 0 && history[history.length - 1].file.endsWith('.bal')) {
            currentComponents = projectComponentProcessor.getComponentsFor(history[history.length - 1].file);
        } else {
            currentComponents = projectComponentProcessor.getComponents();
        }
        fileList = Array.from(projectComponentProcessor.getFileMap().values());
    }


    const renderFileFilterBar = () => {
        const handleFileChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
            if (evt.target.value === ALL_FILES) {
                historyPush({ file: projectComponents?.packages[0]?.filePath })
            } else {
                const selectedFile = fileList.find((file) => file.fileName === evt.target.value);
                historyPush({ file: selectedFile.uri.path })
            }
        };

        const handleSeachChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = evt.target;
            setSearchQuery(value);
        }

        const fileSelectorOptions: React.ReactElement[] = [];

        fileSelectorOptions.push(
            <option key={"all"} value={ALL_FILES}>
                {ALL_FILES}
            </option>
        );

        if (fileList && fileList.length > 0) {
            fileList.forEach((fileEntry, optionIndex) => [
                fileSelectorOptions.push(
                    <option key={optionIndex} value={fileEntry.fileName}>
                        {fileEntry.fileName}
                    </option>
                ),
            ]);
        }

        let currentFileName = ALL_FILES;

        if (history.length > 0) {
            currentFileName = fileList?.find((file) => file.uri.path === history[history.length - 1].file)?.fileName || ALL_FILES;
        }

        return (
            <div className="title-bar">
                <FormControl variant="outlined" className={classes.selectorComponent}>
                    <InputLabel htmlFor="outlined-age-native-simple">File</InputLabel>
                    <Select
                        native={true}
                        value={currentFileName}
                        label="File"
                        inputProps={{ name: "age", id: "outlined-age-native-simple" }}
                        onChange={handleFileChange}
                    >
                        {fileSelectorOptions}
                    </Select>
                </FormControl>
                <TextField
                    id="search-comp-input"
                    label="Search Component"
                    variant="outlined"
                    className={classes.inputComponent}
                    onChange={handleSeachChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon color="disabled" fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
                <TopLevelActionButton />
            </div>
        );
    };

    const handleComponentSelection = (info: ComponentViewInfo) => {
        historyPush({
            file: info.filePath,
            position: info.position
        })
    }

    const categories: React.ReactElement[] = [];

    if (currentComponents) {
        Object.keys(currentComponents)
            .filter((key) => currentComponents[key].length)
            .forEach((key, categoryIndex) => {
                const filteredComponents = currentComponents[key].filter(
                    (comp: ComponentViewInfo) =>
                        comp.name.toLowerCase().includes(searchQuery?.toLowerCase().trim() || "") ||
                        key.toLowerCase().includes(searchQuery?.toLowerCase().trim() || "")
                );

                const components = filteredComponents.map((comp: ComponentViewInfo, compIndex: number) => {
                    return (
                        <ComponentView
                            key={key + compIndex}
                            info={comp}
                            updateSelection={handleComponentSelection}
                            type={key}
                        />
                    )
                });

                if (components.length === 0) return;

                categories.push(
                    <div className={classes.categoryContainer} key={key + categoryIndex}>
                        <Typography variant="h3" className={classes.categoryTitle}>{key}</Typography>
                        <div className={classes.componentContainer}>{components}</div>
                    </div>
                );
            });
    }

    return (
        <>
            {renderFileFilterBar()}
            {categories}
        </>
    )
}
