/**
 * GameGUI.js
 *
 * Show the HUD display. This abstracts the game GUI that is displayed and manages any
 * transactions to keep the GUI management and display separate from any game logic.
 *
 * Layout:
 * Score ######### Level ##/##  <* * *> Matches: ## Time: ##:## [O]
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.GameGUI = {
    groupDisplayObject: null,
    parentDisplayObject: null,
    width: 0,
    height: 0,
    hudHeight: 0,
    spriteData: null,
    headerSprite: null,
    levelNumber: 1,
    levelField: null,
    levelIcon: null,
    scoreField: null,
    matchCountLabel: null,
    matchCountField: null,
    gameTimerField: null,
    messageField: null,
    timerCountdownGroup: null,
    timerCountdownTimer: null,
    comboMultiplierSprite: null,
    matchCountFieldFlash: false,
    matchCountFieldFlashCount: 0,
    matchCountFlashTimer: null,
    optionsButton: null,
    gameOptionsButton: null,
    isAnimating: false,
    flashThreshold: 2,
    comboMultiplier: 1,
    timerCountdownStarted: false,
    lastUpdateTime: 0,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,
    showingGameLevel: 0,

    build: function (stage) {
        // layout the display objects assuming parentDisplayObject is valid
        this.parentDisplayObject = stage;
        if (this.parentDisplayObject != null) {
            this.width = MemoryMatch.stageWidth;
            this.height = MemoryMatch.stageHeight;
            this.groupDisplayObject = new createjs.Container();
            this.showingGameLevel = MemoryMatch.gameLevel;
            if (this.spriteData == null) {
                this.spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
            }
            this.setColorFilters();
            this.setupHeader();
            this.setupOptionsButton();
            this.setupGameOptionsButton();
            this.setupScoreTextField();
            this.setupLevelTextField();
            this.setupMatchCountTextField();
            this.setupGameTimerTextField();
            this.setupMessageTextField();
            this.parentDisplayObject.addChild(this.groupDisplayObject);
            this.groupDisplayObject.setTransform(0, this.hudHeight * -1, 1, 1);
        }
    },

    destroy: function () {
        // Kill all events, display objects and remove from stage
        if (this.matchCountFlashTimer != null) {
            window.clearTimeout(this.matchCountFlashTimer);
            this.matchCountFlashTimer = null;
        }
        if (this.timerCountdownTimer != null) {
            window.clearTimeout(this.timerCountdownTimer);
            this.timerCountdownTimer = null;
        }
        this.parentDisplayObject.removeChild(this.optionsButton);
        if (this.timerCountdownGroup != null) {
            this.parentDisplayObject.removeChild(this.timerCountdownGroup);
            this.timerCountdownGroup = null;
        }
        this.spriteData = null;
        this.headerSprite = null;
        this.levelField = null;
        this.levelIcon = null;
        this.scoreField = null;
        this.matchCountLabel = null;
        this.matchCountField = null;
        this.gameTimerField = null;
        this.messageField = null;
        this.optionsButton = null;
        this.gameOptionsButton = null;
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.groupDisplayObject = null;
        this.parentDisplayObject = null;
        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        this.isAnimating = false;
    },

    pause: function (event) {
        // show the paused state
        this.hideTimerCountdown();
    },

    resume: function (event) {
        // undo the paused state and bring the GUI back to normal
    },

    show: function (showFlag) {
        // show or hide the HUD. This triggers the animation so it will take some time before it is in a ready state.
        var finalY,
            guiAnimator,
            duration,
            distance;

        if (this.groupDisplayObject == null) {
            return;
        }
        if (showFlag) {
            if (this.showingGameLevel != MemoryMatch.gameLevel) {
                this.setColorFilters();
                this.showingGameLevel = MemoryMatch.gameLevel
            }
            finalY = 0;
            distance = 0 - this.groupDisplayObject.y;
            this.optionsButton.visible = false;
        } else {
            finalY = this.hudHeight * -1;
            distance = finalY - this.groupDisplayObject.y;
            this.matchCountFieldFlash = false;
            this.comboMultiplierSprite.visible = false;
            this.hideTimerCountdown();
            this.optionsButton.visible = true;
        }
        if (finalY != this.groupDisplayObject.y && ! this.isAnimating) {
            this.messageField.visible = false; // hide message field until animation completes
            this.isAnimating = true;
            duration = 0.2;
            guiAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, 0, false, null, this.showAnimationComplete.bind(this));
            guiAnimator.vY = distance / (duration * MemoryMatch.fps);
            guiAnimator.endY = finalY;
            MemoryMatch.stageUpdated = true;
        }
    },

    showAnimationComplete: function (g) {
        var isShowing = this.groupDisplayObject.y >= 0;
        this.messageField.visible = isShowing; // only show message field if GUI is showing
        this.comboMultiplierSprite.visible = isShowing;
        this.isAnimating = false;
        MemoryMatch.stageUpdated = true;
    },

    setMessage: function (message) {
        this.messageField.text = message;
        MemoryMatch.stageUpdated = true;
    },

    getHeight: function () {
        return this.hudHeight;
    },

    updateLevelDisplay: function (level, gameNumber) {
        // convert level # to icon image
        var displayGameNumber;
        if (level < 1) {
            level = 1;
        } else if (level > MemoryMatch.GameSetup.levels.length) {
            level = MemoryMatch.GameSetup.levels.length;
        }
        if (MemoryMatch.isChallengeGame) {
            displayGameNumber = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].gameCount + 1 + MemoryMatch.getGameLevelNumberOffset(MemoryMatch.gameLevel);
        } else {
            displayGameNumber = gameNumber + MemoryMatch.getGameLevelNumberOffset(MemoryMatch.gameLevel);
        }
        this.levelNumber = level;
        this.levelIcon.gotoAndStop(MemoryMatch.GameSetup.levels[level - 1].iconHUD);
        this.levelField.text = displayGameNumber.toString();
        MemoryMatch.stageUpdated = true;
    },

    updateScoreDisplay: function (newScoreValue) {
        if (newScoreValue == null || newScoreValue == '') {
            newScoreValue = 0;
        }
        if (newScoreValue > 0) {
            this.scoreField.text = MemoryMatch.formatNumberWithGroups(newScoreValue);
        } else {
            this.scoreField.text = "0";
        }
        MemoryMatch.stageUpdated = true;
    },

    updateMatchCountDisplay: function (newValue) {
        var valueChanged = this.matchCountField.text != Number(newValue).toString();
        this.matchCountField.text = Number(newValue).toString();
        if ( ! MemoryMatch.isChallengeGame && newValue <= this.flashThreshold) {
            this.matchCountField.color = MemoryMatch.GameSetup.guiAlertFontColor;
            if (valueChanged) {
                if (newValue > 0) {
                    MemoryMatch.triggerSoundFx("soundMovesLast");
                } else {
                    MemoryMatch.triggerSoundFx("soundMovesLow");
                }
            }
            if ( ! this.matchCountFieldFlash) {
                this.flashMatchCountDisplay(true, -1);
            }
        } else {
            this.matchCountField.color = MemoryMatch.GameSetup.guiFontColor;
            this.matchCountField.alpha = 1;
            this.matchCountFieldFlash = false;
        }
        MemoryMatch.stageUpdated = true;
    },

    flashMatchCountDisplay: function (flashFlag, flashCount) {
        if (this.matchCountFieldFlash === flashFlag) {
            return;
        }
        this.matchCountFieldFlash = flashFlag;
        this.matchCountFieldFlashCount = flashCount;
        if (flashFlag) {
            this.matchCountFlashTimer = window.setTimeout(this.flashMatchCountDisplayUpdate.bind(this), 500);
        } else {
            this.matchCountField.alpha = 1;
            if (this.matchCountFlashTimer != null) {
                window.clearTimeout(this.matchCountFlashTimer);
                this.matchCountFlashTimer = null;
            }
        }
        MemoryMatch.stageUpdated = true;
    },

    flashMatchCountDisplayUpdate: function (event) {
        var stillFlashing = true,
            newAlpha = 1;

        if (this.matchCountField == null) {
            return;
        }
        if (this.matchCountFieldFlash) {
            if (this.matchCountField.alpha < 1) {
                newAlpha = 1;
            } else {
                newAlpha = 0.4;
            }
            if (this.matchCountFieldFlashCount > 0) {
                this.matchCountFieldFlashCount --;
                if (this.matchCountFieldFlashCount == 0) {
                    newAlpha = 1;
                    stillFlashing = false;
                }
            }
            this.matchCountField.alpha = newAlpha;
            if (stillFlashing) {
                this.matchCountFlashTimer = window.setTimeout(this.flashMatchCountDisplayUpdate.bind(this), 500);
            } else {
                this.matchCountFlashTimer = null;
            }
            MemoryMatch.stageUpdated = true;
        }
    },

    setFlashCountThreshold: function (newThreshold) {
        if (newThreshold < 0) {
            newThreshold = 0;
        }
        this.flashThreshold = newThreshold;
    },

    setMatchCountLabel: function (newLabel) {
        if (newLabel == null) {
            newLabel = 'Misses';
        }
        this.matchCountLabel.text = newLabel;
    },

    updateGameTimerDisplay: function (newValue) {
        var timeToShow;

        if (this.gameTimerField == null) {
            return;
        }
        if (newValue == null) {
            timeToShow = '';
        } else if (newValue == 0) {
            timeToShow = '0:00';
        } else {
            timeToShow = MemoryMatch.formatTimeAsString(newValue, true, false);
        }
        this.gameTimerField.text = timeToShow;
        MemoryMatch.stageUpdated = true;
    },

    updateComboMultiplier: function (newValue) {

        // comboMultiplier is 1+ combo, so when it is 2 that is 1 combo
        var displayString = '',
            startAnimation = false;

        if (this.comboMultiplierSprite != null) {
            if (newValue == null || newValue < 2) {
                this.comboMultiplier = 1;
            } else {
                if (newValue > this.comboMultiplier) {
                    this.comboMultiplier = newValue;
                    startAnimation = true;
                }
            }
            if (this.comboMultiplier > 1) {
                displayString = this.comboMultiplier.toString() + 'x';
            }
            this.comboMultiplierSprite.text = displayString;
            if (startAnimation) {
                this.startComboSpriteAnimation();
            }
            MemoryMatch.stageUpdated = true;
        }
    },

    showOptionsButton: function (showFlag) {
        this.optionsButton.visible = showFlag;
        MemoryMatch.stageUpdated = true;
    },

    showLevelField: function (showFlag) {
        this.levelField.visible = showFlag;
        MemoryMatch.stageUpdated = true;
    },

    showMatchCountField: function (showFlag) {
        this.matchCountLabel.visible = showFlag;
        this.matchCountField.visible = showFlag;
        MemoryMatch.stageUpdated = true;
    },

    showTimer: function (showFlag) {
        this.gameTimerField.visible = showFlag;
        MemoryMatch.stageUpdated = true;
    },

    showTimerCountdown: function (message, startSeconds) {

        // display a count down timer with title message and seconds to count down

        var containerGroup,
            containerWidth,
            containerHeight,
            titleTextField,
            titleTextFieldSize,
            backgroundShape,
            timerTextField,
            timerTextFieldSize,
            timerTextFieldAnimate;

        if (this.timerCountdownStarted) {
            return;
        }
        if (message == null) {
            message = '';
        }
        if (startSeconds < 1) {
            startSeconds = 1;
        } else if (startSeconds > 99) {
            startSeconds = 99;
        }
        if (this.timerCountdownGroup == null) {
            titleTextField = new createjs.Text(message, MemoryMatch.getScaledFontSize(32) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
            titleTextField.textAlign = 'center';
            titleTextField.name = 'title';

            timerTextField = new createjs.Text(startSeconds.toString(), MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
            timerTextField.textAlign = 'center';
            timerTextField.name = 'timer';

            titleTextFieldSize = titleTextField.getBounds();
            timerTextFieldSize = timerTextField.getBounds();
            containerWidth = Math.max(titleTextFieldSize.width, timerTextFieldSize.width) * 1.2;
            containerHeight = titleTextFieldSize.height + timerTextFieldSize.height * 1.1;
            titleTextField.x = containerWidth * 0.5;
            timerTextField.x = containerWidth * 0.5;
            titleTextField.y = containerHeight * 0.1;
            timerTextField.y = titleTextField.y + titleTextFieldSize.height;
            timerTextFieldAnimate = timerTextField.clone();
            timerTextFieldAnimate.name = 'timerAnimate';

            backgroundShape = new createjs.Shape();
            backgroundShape.graphics.beginFill("#000000").drawRoundRect(0, 0, containerWidth, containerHeight, 8);
            backgroundShape.alpha = 0.2;
            backgroundShape.name = 'background';

            containerGroup = new createjs.Container();
            containerGroup.addChild(backgroundShape);
            containerGroup.addChild(titleTextField);
            containerGroup.addChild(timerTextField);
            containerGroup.addChild(timerTextFieldAnimate);
            containerGroup.setTransform(MemoryMatch.stageWidth * 0.8, MemoryMatch.stageWidth * 0.014);
            this.groupDisplayObject.addChild(containerGroup);
            this.timerCountdownGroup = containerGroup;
        } else {
            containerGroup = this.timerCountdownGroup;
            containerGroup.visible = true;
            titleTextField = this.timerCountdownGroup.getChildByName('title');
            if (titleTextField != null) {
                titleTextField.text = message;
            }
            timerTextField = this.timerCountdownGroup.getChildByName('timer');
            if (timerTextField != null) {
                timerTextField.text = startSeconds.toString();
            }
            timerTextFieldAnimate = this.timerCountdownGroup.getChildByName('timerAnimate');
            if (timerTextFieldAnimate != null) {
                timerTextFieldAnimate.text = startSeconds.toString();
            }
        }
        this.lastUpdateTime = 0;
        MemoryMatch.stageUpdated = true;
    },

    hideTimerCountdown: function () {
        if (this.timerCountdownGroup != null) {
            if (this.timerCountdownTimer != null) {
                window.clearTimeout(this.timerCountdownTimer);
                this.timerCountdownTimer = null;
            }
            this.timerCountdownGroup.visible = false;
            this.timerCountdownStarted = false;
            this.lastUpdateTime = 0;
            this.showTimer(true);
            MemoryMatch.stageUpdated = true;
        }
    },

    startTimerCountdown: function () {
        if ( ! this.timerCountdownStarted) {
            this.timerCountdownStarted = true;
            this.showTimer(false);
            this.updateTimerCountdown();
        }
    },

    updateTimerCountdown: function () {
        var timerTextFieldAnimate,
            animator;

        if (this.timerCountdownGroup != null && this.timerCountdownGroup.visible && ! MemoryMatch.isGamePaused()) {
            timerTextFieldAnimate = this.timerCountdownGroup.getChildByName('timerAnimate');
            if (timerTextFieldAnimate != null) {
                animator = MemoryMatch.AnimationHandler.addToAnimationQueue(timerTextFieldAnimate, 0, 900, false, null, null);
                animator.showAtBegin = true;
                animator.vAlpha = -1 / MemoryMatch.fps;
                animator.vXScale = 0.5 / MemoryMatch.fps;
                animator.endXScale = 1.5;
                animator.vYScale = animator.vXScale;
                animator.endYScale = 1.5;
                this.timerCountdownTimer = window.setTimeout(this.onTimerCountdownTick.bind(this), 1000);
                this.lastUpdateTime = Date.now();
                MemoryMatch.stageUpdated = true;
            }
        }
    },

    onTimerCountdownTick: function () {
        var timerTextFieldAnimate,
            timerTextField,
            updateTimeDelta,
            timeValue,
            lastUpdate;

        if (this.timerCountdownGroup != null && this.timerCountdownStarted && ! MemoryMatch.isGamePaused()) {
            updateTimeDelta = Date.now() - this.lastUpdateTime;
            timerTextField = this.timerCountdownGroup.getChildByName('timer');
            timerTextFieldAnimate = this.timerCountdownGroup.getChildByName('timerAnimate');
            if (timerTextField != null) {
                timeValue = parseInt(timerTextField.text);
                if (timeValue > 0) {
                    timeValue --;
                    lastUpdate = false;
                } else {
                    lastUpdate = true;
                }
                timerTextField.text = timeValue.toString();
                if (timerTextFieldAnimate != null) {
                    timerTextFieldAnimate.alpha = 1.0;
                    timerTextFieldAnimate.scaleX = 1.0;
                    timerTextFieldAnimate.scaleY = 1.0;
                    timerTextFieldAnimate.text = timeValue.toString();
                }
                if (timeValue >= 0 && ! lastUpdate) { // schedule another update
                    this.updateTimerCountdown();
                } else {
                    this.timerCountdownStarted = false;
                    this.timerCountdownTimer = null;
                }
                MemoryMatch.stageUpdated = true;
            }
        }
    },

    setupLevelTextField: function () {

        // add the icon on top of the button frame

        var iconScale = 1,
            icon = MemoryMatch.GameSetup.levels[this.levelNumber - 1].iconHUD,
            iconSprite = new createjs.Sprite(this.spriteData, icon),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, icon),
            levelField;

        iconSprite.setTransform(this.width * 0.01, (this.hudHeight - spriteSize.height) * 0.5, iconScale, iconScale);
        iconSprite.framerate = 1;
        iconSprite.name = "icon";

        levelField = new createjs.Text("", MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        levelField.textAlign = "left";
        levelField.textBaseline = "middle";
        levelField.setTransform(this.width * 0.09, this.hudHeight * 0.5);
        levelField.maxWidth = 120 * MemoryMatch.stageScaleFactor; // space for 3 chars

        this.groupDisplayObject.addChild(iconSprite);
        this.levelIcon = iconSprite;
        this.groupDisplayObject.addChild(levelField);
        this.levelField = levelField;
    },

    setupScoreTextField: function () {
        var scoreField = new createjs.Text("0", MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        scoreField.textAlign = "center";
        scoreField.textBaseline = "middle";
        scoreField.setTransform(this.width * 0.25, this.hudHeight * 0.5);
        scoreField.maxWidth = this.width * 0.0974;
        this.groupDisplayObject.addChild(scoreField);
        this.scoreField = scoreField;
    },

    setupMatchCountTextField: function () {
        var matchCountLabel,
            matchCountField,
            matchCountWidth,
            matchCountHeight,
            backgroundShape,
            topMargin = MemoryMatch.GameSetup.guiHUDMatchCountTopMargin;

        if (topMargin == null) {
            topMargin = 0.5;
        }
        matchCountWidth = this.width * 0.18;
        matchCountHeight = this.hudHeight * MemoryMatch.GameSetup.guiHUDMatchCountHeight;
        backgroundShape = new createjs.Shape();
        backgroundShape.graphics.beginFill("#000000").drawRect(0, 0, matchCountWidth, matchCountHeight);
        backgroundShape.alpha = 0.2;
        backgroundShape.setTransform((this.width - matchCountWidth) * 0.5, this.hudHeight * MemoryMatch.GameSetup.guiHUDMatchCountOffset);
        this.groupDisplayObject.addChild(backgroundShape);

        matchCountLabel = new createjs.Text("Misses:", MemoryMatch.getScaledFontSize(60) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        matchCountLabel.textAlign = "right";
        matchCountLabel.textBaseline = "middle";
        matchCountLabel.setTransform(this.width * 0.52, this.hudHeight * topMargin);
        matchCountLabel.maxWidth = this.width * 0.1;
        this.matchCountLabel = matchCountLabel;
        this.groupDisplayObject.addChild(matchCountLabel);

        matchCountField = new createjs.Text("0", MemoryMatch.getScaledFontSize(84) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        matchCountField.textAlign = "left";
        matchCountField.textBaseline = "middle";
        matchCountField.setTransform(this.width * 0.54, this.hudHeight * topMargin);
        matchCountField.maxWidth = this.width * 0.03;
        this.matchCountField = matchCountField;
        this.groupDisplayObject.addChild(matchCountField);
    },

    setupGameTimerTextField: function () {
        var maxFieldWidth = 10 * 22 * MemoryMatch.stageScaleFactor,
            gameTimerField = new createjs.Text("", MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);

        gameTimerField.textAlign = "left";
        gameTimerField.textBaseline = "middle";
        gameTimerField.setTransform(this.width * 0.8, this.hudHeight * 0.5)
        gameTimerField.maxWidth = maxFieldWidth;
        this.groupDisplayObject.addChild(gameTimerField);
        this.gameTimerField = gameTimerField;
    },

    setupMessageTextField: function () {
        var bounds,
            comboSprite,
            messageField = new createjs.Text("", MemoryMatch.getScaledFontSize(24) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);

        messageField.textAlign = "left";
        messageField.x = 30 * MemoryMatch.stageScaleFactor;
        messageField.y = this.height - (40 * MemoryMatch.stageScaleFactor);
        messageField.maxWidth = this.width - (20  * MemoryMatch.stageScaleFactor);
        messageField.visible = false;
        this.groupDisplayObject.addChild(messageField);
        this.messageField = messageField;

        comboSprite = new createjs.Text("1x", MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColorBonus);
        comboSprite.textAlign = "center";
        comboSprite.x = MemoryMatch.stageWidth * 0.9;
        comboSprite.y = MemoryMatch.stageHeight * 0.96;
        comboSprite.maxWidth = this.width - (20  * MemoryMatch.stageScaleFactor);
        comboSprite.visible = false;
        bounds = comboSprite.getBounds();
        comboSprite.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
        comboSprite.regY = bounds.height * 0.5;
        this.groupDisplayObject.addChild(comboSprite);
        this.comboMultiplierSprite = comboSprite;
    },

    setupHeader: function () {
        // we want the header centered in the current stage regardless of the stage width
        var spriteFrame = "topHud",
            guiHeaderSprite = new createjs.Sprite(this.spriteData, spriteFrame),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, spriteFrame);

        this.hudHeight = spriteSize.height;
        guiHeaderSprite.framerate = 1;
        guiHeaderSprite.gotoAndStop("topHud");
        guiHeaderSprite.setTransform((this.width - spriteSize.width) * 0.5, 0, 1, 1);
        if (this.primaryColorFilter != null) {
            guiHeaderSprite.filters = [this.primaryColorFilter];
        }
        guiHeaderSprite.cache(0, 0, spriteSize.width, spriteSize.height);
        this.groupDisplayObject.addChild(guiHeaderSprite);
        this.headerSprite = guiHeaderSprite;
    },

    setupOptionsButton: function () {
        var optionsButton,
            position;

        if (MemoryMatch.stageScaleFactor < 0.5) {
            position = {x: 0.95, y: 0.04};
        } else {
            position = {x: 0.94, y: 0.03};
        }
        optionsButton = MemoryMatch.GUIButton({name: "optionsButton", tag: 1, disabled: false, callback: this.onOptions.bind(this), spriteFrames: MemoryMatch.GameSetup.mapSpritesheetFrames, expandHitArea: 20 * MemoryMatch.stageScaleFactor, baseUp: "mapOptionsButtonUp", baseOver: "mapOptionsButtonDown", baseDown: "mapOptionsButtonDown"});
        optionsButton.setTransform(this.width * position.x, this.height * position.y);
        this.parentDisplayObject.addChild(optionsButton);
        optionsButton.visible = true;
        this.optionsButton = optionsButton;
    },

    setupGameOptionsButton: function () {
        var optionsButton,
            buttonSize;

        optionsButton = MemoryMatch.GUIButton({name: "gameOptionsButton", tag: 2, disabled: false, callback: this.onGameOptions.bind(this), baseUp: "optionsUp", baseOver: "optionsDown", baseDown: "optionsDown"});
        buttonSize = optionsButton.getSize();
        optionsButton.setTransform(this.width * 0.92, (this.hudHeight - buttonSize) * 0.5);
        this.groupDisplayObject.addChild(optionsButton);
        optionsButton.visible = true;
        this.gameOptionsButton = optionsButton;
    },

    onPauseGame: function (event) {
        MemoryMatch.triggerSoundFx("soundTap");
        MemoryMatch.beginNewGame(1);
    },

    onOptions: function (eventType) {
        MemoryMatch.triggerSoundFx("soundTap");

        // Show the Options popup
        if ( ! MemoryMatch.GameOptions.isShowing()) {
//            MemoryMatch.pauseGameInProgress();
            MemoryMatch.GameOptions.setup(MemoryMatch.stage, MemoryMatch.GameGUI.onOptionsClosed, false);
            MemoryMatch.GameOptions.buildScreen(true, true);
        } else {
            MemoryMatch.GameOptions.closePopup("close");
        }
    },

    onHome: function (eventType) {
        MemoryMatch.triggerSoundFx("soundTap");
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.GameOptions.closePopup("home");
        } else {
            MemoryMatch.GameResults.close();
            MemoryMatch.GameGUI.show(false);
            MemoryMatch.showMenuScreen();
        }
    },

    onGameOptions: function (eventType) {
        MemoryMatch.triggerSoundFx("soundTap");

        // Show the Game Paused popup
        if ( ! MemoryMatch.GameOptions.isShowing()) {
            MemoryMatch.pauseGameInProgress();
            MemoryMatch.GameOptions.setup(MemoryMatch.stage, MemoryMatch.GameGUI.onOptionsClosed, true);
            MemoryMatch.GameOptions.buildScreen(true, true);
        } else {
            MemoryMatch.GameOptions.closePopup("close");
        }
    },

    onOptionsClosed: function (eventType) {
        switch (eventType) {
            case "home": // quit any current game and show main menu
                MemoryMatch.onQuitGame();
                break;
            case "restart": // restart the current game
                MemoryMatch.replayCurrentGame();
                break;
            case "continue":
            case "close":    // unpause the game
            default:
                if (MemoryMatch.gameState != MemoryMatch.GAMESTATE.MENU && MemoryMatch.gameState != MemoryMatch.GAMESTATE.RESULTS) {
                    MemoryMatch.resumePausedGame(null);
                }
                break;
        }
    },

    startComboSpriteAnimation: function () {
        var animator,
            duration = 0.25;

        if (this.comboMultiplierSprite != null) {
            // grow & rotate
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.comboMultiplierSprite, 0, 0, false, null, this.comboSpriteAnimationPhaseTwo.bind(this));
            animator.showAtBegin = true;
            animator.endXScale = animator.endYScale = 1.2;
            animator.vXScale = animator.vYScale = animator.endXScale / (duration * MemoryMatch.fps);
            animator.endRotation = -12;
            animator.vRotation = animator.endRotation / (duration * MemoryMatch.fps);
        }
    },

    comboSpriteAnimationPhaseTwo: function () {
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.comboMultiplierSprite, 0, 0, false, null, this.killComboSpriteAnimation.bind(this)),
            duration = 0.25;

        animator.showAtBegin = true;
        animator.endXScale = animator.endYScale = 1.0;
        animator.vXScale = animator.vYScale = (animator.endXScale - this.comboMultiplierSprite.scaleX) / (duration * MemoryMatch.fps);
        animator.endRotation = 0;
        animator.vRotation = -1 * this.comboMultiplierSprite.rotation / (duration * MemoryMatch.fps);
    },

    killComboSpriteAnimation: function () {
        if (this.comboMultiplierSprite != null) {
        }
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
        if (this.headerSprite != null && this.primaryColorFilter != null) {
            this.headerSprite.filters = [this.primaryColorFilter];
            this.headerSprite.updateCache();
        }
    }
};
