/**
 * AchievementItem.js
 *
 * Build a display object representing an achievement.
 * An achievement item displays an icon, title, description, and points value
 * Construct one of these with a parameters object using this format:
 * {achievementId: 1, width: 300, height: 90, title: 'Title', message: 'Message', icon: 'iconCards', sound: 'soundAsset', borderColor:'#FFFFFF', backgroundColor: '#FFFFFF', callback: function}
 *
 */
// namespace to MemoryMatch
MemoryMatch = MemoryMatch || {};

(function() {

    'use strict';

    var AchievementItem = function(displayObject, parameters) {
        this.setParameters(displayObject, parameters);
        this.buildItem();
    };
    var p = AchievementItem.prototype;

    p.parentDisplayObject = null;
    p.groupDisplayObject = null;
    p.achievementId = null;
    p.x = 0;
    p.y = 0;
    p.width = -1;
    p.height = -1;
    p.marginTop = 0;
    p.marginLeft = 0;
    p.centerX = 0;
    p.marginX = 0;
    p.lineHeight = 0;
    p.title = null;
    p.message = null;
    p.value = null;
    p.icon = null;
    p.sound = null;
    p.borderColor = MemoryMatch.GameSetup.achievementBorderColor;
    p.backgroundColor = MemoryMatch.GameSetup.achievementBackgroundColor;
    p.fontColorEarned = MemoryMatch.GameSetup.achievementFontColorEarned;
    p.fontColorUnearned = MemoryMatch.GameSetup.achievementFontColorUnearned;
    p.autoClose = false;
    p.earned = true;

    p.setParameters = function (displayObject, parameters) {
        var achievementInfo;

        this.parentDisplayObject = displayObject;
        if (parameters !== null) {
            if (parameters.achievementId !== null) {
                this.achievementId = parameters.achievementId;
                achievementInfo = this.getAchievementInfo(this.achievementId);
                if (achievementInfo != null) {
                    this.title = achievementInfo.name;
                    this.message = achievementInfo.description;
                    this.icon = achievementInfo.icon;
                    this.value = achievementInfo.value;
                }
            }
            if (parameters.width != null) {
                this.width = parameters.width;
            } else if (this.width < 1) {
                this.width = (920 * MemoryMatch.stageScaleFactor) | 0;
            }
            if (parameters.height != null) {
                this.height = parameters.height;
            } else if (this.height < 1) {
                this.height = (290 * MemoryMatch.stageScaleFactor) | 0;
            }
            if (parameters.x != null) {
                this.x = parameters.x;
            } else if (this.x < 1) {
                this.x = (this.width * 0.5) | 0;
            }
            if (parameters.y != null) {
                this.y = parameters.y;
            } else if (this.y < 1) {
                this.y = this.parentDisplayObject.canvas.height - this.height;
            }
            if (parameters.title != null) {
                this.title = parameters.title;
            } else if (this.title === null) {
                this.title = "";
            }
            if (parameters.message != null) {
                this.message = parameters.message;
            } else if (this.message === null) {
                this.message = "";
            }
            if (parameters.value != null) {
                this.value = parameters.value;
            }
            if (parameters.icon != null) {
                this.icon = parameters.icon;
            } else if (this.icon === null) {
                this.icon = null;
            }
            if (parameters.backgroundColor != null) {
                this.backgroundColor = parameters.backgroundColor;
            }
            if (parameters.borderColor != null) {
                this.borderColor = parameters.borderColor;
            }
            if (parameters.sound != null) {
                this.sound = parameters.sound;
            }
            if (parameters.autoClose != null) {
                this.autoClose = parameters.autoClose;
            }
            if (parameters.earned != null) {
                this.earned = parameters.earned;
            }
        }
    };

    p.getAchievementInfo = function (achievementId) {
        return MemoryMatch.getAchievementInfo(achievementId);
    };

    p.getBounds = function () {
        return this.groupDisplayObject.getBounds();
    }

    p.buildItem = function () {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.marginTop = (8 * MemoryMatch.stageScaleFactor) | 0;
        this.marginLeft = (8 * MemoryMatch.stageScaleFactor) | 0;
        this.drawBackground();
        this.setupIcon();
        this.setupTitleText();
        this.setupDescriptionText();
        this.setupValueText();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.x, this.y, 1, 1, 0, 0, 0, (this.width * 0.5) | 0, (this.height * 0.5) | 0);
        this.groupDisplayObject.visible = true;
        if (this.autoClose) {
//            this.closeStartAnimation();
            window.setTimeout(this.closeStartAnimation.bind(this), 500);
        }
    };

    p.drawBackground = function () {
        var shape = new createjs.Shape();
        shape.x = 0;
        shape.y = 0;
        var graphics = shape.graphics;
        graphics.beginFill(this.backgroundColor);
        graphics.beginStroke(this.borderColor);
        graphics.setStrokeStyle(1);
        graphics.drawRoundRect(0, 0, this.width, this.height, 12);
        this.groupDisplayObject.addChild(shape);
        this.groupDisplayObject.setBounds(0, 0, this.width, this.height);
        return shape;
    };

    p.setupIcon = function () {
        // add the icon on top of the button frame, left-middle justified
        var colorFilter,
            spriteData,
            iconSize,
            iconSprite,
            iconScale = 1;

        if (this.icon != null) {
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
            iconSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, this.icon);
            iconSprite = new createjs.Sprite(spriteData, this.icon);
            iconSprite.setTransform((this.width * 0.005) | 0, (this.height * 0.5) | 0, iconScale, iconScale, 0, 0, 0, 0, (iconSize.height * 0.5) | 0);
            iconSprite.framerate = 1;
            iconSprite.name = "icon";
            if ( ! this.earned) {
                colorFilter = new createjs.ColorFilter(0.3, 0.3, 0.3, 1);
                iconSprite.filters = [colorFilter];
                iconSprite.cache(0, 0, iconSize.width, iconSize.height);
            }
            this.groupDisplayObject.addChild(iconSprite);
        }
    };

    p.setupTitleText = function () {
        var titleTextField;
        titleTextField = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(42) + " " + MemoryMatch.GameSetup.guiBoldFontName, (this.earned ? this.fontColorEarned : this.fontColorUnearned));
        titleTextField.textAlign = "center";
        titleTextField.x = (this.width * 0.5) | 0;
        titleTextField.y = (this.height * 0.1) | 0;
        titleTextField.lineWidth = (this.width * 0.8) | 0;
        titleTextField.maxWidth = (this.width * 0.8) | 0;
        titleTextField.name = "title";
        this.groupDisplayObject.addChild(titleTextField);
    };

    p.setupDescriptionText = function () {
        var titleTextField;
        var message;

        if (this.earned) {
            message = this.message;
        } else {
            message = '???';
        }
        titleTextField = new createjs.Text(message, MemoryMatch.getScaledFontSize(40) + " " + MemoryMatch.GameSetup.guiMediumFontName, (this.earned ? this.fontColorEarned : this.fontColorUnearned));
        titleTextField.textAlign = "left";
        titleTextField.x = (this.width * 0.28) | 0;
        titleTextField.y = (this.height * 0.36) | 0;
        titleTextField.lineWidth = (this.width * 0.72) | 0;
        titleTextField.maxWidth = (this.width * 0.72) | 0;
        titleTextField.lineHeight = titleTextField.getMeasuredLineHeight() * 1.2;
        titleTextField.name = "description";
        this.groupDisplayObject.addChild(titleTextField);
    };

    p.setupValueText = function () {
        var valueTextField;
        if (this.value != null) {
            valueTextField = new createjs.Text(this.value.toString(), MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiMediumFontName, (this.earned ? this.fontColorEarned : this.fontColorUnearned));
            valueTextField.textAlign = "right";
            valueTextField.x = (this.width * 0.96) | 0;
            valueTextField.y = (this.height * 0.6) | 0;
            valueTextField.lineWidth = (this.width * 0.8) | 0;
            valueTextField.maxWidth = (this.width * 0.8) | 0;
            valueTextField.name = "value";
            this.groupDisplayObject.addChild(valueTextField);
        }
    };

    p.isShowing = function () {
        return this.groupDisplayObject !== null && this.groupDisplayObject.visible;
    };

    p.playSound = function () {
        if (this.sound != null) {
            MemoryMatch.triggerSoundFx(this.sound, {delay: 0});
        }
    };

    p.closeStartAnimation = function () {
        var duration = 2.5; // seconds of animation
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 250, duration * 1000, true, null, this.closeComplete.bind(this));
        animator.showAtBegin = true;
        animator.vAlpha = -1 / (duration * MemoryMatch.fps);
        animator.endAlpha = 0;
    };

    p.closeComplete = function () {
        this.killObject();
    };

    p.killObject = function () {
        // remove all display objects and object references:
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    };

    MemoryMatch.AchievementItem = AchievementItem;

}());
