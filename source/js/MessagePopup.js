/**
 * MessagePopup.js
 *
 * Show a generic popup that can be used for informational or error messages.
 *
 */

MemoryMatch.MessagePopup = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonHelperInstances: null,
    buttonInstances: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    backgroundCover: null,
    marginTop: 0,
    marginLeft: 0,
    centerX: 0,
    marginX: 0,
    lineHeight: 0,
    isEnabled: false,
    title: null,
    message: null,
    closeButton: true,
    continueButton: false,
    domElement: null,
    stateCompleteCallback: null,
    closeEventType: null,


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
        }
    },

    setup: function (displayObject, parameters) {
        this.parentDisplayObject = displayObject;
        this.buttonHelperInstances = [];
        this.buttonInstances = [];
        this.setParameters(parameters);
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.marginTop = 140 * MemoryMatch.stageScaleFactor;
        this.marginLeft = 140 * MemoryMatch.stageScaleFactor;
        this.showBackgroundImage();
        this.centerX = this.backgroundWidth * 0.5;
        this.marginX = 12 * MemoryMatch.stageScaleFactor;
        this.setupTitleText();
        if (this.domElement != null) {
            this.setupDOMElement();
        } else {
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
        this.isEnabled = false;
        this.closeEventType = closeEventType;
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
        var canvas = this.parentDisplayObject.canvas;
        var popupImageAsset = assetLoader.getResult("popup-bg");
        var bgImage = new createjs.Bitmap(popupImageAsset);
        var xScale;
        var yScale;
        var backgroundCover;

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
    },

    setupDOMElement: function () {
        // Position a DOM element in the center of the popup. Expecting the element to be a div containing what we want to show.
        // Register domElement to its center, you need to get that from the html/css, then position in center of popup
        var pageElement = document.getElementById(this.domElement);
        var domElement = new createjs.DOMElement(pageElement);
        if (domElement != null) {
            domElement.regX = parseInt(pageElement.style.width) * 0.5;
            domElement.regY = parseInt(pageElement.style.height) * 0.5;
            domElement.x = this.marginLeft * 0.5;
            domElement.y = this.marginTop;
            domElement.scaleX = MemoryMatch.stageScaleFactor;
            domElement.scaleY = MemoryMatch.stageScaleFactor;
            this.groupDisplayObject.addChild(domElement);
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
        var spriteFrame;
        var spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
        var buttonScale = 1.0;
        var gameButton;
        var newButtonInstance;
        var buttonSize;

        // Close button always shows
        spriteFrame = "closeButtonUp";
        buttonSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, spriteFrame);
        gameButton = new createjs.Sprite(spriteData, spriteFrame);
        gameButton.setTransform(this.backgroundWidth - buttonSize.width - buttonSize.width, buttonSize.width, buttonScale, buttonScale);
        gameButton.framerate = 1;
        newButtonInstance = new createjs.ButtonHelper(gameButton, "closeButtonUp", "closeButtonOver", "closeButtonDown", false);
        gameButton.addEventListener("click", this.onClickClose.bind(this));
        this.groupDisplayObject.addChild(gameButton);
        this.buttonHelperInstances.push(newButtonInstance);
        this.buttonInstances.push(gameButton);

        if (this.continueButton) {
            spriteFrame = "gameOverNextUp";
            buttonSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, spriteFrame);
            gameButton = new createjs.Sprite(spriteData, spriteFrame);
            gameButton.setTransform((this.backgroundWidth - buttonSize.width) * 0.5, this.backgroundHeight * 0.77, buttonScale, buttonScale);
            gameButton.framerate = 1;
            newButtonInstance = new createjs.ButtonHelper(gameButton, "gameOverNextUp", "gameOverNextOver", "gameOverNextDown", false);
            gameButton.addEventListener("click", this.onClickContinue.bind(this));
            this.groupDisplayObject.addChild(gameButton);
            this.buttonHelperInstances.push(newButtonInstance);
            this.buttonInstances.push(gameButton);
        }
    },

    isShowing: function () {
        return this.groupDisplayObject !== null && this.groupDisplayObject.visible;
    },

    killScreen: function () {
        // remove all display objects and object references:
        var i;
        var pageElement;

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
        this.buttonHelperInstances = null;
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.stateCompleteCallback = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
