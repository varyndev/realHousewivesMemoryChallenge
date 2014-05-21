/**
 * LevelIntroduction.js
 *
 * Introduce a new level. This object just layouts out the screen, animates the pieces,
 * and waits for the user to indicate they are ready to play.
 *
 */

MemoryMatch.LevelIntroduction = {
    stateCompleteCallback: null,
    levelData: null,
    gameData: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonHelperInstances: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    marginTop: 0,
    marginLeft: 0,
    titleFontHeight: 0,

    setup: function (displayObject, levelData, gameData, stateCompleteCallbackFunction) {
        // use the level data to do any level-specific setup
        this.levelData = levelData;
        this.gameData = gameData;
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.buttonHelperInstances = [];
    },

    buildScreen: function (autoStart) {
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.marginTop = 130 * MemoryMatch.stageScaleFactor;
        this.marginLeft = 80 * MemoryMatch.stageScaleFactor;
        this.backgroundWidth = this.parentDisplayObject.canvas.width;
        this.backgroundHeight = this.parentDisplayObject.canvas.height;
        this.setupTitleText(this.groupDisplayObject);
        this.setupLevelText(this.groupDisplayObject);
        this.setupButtons();
        this.groupDisplayObject.setTransform((this.parentDisplayObject.canvas.width * 0.5) - (this.backgroundWidth * 0.5), (this.parentDisplayObject.canvas.height * 0.5) - (this.backgroundHeight * 0.5), 1, 1);
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
        if (this.stateCompleteCallback != null) {
            // stateCompleteCallback();
        }
    },

    close: function () {
        if (MemoryMatch.LevelIntroduction.isShowing()) {
            MemoryMatch.LevelIntroduction.killScreen();
        }
    },

    onContinue: function (gameNumber) {
        // begin animation, then wait for user event to end this state and alert callback
        createjs.Sound.play("soundTap");
        if (MemoryMatch.LevelIntroduction.stateCompleteCallback != null) {
            MemoryMatch.LevelIntroduction.stateCompleteCallback(gameNumber);
        }
        MemoryMatch.LevelIntroduction.killScreen();
    },

    onClickChallenge: function (event) {
        // begin animation, then wait for user event to end this state and alert callback
        createjs.Sound.play("soundTap");
        if (MemoryMatch.LevelIntroduction.stateCompleteCallback != null) {
            MemoryMatch.LevelIntroduction.stateCompleteCallback(99);
        }
        MemoryMatch.LevelIntroduction.killScreen();
    },

    showBackgroundImage: function (canvas, groupDisplayObject) {
        // This method will scale the background image to fit the current stage.
        var popupImageAsset = assetLoader.getResult("popup-bg"),
            bgImage = new createjs.Bitmap(popupImageAsset),
            xScale,
            yScale;

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
        groupDisplayObject.addChild(bgImage);
        this.backgroundWidth = popupImageAsset.width * xScale;
        this.backgroundHeight = popupImageAsset.height * yScale;
    },

    setupTitleText: function (groupDisplayObject) {
        // Show the icon representing the level
        var iconScale = 0.6,
            titleTextFontSize = 56,
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames),
            icon = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].icon,
            iconSprite = new createjs.Sprite(spriteData, icon),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, icon);

        iconSprite.setTransform((this.backgroundWidth - (spriteSize.width * iconScale)) * 0.5, (this.marginTop - (spriteSize.height * iconScale)) * 0.5, iconScale, iconScale);
        iconSprite.framerate = 1;
        iconSprite.name = "icon";
        groupDisplayObject.addChild(iconSprite);

        var titleTextField = new createjs.Text(this.gameData.levelName, MemoryMatch.getScaledFontSize(titleTextFontSize) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        groupDisplayObject.addChild(titleTextField);
        this.titleFontHeight = titleTextField.y + (titleTextFontSize * MemoryMatch.stageScaleFactor);
    },

    setupLevelText: function (groupDisplayObject) {
        var fontHeight = 40 * MemoryMatch.stageScaleFactor,
            levelTextField = new createjs.Text(this.gameData.levelIntro, MemoryMatch.getScaledFontSize(48) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);

        levelTextField.textAlign = "left";
        levelTextField.x = this.marginLeft * 2;
        levelTextField.y = this.titleFontHeight * 1.1;
        levelTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 4);
        levelTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 3);
        levelTextField.lineHeight = fontHeight;
        groupDisplayObject.addChild(levelTextField);
    },

    setupButtons: function () {
        // Use this function to create and initialize all the buttons for this screen

        var spriteFrame = "levelUnlockedUp",
            buttonScale = 1.0,
            buttonWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[spriteFrame][0]][2] * buttonScale,
            buttonHeight = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[spriteFrame][0]][3] * buttonScale,
            numberOfButtons = this.levelData.gameCount,
            gameButton,
            i,
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(MemoryMatch.gameLevel, "levelScoreCollection"),
            gameScoreData,
            gameNumber,
            gamesUnlocked = gameScoresCollection.length,
            wasPlayed = false,
            totalGamesPlayed = 0,
            isLocked = true,
            starsEarned = 0,
            levelStarsEarned = 0,
            bestScore = 0,
            buttonMargin = 0, // 8 * MemoryMatch.stageScaleFactor;
            totalWidth = (3 * (buttonWidth + buttonMargin)) - buttonMargin,
            totalHeight = (2 * (buttonHeight + buttonMargin)) - buttonMargin,
            xOffset = (this.backgroundWidth - totalWidth) * 0.5,
            yOffset = (this.backgroundHeight - totalHeight) * 0.5;

        for (i = 0; i < numberOfButtons; i ++) {
            if (i % 3 == 0) {
                xOffset = (this.backgroundWidth - totalWidth) * 0.5;
            } else {
                xOffset += buttonWidth + buttonMargin;
            }
            gameNumber = i + 1;
            gameScoreData = MemoryMatch.getPriorScoreDataForGameNumber(gameNumber, gameScoresCollection);
            if (gameScoreData != null && gameScoreData.playCount > 0) {
                wasPlayed = true;
                totalGamesPlayed ++;
                isLocked = false;
                bestScore = gameScoreData.bestScore;
                starsEarned = gameScoreData.starsEarned;
                levelStarsEarned += starsEarned;
            } else if (gameNumber == gamesUnlocked) {
                wasPlayed = false;
                isLocked = false;
                bestScore = 0;
                starsEarned = 0;
            } else {
                wasPlayed = false;
                isLocked = true;
                bestScore = 0;
                starsEarned = 0;
            }
            gameButton = MemoryMatch.LevelButton({gameNumber: gameNumber, starsEarned: starsEarned, bestScore: bestScore, wasPlayed: wasPlayed, isLocked: isLocked, scale: buttonScale, callback:this.onContinue});
            gameButton.x = xOffset;
            gameButton.y = yOffset;
            gameButton.name = "game" + gameNumber.toString();
            this.groupDisplayObject.addChild(gameButton);
            if ((i + 1) % 3 == 0) {
                yOffset += buttonHeight + buttonMargin;
            }
        }
        xOffset = (this.backgroundWidth - totalWidth) * 0.5;
        this.createChallengeButton(xOffset, yOffset);
    },

    createChallengeButton: function (xOffset, yOffset) {
        var newButtonInstance,
            buttonScale = 1.0,
            isLocked = ! MemoryMatch.isChallengeGameUnlocked(MemoryMatch.gameLevel),
            spriteFrame = "challengeModeLockUp",
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames),
            gameButton = new createjs.Sprite(spriteData, spriteFrame);

        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        gameButton.framerate = 1;
        gameButton.gameNumber = 99;
        gameButton.isLocked = isLocked;
        gameButton.name = "challengebutton";

        if (isLocked) {
            newButtonInstance = new createjs.ButtonHelper(gameButton, "challengeModeLockUp", "challengeModeLockUp", "challengeModeLockUp", false);
        } else {
            newButtonInstance = new createjs.ButtonHelper(gameButton, "challengeModeUp", "challengeModeOver", "challengeModeDown", false);
            gameButton.addEventListener("click", this.onClickChallenge);
        }
        this.groupDisplayObject.addChild(gameButton);
        this.buttonHelperInstances.push(newButtonInstance);
    },

    refreshButtons: function () {
        // Use this function when the buttons already exist but we should refresh their state

        var numberOfButtons = this.levelData.gameCount,
            gameButton,
            i,
            gameNumber;

        for (i = 0; i < numberOfButtons; i ++) {
            gameNumber = i + 1;
            gameButton = this.groupDisplayObject.getChildByName("game" + gameNumber.toString());
            if (gameButton != null) {
                gameButton.kill();
                this.groupDisplayObject.removeChild(gameButton);
            }
        }
        gameButton = this.groupDisplayObject.getChildByName("challengebutton");
        if (gameButton != null) {
            gameButton.removeEventListener("click", this.onClickChallenge);
            this.groupDisplayObject.removeChild(gameButton);
        }
        this.setupButtons();
        this.groupDisplayObject.updateCache();
    },

    isShowing: function () {
        return this.groupDisplayObject != null && this.groupDisplayObject.visible;
    },

    killScreen: function () {
        // remove all display objects and object references.
        var numberOfButtons = this.levelData.gameCount,
            gameNumber,
            gameButton,
            i;

        for (i = 0; i < numberOfButtons; i ++) {
            gameNumber = i + 1;
            gameButton = this.groupDisplayObject.getChildByName("game" + gameNumber.toString());
            if (gameButton != null) {
                gameButton.kill();
            }
        }
        this.buttonHelperInstances = null;
        if (this.groupDisplayObject != null) {
            this.parentDisplayObject.removeChild(this.groupDisplayObject);
        }
        this.stateCompleteCallback = null;
        this.levelData = null;
        this.gameData = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
