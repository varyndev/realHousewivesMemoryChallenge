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
            createjs.Sound.play("soundTap");
            MemoryMatch.GameOptions.closePopup("close");
        }
    },

    onClickHome: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.GameOptions.closePopup("home");
        }
    },

    onClickRestart: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.GameOptions.closePopup("restart");
        }
    },

    onClickContinue: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.GameOptions.closePopup("continue");
        }
    },

    onClickCredits: function (event) {
        if (this.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.unlockAllLevelsCounter ++;
            MemoryMatch.CreditsPopup.setup(MemoryMatch.stage, this.closePopupFromPopup.bind(this));
            MemoryMatch.CreditsPopup.buildScreen(true);
        }
    },

    onClickAudio: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            var muteFlag = ! createjs.Sound.getMute();
            createjs.Sound.setMute(muteFlag);
            createjs.Sound.play("soundTap");
            MemoryMatch.GameOptions.audioOnButtonInstance.visible = ! muteFlag;
            MemoryMatch.GameOptions.audioOffButtonInstance.visible = muteFlag;
            MemoryMatch.audioMute = muteFlag;
            MemoryMatch.updateUserDataObject(null);
        }
    },

    onClickHelp: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.MessagePopup.setup(MemoryMatch.stage, {domElement: "helpArea", title: "Help!", message: "", callback: MemoryMatch.GameOptions.onMessagePopupCallback.bind(MemoryMatch.GameOptions), closeButton: true, continueButton: false});
            MemoryMatch.MessagePopup.buildScreen(true);
        }
    },

    onClickViewStats: function (event) {
        if (MemoryMatch.GameOptions.isEnabled) {
            createjs.Sound.play("soundTap");
            MemoryMatch.unlockAllLevelsCounter ++;
            MemoryMatch.AwardsPopup.setup(MemoryMatch.stage, MemoryMatch.GameOptions.onMessagePopupCallback.bind(MemoryMatch.GameOptions));
            MemoryMatch.AwardsPopup.buildScreen();
        }
    },

    onClickClearStats: function (event) {
        var objectToDisplay;
        if (MemoryMatch.GameOptions.isEnabled) {
            createjs.Sound.play("soundTap");
            if (MemoryMatch.unlockAllLevelsCounter > 2) {
                MemoryMatch.unlockAllLevels();
                objectToDisplay = new MemoryMatch.InfoPopup(MemoryMatch.stage, true, {title: "UNLOCKED", message: 'You have unlocked all levels.', sound: 'soundCorrect'});
            } else {
                MemoryMatch.resetUserData();
                objectToDisplay = new MemoryMatch.InfoPopup(MemoryMatch.stage, true, {title: "CLEARED", message: 'You have reset all levels.', sound: 'soundCorrect'});
            }
            MemoryMatch.unlockAllLevelsCounter = 0;
            if (MemoryMatch.MainMenu != null && MemoryMatch.MainMenu.isShowing()) {
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
            infoTextField;

        info = MemoryMatch.GameSetup.gameName + " version " + MemoryMatch.GameVersion + " on " + MemoryMatch.platform + " locale " + MemoryMatch.locale;
        infoTextField = new createjs.Text(info, MemoryMatch.getScaledFontSize(36) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiInfoColor);
        infoTextField.textAlign = "left";
        infoTextField.x = this.marginLeft;
        infoTextField.y = this.backgroundHeight * 0.92;
        infoTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(infoTextField);
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
            xOffset,
            yOffset,
            buttonBaseColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].liteColor;

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
        gameButton = MemoryMatch.GUIButton({name: "audioOn", tag: buttonTagCounter, disabled: false, callback: this.onClickAudio.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsSmallSoundOnIcon", iconOver: "optionsSmallSoundOnDownIcon", iconDown: "optionsSmallSoundOnDownIcon"});
        gameButton.setTransform(xOffset, yOffset, 1, 1);
        gameButton.visible = ! createjs.Sound.getMute();
        buttonsGroup.addChild(gameButton);
        this.audioOnButtonInstance = gameButton;
        this.buttonInstances.push(gameButton);

        buttonTagCounter ++;
        gameButton = MemoryMatch.GUIButton({name: "audioOff", tag: buttonTagCounter, disabled: false, callback: this.onClickAudio.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsSmallSoundOffIcon", iconOver: "optionsSmallSoundOffDownIcon", iconDown: "optionsSmallSoundOffDownIcon"});
        gameButton.setTransform(xOffset, yOffset, 1, 1);
        gameButton.visible = createjs.Sound.getMute();
        buttonsGroup.addChild(gameButton);
        this.audioOffButtonInstance = gameButton;
        this.buttonInstances.push(gameButton);

        if (this.isGameOptions) {
            // Show Map button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "home", tag: buttonTagCounter, disabled: false, callback: this.onClickHome.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsSmallMenuIcon", iconOver: "optionsSmallMenuDownIcon", iconDown: "optionsSmallMenuDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show big Credits button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "credits", tag: buttonTagCounter, disabled: false, callback: this.onClickCredits.bind(this), baseUp: "optionsLargeButtonBase", buttonBaseColor: buttonBaseColor, text: "Credits", iconUp: "optionsLargeCreditIcon", iconOver: "optionsLargeCreditDownIcon", iconDown: "optionsLargeCreditDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show Help button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "help", tag: buttonTagCounter, disabled: false, callback: this.onClickHelp.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsSmallHelpIcon", iconOver: "optionsSmallHelpDownIcon", iconDown: "optionsSmallHelpDownIcon"});
            buttonSize = gameButton.getSize();
            xOffset = groupWidth - buttonSize.width;
            yOffset = 0;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show Restart (Replay) button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "restart", tag: buttonTagCounter, disabled: false, callback: this.onClickRestart.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsSmallReplayIcon", iconOver: "optionsSmallReplayDownIcon", iconDown: "optionsSmallReplayDownIcon"});
            yOffset += buttonSize.height + buttonMargin;
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);
        } else {
            // Show View Stats button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "viewstats", tag: buttonTagCounter, disabled: false, callback: this.onClickViewStats.bind(this), baseUp: "optionsLargeButtonBase", buttonBaseColor: buttonBaseColor, text: "View Stats", iconUp: "optionsLargeAwardsIcon", iconOver: "optionsLargeAwardsDownIcon", iconDown: "optionsLargeAwardsDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show Clear Stats button
            buttonTagCounter ++;
            yOffset += buttonSize.height + buttonMargin;
            gameButton = MemoryMatch.GUIButton({name: "clearstats", tag: buttonTagCounter, disabled: false, callback: this.onClickClearStats.bind(this), baseUp: "optionsLargeButtonBase", buttonBaseColor: buttonBaseColor, text: "Clear Stats", iconUp: "optionsLargeClearIcon", iconOver: "optionsLargeClearDownIcon", iconDown: "optionsLargeClearDownIcon"});
            gameButton.setTransform(xOffset, yOffset, 1, 1);
            buttonsGroup.addChild(gameButton);
            this.buttonInstances.push(gameButton);

            // Show small Credits button
            buttonTagCounter ++;
            gameButton = MemoryMatch.GUIButton({name: "credits", tag: buttonTagCounter, disabled: false, callback: this.onClickCredits.bind(this), baseUp: "optionsSmallButtonBase", buttonBaseColor: buttonBaseColor, iconUp: "optionsSmallCreditIcon", iconOver: "optionsSmallCreditDownIcon", iconDown: "optionsSmallCreditDownIcon"});
            buttonSize = gameButton.getSize();
            xOffset = groupWidth - buttonSize.width;
            yOffset = 0;
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

    killScreen: function () {
        // remove all display objects and object references:
        var i;

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
