/**
 * Nemesis.js
 *
 * Handle all the logic to control the Nemesis Character and tile layout.
 * Use this object in the following interface:
 * 1. layoutNemesisPath will place all Nemesis sprites on the display object
 * 2. moveNemesisCharacter will update the state of the sprites based on number of misses. Typically called when player misses.
 * 3. awakeNemesisCharacter will show an animation when player makes a match or on idle.
 * 4. removeNemesisCharacter when Nemesis games is over and remove sprites from stage
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.Nemesis = {
    nemesisGroupDisplayObject: null,
    parentDisplayObject: null,
    spriteFrameData: null,
    bottleTopFilled: "nemesis1",
    bottleTopEmpty: "nemesis1Empty",
    bottleNeckFilled: "nemesis2",
    bottleNeckEmpty: "nemesis2Empty",
    bottleNeckEmptyEmpty: "nemesis2Empty2",
    bottleSectionFilled: "nemesis3",
    bottleSectionEmpty: "nemesis3Empty",
    bottleSectionEmptyEmpty: "nemesis3Empty2",
    bottleBottomFilled: "nemesis4",
    bottleBottomEmpty: "nemesis4Empty",
    maxNumberOfPieces: 0, // Total bottle size in pieces

    layoutNemesisPath: function (parentDisplayObject) {

        // function to call to initialize and layout the Nemesis tiles and setup the character

        var spriteData,
            missCounter,
            topPieceSize,
            middlePieceSize,
            tileSize,
            nextY,
            i,
            bottleTopSprite,
            bottleNeckSprite,
            bottleMiddleSprite,
            bottleMiddleSpriteCloned,
            bottleBottomSprite,
            numberOfMiddlePieces,
            groupWidth,
            groupCenterX,
            thisGameData,
            gameProgressionData;

        this.parentDisplayObject = parentDisplayObject;
        // find the highest tolerance, make the wine bottle that big
        thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
        if (thisGameData.progression != null && thisGameData.progression.length >= MemoryMatch.gameNumber) {
            this.maxNumberOfPieces = 0;
            gameProgressionData = thisGameData.progression;
            for (i = 0; i < gameProgressionData.length; i ++) {
                if (this.maxNumberOfPieces < gameProgressionData[i].tolerance) {
                    this.maxNumberOfPieces = gameProgressionData[i].tolerance;
                }
            }
        } else {
            this.maxNumberOfPieces = thisGameData.tolerance;
        }
        if (this.maxNumberOfPieces == null || this.maxNumberOfPieces < 3) {
            this.maxNumberOfPieces = 3;
        }
        this.spriteFrameData = MemoryMatch.GameSetup.guiSpritesheet2Frames;
        spriteData = new createjs.SpriteSheet(this.spriteFrameData);

        if (this.nemesisGroupDisplayObject == null) {
            this.nemesisGroupDisplayObject = new createjs.Container();
            parentDisplayObject.addChild(this.nemesisGroupDisplayObject);
        } else {
            this.nemesisGroupDisplayObject.removeAllChildren();
        }
        numberOfMiddlePieces = this.maxNumberOfPieces - 3;
        nextY = 0;
        missCounter = 1;
        bottleTopSprite = new createjs.Sprite(spriteData, this.bottleTopFilled);
        bottleTopSprite.framerate = 1;
        bottleTopSprite.name = 'miss' + missCounter.toString();
        bottleTopSprite.gotoAndStop(this.bottleTopFilled);
        topPieceSize = MemoryMatch.getSpriteFrameSize(this.spriteFrameData, this.bottleTopFilled);

        missCounter ++;
        bottleNeckSprite = new createjs.Sprite(spriteData, this.bottleNeckFilled);
        bottleNeckSprite.framerate = 1;
        bottleNeckSprite.name = 'miss' + missCounter.toString();
        bottleNeckSprite.gotoAndStop(this.bottleNeckFilled);
        tileSize = MemoryMatch.getSpriteFrameSize(this.spriteFrameData, this.bottleNeckFilled);
        groupWidth = tileSize.width; // all remaining pieces have the same width
        groupCenterX = (groupWidth * 0.5) | 0;

        bottleTopSprite.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, (topPieceSize.width * 0.5) | 0, 0);
        nextY += topPieceSize.height;
        bottleNeckSprite.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, groupCenterX, 0);
        nextY += tileSize.height;
        this.nemesisGroupDisplayObject.addChild(bottleTopSprite);
        this.nemesisGroupDisplayObject.addChild(bottleNeckSprite);

        bottleMiddleSprite = new createjs.Sprite(spriteData, this.bottleSectionFilled);
        bottleMiddleSprite.framerate = 1;
        bottleMiddleSprite.gotoAndStop(this.bottleSectionFilled);
        middlePieceSize = MemoryMatch.getSpriteFrameSize(this.spriteFrameData, this.bottleSectionFilled);
        for (i = 0; i < numberOfMiddlePieces; i ++) {
            missCounter ++;
            if (i == 0) {
                bottleMiddleSpriteCloned = bottleMiddleSprite;
            } else {
                bottleMiddleSpriteCloned = bottleMiddleSprite.clone();
            }
            this.nemesisGroupDisplayObject.addChild(bottleMiddleSpriteCloned);
            bottleMiddleSpriteCloned.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, (middlePieceSize.width * 0.5) | 0, 0);
            bottleMiddleSpriteCloned.name = 'miss' + missCounter.toString();
            nextY += middlePieceSize.height;
        }

        missCounter ++;
        bottleBottomSprite = new createjs.Sprite(spriteData, this.bottleBottomFilled);
        bottleBottomSprite.framerate = 1;
        bottleBottomSprite.name = 'miss' + missCounter.toString();
        bottleBottomSprite.gotoAndStop(this.bottleBottomFilled);
        tileSize = MemoryMatch.getSpriteFrameSize(this.spriteFrameData, this.bottleBottomFilled);
        bottleBottomSprite.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, (tileSize.width * 0.5) | 0, 0);
        nextY += tileSize.height;
        this.nemesisGroupDisplayObject.addChild(bottleBottomSprite);

        this.nemesisGroupDisplayObject.setTransform((MemoryMatch.stageWidth - tileSize.width - (tileSize.width * 0.14)) | 0, ((MemoryMatch.stageHeight - nextY) * 0.5) | 0, 1, 1, 0, 0, 0, 0, 0);
        this.moveNemesisCharacter();
        MemoryMatch.stageUpdated = true;
    },

    layoutNemesisDemo: function (parentDisplayObject, x, y, scale) {

        // function to call to initialize and layout the Nemesis tiles for demo purposes

        var spriteData,
            spriteFrameData,
            groupDisplayObject,
            missCounter,
            topPieceSize,
            middlePieceSize,
            tileSize,
            nextY,
            i,
            maxNumberOfPieces,
            bottleTopSprite,
            bottleNeckSprite,
            bottleMiddleSprite,
            bottleMiddleSpriteCloned,
            bottleBottomSprite,
            numberOfMiddlePieces,
            groupWidth,
            groupCenterX,
            thisGameData,
            gameProgressionData;

        // find the highest tolerance, make the wine bottle that big
        thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
        if (thisGameData.progression != null && thisGameData.progression.length >= MemoryMatch.gameNumber) {
            maxNumberOfPieces = 0;
            gameProgressionData = thisGameData.progression;
            for (i = 0; i < gameProgressionData.length; i ++) {
                if (maxNumberOfPieces < gameProgressionData[i].tolerance) {
                    maxNumberOfPieces = gameProgressionData[i].tolerance;
                }
            }
        } else {
            maxNumberOfPieces = thisGameData.tolerance;
        }
        if (maxNumberOfPieces == null || maxNumberOfPieces < 3) {
            maxNumberOfPieces = 3;
        }
        spriteFrameData = MemoryMatch.GameSetup.guiSpritesheet2Frames;
        spriteData = new createjs.SpriteSheet(spriteFrameData);

        groupDisplayObject = new createjs.Container();
        groupDisplayObject.name = 'nemesisContainer';
        groupDisplayObject.maxNumberOfPieces = maxNumberOfPieces;
        numberOfMiddlePieces = maxNumberOfPieces - 3;
        nextY = 0;
        missCounter = 1;
        bottleTopSprite = new createjs.Sprite(spriteData, this.bottleTopFilled);
        bottleTopSprite.framerate = 1;
        bottleTopSprite.name = 'miss' + missCounter.toString();
        bottleTopSprite.gotoAndStop(this.bottleTopFilled);
        topPieceSize = MemoryMatch.getSpriteFrameSize(spriteFrameData, this.bottleTopFilled);

        missCounter ++;
        bottleNeckSprite = new createjs.Sprite(spriteData, this.bottleNeckFilled);
        bottleNeckSprite.framerate = 1;
        bottleNeckSprite.name = 'miss' + missCounter.toString();
        bottleNeckSprite.gotoAndStop(this.bottleNeckFilled);
        tileSize = MemoryMatch.getSpriteFrameSize(spriteFrameData, this.bottleNeckFilled);
        groupWidth = tileSize.width; // all remaining pieces have the same width
        groupCenterX = (groupWidth * 0.5) | 0;

        bottleTopSprite.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, (topPieceSize.width * 0.5) | 0, 0);
        nextY += topPieceSize.height;
        bottleNeckSprite.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, groupCenterX, 0);
        nextY += tileSize.height;
        groupDisplayObject.addChild(bottleTopSprite);
        groupDisplayObject.addChild(bottleNeckSprite);

        bottleMiddleSprite = new createjs.Sprite(spriteData, this.bottleSectionFilled);
        bottleMiddleSprite.framerate = 1;
        bottleMiddleSprite.gotoAndStop(this.bottleSectionFilled);
        middlePieceSize = MemoryMatch.getSpriteFrameSize(spriteFrameData, this.bottleSectionFilled);
        for (i = 0; i < numberOfMiddlePieces; i ++) {
            missCounter ++;
            if (i == 0) {
                bottleMiddleSpriteCloned = bottleMiddleSprite;
            } else {
                bottleMiddleSpriteCloned = bottleMiddleSprite.clone();
            }
            groupDisplayObject.addChild(bottleMiddleSpriteCloned);
            bottleMiddleSpriteCloned.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, (middlePieceSize.width * 0.5) | 0, 0);
            bottleMiddleSpriteCloned.name = 'miss' + missCounter.toString();
            nextY += middlePieceSize.height;
        }
        missCounter ++;
        bottleBottomSprite = new createjs.Sprite(spriteData, this.bottleBottomFilled);
        bottleBottomSprite.framerate = 1;
        bottleBottomSprite.name = 'miss' + missCounter.toString();
        bottleBottomSprite.gotoAndStop(this.bottleBottomFilled);
        tileSize = MemoryMatch.getSpriteFrameSize(spriteFrameData, this.bottleBottomFilled);
        bottleBottomSprite.setTransform(groupCenterX, nextY, 1, 1, 0, 0, 0, (tileSize.width * 0.5) | 0, 0);
        nextY += tileSize.height;
        groupDisplayObject.addChild(bottleBottomSprite);

        groupDisplayObject.setTransform((x - tileSize.width - (tileSize.width * 0.14)) | 0, y, scale, scale, 0, 0, 0, 0, nextY * 0.5);
        parentDisplayObject.addChild(groupDisplayObject);
    },

    moveNemesisCharacter: function () {

        // function called when the Nemesis character should advance.
        // Based on number of misses update all the sections.

        var spritePiece,
            emptyPieces = this.maxNumberOfPieces - MemoryMatch.levelTolerance + MemoryMatch.missCount,
            nextFrame,
            i;

        for (i = 1; i <= this.maxNumberOfPieces; i ++) {
            spritePiece = this.nemesisGroupDisplayObject.getChildByName('miss' + i.toString());
            if (spritePiece != null) {
                if (i <= emptyPieces) { // set to empty
                    if (i == 1) { // top
                        nextFrame = this.bottleTopEmpty;
                    } else if (i == 2) { // neck
                        if (emptyPieces > i) {
                            nextFrame = this.bottleNeckEmptyEmpty;
                        } else {
                            nextFrame = this.bottleNeckEmpty;
                        }
                    } else if (i == this.maxNumberOfPieces) { // bottom
                        nextFrame = this.bottleBottomEmpty;
                    } else { // middle
                        if (emptyPieces > i) {
                            nextFrame = this.bottleSectionEmptyEmpty;
                        } else {
                            nextFrame = this.bottleSectionEmpty;
                        }
                    }
                } else {
                    if (i == 1) { // top
                        nextFrame = this.bottleTopFilled;
                    } else if (i == 2) { // neck
                        nextFrame = this.bottleNeckFilled;
                    } else if (i == this.maxNumberOfPieces) { // bottom
                        nextFrame = this.bottleBottomFilled;
                    } else { // middle
                        nextFrame = this.bottleSectionFilled;
                    }
                }
            }
            spritePiece.gotoAndStop(nextFrame);
        }
    },

    moveNemesisCharacterDemo: function (parentDisplayObject, missCount) {

        // function called when the Nemesis character should advance.
        // Based on number of misses update all the sections.

        var spritePiece,
            groupDisplayObject,
            maxNumberOfPieces,
            emptyPieces,
            nextFrame,
            i;

        if (parentDisplayObject == null) {
            return;
        }
        groupDisplayObject = parentDisplayObject.getChildByName('nemesisContainer');
        if (groupDisplayObject != null) {
            maxNumberOfPieces = groupDisplayObject.maxNumberOfPieces;
            emptyPieces = missCount;
            for (i = 1; i <= maxNumberOfPieces; i ++) {
                spritePiece = groupDisplayObject.getChildByName('miss' + i.toString());
                if (spritePiece != null) {
                    if (i <= emptyPieces) { // set to empty
                        if (i == 1) { // top
                            nextFrame = this.bottleTopEmpty;
                        } else if (i == 2) { // neck
                            if (emptyPieces > i) {
                                nextFrame = this.bottleNeckEmptyEmpty;
                            } else {
                                nextFrame = this.bottleNeckEmpty;
                            }
                        } else if (i == maxNumberOfPieces) { // bottom
                            nextFrame = this.bottleBottomEmpty;
                        } else { // middle
                            if (emptyPieces > i) {
                                nextFrame = this.bottleSectionEmptyEmpty;
                            } else {
                                nextFrame = this.bottleSectionEmpty;
                            }
                        }
                    } else {
                        if (i == 1) { // top
                            nextFrame = this.bottleTopFilled;
                        } else if (i == 2) { // neck
                            nextFrame = this.bottleNeckFilled;
                        } else if (i == maxNumberOfPieces) { // bottom
                            nextFrame = this.bottleBottomFilled;
                        } else { // middle
                            nextFrame = this.bottleSectionFilled;
                        }
                    }
                }
                spritePiece.gotoAndStop(nextFrame);
            }
        }
    },

    awakeNemesisCharacter: function () {

        // function to call to update a Nemesis character animation. Only advance animation if character is in the idle state.

    },

    removeNemesisCharacter: function () {

        // function to call to remove the Nemesis from the stage.

        if (this.nemesisGroupDisplayObject != null) {
            this.spriteFrameData = null;
            this.nemesisGroupDisplayObject.removeAllChildren();
            this.parentDisplayObject.removeChild(this.nemesisGroupDisplayObject);
            this.nemesisCharacterSprite = null;
            this.nemesisGroupDisplayObject = null;
            MemoryMatch.stageUpdated = true;
        }
    },

    moveNemesisCharacterComplete: function () {
        if (this.nemesisCharacterSprite != null) {
            this.nemesisCharacterSprite.gotoAndStop("stand");
            MemoryMatch.stageUpdated = true;
        }
    },

    scale: function(scaleFactor) {
        if (scaleFactor >= 0 && scaleFactor <= 1 && this.nemesisGroupDisplayObject != null) {
            this.nemesisGroupDisplayObject.scaleX = scaleFactor;
            this.nemesisGroupDisplayObject.scaleY = scaleFactor;
        }
    }
};
