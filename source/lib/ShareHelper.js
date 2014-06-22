/**
 * ShareHelper.js
 * Attempt to provide one API for sharing.
 * This is a static or singleton object, we only need one of these for an entire application.
 * Each network is a plugin to add the specific functionality required by that network.
 *
 * To use ShareHelper:
 * 1. call enginesis.ShareHelper.initialize(networks, callback); with your list of networks and wait for callback indicating which network is ready;
 * 2. call enginesis.ShareHelper.share(networkId, parameters, callback); to share.
 * Each Share has its own parameters so make sure to match the correct parameters with the network requested.
 *
 */

// namespace under enginesis object
enginesis = enginesis || {};
"use strict";

enginesis.ShareHelper = {

    networks: null,
    serverResponse: '',
    success: false,
    errorMessage: '',
    responseInfo: '',
    callBackWhenComplete: null,

    initialize: function (networkList, parameters, callbackWhenComplete) {
        var objectType,
            networkName,
            i;

        // we expect the list of networks to initialize to be an array of strings or a single string or index
        this.networks = [
            {id: 'email',      init: this.initializeEmail.bind(this),      share: this.ShareByEmail.bind(this)},
            {id: 'facebook',   init: this.initializeFacebook.bind(this),   share: this.FacebookFeed.bind(this)},
            {id: 'twitter',    init: this.initializeTwitter.bind(this),    share: this.TwitterStatus.bind(this)},
            {id: 'googleplus', init: this.initializeGooglePlus.bind(this), share: this.GoogleFeed.bind(this)}
        ];
        if (networkList != null) {
            objectType = Object.prototype.toString.call(networkList); // is it an Array or is it a String?
            if (objectType.indexOf('String') >= 0) {
                networkName = networkList;
                this.initializeNetwork(networkName, parameters, callbackWhenComplete);
            } else if (objectType.indexOf('Number') >= 0) {
                if (networkList > this.networks.length || networkList < 0) {
                    networkList = this.networks.length - 1;
                }
                networkName = this.networks[networkList];
                this.initializeNetwork(networkName, parameters, callbackWhenComplete);
            } else if (networkList.length > 0) {
                for (i = 0; i < networkList.length; i ++) {
                    networkName = networkList[i];
                    this.initializeNetwork(networkName, parameters, callbackWhenComplete);
                }
            }
        }
    },

    share: function (networkId, parameters, callbackWhenComplete) {
        // load and init requested network
        var i,
            networkDetails;

        for (i = 0; i < this.networks.length; i ++) {
            networkDetails = this.networks[i];
            if (networkDetails.id == networkId) {
                networkDetails.share(parameters, callbackWhenComplete);
            }
        }
    },

    initializeNetwork: function (networkName, parameters, callbackWhenComplete) {
        // load and init requested network
        var i,
            networkDetails;

        for (i = 0; i < this.networks.length; i ++) {
            networkDetails = this.networks[i];
            if (networkDetails.id == networkName) {
                networkDetails.init(parameters, callbackWhenComplete);
            }
        }
    },

    initializeFacebook: function (parameters, callbackWhenComplete) {
        var facebookScript = '//connect.facebook.net/en_US/sdk.js',
            domId = 'facebook-jssdk';

        if (window.FB == null || window.FB.ui == null) {
            // load and init FB SDK
            window.fbAsyncInit = function() {
                window.FB.init({
                    appId: parameters.facebookAppId,
                    xfbml: true,
                    status: true,
                    cookie: true,
                    oauth: true,
                    frictionlessRequests: true,
                    display: 'popup',
                    version: 'v2.0'
                });
                if (callbackWhenComplete != null) {
                    callbackWhenComplete('facebook');
                }
            };

            (function (domId) {
                var facebookJS,
                    firstJS;
                if (document.getElementById(domId)) {
                    return;
                }
                firstJS = document.getElementsByTagName('script')[0];
                facebookJS = document.createElement('script');
                facebookJS.id = domId;
                facebookJS.async = true;
                facebookJS.src = facebookScript;
                firstJS.parentNode.insertBefore(facebookJS, firstJS);
                // when facebookJS loads it will automatically call window.fbAsyncInit which will call our callback so we know FB is ready
            }(domId));
        } else {
            if (callbackWhenComplete != null) {
                callbackWhenComplete('facebook');
            }
        }
    },

    initializeTwitter: function (parameters, callbackWhenComplete) {

        // load and init Twitter intents

        var twitterScript = '//platform.twitter.com/widgets.js',
            domId = 'twitter-jswidgets',
            twttr,
            twitterJS,
            firstJS = document.getElementsByTagName('script')[0];

        if (window.twttr == null && document.getElementById(domId) == null) {
            window.twttr = (function () {
                twitterJS = document.createElement('script');
                twitterJS.id = domId;
                twitterJS.src = twitterScript;
                firstJS.parentNode.insertBefore(twitterJS, firstJS);
                return window.twttr || (twttr = { _e: [], ready: function(f) { twttr._e.push(f) } });
            })();
            window.twttr.ready(function (twttr) {
                twttr.events.bind('tweet', this.onTweetComplete);
                if (callbackWhenComplete != null) {
                    callbackWhenComplete('twitter');
                }
            });
        } else {
            if (callbackWhenComplete != null) {
                callbackWhenComplete('twitter');
            }
        }
    },

    onTweetComplete: function (event) {

        // TODO: the tweet was sent or it failed, how do we know?

        var result = event;
        enginesis.debugLog('ShareHelper:onTweetComplete event=' + event);
    },

    initializeGooglePlus: function (parameters, callbackWhenComplete) {
        // load and init G+
        if (callbackWhenComplete != null) {
            callbackWhenComplete('googleplus');
        }
    },

    initializeEmail: function (parameters, callbackWhenComplete) {
        // nothing to do for email
        if (callbackWhenComplete != null) {
            callbackWhenComplete('email');
        }
    },

    FacebookFeed: function (parameters, callbackWhenComplete) {
        if (FB != null && FB.ui != null) {
            FB.ui(
                {
                    method: 'feed',
                    name: parameters.title,
                    caption: parameters.caption,
                    description: this.description,
                    link: parameters.link,
                    picture: parameters.picture
                },
                function(response) {
                    if (response && response.post_id) {
                        this.responseInfo = 'Post was published.';
                        this.success = true;
                    } else {
                        this.errorMessage = 'Post was not published.';
                        this.success = false;
                    }
                }
            );
        }
    },

    GoogleFeed: function (parameters, callbackWhenComplete) {

    },

    TwitterStatus: function (parameters, callbackWhenComplete) {
        var twitterStatus = 'https://twitter.com/intent/tweet',
            fullPost,
            fullPostLength,
            text,
            hashTags,
            via,
            url; // counts for 24 chars if t.co does its job

        if (parameters.description == null) {
            text = 'Status update';
        } else {
            text = parameters.description;
        }
        if (parameters.socialHashTags == null) {
            hashTags = '';
        } else {
            hashTags = parameters.socialHashTags;
        }
        if (parameters.viaId == null) {
            via = '';
        } else {
            via = parameters.viaId;
        }
        if (parameters.link == null) {
            url = '';
        } else {
            url = parameters.link;
        }
        fullPostLength = 140 - 24 - hashTags.length - via.length;
        if (text.length > fullPostLength) {
            text = text.substr(0, fullPostLength);
        }
        fullPost = twitterStatus + '?text=' + encodeURIComponent(text);
        if (url.length > 0) {
            fullPost += '&url=' + encodeURIComponent(url);
        }
        if (via.length > 0) {
            // remove @
            fullPost += '&via=' + encodeURIComponent(this.replaceChar(via, '@'));
        }
        if (hashTags.length > 0) {
            // remove #
            fullPost +='&hashtags=' + encodeURIComponent(this.replaceChar(hashTags, '#'));
        }
        window.open(fullPost, 'shareWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=300,height=250');
    },

    ShareByEmail: function (parameters, callbackWhenComplete) {

    },

    replaceChar: function (str, char) {
        // this should be a String extension
        // String.prototype.replaceChar
        var pos = str.indexOf(char);
        if (pos > 0) {
            return str.substr(0, pos) + str.substr(pos + 1);
        } else if (pos == 0) {
            return str.substr(1);
        } else {
            return str;
        }
    }
};
