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
    p.message = null;
    p.icon = null;
    p.sound = null;
    p.displayDuration = 2.5;
    p.borderColor = '#d640d6';
    p.backgroundColor = '#521852';

    p.setParameters = function (displayObject, parameters) {
        this.parentDisplayObject = displayObject;
        if (parameters !== null) {
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
                this.width = 900;
            }
            this.width *= MemoryMatch.stageScaleFactor;
            if (parameters.height != null) {
                this.height = parameters.height;
            } else if (this.height < 1) {
                this.height = 270;
            }
            this.height *= MemoryMatch.stageScaleFactor;
            if (parameters.title != null) {
                this.title = parameters.title;
            } else if (this.title == null) {
                this.title = "";
            }
            if (parameters.message != null) {
                this.message = parameters.message;
            } else if (this.message == null) {
                this.message = "";
            }
            if (parameters.icon != null) {
                this.icon = parameters.icon;
            } else if (this.icon == null) {
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
            if (parameters.callback !== null) {
                this.stateCompleteCallback = parameters.callback;
            }
        }
    };

    p.drawBackground = function () {
        var shape = new createjs.Shape();
        shape.x = 0;
        shape.y = 0;
        var graphics = shape.graphics;
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
        this.setupIcon();
        this.setupTitleText();
        this.setupMessageText();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.x, this.y, 1, 1, 0, 0, 0, this.width * 0.5, this.height * 0.5);
        this.groupDisplayObject.visible = false;
        if (autoStart === null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    };

    p.start = function () {
        // begin animation, then wait for user event to end this state and alert callback
        this.closeStartAnimation();
        if (this.sound != null) {
            MemoryMatch.triggerSoundFx(this.sound, {delay: 0});
        }
    };

    p.closeStartAnimation = function () {
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, this.displayDuration * 1000, true, null, this.closeComplete.bind(this));
        animator.showAtBegin = true;
        animator.vAlpha = -1 / (this.displayDuration * MemoryMatch.fps);
        animator.endAlpha = 0;
    };

    p.closeComplete = function () {
        if (this.stateCompleteCallback != null) {
            this.stateCompleteCallback("close");
        }
        this.killObject();
    };

    p.setupIcon = function () {
        // add the icon on top of the button frame
        if (this.icon != null) {
            var spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
            var iconSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, this.icon);
            var iconSprite = new createjs.Sprite(spriteData, this.icon);
            iconSprite.setTransform(this.width * 0.02, (this.height - iconSize.height) * 0.5, 1, 1);
            iconSprite.framerate = 1;
            iconSprite.name = "icon";
            this.groupDisplayObject.addChild(iconSprite);
        }
    };

    p.setupTitleText = function () {
        var titleTextField;
        titleTextField = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
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
        titleTextField = new createjs.Text(this.message, MemoryMatch.getScaledFontSize(42) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.width * 0.5;
        titleTextField.y = this.height * 0.4;
        titleTextField.lineWidth = this.width * 0.8;
        titleTextField.maxWidth = this.width * 0.8;
        titleTextField.name = "message";
        this.groupDisplayObject.addChild(titleTextField);
    };

    p.isShowing = function () {
        return this.groupDisplayObject !== null && this.groupDisplayObject.visible;
    };

    p.killObject = function () {
        // remove all display objects and object references:
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.stateCompleteCallback = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    };

    MemoryMatch.InfoPopup = InfoPopup;

}());
