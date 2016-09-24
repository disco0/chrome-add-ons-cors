/**
 * Created by jolyzhou on 2016/9/23.
 */
/// <reference path="../typings/globals/chrome/index.d.ts" />
namespace CORS {
    export class ChangeHeaders {
        accessControlRequestHeaders: string;
        exposedHeaders: string;
        origin: string;
        rule: string;
        constructor(){
            this.rule = 'origin';
        }
        private requestListener(details) {
            console.log(`<===============Starting New Request===============>`);
            console.log(`URL::: ${details.url}`);
            console.log(`METHOD::: ${details.method}`);

            for(let key in details.requestHeaders) {
                console.log(`==========> ${key}`);
                console.log(details.requestHeaders[key]);
                if(details.requestHeaders[key].name.toLowerCase() === this.rule) {
                    this.origin = details.requestHeaders[key].value;
                    break;
                }
            }

            for(let key in details.requestHeaders) {
                if(details.requestHeaders[key].name.toLowerCase() === "access-control-request-headers") {
                    this.accessControlRequestHeaders = details.requestHeaders[key].value;
                    break;
                }
            }

            return {requestHeaders: details.requestHeaders};
        }

        private responseListener(details) {
            console.log(`===============>Starting Response<===============`);
            console.log(`Response statusCode: ${details.statusCode} `);
            let flag = false,
                alowCredentials = {
                    "name":"Access-Control-Allow-Credentials",
                    "value":"true"
                },
                allowOrigin = {
                    "name": "Access-Control-Allow-Origin",
                    "value": this.origin
                };
            details.responseHeaders.push(alowCredentials);

            for(let key in details.responseHeaders) {
                console.log(details.responseHeaders[key]);
                if(details.responseHeaders[key].name.toLowerCase() === allowOrigin.name.toLowerCase()) {
                    flag = true;
                    details.responseHeaders[key].value = allowOrigin.value;
                    break;
                }
            }

            if(!flag) {
                details.responseHeaders.push(allowOrigin);
            }

            if (this.accessControlRequestHeaders) {
                details.responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": this.accessControlRequestHeaders});
            }

            if(this.exposedHeaders) {
                details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": this.exposedHeaders});
            }

            details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});

            return {responseHeaders: details.responseHeaders};
        }

        public reload() {
            chrome.storage.local.get({'active': false, 'urls': ["<all_urls>"], 'exposedHeaders': ''}, function(result) {

                this.exposedHeaders = result.exposedHeaders;

                /*Remove Listeners*/
                chrome.webRequest.onHeadersReceived.removeListener(this.responseListener);
                chrome.webRequest.onBeforeSendHeaders.removeListener(this.requestListener);

                if(result.active) {
                    chrome.browserAction.setIcon({path: "on.png"});

                    if(result.urls.length) {

                        /*Add Listeners*/
                        chrome.webRequest.onHeadersReceived.addListener(this.responseListener, {
                            urls: result.urls
                        },["blocking", "responseHeaders"]);

                        chrome.webRequest.onBeforeSendHeaders.addListener(this.requestListener, {
                            urls: result.urls
                        },["blocking", "requestHeaders"]);
                    }
                } else {
                    chrome.browserAction.setIcon({path: "off.png"});
                }
            });
        }

        corsinit() {
            chrome.runtime.onInstalled.addListener(function(){
                chrome.storage.local.set({'active': false});
                chrome.storage.local.set({'urls': ["<all_urls>"]});
                chrome.storage.local.set({'exposedHeaders': ''});
                this.reload();
            });
        }
    }
}

const cors = new CORS.ChangeHeaders();
cors.corsinit();