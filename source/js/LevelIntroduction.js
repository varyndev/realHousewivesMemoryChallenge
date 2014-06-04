/**
 * LevelIntroduction.js
 *
 * Introduce a new level. Designed to tell the user how to play the level.
 * This object just layouts out the screen, animates the pieces,
 * and waits for the user to indicate they are ready to play.
 *
 */

MemoryMatch.LevelIntroduction = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    spriteData: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    isEnabled: false,
    marginTop: 0,
    marginLeft: 0,
    buttonInstances: null,
    closeEventType: null,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,
    level: 0,
    gameNumber: 0,


    setup: function (displayObject, stateCompleteCallbackFunction, level, gameNumber) {
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.buttonInstances = [];
        this.isEnabled = false;
        this.level = level;
        this.gameNumber = gameNumber;
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
        this.setColorFilters();
        this.showBackgroundImage(this.parentDisplayObject.canvas);
        this.marginTop = this.backgroundHeight * 0.05;
        this.marginLeft = this.backgroundWidth * 0.09;
        this.setupTitleText();
        this.setupButtons();
        this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 0, 0, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
        this.groupDisplayObject.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
        if (autoStart == null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // begin animation, then wait for user event to end this state and alert callback
        var duration = 0.3, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationPhaseTwo.bind(this));

        animator.endYScale = animator.endXScale = 1.08;
        animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
    },

    startAnimationPhaseTwo: function (sprite) {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationComplete.bind(this));

        animator.endYScale = animator.endXScale = 1.0;
        animator.vYScale = animator.vXScale = -1 * (animator.endXScale / (duration * MemoryMatch.fps));
    },

    startAnimationComplete: function (sprite) {
         this.isEnabled = true;
    },

    closeStartAnimation: function () {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeShrink.bind(this));

        animator.endYScale = animator.endXScale = 1.08;
        animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        if (this.backgroundSoundInstance != null) {
            this.backgroundSoundInstance.stop();
            this.backgroundSoundInstance = null;
        }
    },

    closeShrink: function () {
        var duration = 0.3, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeComplete.bind(this));

        animator.endYScale = animator.endXScale = 0;
        animator.vYScale = animator.vXScale = (-1 * this.groupDisplayObject.scaleX) / (duration * MemoryMatch.fps);
    },

    closeComplete: function () {
        if (this.stateCompleteCallback !== null) {
            this.stateCompleteCallback(this.closeEventType, this.level, this.gameNumber);
        }
        this.killScreen();
    },

    close: function () {
        this.isEnabled = false;
        if (this.isShowing()) {
            this.closeStartAnimation();
        }
    },

    onClickHome: function (event) {
        if (MemoryMatch.LevelIntroduction.isEnabled) {
            this.closeEventType = 'home';
            this.close();
        }
    },

    onClickContinue: function (event) {
        if (MemoryMatch.LevelIntroduction.isEnabled) {
            this.closeEventType = 'continue';
            this.close();
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
    },

    showBackgroundImage: function (canvas) {
        // This method will scale the background image to fit the current stage if it is too big.
        var popupImageAsset = assetLoader.getResult("popup-bg"),
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
        backgroundCover.graphics.beginFill("#CCCCCC").drawRect((canvas.width - popupImageAsset.width) * -0.5, (canvas.height - popupImageAsset.height) * -0.5, canvas.width, canvas.height);
        backgroundCover.alpha = 0.1;
        backgroundCover.addEventListener("click", this.onClickBackground);

        this.groupDisplayObject.addChild(backgroundCover);
        this.groupDisplayObject.addChild(bgImage);
        this.backgroundWidth = popupImageAsset.width * xScale;
        this.backgroundHeight = popupImageAsset.height * yScale;
        if (this.primaryColorFilter != null) {
            bgImage.filters = [this.primaryColorFilter];
            bgImage.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
        }
    },

    setupTitleText: function () {

        // Show the icon representing the level and the popup title and subtitle

        var titleTextField,
            gameData = MemoryMatch.getGameData(false),
            iconScale = 1,
            icon = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].iconPopup,
            iconSprite = new createjs.Sprite(this.spriteData, icon),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, icon),
            nextY;

        iconSprite.setTransform(this.marginLeft - (spriteSize.width * 0.25), this.marginTop - (spriteSize.height * 0.25), iconScale, iconScale);
        iconSprite.framerate = 1;
        iconSprite.name = "icon";
        this.groupDisplayObject.addChild(iconSprite);

        titleTextField = new createjs.Text(gameData.levelName, MemoryMatch.getScaledFontSize(58) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
        nextY = titleTextField.y + (titleTextField.getMeasuredLineHeight() * 2);

        titleTextField = new createjs.Text(gameData.levelIntro, MemoryMatch.getScaledFontSize(46) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = nextY;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.lineHeight = titleTextField.getMeasuredLineHeight() * 1.5;
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupButtons: function () {

        // 2 buttons centered horizontal at bottom of popup

        var spriteFrame = "gameOverButtonBase",
            buttonScale = 1.0,
            buttonWidth = MemoryMatch.getSpriteFrameWidth(MemoryMatch.GameSetup.guiSpritesheet1Frames, spriteFrame) * buttonScale,
            gameButton,
            buttonBaseColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].liteColor,
            buttonMargin = 0,
            buttonTagCounter = 0,
            totalWidth = (2 * (buttonWidth + buttonMargin)) - buttonMargin,
            xOffset = (this.backgroundWidth - totalWidth) * 0.5,
            yOffset = this.backgroundHeight * 0.75;

        gameButton = MemoryMatch.GUIButton({name: "home", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickHome.bind(this), baseUp: spriteFrame, buttonBaseColor: buttonBaseColor, iconUp: "gameOverMenuIcon", iconOver: "gameOverMenuDownIcon", iconDown: "gameOverMenuDownIcon"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        xOffset += buttonWidth + buttonMargin;
        gameButton = MemoryMatch.GUIButton({name: "continue", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickContinue.bind(this), baseUp: spriteFrame, buttonBaseColor: buttonBaseColor, iconUp: "gameOverNextIcon", iconOver: "gameOverNextDownIcon", iconDown: "gameOverNextDownIcon"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);
    },

    isShowing: function () {
        return this.groupDisplayObject != null && this.groupDisplayObject.visible;
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
        var i;

        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        for (i = 0; i < this.buttonInstances.length; i ++) {
            this.buttonInstances[i].kill();
        }
        this.buttonInstances = null;
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.stateCompleteCallback = null;
        this.spriteData = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
