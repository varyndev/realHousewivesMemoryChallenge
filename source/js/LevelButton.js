/**
 * LevelButton.js
 *
 * Level buttons are display object containers that support some unique functionality:
 *   Display the game number
 *   Show number of stars earned
 *   Show best score
 *   Show different states for locked, unlocked, played
 *   Show different states for Challenge levels
 *   ...and act like a button!
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.LevelButton = function (parameters) {
    var levelButton = new createjs.Container();

    levelButton.callback = null;
    levelButton.width = 0;
    levelButton.height = 0;
    levelButton.gameNumber = 0;
    levelButton.landNumber = 0;
    levelButton.starsEarned = 0;
    levelButton.maxStars = 3;
    levelButton.showStarsForChallenge = false;
    levelButton.bestScore = 0;
    levelButton.wasPlayed = false;
    levelButton.isLocked = true;
    levelButton.isChallengeGame = false;
    levelButton.userBeatChallenge = false;
    levelButton.buttonScale = 1.0;
    levelButton.addShadow = false;
    levelButton.spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.mapSpritesheetFrames);
    levelButton.shadowSource = null;
    levelButton.nextYPosition = 0;
    levelButton.primaryColor = 'ffffff';
    levelButton.secondaryColor = '000000';
    levelButton.liteColor = 'C0C0C0';
    levelButton.buttonPrimaryColorFilter = null;
    levelButton.buttonSecondaryColorFilter = null;
    levelButton.changeEventNotification = null;


    levelButton.setParameters = function (parameters) {
        if (parameters != null) {
            if (parameters.gameNumber != null) {
                levelButton.gameNumber = parameters.gameNumber;
            }
            if (parameters.landNumber != null) {
                levelButton.landNumber = parameters.landNumber;
            }
            if (parameters.starsEarned != null) {
                levelButton.starsEarned = parameters.starsEarned;
            }
            if (parameters.bestScore != null) {
                levelButton.bestScore = parameters.bestScore;
            }
            if (parameters.wasPlayed != null) {
                levelButton.wasPlayed = parameters.wasPlayed;
            }
            if (parameters.isLocked != null) {
                levelButton.isLocked = parameters.isLocked;
            }
            if (parameters.primaryColor != null) {
                levelButton.primaryColor = parameters.primaryColor;
            }
            if (parameters.secondaryColor != null) {
                levelButton.secondaryColor = parameters.secondaryColor;
            }
            if (parameters.liteColor != null) {
                levelButton.liteColor = parameters.liteColor;
            }
            if (parameters.scale != null) {
                levelButton.buttonScale = parameters.scale;
            }
            if (parameters.addShadow != null) {
                levelButton.addShadow = parameters.addShadow;
                levelButton.shadowSource = new createjs.Shadow("#000000", 2, 2, 10);
            }
            if (parameters.isChallengeGame != null) {
                levelButton.isChallengeGame = parameters.isChallengeGame;
                if (levelButton.isChallengeGame) {
                    levelButton.userBeatChallenge = MemoryMatch.didUserBeatChallenge(levelButton.landNumber);
                }
            }
            if (parameters.callback != null) {
                levelButton.callback = parameters.callback;
            }
            if (parameters.changeEventNotification != null) {
                levelButton.changeEventNotification = parameters.changeEventNotification;
            }
        }
    };

    levelButton.createGameNumberText = function () {
        var gameNumber = this.gameNumber.toString(),
            textColor = this.isChallengeGame ? this.primaryColor : MemoryMatch.GameSetup.mapLevelColor,
            fontSize = this.isChallengeGame ? 56 : 44,
            gameNumberText = new createjs.Text(gameNumber, MemoryMatch.getScaledFontSize(fontSize) + " " + MemoryMatch.GameSetup.guiBoldFontName, textColor),
            button = this.getChildByName('button'),
            textHeight = gameNumberText.getMeasuredLineHeight(),
            useFontPositionHack = MemoryMatch.platform == 'Win32'; // TODO: this is the worst! font does not position the same for Windows as anywhere else.

        gameNumberText.textAlign = "center";
        gameNumberText.x = this.width * 0.5;
        gameNumberText.maxWidth = this.width;
        gameNumberText.color = textColor;
        gameNumberText.visible = true;
        gameNumberText.name = "gameNumber";
        if (this.isChallengeGame) {
            gameNumberText.visible = ! this.isLocked && ! this.userBeatChallenge;
            gameNumberText.y = button.y + ((button.height - textHeight) * 0.54);
        } else {
            gameNumberText.visible = ! this.isLocked;
            gameNumberText.y = button.y + ((button.height - textHeight) * 0.6666);
        }
        if (useFontPositionHack) {
            gameNumberText.y *= 0.9;
        }
        if (this.addShadow && this.shadowSource != null) {
            gameNumberText.shadow = this.shadowSource.clone();
        }
        this.addChild(gameNumberText);
    };

    levelButton.createBestScoreText = function () {
        var bestScoreText = new createjs.Text(MemoryMatch.formatNumberWithGroups(this.bestScore), MemoryMatch.getScaledFontSize(36) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.mapLevelColor);
        bestScoreText.textAlign = "center";
        bestScoreText.x = this.width * 0.5;
        bestScoreText.y = this.nextYPosition;
        bestScoreText.maxWidth = this.width;
        bestScoreText.visible = ! (this.isLocked || ! this.wasPlayed);
        bestScoreText.name = "bestScore";
        if (this.addShadow && this.shadowSource != null) {
            bestScoreText.shadow = levelButton.shadowSource.clone();
        }
        this.addChild(bestScoreText);
        this.height = bestScoreText.y + (bestScoreText.getMeasuredLineHeight() * 2);
    };

    levelButton.createLockIcon = function () {
        var lockIcon,
            spriteFrame = 'levelSelectLock',
            spriteWidth = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[spriteFrame][0]][2],
            spriteHeight = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[spriteFrame][0]][3],
            button = this.getChildByName('button'),
            regx = spriteWidth * 0.5,
            regy = spriteHeight * 0.5,
            rotation = 15;

        lockIcon = new createjs.Sprite(this.spriteData, spriteFrame);
        lockIcon.setTransform(this.width * 0.5, button.y + (button.height * 0.5), 1, 1, rotation, 0, 0, regx, regy);
        lockIcon.framerate = 0;
        lockIcon.name = 'lock';
        lockIcon.visible = this.isLocked;
        if (this.isChallengeGame) {
            lockIcon.filters = [this.buttonPrimaryColorFilter];
            lockIcon.cache(0, 0, spriteWidth, spriteHeight);
        }
        this.addChild(lockIcon);
    };

    levelButton.createGemIcon = function () {
        var gemIcon,
            spriteFrame = 'mapAwardLand' + this.landNumber.toString(),
            spriteSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.mapSpritesheetFrames, spriteFrame),
            button = this.getChildByName('button'),
            regx = spriteSize.width * 0.5,
            regy = spriteSize.height * 0.5,
            rotation = 0;

        gemIcon = new createjs.Sprite(this.spriteData, spriteFrame);
        gemIcon.setTransform(this.width * 0.5, button.y + (button.height * 0.5), 1, 1, rotation, 0, 0, regx, regy);
        gemIcon.framerate = 0;
        gemIcon.name = 'award';
        gemIcon.visible = ! this.isLocked && this.userBeatChallenge;
        this.addChild(gemIcon);
    };

    levelButton.createStars = function () {
        var i,
            star,
            spriteFrame = "mapStarUnearned",
            spriteWidth = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[spriteFrame][0]][2],
            spriteHeight = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[spriteFrame][0]][3],
            regx = spriteWidth * 0.5,
            regy = spriteHeight * 2,
            x,
            y = regy,
            rotation,
            showStar;

        for (i = 0; i < this.maxStars; i ++) {
            if (i < this.starsEarned) {
                spriteFrame = 'mapStarEarned';
            } else {
                spriteFrame = 'mapStarUnearned';
            }
            if (i == 0) {
                rotation = -45;
                x = spriteWidth * 1.5;
            } else if (i == 2) {
                rotation = 45;
            } else {
                rotation = 0;
                x += spriteWidth * 0.05;
            }
            star = new createjs.Sprite(this.spriteData, spriteFrame);
            star.setTransform(x, y, 1, 1, rotation, 0, 0, regx, regy);
            star.framerate = 0;
            star.name = 'star' + (i + 1);
            if (this.isChallengeGame) {
                showStar = ! this.isLocked && this.showStarsForChallenge;
            } else {
                showStar = ! this.isLocked;
            }
            star.visible = showStar;
            this.addChild(star);
        }
        this.nextYPosition = spriteHeight * 1.1;
        this.width = (spriteWidth * 3);
    };

    levelButton.showStars = function (showFlag) {
        var i,
            star,
            showStar;

        for (i = 0; i < this.maxStars; i ++) {
            star = this.getChildByName('star' + (i + 1));
            if (star != null) {
                if (i < this.starsEarned) {
                    star.gotoAndStop('mapStarEarned');
                } else {
                    star.gotoAndStop('mapStarUnearned');
                }
                if (this.isChallengeGame) {
                    showStar = ! this.isLocked && this.showStarsForChallenge;
                } else {
                    showStar = ! this.isLocked;
                }
                star.visible = showStar;
            }
        }
        this.changeEvent();
    };

    levelButton.removeStars = function () {
        var i,
            star;

        for (i = 0; i < this.maxStars; i ++) {
            star = this.getChildByName('star' + i);
            if (star != null) {
                this.removeChild(star);
            }
        }
    };

    levelButton.createButton = function () {
        var spriteFrameBase = null, // a reference sprite frame, they should all be the same size
            spriteFrameRing,
            spriteFrameRingOver,
            spriteFrameCircle,
            gameButton,
            buttonRing,
            rollOverFrame,
            spriteWidth,
            spriteHeight,
            hitArea,
            buttonPrimaryColor = MemoryMatch.htmlColorStringToColorArray(this.primaryColor),
            buttonSecondaryColor = MemoryMatch.htmlColorStringToColorArray(this.secondaryColor);

        this.buttonPrimaryColorFilter = new createjs.ColorFilter(0, 0, 0, 1, buttonPrimaryColor[0], buttonPrimaryColor[1], buttonPrimaryColor[2], 0);
        this.buttonSecondaryColorFilter = new createjs.ColorFilter(0, 0, 0, 1, buttonSecondaryColor[0], buttonSecondaryColor[1], buttonSecondaryColor[2], 0);
        levelButton.createStars();
        if (this.isChallengeGame) {
            spriteFrameBase = 'bossBase';
            spriteFrameCircle = 'bossCircle';
            spriteFrameRing = 'bossRing';
            spriteFrameRingOver = 'bossRingOver';
        } else {
            spriteFrameBase = 'levelSelectCircle';
            spriteFrameRing = 'levelSelectRing';
            spriteFrameRingOver = 'levelSelectRingOver';
            spriteFrameCircle = null;
        }
        spriteWidth = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[spriteFrameBase][0]][2] * this.buttonScale;
        spriteHeight = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[spriteFrameBase][0]][3] * this.buttonScale;
        if (this.width < spriteWidth) {
            this.width = spriteWidth;
        }
        gameButton = new createjs.Sprite(this.spriteData, spriteFrameBase);
        gameButton.setTransform(this.width * 0.5, this.nextYPosition, this.buttonScale, this.buttonScale, 0, 0, 0, spriteWidth * 0.5, 0);
        gameButton.framerate = 0;
        gameButton.name = 'button';
        gameButton.filters = [this.buttonSecondaryColorFilter];
        gameButton.cache(0, 0, spriteWidth, spriteHeight);
        gameButton.width = spriteWidth;
        gameButton.height = spriteHeight;
        this.addChildAt(gameButton, 0);
        if (spriteFrameCircle != null) {
            buttonRing = new createjs.Sprite(this.spriteData, spriteFrameCircle);
            buttonRing.setTransform(this.width * 0.5, this.nextYPosition, this.buttonScale, this.buttonScale, 0, 0, 0, spriteWidth * 0.5, 0);
            buttonRing.framerate = 0;
            buttonRing.name = 'circle';
            buttonRing.visible = ! (this.isLocked || ! this.wasPlayed) || this.isChallengeGame;
            this.addChild(buttonRing);
        }
        buttonRing = new createjs.Sprite(this.spriteData, spriteFrameRing);
        buttonRing.setTransform(this.width * 0.5, this.nextYPosition, this.buttonScale, this.buttonScale, 0, 0, 0, spriteWidth * 0.5, 0);
        buttonRing.framerate = 0;
        buttonRing.name = 'ring';
        if (this.isChallengeGame) {
            buttonRing.filters = [this.buttonPrimaryColorFilter];
            buttonRing.cache(0, 0, spriteWidth, spriteHeight);
        }
        buttonRing.visible = ! (this.isLocked || ! this.wasPlayed) || this.isChallengeGame;
        this.addChild(buttonRing);

        rollOverFrame = new createjs.Sprite(this.spriteData, spriteFrameRingOver);
        rollOverFrame.setTransform(this.width * 0.5, this.nextYPosition, this.buttonScale, this.buttonScale, 0, 0, 0, spriteWidth * 0.5, 0);
        rollOverFrame.visible = false;
        rollOverFrame.name = 'rollover';
        if (this.isChallengeGame) {
            rollOverFrame.filters = [this.buttonPrimaryColorFilter];
            rollOverFrame.cache(0, 0, spriteWidth, spriteHeight);
        }
        this.addChild(rollOverFrame);

        this.nextYPosition += spriteHeight;
        levelButton.createLockIcon();
        if (this.isChallengeGame) {
            levelButton.createGemIcon();
        }
        levelButton.createGameNumberText();
        levelButton.createBestScoreText();
        levelButton.cache(0, 0, this.width, this.height);
        hitArea = new createjs.Shape();
        hitArea.graphics.beginFill("#ff0000").drawRect(0, 0, this.width, this.height);
        levelButton.hitArea = hitArea;
        if ( ! this.isLocked) {
            this.setEnabled(true);
        }
    };

    levelButton.refreshButton = function (parameters) {
        this.setParameters(parameters);
        this.coordinateDisplayInformation();
    };

    levelButton.onLevelSelect = function (event) {
        var that;
        if (event != null && event.target != null) {
            that = event.target;
            if (that.callback == null) {
                that = event.target.parent;
            }
            if (that.callback != null) {
                MemoryMatch.triggerSoundFx("soundTap");
                that.callback(that.gameNumber);
            }
        }
    };

    levelButton.onRollover = function (event) {
        var rollOverFrame = this.getChildByName('rollover'),
            gameNumberText = this.getChildByName('gameNumber');

        if (rollOverFrame != null) {
            rollOverFrame.visible = true;
        }
        if (gameNumberText != null) {
            gameNumberText.color = this.liteColor;
        }
        this.changeEvent();
    };

    levelButton.onRollout = function (event) {
        var rollOverFrame = this.getChildByName('rollover'),
            gameNumberText = this.getChildByName('gameNumber');

        if (rollOverFrame != null) {
            rollOverFrame.visible = false;
        }
        if (gameNumberText != null) {
            gameNumberText.color = this.isChallengeGame ? this.primaryColor : MemoryMatch.GameSetup.mapLevelColor;
        }
        this.changeEvent();
    };

    levelButton.onTouchDown = function (event) {
        if (MemoryMatch.isTouchDevice) {
            this.onRollover(event);
        }
    };

    levelButton.onTouchUp = function (event) {
        if (MemoryMatch.isTouchDevice) {
            this.onRollout(event);
        }
    };

    levelButton.show = function (showFlag) {
        this.visible = showFlag;
        this.changeEvent();
    };

    levelButton.setGameNumber = function (gameNumber) {
        var gameNumberField = this.getChildByName("gameNumber");

        this.gameNumber = gameNumber;
        if (gameNumberField != null) {
            gameNumberField.text = this.gameNumber.toString(); // (this.gameNumber + MemoryMatch.getGameLevelNumberOffset(this.landNumber)).toString();
        }
    };

    levelButton.setStarsEarned = function (numberOfStars) {
        this.showStars(false);
        if (numberOfStars < 0) {
            numberOfStars = 0;
        } else if (numberOfStars > this.maxStars) {
            numberOfStars = this.maxStars;
        }
        this.starsEarned = numberOfStars;
        if (numberOfStars >= 0) {
            this.showStars(true);
        }
    };

    levelButton.setBestScore = function (newScore) {
        this.bestScore = newScore;
        this.coordinateDisplayInformation();
    };

    levelButton.setIsLocked = function (isLocked) {
        this.isLocked = isLocked;
        this.coordinateDisplayInformation();
    };

    levelButton.setWasPlayed = function (wasPlayed) {
        this.wasPlayed = wasPlayed;
        this.coordinateDisplayInformation();
    };

    levelButton.coordinateDisplayInformation = function () {

        // Make sure the level button agrees with the state of the game for this user

        var bestScoreField = this.getChildByName("bestScore"),
            gameNumberText = this.getChildByName("gameNumber"),
            buttonRing = this.getChildByName("ring"),
            lockIcon = this.getChildByName("lock"),
            gemIcon,
            showStarsFlag = false;

        if (this.gameNumber == 1 || this.wasPlayed) {
            this.isLocked = false;
        }
        if (this.isChallengeGame) {
            gemIcon = this.getChildByName("award");
            if (gemIcon != null) {
                gemIcon.visible = false;
            }
        }
        if (this.isLocked) {
            this.setEnabled(false);
            lockIcon.visible = true;
            bestScoreField.visible = false;
            gameNumberText.visible = false;
            buttonRing.visible = this.isChallengeGame;
        } else {
            this.setEnabled(true);
            lockIcon.visible = false;
            if (this.wasPlayed) {
                if (this.isChallengeGame && this.userBeatChallenge) { // challenge game and user passed challenge
                    if (gemIcon != null) {
                        gemIcon.visible = true;
                        gameNumberText.visible = false;
                    }
                } else {
                    gameNumberText.visible = true;
                }
                bestScoreField.visible = true;
                bestScoreField.text = MemoryMatch.formatNumberWithGroups(this.bestScore);
                buttonRing.visible = true;
                if (this.isChallengeGame) {
                    showStarsFlag = ! this.isLocked && this.showStarsForChallenge;
                } else {
                    showStarsFlag = ! this.isLocked;
                }
            } else {
                gameNumberText.visible = true;
                bestScoreField.visible = false;
                buttonRing.visible = false;
            }
        }
        this.showStars(showStarsFlag);
        if (showStarsFlag) {
            this.setStarsEarned(this.starsEarned);
        }
        this.changeEvent();
        MemoryMatch.stageUpdated = true;
    };

    levelButton.setEnabled = function (enableFlag) {
        if (enableFlag) {
            levelButton.cursor = 'pointer';
            this.addEventListener("click", this.onLevelSelect);
            this.addEventListener("rollover", this.onRollover.bind(this));
            this.addEventListener("rollout", this.onRollout.bind(this));
            this.addEventListener("mousedown", this.onTouchDown.bind(this));
            this.addEventListener("pressup", this.onTouchUp.bind(this));
            this.addEventListener("rollout", this.onTouchUp.bind(this));
        } else {
            levelButton.cursor = null;
            this.removeEventListener("click", this.onLevelSelect);
            this.removeEventListener("rollover", this.onRollover.bind(this));
            this.removeEventListener("rollout", this.onRollout.bind(this));
            this.removeEventListener("mousedown", this.onTouchDown.bind(this));
            this.removeEventListener("pressup", this.onTouchUp.bind(this));
            this.removeEventListener("rollout", this.onTouchUp.bind(this));
        }
    };

    levelButton.kill = function () {
        var buttonRing,
            rolloverFrame,
            lockIcon,
            gameButton = this.getChildByName("button");

        this.setEnabled(false);
        if (this.isChallengeGame) {
            buttonRing = this.getChildByName("ring");
            if (buttonRing != null) {
                buttonRing.uncache();
            }
            rolloverFrame = this.getChildByName("rollover");
            if (rolloverFrame != null) {
                rolloverFrame.uncache();
            }
            lockIcon = this.getChildByName("lock");
            if (lockIcon != null) {
                lockIcon.uncache();
            }
        }
        if (gameButton != null) {
            gameButton.uncache();
        }
        this.shadowSource = null;
        this.callback = null;
        this.spriteData = null;
        this.uncache();
        this.removeAllChildren();
    };

    levelButton.toString = function() {
        return "[LevelButton] gameNumber: " + levelButton.gameNumber.toString();
    };

    levelButton.changeEvent = function () {
        this.updateCache();
        MemoryMatch.stageUpdated = true;
        if (this.changeEventNotification != null) {
            this.changeEventNotification();
        }
    };

    levelButton.setParameters(parameters);
    levelButton.createButton();
    return levelButton;
};
