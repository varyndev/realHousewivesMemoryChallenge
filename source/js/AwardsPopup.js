/**
 * AwardsPopup.js
 *
 * Show the Awards popup showing all earned achievements and other stats.
 *
 */

MemoryMatch.AwardsPopup = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    contentDisplayObject: null,
    closeButtonInstance: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    backgroundCover: null,
    marginTop: 0,
    marginLeft: 0,
    lineHeight: 0,
    isEnabled: false,
    animate: false,
    title: null,
    message: null,
    closeButton: true,
    continueButton: false,
    stateCompleteCallback: null,
    startYAchievements: 0,
    scrollMask: null,
    scrollOffset: null,
    scrollLimitMin: 0,
    scrollLimitMax: 0,
    scrollButtonSprite: null,
    scrollButtonOffset: null,
    scrollButtonMin: 0,
    scrollButtonMax: 0,
    primaryColorFilter: null,
    secondaryColorFilter: null,
    primaryColorValue: null,
    secondaryColorValue: null,


    setup: function (displayObject, callback) {
        this.parentDisplayObject = displayObject;
        this.stateCompleteCallback = callback;
    },

    buildScreen: function (autoStart, animate) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.setColorFilters();
        this.setupBackground();
        this.marginTop = this.backgroundHeight * 0.05;
        this.marginLeft = this.backgroundWidth * 0.06;
        this.contentDisplayObject = new createjs.Container();
        this.setupMask();
        this.setupTitleText();
        this.startYAchievements = Math.floor(this.backgroundHeight * 0.12);
        this.startYAchievements += this.setupAward(0.5, this.startYAchievements);
        this.setupInfoText();
        this.setupAchievements();
        this.setupButtons();
        this.setupScrollBar();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.contentDisplayObject.setTransform(this.backgroundWidth * -0.028, this.backgroundHeight * 0.05);
        this.groupDisplayObject.addChild(this.contentDisplayObject);
        this.scrollLimitMin = this.contentDisplayObject.y;
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
        this.isEnabled = false;
        // begin animation, then once close is complete send notification
        if (this.stateCompleteCallback != null) {
            this.stateCompleteCallback(closeEventType);
        }
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

    onScrollMouseDownHandler: function (event) {
        this.scrollOffset = {x:this.contentDisplayObject.x, y:this.contentDisplayObject.y - event.stageY};
    },

    onScrollPressMoveHandler: function (event) {
        var newY = event.stageY + this.scrollOffset.y;

        if (newY > this.scrollLimitMin) {
            newY = this.scrollLimitMin;
        } else if (newY < this.scrollLimitMax) {
            newY = this.scrollLimitMax;
        }
        this.contentDisplayObject.y = newY;
        this.scrollButtonSprite.y = this.scrollButtonMin + (((newY - this.scrollLimitMin) / (this.scrollLimitMax - this.scrollLimitMin)) * (this.scrollButtonMax - this.scrollButtonMin));
    },

    onScrollHandleDown: function (event) {
        this.scrollButtonOffset = {x:this.scrollButtonSprite.x, y:this.scrollButtonSprite.y - event.stageY};
    },

    onScrollHandlePressMove: function (event) {
        var newY = event.stageY + this.scrollButtonOffset.y,
            percentScroll;

        if (newY < this.scrollButtonMin) {
            newY = this.scrollButtonMin;
        } else if (newY > this.scrollButtonMax) {
            newY = this.scrollButtonMax;
        }
        this.scrollButtonSprite.y = newY;
        percentScroll = (newY - this.scrollButtonMin) / (this.scrollButtonMax - this.scrollButtonMin);
        this.contentDisplayObject.y = this.scrollLimitMin + ((this.scrollLimitMax - this.scrollLimitMin) * percentScroll);
    },

    setupBackground: function () {
        // This method will scale the background image to fit the current stage if it is too big.
        var canvas = this.parentDisplayObject.canvas,
            popupImageAsset = assetLoader.getResult("popup-bg"),
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

    setupMask: function () {
        var maskShape = this.groupDisplayObject.addChild(new createjs.Shape()),
            startY = this.marginTop * 3,
            height = this.backgroundHeight - (4 * this.marginTop);

        maskShape.graphics.beginFill("#521852").drawRoundRect(this.marginLeft, startY, this.backgroundWidth - (2.5 * this.marginLeft), height, 8);
        maskShape.alpha = 0.3333;
        maskShape.visible = true;
        maskShape.on("mousedown", this.onScrollMouseDownHandler.bind(this));
        maskShape.on("pressmove", this.onScrollPressMoveHandler.bind(this));
        this.scrollMask = maskShape;
        this.contentDisplayObject.mask = maskShape;
        this.scrollLimitMax = height - startY;
    },

    setupScrollBar: function () {
        var spriteFrames = MemoryMatch.GameSetup.guiSpritesheet1Frames,
            scrollBarHandle = 'awardsHandle',
            scrollBarBackground = 'awardsSlider',
            scrollBarSprite,
            scrollButtonSprite,
            spriteData = new createjs.SpriteSheet(spriteFrames),
            barSpriteSize,
            handleSpriteSize,
            x,
            y;

        x = this.marginLeft + this.backgroundWidth - (2.3 * this.marginLeft);
        y = this.marginTop * 3;
        scrollBarSprite = new createjs.Sprite(spriteData, scrollBarBackground);
        barSpriteSize = MemoryMatch.getSpriteFrameSize(spriteFrames, scrollBarBackground);
        scrollBarSprite.setTransform(x, y);
        this.groupDisplayObject.addChild(scrollBarSprite);

        scrollButtonSprite = new createjs.Sprite(spriteData, scrollBarHandle);
        handleSpriteSize = MemoryMatch.getSpriteFrameSize(spriteFrames, scrollBarHandle);
        scrollButtonSprite.setTransform(x - ((handleSpriteSize.width - barSpriteSize.width) * 0.5), y);
        scrollButtonSprite.cursor = 'pointer';
        scrollButtonSprite.on("mousedown", this.onScrollHandleDown.bind(this));
        scrollButtonSprite.on("pressmove", this.onScrollHandlePressMove.bind(this));
        this.groupDisplayObject.addChild(scrollButtonSprite);
        this.scrollButtonSprite = scrollButtonSprite;
        this.scrollButtonMin = y;
        this.scrollButtonMax = y + barSpriteSize.height - handleSpriteSize.height;
    },

    setupTitleText: function () {
        var titleTextField;

        titleTextField = new createjs.Text("Your Awards & Stats", MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.marginTop * 0.8;
        titleTextField.lineWidth = this.backgroundWidth - (this.marginLeft * 2);
        titleTextField.maxWidth = this.backgroundWidth - (this.marginLeft * 2);
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupInfoText: function () {

        // Display various player statistics

        var titleTextField,
            playerStats = MemoryMatch.UserData.getUserDataObject(),
            leftX = this.backgroundWidth * 0.12,
            rightX = this.backgroundWidth * 0.49,
            Y,
            timePlayed,
            fieldWidth = this.backgroundWidth * 0.2,
            fontSizeBold = MemoryMatch.getScaledFontSize(52) + " " + MemoryMatch.GameSetup.guiBoldFontName,
            fontColor = MemoryMatch.GameSetup.guiFontColor,
            lineHeight = 54 * MemoryMatch.stageScaleFactor,
            numberOfGamesPlayed = playerStats['numberOfGamesPlayed'] | 0,
            totalMatchCount = playerStats['totalMatchCount'] | 0,
            totalCombos = playerStats['totalCombos'] | 0,
            totalTimePlayed = playerStats['totalTimePlayed'] | 0,
            luckyGuessCount = playerStats['luckyGuessCount'] | 0,
            bestScore = playerStats['bestScore'] | 0;

        if (totalTimePlayed == 0) {
            timePlayed = '-';
        } else if (totalTimePlayed >= 60*60*1000) {
            timePlayed = MemoryMatch.formatTimeAsString(totalTimePlayed, true, true);
        } else {
            timePlayed = MemoryMatch.formatTimeAsString(totalTimePlayed, true, false);
        }

        // first column
        Y = this.startYAchievements;
        titleTextField = new createjs.Text("Games:", fontSizeBold, fontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = leftX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);
        titleTextField = new createjs.Text(numberOfGamesPlayed.toString(), fontSizeBold, fontColor);
        titleTextField.textAlign = "right";
        titleTextField.x = rightX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);

        Y += lineHeight;
        titleTextField = new createjs.Text("Matches:", fontSizeBold, fontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = leftX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);
        titleTextField = new createjs.Text(totalMatchCount.toString(), fontSizeBold, fontColor);
        titleTextField.textAlign = "right";
        titleTextField.x = rightX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);

        Y += lineHeight;
        titleTextField = new createjs.Text("Best Score:", fontSizeBold, fontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = leftX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);
        titleTextField = new createjs.Text(MemoryMatch.formatNumberWithGroups(bestScore), fontSizeBold, fontColor);
        titleTextField.textAlign = "right";
        titleTextField.x = rightX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);

        // Second column
        leftX = this.backgroundWidth * 0.55;
        rightX = this.backgroundWidth * 0.88;
        Y = this.startYAchievements;
        titleTextField = new createjs.Text("Combos:", fontSizeBold, fontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = leftX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);
        titleTextField = new createjs.Text(totalCombos.toString(), fontSizeBold, fontColor);
        titleTextField.textAlign = "right";
        titleTextField.x = rightX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);

        Y += lineHeight;
        titleTextField = new createjs.Text("Time:", fontSizeBold, fontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = leftX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);
        titleTextField = new createjs.Text(timePlayed, fontSizeBold, fontColor);
        titleTextField.textAlign = "right";
        titleTextField.x = rightX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);

        Y += lineHeight;
        titleTextField = new createjs.Text("Lucky Guesses:", fontSizeBold, fontColor);
        titleTextField.textAlign = "left";
        titleTextField.x = leftX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);
        titleTextField = new createjs.Text(luckyGuessCount.toString(), fontSizeBold, fontColor);
        titleTextField.textAlign = "right";
        titleTextField.x = rightX;
        titleTextField.y = Y;
        titleTextField.maxWidth = fieldWidth;
        this.contentDisplayObject.addChild(titleTextField);

        this.startYAchievements = Y + (lineHeight * 1.5);
    },

    setupAward: function (scaleFactor, startY) {
        var awardDisplayObject = new createjs.Container(),
            spriteFrame = 'mapTrophy',
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

        imageSprite.setTransform(spriteSize.width * 0.5, spriteSize.height * 0.5, 1, 1, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
        imageSprite.framerate = 0;
        awardDisplayObject.addChild(imageSprite);
        awardDisplayObject.setBounds(0, 0, spriteSize.width, spriteSize.height);

        // position gems relative to award position, accounting for the center registration of the award sprite
        spriteFrame = 'mapAwardLand';
        position = {x: 0, y: 0};
        for (i = 0; i < numberOfLevels; i ++) {
            landNumber = i + 1;
            gemName = spriteFrame + landNumber.toString();
            imageSprite = new createjs.Sprite(spriteData, gemName);
            gemPosition = MemoryMatch.GameSetup.levels[i].gemPosition;
            imageSprite.setTransform(position.x + (gemPosition.x * MemoryMatch.stageScaleFactor), position.y + (gemPosition.y * MemoryMatch.stageScaleFactor), 1, 1);
            imageSprite.name = gemName;
            imageSprite.visible = MemoryMatch.didUserBeatChallenge(landNumber);
            awardDisplayObject.addChild(imageSprite);
        }
        this.contentDisplayObject.addChild(awardDisplayObject);
        awardDisplayObject.setTransform((this.backgroundWidth - (spriteSize.width * scaleFactor)) * 0.5, startY, scaleFactor, scaleFactor, 0, 0, 0, 0, 0);
        return startY + (spriteSize.height * scaleFactor * 0.5);
    },

    setupAchievements: function () {
        var allAchievements = MemoryMatch.GameSetup.achievements,
            achievementInfo = null,
            achievementItem = null,
            earned = false,
            i,
            width = this.backgroundWidth * 0.41,
            height = width * 0.33,
            margin = width * 0.01,
            Y = this.startYAchievements + (height * 0.5),
            X = (this.backgroundWidth - width) * 0.51,
            x2Column = X + margin;

        for (i = 0; i < allAchievements.length; i ++ ) {
            achievementInfo = allAchievements[i];
            earned = MemoryMatch.didUserEarnAchievement(achievementInfo.id);
            achievementItem = new MemoryMatch.AchievementItem(this.contentDisplayObject, {achievementId: achievementInfo.id, x: x2Column, y: Y, width: width, height: height, autoClose: false, icon: 'metal', earned: earned, callback: null});
            if (i % 2 == 0) {
                x2Column = X + achievementItem.getBounds().width + margin + margin;
            } else {
                Y += achievementItem.getBounds().height + margin;
                x2Column = X + margin;
            }
        }
        // determine how far past the viewable bottom we are to scroll to
        this.scrollLimitMax = this.scrollLimitMax - achievementItem.y;
    },

    setupButtons: function () {
        var buttonScale = 1.0,
            gameButton,
            buttonSize;

        // Close button always shows in its own special place
        gameButton = MemoryMatch.GUIButton({name: "close", tag: 1, disabled: false, callback: this.onClickClose.bind(this), baseUp: "closeButtonUp", baseOver: "closeButtonDown", baseDown: "closeButtonDown"});
        buttonSize = gameButton.getSize();
        gameButton.setTransform(this.backgroundWidth * 0.94 - buttonSize.width, this.backgroundHeight * 0.05, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.closeButtonInstance = gameButton;
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
        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        this.scrollButtonSprite.removeAllEventListeners();
        this.scrollButtonSprite = null;
        this.closeButtonInstance.removeAllEventListeners();
        this.closeButtonInstance = null;
        this.scrollMask.removeAllEventListeners();
        this.scrollMask = null;
        this.groupDisplayObject.removeChild(this.contentDisplayObject);
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.stateCompleteCallback = null;
        this.contentDisplayObject = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
