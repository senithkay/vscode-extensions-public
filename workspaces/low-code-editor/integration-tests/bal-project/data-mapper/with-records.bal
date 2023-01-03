import ballerina/http;

type Input record {
    string st1;
    string st2;
    int d1;
    record {
        string Id;
        boolean Confirmed;
    }[] Items;
};

type Output record {
    string st1;
    string st2;
    decimal d1;
    record {
        string Id;
        boolean Confirmed;
    }[] Items;
    string[] stArr;
};

function transform() => {};
