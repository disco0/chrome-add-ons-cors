/**
 * Created by jolyzhou on 2016/9/23.
 */
/// <reference path="../typings/globals/chrome/index.d.ts" />
namespace CORS {
    export class ChangeHeaders {
        accessControlRequestHeaders: string;
        exposedHeaders: string;
        origin: string;
        constructor(){}
        private requestListener(details) {

            for(let key in details.requestHeaders) {
                console.log(`==========> ${key}`);
                console.log(details.requestHeaders[key]);
                if(details.requestHeaders[key].name.toLowerCase() === 'origin') {
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
            const that = this;
            chrome.storage.local.get({'active': false, 'urls': ["<all_urls>"], 'exposedHeaders': ''}, function(result) {

                that.exposedHeaders = result.exposedHeaders;

                /*Remove Listeners*/
                chrome.webRequest.onHeadersReceived.removeListener(that.responseListener);
                chrome.webRequest.onBeforeSendHeaders.removeListener(that.requestListener);

                if(result.active) {
                    chrome.browserAction.setIcon({path: "images/on.png"});

                    if(result.urls.length) {

                        /*Add Listeners*/
                        chrome.webRequest.onHeadersReceived.addListener(that.responseListener, {
                            urls: result.urls
                        },["blocking", "responseHeaders"]);

                        chrome.webRequest.onBeforeSendHeaders.addListener(that.requestListener, {
                            urls: result.urls
                        },["blocking", "requestHeaders"]);
                    }
                } else {
                    chrome.browserAction.setIcon({path: "images/off.png"});
                }
            });
        }

        public corsinit() {
            const that = this;
            chrome.runtime.onInstalled.addListener(function(){
                chrome.storage.local.set({'active': false});
                chrome.storage.local.set({'urls': ["<all_urls>"]});
                chrome.storage.local.set({'exposedHeaders': ''});
                that.reload();
            });
        }
    }
}

const cors = new CORS.ChangeHeaders();
cors.corsinit();