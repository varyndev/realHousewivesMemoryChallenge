/** @file: enginesis.js - JavaScript interface for Enginesis SDK
 * @author: jf
 * @date: 7/25/13
 * @summary: A JavaScript interface to the Enginesis API. This is designed to be a singleton
 *  object, only one should ever exist. It represents the data model and service/event model
 *  to converse with the server.
 * 
 * git $Header$
 *
 **/

"use strict";

var enginesis = function (siteId, gameId, gameGroupId, enginesisServerStage, authToken, developerKey, languageCode, callBackFunction) {

    var VERSION = '2.2.17';
    var debugging = true;
    var disabled = false; // use this flag to turn off communicating with the server
    var errorLevel = 15; // bitmask: 1=info, 2=warning, 4=error, 8=severe
    var useHTTPS = false;
    var serverStage = null;
    var serverHost = null;
    var submitToURL = null;
    var siteId = siteId || 0;
    var gameId = gameId || 0;
    var gameGroupId = gameGroupId || 0;
    var languageCode = languageCode || 'en';
    var syncId = 0;
    var lastCommand = null;
    var callBackFunction = callBackFunction;
    var authToken = authToken;
    var developerKey = developerKey;
    var loggedInUserId = 0;


    var requestComplete = function (enginesisResponseData, overRideCallBackFunction) {
        var enginesisResponseObject;

        //debugLog("CORS request complete " + enginesisResponseData);
        try {
            enginesisResponseObject = JSON.parse(enginesisResponseData);
        } catch (exception) {
            enginesisResponseObject = {results:{status:{success:0,message:"Error: " + exception.message,extended_info:enginesisResponseData.toString()},passthru:{fn:"unknown",state_seq:"0"}}};
        }
        enginesisResponseObject.fn = enginesisResponseObject.results.passthru.fn;
        if (overRideCallBackFunction != null) {
            overRideCallBackFunction(enginesisResponseObject);
        } else if (callBackFunction != null) {
            callBackFunction(enginesisResponseObject);
        }
    };

    var sendRequest = function (fn, parameters, overRideCallBackFunction) {
        var enginesisParameters = serverParamObjectMake(fn, parameters),
            crossOriginRequest = new XMLHttpRequest();

        if (typeof crossOriginRequest.withCredentials == undefined) {
            debugLog("CORS is not supported");
        } else if ( ! disabled) {
            crossOriginRequest.onload = function(e) {
                requestComplete(this.responseText, overRideCallBackFunction);
            }

            crossOriginRequest.onerror = function(e) {
                debugLog("CORS request error " + crossOriginRequest.status + " " + e.toString());
                // TODO: Enginesis.requestError(errorMessage); generate a canned error response (see PHP code)
            }

            // TODO: Need "GET", "PUT", and "DELETE" methods
            crossOriginRequest.open("POST", submitToURL, true);
            crossOriginRequest.overrideMimeType("application/json");
            crossOriginRequest.send(convertParamsToFormData(enginesisParameters));
            lastCommand = fn;
        }
    };

    var serverParamObjectMake = function (whichCommand, additionalParameters) {
        var serverParams = {
            fn: whichCommand,
            language_code: languageCode,
            site_id: siteId,
            game_id: gameId,
            state_seq: ++ syncId,
            response: "json"
        };
        if (loggedInUserId != 0) {
            serverParams.logged_in_user_id = loggedInUserId;
        }
        if (additionalParameters != null) {
            for (var key in additionalParameters) {
                if (additionalParameters.hasOwnProperty(key)) {
                    serverParams[key] = additionalParameters[key];
                }
            }
        }
        return serverParams;
    };

    var convertParamsToFormData = function (parameterObject)
    {
        var key;
        var formDataObject = new FormData();
        for (key in parameterObject) {
            if (parameterObject.hasOwnProperty(key)) {
                formDataObject.append(key, parameterObject[key]);
            }
        }
        return formDataObject;
    };

    var qualifyAndSetServerStage = function (newServerStage) {
        switch (newServerStage) {
            case '':
            case '-l':
            case '-d':
            case '-q':
            case '-x':
                serverStage = newServerStage;
                break;
            default:
                serverStage = ''; // anything we do not expect goes to the live instance
                break;
        }
        serverHost = 'www.enginesis' + serverStage + '.com';
        submitToURL = (useHTTPS ? 'https://' : 'http://') + serverHost + '/index.php';
        return serverStage;
    };

    var debugLog = function (message, level) {
        if (debugging) {
            if (level == null) {
                level = 15;
            }
            if (errorLevel & level > 0) { // only show this message if the error level is on for the level we are watching
                console.log(message);
            }
            if (level == 9) {
                alert(message);
            }
        }
    };

    qualifyAndSetServerStage(enginesisServerStage);

    // =====================================================================
    // this is the public interface
    //
    return {

        ShareHelper: ShareHelper,

        versionGet: function () {
            return VERSION;
        },

        serverStageSet: function (newServerStage) {
            return qualifyAndSetServerStage(newServerStage);
        },

        serverStageGet: function () {
            return serverStage;
        },

        gameIdGet: function () {
            return gameId;
        },

        gameIdSet: function (newGameId) {
            return gameId = newGameId;
        },

        gameGroupIdGet: function () {
            return gameGroupId;
        },

        gameGroupIdSet: function (newGameGroupId) {
            return gameGroupId = newGameGroupId;
        },

        siteIdGet: function () {
            return siteId;
        },

        siteIdSet: function (newSiteId) {
            return siteId = newSiteId;
        },

        sessionBegin: function(gameKey, overRideCallBackFunction) {
            return sendRequest("SessionBegin", {gamekey: gameKey}, overRideCallBackFunction);
        },

        userLogin: function(userName, password, overRideCallBackFunction) {
            return sendRequest("UserLogin", {user_name: userName, password: password}, overRideCallBackFunction);
        },

        userLoginCoreg: function (userName, siteUserId, gender, dob, city, state, countryCode, locale, networkId, overRideCallBackFunction) {
            return sendRequest("UserLoginCoreg",
            {
                site_user_id: siteUserId,
                user_name: userName,
                network_id: networkId
            }, overRideCallBackFunction);
        },

        registeredUserCreate: function (userName, password, email, realName, dateOfBirth, gender, city, state, zipcode, countryCode, mobileNumber, imId, tagline, siteUserId, networkId, agreement, securityQuestionId, securityAnswer, imgUrl, aboutMe, additionalInfo, sourceSiteId, captchaId, captchaResponse, overRideCallBackFunction) {
            captchaId = '99999';
            captchaResponse = 'DEADMAN';
            sendRequest("RegisteredUserCreate",
            {
                site_id: this.site_id,
                captcha_id: captchaId,
                captcha_response: captchaResponse,
                user_name: userName,
                site_user_id: siteUserId,
                network_id: networkId,
                real_name: realName,
                password: password,
                dob: dateOfBirth,
                gender: gender,
                city: city,
                state: state,
                zipcode: zipcode,
                email_address: email,
                country_code: countryCode,
                mobile_number: mobileNumber,
                im_id: imId,
                agreement: agreement,
                security_question_id: 1,
                security_answer: '',
                img_url: '',
                about_me: aboutMe,
                tagline: tagline,
                additional_info: additionalInfo,
                source_site_id: sourceSiteId
            }, overRideCallBackFunction);
        },

        registeredUserForgotPassword: function (userName, email, overRideCallBackFunction) {
            // this function generates the email that is sent to the email address matching username or email address
            // that email leads to the change password web page
            return sendRequest("RegisteredUserForgotPassword", {user_name: userName, email: email}, overRideCallBackFunction);
        },

        gameFind: function(game_name_part, overRideCallBackFunction) {
            return sendRequest("GameFind", {game_name_part: game_name_part}, overRideCallBackFunction);
        },

        gameList: function(firstItem, numItems, gameStatusId, overRideCallBackFunction) {
            return sendRequest("GameList", {first_item: firstItem, num_items: numItems, game_status_id: gameStatusId}, overRideCallBackFunction);
        },

        gameDataCreate: function (referrer, fromAddress, fromName, toAddress, toName, userMessage, userFiles, gameData, nameTag, addToGallery, lastScore, overRideCallBackFunction) {
            return sendRequest("GameDataCreate", {
                referrer: referrer,
                from_address: fromAddress,
                from_name: fromName,
                to_address: toAddress,
                to_name: toName,
                user_msg: userMessage,
                user_files: userFiles,
                game_data: gameData,
                name_tag: nameTag,
                add_to_gallery: addToGallery ? 1 : 0,
                last_score: lastScore
            }, overRideCallBackFunction);
        },

        gameDataGet: function(gameDataId, overRideCallBackFunction) {
            return sendRequest("GameDataGet", {game_data_id: gameDataId}, overRideCallBackFunction);
        },

        gameTrackingRecord: function (category, action, label, hitData, overRideCallBackFunction) {
            // category = what generated the event
            // action = what happened (LOAD, PLAY, GAMEOVER, EVENT, ZONECHG)
            // label = path in game where event occurred
            // data = a value related to the action, quantifying the action, if any
            if (window.ga != null) {
                // use Google Analytics if it is there (send, event, category, action, label, value)
                ga('send', 'event', category, action, label, hitData);
            }
            return sendRequest("GameTrackingRecord", {hit_type: 'REQUEST', hit_category: category, hit_action: action, hit_label: label, hit_data: hitData}, overRideCallBackFunction);
        }
    };
};



