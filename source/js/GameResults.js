/**
 * GameResults.js
 *
 * Show the results screen, either for a game or for the end of a level.
 * Waits for the user to indicate they are ready to move on then stateCompleteCallback is called.
 *
 */

MemoryMatch.GameResults = {
    stateCompleteCallback: null,
    levelData: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonInstances: null,
    spriteData: null,
    gemSprite: null,
    gemSpriteFinalPosition: null,
    matchBonusText: null,
    comboBonusText: null,
    currentScoreTextField: null,
    bestScoreTextField: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    marginTop: 0,
    marginLeft: 0,
    totalGameTime: 0,
    timeBonus: 0,
    movesRemainingBonus: 0,
    comboBonus: 0,
    achievementBonus: 0,
    totalMatches: 0,
    totalMisses: 0,
    totalCombos: 0,
    totalMoves: 0,
    unusedMoves: 0,
    accuracy: 0,
    playerScore: 0,
    playerBestScore: 0,
    gameStarsEarned: 0,
    isChallenge: false,
    isEnabled: false,
    lineHeight: 0,
    priorGameData: null,
    gameNumber: 0,
    streakCount: 0,
    starHalfWidth: 0,
    holdThirdStar: null,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,
    refreshTimerId: null,


    setup: function (displayObject, nextLevelData, stateCompleteCallbackFunction) {
        var winOrLose,
            displayGameNumber,
            eventDataValue;

        if (this.levelData !== null) {
            return;
        }
        // use the level data to do any level-specific results
        this.spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
        this.levelData = nextLevelData;
        this.gameNumber = MemoryMatch.isChallengeGame ? 99 : MemoryMatch.gameNumber;
        this.streakCount = MemoryMatch.gameNumber - 1;
        this.priorGameData = MemoryMatch.getPriorScoreDataForGameNumber(this.gameNumber, null);
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.playerScore = MemoryMatch.gameScore;
        this.totalCombos = MemoryMatch.numberOfCombos;
        this.unusedMoves = MemoryMatch.moveCountDown;
        this.totalMoves = MemoryMatch.levelTolerance - MemoryMatch.moveCountDown;
        this.totalMatches = MemoryMatch.matchCount;
        this.totalMisses = MemoryMatch.missCount;
        this.totalGameTime = MemoryMatch.gameEndTime - MemoryMatch.gameStartTime;
        this.timeBonus = MemoryMatch.calculateTimeBonus();
        this.movesRemainingBonus = MemoryMatch.calculateUnusedMovesBonus();
        this.comboBonus = MemoryMatch.calculateComboBonus();
        this.achievementBonus = MemoryMatch.calculateAchievementBonus();
        this.totalGameTime = MemoryMatch.formatTimeAsString(this.totalGameTime, false, false);
        this.accuracy = MemoryMatch.calculateLevelAccuracy();
        this.gameStarsEarned = MemoryMatch.starsEarnedInCurrentGame();

        this.buttonInstances = [];
        this.playerBestScore = MemoryMatch.priorBestGameScore;
        if (MemoryMatch.levelComplete) {
            winOrLose = "win";
        } else {
            winOrLose = "lose";
        }
        if (MemoryMatch.isChallengeGame) {
            displayGameNumber = MemoryMatch.gameLevel * 100;
            eventDataValue = this.streakCount;
        } else {
            displayGameNumber = MemoryMatch.gameNumber + MemoryMatch.getGameLevelNumberOffset(MemoryMatch.gameLevel);
            eventDataValue = this.totalMisses;
        }
        this.isEnabled = false;
        enginesisSession.gameTrackingRecord('level', winOrLose, 'Level ' + displayGameNumber.toString(), eventDataValue, null);
    },

    buildScreen: function (autoStart) {
        var hiFiveWord;

        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.setColorFilters();
        this.showBackgroundImage(this.parentDisplayObject.canvas);
        this.marginTop = this.backgroundHeight * 0.06;
        this.marginLeft = this.backgroundWidth * 0.09;
        this.setupTitleText(this.groupDisplayObject);
        if (MemoryMatch.isChallengeGame) {
            this.setupAward(this.groupDisplayObject);

            hiFiveWord = MemoryMatch.hiFiveEarnedInCurrentGame();
            if (hiFiveWord != null && hiFiveWord.length > 0) {
                MemoryMatch.showMessageBalloon(null, hiFiveWord + '!', 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.2);
            }
        } else {
            this.setupStars(this.groupDisplayObject);
        }
        this.setupTipText(this.groupDisplayObject);
        this.setupLevelText(this.groupDisplayObject);
        this.setupButtons(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 0, 0, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
        this.groupDisplayObject.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
        if (autoStart === null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // begin animation, then wait for user event to end this state and alert callback
        var playThisMusic,
            duration = 0.3, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationPhaseTwo.bind(this));

        animator.endYScale = animator.endXScale = 1.08;
        animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        if (MemoryMatch.levelComplete) {
            playThisMusic = "soundWin";
        } else {
            playThisMusic = "soundLose";
        }
        MemoryMatch.playInterstitialMusic(playThisMusic, false);
    },

    startAnimationPhaseTwo: function (sprite) {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationComplete.bind(this));

        animator.endYScale = animator.endXScale = 1.0;
        animator.vYScale = animator.vXScale = -1 * (animator.endXScale / (duration * MemoryMatch.fps));
    },

    startAnimationComplete: function (sprite) {
        if (MemoryMatch.isChallengeGame) {
            this.isEnabled = true;
            this.flashNextButton();
        }
        if (this.stateCompleteCallback !== null) {
            // stateCompleteCallback();
        }
    },

    closeStartAnimation: function () {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeShrink.bind(this));

        animator.endYScale = animator.endXScale = 1.08;
        animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        MemoryMatch.stopInterstitialMusic();
    },

    closeShrink: function () {
        var duration = 0.3, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeComplete.bind(this));

        animator.endYScale = animator.endXScale = 0;
        animator.vYScale = animator.vXScale = (-1 * this.groupDisplayObject.scaleX) / (duration * MemoryMatch.fps);
    },

    closeComplete: function () {
        if (this.stateCompleteCallback !== null) {
            this.stateCompleteCallback(this.closeEventType);
        }
        this.killScreen();
    },

    close: function () {
        MemoryMatch.GameResults.isEnabled = false;
        if (MemoryMatch.GameResults.isShowing()) {
            MemoryMatch.GameResults.closeStartAnimation();
        }
    },

    onClickNext: function (event) {
        // begin animation, then wait for user event to end this state and alert callback
        if (MemoryMatch.GameResults.isEnabled) {
            MemoryMatch.GameResults.closeEventType = "next";
            MemoryMatch.GameResults.close();
        }
    },

    onClickReplay: function (event) {
        // begin animation, then wait for user event to end this state and alert callback
        if (MemoryMatch.GameResults.isEnabled) {
            MemoryMatch.GameResults.closeEventType = "replay";
            MemoryMatch.GameResults.close();
        }
    },

    onClickHome: function (event) {
        // begin animation, then wait for user event to end this state and alert callback
        if (MemoryMatch.GameResults.isEnabled) {
            MemoryMatch.GameResults.closeEventType = "home";
            MemoryMatch.GameResults.close();
        }
    },

    refreshCache: function () {
        this.groupDisplayObject.updateCache();
    },

    flashNextButton: function () {
        if (this.buttonInstances.length > 2) {
            this.buttonInstances[2].setFlashing(true);
            this.startRefreshInterval();
        }
    },

    showBackgroundImage: function (canvas) {
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
        this.groupDisplayObject.addChild(bgImage);
        this.backgroundWidth = popupImageAsset.width * xScale;
        this.backgroundHeight = popupImageAsset.height * yScale;
        if (this.primaryColorFilter != null) {
            bgImage.filters = [this.primaryColorFilter];
            bgImage.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
        }
    },

    setupStars: function (groupDisplayObject) {
        var i,
            starFrame = "gameOverStarFill",
            starWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[starFrame][0]][2],
            starHeight = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[starFrame][0]][3],
            slotFrame = "gameOverStarEmpty",
            slotWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[slotFrame][0]][2],
            slotHeight = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[slotFrame][0]][3],
            starSprite,
            starSpriteCloned,
            slotSprite,
            slotSpriteCloned,
            starGap = 36 * MemoryMatch.stageScaleFactor,
            topMargin = Math.floor(this.backgroundHeight * 0.12),
            starsTotalWidth = (3 * (slotWidth + starGap)) - starGap,
            startX = Math.floor((this.backgroundWidth - starsTotalWidth) * 0.5),
            animator,
            starAnimationDelay = 800;

        if (this.gameStarsEarned === 3) { // we hold back the 3rd star for extra affect
            this.holdThirdStar = true;
        } else {
            this.holdThirdStar = null;
        }
        for (i = 0; i < MemoryMatch.GameSetup.numberOfStars; i ++) {
            if (i === 0) {
                starSprite = new createjs.Sprite(this.spriteData, starFrame);
                slotSprite = new createjs.Sprite(this.spriteData, slotFrame);
                starSprite.framerate = 1;
                slotSprite.framerate = 1;
                starSprite.visible = false;
                slotSprite.visible = true;
                starSpriteCloned = starSprite;
                slotSpriteCloned = slotSprite;
            } else {
                starSpriteCloned = starSprite.clone();
                slotSpriteCloned = slotSprite.clone();
            }
            slotSpriteCloned.setTransform(startX, topMargin);
            groupDisplayObject.addChild(slotSpriteCloned);
            if (i < this.gameStarsEarned) {
                starSpriteCloned.setTransform(startX + (slotWidth - starWidth) - 1, topMargin + (slotHeight - starHeight) - 1);
                starSpriteCloned.visible = false;
                starSpriteCloned.starNumber = i + 1;
                groupDisplayObject.addChild(starSpriteCloned);
                if (i === 2 && this.holdThirdStar) {
                    this.holdThirdStar = starSpriteCloned;
                } else {
                    animator = MemoryMatch.AnimationHandler.addToAnimationQueue(starSpriteCloned, starAnimationDelay + (500 * i), 0, false, null, this.showStar.bind(this));
                    animator.showAtBegin = true;
                }
            }
            startX += slotWidth + starGap;
        }
    },

    showStar: function (starSprite) {
        var numberOfParticles,
            hiFiveWord,
            starFrame = "gameOverStarFill",
            starHalfWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[starFrame][0]][2] * 0.5,
            globalStarPoint = this.groupDisplayObject.localToGlobal(starSprite.x, starSprite.y);

        if (starSprite.starNumber < 3) {
            numberOfParticles = Math.random() * 100 + 30;
        } else {
            numberOfParticles = Math.random() * 120 + 50;
            hiFiveWord = MemoryMatch.hiFiveEarnedInCurrentGame();
            if (hiFiveWord != null && hiFiveWord.length > 0) {
                MemoryMatch.showMessageBalloon(null, hiFiveWord + '!', 0, starSprite.x, starSprite.y);
            }
        }
        MemoryMatch.AnimationHandler.startSplatterParticles(numberOfParticles, globalStarPoint.x + starHalfWidth, globalStarPoint.y + starHalfWidth);
        this.groupDisplayObject.updateCache();
        MemoryMatch.triggerSoundFx("soundBump");
        if (MemoryMatch.isChallengeGame) {
            this.isEnabled = true;
            this.flashNextButton();
        }
    },

    showThirdStar: function (delay) {
        var animator;

        if (this.holdThirdStar !== null) {
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.holdThirdStar, delay, 0, false, null, this.showStar.bind(this));
            animator.showAtBegin = true;
            this.holdThirdStar = null;
            MemoryMatch.triggerSoundFx("soundBonus", {delay: delay});
        }
    },

    setupAward: function (groupDisplayObject) {

        // Show Award instead of stars

        var spriteFrame = 'mapTrophy',
            spriteFrames = MemoryMatch.GameSetup.mapSpritesheetFrames,
            spriteData = new createjs.SpriteSheet(spriteFrames),
            imageSprite = new createjs.Sprite(spriteData, spriteFrame),
            spriteSize = MemoryMatch.getSpriteFrameSize(spriteFrames, spriteFrame),
            position,
            i,
            gemPosition,
            gemName,
            landNumber,
            numberOfLevels = MemoryMatch.GameSetup.levels.length;

        position = {x: this.backgroundWidth * 0.5, y: this.backgroundHeight * 0.22};
        imageSprite.setTransform(position.x, position.y, 0.5, 0.5, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
        imageSprite.framerate = 0;
        this.groupDisplayObject.addChild(imageSprite);

        // position gems relative to award position, accounting for the center registration of the award sprite
        spriteFrame = 'mapAwardLand';
        position.x -= spriteSize.width * 0.25;
        position.y -= spriteSize.height * 0.25;
        for (i = 0; i < numberOfLevels; i ++) {
            landNumber = i + 1;
            gemName = spriteFrame + landNumber.toString();
            imageSprite = new createjs.Sprite(spriteData, gemName);
            gemPosition = MemoryMatch.GameSetup.levels[i].gemPosition;
            imageSprite.setTransform(position.x + (gemPosition.x * 0.5 * MemoryMatch.stageScaleFactor), position.y + (gemPosition.y * 0.5 * MemoryMatch.stageScaleFactor), 0.5, 0.5);
            imageSprite.name = gemName;
            imageSprite.visible = MemoryMatch.didUserBeatChallenge(landNumber);
            this.groupDisplayObject.addChild(imageSprite);
            if (MemoryMatch.levelComplete && imageSprite.visible && landNumber == MemoryMatch.gameLevel) {
                spriteSize = MemoryMatch.getSpriteFrameSize(spriteFrames, gemName);
                this.gemSprite = imageSprite.clone();
                this.gemSprite.width = spriteSize.width;
                this.gemSprite.height = spriteSize.height;
                this.gemSpriteFinalPosition = {x: imageSprite.x + spriteSize.width * 0.5, y: imageSprite.y + spriteSize.height * 0.5};
                this.animateGemToAward();
            }
        }
    },

    setupTitleText: function (groupDisplayObject) {

        // Show the icon representing the level and the popup title

        var titleTextField,
            levelSummary,
            iconScale = 1,
            icon = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].iconPopup,
            iconSprite = new createjs.Sprite(this.spriteData, icon),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, icon);

        iconSprite.setTransform(this.marginLeft - (spriteSize.width * 0.25), this.marginTop - (spriteSize.height * 0.25), iconScale, iconScale);
        iconSprite.framerate = 1;
        iconSprite.name = "icon";
        groupDisplayObject.addChild(iconSprite);

        if (MemoryMatch.isChallengeGame) {
            if (MemoryMatch.levelComplete) {
                levelSummary = "Challenge Complete!";
                if (MemoryMatch.gameLevel < MemoryMatch.GameSetup.levels.length) {
                    levelSummary += " Play On!";
                }
            } else {
                levelSummary = "Challenge Failed! Try Again?";
            }
        } else if (MemoryMatch.levelComplete) {
            levelSummary = "Level " + (MemoryMatch.gameNumber + MemoryMatch.getGameLevelNumberOffset(MemoryMatch.gameLevel)).toString() + " Complete! Play On!";
        } else {
            levelSummary = "Out of Moves! Try Again?";
        }
        titleTextField = new createjs.Text(levelSummary, MemoryMatch.getScaledFontSize(58) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        groupDisplayObject.addChild(titleTextField);
    },

    setupTipText: function (groupDisplayObject) {
        var tipTextField,
            tipText = this.getRandomTip(MemoryMatch.levelComplete);

        tipTextField = new createjs.Text(tipText, MemoryMatch.getScaledFontSize(48) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        tipTextField.textAlign = "center";
        tipTextField.x = this.backgroundWidth * 0.5;
        tipTextField.y = this.backgroundHeight * 0.32;
        tipTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        tipTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        tipTextField.lineHeight = tipTextField.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(tipTextField);
    },

    addTextBackgroundSprite: function (groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX) {
        var textBackgroundSprite = textBackgroundSpriteSource.clone(),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, 'gameOverInfoBoxSmall');
        textBackgroundSprite.x = rightX - spriteSize.width;
        textBackgroundSprite.y = levelTextField.y - (spriteSize.height * 0.5);
        groupDisplayObject.addChild(textBackgroundSprite);
    },

    setupLevelText: function (groupDisplayObject) {
        // Room for 4 lines of text at 28 px line height
        var leftX = this.backgroundWidth * 0.12,
            rightX = this.backgroundWidth * 0.44,
            fieldWidth = this.backgroundWidth * 0.2,
            levelTextField,
            Y,
            animator,
            accuracy,
            starAnimationDelay = 1000,
            fieldOffset = 0,
            fontSize = MemoryMatch.getScaledFontSize(48) + " " + MemoryMatch.GameSetup.guiMediumFontName,
            fontSizeBold = MemoryMatch.getScaledFontSize(52) + " " + MemoryMatch.GameSetup.guiBoldFontName,
            fontSizeBoldBig = MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName,
            fontSizeBestScore,
            fontColor = MemoryMatch.GameSetup.guiFontColor,
            fontColorBonus = MemoryMatch.GameSetup.guiFontColorBonus,
            fontSizeDifference,
            textBackgroundSpriteSource;

        textBackgroundSpriteSource = new createjs.Sprite(this.spriteData, 'gameOverInfoBoxSmall');
        textBackgroundSpriteSource.alpha = 0.1;
        this.lineHeight = 96 * MemoryMatch.stageScaleFactor;
        if ( ! MemoryMatch.isChallengeGame) {
            Y = Math.floor(this.backgroundHeight * 0.5);

            // 1: Misses
            levelTextField = new createjs.Text("Misses:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.textBaseline = "middle";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.03);
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(this.totalMisses.toString(), fontSizeBold, fontColor);
            levelTextField.textAlign = "right";
            levelTextField.textBaseline = "middle";
            levelTextField.x = rightX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            levelTextField.visible = false;
            groupDisplayObject.addChild(levelTextField);
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(levelTextField, starAnimationDelay + (500 * fieldOffset), 0, false, null, this.animateTextMisses.bind(this));
            animator.showAtBegin = true;
            if (this.movesRemainingBonus > 0) {
                this.matchBonusText = new createjs.Text("+ " + this.movesRemainingBonus.toString(), fontSizeBold, fontColorBonus);
                this.matchBonusText.textAlign = "left";
                this.matchBonusText.x = rightX;
                this.matchBonusText.y = Y;
                this.matchBonusText.maxWidth = fieldWidth;
                this.matchBonusText.visible = false;
                groupDisplayObject.addChild(this.matchBonusText);
                animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.matchBonusText, starAnimationDelay + (750 * fieldOffset), 0, false, null, null);
                animator.showAtBegin = true;
                animator.vAlpha = -0.05;
                animator.vY = -1.5;
                animator.vXscale = 0.1;
                animator.vYscale = 0.1;
                animator.tickFunction = this.animateBonusTick.bind(this);
            }
            fieldOffset ++;

            // 2: Accuracy
            Y += this.lineHeight;
            accuracy = this.accuracy > 0 ? this.accuracy.toString() + "%" : '--';
            levelTextField = new createjs.Text("Accuracy:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.textBaseline = "middle";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.03);
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(accuracy, fontSizeBold, fontColor);
            levelTextField.textAlign = "right";
            levelTextField.textBaseline = "middle";
            levelTextField.x = rightX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            levelTextField.visible = false;
            groupDisplayObject.addChild(levelTextField);
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(levelTextField, starAnimationDelay + (500 * fieldOffset), 0, false, null, this.animateText.bind(this));
            animator.showAtBegin = true;
            fieldOffset ++;

            if (MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.CHAINS) {
                // Combo bonus
                Y += this.lineHeight;
                levelTextField = new createjs.Text("Combos:", fontSize, fontColor);
                levelTextField.textAlign = "left";
                levelTextField.textBaseline = "middle";
                levelTextField.x = leftX;
                levelTextField.y = Y;
                levelTextField.maxWidth = fieldWidth;
                this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.03);
                groupDisplayObject.addChild(levelTextField);

                levelTextField = new createjs.Text(this.totalCombos.toString(), fontSizeBold, fontColor);
                levelTextField.textAlign = "right";
                levelTextField.textBaseline = "middle";
                levelTextField.x = rightX;
                levelTextField.y = Y;
                levelTextField.maxWidth = fieldWidth;
                levelTextField.visible = false;
                groupDisplayObject.addChild(levelTextField);
                animator = MemoryMatch.AnimationHandler.addToAnimationQueue(levelTextField, starAnimationDelay + (500 * fieldOffset), 0, false, null, this.animateTextComboBonus.bind(this));
                animator.showAtBegin = true;
                this.matchBonusText = null;
                if (this.comboBonus > 0) {
                    this.comboBonusText = new createjs.Text("+ " + this.comboBonus.toString(), fontSizeBold, fontColorBonus);
                    this.comboBonusText.textAlign = "left";
                    this.comboBonusText.x = rightX;
                    this.comboBonusText.y = Y;
                    this.comboBonusText.maxWidth = fieldWidth;
                    this.comboBonusText.visible = false;
                    groupDisplayObject.addChild(this.comboBonusText);
                    animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.comboBonusText, starAnimationDelay + (500 * fieldOffset), 0, false, null, null);
                    animator.showAtBegin = true;
                    animator.vAlpha = -0.05;
                    animator.vY = -1.5;
                    animator.vXscale = 0.1;
                    animator.vYscale = 0.1;
                    animator.tickFunction = this.animateBonusTick.bind(this);
                }
                fieldOffset ++;
            }

            // Second Column
            leftX = this.backgroundWidth * 0.56;
            rightX = this.backgroundWidth * 0.88;
            Y = Math.floor(this.backgroundHeight * 0.5);

            // Time Bonus
            levelTextField = new createjs.Text("Time Bonus:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.textBaseline = "middle";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.02);
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(MemoryMatch.formatNumberWithGroups(this.timeBonus), fontSizeBold, fontColor);
            levelTextField.textAlign = "right";
            levelTextField.textBaseline = "middle";
            levelTextField.x = rightX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            levelTextField.visible = false;
            groupDisplayObject.addChild(levelTextField);
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(levelTextField, starAnimationDelay + (500 * fieldOffset), 0, false, null, this.animateTextTimeBonus.bind(this));
            animator.showAtBegin = true;

            Y += this.lineHeight;
        } else {
            // Centered
            Y = Math.floor(this.backgroundHeight * 0.52);
            leftX = this.backgroundWidth * 0.38;
            rightX = this.backgroundWidth * 0.68;

            // 1: Streak
            levelTextField = new createjs.Text("Streak:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.textBaseline = "middle";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.02);
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(this.streakCount.toString(), this.streakCount < 5 ? fontSizeBold : fontSizeBoldBig, fontColor);
            levelTextField.textAlign = "right";
            levelTextField.textBaseline = "middle";
            levelTextField.x = rightX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            groupDisplayObject.addChild(levelTextField);

            Y += this.lineHeight;
        }

        // Score
        if (this.playerScore >= this.playerBestScore) {
            fontSizeBestScore = fontSizeBoldBig;
        } else {
            fontSizeBestScore = fontSizeBold;
        }
        levelTextField = new createjs.Text("Score:", fontSize, fontColor);
        levelTextField.textAlign = "left";
        levelTextField.textBaseline = "middle";
        levelTextField.x = leftX;
        levelTextField.y = Y;
        levelTextField.maxWidth = fieldWidth;
        this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.02);
        groupDisplayObject.addChild(levelTextField);

        levelTextField = new createjs.Text(MemoryMatch.formatNumberWithGroups(this.playerScore), fontSizeBestScore, fontColor);
        levelTextField.textAlign = "right";
        levelTextField.textBaseline = "middle";
        levelTextField.x = rightX;
        levelTextField.y = Y;
        levelTextField.maxWidth = fieldWidth;
        levelTextField.name = 'playerscore';
        groupDisplayObject.addChild(levelTextField);
        this.currentScoreTextField = levelTextField;

        // Best Score
        Y += this.lineHeight;
        if (this.playerScore >= this.playerBestScore) {
            fontSizeBestScore = fontSizeBold;
            fontSizeDifference = 0;
            if (this.playerBestScore == 0) {
                this.playerBestScore = this.playerScore;
            }
        } else {
            fontSizeBestScore = fontSizeBoldBig;
            fontSizeDifference = 10 * MemoryMatch.stageScaleFactor;
        }
        levelTextField = new createjs.Text("Best:", fontSize, fontColor);
        levelTextField.textAlign = "left";
        levelTextField.textBaseline = "middle";
        levelTextField.x = leftX;
        levelTextField.y = Y;
        levelTextField.maxWidth = fieldWidth;
        this.addTextBackgroundSprite(groupDisplayObject, textBackgroundSpriteSource, levelTextField, rightX * 1.02);
        groupDisplayObject.addChild(levelTextField);

        levelTextField = new createjs.Text(MemoryMatch.formatNumberWithGroups(this.playerBestScore), fontSizeBestScore, fontColor);
        levelTextField.textAlign = "right";
        levelTextField.textBaseline = "middle";
        levelTextField.x = rightX;
        levelTextField.y = Y;
        levelTextField.maxWidth = fieldWidth;
        levelTextField.name = 'bestscore';
        groupDisplayObject.addChild(levelTextField);
        this.bestScoreTextField = levelTextField;
        if (MemoryMatch.isChallengeGame) {
            window.setTimeout(this.showBestScoreBurstIfBeatBestScore.bind(this), 500);
        }
    },

    animateText: function (textSprite) {
        if (this.groupDisplayObject != null) {
            this.groupDisplayObject.updateCache();
            return true;
        } else {
            return false;
        }
    },

    animateTextMisses: function (textSprite) {
        this.playerScore += this.movesRemainingBonus;
        if (this.currentScoreTextField !== null) {
            this.currentScoreTextField.text = MemoryMatch.formatNumberWithGroups(this.playerScore);
        }
        this.groupDisplayObject.updateCache();
    },

    animateTextComboBonus: function (textSprite) {
        this.playerScore += this.comboBonus;
        if (this.currentScoreTextField !== null) {
            this.currentScoreTextField.text = MemoryMatch.formatNumberWithGroups(this.playerScore);
        }
        this.groupDisplayObject.updateCache();
    },

    animateTextTimeBonus: function (textSprite) {

        // This is the final animation update, bump the score/best score if player beats best score.

        var scoreFont,
            fontSizeBold = MemoryMatch.getScaledFontSize(52) + " " + MemoryMatch.GameSetup.guiBoldFontName,
            fontSizeBoldBig = MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName;

        this.playerScore += this.timeBonus;
        if (this.playerScore >= this.playerBestScore) {
            scoreFont = fontSizeBoldBig;
        } else {
            scoreFont = fontSizeBold;
        }
        if (this.currentScoreTextField !== null) {
            this.currentScoreTextField.text = MemoryMatch.formatNumberWithGroups(this.playerScore);
            this.currentScoreTextField.font = scoreFont;
        }
        this.showBestScoreBurstIfBeatBestScore();
        this.showThirdStar(250);
        this.isEnabled = true;
        this.flashNextButton();
        this.groupDisplayObject.updateCache();
    },

    animateBonusTick: function (textSprite) {
        this.groupDisplayObject.updateCache();
        return textSprite.actor.alpha > 0;
    },

    showBestScoreBurstIfBeatBestScore: function () {
        // display particle effect if player beat her best score
        var globalTextPoint,
            fontSizeBoldBig = MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName;

        if (this.bestScoreTextField !== null) {
            if (this.playerScore >= this.playerBestScore && this.playerScore != 0) {
                this.playerBestScore = this.playerScore;
                this.bestScoreTextField.text = MemoryMatch.formatNumberWithGroups(this.playerBestScore);
                if (MemoryMatch.levelComplete) {
                    globalTextPoint = this.groupDisplayObject.localToGlobal(this.bestScoreTextField.x, this.bestScoreTextField.y);
                    MemoryMatch.AnimationHandler.startSplatterParticles(Math.random() * 100 + 30, globalTextPoint.x, globalTextPoint.y);
                }
                this.bestScoreTextField.font = fontSizeBoldBig;
                this.groupDisplayObject.updateCache();
            }
        }
    },

    setupButtons: function (groupDisplayObject) {
        // 2 or 3 buttons centered horizontal at bottom of popup

        var spriteFrame = "gameOverButtonBase",
            numberOfButtons = MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN ? 3 : 2,
            buttonScale = 1.0,
            buttonWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[spriteFrame][0]][2] * buttonScale,
            gameButton,
            buttonTagCounter = 0,
            buttonMargin = 0, // 8 * MemoryMatch.stageScaleFactor;
            totalWidth = (numberOfButtons * (buttonWidth + buttonMargin)) - buttonMargin,
            xOffset = (this.backgroundWidth - totalWidth) * 0.5,
            yOffset = this.backgroundHeight * 0.77,
            buttonBaseColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].liteColor,
            buttonRollOverColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].secondaryColor;

        gameButton = MemoryMatch.GUIButton({name: "home", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickHome.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverMenuIcon", iconOver: "gameOverMenuDownIcon", iconDown: "gameOverMenuDownIcon"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        gameButton.refreshParent = this;
        groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        xOffset += buttonWidth + buttonMargin;
        gameButton = MemoryMatch.GUIButton({name: "replay", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickReplay.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverReplayIcon", iconOver: "gameOverReplayDownIcon", iconDown: "gameOverReplayDownIcon"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        gameButton.refreshParent = this;
        groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            xOffset += buttonWidth + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "continue", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickNext.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverNextIcon", iconOver: "gameOverNextDownIcon", iconDown: "gameOverNextDownIcon"});
            gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
            gameButton.refreshParent = this;
            groupDisplayObject.addChild(gameButton);
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

    getRandomTip: function (forTheWin) {
        var tipIndex = MemoryMatch.gameLevel - 1,
            tipsArray = MemoryMatch.GameSetup.tips[tipIndex],
            tipsArrayLength = tipsArray.length,
            tipStartIndex = MemoryMatch.getRandomNumberBetween(0, tipsArrayLength - 1),
            tipIndex = tipStartIndex,
            tip,
            matched = false;

        while ( ! matched) {
            if ((forTheWin && tipsArray[tipIndex].category == 'win') || (! forTheWin && tipsArray[tipIndex].category != 'win')) {
                matched = true;
            } else {
                tipIndex ++;
                if (tipIndex == tipStartIndex) {
                    matched = true; // we scanned the entire array and didn't find a match, just use whatever we got
                } else if (tipIndex == tipsArrayLength) {
                    tipIndex = 0;
                }
            }
        }
        tip = tipsArray[tipIndex].text;
        return tip;
    },

    startRefreshInterval: function () {
        this.refreshTimerId = window.setTimeout(this.refreshInterval.bind(this), 500);
    },

    refreshInterval: function () {
        this.refreshCache();
        this.startRefreshInterval();
    },

    animateGemToAward: function () {
        // gem animation:
        // 1. gem sprite starts centered in popup very large scale
        // 2. gem scales to size and position moves to award
        // 3. done, cleanup

        var animator,
            startAlpha = 0.4,
            startScale = 14,
            endScale = 0.75,
            duration = 0.8,
            steps;

        if (this.gemSprite != null) {
            this.gemSprite.setTransform(this.backgroundWidth * 0.5, this.backgroundHeight * 0.5, startScale, startScale, 0, 0, 0, this.gemSprite.width * 0.5, this.gemSprite.height * 0.5);
            this.gemSprite.alpha = startAlpha;
            this.groupDisplayObject.addChild(this.gemSprite);
            steps = MemoryMatch.fps * duration;
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.gemSprite, 300, 0, false, null, this.gemAnimationComplete.bind(this));
            animator.vX = (this.gemSpriteFinalPosition.x - this.gemSprite.x) / steps;
            animator.endX = this.gemSpriteFinalPosition.x;
            animator.vY = (this.gemSpriteFinalPosition.y - this.gemSprite.y) / steps;
            animator.endY = this.gemSpriteFinalPosition.y;
            animator.vAlpha = (1 - startAlpha) / steps;
            animator.endAlpha = 1;
            animator.vXScale = -1 * (startScale - endScale) / steps;
            animator.endXScale = 0.75;
            animator.vYScale = animator.vXScale;
            animator.endYScale = animator.endXScale;
            animator.tickFunction = this.gemAnimationUpdate.bind(this);
        }
    },

    gemAnimationUpdate: function (animator) {
        var stillAnimating = false,
            endScale = 0.75;

        if (this.groupDisplayObject != null) {
            this.groupDisplayObject.updateCache();
            if (animator.actor.alpha != 1 || animator.actor.scaleX != endScale) {
                stillAnimating = true;
            }
        }
        return stillAnimating;
    },

    gemAnimationComplete: function (actor) {
        var globalCardPoint = this.groupDisplayObject.localToGlobal(this.gemSprite.x, this.gemSprite.y);
        MemoryMatch.AnimationHandler.startSplatterStars(Math.random() * 120 + 100, globalCardPoint.x, globalCardPoint.y);
        MemoryMatch.triggerSoundFx("soundBump");
        this.groupDisplayObject.removeChild(this.gemSprite);
        this.gemSprite = null;
        this.gemSpriteFinalPosition = null;
        this.groupDisplayObject.updateCache();
    },

    killScreen: function () {
        // remove all display objects and object references:
        var i;

        if (this.refreshTimerId != null) {
            window.clearTimeout(this.refreshTimerId);
            this.refreshTimerId = null;
        }
        this.spriteData = null;
        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        if (this.backgroundSoundInstance != null) {
            this.backgroundSoundInstance.stop();
            this.backgroundSoundInstance = null;
        }
        for (i = 0; i < this.buttonInstances.length; i ++) {
            this.buttonInstances[i].kill();
        }
        this.buttonInstances = null;
        this.currentScoreTextField = null;
        this.bestScoreTextField = null;
        this.matchBonusText = null;
        this.comboBonusText = null;
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.stateCompleteCallback = null;
        this.levelData = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
