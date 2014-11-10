/**
 * ChallengeIntroduction.js
 *
 * Show the Challenge Introduction popup. This popup introduces a challenge level.
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.ChallengeIntroduction = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonInstances: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    marginTop: 0,
    marginLeft: 0,
    lineHeight: 0,
    isEnabled: false,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,


    setup: function (displayObject, stateCompleteCallbackFunction) {
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.buttonInstances = [];
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.setColorFilters();
        this.showBackgroundImage(this.parentDisplayObject.canvas);
        this.marginTop = this.backgroundHeight * 0.05;
        this.marginLeft = this.backgroundWidth * 0.09;
        this.setupTitleAndMessageText();
        this.setupAward();
        this.setupButtons();
        this.groupDisplayObject.setTransform((this.parentDisplayObject.canvas.width * 0.5) - (this.backgroundWidth * 0.5), (this.parentDisplayObject.canvas.height * 0.5) - (this.backgroundHeight * 0.5), 1, 1);
        if (autoStart === null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // begin animation, then wait for user event to end this state and alert callback
        this.isEnabled = true;
        MemoryMatch.stopBackgroundMusic();
        MemoryMatch.playInterstitialMusic("soundChallenge", true);
    },

    resumeFromPause: function () {
        MemoryMatch.playInterstitialMusic("soundChallenge", true);
    },

    closePopup: function (closeEventType) {
        this.isEnabled = false;
        MemoryMatch.stopInterstitialMusic();
        // begin animation, then once close is complete send notification
        if (MemoryMatch.ChallengeIntroduction.stateCompleteCallback !== null) {
            MemoryMatch.ChallengeIntroduction.stateCompleteCallback(closeEventType);
        }
        MemoryMatch.ChallengeIntroduction.killScreen();
    },

    onClickHome: function (event) {
        MemoryMatch.triggerSoundFx("soundTap");
        if (MemoryMatch.ChallengeIntroduction.isEnabled) {
            MemoryMatch.ChallengeIntroduction.closePopup("home");
        }
    },

    onClickContinue: function (event) {
        MemoryMatch.triggerSoundFx("soundTap");
        if (MemoryMatch.ChallengeIntroduction.isEnabled) {
            MemoryMatch.ChallengeIntroduction.closePopup("continue");
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

    setupTitleAndMessageText: function () {
        var titleTextField;
        var gameData = MemoryMatch.getGameData(true),
            yOffset;

        titleTextField = new createjs.Text("Challenge Game", MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
        yOffset = titleTextField.y + titleTextField.getMeasuredHeight();

//        titleTextField = new createjs.Text(gameData.levelName, MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
//        titleTextField.textAlign = "center";
//        titleTextField.x = this.backgroundWidth * 0.5;
//        titleTextField.y = yOffset;
//        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
//        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
//        this.groupDisplayObject.addChild(titleTextField);
//        yOffset += titleTextField.getMeasuredHeight();

        titleTextField = new createjs.Text(gameData.levelIntro, MemoryMatch.getScaledFontSize(52) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = yOffset;
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
            buttonRollOverColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].secondaryColor,
            buttonMargin = 0,
            buttonTagCounter = 0,
            totalWidth = (2 * (buttonWidth + buttonMargin)) - buttonMargin,
            xOffset = (this.backgroundWidth - totalWidth) * 0.5,
            yOffset = this.backgroundHeight * 0.75;

        gameButton = MemoryMatch.GUIButton({name: "home", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickHome.bind(this), baseUp: spriteFrame, buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverMenuIcon", iconOver: "gameOverMenuDownIcon", iconDown: "gameOverMenuDownIcon"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        xOffset += buttonWidth + buttonMargin;
        gameButton = MemoryMatch.GUIButton({name: "continue", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickContinue.bind(this), baseUp: spriteFrame, buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverNextIcon", iconOver: "gameOverNextDownIcon", iconDown: "gameOverNextDownIcon"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);
    },

    setupAward: function () {
        // Show Award
        var spriteFrame = 'mapTrophy',
            spriteFrames = MemoryMatch.GameSetup.mapSpritesheetFrames,
            spriteData = new createjs.SpriteSheet(spriteFrames),
            imageSprite = new createjs.Sprite(spriteData, spriteFrame),
            spriteSize = MemoryMatch.getSpriteFrameSize(spriteFrames, spriteFrame),
            awardContainer = new createjs.Container(),
            awardsScale = 0.8,
            emptySprite,
            emptySpriteSource,
            position,
            i,
            badgePosition,
            badgeName,
            landNumber,
            numberOfLevels = MemoryMatch.GameSetup.levels.length;

        imageSprite.framerate = 0;
        position = {x: this.backgroundWidth * 0.5, y: this.backgroundHeight * 0.5};
        awardContainer.setTransform(position.x, position.y, awardsScale, awardsScale, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
        awardContainer.addChild(imageSprite);

        // position badges relative to award position, accounting for the center registration of the award sprite
        spriteFrame = 'mapAwardEmpty';
        if (spriteFrames.animations[spriteFrame] != null) {
            emptySpriteSource = new createjs.Sprite(spriteData, spriteFrame);
        } else {
            emptySpriteSource = null;
        }
        spriteFrame = 'mapAwardLand';
        position.x -= spriteSize.width * 0.5;
        position.y -= spriteSize.height * 0.5;
        for (i = 0; i < numberOfLevels; i ++) {
            landNumber = i + 1;
            badgePosition = MemoryMatch.GameSetup.levels[i].gemPosition;
            if (emptySpriteSource != null) {
                if (i > 0) {
                    emptySprite = emptySpriteSource.clone();
                } else {
                    emptySprite = emptySpriteSource;
                }
                emptySprite.setTransform(badgePosition.x * MemoryMatch.stageScaleFactor, badgePosition.y * MemoryMatch.stageScaleFactor);
                awardContainer.addChild(emptySprite);
            }
            badgeName = spriteFrame + landNumber.toString();
            imageSprite = new createjs.Sprite(spriteData, badgeName);
            imageSprite.setTransform(badgePosition.x * MemoryMatch.stageScaleFactor, badgePosition.y * MemoryMatch.stageScaleFactor);
            imageSprite.name = badgeName;
            imageSprite.visible = MemoryMatch.didUserBeatChallenge(landNumber);
            awardContainer.addChild(imageSprite);
        }
        this.groupDisplayObject.addChild(awardContainer);
    },

    showAwardedGems: function () {
        var gemName = 'mapAwardLand',
            landNumber,
            imageSprite,
            i,
            numberOfLevels = MemoryMatch.GameSetup.levels.length;

        for (i = 0; i < numberOfLevels; i ++) {
            landNumber = i + 1;
            gemName = 'mapAwardLand' + landNumber.toString();
            imageSprite = this.groupDisplayObject.getChildByName(gemName);
            if (imageSprite != null) {
                imageSprite.visible = MemoryMatch.didUserBeatChallenge(landNumber);
            }
        }
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
        // remove all display objects and object references:
        var i;

        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        for (i = 0; i < this.buttonInstances.length; i ++) {
            this.buttonInstances[i].removeAllEventListeners();
        }
        this.buttonInstances = null;
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.stateCompleteCallback = null;
        this.levelData = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
