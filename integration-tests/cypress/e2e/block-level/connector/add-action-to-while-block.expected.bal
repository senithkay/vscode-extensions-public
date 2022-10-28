import ballerina/http;

http:Client testEp = check new ("http://foo.com");

function myfunction() returns error? {
    if true {

    } else {

    }

    foreach int i in 0 ... 100 {

    }

    while true {

        record {} putResponse = check testEp->put(path = "", message = ());
    }
}
