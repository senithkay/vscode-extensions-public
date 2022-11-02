import ballerina/http;

http:Client testEp = check new ("http://foo.com");

function myfunction() returns error? {
    if true {

        record {} getResponse = check testEp->get(path = "");
    } else {

    }

    foreach int i in 0 ... 100 {

    }

    while true {

    }
}
