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
    centerX: 0,
    marginX: 0,
    lineHeight: 0,
    priorGameData: null,
    gameNumber: 0,
    streakCount: 0,
    starHalfWidth: 0,
    holdThirdStar: null,
    backgroundSoundInstance: null,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,


    setup: function (displayObject, nextLevelData, stateCompleteCallbackFunction) {
        var winOrLose,
            displayGameNumber,
            eventDataValue;

        if (this.levelData !== null) {
            return;
        }
        // use the level data to do any level-specific results
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
        MemoryMatch.enginesis.gameTrackingRecord('level', winOrLose, 'Level ' + displayGameNumber.toString(), eventDataValue, null);
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.marginTop = 160 * MemoryMatch.stageScaleFactor;
        this.marginLeft = 160 * MemoryMatch.stageScaleFactor;
        this.groupDisplayObject = new createjs.Container();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.setColorFilters();
        this.showBackgroundImage(this.parentDisplayObject.canvas);
        this.centerX = this.backgroundWidth * 0.5;
        this.marginX = 12 * MemoryMatch.stageScaleFactor;
        this.setupTitleText(this.groupDisplayObject);
        if (MemoryMatch.isChallengeGame) {
            this.setupAward(this.groupDisplayObject);
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
        this.backgroundSoundInstance = createjs.Sound.play(playThisMusic, {delay: 0, loop: 0});
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
            createjs.Sound.play("soundTap");
            MemoryMatch.GameResults.closeEventType = "next";
            MemoryMatch.GameResults.close();
        }
    },

    onClickReplay: function (event) {
        // begin animation, then wait for user event to end this state and alert callback
        if (MemoryMatch.GameResults.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.GameResults.closeEventType = "replay";
            MemoryMatch.GameResults.close();
        }
    },

    onClickHome: function (event) {
        // begin animation, then wait for user event to end this state and alert callback
        if (MemoryMatch.GameResults.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.GameResults.closeEventType = "home";
            MemoryMatch.GameResults.close();
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
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames),
            starFrame = "gameOverStar",
            starWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[starFrame][0]][2],
            starHeight = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[starFrame][0]][3],
            slotFrame = "gameOverStarSlot",
            slotWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[slotFrame][0]][2],
            slotHeight = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[slotFrame][0]][3],
            starSprite,
            starSpriteCloned,
            slotSprite,
            slotSpriteCloned,
            starGap = 40 * MemoryMatch.stageScaleFactor,
            topMargin = Math.floor(this.backgroundHeight * 0.18),
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
                starSprite = new createjs.Sprite(spriteData, starFrame);
                slotSprite = new createjs.Sprite(spriteData, slotFrame);
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
            starFrame = "gameOverStar",
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
        createjs.Sound.play("soundBump");
        if (MemoryMatch.isChallengeGame) {
            this.isEnabled = true;
        }
    },

    showThirdStar: function (delay) {
        var animator;

        if (this.holdThirdStar !== null) {
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.holdThirdStar, delay, 0, false, null, this.showStar.bind(this));
            animator.showAtBegin = true;
            this.holdThirdStar = null;
            createjs.Sound.play("soundBonus", {delay: delay});
        }
    },

    setupAward: function (groupDisplayObject) {
        var spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames),
            slotFrame = "gameOverStarSlot",
            slotWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[slotFrame][0]][2],
            slotSprite,
            hiFiveWord,
            topMargin = Math.floor(this.backgroundHeight * 0.18),
            startX = Math.floor((this.backgroundWidth - slotWidth) * 0.5);

        slotSprite = new createjs.Sprite(spriteData, slotFrame);
        slotSprite.framerate = 1;
        slotSprite.visible = true;
        slotSprite.setTransform(startX, topMargin);
        groupDisplayObject.addChild(slotSprite);
        hiFiveWord = MemoryMatch.hiFiveEarnedInCurrentGame();
        if (hiFiveWord != null && hiFiveWord.length > 0) {
            MemoryMatch.showMessageBalloon(null, hiFiveWord + '!', 0, slotSprite.x, slotSprite.y);
        }

    },

    setupTitleText: function (groupDisplayObject) {

        // Show the icon representing the level and the popup title
        var titleTextField,
            levelSummary,
            iconScale = 1,
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames),
            icon = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].icon,
            iconSprite = new createjs.Sprite(spriteData, icon),
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
        titleTextField.y = this.marginTop - (28 * MemoryMatch.stageScaleFactor) * 0.5;
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
        tipTextField.y = this.backgroundHeight * 0.38;
        tipTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        tipTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        groupDisplayObject.addChild(tipTextField);
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
            fontSizeDifference;

        this.lineHeight = 60 * MemoryMatch.stageScaleFactor;
        if ( ! MemoryMatch.isChallengeGame) {
            Y = Math.floor(this.backgroundHeight * 0.5);

            // 1: Misses
            levelTextField = new createjs.Text("Misses:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(this.totalMisses.toString(), fontSizeBold, fontColor);
            levelTextField.textAlign = "right";
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
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(accuracy, fontSizeBold, fontColor);
            levelTextField.textAlign = "right";
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
                levelTextField.x = leftX;
                levelTextField.y = Y;
                levelTextField.maxWidth = fieldWidth;
                groupDisplayObject.addChild(levelTextField);

                levelTextField = new createjs.Text(this.totalCombos.toString(), fontSizeBold, fontColor);
                levelTextField.textAlign = "right";
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

            // Time Bonus
            Y += this.lineHeight;
            levelTextField = new createjs.Text("Time Bonus:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(MemoryMatch.formatNumber("###,###.", this.timeBonus), fontSizeBold, fontColor);
            levelTextField.textAlign = "right";
            levelTextField.x = rightX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            levelTextField.visible = false;
            groupDisplayObject.addChild(levelTextField);
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(levelTextField, starAnimationDelay + (500 * fieldOffset), 0, false, null, this.animateTextTimeBonus.bind(this));
            animator.showAtBegin = true;

            // Second Column
            leftX = this.backgroundWidth * 0.6;
            rightX = this.backgroundWidth * 0.88;
            Y = Math.floor(this.backgroundHeight * 0.5);
        } else {
            // Centered
            Y = Math.floor(this.backgroundHeight * 0.52);
            leftX = this.backgroundWidth * 0.38;
            rightX = this.backgroundWidth * 0.68;

            // 1: Streak
            levelTextField = new createjs.Text("Streak:", fontSize, fontColor);
            levelTextField.textAlign = "left";
            levelTextField.x = leftX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            groupDisplayObject.addChild(levelTextField);

            levelTextField = new createjs.Text(this.streakCount.toString(), this.streakCount < 5 ? fontSizeBold : fontSizeBoldBig, fontColor);
            levelTextField.textAlign = "right";
            levelTextField.x = rightX;
            levelTextField.y = Y;
            levelTextField.maxWidth = fieldWidth;
            groupDisplayObject.addChild(levelTextField);

            Y += this.lineHeight * 1.5;
        }

        // Score
        this.lineHeight = 72 * MemoryMatch.stageScaleFactor;
        if (this.playerScore >= this.playerBestScore) {
            fontSizeBestScore = fontSizeBoldBig;
        } else {
            fontSizeBestScore = fontSizeBold;
        }
        levelTextField = new createjs.Text("Score:", fontSize, fontColor);
        levelTextField.textAlign = "left";
        levelTextField.x = leftX;
        levelTextField.y = Y;
        levelTextField.maxWidth = fieldWidth;
        groupDisplayObject.addChild(levelTextField);

        levelTextField = new createjs.Text(MemoryMatch.formatNumber("###,###.", this.playerScore), fontSizeBestScore, fontColor);
        levelTextField.textAlign = "right";
        levelTextField.x = rightX;
        levelTextField.y = Y;
        levelTextField.maxWidth = fieldWidth;
        levelTextField.name = 'playerscore';
        groupDisplayObject.addChild(levelTextField);
        this.currentScoreTextField = levelTextField;

        // Best Score
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
        levelTextField.x = leftX;
        levelTextField.y = Y + (this.lineHeight * 1.2);
        levelTextField.maxWidth = fieldWidth;
        groupDisplayObject.addChild(levelTextField);

        levelTextField = new createjs.Text(MemoryMatch.formatNumber("###,###.", this.playerBestScore), fontSizeBestScore, fontColor);
        levelTextField.textAlign = "right";
        levelTextField.x = rightX;
        levelTextField.y = Y + this.lineHeight + fontSizeDifference;
        levelTextField.maxWidth = fieldWidth;
        levelTextField.name = 'bestscore';
        groupDisplayObject.addChild(levelTextField);
        this.bestScoreTextField = levelTextField;
        if (MemoryMatch.isChallengeGame) {
            window.setTimeout(this.showBestScoreBurstIfBeatBestScore.bind(this), 500);
        }
    },

    animateText: function (textSprite) {
        this.groupDisplayObject.updateCache();
    },

    animateTextMisses: function (textSprite) {
        this.playerScore += this.movesRemainingBonus;
        if (this.currentScoreTextField !== null) {
            this.currentScoreTextField.text = MemoryMatch.formatNumber("###,###.", this.playerScore);
        }
        this.groupDisplayObject.updateCache();
    },

    animateTextComboBonus: function (textSprite) {
        this.playerScore += this.comboBonus;
        if (this.currentScoreTextField !== null) {
            this.currentScoreTextField.text = MemoryMatch.formatNumber("###,###.", this.playerScore);
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
            this.currentScoreTextField.text = MemoryMatch.formatNumber("###,###.", this.playerScore);
            this.currentScoreTextField.font = scoreFont;
        }
        this.showBestScoreBurstIfBeatBestScore();
        this.showThirdStar(250);
        this.isEnabled = true;
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
                this.bestScoreTextField.text = MemoryMatch.formatNumber("###,###.", this.playerBestScore);
                globalTextPoint = this.groupDisplayObject.localToGlobal(this.bestScoreTextField.x, this.bestScoreTextField.y);
                MemoryMatch.AnimationHandler.startSplatterParticles(Math.random() * 100 + 30, globalTextPoint.x, globalTextPoint.y);
                this.bestScoreTextField.font = fontSizeBoldBig;
                this.groupDisplayObject.updateCache();
            }
        }
    },

    setupButtons: function (groupDisplayObject) {
        // 3 buttons centered horizontal at bottom of popup

        var spriteFrame = "gameOverButtonBase",
            buttonScale = 1.0,
            buttonWidth = MemoryMatch.GameSetup.guiSpritesheet1Frames.frames[MemoryMatch.GameSetup.guiSpritesheet1Frames.animations[spriteFrame][0]][2] * buttonScale,
            gameButton,
            buttonTagCounter = 0,
            buttonMargin = 0, // 8 * MemoryMatch.stageScaleFactor;
            totalWidth = (3 * (buttonWidth + buttonMargin)) - buttonMargin,
            xOffset = (this.backgroundWidth - totalWidth) * 0.5,
            yOffset = this.backgroundHeight * 0.77,
            buttonBaseColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].liteColor;

        gameButton = MemoryMatch.GUIButton({name: "home", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickHome.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "gameOverHomeUp", iconOver: "gameOverHomeOver", iconDown: "gameOverHomeOver"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        xOffset += buttonWidth + buttonMargin;
        gameButton = MemoryMatch.GUIButton({name: "replay", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickReplay.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsRefreshIcon", iconOver: "optionsRefreshIconOver", iconDown: "optionsRefreshIconOver"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        xOffset += buttonWidth + buttonMargin;
        gameButton = MemoryMatch.GUIButton({name: "continue", tag: ++ buttonTagCounter, disabled: false, callback: this.onClickNext.bind(this), baseUp: "gameOverButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "gameOverNextUp", iconOver: "gameOverNextOver", iconDown: "gameOverNextOver"});
        gameButton.setTransform(xOffset, yOffset, buttonScale, buttonScale);
        groupDisplayObject.addChild(gameButton);
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

    killScreen: function () {
        // remove all display objects and object references:
        var i;

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
