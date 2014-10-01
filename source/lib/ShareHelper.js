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

"use strict";

var ShareHelper = {

    networks: null,
    serverResponse: '',
    success: false,
    errorMessage: '',
    responseInfo: '',
    callBackWhenComplete: null,
    enginesisSession: null,

    initialize: function (enginesisInstance, networkList, parameters, callbackWhenComplete) {
        var objectType,
            networkName,
            i;

        this.enginesisSession = enginesisInstance;
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

    initializeNetworks: function (networkNames, parameters, callbackWhenComplete) {
        // load and init requested networks
        var i,
            n,
            networkName,
            networkDetails;

        for (n = 0; n < networkNames.length; n ++) {
            networkName = networkNames[n];
            for (i = 0; i < this.networks.length; i ++) {
                networkDetails = this.networks[i];
                if (networkDetails.id == networkName) {
                    networkDetails.init(parameters, callbackWhenComplete);
                }
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
            firstJS = document.getElementsByTagName('script')[0],
            tweetCompleteCallBack = this.onTweetComplete;

        if (window.twttr == null && document.getElementById(domId) == null) {
            window.twttr = (function () {
                twitterJS = document.createElement('script');
                twitterJS.id = domId;
                twitterJS.src = twitterScript;
                firstJS.parentNode.insertBefore(twitterJS, firstJS);
                return window.twttr || (twttr = { _e: [], ready: function(f) { twttr._e.push(f) } });
            })();
            window.twttr.ready(function (twttr) {
                twttr.events.bind('tweet', tweetCompleteCallBack);
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
        this.enginesisSession.debugLog('ShareHelper:onTweetComplete event=' + event);
    },

    initializeGooglePlus: function (parameters, callbackWhenComplete) {
        // load and init G+
        var googleJS,
            plusOneJS = document.createElement('script');

        this.callBackWhenComplete = callbackWhenComplete;
        plusOneJS.type = 'text/javascript';
        plusOneJS.async = true;
        plusOneJS.src = 'https://apis.google.com/js/client:plusone.js?onload=onGooglePlusLoaded';
        googleJS = document.getElementsByTagName('script')[0];
        googleJS.parentNode.insertBefore(plusOneJS, googleJS);
    },

    onGooglePlusLoaded: function (event) {
        if (this.callBackWhenComplete != null) {
            this.callBackWhenComplete('googleplus');
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
        if (callbackWhenComplete != null) {
            callbackWhenComplete('facebook');
        }
    },

    GoogleFeed: function (parameters, callbackWhenComplete) {
        var options = {
            contenturl: parameters.link,
            clientid: parameters.googleClientId,
            cookiepolicy: 'single_host_origin',
            prefilltext: parameters.description,
            calltoactionlabel: 'CHALLENGE',
            calltoactionurl: parameters.link,
            contentdeeplinkid: '/pages',
            calltoactiondeeplinkid: '/pages/create'
            },
            domElement,
            openStatus;

        // Call the render method when appropriate within your app to display
        // the button.
        gapi.interactivepost.render('googleSharePost', options);
        window.setTimeout(function() {
            try {
                domElement = document.getElementById('googleSharePost');
                if (typeof domElement.onclick == "function") {
                    try {
                        domElement.onclick.apply(domElement);
                    } catch (exception) {
                        openStatus = window.open('https://plus.google.com/share?url=' + encodeURI(parameters.link),'_blank');
//                        $("a.link").on("click", function() {
//                            window.open('https://plus.google.com/share?url=' + encodeURI(parameters.link),'_blank');
//                        });
                    }
                }
            } catch (exceptionTwo) {
                openStatus = window.open('https://plus.google.com/share?url=' + encodeURI(parameters.link),'_blank');
            }
            if (openStatus == undefined || openStatus == null || typeof(openStatus) == 'undefined') {

            }
            if (callbackWhenComplete != null) {
                callbackWhenComplete('googleplus');
            }
        }, 350);

        // Google + Share URL
        // https://plus.google.com/share?url=
    },

    TwitterStatus: function (parameters, callbackWhenComplete) {
        var twitterStatus = 'https://twitter.com/intent/tweet',
            fullPost,
            fullPostLength,
            text,
            hashTags,
            via,
            url; // counts for 24 chars if t.co does its job

        if (parameters.shortDescription == null) {
            if (parameters.description == null) {
                text = 'Status update';
            } else {
                text = parameters.description;
            }
        } else {
            text = parameters.shortDescription;
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
        if (callbackWhenComplete != null) {
            callbackWhenComplete('twitter');
        }
    },

    ShareByEmail: function (parameters, callbackWhenComplete) {
        // Email parameters are From name, From email, To email list, Message
        var referrer;

        if (parameters.referrer != null) {
            referrer = parameters.referrer;
        } else {
            referrer = 'enginesis.com';
        }
        this.enginesisSession.gameDataCreate(referrer, parameters.fromEmail, parameters.fromName, parameters.toEmail, '', parameters.message, '', '', '', false, 0,
            function(enginesisResponse) {
                if (enginesisResponse != null && enginesisResponse.fn != null && enginesisResponse.fn == 'GameDataCreate') {
                    // see if it was sent or we got an error
                } else {
                    // unknown or unexpected reply
                }
                if (callbackWhenComplete != null) {
                    callbackWhenComplete('email');
                }
            });
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
