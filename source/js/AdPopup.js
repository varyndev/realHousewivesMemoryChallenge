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
    domElementName: null,
    refreshOnDisplay: true,
    noscale: false,
    closeEventType: null,
    closeTimer: null,
    showAdTimer: null,


    setParameters: function (parameters) {
        if (parameters != null) {
            if (parameters.title != null) {
                this.title = parameters.title;
            } else if (this.title == null) {
                this.title = "Advertisement";
            }
            if (parameters.domElement != null) {
                this.domElementName = parameters.domElement;
            } else {
                this.domElementName = 'adPlacement';
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
        MemoryMatch.stageUpdated = true;
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
        enginesisSession.gameTrackingRecord('game', 'showad', '', MemoryMatch.adModel.adDisplayCounter.toString(), null);
        this.startAutoCloseTimer();
    },

    closeStartAnimation: function () {
        var duration = 0.1, // seconds of animation
            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeSlide.bind(this));
        if (animator != null) {
            animator.endX = this.groupDisplayObject.x - (this.backgroundWidth * 0.05);
            animator.vX = animator.endX / (duration * MemoryMatch.fps);
        }
    },

    closeSlide: function () {
        var duration = 0.3; // seconds of animation
        var animator = MemoryMatch.AnimationHandler.addToAnimationQueue(this.groupDisplayObject, 0, duration * 1000, false, null, this.closeComplete.bind(this));
        animator.endX = this.groupDisplayObject.x + this.backgroundWidth * 1.05;
        animator.vX = (this.backgroundWidth * 1.05) / (duration * MemoryMatch.fps);
    },

    closeComplete: function () {
        var domElement,
            pageElement,
            stateCompleteCallback = this.stateCompleteCallback,
            closeEventType = this.closeEventType;

        if (this.groupDisplayObject == null) {
            return;
        }
        domElement = this.groupDisplayObject.getChildByName('ad');
        this.isEnabled = false;
        if (domElement != null) {
            domElement.visible = false;
            pageElement = document.getElementById(this.domElementName);
            if (pageElement != null) {
                pageElement.style.display = 'none';
            }
        }
        this.killScreen();
        if (stateCompleteCallback != null) {
            stateCompleteCallback(closeEventType);
        }
    },

    closePopup: function (closeEventType) {
        this.isEnabled = false;
        this.closeEventType = closeEventType;
        // begin animation, then once close is complete send notification
        this.closeStartAnimation();
    },

    startAutoCloseTimer: function () {
        // Close by adMinDisplaySeconds seconds, unless user clicks on SKIP
        var adMinDisplaySeconds = MemoryMatch.GameSetup.adMinDisplaySeconds | 15;
        this.closeTimer = window.setTimeout(this.onAutoCloseTimerExpired.bind(this), adMinDisplaySeconds * 1000);
    },

    onAutoCloseTimerExpired: function () {
        this.closeTimer = null;
        this.closePopup("close");
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

    onShowAdTimerExpired: function () {
        var pageElement;

        this.showAdTimer = null;
        pageElement = document.getElementById(this.domElementName);
        if (pageElement != null) {
            pageElement.style.display = 'block';
        }
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
        // <iframe id="adFramed" name="adFramed" width="300" height="250" scrolling="no" marginwidth="0" marginheight="0" frameborder="0" src="adLoader.html" style="border: 0px; vertical-align: bottom;"></iframe>
        var pageElement,
            domElement,
            iframe;

        pageElement = document.getElementById(this.domElementName);
        if (pageElement != null) {
            iframe = document.createElement("IFRAME");
            iframe.setAttribute("src", "adLoader.html");
            iframe.setAttribute("id", "adFramed");
            iframe.setAttribute("name", "adFramed");
            iframe.setAttribute("width", "300");
            iframe.setAttribute("height", "250");
            iframe.setAttribute("scrolling", "no");
            iframe.setAttribute("marginwidth", "0");
            iframe.setAttribute("marginheight", "0");
            iframe.setAttribute("frameborder", "0");
            iframe.style.width = "300px";
            iframe.style.height = "250px";
            pageElement.appendChild(iframe);
            domElement = new createjs.DOMElement(pageElement);
            if (domElement != null) {
                domElement.name = 'ad';
                this.groupDisplayObject.addChild(domElement);
                this.showAdTimer = window.setTimeout(this.onShowAdTimerExpired.bind(this), 1000);
            }
        }
    },

    killDOMElement: function () {
        // destroy the iframe we created
        var pageElement = document.getElementById(this.domElementName);
        if (pageElement != null) {
            while (pageElement.firstChild != null) {
                pageElement.removeChild(pageElement.firstChild);
            }
            pageElement.style.visibility = "hidden";
            pageElement.style.display = "none";
        }
    },

    setupTitleText: function () {
        var titleTextField;

        titleTextField = new createjs.Text(this.title, MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
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
        gameButton.setTransform(this.backgroundWidth * 0.99 - buttonSize.width, this.backgroundHeight * 0.06, buttonScale, buttonScale);
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

        if (this.closeTimer != null) {
            window.clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
        if (this.showAdTimer != null) {
            window.clearTimeout(this.showAdTimer);
            this.showAdTimer = null;
        }
        this.buttonInstances = null;
        this.killDOMElement();
        this.domElementName = null;
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