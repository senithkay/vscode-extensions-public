import ballerina/http;

http:Client testEp = check new ("http://foo.com");

function myfunction() returns error? {
    if true {

    } else {

    }

    foreach int i in 0 ... 100 {

        record {} postResponse = check testEp->post(path = "", message = ());
    }

    while true {

    }
}
