/**
 * AdPopup.js
 *
 * Show the ad, background mask, and skip button
 *
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.AdPopup = {
    stateCompleteCallback: null,
    parentDisplayObject: null,
    groupDisplayObject: null,
    buttonInstances: null,
    backgroundWidth: 0,
    backgroundHeight: 0,
    backgroundCover: null,
    isEnabled: false,
    title: null,
    closeButton: true,
    domElement: null,
    noscale: false,
    closeEventType: null,


    setParameters: function (parameters) {
        if (parameters != null) {
            if (parameters.title != null) {
                this.title = parameters.title;
            } else if (this.title == null) {
                this.title = "Advertisement";
            }
            if (parameters.domElement != null) {
                this.domElement = parameters.domElement;
            } else {
                this.domElement = 'adPlacement';
            }
            if (parameters.closeButton != null) {
                this.closeButton = parameters.closeButton;
            }
            if (parameters.callback != null) {
                this.stateCompleteCallback = parameters.callback;
            }
            if (parameters.noscale != null) {
                this.noscale = parameters.noscale;
            }
        }
    },

    setup: function (displayObject, parameters) {
        this.parentDisplayObject = displayObject;
        this.setParameters(parameters);
    },

    buildScreen: function (autoStart) {
        if (this.groupDisplayObject !== null) {
            return;
        }
        this.groupDisplayObject = new createjs.Container();
        this.showBackgroundImage();
        this.setupTitleText();
        this.setupButtons();
        this.parentDisplayObject.addChild(this.groupDisplayObject);
        this.groupDisplayObject.setTransform(this.parentDisplayObject.canvas.width * 0.5, this.parentDisplayObject.canvas.height * 0.5, 1, 1, 0, 0, 0, this.backgroundWidth * 0.5, this.backgroundHeight * 0.5);
        this.setupDOMElement(); // need to do this after the transformation
        if (autoStart == null) {
            autoStart = false;
        }
        if (autoStart) {
            this.start();
        }
    },

    start: function () {
        // begin animation, then wait for user event to end this state and alert callback
        this.isEnabled = true;
    },

    closeStartAnimation: function () {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeSlide.bind(this));
        if (animator != null) {
            animator.endX = this.groupDisplayObject.x - (this.backgroundWidth * 0.05);
            animator.vX = animator.endX / (duration * MemoryMatch.fps);
        }
        if (this.stateCompleteCallback != null) {
            this.stateCompleteCallback(this.closeEventType);
        }
    },

    closeSlide: function () {
        var duration = 0.3; // seconds of animation
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeComplete.bind(this));
        animator.endX = this.groupDisplayObject.x + this.backgroundWidth * 1.05;
        animator.vX = (this.backgroundWidth * 1.05) / (duration * MemoryMatch.fps);
    },

    closeComplete: function () {
        this.killScreen();
    },

    closePopup: function (closeEventType) {
        var domElement = this.groupDisplayObject.getChildByName('text'),
            pageElement;

        this.isEnabled = false;
        this.closeEventType = closeEventType;
        if (domElement != null) {
            domElement.visible = false;
            pageElement = document.getElementById(this.domElement);
            if (pageElement != null) {
                pageElement.style.display = 'none';
            }
        }
        // begin animation, then once close is complete send notification
        this.closeStartAnimation();
    },

    onClickClose: function (event) {
        if (this.isEnabled) {
            MemoryMatch.triggerSoundFx("soundTap");
            this.closePopup("close");
        }
    },

    onClickBackground: function (event) {
        // this just eats the click so anything under the popup is not activated
    },

    showBackgroundImage: function () {

        // This method will lay down the background cover

        var canvas = this.parentDisplayObject.canvas,
            backgroundCover;

        this.backgroundWidth = canvas.width;
        this.backgroundHeight = canvas.height;
        backgroundCover = new createjs.Shape();
        backgroundCover.graphics.beginFill("#CCCCCC").drawRect(0, 0, this.backgroundWidth, this.backgroundHeight);
        backgroundCover.alpha = 0.8;
        backgroundCover.addEventListener("click", this.onClickBackground);
        this.backgroundCover = backgroundCover;
        this.parentDisplayObject.addChild(backgroundCover);
    },

    setupDOMElement: function () {
        // Position a DOM element in the center of the popup. Expecting the element to be a div containing what we want to show.
        // Register domElement to its center
        var pageElement = document.getElementById(this.domElement),
            domElement = new createjs.DOMElement(pageElement);

        if (domElement != null) {
            domElement.name = 'ad';
            this.groupDisplayObject.addChild(domElement);
            pageElement.style.display = 'block';
        }
    },

    setupTitleText: function () {
        var titleTextField;

        titleTextField = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(36) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
        titleTextField.textAlign = "center";
        titleTextField.x = this.backgroundWidth * 0.5;
        titleTextField.y = this.backgroundHeight * 0.94;
        titleTextField.lineWidth = this.backgroundWidth;
        titleTextField.maxWidth = this.backgroundWidth;
        this.groupDisplayObject.addChild(titleTextField);
    },

    setupButtons: function () {
        var buttonScale = 1.0,
            gameButton,
            buttonSize;

        // Close button always shows in its own special place
        gameButton = MemoryMatch.GUIButton({name: "close", tag: 1, disabled: false, callback: this.onClickClose.bind(this), baseUp: "closeButtonUp", baseOver: "closeButtonDown", baseDown: "closeButtonDown"});
        buttonSize = gameButton.getSize();
        gameButton.setTransform(this.backgroundWidth * 0.98 - buttonSize.width, this.backgroundHeight * 0.02, buttonScale, buttonScale);
        this.groupDisplayObject.addChild(gameButton);
        this.buttonInstances = gameButton;
    },

    isShowing: function () {
        return this.groupDisplayObject !== null && this.groupDisplayObject.visible;
    },

    killScreen: function () {
        // remove all display objects and object references:
        var i,
            pageElement;

        this.buttonInstances = null;
        if (this.domElement != null) {
            pageElement = document.getElementById(this.domElement);
            if (pageElement != null) {
                pageElement.style.visibility = "hidden";
            }
        }
        this.domElement = null;
        this.title = null;
        this.message = null;
        this.groupDisplayObject.removeAllChildren();
        this.parentDisplayObject.removeChild(this.groupDisplayObject);
        this.parentDisplayObject.removeChild(this.backgroundCover);
        this.backgroundCover = null;
        this.stateCompleteCallback = null;
        this.parentDisplayObject = null;
        this.groupDisplayObject = null;
    }
};