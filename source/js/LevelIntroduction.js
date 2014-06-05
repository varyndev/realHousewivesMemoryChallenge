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
    boardContainer: null,
    spriteData: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    isEnabled: false,
    animate: true,
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
    captionTextFontSize: 42,
    timerId: null,
    demoTimer: 0,
    demoAnimationState: 0,


    setup: function (displayObject, stateCompleteCallbackFunction, level, gameNumber) {
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.buttonInstances = [];
        this.isEnabled = false;
        this.level = level;
        this.gameNumber = gameNumber;
    },

    buildScreen: function (autoStart, animate) {
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
        this.setupLayoutForTip(this.level);
        this.setupButtons();
        if (autoStart == undefined) {
            autoStart = false;
        }
        if (animate === undefined) {
            animate = true;
        }
        this.animate = animate;
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // begin animation, then wait for user event to end this state and alert callback
        var duration = 0.3, // seconds of animation
            animator;

        if (this.animate) {
            this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 0, 0, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationPhaseTwo.bind(this));
            animator.endYScale = animator.endXScale = 1.08;
            animator.vYScale = animator.vXScale = animator.endXScale / (duration * MemoryMatch.fps);
        } else {
            this.isEnabled = true;
            this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 1, 1, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
            this.scheduleDemoAnimation(1000);
        }
