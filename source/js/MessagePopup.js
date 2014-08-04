/**
 * MessagePopup.js
 *
 * Show a generic popup that can be used for informational or error messages.
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.MessagePopup = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonInstances: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    bgImageScaleX: 1,
    bgImageScaleY: 1,
    backgroundCover: null,
    marginTop: 0,
    marginLeft: 0,
    lineHeight: 0,
    isEnabled: false,
    title: null,
    message: null,
    closeButton: true,
    continueButton: false,
    domElement: null,
    noscale: false,
    closeEventType: null,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,


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
            if (parameters.domElement != null) {
                this.domElement = parameters.domElement;
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
        if (this.domElement != null) {
            this.setupDOMElement(); // need to do this after the transformation
        }
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
        var duration = 0.1; // seconds of animation
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeShrink.bind(this));
        if (animator != null) {
            animator.endYScale = animator.endXScale = 1.08;
            animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        }
        if (this.stateCompleteCallback != null) {
            this.stateCompleteCallback(this.closeEventType);
        }
    },

    closeShrink: function () {
        var duration = 0.3; // seconds of animation
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeComplete.bind(this));
        animator.endYScale = animator.endXScale = 0;
        animator.vYScale = animator.vXScale = (-1 * this.groupDisplayObject.scaleX) / (duration * MemoryMatch.fps);
    },

    closeComplete: function () {
        this.killScreen();
    },

    closePopup: function (closeEventType) {
        var domElement = this.groupDisplayObject.getChildByName('text'),
            pageElement;

        this.isEnabled = false;
        this.closeEventType = closeEventType;
        if (domElement != null) {
            domElement.visible = false;
            pageElement = document.getElementById(this.domElement);
            if (pageElement != null) {
                pageElement.style.display = 'none';
            }
        }
        // begin animation, then once close is complete send notification
        this.closeStartAnimation();
    },

    onClickClose: function (event) {
        if (this.isEnabled) {
            MemoryMatch.triggerSoundFx("soundTap");
            this.closePopup("close");
        }
    },

    onClickContinue: function (event) {
        if (this.isEnabled) {
            MemoryMatch.triggerSoundFx("soundTap");
            this.closePopup("continue");
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
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
        this.bgImageScaleX = xScale;
        this.bgImageScaleY = yScale;
        if (this.primaryColorFilter != null) {
            bgImage.filters = [this.primaryColorFilter];
            bgImage.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
        }
    },

    setupDOMElement: function () {
        // Position a DOM element in the center of the popup. Expecting the element to be a div containing what we want to show.
        // Register domElement to its center
        var pageElement = document.getElementById(this.domElement),
            domElement = new createjs.DOMElement(pageElement),
            positionOffset,
            scaleFactorX,
            scaleFactorY,
            x,
            y,
            width,
            height;

        if (domElement != null) {
            domElement.name = 'text';
            width = pageElement.clientWidth;
            height = pageElement.clientHeight;

            // the div was scaled by CSS, we need to determine how much the div was scaled, then center it
            scaleFactorX = MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledWidth / MemoryMatch.stageWidth);
            scaleFactorY = MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledHeight / MemoryMatch.stageHeight);
            if (MemoryMatch.stageScaleFactor == 0.5) {
                positionOffset = -0.5;
                x = (this.backgroundWidth * positionOffset) | 0;
                y = (this.backgroundHeight * positionOffset) | 0;
            } else if (MemoryMatch.stageScaleFactor > 0.5) {
                positionOffset = -0.415;
                x = (this.backgroundWidth * positionOffset) | 0;
                y = (this.backgroundHeight * positionOffset) | 0;
            } else {
                x = (this.backgroundWidth * -0.52) | 0;
                y = (this.backgroundHeight * -0.48) | 0;
            }
            this.parentDisplayObject.addChild(domElement);
            pageElement.style.display = 'block';
            pageElement.width = this.parentDisplayObject.width;
            pageElement.height = this.parentDisplayObject.height;
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
        titleTextField.y = this.backgroundHeight * 0.4;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupButtons: function () {
        var buttonScale = 1.0,
            gameButton,
            buttonTagCounter = 0,
            buttonSize,
            buttonBaseColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].liteColor,
            buttonRollOverColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].secondaryColor;

        // Close button always shows in its own special place
        buttonTagCounter ++;
        gameButton = MemoryMatch.GUIButton({name: "close", tag: buttonTagCounter, disabled: false, callback: this.onClickClose.bind(this), baseUp: "closeButtonUp", baseOver: "closeButtonDown", baseDown: "closeButtonDown"});
        buttonSize = gameButton.getSize();
        gameButton.setTransform(this.backgroundWidth * 0.94 - buttonSize.width, this.backgroundHeight * 0.05, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        if (this.continueButton) {
            buttonTagCounter ++;
            buttonSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, 'gameOverButtonBase');
            gameButton = MemoryMatch.GUIButton({name: "continue", tag: buttonTagCounter, disabled: false, callback: this.onClickContinue.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverNextIcon", iconOver: "gameOverNextDownIcon", iconDown: "gameOverNextDownIcon"});
            gameButton.setTransform((this.backgroundWidth - buttonSize.width) * 0.5, this.backgroundHeight * 0.75, buttonScale, buttonScale);
            this.groupDisplayObject.addChild(gameButton);
            this.buttonInstances.push(gameButton);
        }
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
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.stateCompleteCallback = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};