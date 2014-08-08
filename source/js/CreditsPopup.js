/**
 * CreditsPopup.js
 *
 * Show game credits.
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.CreditsPopup = {
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
    closeButton: true,
    stateCompleteCallback: null,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,

    setup: function (displayObject, stateCompleteCallback) {
        this.parentDisplayObject = displayObject;
        this.buttonInstances = [];
        this.stateCompleteCallback = stateCompleteCallback;
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.setColorFilters();
        this.showBackgroundImage(this.parentDisplayObject.canvas);
        this.marginTop = this.backgroundHeight * 0.05;
        this.marginLeft = this.backgroundWidth * 0.09;
        this.setupTitleText();
        this.setupCopyrightText();
        this.showCredits();
        this.setupButtons();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 1, 1, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
        if (autoStart === null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // No animation for Credits
        this.isEnabled = true;
    },

    closeStartAnimation: function () {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeShrink.bind(this));

        animator.endYScale = animator.endXScale = 1.08;
        animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
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
        // begin animation and send notification we're done here
        this.isEnabled = false;
        if (this.stateCompleteCallback !== null) {
            this.stateCompleteCallback("close");
        }
        this.closeStartAnimation();
    },

    onClickClose: function (event) {
        if (this.isEnabled) {
            this.closePopup("close");
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
    },

    showBackgroundImage: function (canvas) {
        // This method will scale the background image to fit the current stage if it is too big.
        var popupImageAsset = MemoryMatch.assetLoader.getResult("popup-bg"),
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

    setupTitleText: function () {
        var titleTextField;

        titleTextField = new createjs.Text("Credits", MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
    },

    showCredits: function () {
        var titleTextField,
            text1 = MemoryMatch.GameSetup.GUIStrings.creditsInfo,
            text2 = MemoryMatch.GameSetup.GUIStrings.creditsCredit;

        titleTextField = new createjs.Text(text1, MemoryMatch.getScaledFontSize(52) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = this.marginLeft;
        titleTextField.y = this.backgroundHeight * 0.18;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.lineHeight = titleTextField.getMeasuredLineHeight() * 1.5;
        this.groupDisplayObject.addChild(titleTextField);

        titleTextField = new createjs.Text(text2, MemoryMatch.getScaledFontSize(44) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.backgroundHeight * 0.32;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.lineHeight = titleTextField.getMeasuredLineHeight();
        this.groupDisplayObject.addChild(titleTextField);

        // Show the JumpyDot logo
        var spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet2Frames);
        var iconSprite = new createjs.Sprite(spriteData, "JumpyDotLogo");
        iconSprite.setTransform(this.backgroundWidth * 0.15, this.backgroundHeight * 0.74);
        iconSprite.framerate = 1;
        this.groupDisplayObject.addChild(iconSprite);

        // Show the HTML5 icon
        iconSprite = new createjs.Sprite(spriteData, "html5-logo");
        iconSprite.setTransform(this.backgroundWidth * 0.80, this.backgroundHeight * 0.73);
        iconSprite.framerate = 1;
        this.groupDisplayObject.addChild(iconSprite);
    },

    setupCopyrightText: function () {
        var info = 'Copyright 2014 JumpyDot. All rights reserved.',
            infoTextField = new createjs.Text(info, MemoryMatch.getScaledFontSize(36) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiInfoColor);

        infoTextField.textAlign = "center";
        infoTextField.x = this.backgroundWidth * 0.5;
        infoTextField.y = this.backgroundHeight * 0.92;
        infoTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(infoTextField);
    },

    setupButtons: function () {
        var spriteFrame,
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames),
            buttonScale = 1.0,
            gameButton,
            newButtonInstance,
            buttonSize;

        // Close button always shows in its own special place
        gameButton = MemoryMatch.GUIButton({name: "close", tag: 1, disabled: false, callback: this.onClickClose.bind(this), baseUp: "closeButtonUp", baseOver: "closeButtonDown", baseDown: "closeButtonDown"});
        buttonSize = gameButton.getSize();
        gameButton.setTransform(this.backgroundWidth * 0.94 - buttonSize.width, this.backgroundHeight * 0.05, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);
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
        var i;

        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        if (this.buttonInstances !== null) {
            for (i = 0; i < this.buttonInstances.length; i ++) {
                this.buttonInstances[i].removeAllEventListeners();
            }
            this.buttonInstances = null;
        }
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
