/**
 * GUIButton.js
 *
 * GUI buttons are buttons built from composite parts with specific functionality:
 *   Display a button back, an Icon (optional), text (optional)
 *   Supports display and behavior for active and disabled states
 *   Support for standard event states: rollover, rollout, up, down, pressed
 *   Call a function when clicked
 *   Supports a blinking state
 *   This is an auto-creating object you should just call teh constructor of these and release it when you are done.
 *
 *   To create one of these, call GUIButton(parameters) where parameters is an object with the following properties:
 *      baseUp: sprite frame reference of the button back when enabled/up
 *      baseDisabled: sprite frame reference of the button back when disabled
 *      baseOver: sprite frame reference of the button back when mouse over
 *      baseDown: sprite frame reference of the button back when pressed
 *      text: the text to show on the button. If there is an icon, text is left justified to the icon. If no icon, text is centered
 *      addTextShadow: true will add a shadow to the text
 *      icon Up/Over/Down: if there is no text, icon is centered. If there is text icon is left justified
 *      callback: function to call when click event generated. parameter is the button name.
 *      name: unique name of this button
 *      tag: unique tag number of this button
 *      disabled: show button is the disabled state, otherwise the button is enabled
 *      expandHitArea: px to add to expand the hit area rect, eg. 2 will expand it 2px in all directions
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.GUIButton = function (parameters) {
    var guiButton = new createjs.Container();

    guiButton.callback = null;
    guiButton.buttonSprite = null;
    guiButton.iconSprite = null;
    guiButton.text = null;
    guiButton.addTextShadow = false;
    guiButton.name = "button";
    guiButton.tag = 0;
    guiButton.buttonScale = 1;
    guiButton.disabled = false;
    guiButton.forceDisabledDisplay = false;
    guiButton._isPressed = false;
    guiButton._isOver = false;
    guiButton._isFlashing = false;
    guiButton.spriteFrames = null;
    guiButton.spriteData = null;
    guiButton.shadowSource = null;
    guiButton.buttonFaceActive = null;
    guiButton.buttonFaceOver = null;
    guiButton.buttonFaceDown = null;
    guiButton.buttonFaceDisabled = null;
    guiButton.buttonBaseActive = null;
    guiButton.buttonBaseOver = null;
    guiButton.buttonBaseDown = null;
    guiButton.buttonBaseDisabled = null;
    guiButton.buttonBaseColor = null;
    guiButton.buttonBaseRollOverColor = null;
    guiButton.spriteSheet = guiButton.spriteData;
    guiButton.buttonColorFilter = null;
    guiButton.buttonRollOverColorFilter = null;
    guiButton.refreshParent = null;
    guiButton.flashingTimerId = -1;
    guiButton.flashingCounter = null;
    guiButton.flashingInterval = 500;
    guiButton.expandHitArea = 0;

    guiButton.setParameters = function (parameters) {
        if (parameters != null) {
            if (parameters.text != null) {
                guiButton.text = parameters.text;
            }
            if (parameters.name != null) {
                guiButton.name = parameters.name;
            }
            if (parameters.tag != null) {
                guiButton.tag = parseInt(parameters.tag);
            }
            if (parameters.callback != null) {
                guiButton.callback = parameters.callback;
            }
            if (parameters.disabled != null) {
                guiButton.disabled = parameters.disabled;
            }
            if (parameters.baseUp != null) {
                guiButton.buttonBaseActive = parameters.baseUp;
            }
            if (parameters.baseOver != null) {
                guiButton.buttonBaseOver = parameters.baseOver;
            }
            if (parameters.baseDown != null) {
                guiButton.buttonBaseDown = parameters.baseDown;
            }
            if (parameters.baseDisabled != null) {
                guiButton.buttonBaseDisabled = parameters.baseDisabled;
            }
            if (parameters.buttonBaseColor != null) {
                guiButton.buttonBaseColor = parameters.buttonBaseColor;
            }
            if (parameters.buttonBaseRollOverColor != null) {
                guiButton.buttonBaseRollOverColor = parameters.buttonBaseRollOverColor;
            }
            if (parameters.icon != null) {
                guiButton.buttonFaceActive = parameters.icon;
            }
            if (parameters.iconUp != null) {
                guiButton.buttonFaceActive = parameters.iconUp;
            }
            if (parameters.iconDown != null) {
                guiButton.buttonFaceDown = parameters.iconDown;
            }
            if (parameters.iconOver != null) {
                guiButton.buttonFaceOver = parameters.iconOver;
            }
            if (parameters.iconDisabled != null) {
                guiButton.buttonFaceDisabled = parameters.iconDisabled;
            }
            if (parameters.addTextShadow != null) {
                guiButton.addTextShadow = parameters.addTextShadow;
            }
            if (parameters.spriteFrames != null) {
                guiButton.spriteFrames = parameters.spriteFrames;
            } else {
                guiButton.spriteFrames = MemoryMatch.GameSetup.guiSpritesheet1Frames;
            }
            if (parameters.expandHitArea != null) {
                guiButton.expandHitArea = parameters.expandHitArea;
            } else {
                guiButton.expandHitArea = 0;
            }
            // set defaults for things not provided
            if (guiButton.buttonBaseOver == null) {
                guiButton.buttonBaseOver = guiButton.buttonBaseActive;
            }
            if (guiButton.buttonBaseDown == null) {
                guiButton.buttonBaseDown = guiButton.buttonBaseActive;
            }
            if (guiButton.buttonBaseDisabled == null) {
                guiButton.buttonBaseDisabled = guiButton.buttonBaseActive;
            }
            if (guiButton.buttonFaceOver == null) {
                guiButton.buttonFaceOver = guiButton.buttonFaceActive;
            }
            if (guiButton.buttonFaceDown == null) {
                guiButton.buttonFaceDown = guiButton.buttonFaceActive;
            }
            if (guiButton.buttonFaceDisabled == null) {
                guiButton.forceDisabledDisplay = true;
                guiButton.buttonFaceDisabled = guiButton.buttonFaceActive;
            }
            if (this.name == null) {
                this.name = 'button' + this.tag.toString();
            }
            guiButton.spriteData = new createjs.SpriteSheet(guiButton.spriteFrames);
        }
    }

    guiButton.createButton = function () {
        var spriteFrame,
            buttonSize,
            buttonColor,
            hitAreaShape;

        if (this.disabled) {
            spriteFrame = this.buttonBaseDisabled;
        } else {
            spriteFrame = this.buttonBaseActive;
        }
        if (this.buttonSprite == null) {
            this.buttonSprite = new createjs.Sprite(this.spriteData, spriteFrame);
            this.buttonSprite.name = "button";
            this.buttonSprite.framerate = 1;
            this.addChild(this.buttonSprite);
        }
        buttonSize = MemoryMatch.getSpriteFrameSize(this.spriteFrames, spriteFrame);
        this.width = buttonSize.width * this.buttonScale;
        this.height = buttonSize.height * this.buttonScale;
        hitAreaShape = new createjs.Shape(new createjs.Graphics().beginFill('909090').drawRect(0 - this.expandHitArea, 0 - this.expandHitArea, this.width + (2 * this.expandHitArea), this.height + (2 * this.expandHitArea)));
        hitAreaShape.cache(0 - this.expandHitArea, 0 - this.expandHitArea, this.width + (2 * this.expandHitArea), this.height + (2 * this.expandHitArea));
        this.buttonSprite.hitArea = hitAreaShape;
        this.flashingCounter = 0;
        this.setTransform(0, 0, this.buttonScale, this.buttonScale);
        this.createButtonIcon();
        this.createButtonText();
        if (this.buttonBaseColor != null) {
            buttonColor = MemoryMatch.htmlColorStringToColorArray(this.buttonBaseColor);
            this.buttonColorFilter = new createjs.ColorFilter(0, 0, 0, 1, buttonColor[0], buttonColor[1], buttonColor[2], 0);
            this.buttonSprite.filters = [this.buttonColorFilter];
            this.buttonSprite.cache(0, 0, buttonSize.width, buttonSize.height);
            if (this.buttonBaseRollOverColor != null) {
                buttonColor = MemoryMatch.htmlColorStringToColorArray(this.buttonBaseRollOverColor);
                this.buttonRollOverColorFilter = new createjs.ColorFilter(0, 0, 0, 1, buttonColor[0], buttonColor[1], buttonColor[2], 0);
            }
        }
        if ( ! this.disabled) {
            this.setEnabled(true);
            this.handleEvent({type: "rollout"});
        } else {
            this.showEnabled(false);
        }
        MemoryMatch.stageUpdated = true;
    };

    guiButton.createButtonText = function () {

        // this logic assumes the icon was dealt with first, so we can position text based on the icon position

        var buttonText = new createjs.Text(this.text, MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor),
            lineHeight = buttonText.getMeasuredLineHeight();

        if (this.iconSprite == null) {
            buttonText.textAlign = "center";
            buttonText.x = this.width * 0.5;
            buttonText.maxWidth = this.width;
        } else {
            buttonText.textAlign = "left";
            buttonText.x = this.iconSprite.x + this.iconSprite.width;
            buttonText.maxWidth = this.width - this.iconSprite.width;
        }
        buttonText.y = (this.height - lineHeight) * 0.5;
        buttonText.visible = true;
        buttonText.name = "buttonText";
        if (this.addTextShadow) {
            if (this.shadowSource == null) {
                this.shadowSource = new createjs.Shadow("#000000", 2, 2, 10);
            }
        }
        buttonText.shadow = this.shadowSource;
        this.addChild(buttonText);
    };

    guiButton.setButtonText = function (newText) {
        var buttonText = this.getChildByName("buttonText");

        this.text = newText;
        if ( buttonText == null) {
            this.createButtonText();
        } else {
            buttonText.text = this.text;
        }
        MemoryMatch.stageUpdated = true;
    };

    guiButton.setText = function (text) {
        this.setButtonText(text);
    };

    guiButton.createButtonIcon = function () {
        var icon,
            spriteSize,
            x,
            y;

        if (this.iconSprite == null && this.buttonFaceActive != null) {
            icon = new createjs.Sprite(this.spriteData, this.buttonFaceActive);
            spriteSize = MemoryMatch.getSpriteFrameSize(this.spriteFrames, this.buttonFaceActive);
            icon.framerate = 1;
            icon.name = "buttonIcon";
            y = (this.height - spriteSize.height) * 0.5;
            if (this.text == null) {
                x = (this.width - spriteSize.width) * 0.5
            } else {
                x = 0;
            }
            icon.setTransform(x, y, 1, 1);
            icon.width = spriteSize.width;
            icon.height = spriteSize.height;
            this.addChild(icon);
            this.iconSprite = icon;
        }
    };

    guiButton.setIcon = function (spriteFrame) {
        if (this.iconSprite != null) {
            this.iconSprite.gotoAndStop(spriteFrame);
            MemoryMatch.stageUpdated = true;
        }
    };

    guiButton.getSize = function () {
        return {width: this.width, height: this.height};
    };

    guiButton.handleEvent = function (event) {
        var spriteFrameBase,
            spriteFrameIcon,
            eventType = event.type,
            clicked = false;

        switch (eventType) {
            case "click":
                break;
            case "mousedown":
                this._isPressed = true;
                spriteFrameBase = this.buttonBaseDown;
                spriteFrameIcon = this.buttonFaceDown;
                if (this.buttonBaseRollOverColor != null) {
                    this.buttonSprite.filters = [this.buttonRollOverColorFilter];
                    this.buttonSprite.updateCache();
                    MemoryMatch.stageUpdated = true;
                }
                break;
            case "rollover":
                if (this._isPressed) {
                    spriteFrameBase = this.buttonBaseDown;
                    spriteFrameIcon = this.buttonFaceDown;
                } else {
                    spriteFrameBase = this.buttonBaseOver;
                    spriteFrameIcon = this.buttonFaceOver;
                }
                break;
            case "pressup":
                this._isPressed = false;
                if (this._isOver) {
                    spriteFrameBase = this.buttonBaseOver;
                    spriteFrameIcon = this.buttonFaceOver;
                } else {
                    spriteFrameBase = this.buttonBaseActive;
                    spriteFrameIcon = this.buttonFaceActive;
                }
                if (this.buttonBaseRollOverColor != null && this.buttonBaseColor != null) {
                    this.buttonSprite.filters = [this.buttonColorFilter];
                    this.buttonSprite.updateCache();
                }
                clicked = true;
                break;
            case "rollout":
            default:
                if (this._isPressed) {
                    spriteFrameBase = this.buttonBaseDown;
                    spriteFrameIcon = this.buttonFaceDown;
                } else {
                    spriteFrameBase = this.buttonBaseActive;
                    spriteFrameIcon = this.buttonFaceActive;
                }
                break;
        }
        if (this.buttonSprite != null && spriteFrameBase != null) {
            this.buttonSprite.gotoAndStop(spriteFrameBase);
            MemoryMatch.stageUpdated = true;
        }
        if (this.iconSprite != null && spriteFrameIcon != null) {
            this.iconSprite.gotoAndStop(spriteFrameIcon);
            MemoryMatch.stageUpdated = true;
        }
        if (this.refreshParent != null && this.refreshParent.refreshCache != null) {
            this.refreshParent.refreshCache();
        }
    };

    guiButton.onClicked = function (event) {
        if (event != null && event.target != null) {
            var that = event.target.parent;
            if (that.callback != null) {
                MemoryMatch.triggerSoundFx("soundTap");
                that.callback(that.name); // fire the callback function and let them know who was clicked
            }
        }
    };

    guiButton.show = function (showFlag) {
        this.visible = showFlag;
    };

    guiButton.enable = function () {
        // show button in the enabled state
        if (this.disabled) {
            this.setEnabled(true);
            this.showEnabled(true);
            this.handleEvent({type: "rollout"});
        }
    };

    guiButton.disable = function () {
        // show button in the disabled state
        this.setEnabled(false);
        this.showEnabled(false);
    };

    guiButton.setEnabled = function (enableFlag) {
        if (enableFlag) {
            this.disabled = false;
            this.cursor = "pointer";
            this.addEventListener("click", this.onClicked);
            this.addEventListener("rollover", this);
            this.addEventListener("rollout", this);
            this.addEventListener("mousedown", this);
            this.addEventListener("pressup", this);
        } else {
            this.disabled = true;
            this.cursor = null;
            this.removeEventListener("click", this.onClicked);
            this.removeEventListener("rollover", this);
            this.removeEventListener("rollout", this);
            this.removeEventListener("mousedown", this);
            this.removeEventListener("pressup", this);
        }
    };

    guiButton.showEnabled = function (enableFlag) {
        var alpha = 1,
            buttonBase,
            buttonFace,
            buttonText = this.getChildByName("buttonText");

        if (enableFlag) {
            buttonBase = this.buttonBaseActive;
            buttonFace = this.buttonFaceActive;
            if (this.forceDisabledDisplay) {
                buttonText = this.getChildByName("buttonText");
            }
        } else {
            if (this.forceDisabledDisplay) {
                alpha = 0.4;
                buttonText = this.getChildByName("buttonText");
            }
            buttonBase = this.buttonBaseDisabled;
            buttonFace = this.buttonFaceDisabled;
        }
        if (this.buttonSprite != null) {
            this.buttonSprite.gotoAndStop(buttonBase);
            this.buttonSprite.alpha = alpha;
        }
        if (this.iconSprite != null) {
            this.iconSprite.gotoAndStop(buttonFace);
            this.iconSprite.alpha = alpha;
        }
        if (buttonText != null) {
            buttonText.alpha = alpha;
        }
    };

    guiButton.setFlashing = function (flashingFlag) {
        this._isFlashing = flashingFlag;
        if (this._isFlashing && this.flashingTimerId == -1) {
            this.flashingCounter = 1;
            this.updateFlashing();
        } else if ( ! this._isFlashing) {
            this.flashingCounter = 0;
            if (this.flashingTimerId != -1) {
                window.clearTimeout(this.flashingTimerId);
                this.flashingTimerId = -1;
                MemoryMatch.stageUpdated = true;
            }
        }
    };

    guiButton.updateFlashing = function () {
        var buttonText = this.getChildByName("buttonText"),
            alpha;

        if (this._isFlashing) {
            this.flashingCounter ++;
            alpha = this.flashingCounter % 2 == 0 ? 0.3 : 1.0;
            this.flashingTimerId = window.setTimeout(this.updateFlashing.bind(this), this.flashingInterval);
        } else {
            alpha = 1;
            this.flashingTimerId = -1;
        }
        if (this.iconSprite != null) {
            this.iconSprite.alpha = alpha;
        }
        if (buttonText != null) {
            buttonText.alpha = alpha;
            MemoryMatch.stageUpdated = true;
        }
    };

    guiButton.toString = function () {
        return "[GUIButton] name=" + this.name + "; tag=" + this.tag.toString() + "; enabled=" + (this.disabled ? "NO" : "YES");
    };

    guiButton.kill = function () {
        if (this.flashingTimerId != -1) {
            window.clearTimeout(this.flashingTimerId);
            this.flashingTimerId = -1;
        }
        if (this.buttonSprite != null) {
            this.buttonSprite.uncache();
            this.buttonSprite = null;
        }
        this.buttonColorFilter = null;
        this.buttonRollOverColorFilter = null;
        this.removeAllEventListeners();
        this.removeAllChildren();
        this.shadowSource = null;
        this.callback = null;
        this.spriteData = null;
        this.iconSprite = null;
        this.text = null;
    };

    guiButton.setParameters(parameters);
    guiButton.createButton();
    return guiButton;
};
