/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import React, { useEffect } from "react";
import { VisualizerLocation, GettingStartedSample, GettingStartedCategory, SampleDownloadRequest } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { ComponentCard, Dropdown, Grid, SearchBox } from "@wso2-enterprise/ui-toolkit";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { SAMPLE_ICONS_GITHUB_URL } from "../constants";
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

const SearchWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 30px;
`;

const SampleContainer = styled.div`
    display: grid;
    justify-items: center;
    padding: 16px;
    align-items: center;
    height: 90%;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30vh;
    width: 100vw;
`;

const ProgressRing = styled(VSCodeProgressRing)`
    height: 40px;
    width: 40px;
    margin-top: auto;
    padding: 4px;
`;

export function SamplesView() {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<VisualizerLocation>(null);
    const [filteredSampleData, setFilteredSamples] = React.useState<GettingStartedSample[]>(null);
    const [filteredSampleDataCopy, setFilteredSampleDataCopy] = React.useState<GettingStartedSample[]>(null);
    const [SampleData, setSampleData] = React.useState<GettingStartedSample[]>(null);
    const [categories, setCategories] = React.useState<GettingStartedCategory[]>(null);
    const [images, setImages] = React.useState<string[]>([]);
    const [searchText, setSearch] = React.useState<string>("");
    const [filterText, setFilterText] = React.useState<string>("");

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((initialState) => {
                setState(initialState);
            });
            rpcClient.getMiVisualizerRpcClient().fetchSamplesFromGithub().then((samples) => {
                setSampleData(samples.samples);
                setFilteredSamples(samples.samples);
                setFilteredSampleDataCopy(samples.samples);
                samples.categories.unshift({ id: 0, title: "All", icon: "" });
                setCategories(samples.categories);
                let urls = [];
                for (let i = 0; i < samples.categories.length; i++) {
                    urls.push(SAMPLE_ICONS_GITHUB_URL + samples.categories[i].icon);
                }
                setImages(urls);
            });
        }
    }, [rpcClient]);

    const handleChange = (value: string) => {
        if (value === "All") {
            setFilteredSamples(SampleData);
            setFilteredSampleDataCopy(SampleData);
            setFilterText(value);
        } else {
            let categoryId = categories.find(category => category.title === value).id;
            let filteredData = SampleData.filter(sample => sample.category === categoryId);
            setFilteredSamples(filteredData);
            setFilteredSampleDataCopy(filteredData);
            setFilterText(value);
        }
    }

    const handleSearch = (searchText: string) => {
        console.log("searchText", searchText);
        setSearch(searchText);
        if (searchText !== "") {
            let filteredData = filteredSampleDataCopy.filter(sample => sample.title.toLowerCase().includes(searchText.toLowerCase()));
            setFilteredSamples(filteredData);
        } else {
            setFilteredSamples(filteredSampleDataCopy);
        }
    }

    function downloadSample(sampleName: string) {
        let request: SampleDownloadRequest = {
            zipFileName: sampleName
        }
        rpcClient.getMiVisualizerRpcClient().downloadSelectedSampleFromGithub(request);
    }

    return (
        <>
            <div>
                <h2>Try out a sample</h2>
                <p>Choose a sample from the list below to get started.</p>
                <SearchWrapper>
                    <Dropdown
                        id="drop-down"
                        items={categories ? categories.map(category => ({
                            key: category.id - 1,
                            text: category.title,
                            value: category.title
                        })) : null}
                        label="Sample Category"
                        onChange={handleChange}
                        value={filterText}
                        sx={{ width: 230 }}
                    />
                    <SearchBox
                        value={searchText}
                        autoFocus
                        label="Search"
                        type="text"
                        onChange={handleSearch}
                    />
                </SearchWrapper>
                <br />
                <Grid
                    columns={5}
                    direction="column">
                    {filteredSampleData ? filteredSampleData.sort((a, b) => a.priority - b.priority).map((sample, index) => (
                        <ComponentCard
                            disbaleHoverEffect={true}
                            sx={{ alignItems: "flex-start", width: "220px", marginBottom: "20px"}}>
                            <SampleContainer key={sample.title}>
                                <h2 className="card-title" style={{ margin: '0', fontSize: '16px' }}>{sample.title}</h2>
                                <img src={images[sample.category]} className="card-image" style={{ width: '50%', height: 'auto' }} />
                                <p className="card-content" style={{ marginTop: '16px', textAlign: 'justify' }}>{sample.description}</p>
                                <Button appearance="primary" onClick={() => downloadSample(sample.zipFileName)}>Download</Button>
                            </SampleContainer>
                        </ComponentCard>
                    )) : (
                        <LoaderWrapper>
                            <ProgressRing />
                        </LoaderWrapper>
                    )}
                </Grid>
            </div>
        </>
    );
}
