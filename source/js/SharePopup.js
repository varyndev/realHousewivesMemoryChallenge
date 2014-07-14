/**
 * SharePopup.js
 *
 * Show a share popup:
 * Allow user to pick a network to share game
 *
 */

MemoryMatch.SharePopup = {
    shareNetworks: [{id: 'facebook', icon: 'facebook-icon'}, {id: 'twitter', icon: 'twitter-icon'}, {id: 'googleplus', icon: 'googleplus-icon'}],
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
        // begin animation, then wait for user event to end this state and alert callback
        this.isEnabled = true;
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

        animator.endYScale = animator.endXScale = 0;
        animator.vYScale = animator.vXScale = (-1 * this.groupDisplayObject.scaleX) / (duration * MemoryMatch.fps);
    },

    closeComplete: function () {
        this.killScreen();
    },

    closePopup: function (closeEventType) {
        var domElement = this.groupDisplayObject.getChildByName(this.domElementEmailForm);

        this.isEnabled = false;
        this.closeEventType = closeEventType;
        if (domElement != null) {
            domElement.visible = false;
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
        var parameters;

        if (this.isEnabled) {
            this.isEnabled = false; // do not allow clicking any other button until this completes
            parameters = {
                facebookAppId: MemoryMatch.GameSetup.facebookAppId
            };
            enginesisSession.ShareHelper.initialize(networkId, parameters, this.onNetworkInitializeComplete.bind(this));
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
            message = 'Please provide your email address as the sender.';
        } else if (toEmail.length < 4) {
            message = 'Please provide the email address of a recipient.';
        } else if ( ! MemoryMatch.isValidEmail(fromEmail)) {
            message = 'Please provide a valid sender email address.';
        } else if ( ! MemoryMatch.isValidEmail(toEmail)) {
            message = 'Please provide a valid email address of a recipient.';
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
                picture: null,
                link: null
            };
            enginesisSession.ShareHelper.share('email', parameters, this.onNetworkShareComplete.bind(this));
        } else {
            document.getElementById('errorMessage').innerText = message;
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
    },

    onNetworkInitializeComplete: function (networkId) {
        // the requested network was initialized now try to call it
        var parameters;

        if (networkId != 'email') { // hand off to the network to ask the user to share
            parameters = {
                description: '',
                title: MemoryMatch.GameSetup.gameTitle,
                caption: MemoryMatch.GameSetup.gameSubTitle,
                picture: MemoryMatch.GameSetup.promoImage,
                socialHashTags: MemoryMatch.GameSetup.socialHashTag,
                viaId: MemoryMatch.GameSetup.twitterId,
                link: MemoryMatch.GameSetup.gameLink
            };
            if (this.shareMessage != null) {
                parameters.description = this.shareMessage;
            } else {
                parameters.description = MemoryMatch.GameSetup.gameSubTitle;
            }
            enginesisSession.ShareHelper.share(networkId, parameters, this.onNetworkShareComplete.bind(this));
//            this.closePopup("continue"); // if user cancels we will never know!
        } else { // we need to prompt the user for the share info
            this.showEmailForm();
        }
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
            domElement,
            scaleFactorX,
            scaleFactorY,
            x,
            y,
            width,
            height;

        if (pageElement != null) {
            domElement = new createjs.DOMElement(pageElement)
            if (domElement != null) {
                domElement.name = domElementId;
                width = pageElement.clientWidth;
                height = pageElement.clientHeight;
                // the div is independent of the CSS container to we need to center it and scale it based on where the background is placed
                if (MemoryMatch.stageScaleFactor == 0.5) {
                    scaleFactorX = 1;
                    x = width * -0.12;
                    y = MemoryMatch.stageHeight * 0.15; // Math.floor((MemoryMatch.stageHeight - height) * (-0.5 * scaleFactorX));
                } else if (MemoryMatch.stageScaleFactor < 0.5) {
//                    scaleFactorX = 0.8; // MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledWidth / MemoryMatch.stageWidth);
//                    scaleFactorY = 0.8; // MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledHeight / MemoryMatch.stageHeight);
                    scaleFactorX = 0.8;
                    x = width * 0.05; // Math.floor((MemoryMatch.stageWidth - width) * 0.5);
                    y = MemoryMatch.stageHeight * 0.15; // Math.floor((MemoryMatch.stageHeight - height) * 0.5);
                } else {
//                    scaleFactorX = 1; // MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledWidth / MemoryMatch.stageWidth);
//                    scaleFactorY = 1; // MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledHeight / MemoryMatch.stageHeight);
//                    x = Math.floor((MemoryMatch.stageWidth - width) * 0.5 * scaleFactorX);
//                    y = Math.floor((MemoryMatch.stageHeight - height) * 0.5 * scaleFactorX);
                    scaleFactorX = 1; // this.backgroundWidth / width;
                    x = width * -0.12; // Math.floor((MemoryMatch.stageWidth - width) * (-0.5 * scaleFactorX));
                    y = MemoryMatch.stageHeight * 0.15; // Math.floor((MemoryMatch.stageHeight - height) * (-0.5 * scaleFactorX));
                }
                MemoryMatch.debugLog("X,Y=(" + x + "," + y + "); Scale=" + scaleFactorX + "; Client w/h (" + width + "," + height + "); background (" + this.backgroundWidth + "," + this.backgroundHeight + "); stage(" + MemoryMatch.stageWidth + "," + MemoryMatch.stageHeight + ")");
                this.groupDisplayObject.addChildAt(domElement, 0);
                domElement.setTransform(x, y, scaleFactorX, scaleFactorX, 0, 0, 0, 0, 0);
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
        document.getElementById('fromname').value = userInfo.userName;
        document.getElementById('fromemail').value = userInfo.email;
        document.getElementById('toemail').value = '';
        document.getElementById('message').value = 'Come play ' + MemoryMatch.GameSetup.gameTitle + '. I really enjoy this game, you will too!';
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
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.stateCompleteCallback = null;
        this.parentDisplayObject = null;
    }
};