//        this.groupDisplayObject.cache(0, 0, this.backgroundWidth, this.backgroundHeight);
    },

    startAnimationPhaseTwo: function (sprite) {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.startAnimationComplete.bind(this));

        animator.endYScale = animator.endXScale = 1.0;
        animator.vYScale = animator.vXScale = -1 * (animator.endXScale / (duration * MemoryMatch.fps));
    },

    startAnimationComplete: function (sprite) {
        this.isEnabled = true;
        this.scheduleDemoAnimation(1000);
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
        this.killScreen();
    },

    close: function () {
        this.isEnabled = false;
        if (this.isShowing()) {
            if (this.stateCompleteCallback !== null) {
                this.stateCompleteCallback(this.closeEventType, this.level, this.gameNumber);
            }
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

    setupLayoutForTip: function (tipNumber) {
        var groupDisplayObject = this.groupDisplayObject;
        switch (tipNumber) {
            case 1:
                this.setupLayoutForConcentration(groupDisplayObject);
                break;
            case 2:
                this.setupLayoutForChains(groupDisplayObject);
                break;
            case 3:
                this.setupLayoutForNemesis(groupDisplayObject);
                break;
            case 4:
                this.setupLayoutForHaystack(groupDisplayObject);
                break;
            default:
                break;
        }
    },

    setupLayoutForConcentration: function (groupDisplayObject) {
        var captionText,
            caption,
            middleY = this.backgroundHeight * 0.4,
            bottomY = this.backgroundHeight * 0.58;

        // 1. setup 4 cards
        this.buildDemoBoard(groupDisplayObject, this.backgroundWidth * 0.28, this.backgroundHeight * 0.48);

        // setup up text caption
        caption = 'Match like cards.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.25;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 2. setup Misses display
        this.setupMatchCountTextField(groupDisplayObject, (this.backgroundWidth - (300 * MemoryMatch.stageScaleFactor)) * 0.5, middleY, 300 * MemoryMatch.stageScaleFactor, 144 * MemoryMatch.stageScaleFactor);

        // setup caption
        caption = 'Clear the board before you run out of misses.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.5;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 3. setup timer display
        this.setupGameTimerTextField(groupDisplayObject, (this.backgroundWidth - (300 * MemoryMatch.stageScaleFactor)) * 0.86, middleY);

        // setup caption
        caption = 'Play quickly for extra points.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.75;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);
    },

    setupLayoutForChains: function (groupDisplayObject) {
        var captionText,
            caption,
            middleY = this.backgroundHeight * 0.4,
            bottomY = this.backgroundHeight * 0.58;

        // 1. setup 4 cards
        this.buildDemoBoard(groupDisplayObject, this.backgroundWidth * 0.28, this.backgroundHeight * 0.48);

        // setup up text caption
        caption = 'Study the board to remember where all the pairs are located.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.25;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 2. setup Study swatch
        this.showTimerCountdown(groupDisplayObject, this.backgroundWidth * 0.5, middleY);

        // setup caption
        caption = 'You have only a few seconds to study the board.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.5;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 3. setup 2 chains slots

        // setup caption
        caption = 'Find the pairs but you have only a few misses!'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.75;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);
    },

    setupLayoutForNemesis: function (groupDisplayObject) {
        // 1. setup 4 cards
        // setup caption
        // 2. setup Misses display
        // setup caption
        // 3. setup winebottle
        // setup caption
        var captionText,
            caption,
            middleY = this.backgroundHeight * 0.4,
            bottomY = this.backgroundHeight * 0.58;

        // 1. setup 4 cards
        this.buildDemoBoard(groupDisplayObject, this.backgroundWidth * 0.28, this.backgroundHeight * 0.48);

        // setup up text caption
        caption = 'Match like cards.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.25;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 2. setup Misses display
        this.setupMatchCountTextField(groupDisplayObject, (this.backgroundWidth - (300 * MemoryMatch.stageScaleFactor)) * 0.5, middleY, 300 * MemoryMatch.stageScaleFactor, 144 * MemoryMatch.stageScaleFactor);

        // setup caption
        caption = 'Clear the board before you run out of misses.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.5;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 3. setup Nemesis
        MemoryMatch.Nemesis.layoutNemesisDemo(groupDisplayObject, this.backgroundWidth * 0.88, middleY, 0.3333);

        // setup caption
        caption = 'Each time you miss you lose wine. Don\'t lose all your wine!';
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.75;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);
    },

    setupLayoutForHaystack: function (groupDisplayObject) {
        var captionText,
            caption,
            middleY = this.backgroundHeight * 0.4,
            bottomY = this.backgroundHeight * 0.58;

        // 1. setup 4 cards
        this.buildDemoBoard(groupDisplayObject, this.backgroundWidth * 0.28, this.backgroundHeight * 0.48);

        // setup up text caption
        caption = 'Remember the locations of the cards.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.25;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 2. setup Study swatch
        this.showTimerCountdown(groupDisplayObject, this.backgroundWidth * 0.5, middleY);

        // setup caption
        caption = 'You have only a few seconds to study the board.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.5;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);

        // 3. setup Misses display
        this.setupMatchCountTextField(groupDisplayObject, (this.backgroundWidth - (300 * MemoryMatch.stageScaleFactor)) * 0.8, middleY, 300 * MemoryMatch.stageScaleFactor, 144 * MemoryMatch.stageScaleFactor);

        // setup caption
        caption = 'Locate the target card before you run out of misses.'
        captionText = new createjs.Text(caption, MemoryMatch.getScaledFontSize(this.captionTextFontSize) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        captionText.textAlign = "center";
        captionText.x = this.backgroundWidth * 0.75;
        captionText.y = bottomY;
        captionText.lineWidth = this.backgroundWidth * 0.2;
        captionText.maxWidth = this.backgroundWidth * 0.2;
        captionText.lineHeight = captionText.getMeasuredLineHeight() * 1.5;
        groupDisplayObject.addChild(captionText);
    },

    setupMatchCountTextField: function (groupDisplayObject, x, y, width, height) {
        var matchCountLabel,
            matchCountField,
            backgroundShape;

        backgroundShape = new createjs.Shape();
        backgroundShape.graphics.beginFill("#000000").drawRect(0, 0, width, height);
        backgroundShape.alpha = 0.2;
        backgroundShape.setTransform(x, y);
        groupDisplayObject.addChild(backgroundShape);

        matchCountLabel = new createjs.Text("Misses", MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        matchCountLabel.textAlign = "right";
        matchCountLabel.textBaseline = "middle";
        matchCountLabel.setTransform(x + (width * 0.65), y + (height * 0.5));
        matchCountLabel.maxWidth = width * 0.75;
        groupDisplayObject.addChild(matchCountLabel);

        matchCountField = new createjs.Text("2", MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, '#FF0000');
        matchCountField.textAlign = "left";
        matchCountField.textBaseline = "middle";
        matchCountField.setTransform(x + (width * 0.7), y + (height * 0.55));
        matchCountField.maxWidth = width * 0.25;
        matchCountField.name = 'matchCounter';
        groupDisplayObject.addChild(matchCountField);
    },

    setupGameTimerTextField: function (groupDisplayObject, x, y) {
        var maxFieldWidth = 10 * 22 * MemoryMatch.stageScaleFactor,
            fieldHeight,
            gameTimerField = new createjs.Text("0:00", MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);

        gameTimerField.textAlign = "left";
        gameTimerField.textBaseline = "middle";
        fieldHeight = gameTimerField.getMeasuredLineHeight() * 1.3;
        gameTimerField.setTransform(x, y + fieldHeight)
        gameTimerField.maxWidth = maxFieldWidth;
        gameTimerField.name = 'gameTimer';
        groupDisplayObject.addChild(gameTimerField);
    },

    showTimerCountdown: function (groupDisplayObject, x, y) {

        // this is the "Study" timer

        var timerCountdownGroup,
            message,
            containerWidth,
            containerHeight,
            titleTextField,
            titleTextFieldSize,
            backgroundShape,
            timerTextField,
            timerTextFieldSize,
            timerTextFieldAnimate;

        message = 'Study';
        this.demoTimer = 5;
        titleTextField = new createjs.Text(message, MemoryMatch.getScaledFontSize(32) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = 'center';
        titleTextField.name = 'title';

        timerTextField = new createjs.Text(this.demoTimer.toString(), MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        timerTextField.textAlign = 'center';
        timerTextField.name = 'studyTimer';

        titleTextFieldSize = titleTextField.getBounds();
        timerTextFieldSize = timerTextField.getBounds();
        containerWidth = Math.max(titleTextFieldSize.width, timerTextFieldSize.width) * 1.2;
        containerHeight = titleTextFieldSize.height + timerTextFieldSize.height * 1.1;
        titleTextField.x = containerWidth * 0.5;
        timerTextField.x = containerWidth * 0.5;
        titleTextField.y = containerHeight * 0.1;
        timerTextField.y = titleTextField.y + titleTextFieldSize.height;

        backgroundShape = new createjs.Shape();
        backgroundShape.graphics.beginFill("#000000").drawRoundRect(0, 0, containerWidth, containerHeight, 8);
        backgroundShape.alpha = 0.2;
        backgroundShape.name = 'background';

        timerCountdownGroup = new createjs.Container();
        timerCountdownGroup.addChild(backgroundShape);
        timerCountdownGroup.addChild(titleTextField);
        timerCountdownGroup.addChild(timerTextField);
        timerCountdownGroup.setTransform(x - (containerWidth * 0.5), y);
        timerCountdownGroup.name = 'studyGroup';
        groupDisplayObject.addChild(timerCountdownGroup);
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

    buildDemoBoard: function (groupDisplayObject, x, y) {

        // Layout 4 demo cards in a 2x2 pattern

        var distanceBetweenCards = MemoryMatch.cardMargin * 4.0,
            columns = 2,
            rows = 2,
            boardScale = 0.25,
            allCardsShuffled = [3, 4, 4, 3],
            boardContainer = new createjs.Container(),
            halfWidthNeeded = ((MemoryMatch.cardWidth + distanceBetweenCards) * columns) * 0.5,
            halfHeightNeeded = ((MemoryMatch.cardHeight + distanceBetweenCards) * rows) * 0.5,
            spriteData,
            cardIndex,
            row,
            column,
            card;

        spriteData = new createjs.SpriteSheet({
            "images": [MemoryMatch.imageSheetImage],
            "frames": {"regX": 0, "regY": 0, "width": MemoryMatch.cardWidth, "height": MemoryMatch.cardHeight, "count": 0}
        });

        cardIndex = 0;
        for (row = 0; row < rows; row ++) {
            for (column = 0; column < columns; column ++) {
                card = MemoryMatch.makeCard(cardIndex, allCardsShuffled[cardIndex], spriteData);
                card.isEnabled = false;
                card.setTransform(column * (MemoryMatch.cardWidth + distanceBetweenCards), row * (MemoryMatch.cardHeight + distanceBetweenCards));
                boardContainer.addChild(card);
                card.showCardDemo();
                cardIndex ++;
            }
        }
        boardContainer.setTransform(x, y, boardScale, boardScale, 0, 0, 0, halfWidthNeeded, halfHeightNeeded);
        groupDisplayObject.addChild(boardContainer);
        this.boardContainer = boardContainer;
    },

    scheduleDemoAnimation: function (delay) {
        this.timerId = window.setTimeout(this.demoAnimationStep.bind(this), delay);
    },

    demoAnimationStep: function () {
        switch (this.level) {
            case 1:
                this.demoAnimationStepForConcentration();
                break;
            case 2:
                this.demoAnimationStepForChains();
                break;
            case 3:
                this.demoAnimationStepForNemesis();
                break;
            case 4:
                this.demoAnimationStepForHaystack();
                break;
            default:
                break;
        }
        this.scheduleDemoAnimation(1000);
    },

    demoAnimationStepForConcentration: function () {
        var card,
            timerTextField;

        switch (this.demoAnimationState) {
            case 1: // flip 1st card
                card = this.boardContainer.getChildAt(0);
                if (card != null) {
                    card.flip();
                }
                break;
            case 2: // flip 2nd card
                card = this.boardContainer.getChildAt(3);
                if (card != null) {
                    card.flip();
                }
                break;
            case 3: // wait
                break;
            case 4: // flash misses
                card = this.boardContainer.getChildAt(0);
                if (card != null) {
                    card.flipBack();
                }
                card = this.boardContainer.getChildAt(3);
                if (card != null) {
                    card.flipBack();
                }
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 0.1;
                }
                break;
            case 5: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            case 6: // flash misses
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 0.1;
                }
                break;
            case 7: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            default: // wait
                this.demoAnimationState = 0;
                break;
        }
        timerTextField = this.groupDisplayObject.getChildByName('gameTimer');
        if (timerTextField != null) {
            this.demoTimer += 1001;
            if (this.demoTimer > 6000) {
                this.demoTimer = 0;
            }
            timerTextField.text = MemoryMatch.formatTimeAsString(this.demoTimer, true, false);
        }
        this.demoAnimationState ++;
    },

    demoAnimationStepForChains: function () {
        var card,
            i,
            timerTextField;

        switch (this.demoAnimationState) {
            case 1: // flip all cards
                for (i = 0; i < 4; i ++) {
                    card = this.boardContainer.getChildAt(i);
                    if (card != null) {
                        card.flip();
                    }
                }
                break;
            case 2: // wait
                break;
            case 3: // flip all cards
                for (i = 0; i < 4; i ++) {
                    card = this.boardContainer.getChildAt(i);
                    if (card != null) {
                        card.flipBack();
                    }
                }
                break;
            case 4: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            case 5: // flash misses
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 0.1;
                }
                break;
            case 6: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            default: // wait
                this.demoAnimationState = 0;
                break;
        }
        timerTextField = this.groupDisplayObject.getChildByName('studyGroup');
        if (timerTextField != null) {
            timerTextField = timerTextField.getChildByName('studyTimer');
            if (timerTextField != null) {
                this.demoTimer -= 1;
                if (this.demoTimer < 0) {
                    this.demoTimer = 5;
                }
                timerTextField.text = this.demoTimer.toString();
            }
        }
        this.demoAnimationState ++;
    },

    demoAnimationStepForNemesis: function () {
        var card,
            misses,
            timerTextField;

        switch (this.demoAnimationState) {
            case 1: // flip 1st card
                card = this.boardContainer.getChildAt(2);
                if (card != null) {
                    card.flip();
                }
                break;
            case 2: // flip 2nd card
                card = this.boardContainer.getChildAt(1);
                if (card != null) {
                    card.flip();
                }
                break;
            case 3: // wait
                break;
            case 4: // flash misses
                card = this.boardContainer.getChildAt(1);
                if (card != null) {
                    card.flipBack();
                }
                card = this.boardContainer.getChildAt(2);
                if (card != null) {
                    card.flipBack();
                }
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 0.2;
                }
                break;
            case 5: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            case 6: // flash misses
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 0.2;
                }
                break;
            case 7: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            case 8: // move Nemesis
            case 9:
            case 10:
            case 11:
            case 12:
                misses = this.demoAnimationState - 7;
                MemoryMatch.Nemesis.moveNemesisCharacterDemo(this.groupDisplayObject, misses);
                break;
            default: // wait
                this.demoAnimationState = 0;
                break;
        }
        this.demoAnimationState ++;
    },

    demoAnimationStepForHaystack: function () {
        var card,
            i,
            timerTextField;

        switch (this.demoAnimationState) {
            case 1: // flip all cards
                for (i = 0; i < 4; i ++) {
                    card = this.boardContainer.getChildAt(i);
                    if (card != null) {
                        card.flip();
                    }
                }
                break;
            case 2: // wait
                break;
            case 3: // flip all cards
                for (i = 0; i < 4; i ++) {
                    card = this.boardContainer.getChildAt(i);
                    if (card != null) {
                        card.flipBack();
                    }
                }
                break;
            case 4: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            case 5: // flash misses
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 0.1;
                }
                break;
            case 6: // wait
                timerTextField = this.groupDisplayObject.getChildByName('matchCounter');
                if (timerTextField != null) {
                    timerTextField.alpha = 1;
                }
                break;
            default: // wait
                this.demoAnimationState = 0;
                break;
        }
        timerTextField = this.groupDisplayObject.getChildByName('studyGroup');
        if (timerTextField != null) {
            timerTextField = timerTextField.getChildByName('studyTimer');
            if (timerTextField != null) {
                this.demoTimer -= 1;
                if (this.demoTimer < 0) {
                    this.demoTimer = 5;
                }
                timerTextField.text = this.demoTimer.toString();
            }
        }
        this.demoAnimationState ++;
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

        if (this.timerId != null) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        }
        this.primaryColorFilter = null;
        this.secondaryColorFilter = null;
        for (i = 0; i < this.buttonInstances.length; i ++) {
            this.buttonInstances[i].kill();
        }
        this.buttonInstances = null;
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.stateCompleteCallback = null;
        this.spriteData = null;
        this.boardContainer = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};