/*

	EnginesisServices.prototype.addOrUpdateVoteByURI = function(voteGroupURI, voteURI, voteValue) {
		var data = this._serverParamObjectMake("AddOrUpdateVoteByURI");
		data.vote_group_uri = voteGroupURI;
		data.uri = voteURI;
		data.vote_value = voteValue;
		return this._sendRequest(data);	
	}

	EnginesisServices.prototype.getNumberOfVotesPerURIGroup = function(voteGroupURI) {
		var data = {	fn: "GetNumberOfVotesPerURIGroup", 
						vote_group_uri: voteGroupURI,
						site_id: this.site_id	};
		return this._sendRequest(data);	
	}

	'GameImgUrl' => array(0, 0, 'GameImgUrl', null, 'site_id', 'logged_in_user_id', 'game_id', 'width', 'height', 'num'),
	'GameImgGet' => array(0, 0, 'GameImgGet', null, 'site_id', 'logged_in_user_id', 'game_id', 'width', 'height', 'num'),
	'GameListByCategory' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'num_items_per_category', 'game_status_id'),
	'GameDataCreate' => array(0, 0, 'GameDataCreate', null, 'site_id', 'logged_in_user_id', 'game_id', 'referrer', 'from_address', 'from_name', 'to_address', 'to_name', 'user_msg', 'user_files', 'game_data', 'name_tag', 'add_to_gallery', '-last_score'),
	'GameGet' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id'),
	'GameGetByName' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_name'),
	'GameFindByName' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_name'),
	'GameListList' => array(0, 0, null, null, 'site_id', 'logged_in_user_id'),
	'GameListListGames' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_list_id'),
	'GameListListGamesByName' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_list_name'),
	'GameListByMostPopular' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'start_date', 'end_date', 'first_item', 'num_items'),
	'GameListCategoryList' => array(0, 0, null, null, 'site_id', 'logged_in_user_id'),
	'RecommendedGameList' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id'),
	'GameListListRecommendedGames' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_list_id'),
	'GameFeatureList' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id'),
	'GameFeatureGet' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id', 'sort_order'),
	'GameTipList' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id'),
	'GameTipGet' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id', 'sort_order'),
	'GamePlayEventListByMostPlayed' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'start_date', 'end_date', 'num_items'),
	'GamePlayEventCountByMostPlayed' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_id', 'start_date', 'end_date'),
	'GamePlayEventCountByMostPlayedForGameGroup' => array(0, 0, null, null, 'site_id', 'logged_in_user_id', 'game_group_id', 'start_date', 'end_date'),
*/
