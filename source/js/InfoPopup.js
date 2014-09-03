/**
 * InfoPopup.js
 *
 * Show a generic popup that can be used for informational or error messages.
 * Construct one of these with a parameters object using this format:
 * {width: 300, height: 90, title: 'Title', message: 'Message', icon: 'iconCards', sound: 'soundAsset', borderColor:'#FFFFFF', backgroundColor: '#FFFFFF', callback: function}
 *
 */
// namespace to MemoryMatch
MemoryMatch = MemoryMatch || {};

(function() {

    'use strict';

    var InfoPopup = function(displayObject, autoStart, parameters) {
        this.setParameters(displayObject, parameters);
        this.buildScreen(autoStart);
    };
    var p = InfoPopup.prototype;

    p.stateCompleteCallback = null;
    p.parentDisplayObject = null;
    p.groupDisplayObject = null;
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
    p.titleFontSize = 56;
    p.message = null;
    p.messageFontSize = 48;
    p.messageFont = null;
    p.icon = null;
    p.iconWidth = 0;
    p.sound = null;
    p.displayDuration = 2.5;
    p.fadeTime = 1;
    p.borderColor = MemoryMatch.GameSetup.achievementBorderColor; // '#d640d6';
    p.backgroundColor = MemoryMatch.GameSetup.achievementBackgroundColor; // '#521852';
    p.autoClose = true;

    p.setParameters = function (displayObject, parameters) {
        this.parentDisplayObject = displayObject;
        if (parameters !== null) {
            this.fadeTime = 1;
            if (parameters.x != null) {
                this.x = parameters.x;
            } else if (this.x < 1) {
                this.x = this.parentDisplayObject.canvas.width * 0.5;
            }
            if (parameters.y != null) {
                this.y = parameters.y;
            } else if (this.y < 1) {
                this.y = this.parentDisplayObject.canvas.height * 0.5;
            }
            if (parameters.width != null) {
                this.width = parameters.width;
            } else if (this.width < 1) {
                this.width = 900; // will be adjusted for screen resolution
            }
            this.width *= MemoryMatch.stageScaleFactor;
            if (parameters.height != null) {
                this.height = parameters.height;
            } else if (this.height < 1) {
                this.height = 270; // will be adjusted for screen resolution
            }
            this.height *= MemoryMatch.stageScaleFactor;
            if (parameters.title != null) {
                this.title = parameters.title;
            } else if (this.title == null) {
                this.title = "";
            }
            if (parameters.titleFontSize != null) {
                this.titleFontSize = parameters.titleFontSize;
            } else if (this.titleFontSize == null) {
                this.titleFontSize = 56;
            }
            if (parameters.message != null) {
                this.message = parameters.message;
            } else if (this.message == null) {
                this.message = "";
            }
            if (parameters.messageFont != null) {
                this.messageFont = parameters.messageFont;
            } else if (this.messageFont == null) {
                this.messageFont = MemoryMatch.GameSetup.guiMediumFontName;
            }
            if (parameters.messageFontSize != null) {
                this.messageFontSize = parameters.messageFontSize;
            } else if (this.messageFontSize == null) {
                this.messageFontSize = 48;
            }
            if (parameters.icon != null) {
                this.icon = parameters.icon;
            } else if (this.icon == null) {
                this.icon = null;
            }
            this.iconWidth = 0;
            if (parameters.backgroundColor != null) {
                this.backgroundColor = parameters.backgroundColor;
            } else {
                this.backgroundColor = MemoryMatch.GameSetup.achievementBackgroundColor;
            }
            if (parameters.borderColor != null) {
                this.borderColor = parameters.borderColor;
            } else {
                this.borderColor = MemoryMatch.GameSetup.achievementBorderColor;
            }
            if (parameters.sound != null) {
                this.sound = parameters.sound;
            }
            if (parameters.duration != null) {
                this.displayDuration = parameters.duration;
            } else {
                this.displayDuration = 2.5;
            }
            if (parameters.callback != null) {
                this.stateCompleteCallback = parameters.callback;
            }
            if (parameters.autoClose != null) {
                this.autoClose = parameters.autoClose;
            } else {
                this.autoClose = true;
            }
        }
    };

    p.drawBackground = function () {
        var shape = new createjs.Shape(),
            graphics;
        shape.x = 0;
        shape.y = 0;
        graphics = shape.graphics;
        graphics.beginFill(this.backgroundColor);
        graphics.beginStroke(this.borderColor);
        graphics.setStrokeStyle(3);
        graphics.drawRoundRect(0, 0, this.width, this.height, 12);
        this.groupDisplayObject.addChild(shape);
        return shape;
    };

    p.buildScreen = function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        // layout the screen
        this.groupDisplayObject = new createjs.Container();
        this.marginTop = 8 * MemoryMatch.stageScaleFactor;
        this.marginLeft = 8 * MemoryMatch.stageScaleFactor;
        this.drawBackground();
        this.setupIcon(); // must be done before text is placed
        this.setupTitleText();
        this.setupMessageText();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.x, this.y, 1, 1, 0, 0, 0, this.width * 0.5, this.height * 0.5);
        this.groupDisplayObject.visible = true;
        if (autoStart === null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    };

    p.start = function () {
        // begin animation, then wait for user event to end this state and alert callback
        if (this.autoClose) {
            this.closeStartAnimation();
        }
        if (this.sound != null) {
            MemoryMatch.triggerSoundFx(this.sound, {delay: 0});
        }
    };

    p.closeStartAnimation = function () {
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, this.displayDuration * 1000, this.fadeTime * 1000, true, null, this.closeComplete.bind(this));
        animator.showAtBegin = true;
        animator.vAlpha = -1 / (this.fadeTime * MemoryMatch.fps);
        animator.endAlpha = 0;
    };

    p.closeComplete = function () {
        if (this.stateCompleteCallback != null) {
            this.stateCompleteCallback("close");
        }
        this.killObject();
    };

    p.setupIcon = function () {
        var spriteData,
            iconSize,
            iconSprite;

        if (this.icon != null) {
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
            iconSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, this.icon);
            iconSprite = new createjs.Sprite(spriteData, this.icon);
            iconSprite.setTransform(this.width * 0.02, (this.height - iconSize.height) * 0.5, 1, 1);
            iconSprite.framerate = 1;
            iconSprite.name = "icon";
            this.iconWidth = iconSize.width;
            this.groupDisplayObject.addChild(iconSprite);
        } else {
            this.iconWidth = 0;
        }
    };

    p.setupTitleText = function () {
        var titleTextField;
        titleTextField = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(this.titleFontSize) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.width * 0.5;
        titleTextField.y = this.height * 0.1;
        titleTextField.lineWidth = this.width * 0.8;
        titleTextField.maxWidth = this.width * 0.8;
        titleTextField.name = "title";
        this.groupDisplayObject.addChild(titleTextField);
    };

    p.setupMessageText = function () {
        var titleTextField;
        titleTextField = new createjs.Text(this.message, MemoryMatch.getScaledFontSize(this.messageFontSize) + " " + this.messageFont, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.iconWidth + ((this.width - this.iconWidth) * 0.5);
        titleTextField.y = this.height * 0.34;
        titleTextField.lineWidth = (this.width - this.iconWidth) * 0.9;
        titleTextField.maxWidth = (this.width - this.iconWidth) * 0.9;
        titleTextField.lineHeight = titleTextField.getMeasuredLineHeight() * 1.5;
        titleTextField.name = "message";
        this.groupDisplayObject.addChild(titleTextField);
    };

    p.isShowing = function () {
        return this.groupDisplayObject !== null && this.groupDisplayObject.visible;
    };

    p.killObject = function () {
        // remove all display objects and object references:
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.stateCompleteCallback = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    };

    MemoryMatch.InfoPopup = InfoPopup;

}());
