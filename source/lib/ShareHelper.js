/**
 * ShareHelper.js
 * Attempt to provide one API for sharing
 *
 */

// namespace under enginesis object
this.enginesis = this.enginesis || {};

(function() {

    "use strict";
    var p,
        ShareHelper = function() {
        this.initialize();
    };
    p = ShareHelper.prototype;

    p.title = '';
    p.subtitle = '';
    p.description = '';
    p.link = '';
    p.image = '';

    p.serverResponse = '';
    p.success = false;
    p.errorMessage = '';
    p.responseInfo = '';

    p.initialize = function () {

    };

    p.FacebookFeed = function () {
        FB.ui(
            {
                method: 'feed',
                name: this.title,
                caption: this.subtitle,
                description: this.description,
                link: this.link,
                picture: this.image
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
    };

    p.GoogleFeed = function () {

    };

    p.TwitterStatus = function () {

    };

    enginesis.ShareHelper = ShareHelper;
}());
