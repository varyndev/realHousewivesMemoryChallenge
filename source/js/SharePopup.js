/**
 * SharePopup.js
 *
 * Show a share popup:
 * Allow user to pick a network to share game
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.SharePopup = {
    shareNetworks: [{id: 'facebook', icon: 'facebook-icon', initialized: false}, {id: 'twitter', icon: 'twitter-icon', initialized: false}, {id: 'googleplus', icon: 'googleplus-icon', initialized: false}],
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonInstances: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    backgroundCover: null,
    marginTop: 0,
    marginLeft: 0,
    lineHeight: 0,
    isEnabled: false,
    title: null,
    message: null,
    closeButton: true,
    continueButton: false,
    domElementEmailForm: null,
    noscale: false,
    closeEventType: null,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,
    shareMessage: null,
    shareShortMessage: null,


    setParameters: function (parameters) {
        if (parameters != null) {
            if (parameters.title != null) {
                this.title = parameters.title;
            } else if (this.title == null) {
                this.title = "";
            }
            if (parameters.message != null) {
                this.message = parameters.message;
            } else if (this.message == null) {
                this.message = "";
            }
            if (parameters.domElementEmailForm != null) {
                this.domElementEmailForm = parameters.domElementEmailForm;
            }
            if (parameters.closeButton != null) {
                this.closeButton = parameters.closeButton;
            }
            if (parameters.continueButton != null) {
                this.continueButton = parameters.continueButton;
            }
            if (parameters.callback != null) {
                this.stateCompleteCallback = parameters.callback;
            }
            if (parameters.noscale != null) {
                this.noscale = parameters.noscale;
            }
            if (parameters.shareMessage != null) {
                this.shareMessage = parameters.shareMessage;
            }
            if (parameters.shareShortMessage != null) {
                this.shareShortMessage = parameters.shareShortMessage;
            }
        }
    },

    setup: function (displayObject, parameters) {
        this.parentDisplayObject = displayObject;
        this.buttonInstances = [];
        this.setParameters(parameters);
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.setColorFilters();
        this.showBackgroundImage();
        this.marginTop = this.backgroundHeight * 0.05;
        this.marginLeft = this.backgroundWidth * 0.09;
        this.setupTitleText();
        if (this.domElement == null) {
            this.setupMessageText();
        }
        this.setupButtons();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 1, 1, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
        if (autoStart == null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // begin animation, initialize all the networks
        var i,
            parameters,
            shareButtonsCount;

        this.isEnabled = true;
        parameters = {
            facebookAppId: MemoryMatch.GameSetup.facebookAppId
        };
        shareButtonsCount = this.shareNetworks.length;
        for (i = 0; i < shareButtonsCount; i ++) {
            enginesisSession.ShareHelper.initialize(enginesisSession, this.shareNetworks[i].id, parameters, this.onNetworksInitializeComplete.bind(this));
        }
    },

    closeStartAnimation: function () {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeShrink.bind(this));

        if (animator != null) {
            animator.endYScale = animator.endXScale = 1.08;
            animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        }
        if (this.stateCompleteCallback != null) {
            this.stateCompleteCallback(this.closeEventType);
        }
    },

    closeShrink: function () {
        var duration = 0.3, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeComplete.bind(this));

        if (animator != null) {
            animator.endYScale = animator.endXScale = 0;
            animator.vYScale = animator.vXScale = (-1 * this.groupDisplayObject.scaleX) / (duration * MemoryMatch.fps);
        }
    },

    closeComplete: function () {
        this.killScreen();
    },

    closePopup: function (closeEventType) {
        var domElement = this.parentDisplayObject.getChildByName(this.domElementEmailForm),
            pageElement = document.getElementById(this.domElementEmailForm);

        this.isEnabled = false;
        this.closeEventType = closeEventType;
        if (pageElement != null) {
            pageElement.style.display = 'none';
        }
        if (domElement != null) {
            this.parentDisplayObject.removeChild(domElement);
        }
        // begin animation, then once close is complete send notification
        this.closeStartAnimation();
    },

    onClickClose: function (event) {
        if (this.isEnabled) {
            this.closePopup("close");
        }
    },

    onClickNetworkButton: function (networkId) {
        var i,
            shareButtonsCount,
            parameters;

        if (this.isEnabled) {
            this.isEnabled = false; // do not allow clicking any other button until this completes

            shareButtonsCount = this.shareNetworks.length;
            for (i = 0; i < shareButtonsCount; i ++) {
                if (networkId == this.shareNetworks[i].id) {
                    if (this.shareNetworks[i].initalized) {
                        this.networkShare(networkId);
                    } else {
                        parameters = {
                            facebookAppId: MemoryMatch.GameSetup.facebookAppId,
                            googleClientId: MemoryMatch.GameSetup.googlePlusClientId
                        };
                        enginesisSession.ShareHelper.initialize(enginesisSession, networkId, parameters, this.onNetworkInitializeComplete.bind(this));
                    }
                }
            }
        }
    },

    onClickSend: function () {
        var name,
            fromEmail,
            toEmail,
            message,
            parameters,
            isOKToSend;

        isOKToSend = false;
        name = document.getElementById('fromname').value;
        fromEmail = document.getElementById('fromemail').value;
        toEmail = document.getElementById('toemail').value;
        message = document.getElementById('message').value;
        if (fromEmail.length < 4) {
            message = MemoryMatch.GameSetup.GUIStrings.emailErrorSender;
        } else if (toEmail.length < 4) {
            message = MemoryMatch.GameSetup.GUIStrings.emailErrorTo;
        } else if ( ! MemoryMatch.isValidEmail(fromEmail)) {
            message = MemoryMatch.GameSetup.GUIStrings.emailErrorFrom;
        } else if ( ! MemoryMatch.isValidEmail(toEmail)) {
            message = MemoryMatch.GameSetup.GUIStrings.emailErrorToEmail;
        } else {
            isOKToSend = true;
        }
        if (isOKToSend) {
            document.getElementById('errorMessage').innerText = '';
            MemoryMatch.UserData.updateUser(-1, name, null, fromEmail, null);
            MemoryMatch.UserData.flush();
            document.getElementById('toemail').value = '';
            parameters = {
                fromName: name,
                fromEmail: fromEmail,
                toEmail: toEmail,
                message: message,
                picture: MemoryMatch.GameSetup.promoImage,
                link: MemoryMatch.GameSetup.gameShortLink,
                referrer: MemoryMatch.GameSetup.siteDomain
            };
            enginesisSession.ShareHelper.share('email', parameters, this.onNetworkShareComplete.bind(this));
        } else {
            document.getElementById('errorMessage').innerText = message;
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
    },

    onNetworksInitializeComplete: function (networkId) {
        // mark this network as initialized
        var i,
            shareButtonsCount;

        shareButtonsCount = this.shareNetworks.length;
        for (i = 0; i < shareButtonsCount; i ++) {
            if (networkId == this.shareNetworks[i].id) {
                this.shareNetworks[i].initalized = true;
            }
        }
    },

    networkShare: function (networkId) {
        var parameters;

        if (networkId != 'email') { // hand off to the network to ask the user to share
            parameters = {
                description: '',
                shortDescription: '',
                title: MemoryMatch.GameSetup.gameTitle,
                caption: MemoryMatch.GameSetup.gameSubTitle,
                picture: MemoryMatch.GameSetup.promoImage,
                socialHashTags: MemoryMatch.GameSetup.socialHashTag,
                viaId: MemoryMatch.GameSetup.twitterId,
                googleClientId: MemoryMatch.GameSetup.googlePlusClientId,
                link: MemoryMatch.GameSetup.gameShortLink
            };
            if (this.shareMessage != null) {
                parameters.description = this.shareMessage;
            } else {
                parameters.description = MemoryMatch.GameSetup.gameSubTitle;
            }
            if (this.shareShortMessage != null) {
                parameters.shortDescription = this.shareShortMessage;
            } else {
                parameters.shortDescription = MemoryMatch.GameSetup.gameSubTitle;
            }
            if (networkId == 'facebook') {
                parameters.link = MemoryMatch.GameSetup.gameLink;
            }
            enginesisSession.ShareHelper.share(networkId, parameters, this.onNetworkShareComplete.bind(this));
        } else { // we need to prompt the user for the share info
            this.showEmailForm();
        }
    },

    onNetworkInitializeComplete: function (networkId) {
        // the requested network was initialized now try to call it
        this.onNetworksInitializeComplete(networkId);
        this.networkShare(networkId);
    },

    onNetworkShareComplete: function (networkId) {
        // the requested share is done
        this.closePopup("continue");
    },

    showBackgroundImage: function () {

        // This method will scale the background image to fit the current stage if it is too big.

        var canvas = this.parentDisplayObject.canvas,
            popupImageAsset = MemoryMatch.assetLoader.getResult("popup-bg"),
            bgImage = new createjs.Bitmap(popupImageAsset),
            xScale,
            yScale,
            backgroundCover;

        if (popupImageAsset.width > canvas.width) {
            xScale = canvas.width / popupImageAsset.width;
        } else {
            xScale = 1;
        }
        if (popupImageAsset.height > canvas.height) {
            yScale = canvas.height / popupImageAsset.height;
        } else {
            yScale = 1;
        }
        bgImage.alpha = 1;
        bgImage.scaleX = xScale;
        bgImage.scaleY = yScale;

        backgroundCover = new createjs.Shape();
        backgroundCover.graphics.beginFill("#CCCCCC").drawRect(0, 0, canvas.width, canvas.height);
        backgroundCover.alpha = 0.1;
        backgroundCover.addEventListener("click", this.onClickBackground);
        this.backgroundCover = backgroundCover;
        this.parentDisplayObject.addChild(backgroundCover);
        this.groupDisplayObject.addChild(bgImage);
        this.backgroundWidth = popupImageAsset.width * xScale;
        this.backgroundHeight = popupImageAsset.height * yScale;
        if (this.primaryColorFilter != null) {
            bgImage.filters = [this.primaryColorFilter];
            bgImage.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
        }
    },

    setupDOMElement: function (domElementId) {
        // Position a DOM element in the center of the popup. Expecting the element to be a div containing what we want to show.
        // Register domElement to its center
        var pageElement = document.getElementById(domElementId),
            domElement;

        if (pageElement != null) {
            domElement = new createjs.DOMElement(pageElement)
            if (domElement != null) {
                domElement.name = domElementId;
                pageElement.style.display = "table-cell";
                this.parentDisplayObject.addChildAt(domElement, 0);
                pageElement = document.getElementById('send');
                if (pageElement != null) {
                    pageElement.onclick = this.onClickSend.bind(this);
                }
            }
        }
    },

    setupTitleText: function () {
        var titleTextField;

        titleTextField = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupMessageText: function () {
        var titleTextField;

        titleTextField = new createjs.Text(this.message, MemoryMatch.getScaledFontSize(48) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = this.marginLeft;
        titleTextField.y = this.backgroundHeight * 0.2;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.name = 'title';
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupButtons: function () {
        var buttonScale = 1.0,
            gameButton,
            shareButton,
            shareButtonsCount,
            shareButtonsStartX,
            shareButtonsMargin,
            shareButtonsWidth = 0,
            buttonTagCounter = 0,
            buttonSize,
            networkId,
            icon,
            i;

        // Close button always shows in its own special place
        buttonTagCounter ++;
        gameButton = MemoryMatch.GUIButton({name: "close", tag: buttonTagCounter, disabled: false, callback: this.onClickClose.bind(this), baseUp: "closeButtonUp", baseOver: "closeButtonDown", baseDown: "closeButtonDown"});
        buttonSize = gameButton.getSize();
        gameButton.setTransform(this.backgroundWidth * 0.94 - buttonSize.width, this.backgroundHeight * 0.05, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        // Show the share buttons
        shareButtonsCount = this.shareNetworks.length;
        for (i = 0; i < shareButtonsCount; i ++) {
            networkId = this.shareNetworks[i].id;
            icon = this.shareNetworks[i].icon;
            buttonTagCounter ++;
            shareButton = MemoryMatch.GUIButton({name: networkId, tag: buttonTagCounter, disabled: false, callback: this.onClickNetworkButton.bind(this), spriteFrames: MemoryMatch.GameSetup.shareIconsFrames, baseUp: icon, baseOver: icon, baseDown: icon});
            if (shareButtonsWidth == 0) {
                // we are assuming all share buttons are the exact same size, otherwise this logic is incorrect.
                buttonSize = gameButton.getSize();
                shareButtonsMargin = Math.floor(buttonSize.width * 0.3333);
                shareButtonsWidth = ((buttonSize.width + shareButtonsMargin) * shareButtonsCount) - shareButtonsMargin;
                shareButtonsStartX = (this.backgroundWidth - shareButtonsWidth) * 0.5;
            }
            shareButton.setTransform(shareButtonsStartX + ((buttonSize.width + shareButtonsMargin) * i), this.backgroundHeight * 0.4, buttonScale, buttonScale);
            this.groupDisplayObject.addChild(shareButton);
            this.buttonInstances.push(shareButton);
        }
    },

    showEmailForm: function () {
        // the email form is a DOM element we need to show it, hide the buttons
        // Hide the share buttons
        var shareButton,
            shareButtonsCount,
            networkId,
            userInfo,
            emailShareMessage,
            i;

        this.isEnabled = true;
        shareButtonsCount = this.shareNetworks.length;
        for (i = 0; i < shareButtonsCount; i ++) {
            networkId = this.shareNetworks[i].id;
            shareButton = this.groupDisplayObject.getChildByName(networkId);
            if (shareButton != null) {
                shareButton.visible = false;
            }
        }
        shareButton = this.groupDisplayObject.getChildByName('title');
        if (shareButton != null) {
            shareButton.visible = false;
        }
        if (this.domElementEmailForm != null) {
            this.setupDOMElement(this.domElementEmailForm);
        }
        userInfo = MemoryMatch.UserData.getById();
        emailShareMessage = MemoryMatch.tokenReplace(MemoryMatch.GameSetup.GUIStrings.emailShareMessage, {"gamename": MemoryMatch.GameSetup.gameTitle});
        document.getElementById('fromname').value = userInfo.userName;
        document.getElementById('fromemail').value = userInfo.email;
        document.getElementById('toemail').value = '';
        document.getElementById('message').value = emailShareMessage;
    },

    isShowing: function () {
        return this.groupDisplayObject !== null && this.groupDisplayObject.visible;
    },

    setColorFilters: function () {
        var primaryColor,
            secondaryColor;

        this.primaryColorValue = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].primaryColor;
        this.secondaryColorValue = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].primaryColor;
        if (this.primaryColorValue != null) {
            primaryColor = MemoryMatch.htmlColorStringToColorArray(this.primaryColorValue);
            this.primaryColorFilter = new createjs.ColorFilter(0, 0, 0, 1, primaryColor[0], primaryColor[1], primaryColor[2], 0);
        } else {
            this.primaryColorFilter = null;
        }
        if (this.secondaryColorValue != null) {
            secondaryColor = MemoryMatch.htmlColorStringToColorArray(this.secondaryColorValue);
            this.secondaryColorFilter = new createjs.ColorFilter(0, 0, 0, 1, secondaryColor[0], secondaryColor[1], secondaryColor[2], 0);
        } else {
            this.secondaryColorFilter = null;
        }
    },

    killScreen: function () {
        // remove all display objects and object references:
        var i,
            pageElement;

        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        if (this.buttonInstances !== null) {
            for (i = 0; i < this.buttonInstances.length; i ++) {
                this.buttonInstances[i].removeAllEventListeners();
            }
            this.buttonInstances = null;
        }
        if (this.domElement != null) {
            pageElement = document.getElementById(this.domElement);
            if (pageElement != null) {
                pageElement.style.visibility = "hidden";
            }
        }
        this.domElement = null;
        this.title = null;
        this.message = null;
        if (this.groupDisplayObject != null) {
            this.groupDisplayObject.removeAllChildren();
            this.parentDisplayObject.removeChild(this.groupDisplayObject);
            this.groupDisplayObject = null;
        }
        if (this.parentDisplayObject != null) {
            this.parentDisplayObject.removeChild(this.backgroundCover);
            this.backgroundCover = null;
            this.stateCompleteCallback = null;
            this.parentDisplayObject = null;
        }
    }
};