/**
 * MainMenu.js
 *
 * Show the main menu screen. This object just layouts out the screen, animates the pieces,
 * and waits for the user to make a choice. The callback is used to indicate which choice was
 * made by the user.
 *
 */

MemoryMatch.MainMenu = {
    stateCompleteCallback: null,
    levelData: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    awardSprite: null,
    spriteData: null,
    mapSpriteFrames: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    width: 0,
    height: 0,
    connectorShape: null,

    setup: function (displayObject, nextLevelData, stateCompleteCallbackFunction) {
        // use the level data to do any level-specific setup
        this.levelData = nextLevelData;
        this.stateCompleteCallback = stateCompleteCallbackFunction;
        this.parentDisplayObject = displayObject;
        this.backgroundWidth = displayObject.canvas.width;
        this.backgroundHeight = displayObject.canvas.height;
        this.mapSpriteFrames = MemoryMatch.GameSetup.mapSpritesheetFrames;
        this.spriteData = new createjs.SpriteSheet(this.mapSpriteFrames);
    },

    buildScreen: function (autoStart) {
        // layout the map
        this.width = this.parentDisplayObject.canvas.width;
        this.height = this.parentDisplayObject.canvas.height;
        this.groupDisplayObject = new createjs.Container();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.setupBackgroundAndGameLogo();
        this.setupLandImages();
        this.setupAward();
        this.setupLevelButtons();
        if (autoStart == null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
        // The entire Map is cached, so any updates will require a call to updateCache()
        this.groupDisplayObject.setTransform(0, 0, 1, 1);
        this.groupDisplayObject.cache(0, 0, this.width, this.height);
    },

    start: function () {
        // begin animation, then wait for user event to end this state and alert callback
        if (this.stateCompleteCallback != null) {
            // stateCompleteCallback();
        }
    },

    onContinue: function (levelNumber) {
        // begin animation, then wait for user event to end this state and alert callback
        if (MemoryMatch.MainMenu.stateCompleteCallback != null) {
            MemoryMatch.MainMenu.stateCompleteCallback(levelNumber);
        }
        MemoryMatch.MainMenu.killScreen();
    },

    setupBackgroundAndGameLogo: function () {
        // Show Hero image
        var spriteFrame = 'gameLogo',
            imageSprite = new createjs.Sprite(this.spriteData, spriteFrame),
            position = MemoryMatch.GameSetup.mapLogoPosition,
            spriteSize = MemoryMatch.getSpriteFrameSize(this.mapSpriteFrames, spriteFrame);

        if (position == null) {
            position = {x: this.width * 0.5, y: this.height * 0.5};
            imageSprite.setTransform(position.x, position.y, 1, 1, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
        } else {
            imageSprite.setTransform(position.x * MemoryMatch.stageScaleFactor, position.y * MemoryMatch.stageScaleFactor, 1, 1, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
        }
        imageSprite.framerate = 0;
        this.groupDisplayObject.addChild(imageSprite);
    },

    setupLandImages: function () {
        // Show map parts
        var i,
            mapImage,
            mapPosition,
            imageSprite,
            spriteSize;

        for (i = 0; i < MemoryMatch.GameSetup.levels.length; i ++) {
            mapImage = MemoryMatch.GameSetup.levels[i].mapImage;
            if (mapImage != null && mapImage.length > 0) {
                mapPosition = MemoryMatch.GameSetup.levels[i].mapPosition;
                imageSprite = new createjs.Sprite(this.spriteData, mapImage);
                if (imageSprite != null) {
                    spriteSize = MemoryMatch.getSpriteFrameSize(this.mapSpriteFrames, mapImage);
                    imageSprite.setTransform(mapPosition.x * MemoryMatch.stageScaleFactor, mapPosition.y * MemoryMatch.stageScaleFactor, 1, 1, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
                    imageSprite.framerate = 0;
                    this.groupDisplayObject.addChild(imageSprite);
                }
            }
        }
        this.showSpecialCrap();
    },

    setupAward: function () {
        // Show Award
        var spriteFrame = 'mapTrophy',
            imageSprite = new createjs.Sprite(this.spriteData, spriteFrame),
            awardPosition = MemoryMatch.GameSetup.mapAwardPosition,
            position,
            spriteSize = MemoryMatch.getSpriteFrameSize(this.mapSpriteFrames, spriteFrame),
            i,
            gemPosition,
            gemName,
            landNumber,
            numberOfLevels = MemoryMatch.GameSetup.levels.length;

        if (awardPosition == null) {
            position = {x: (this.width - spriteSize.width) * 0.5, y: (this.height - spriteSize.height) * 0.5};
        } else {
            position = {x: awardPosition.x * MemoryMatch.stageScaleFactor, y: awardPosition.y * MemoryMatch.stageScaleFactor};
        }
        imageSprite.setTransform(position.x, position.y, 1, 1, 0, 0, 0, spriteSize.width * 0.5, spriteSize.height * 0.5);
        imageSprite.framerate = 0;
        this.groupDisplayObject.addChild(imageSprite);
        this.awardSprite = imageSprite;

        // position gems relative to award position, accounting for the center registration of the award sprite
        spriteFrame = 'mapAwardLand';
        position.x -= spriteSize.width * 0.5;
        position.y -= spriteSize.height * 0.5;
        for (i = 0; i < numberOfLevels; i ++) {
            landNumber = i + 1;
            gemName = spriteFrame + landNumber.toString();
            imageSprite = new createjs.Sprite(this.spriteData, gemName);
            gemPosition = MemoryMatch.GameSetup.levels[i].gemPosition;
            imageSprite.setTransform(position.x + (gemPosition.x * MemoryMatch.stageScaleFactor), position.y + (gemPosition.y * MemoryMatch.stageScaleFactor));
            imageSprite.name = gemName;
            imageSprite.visible = MemoryMatch.didUserBeatChallenge(landNumber);
            this.groupDisplayObject.addChild(imageSprite);
        }
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

    setupLevelButtons: function (groupDisplayObject) {

        // Each Level button will come from a data array in Setup.js representing the type of object and the
        // center of the rectangle

        var mapLevelPositions = MemoryMatch.GameSetup.mapLevelPositions,
            levelData = MemoryMatch.GameSetup.levels,
            levelMapPosition,
            landIndex,
            landNumber,
            levelIndexLandOffset,
            levelIndex,
            levelNumber,
            levelButton,
            gameNumber,
            starsEarned,
            bestScore,
            wasPlayed,
            isLocked,
            buttonScale,
            primaryColor,
            secondaryColor,
            gameScoresCollection,
            gameScoreData,
            totalGamesPlayed,
            gamesUnlocked,
            buttonBeforeThisOne;

        if (mapLevelPositions == null || levelData == null) {
            return;
        }
        levelIndexLandOffset = 0;
        totalGamesPlayed = 0;
        for (landIndex = 0; landIndex < levelData.length; landIndex ++) {
            landNumber = landIndex + 1;
            primaryColor = levelData[landIndex].primaryColor;
            secondaryColor = levelData[landIndex].secondaryColor;
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(landNumber, "levelScoreCollection");
            gamesUnlocked = gameScoresCollection.length;
            buttonBeforeThisOne = null;
            for (levelIndex = 0; levelIndex < levelData[landIndex].gameCount; levelIndex ++) {
                levelNumber = levelIndex + levelIndexLandOffset + 1;
                gameNumber = levelIndex + 1;
                if (mapLevelPositions[landIndex] != null && mapLevelPositions[landIndex].length > levelIndex) {
                    levelMapPosition = mapLevelPositions[landIndex][levelIndex];
                } else {
                    levelMapPosition = {x: 0, y: 0};
                }
                gameScoreData = MemoryMatch.getPriorScoreDataForGameNumber(gameNumber, gameScoresCollection);
                if (gameScoreData != null && gameScoreData.playCount > 0) {
                    wasPlayed = true;
                    totalGamesPlayed ++;
                    isLocked = false;
                    bestScore = gameScoreData.bestScore;
                    starsEarned = gameScoreData.starsEarned;
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
                buttonScale = 1;
                levelButton = MemoryMatch.LevelButton({gameNumber: levelNumber, landNumber: landNumber, starsEarned: starsEarned, bestScore: bestScore, wasPlayed: wasPlayed, isLocked: isLocked, isChallengeGame: false, primaryColor: primaryColor, secondaryColor: secondaryColor, scale: buttonScale, callback:this.onContinue.bind(this)});
                levelButton.x = levelMapPosition.x * MemoryMatch.stageScaleFactor;
                levelButton.y = levelMapPosition.y * MemoryMatch.stageScaleFactor;
                levelButton.name = this.makeLevelButtonName(landNumber, levelNumber);
                this.groupDisplayObject.addChild(levelButton);
                if (buttonBeforeThisOne != null) {
                    this.connectPath(buttonBeforeThisOne, levelButton);
                }
                buttonBeforeThisOne = levelButton;
            }
            levelNumber ++;
            gameNumber = 99;
            if (mapLevelPositions[landIndex] != null && mapLevelPositions[landIndex].length >= levelIndex) {
                levelMapPosition = mapLevelPositions[landIndex][levelIndex];
            } else {
                levelMapPosition = {x: 0, y: 0};
            }
            gameScoreData = MemoryMatch.getPriorScoreDataForGameNumber(gameNumber, gameScoresCollection);
            if (gameScoreData != null && gameScoreData.playCount > 0) {
                wasPlayed = true;
                totalGamesPlayed ++;
                isLocked = false;
                bestScore = gameScoreData.bestScore;
                starsEarned = gameScoreData.starsEarned;
            } else if (gameNumber <= gamesUnlocked || gamesUnlocked > levelData[landIndex].gameCount) {
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
            levelButton = MemoryMatch.LevelButton({gameNumber: levelNumber, landNumber: landNumber, starsEarned: starsEarned, bestScore: bestScore, wasPlayed: wasPlayed, isLocked: isLocked, isChallengeGame: true, primaryColor: primaryColor, secondaryColor: secondaryColor, scale: buttonScale, callback:this.onContinue.bind(this)});
            levelButton.x = levelMapPosition.x * MemoryMatch.stageScaleFactor;
            levelButton.y = levelMapPosition.y * MemoryMatch.stageScaleFactor;
            levelButton.name = this.makeLevelButtonName(landNumber, levelNumber);
            if (buttonBeforeThisOne != null) {
                this.connectPath(buttonBeforeThisOne, levelButton);
            }
            this.groupDisplayObject.addChild(levelButton);
            levelIndexLandOffset += levelData[landIndex].gameCount + 1;
        }
    },

    refreshButtons: function () {

        // Update the state of all level buttons and the Award

        var levelData = MemoryMatch.GameSetup.levels,
            landIndex,
            landNumber,
            levelIndexLandOffset,
            levelIndex,
            levelNumber,
            levelButton,
            gameNumber,
            starsEarned,
            bestScore,
            wasPlayed,
            isLocked,
            gameScoresCollection,
            gameScoreData,
            totalGamesPlayed,
            gamesUnlocked;

        if (levelData == null || ! this.isShowing()) {
            return;
        }
        levelIndexLandOffset = 0;
        totalGamesPlayed = 0;
        for (landIndex = 0; landIndex < levelData.length; landIndex ++) {
            landNumber = landIndex + 1;
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(landNumber, "levelScoreCollection");
            gamesUnlocked = gameScoresCollection.length;
            for (levelIndex = 0; levelIndex < levelData[landIndex].gameCount; levelIndex ++) {
                levelNumber = levelIndex + levelIndexLandOffset + 1;
                gameNumber = levelIndex + 1;
                gameScoreData = MemoryMatch.getPriorScoreDataForGameNumber(gameNumber, gameScoresCollection);
                if (gameScoreData != null && gameScoreData.playCount > 0) {
                    wasPlayed = true;
                    totalGamesPlayed ++;
                    isLocked = false;
                    bestScore = gameScoreData.bestScore;
                    starsEarned = gameScoreData.starsEarned;
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
                levelButton = this.groupDisplayObject.getChildByName(this.makeLevelButtonName(landNumber, levelNumber));
                if (levelButton != null) {
                    levelButton.refreshButton({starsEarned: starsEarned, bestScore: bestScore, wasPlayed: wasPlayed, isLocked: isLocked});
                }
            }
            levelNumber ++;
            gameNumber = 99;
            gameScoreData = MemoryMatch.getPriorScoreDataForGameNumber(gameNumber, gameScoresCollection);
            if (gameScoreData != null && gameScoreData.playCount > 0) {
                wasPlayed = true;
                totalGamesPlayed ++;
                isLocked = false;
                bestScore = gameScoreData.bestScore;
                starsEarned = gameScoreData.starsEarned;
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
            levelButton = this.groupDisplayObject.getChildByName(this.makeLevelButtonName(landNumber, levelNumber));
            if (levelButton != null) {
                levelButton.refreshButton({starsEarned: starsEarned, bestScore: bestScore, wasPlayed: wasPlayed, isLocked: isLocked});
            }
            levelIndexLandOffset += levelData[landIndex].gameCount + 1;
        }
        this.showAwardedGems();
        this.groupDisplayObject.updateCache();
    },

    connectPath: function (firstPoint, secondPoint) {
        var lineShape,
            strokeColor;

        if (firstPoint != null && secondPoint != null && firstPoint.x != null && secondPoint.x != null) {
            lineShape = new createjs.Shape();
            strokeColor = MemoryMatch.GameSetup.mapPathColor;
            if (strokeColor == null || strokeColor == '') {
                strokeColor = 'rgba(102,102,102,0.5)';
            }
            lineShape.graphics.beginStroke(strokeColor).setStrokeStyle(12 * MemoryMatch.stageScaleFactor);
            lineShape.graphics.moveTo(firstPoint.x + (firstPoint.width * 0.5), firstPoint.y + (firstPoint.height * 0.5));
            lineShape.graphics.lineTo(secondPoint.x + (secondPoint.width * 0.5), secondPoint.y + (secondPoint.height * 0.5));
            lineShape.graphics.endStroke();
            this.groupDisplayObject.addChildAt(lineShape, this.groupDisplayObject.getChildIndex(firstPoint));
        }
    },

    showSpecialCrap: function () {
        // some levels/maps will require placing special markers and eye candy on the map, do that one-off crap here
        // markerData format is an array of objects {x, y, icon}

        var specialMarkers = MemoryMatch.GameSetup.mapSpecialMarkers,
            markerData,
            markerSprite,
            spriteWidth,
            spriteHeight,
            i;

        if (specialMarkers != null) {
            for (i = 0; i < specialMarkers.length; i ++) {
                markerData = specialMarkers[i];
                if (markerData.icon != null) {
                    markerSprite = new createjs.Sprite(this.spriteData, markerData.icon);
                    spriteWidth = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[markerData.icon][0]][2];
                    spriteHeight = MemoryMatch.GameSetup.mapSpritesheetFrames.frames[MemoryMatch.GameSetup.mapSpritesheetFrames.animations[markerData.icon][0]][3];
                    markerSprite.setTransform(markerData.x * MemoryMatch.stageScaleFactor, markerData.y * MemoryMatch.stageScaleFactor, 1, 1, 0, 0, 0, spriteWidth * 0.5, spriteHeight * 0.5);
                    this.groupDisplayObject.addChild(markerSprite);
                }
            }
        }
    },

    isShowing: function () {
        return this.groupDisplayObject != null && this.groupDisplayObject.visible;
    },

    makeLevelButtonName: function (landNumber, levelNumber) {
        return 'land' + landNumber.toString() + ':level' + levelNumber.toString();
    },

    killScreen: function () {
        // remove all display objects and references
        this.stateCompleteCallback = null;
        this.levelData = null;
        this.spriteData = null;
        this.mapSpriteFrames = null;
        this.awardSprite = null;
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.groupDisplayObject = null;
        this.parentDisplayObject = null;
        this.backgroundWidth = 0;
        this.backgroundHeight = 0;
        this.width = 0;
        this.height = 0;
    }
};
