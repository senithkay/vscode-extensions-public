import ballerina/io;
import ballerina/test;

@test:Config {
    dataProvider: data
}
function transformTest(string inputFile, string expectedFile) returns error? {
    json inputJson = check io:fileReadJson(inputFile);
    Input input = check inputJson.cloneWithType();
    Output transformResult = transform(input);

    json expectedJson = check io:fileReadJson(expectedFile);
    Output expected = check expectedJson.cloneWithType();
    test:assertEquals(transformResult, expected);
}
