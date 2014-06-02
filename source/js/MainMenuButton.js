/**
 * MainMenuButton.js
 *
 * Main Menu buttons are display object containers that support some unique functionality:
 *   Display the button, level icon, title, subtitle
 *   ...and act like a button!
 */

MemoryMatch.MainMenuButton = function (parameters)
{
    var menuButton = new createjs.Container();

    menuButton.buttonInstance = null;
    menuButton.callback = null;
    menuButton.levelNumber = 0;
    menuButton.isLocked = false;
    menuButton.icon = null;
    menuButton.title = "";
    menuButton.subtitle = "";
    menuButton.buttonScale = 1.0;
    menuButton.spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);

    if (parameters != null) {
        if (parameters.levelNumber != null) {
            menuButton.levelNumber = parameters.levelNumber;
        }
        if (parameters.isLocked != null) {
            menuButton.isLocked = parameters.isLocked;
        }
        if (parameters.icon != null) {
            menuButton.icon = parameters.icon;
        }
        if (parameters.title != null) {
            menuButton.title = parameters.title;
        }
        if (parameters.subtitle != null) {
            menuButton.subtitle = parameters.subtitle;
        }
        if (parameters.scale != null) {
            menuButton.buttonScale = parameters.scale;
        }
        if (parameters.callback != null) {
            menuButton.callback = parameters.callback;
        }
    }

    menuButton.createTitleText = function () {
        var iconSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, this.icon);
        var titleText = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor);
        titleText.textAlign = "left";
        titleText.x = iconSize.width + (this.width * 0.10);
        titleText.y = this.height * 0.2;
        titleText.maxWidth = this.width - titleText.x;
        titleText.visible = true;
        titleText.name = "title";
        this.addChild(titleText);

        var subtitleText = new createjs.Text(this.subtitle, MemoryMatch.getScaledFontSize(48) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        subtitleText.textAlign = "left";
        subtitleText.x = titleText.x;
        subtitleText.y = this.height * 0.5;
        subtitleText.maxWidth = titleText.maxWidth;
        subtitleText.visible = true;
        subtitleText.name = "subtitle";
        this.addChild(subtitleText);
    };

    menuButton.createIcon = function () {
        // add the icon on top of the button frame
        var iconSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, this.icon);
        var iconSprite = new createjs.Sprite(this.spriteData, this.icon);
        iconSprite.setTransform(this.width * 0.05, (this.height - iconSize.height) * 0.5, 1, 1);
        iconSprite.framerate = 1;
        iconSprite.name = "icon";
        this.addChild(iconSprite);
    };

    menuButton.createButton = function () {
        // this makes the button frame
        var spriteFrame = "gameSelectButtonUp"; // a reference sprite frame, they should all be the same size
        var buttonSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, spriteFrame);
        var gameButton;

        this.width = buttonSize.width * this.buttonScale;
        this.height = buttonSize.height * this.buttonScale;

        // if there already is one lets kill that one and make a new one
        var buttonSprite = this.getChildByName("button");
        if (buttonSprite != null) {
            buttonSprite.removeEventListener("click", this.onButtonClicked);
            this.removeChild(buttonSprite);
            buttonSprite = null;
        }

        gameButton = new createjs.Sprite(this.spriteData, spriteFrame);
        gameButton.setTransform(0, 0, this.buttonScale, this.buttonScale);
        gameButton.framerate = 1;
        gameButton.name = "button";
        gameButton.addEventListener("click", this.onButtonClicked);
        this.buttonInstance = new createjs.ButtonHelper(gameButton, "gameSelectButtonUp", "gameSelectButtonOver", "gameSelectButtonDown", false);
        this.addChildAt(gameButton, 0);
    };

    menuButton.onButtonClicked = function (event) {
        if (event != null && event.target != null) {
            var that = event.target.parent;
            if (that.callback != null) {
                MemoryMatch.triggerSoundFx("soundTap");
                that.callback(that.levelNumber);
            }
        }
    };

    menuButton.show = function (showFlag) {
        this.visible = showFlag;
    };

    menuButton.setLevelNumber = function (levelNumber) {
        var levelNumberField = this.getChildByName("levelNumber");
        this.levelNumber = levelNumber;
    };

    menuButton.setIsLocked = function (isLocked) {
        this.isLocked = isLocked;
    };

    menuButton.kill = function () {
        var buttonSprite = this.getChildByName("button");
        if (buttonSprite != null) {
            buttonSprite.removeEventListener("click", menuButton.onButtonClicked);
        }
        menuButton.callback = null;
        menuButton.buttonInstance = null;
        menuButton.spriteData = null;
        this.removeAllChildren();
    };

    menuButton.createButton();
    menuButton.createIcon();
    menuButton.createTitleText();
    return menuButton;
};
