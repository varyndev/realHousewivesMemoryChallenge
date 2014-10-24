/**
 * GameOptions.js
 *
 * Show the options popup. This popup has 2 contexts: current active game, and no game active.
 * If a game is active then show:
 *   Audio button
 *   Help button
 *   Home button
 *   Restart button
 *   Credits button
 *   Close button
 *
 * If no game is active then show:
 *   Audio button
 *   Credits button
 *   View Stats button
 *   Clear Stats button
 *   Close button
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.GameOptions = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonInstances: null,
    audioOnButtonInstance: null,
    audioOffButtonInstance: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    backgroundCover: null,
    marginTop: 0,
    marginLeft: 0,
    centerX: 0,
    marginX: 0,
    lineHeight: 0,
    isGameOptions: false,
    isEnabled: false,
    closeEventType: null,
    animate: true,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,
    updateLoadStatusTimerId: -1,
    updateLoadStatusInterval: 500,

    setup: function (displayObject, stateCompleteCallbackFunction, isGameOptions) {
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.buttonInstances = [];
        this.isGameOptions = isGameOptions;
        this.isEnabled = false;
    },

    buildScreen: function (autoStart, animate) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.setColorFilters();
        this.showBackgroundImage(this.parentDisplayObject.canvas);
        this.marginTop = this.backgroundHeight * 0.05;
        this.marginLeft = this.backgroundWidth * 0.09;
        this.centerX = this.backgroundWidth * 0.5;
        this.marginX = 12 * MemoryMatch.stageScaleFactor;
        this.setupTitleText();
        this.setupButtons();
        this.setupInfoText();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        if (autoStart === null) {
            autoStart = false;
        }
        if (animate === null) {
            animate = true;
        }
        this.animate = animate;
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        var duration,
            animator;

        if (this.animate) {
            this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 0, 0, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
            // begin animation, then wait for user event to end this state and alert callback
            duration = 0.3; // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationPhaseTwo.bind(this));
            animator.endYScale = animator.endXScale = 1.08;
            animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        } else {
            this.isEnabled = true;
            this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 1, 1, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
        }
    },

    startAnimationPhaseTwo: function (sprite) {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationComplete.bind(this));

        animator.endYScale = animator.endXScale = 1.0;
        animator.vYScale = animator.vXScale = -1 * (animator.endXScale / (duration * MemoryMatch.fps));
    },

    startAnimationComplete: function (sprite) {
        this.isEnabled = true;
        MemoryMatch.pauseGamePendingComplete();
    },

    closeStartAnimation: function () {
        var duration = 0.1,
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
        if (MemoryMatch.GameOptions.stateCompleteCallback !== null) {
            MemoryMatch.GameOptions.stateCompleteCallback(this.closeEventType);
        }
        MemoryMatch.GameOptions.killScreen();
    },

    closePopup: function (closeEventType) {
        if (this.isShowing()) {
            this.isEnabled = false;
            if (MemoryMatch.gamePaused) {
                MemoryMatch.gamePausePending = true;
            }
            this.closeEventType = closeEventType;
            // begin animation, then once close is complete send notification
            this.closeStartAnimation();
        }
    },

    closePopupFromPopup: function (closeEventType) {
        // Close popup without animation
        if (this.isShowing()) {
            this.isEnabled = false;
            this.closeEventType = closeEventType;
            this.closeComplete();
        }
    },

    onClickClose: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.GameOptions.closePopup("close");
        }
    },

    onClickHome: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.GameOptions.closePopup("home");
        }
    },

    onClickRestart: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.GameOptions.closePopup("restart");
        }
    },

    onClickContinue: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.GameOptions.closePopup("continue");
        }
    },

    onClickCredits: function (event) {
        if (this.isEnabled) {
            MemoryMatch.unlockAllLevelsCounter ++;
            MemoryMatch.CreditsPopup.setup(MemoryMatch.stage, this.closePopupFromPopup.bind(this));
            MemoryMatch.CreditsPopup.buildScreen(true);
        }
    },

    onClickAudio: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            var muteFlag = ! createjs.Sound.getMute();
            createjs.Sound.setMute(muteFlag);
            MemoryMatch.GameOptions.audioOnButtonInstance.visible = ! muteFlag;
            MemoryMatch.GameOptions.audioOnButtonInstance.setEnabled( ! muteFlag);
            MemoryMatch.GameOptions.audioOffButtonInstance.visible = muteFlag;
            MemoryMatch.GameOptions.audioOffButtonInstance.setEnabled(muteFlag);
            MemoryMatch.audioMute = muteFlag;
            MemoryMatch.updateUserDataObject(null);
        }
    },

    onClickHelp: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            if (MemoryMatch.GameOptions.isGameOptions) {
                MemoryMatch.LevelIntroduction.setup(MemoryMatch.stage, MemoryMatch.GameOptions.onHelpCallback.bind(MemoryMatch.GameOptions), MemoryMatch.gameId, MemoryMatch.gameLevel, MemoryMatch.gameNumber);
                MemoryMatch.LevelIntroduction.buildScreen(true, false);
            } else {
                this.showHelp();
                this.closePopupFromPopup(null);
            }
        }
    },

    onClickFullScreen: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.goFullScreen();
        }
    },

    onClickShare: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.showSharePopup(MemoryMatch.GameSetup.gameSubTitle, MemoryMatch.GameSetup.gameShortSubTitle);
        }
    },

    onClickViewStats: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            MemoryMatch.unlockAllLevelsCounter ++;
            MemoryMatch.AwardsPopup.setup(MemoryMatch.stage, MemoryMatch.GameOptions.onMessagePopupCallback.bind(MemoryMatch.GameOptions));
            MemoryMatch.AwardsPopup.buildScreen(true, false);
        }
    },

    onClickClearStats: function (event) {
        var objectToDisplay;

        if (MemoryMatch.GameOptions.isEnabled) {
            if (MemoryMatch.unlockAllLevelsCounter > 2) {
                MemoryMatch.unlockAllLevels();
                objectToDisplay = new MemoryMatch.InfoPopup(MemoryMatch.stage, true, {title: "UNLOCKED", message: MemoryMatch.GameSetup.GUIStrings.allLevelsUnlocked, messageFontSize: 64, sound: 'soundCorrect'});
            } else {
                MemoryMatch.resetUserData();
                objectToDisplay = new MemoryMatch.InfoPopup(MemoryMatch.stage, true, {title: "CLEARED", message: MemoryMatch.GameSetup.GUIStrings.allLevelsLocked, messageFontSize: 64, sound: 'soundCorrect'});
            }
            MemoryMatch.unlockAllLevelsCounter = 0;
            if (MemoryMatch.MainMenu != null) {
                MemoryMatch.MainMenu.refreshButtons();
            }
            objectToDisplay = null;
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
    },

    onMessagePopupCallback: function (closeEventType) {
        // closeEventType indicates the button used to close the popup
        this.closePopupFromPopup(closeEventType);
    },

    onHelpCallback: function (closeEventType, level, gameNumber) {
        this.closePopupFromPopup(closeEventType);
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
        var title,
            titleTextField;

        if (this.isGameOptions) {
            title = "Game Paused";
        } else {
            title = "Options";
        }
        titleTextField = new createjs.Text(title, MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupInfoText: function () {
        var info,
            infoTextField,
            loadingProgress = MemoryMatch.secondaryAssetLoaderProgress;

        info = MemoryMatch.getAppInfo();
        infoTextField = new createjs.Text(info, MemoryMatch.getScaledFontSize(36) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiInfoColor);
        infoTextField.textAlign = "left";
        infoTextField.x = this.marginLeft;
        infoTextField.y = this.backgroundHeight * 0.92;
        infoTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(infoTextField);

        if (loadingProgress != -2) {
            if (loadingProgress >= 0) {
                info = loadingProgress.toString() + '%';
            } else {
                info = "";
            }
            infoTextField = new createjs.Text(info, MemoryMatch.getScaledFontSize(42) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiInfoColor);
            infoTextField.textAlign = "right";
            infoTextField.maxWidth = (5 * 42) * MemoryMatch.stageScaleFactor;
            infoTextField.x = this.backgroundWidth - (this.marginLeft * 0.25);
            infoTextField.y = this.backgroundHeight * 0.92;
            infoTextField.name = 'loadStatus';
            this.groupDisplayObject.addChild(infoTextField);
            this.updateLoadStatusTimerId = window.setTimeout(this.updateLoadStatus.bind(this), this.updateLoadStatusInterval);
        }
    },

    setupButtons: function () {
        var buttonsGroup = new createjs.Container(),
            spriteFrame,
            buttonScale = 1.0,
            gameButton,
            buttonTagCounter = 0, // 8 * MemoryMatch.stageScaleFactor
            buttonSize,
            buttonMargin = 42 * MemoryMatch.stageScaleFactor,
            groupWidth,
            groupHeight,
            muted,
            fullScreenDisabled = ! MemoryMatch.isFullScreenAvailable(),
            xOffset,
            yOffset,
            buttonGap,
            buttonBaseColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].liteColor,
            buttonRollOverColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].secondaryColor;

        // Close button always shows in its own special place
        buttonTagCounter ++;
        gameButton = MemoryMatch.GUIButton({name: "close", tag: buttonTagCounter, disabled: false, callback: this.onClickClose.bind(this), baseUp: "closeButtonUp", baseOver: "closeButtonDown", baseDown: "closeButtonDown"});
        buttonSize = gameButton.getSize();
        gameButton.setTransform(this.backgroundWidth * 0.94 - buttonSize.width, this.backgroundHeight * 0.05, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances.push(gameButton);

        // Figure out how to size the whole group of buttons.
        // This logic assumes all buttons are the same height.
        // We need a wide button to figure out how wide the button group will be.
        spriteFrame = "optionsLargeButtonBase";
        buttonSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, spriteFrame);
        groupWidth = buttonSize.width;
        groupHeight = buttonSize.height * 3;
        xOffset = 0;
        yOffset = 0;

        // Audio button always shows but we need to set the correct state
        buttonTagCounter ++;
        muted = createjs.Sound.getMute();
        gameButton = MemoryMatch.GUIButton({name: "audioOn", tag: buttonTagCounter, disabled: false, callback: this.onClickAudio.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallSoundOnIcon", iconOver: "optionsSmallSoundOnDownIcon", iconDown: "optionsSmallSoundOnDownIcon"});
        gameButton.setTransform(xOffset, yOffset, 1, 1);
        gameButton.visible = ! muted;
        gameButton.setEnabled( ! muted);
        buttonsGroup.addChild(gameButton);
        this.audioOnButtonInstance = gameButton;
        this.buttonInstances.push(gameButton);

        buttonTagCounter ++;
        gameButton = MemoryMatch.GUIButton({name: "audioOff", tag: buttonTagCounter, disabled: false, callback: this.onClickAudio.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallSoundOffIcon", iconOver: "optionsSmallSoundOffDownIcon", iconDown: "optionsSmallSoundOffDownIcon"});
        gameButton.setTransform(xOffset, yOffset, 1, 1);
        gameButton.visible = muted;
        gameButton.setEnabled(muted);
        buttonsGroup.addChild(gameButton);
        this.audioOffButtonInstance = gameButton;
        this.buttonInstances.push(gameButton);

        if (this.isGameOptions) {
            // Show Map button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "home", tag: buttonTagCounter, disabled: false, callback: this.onClickHome.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallMenuIcon", iconOver: "optionsSmallMenuDownIcon", iconDown: "optionsSmallMenuDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show small Credits button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "credits", tag: buttonTagCounter, disabled: false, callback: this.onClickCredits.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallCreditIcon", iconOver: "optionsSmallCreditDownIcon", iconDown: "optionsSmallCreditDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show Help button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "help", tag: buttonTagCounter, disabled: false, callback: this.onClickHelp.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallHelpIcon", iconOver: "optionsSmallHelpDownIcon", iconDown: "optionsSmallHelpDownIcon"});
            buttonSize = gameButton.getSize();
            xOffset = groupWidth - buttonSize.width;
            yOffset = 0;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show Restart (Replay) button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "restart", tag: buttonTagCounter, disabled: false, callback: this.onClickRestart.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallReplayIcon", iconOver: "optionsSmallReplayDownIcon", iconDown: "optionsSmallReplayDownIcon"});
            yOffset += buttonSize.height + buttonMargin;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show fullscreen button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "fullscreen", tag: buttonTagCounter, disabled: fullScreenDisabled, callback: this.onClickFullScreen.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallFullScreenIcon", iconOver: "optionsSmallFullScreenDownIcon", iconDown: "optionsSmallFullScreenDownIcon"});
            yOffset += buttonSize.height + buttonMargin;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);
        } else {
            // Show View Stats button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "viewstats", tag: buttonTagCounter, disabled: false, callback: this.onClickViewStats.bind(this), baseUp: "optionsLargeButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, text: "View Stats", iconUp: "optionsLargeAwardsIcon", iconOver: "optionsLargeAwardsDownIcon", iconDown: "optionsLargeAwardsDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show Clear Stats button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "clearstats", tag: buttonTagCounter, disabled: false, callback: this.onClickClearStats.bind(this), baseUp: "optionsLargeButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, text: "Clear Stats", iconUp: "optionsLargeClearIcon", iconOver: "optionsLargeClearDownIcon", iconDown: "optionsLargeClearDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show small Help button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "help", tag: buttonTagCounter, disabled: false, callback: this.onClickHelp.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallHelpIcon", iconOver: "optionsSmallHelpDownIcon", iconDown: "optionsSmallHelpDownIcon"});
            buttonSize = gameButton.getSize();
            xOffset = groupWidth - buttonSize.width;
            yOffset = 0;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // adjust width of group for a 3rd column of buttons. Assumes 3rd column buttons are same width/height as the help button we just placed.
            buttonGap = xOffset - buttonSize.width;
            groupWidth += buttonGap + buttonSize.width;
            xOffset += buttonSize.width + buttonGap;
            yOffset = 0;

            // Show small Full screen button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "fullscreen", tag: buttonTagCounter, disabled: fullScreenDisabled, callback: this.onClickFullScreen.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallFullScreenIcon", iconOver: "optionsSmallFullScreenDownIcon", iconDown: "optionsSmallFullScreenDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show small Share button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "share", tag: buttonTagCounter, disabled: false, callback: this.onClickShare.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "gameOverShareIcon", iconOver: "gameOverShareDownIcon", iconDown: "gameOverShareDownIcon"});
            yOffset += buttonSize.height + buttonMargin;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show small Credits button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "credits", tag: buttonTagCounter, disabled: false, callback: this.onClickCredits.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, buttonBaseRollOverColor: buttonRollOverColor, iconUp: "optionsSmallCreditIcon", iconOver: "optionsSmallCreditDownIcon", iconDown: "optionsSmallCreditDownIcon"});
            yOffset += buttonSize.height + buttonMargin;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);
        }
        // center the group in the popup
        buttonsGroup.setTransform((this.backgroundWidth - groupWidth) * 0.5, (this.backgroundHeight - groupHeight) * 0.5, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(buttonsGroup);
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

    showHelp: function () {
        // Position a DOM element and close. DOM element is responsible to close itself.
        var pageElement = document.getElementById('helpArea');
        pageElement.style.display = 'block';
    },

    updateLoadStatus: function () {
        var infoTextField = this.groupDisplayObject.getChildByName('loadStatus'),
            loadingProgress = MemoryMatch.secondaryAssetLoaderProgress;

        if (infoTextField != null) {
            if (loadingProgress != -1) {
                infoTextField.text = loadingProgress.toString() + '%';
                this.updateLoadStatusTimerId = window.setTimeout(this.updateLoadStatus.bind(this), this.updateLoadStatusInterval);
            } else {
                this.updateLoadStatusTimerId = -1;
                this.groupDisplayObject.removeChild(infoTextField);
            }
        }
    },

    killScreen: function () {
        // remove all display objects and object references:
        var i;

        if (this.updateLoadStatusTimerId != -1) {
            window.clearTimeout(this.updateLoadStatusTimerId);
            this.updateLoadStatusTimerId = -1;
        }
        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        for (i = 0; i < this.buttonInstances.length; i ++) {
            this.buttonInstances[i].kill();
        }
        this.buttonInstances = null;
        this.audioOnButtonInstance = null;
        this.audioOffButtonInstance = null;
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.stateCompleteCallback = null;
        this.levelData = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
