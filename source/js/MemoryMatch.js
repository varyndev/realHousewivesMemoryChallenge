/* MemoryMatch.js
   Memory Match game implementation. This file implements all of the game types and functionality on the game play screen.
   It also acts as the main game model and coordinates game data, user data, and game state.

 */

// namespace under enginesis object
var enginesisSession = enginesis || {};

'use strict';


this.MemoryMatch = {
    GameVersion: "1.1.91",
    platform: "unknown",
    locale: "en-US",
    debugMode: false,
    frameRateDebugText: null,
    isTouchDevice: false,
    isNativeBuild: false,
    minimumSplashScreenDisplayTime: 2000,
    assetLoader: null,
    secondaryAssetManifest: null,

    GAMESTATE: {
        INIT:                0,
        SPLASH:              1,
        MENU:                2,
        OPTIONS:             3,
        LEVELSELECT:         4,
        PLAY:                5,
        RESULTS:             6,
        GAMECOMPLETE:        7,
        SHOWAD:             21,
        ACHIEVEMENTS:       22,
        LEADERBOARD:        23,
        STORE:              24,
        MOREGAMES:          25,
        LOADING:            97,
        IDLE:               98,
        UNKNOWN:            99
    },

    GAMEPLAYSTATE: {
        NEW_GAME:            1,
        GET_READY:           2,
        BOARD_SETUP:         3,
        PLAY_WAIT:           4,
        CHOOSE_FIRST_CARD:   5,
        CHOOSE_SECOND_CARD:  6,
        CARDS_MATCH:         7,
        CARDS_NO_MATCH:      8,
        BOARD_CLEAR:         9,
        LOSE:               10,
        WIN:                11,
        LEVEL_UP:           12,
        IDLE:               98,
        UNKNOWN:            99
    },

    CARDSTATE: {
        DOWN:                0,
        UP:                  1,
        REMOVED:             2,
        FLIPPING:            5,
        NOTREADY:            9
    },

    GAMEPLAYTYPE: {
        CONCENTRATION:       1,
        SIMON:               2,
        PATTERN:             3,
        HAYSTACK:            4,
        CHAINS:              5,
        MONTE:               6,
        NEMESIS:             7,
        EYESPY:              8
    },

    ACHIEVEMENT: {
        FASTMATCH:         1,
        FASTCOMBO:         2,
        TRIPLECOMBO:       3,
        QUADBO:            4,
        FIVECOMBOS:        5,
        FIFTYCOMBOS:       6,
        TWENTYFIVECOMBOS:  7,
        FIFTYMATCHES:      8,
        ONEHUNDREDMATCHES: 9,
        TWOFIFTYMATCHES:   10,
        LUCKYGUESS:        11,
        CLAIRVOYANT:       12,
        CHAINGANG:         13,
        CHAINTASTIC:       14,
        ACONTENDER:        15,
        THREESTAR:         16,
        QUICKDRAW:         17,
        MOZART:            18,
        MONTE:             19,
        PICASSO:           20,
        EAGLEEYE:          21
    },
    BOARD_ANIMATION_TAG:       990,
    GAMERESULTS_ANIMATION_TAG: 991,

    cacheStatusValues: ['uncached', 'idle', 'checking', 'downloading', 'updateready', 'obsolete'],
    gameWasInitialized: false,
    gameData: null,
    rows: 0,
    columns: 0,
    cardWidth: 0,
    cardHeight: 0,
    numCardsAvailable: 0,
    cardMargin: 0,
    canvasContainerElement: "canvasArea",
    loaderElement: "loader",
    isDesiredOrientationWhenLoadStarted: false,
    stageCanvasElement: "memoryMatch",
    assetFileNamePostfix: "",
    cardsFileNamePostfix: "",
    stage: null,
    stageUpdated: false,
    stageWidth: 0,
    stageHeight: 0,
    cssScaledWidth: 0,
    cssScaledHeight: 0,
    stageScaleFactor: 1,
    cardScaleFactor: 1,
    stageAspectRatio: 1.3333,
    fps: 50,                 // expected number of frames per second
    frameTime: 25,           // expected milliseconds per frame (1000 / fps)
    gamePaused: false,       // game is paused
    gamePausePending: false, // game is in process to pause or unpause but need to complete animations
    runAnimations: true,     // flag to override animation engine
    showingDemo: false,      // flag to override gamePaused for LevelIntroduction demos
    adIsShowing: false,
    boardContainer: null,
    playAreaWidth: 0,
    playAreaHeight: 0,
    gameInProgress: false,
    gameState: 0,
    gamePriorState: 0,
    gameStateStartTime: 0,
    gamePlayState: 0,
    quitPending: false,
    audioMute: false,
    gameLevel: 1,
    gameId: 0,
    challengeGameId: 0,
    challengeAdvanceStreak: 0,
    userBeatAllChallenges: false,
    userBeatAllChallengesFirstTime: false,
    gameNumber: 1,
    isChallengeGame: false,
    playerBeatChallenge: false,
    gameType: 0,
    numberOfGamesInLevel: 1,
    gameScore: 0,
    levelScore: 0,
    totalScore: 0,
    startingLevel: 1,
    startingGameNumber: 1,
    priorBestGameScore: 0,
    levelMatchCounter: 0,
    levelComplete: false,
    lastPlayedDate: null,
    matchCount: 0,
    consecutiveMatchCount: 0,
    chainCount: null,
    numberOfCombos: 0,
    luckyGuessCount: 0,
    missCount: 0,
    moveCountDown: -1,
    levelTolerance: 0,
    gameMatchCount: 0,
    removeMatches: false,
    gameStartTime: 0,
    nextTimerUpdateTime: 0,
    gameInitTime: 0,
    lastMatchTime: 0,
    gameEndTime: 0,
    gamePauseTime: 0,
    cardShowTime: 0,
    cardSelected: null,
    cardTargetValue: 0,
    cardFlipTime: 0.2,      // Seconds to flip a card half-way
    cardFlipDx: 0,          // cache the card flip d/t calc as it won't change unless the framerate changes
    allCardsOnBoard: null,  // Tracks all the cards on the board
    simonBag: null,         // holds the randomized value list for the Simon, Haystack, EyeSpy games
    simonPlaybackIndex: 0,
    simonUserIndex: 0,
    monteMoves: null,
    monteIndex: 0,
    monteNumberOfMoves: 0,
    chainsGroupDisplayObject: null,
    chainsStreakCount: 0,
    eyeSpyImageGroups: null,
    eyeSpyTargetCardValue: 0,
    eyeSpyMatchCardValue: 0,
    numberOfCardsShowing: 0,
    achievementDisplayQueue: [],
    achievementDisplayTime: 0,
    imageSheetUrl: "",
    imageSheetImage: null,
    imageSheetSpriteWidth: 0,
    imageSheetSpriteHeight: 0,
    particleSpriteData: null,
    backgroundImage: null,
    timeLastFrame: 0,
    timeThisFrame: 0,
    backgroundSoundInstance: null,
    interstitialSoundInstance: null,
    userName: '',
    userId: 1,
    enginesisUserId: 0,
    authToken: '',
    unlockAllLevelsCounter: 0,
    cheatChallengeNoMiss: false,
    secondaryAssetLoaderProgress: -1,
    mainMenuViewCount: 0,
    adModel: {
        showAds: true,
        showedPreroll: false,
        interstitalCounter: 0,
        adDisplayCounter: 0
    },


    configureGame: function () {
        // setup the game parameters from the configuration file assets/setup.js
        var loaderObject,
            assetLoader = MemoryMatch.assetLoader;

        loaderObject = assetLoader.getResult("guiSprites1json");
        if (loaderObject != null) {
            this.GameSetup.guiSpritesheet1Frames = loaderObject;
        }
        loaderObject = assetLoader.getResult("guiSprites2json");
        if (loaderObject != null) {
            this.GameSetup.guiSpritesheet2Frames = loaderObject;
        }
        loaderObject = assetLoader.getResult("guiSprites3json");
        if (loaderObject != null) {
            this.GameSetup.mapSpritesheetFrames = loaderObject;
        }
        loaderObject = assetLoader.getResult("guiSprites4json");
        if (loaderObject != null) {
            this.GameSetup.shareIconsFrames = loaderObject;
        }
        this.GameSetup.guiSpritesheet1Frames.images = [assetLoader.getResult("guiSprites1")];
        this.GameSetup.guiSpritesheet2Frames.images = [assetLoader.getResult("guiSprites2")];
        this.GameSetup.mapSpritesheetFrames.images = [assetLoader.getResult("guiSprites3")];
        this.GameSetup.shareIconsFrames.images = [assetLoader.getResult("guiSprites4")];

        MemoryMatch.backgroundImage = assetLoader.getResult("background");
        MemoryMatch.cardMargin = 2;
        MemoryMatch.moveCountDown = -1;
        MemoryMatch.setBoardSize(this.GameSetup.rows, this.GameSetup.columns);
        MemoryMatch.gameData = this.GameSetup.games;
    },

    initializeGame: function () {
        this.gameState = MemoryMatch.GAMESTATE.LOADING;
        this.gamePlayState = MemoryMatch.GAMEPLAYSTATE.IDLE;
        this.gameInitTime = Date.now();
        this.timeLastFrame = Date.now();
        this.configureGame();
        this.restoreUsers();

        // start the Enginesis session
        enginesisSession = enginesis(this.GameSetup.siteId, this.GameSetup.gameId, 0, this.GameSetup.enginesisStage, '', this.GameSetup.developerKey, 'en', this.enginesisCallBack.bind(this));
        enginesisSession.gameTrackingRecord('game', 'load', '', '', null);
        enginesisSession.sessionBegin(this.GameSetup.gameKey);
        // TODO: save authtoken, user id, user name, avatar

        // find canvas and perform the basic setup tasks to get everything in order to start the game
        var canvas = document.getElementById(this.stageCanvasElement);
        this.playAreaWidth = canvas.width;
        this.playAreaHeight = canvas.height;

        // create a new stage and point it at our canvas:
        this.stage = new createjs.Stage(canvas);
        if ( ! MemoryMatch.isTouchDevice) {
            MemoryMatch.fps = 50;
            this.stage.enableMouseOver(10); // detecting mouseover is a performance drain, so only do it if we need it
        } else {
            MemoryMatch.fps = 40;
        }
        createjs.Touch.enable(this.stage, true, false);

        this.showBackgroundImage(canvas);
        this.boardContainer = new createjs.Container();
        this.stage.addChild(this.boardContainer);
        this.GameGUI.build(this.stage);
        MemoryMatch.AnimationHandler.init(canvas, this.stage);
        MemoryMatch.gameWasInitialized = true;

        MemoryMatch.frameTime = 1000 / MemoryMatch.fps; // milliseconds per frame
        MemoryMatch.cardFlipDx = MemoryMatch.cardFlipTime * MemoryMatch.fps;
        createjs.Ticker.setFPS(this.fps);
        createjs.Ticker.addEventListener("tick", this.onEnterFrame.bind(this));

        this.restoreLastSession();
        window.addEventListener('resize', MemoryMatch.stageSizeChanged, false);
        window.addEventListener('orientationchange', MemoryMatch.stageSizeChanged, false);
        document.addEventListener('pause', MemoryMatch.onPauseGame.bind(this), false);
        document.addEventListener('resume', MemoryMatch.unPauseGame.bind(this), false);
        document.addEventListener(MemoryMatch.getVisibilityChangeEvent(), MemoryMatch.onVisibilityChange.bind(MemoryMatch));

        if (MemoryMatch.isDesiredOrientation()) {
            MemoryMatch.showOrientationMessage(false);
            if (this.getQueryStringValue('level') != null) {
                this.processDeepLink();
            } else {
                this.showMenuScreen();
            }
        } else {
            MemoryMatch.showOrientationMessage(true);
        }
    },

    reinitializeGame: function () {
        var canvas = document.getElementById(this.stageCanvasElement);
        this.playAreaWidth = canvas.width;
        this.playAreaHeight = canvas.height;
        this.configureGame();
        this.showBackgroundImage(canvas);
        if (this.boardContainer != null) {
            this.boardContainer.removeAllChildren();
            this.boardContainer = new createjs.Container();
            this.stage.addChild(this.boardContainer);
        }
        this.GameGUI.build(this.stage);
        this.AnimationHandler.init(canvas, this.stage);
        if (this.isDesiredOrientation()) {
            this.showOrientationMessage(false);
            this.showMenuScreen();
        } else {
            this.showOrientationMessage(true);
        }
    },

    stopGame: function () {
        createjs.Ticker.removeEventListener("tick", MemoryMatch.onEnterFrame);
        createjs.Touch.disable(MemoryMatch.stage);
    },

    saveGame: function () {
        // save all game variables to persistent storage so we can restore the game at the same place
        var gameSaveState;

        if (MemoryMatch.hasHTML5LocalStorage()) {
            gameSaveState = {};
            gameSaveState.gameInProgress = MemoryMatch.gameInProgress;
            gameSaveState.gameLevel = MemoryMatch.gameLevel;
            gameSaveState.gameId = MemoryMatch.gameId;
            gameSaveState.challengeGameId = MemoryMatch.challengeGameId;
            gameSaveState.gameNumber = MemoryMatch.gameNumber;
            gameSaveState.gameState = MemoryMatch.gameState;
            gameSaveState.gamePriorState = MemoryMatch.gamePriorState;
            gameSaveState.gameStateStartTime = MemoryMatch.gameStateStartTime;
            gameSaveState.gamePlayState = MemoryMatch.gamePlayState;
            gameSaveState.numberOfGamesInLevel = MemoryMatch.numberOfGamesInLevel;
            gameSaveState.gameScore = MemoryMatch.gameScore;
            gameSaveState.matchCount = MemoryMatch.matchCount;
            gameSaveState.consecutiveMatchCount = MemoryMatch.consecutiveMatchCount;
            gameSaveState.numberOfCombos = MemoryMatch.numberOfCombos;
            gameSaveState.missCount = MemoryMatch.missCount;
            gameSaveState.moveCountDown = MemoryMatch.moveCountDown;
            gameSaveState.levelTolerance = MemoryMatch.levelTolerance;
            gameSaveState.gameMatchCount = MemoryMatch.gameMatchCount;
            gameSaveState.gameMatchCount = MemoryMatch.gameMatchCount;
            gameSaveState.gameInitTime = MemoryMatch.gameInitTime;
            gameSaveState.gameStartTime = MemoryMatch.gameStartTime;
            gameSaveState.gamePauseTime = MemoryMatch.gamePauseTime;
            gameSaveState.lastMatchTime = MemoryMatch.lastMatchTime;
            // gameSaveState.allCardsOnBoard = // Need to loop through all the cards and save their current values
            // gameSaveState.cardSelected = If a card is currently selected we need to restore that state
            MemoryMatch.saveObjectWithKey(MemoryMatch.getGameKey("gameSaveState"), gameSaveState);
        }
    },

    restoreGame: function () {
        // restore all game variables and reset the game at the same place
        var gameSaveState = MemoryMatch.loadObjectWithKey(MemoryMatch.getGameKey("gameSaveState"));
        return gameSaveState;
    },

    playBackgroundMusic: function () {
        if (MemoryMatch.backgroundSoundInstance !== null) {
            if (MemoryMatch.backgroundSoundInstance.playState !== createjs.Sound.PLAY_SUCCEEDED) {
                MemoryMatch.backgroundSoundInstance.play({delay: 0, loop: -1});
//                MemoryMatch.debugLog("playBackgroundMusic: restarting last music");
            }
        } else {
            MemoryMatch.backgroundSoundInstance = createjs.Sound.play("soundIntro", {delay: 0, loop: -1});
//            MemoryMatch.debugLog("playBackgroundMusic: starting soundIntro");
        }
    },

    playInterstitialMusic: function (soundReference, looped) {
        var loopCount;

        if (looped == undefined || looped == null) {
            looped = false;
        }
        if (looped) {
            loopCount = -1;
        } else {
            loopCount = 0;
        }
        if (MemoryMatch.interstitialSoundInstance !== null) {
            if (MemoryMatch.interstitialSoundInstance.playState !== createjs.Sound.PLAY_SUCCEEDED) {
                MemoryMatch.interstitialSoundInstance.play({delay: 0, loop: loopCount});
//                MemoryMatch.debugLog("playInterstitialMusic: restarting last " + soundReference);
            }
        } else {
            MemoryMatch.interstitialSoundInstance = createjs.Sound.play(soundReference, {delay: 0, loop: loopCount});
//            MemoryMatch.debugLog("playInterstitialMusic: starting " + soundReference);
        }
    },

    stopBackgroundMusic: function () {
        if (MemoryMatch.backgroundSoundInstance !== null) {
            MemoryMatch.backgroundSoundInstance.stop();
        }
    },

    stopInterstitialMusic: function () {
        if (MemoryMatch.interstitialSoundInstance !== null) {
            MemoryMatch.interstitialSoundInstance.stop();
            MemoryMatch.interstitialSoundInstance = null;
        }
    },

    restartBackgroundMusic: function () {
        if (MemoryMatch.backgroundSoundInstance !== null) {
            if (MemoryMatch.backgroundSoundInstance.playState == createjs.Sound.PLAY_SUCCEEDED || MemoryMatch.backgroundSoundInstance.playState == createjs.Sound.PLAY_FINISHED) {
                MemoryMatch.backgroundSoundInstance.play({delay: 0, loop: -1});
//                MemoryMatch.debugLog("restartBackgroundMusic: restarting last music");
            }
        }
    },

    playShuffleMusic: function (playFlag) {
        if (playFlag) {
            MemoryMatch.playInterstitialMusic("soundShuffling", true);
        } else {
            MemoryMatch.stopInterstitialMusic();
        }
    },

    triggerSoundFx: function (tag, params) {
        if ( ! MemoryMatch.isGamePaused()) {
//            MemoryMatch.debugLog("triggerSoundFx: " + tag);
            createjs.Sound.play(tag, params);
        }
    },

    playNote: function (noteNumber) {
        if (noteNumber == null || noteNumber < 1) {
            noteNumber = 1;
        } else if (noteNumber > 8) {
            noteNumber = 8;
        }
        MemoryMatch.triggerSoundFx("note" + noteNumber.toString(), {interrupt: createjs.Sound.INTERRUPT_NONE, delay: 0, offset:0, loop: false, volume: 1});
    },

    showMenuScreen: function () {
        MemoryMatch.mainMenuViewCount ++;
        MemoryMatch.gameCleanUp();
        MemoryMatch.stopInterstitialMusic();
        if ( ! MemoryMatch.isTouchDevice || (MemoryMatch.isTouchDevice && MemoryMatch.mainMenuViewCount > 1)) {
            MemoryMatch.playBackgroundMusic();
        }
        MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.MENU);
        MemoryMatch.MainMenu.setup(MemoryMatch.stage, MemoryMatch.getGameData(false), MemoryMatch.mainMenuCallback);
        MemoryMatch.MainMenu.buildScreen(true);
        MemoryMatch.determineIfItTimeToShowAdPopup(MemoryMatch.onCloseAdPopup.bind(MemoryMatch));
    },

    mainMenuCallback: function (levelNumber) {
        MemoryMatch.beginGameWithLevelNumber(levelNumber);
    },

    goToHomeScreen: function () {
        MemoryMatch.GameGUI.show(false);
        MemoryMatch.showMenuScreen();
    },

    processDeepLink: function () {
        // if requested level is unlocked then jump to it

        var requestedLevel = this.getQueryStringValue('level'),
            goToMainMenu = true,
            levelData,
            levelAndGameNumber;

        if (requestedLevel != null) {
            if (MemoryMatch.isLevelUnlocked(requestedLevel)) {
                MemoryMatch.gameCleanUp();
                levelAndGameNumber = MemoryMatch.convertLevelNumberToLevelAndGameNumber(requestedLevel);
                MemoryMatch.gameLevel = levelAndGameNumber.levelNumber;
                levelData = MemoryMatch.getLevelData(MemoryMatch.gameLevel);
                MemoryMatch.numberOfGamesInLevel = levelData.gameCount;
                MemoryMatch.startingLevel = levelAndGameNumber.levelNumber;
                MemoryMatch.startingGameNumber = levelAndGameNumber.gameNumber;
                MemoryMatch.resetUserTotalScore();
                MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
                MemoryMatch.startGameWithNumber(levelAndGameNumber.gameNumber);
                goToMainMenu = false;
            }
        }
        if (goToMainMenu) {
            MemoryMatch.showMenuScreen();
        }
    },

    showSharePopup: function (shareMessage, shareShortMessage) {
        var shareTitle = MemoryMatch.tokenReplace(MemoryMatch.GameSetup.GUIStrings.sharePopupTitle, {"gamename": MemoryMatch.GameSetup.gameTitle});
        MemoryMatch.SharePopup.setup(MemoryMatch.stage, {title: "Share", message: shareTitle, callback: MemoryMatch.onShareClosed.bind(MemoryMatch), closeButton: true, continueButton: false, noscale: true, shareMessage: shareMessage, shareShortMessage: shareShortMessage, domElementEmailForm: 'emailshare'});
        MemoryMatch.SharePopup.buildScreen(true);
    },

    onShareClosed: function (event) {
        MemoryMatch.GameOptions.closePopupFromPopup("continue");
    },

    closeAllPopups: function () {
        if (MemoryMatch.SharePopup.isShowing()) {
            MemoryMatch.SharePopup.closePopup();
        }
        if (MemoryMatch.MessagePopup.isShowing()) {
            MemoryMatch.MessagePopup.closePopup();
        }
        if (MemoryMatch.GameOptions.isShowing()) {
            MemoryMatch.GameOptions.closePopupFromPopup("continue");
        }
    },

    onQuitGame: function () {
        MemoryMatch.gameStartTime = 0;
        MemoryMatch.gamePauseTime = 0;
        MemoryMatch.nextTimerUpdateTime = 0;
        MemoryMatch.gamePaused = false;
        MemoryMatch.gamePausePending = false;
        MemoryMatch.quitPending = true;
        MemoryMatch.gameInProgress = false;
        MemoryMatch.GameGUI.setMessage('');
        MemoryMatch.levelCleanUp();
        MemoryMatch.AnimationHandler.quitPending(true);
        MemoryMatch.AnimationHandler.clearAll();
        MemoryMatch.clearBoard();      // remove all display objects
        MemoryMatch.GameResults.close();
        MemoryMatch.goToHomeScreen();
        MemoryMatch.quitPending = false;
        MemoryMatch.AnimationHandler.quitPending(false);
    },

    onPauseGame: function (pauseFlag) {

        // Pause or unpause the game

        var restoredFromPause = false;

        if (pauseFlag === undefined || pauseFlag === null) {
            pauseFlag = true;
        }
        if (pauseFlag && MemoryMatch.gameInProgress) {
//            MemoryMatch.debugLog("Pausing game when in progress");
            // app went from active to inactive, show GAME PAUSED popup
            MemoryMatch.stopInterstitialMusic();
            MemoryMatch.pauseGameInProgress();
            if ( ! MemoryMatch.GameOptions.isShowing()) {
                MemoryMatch.GameOptions.setup(MemoryMatch.stage, MemoryMatch.GameGUI.onOptionsClosed, true);
                MemoryMatch.GameOptions.buildScreen(true, false);
            }
            MemoryMatch.stage.update(); // render these updates now as the render loop will be paused
            MemoryMatch.stageUpdated = false;
            MemoryMatch.gamePaused = true;
            MemoryMatch.runAnimations = false;
        } else if (pauseFlag) {
            // stop music
//            MemoryMatch.debugLog("Pausing game NOT in progress");
            MemoryMatch.gamePaused = true;
            MemoryMatch.stopInterstitialMusic();
            MemoryMatch.stopBackgroundMusic();
            MemoryMatch.AnimationHandler.removeWithTag(MemoryMatch.BOARD_ANIMATION_TAG); // kill any board wait timers
            MemoryMatch.runAnimations = false;
        } else {
            // app went from inactive to active. if we are on the home screen then restart the music
//            MemoryMatch.debugLog("Resuming game");
            MemoryMatch.runAnimations = true;
            if (MemoryMatch.gameState == MemoryMatch.GAMESTATE.MENU || (MemoryMatch.gameState == MemoryMatch.GAMESTATE.SHOWAD && MemoryMatch.gamePriorState == MemoryMatch.GAMESTATE.MENU)) {
                MemoryMatch.restartBackgroundMusic();
                MemoryMatch.gamePaused = false;
                MemoryMatch.GameGUI.resume(null);
                restoredFromPause = true;
            }
            if (MemoryMatch.GameResults != null) {
                if (MemoryMatch.GameResults.pausedWhileShowingAd) {
                    MemoryMatch.GameResults.pausedWhileShowingAd = false;
                    MemoryMatch.gamePaused = false;
                    MemoryMatch.GameResults.close();
                    restoredFromPause = true;
                } else if (MemoryMatch.GameResults.isShowing()) {
                    MemoryMatch.gamePaused = false;
                    restoredFromPause = true;
                }
            }
            if ( ! restoredFromPause && MemoryMatch.GameOptions != null && ! MemoryMatch.GameOptions.isShowing()) {
                createjs.Touch.enable(MemoryMatch.stage, true, false);
                MemoryMatch.gamePaused = false;
                if (MemoryMatch.ChallengeIntroduction != null && MemoryMatch.ChallengeIntroduction.isShowing()) {
                    MemoryMatch.ChallengeIntroduction.resumeFromPause();
                }
            }
        }
        MemoryMatch.gamePausePending = false;
    },

    unPauseGame: function () {
        MemoryMatch.onPauseGame(false);
    },

    pauseGameInProgress: function () {
        if ( ! MemoryMatch.gamePaused && MemoryMatch.gameInProgress) {
            MemoryMatch.gamePausePending = true;
            if (MemoryMatch.gamePauseTime == 0) {
                MemoryMatch.gamePauseTime = Date.now();
            }
            MemoryMatch.AnimationHandler.removeWithTag(MemoryMatch.BOARD_ANIMATION_TAG); // kill any board wait timers
            MemoryMatch.saveGame();
            MemoryMatch.turnBackAllCards();
            MemoryMatch.GameGUI.pause(null);
        }
    },

    pauseGamePendingComplete: function () {
        MemoryMatch.gamePausePending = false;
        if (MemoryMatch.gameInProgress) {
            MemoryMatch.gamePaused = true;
        }
    },

    resumePausedGame: function (event) {
        var pauseTime = Date.now() - MemoryMatch.gamePauseTime;

        // we get here when the Game Paused popup is closed.
        // restore game state, unless we were previewing cards, then start over.
        MemoryMatch.gamePauseTime = 0;
        MemoryMatch.nextTimerUpdateTime = 0;
        MemoryMatch.gamePaused = false;
        MemoryMatch.gamePausePending = false;
        createjs.Touch.enable(MemoryMatch.stage, true, false);
        if (MemoryMatch.gameStartTime > 0) {
            MemoryMatch.gameStartTime += pauseTime; // update the game timer
        }
        MemoryMatch.updateGameTimers();
        if (MemoryMatch.isChallengeGame) {
            if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.SIMON) { // replay the simon pattern and reset user to beginning of current streak
                MemoryMatch.restoreAllCards();
                MemoryMatch.simonUserIndex = 0;
                window.setTimeout(MemoryMatch.simonPlayback.bind(MemoryMatch), 800); // need a delay to wait for the card flip animation to complete
            } else {
                MemoryMatch.restartCurrentChallengeGame(); // restart the current game keeping current streak in tact
            }
        } else if (MemoryMatch.gamePlayState <= MemoryMatch.GAMEPLAYSTATE.PLAY_WAIT) {
            MemoryMatch.replayCurrentGame();
        } else {
            MemoryMatch.restoreGame();
            MemoryMatch.restoreAllCards();
        }
    },

    isGamePaused: function () {
        return MemoryMatch.gamePausePending || MemoryMatch.gamePaused;
    },

    startGameWithNumber: function (gameNumber) {
        var levelData = MemoryMatch.getLevelData(MemoryMatch.gameLevel);

        MemoryMatch.gameId = levelData.gameId;
        MemoryMatch.challengeGameId = levelData.challengeGameId;
        MemoryMatch.challengeAdvanceStreak = levelData.challengeAdvanceStreak;
        if (MemoryMatch.shouldShowLevelIntroduction(MemoryMatch.gameLevel)) {
            MemoryMatch.isChallengeGame = false;
            MemoryMatch.gameNumber = 1;
            MemoryMatch.showLevelIntroduction(gameNumber);
        } else {
            MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.PLAY);
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.GET_READY;
            if (gameNumber == 99) {
                MemoryMatch.isChallengeGame = true;
                MemoryMatch.gameNumber = 1;
                MemoryMatch.startLevelChallenge();
            } else {
                gameNumber = Math.min(gameNumber || 1, MemoryMatch.numberOfGamesInLevel); // make sure it is in the supported range 1..N
                MemoryMatch.isChallengeGame = false;
                MemoryMatch.gameNumber = gameNumber;
                MemoryMatch.startNextGame();
            }
        }
    },

    beginGameWithLevelNumber: function (requestedLevel) {
        // if requested level is unlocked then jump to it

        var levelData,
            levelAndGameNumber,
            goToMainMenu = true;

        if (requestedLevel != null) {
            if (MemoryMatch.isLevelUnlocked(requestedLevel)) {
                MemoryMatch.gameCleanUp();
                levelAndGameNumber = MemoryMatch.convertLevelNumberToLevelAndGameNumber(requestedLevel);
                MemoryMatch.gameLevel = levelAndGameNumber.levelNumber;
                levelData = MemoryMatch.getLevelData(MemoryMatch.gameLevel);
                MemoryMatch.numberOfGamesInLevel = levelData.gameCount;
                MemoryMatch.startingLevel = levelAndGameNumber.levelNumber;
                MemoryMatch.startingGameNumber = levelAndGameNumber.gameNumber;
                MemoryMatch.resetUserTotalScore();
                MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
                MemoryMatch.startGameWithNumber(levelAndGameNumber.gameNumber);
                goToMainMenu = false;
                MemoryMatch.chainsStreakCount = 0;
            }
        }
        if (goToMainMenu) {
            MemoryMatch.showMenuScreen();
        }
    },

    beginNewGame: function (startLevel, startGame) {
        var levelData;
        if (startLevel < 1 || startLevel > MemoryMatch.GameSetup.levels.length) {
            startLevel = 1;
        }
        MemoryMatch.gameLevel = startLevel;
        levelData = MemoryMatch.getLevelData(MemoryMatch.gameLevel);
        MemoryMatch.gameId = levelData.gameId;
        MemoryMatch.challengeGameId = levelData.challengeGameId;
        MemoryMatch.challengeAdvanceStreak = levelData.challengeAdvanceStreak;
        if (MemoryMatch.gameData != null) {
            MemoryMatch.numberOfGamesInLevel = levelData.gameCount;
        } else {
            MemoryMatch.numberOfGamesInLevel = 1;
        }
        MemoryMatch.gameNumber = Math.min(startGame || 1, MemoryMatch.numberOfGamesInLevel);
        MemoryMatch.startingLevel = startLevel;
        MemoryMatch.startingGameNumber = MemoryMatch.gameNumber;
        MemoryMatch.resetUserTotalScore();
        MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
        MemoryMatch.startNextLevel();
    },

    startNextGame: function () {
        var gameProgressionData = null,
            thisGameData,
            guiFlashThreshold = 0;

        // Use to setup a game, reset all timers and counters for an individual game
//        MemoryMatch.debugLog("MemoryMatch:startNextGame ");
        MemoryMatch.gameInProgress = true;
        MemoryMatch.stopBackgroundMusic();
        MemoryMatch.GameGUI.show(true);
        if (MemoryMatch.gameData != null) {
            thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
            MemoryMatch.gameType = thisGameData.gameType;
            if (thisGameData.progression != null && thisGameData.progression.length >= MemoryMatch.gameNumber) {
                gameProgressionData = thisGameData.progression[MemoryMatch.gameNumber - 1];
            } else {
                gameProgressionData = thisGameData;
            }
            if (gameProgressionData != null) {
                MemoryMatch.rows = gameProgressionData.rows;
                MemoryMatch.columns = gameProgressionData.columns;
                if (MemoryMatch.gameNumber == 1 || ! MemoryMatch.isChallengeGame) {
                    MemoryMatch.moveCountDown = gameProgressionData.tolerance;
                    MemoryMatch.levelTolerance = gameProgressionData.tolerance;
                    if (gameProgressionData.matchCount != null) {
                        MemoryMatch.gameMatchCount = gameProgressionData.matchCount;
                    }
                    guiFlashThreshold = MemoryMatch.moveCountDown > 2 ? 2 : 1;
                }
            }
            if (thisGameData.removeMatches != null) {
                MemoryMatch.removeMatches = thisGameData.removeMatches ? true : false; // make sure it evaluates to a boolean value
            }
            if (thisGameData.cardShowTime != null) {
                MemoryMatch.cardShowTime = thisGameData.cardShowTime;
            } else {
                MemoryMatch.cardShowTime = 500;
            }
            MemoryMatch.cardShowTime += (MemoryMatch.cardFlipTime * 1000);
            // Get card set based on level
            if (thisGameData.numCards != null) {
                MemoryMatch.numCardsAvailable = thisGameData.numCards;
            }
            if (MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.EYESPY) { // EYESPY will do this itself
                MemoryMatch.loadCardSetForCurrentLevel();
            }
        } else {
            MemoryMatch.moveCountDown = -1;
            MemoryMatch.levelTolerance = 0;
        }
        if ( ! (MemoryMatch.isChallengeGame && MemoryMatch.gameNumber > 1)) { // do not reset if continuing the Challenge game
            MemoryMatch.gameScore = 0;
            MemoryMatch.numberOfCombos = 0;
            MemoryMatch.luckyGuessCount = 0;
            MemoryMatch.missCount = 0;
            MemoryMatch.gameStartTime = 0;
            MemoryMatch.nextTimerUpdateTime = 0;
            MemoryMatch.lastMatchTime = 0;
        }
        if (MemoryMatch.isChallengeGame) {
            MemoryMatch.priorBestGameScore = MemoryMatch.getPriorBestScoreForGameNumber(MemoryMatch.gameLevel, 99);
            guiFlashThreshold = 0;
            MemoryMatch.playerBeatChallenge = false;
        } else {
            MemoryMatch.priorBestGameScore = MemoryMatch.getPriorBestScoreForGameNumber(MemoryMatch.gameLevel, MemoryMatch.gameNumber);
        }
        MemoryMatch.GameGUI.updateComboMultiplier(0);
        MemoryMatch.matchCount = 0;
        MemoryMatch.consecutiveMatchCount = 0;
        MemoryMatch.chainCount = null;
        MemoryMatch.numberOfCardsShowing = 0;
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.BOARD_SETUP;
        MemoryMatch.GameGUI.updateLevelDisplay(MemoryMatch.gameLevel, MemoryMatch.gameNumber);
        if ( ! MemoryMatch.gamePaused) {
            MemoryMatch.GameGUI.setFlashCountThreshold(guiFlashThreshold);
            MemoryMatch.updateMatchCountDisplay();
            MemoryMatch.buildBoard();
        }
    },

    loadCardSetForCurrentLevel: function () {
        var cardSize,
            thisGameData,
            cardAssetId,
            cardSetIndex = 0;

        thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
        cardSize = MemoryMatch.getCardSize(thisGameData);
        if (thisGameData.cardSprites != null) {
            cardSetIndex = 0;
            if (thisGameData.numberOfCardSets > 1) {
                cardSetIndex = MemoryMatch.getRandomNumberBetween(0, thisGameData.numberOfCardSets - 1);
            }
            cardAssetId = MemoryMatch.getSpriteAssetId(cardSetIndex);
        } else {
            cardAssetId = "cards1";
        }
        if ( ! MemoryMatch.setImageSheet(cardAssetId, cardSize.width, cardSize.height)) {
            // if the asset is not available then get the first asset
            cardSetIndex = 0;
            cardAssetId = MemoryMatch.getSpriteAssetId(cardSetIndex);
            MemoryMatch.setImageSheet(cardAssetId, cardSize.width, cardSize.height);
        }
    },

    startLevel: function (levelNumber) {
        // Start at the beginning of the requested level number, for deep-linking into a specific level
        var levelData;
        if (levelNumber < 1 || levelNumber > MemoryMatch.GameSetup.levels.length) {
            levelNumber = 1;
        }
        MemoryMatch.gameLevel = levelNumber;
        levelData = MemoryMatch.getLevelData(MemoryMatch.gameLevel);
        MemoryMatch.gameId = levelData.gameId;
        MemoryMatch.challengeGameId = levelData.challengeGameId;
        MemoryMatch.challengeAdvanceStreak = levelData.challengeAdvanceStreak;
        if (MemoryMatch.gameData != null) {
            MemoryMatch.numberOfGamesInLevel = levelData.gameCount;
        } else {
            MemoryMatch.numberOfGamesInLevel = 1;
        }
        MemoryMatch.gameNumber = 1;
        MemoryMatch.isChallengeGame = false;
        MemoryMatch.startingLevel = levelNumber;
        MemoryMatch.startingGameNumber = 1;
        MemoryMatch.resetUserTotalScore();
        MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
        MemoryMatch.startNextLevel();
    },

    startNextLevel: function () {
        // Introduce level
        MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.PLAY);
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.GET_READY;
        MemoryMatch.gameStartTime = 0;
        MemoryMatch.nextTimerUpdateTime = 0;
        MemoryMatch.gameEndTime = 0;
        MemoryMatch.levelComplete = false;
        MemoryMatch.levelMatchCounter = 0;
        if (MemoryMatch.shouldShowLevelIntroduction(MemoryMatch.gameLevel)) {
            MemoryMatch.showLevelIntroduction(MemoryMatch.gameNumber);
        } else {
            MemoryMatch.startNextGame();
        }
    },

    startLevelChallenge: function () {
        MemoryMatch.ChallengeIntroduction.setup(MemoryMatch.stage, MemoryMatch.startChallengeGame.bind(MemoryMatch));
        MemoryMatch.ChallengeIntroduction.buildScreen(true);
    },

    startChallengeGame: function (nextRequest) {
        if (nextRequest == "home") {
            MemoryMatch.goToHomeScreen();
        } else { // "continue"
            if (MemoryMatch.isChallengeGameUnlocked(MemoryMatch.gameLevel)) {
                MemoryMatch.isChallengeGame = true;
                MemoryMatch.gameNumber = 1;
                MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.PLAY);
                MemoryMatch.startNextGame();
            } else {
                MemoryMatch.goToHomeScreen();
            }
        }
    },

    levelIntroductionClosed: function (nextRequest, level, gameNumber) {
        if (nextRequest == 'home') {
            MemoryMatch.goToHomeScreen();
        } else { // "continue"
            MemoryMatch.startGameWithNumber(gameNumber);
        }
    },

    showLevelIntroduction: function (gameNumber) {
        var thisGameData;

        if (MemoryMatch.imageSheetImage == null) {
            thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
            MemoryMatch.gameNumber = gameNumber;
            MemoryMatch.gameId = thisGameData.gameId;
        }
        MemoryMatch.loadCardSetForCurrentLevel();
        MemoryMatch.LevelIntroduction.setup(MemoryMatch.stage, MemoryMatch.levelIntroductionClosed.bind(MemoryMatch), MemoryMatch.gameId, MemoryMatch.gameLevel, gameNumber);
        MemoryMatch.LevelIntroduction.buildScreen(true);
        MemoryMatch.setUserTipSeenForLevel(MemoryMatch.gameLevel);
        MemoryMatch.UserData.flush();
    },

    shouldShowLevelIntroduction: function (gameLevel) {

        // Tip ids are mapped from game ids, assuming a comprehensive tip system would have more than one tip per level.

        var userNotHasSeenLevelIntro,
            gameTipId = MemoryMatch.GameSetup.levels[gameLevel - 1].tipId;

        userNotHasSeenLevelIntro = ! MemoryMatch.UserData.isUserTipSeen(gameTipId);
        return userNotHasSeenLevelIntro;
    },

    setUserTipSeenForLevel: function (gameLevel) {
        var isSet = false,
            gameTipId = MemoryMatch.GameSetup.levels[gameLevel - 1].tipId;

        if (gameTipId != null) {
            MemoryMatch.UserData.setUserTipSeen(gameTipId);
            isSet = true;
        }
        return isSet;
    },

    getNextGameLevel: function () {
        // return the next level from where we are now, the trick is not going past the last level
        var currentLevel = MemoryMatch.gameLevel,
           nextLevel;

        if (currentLevel < 1) {
            nextLevel = 1;
        } else if (currentLevel + 1 > MemoryMatch.GameSetup.levels.length) {
            nextLevel = 1;
        } else {
            nextLevel = currentLevel + 1;
        }
        return nextLevel;
    },

    levelUp: function () {
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.LEVEL_UP;
        MemoryMatch.gameLevel = MemoryMatch.getNextGameLevel();
        MemoryMatch.gameNumber = 1;
        if (MemoryMatch.gameLevel == 1) {
            MemoryMatch.goToHomeScreen();
        } else {
            MemoryMatch.startLevel(MemoryMatch.gameLevel);
        }
    },

    replayLastGame: function () {
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.GET_READY;
        MemoryMatch.gameStartTime = 0;
        MemoryMatch.nextTimerUpdateTime = 0;
        MemoryMatch.gameEndTime = 0;
        MemoryMatch.totalScore -= MemoryMatch.gameScore;
        MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
        MemoryMatch.levelComplete = false;
        if (MemoryMatch.isChallengeGame) {
            MemoryMatch.gameNumber = 1;
            MemoryMatch.startGameWithNumber(99);
        } else {
            MemoryMatch.startGameWithNumber(MemoryMatch.gameNumber);
        }
    },

    replayCurrentGame: function () {
        // Do this ONLY if a game is in progress
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.LOSE;
        MemoryMatch.triggerSoundFx("soundMiss", {delay: 100});
        MemoryMatch.gameEndTime = Date.now();
        MemoryMatch.gamePaused = false;
        MemoryMatch.gamePausePending = false;
        MemoryMatch.gameInProgress = false;
        MemoryMatch.removeAllCards(MemoryMatch.restartGameRemoveCardThenRestart); // calls replayLastGame after cards are removed
    },

    restartCurrentChallengeGame: function () {
        MemoryMatch.gamePaused = false;
        MemoryMatch.gamePausePending = false;
        MemoryMatch.gameInProgress = false;
        MemoryMatch.removeAllCards(MemoryMatch.restartChallengeGameRemoveCardThenReplay); // calls replayCurrentChallengeGame after cards are removed
    },

    replayCurrentChallengeGame: function () {
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.GET_READY;
        MemoryMatch.gameStartTime = 0;
        MemoryMatch.nextTimerUpdateTime = 0;
        MemoryMatch.gameEndTime = 0;
        MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
        MemoryMatch.levelComplete = false;
        if (MemoryMatch.isChallengeGame) {
            MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.PLAY);
            MemoryMatch.startNextGame();
        } else {
            MemoryMatch.startGameWithNumber(MemoryMatch.gameNumber);
        }
    },

    levelResultsClosed: function (nextRequest) {
        // We get here when GameResults popup is closed.
        // nextRequest can be "home", "next", "replay"

        // clean up these assets now as we left them on the stage while Results was showing
        if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.NEMESIS) {
            MemoryMatch.Nemesis.removeNemesisCharacter();
        } else if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.CHAINS) {
            MemoryMatch.removeChainsSprites();
        }
        if (nextRequest == "next") {
            // If the next button was requested we need to determine where to go next based on the users current situation
            if (MemoryMatch.canUserAdvance()) {
                if (MemoryMatch.isChallengeGame) {
                    // When a Challenge game is completed check if the game has been completed
                    if (MemoryMatch.userBeatAllChallengesFirstTime) {
                        MemoryMatch.userBeatAllChallengesFirstTime = false;
                        MemoryMatch.showGameCompleted();
                    } else {
                        MemoryMatch.levelUp();
                    }
                } else if (MemoryMatch.gameNumber == MemoryMatch.numberOfGamesInLevel) {
                    MemoryMatch.startLevelChallenge();
                } else {
                    MemoryMatch.gameNumber ++;
                    MemoryMatch.unlockNextGameForLevel(MemoryMatch.gameLevel, MemoryMatch.gameNumber);
                    if (MemoryMatch.shouldShowLevelIntroduction(MemoryMatch.gameLevel)) {
                        MemoryMatch.showLevelIntroduction(MemoryMatch.gameNumber);
                    } else {
                        MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.PLAY);
                        MemoryMatch.startNextGame();
                    }
                }
            } else {
                MemoryMatch.startNextLevel();
            }
        } else if (nextRequest == "replay") {
            MemoryMatch.replayLastGame();
        } else {
            MemoryMatch.goToHomeScreen();
        }
    },

    levelResults: function () {
        var nextGameNumber,
            nextLevelNumber;

        // Show the level results popup. It will figure out what needs to be shown based on game/level
        // Also unlock the next level now to allow things to work out-of-sequence.

        if ( ! MemoryMatch.GameResults.isShowing()) {
            MemoryMatch.gameInProgress = false;
            if ( ! MemoryMatch.canUserAdvance()) {
                MemoryMatch.gameOver();
                MemoryMatch.levelComplete = false;
            } else if (MemoryMatch.isChallengeGame) {
                MemoryMatch.levelComplete = MemoryMatch.challengePassed();
                if (MemoryMatch.levelComplete) {
                    nextLevelNumber = MemoryMatch.getNextGameLevel();
                    nextGameNumber = MemoryMatch.getNextGameNumber();
                    MemoryMatch.unlockNextGameForLevel(nextLevelNumber, nextGameNumber);
                }
            } else {
                MemoryMatch.levelComplete = MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN;
                nextGameNumber = MemoryMatch.getNextGameNumber();
                MemoryMatch.unlockNextGameForLevel(MemoryMatch.gameLevel, nextGameNumber);
            }
            MemoryMatch.GameGUI.show(false);
            MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.RESULTS);
            MemoryMatch.GameResults.setup(MemoryMatch.stage, MemoryMatch.getGameData(MemoryMatch.isChallengeGame), MemoryMatch.levelResultsClosed);
            MemoryMatch.GameResults.buildScreen(true);
        }
    },

    showGameCompleted: function () {
        MemoryMatch.GameGUI.show(false);
        MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.GAMECOMPLETE);
        MemoryMatch.GameComplete.setup(MemoryMatch.stage, MemoryMatch.gameCompleteClosed);
        MemoryMatch.GameComplete.buildScreen(true);
    },

    gameCompleteClosed: function (request) {
        MemoryMatch.goToHomeScreen();
    },

    levelCleanUp: function () {
        // perform clean up tasks when a level is completed
        switch (MemoryMatch.gameType) {
            case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                MemoryMatch.Nemesis.removeNemesisCharacter();
                break;
            case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                MemoryMatch.removeChainsSprites();
                break;
            case MemoryMatch.GAMEPLAYTYPE.EYESPY:
            case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                MemoryMatch.simonBag = null;
                MemoryMatch.eyeSpyImageGroups = null;
                MemoryMatch.simonUserIndex = 0;
                if (MemoryMatch.cardSelected != null) {
                    MemoryMatch.boardContainer.removeChild(MemoryMatch.cardSelected);
                    MemoryMatch.cardSelected = null;
                }
                break;
            case MemoryMatch.GAMEPLAYTYPE.MONTE:
                MemoryMatch.simonBag = null;
                MemoryMatch.monteMoves = null;
                MemoryMatch.monteIndex = 0;
                MemoryMatch.monteNumberOfMoves = 0;
                break;
            case MemoryMatch.GAMEPLAYTYPE.SIMON:
                MemoryMatch.simonBag = null;
                MemoryMatch.simonPlaybackIndex = 0;
                MemoryMatch.simonUserIndex = 0;
                break;
            case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
            case MemoryMatch.GAMEPLAYTYPE.PATTERN:
            default:
                break;
        }
    },

    gameCleanUp: function () {

        // Reset all game variables to initial state

        MemoryMatch.gameInProgress = false;
        MemoryMatch.gameScore = 0;
        MemoryMatch.levelScore = 0;
        MemoryMatch.MatchCount = 0;
        MemoryMatch.consecutiveMatchCount = 0;
        MemoryMatch.GameGUI.updateComboMultiplier(0);
        MemoryMatch.numberOfCombos = 0;
        MemoryMatch.luckyGuessCount = 0;
        MemoryMatch.missCount = 0;
        MemoryMatch.gameStartTime = 0;
        MemoryMatch.nextTimerUpdateTime = 0;
        MemoryMatch.lastMatchTime = 0;
        MemoryMatch.startingLevel = 1;
        MemoryMatch.startingGameNumber = 1;
        MemoryMatch.resetUserTotalScore();
    },

    getLevelData: function (level) {
        if (level == null) {
            level = MemoryMatch.gameLevel;
        }
        if (level < 1) {
            level = 1;
        }
        return MemoryMatch.GameSetup.levels[Math.min(level, MemoryMatch.GameSetup.levels.length) - 1];
    },

    getGameData: function (forChallenge) {
        // Return the game data configuration for the current level, either the game or the challenge.

        var thisGameData = null,
            gameLevelIndex,
            gameIndex,
            gameId,
            i;

        if (forChallenge == null) {
            forChallenge = MemoryMatch.isChallengeGame;
        }
        gameLevelIndex = Math.min(MemoryMatch.gameLevel, MemoryMatch.GameSetup.levels.length) - 1;
        if (MemoryMatch.gameData != null) {
            if (forChallenge) {
                gameId = MemoryMatch.GameSetup.levels[gameLevelIndex].challengeGameId;
            } else {
                gameId = MemoryMatch.GameSetup.levels[gameLevelIndex].gameId;
            }
            for (i = 0; i < MemoryMatch.gameData.length; i ++) {
                if (MemoryMatch.gameData[i].gameId == gameId) {
                    gameIndex = i;
                    break;
                }
            }
            if (gameIndex == null) {
                gameIndex = 0;
            }
            thisGameData = MemoryMatch.gameData[gameIndex];
        }
        return thisGameData;
    },

    getEyeSpyImageGroups: function () {
        var imageGroups = null,
            gameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);

        if (gameData != null) {
            imageGroups = gameData.imageGroups;
        }
        return imageGroups;
    },

    setImageSheet: function (spriteSheetAsset, spriteWidth, spriteHeight) {
        var loadedAsset = MemoryMatch.assetLoader.getResult(spriteSheetAsset);

        if (loadedAsset == null) {
//            MemoryMatch.debugLog("setImageSheet: card sprites " + spriteSheetAsset + " not loaded.");
            MemoryMatch.imageSheetImage = null;
        } else if (MemoryMatch.imageSheetImage !== loadedAsset) {
//            MemoryMatch.debugLog("setImageSheet: loading card sprites " + spriteSheetAsset + " size (" + spriteWidth + "," + spriteHeight + ")");
            MemoryMatch.imageSheetImage = loadedAsset;
            MemoryMatch.imageSheetSpriteWidth = spriteWidth;
            MemoryMatch.imageSheetSpriteHeight = spriteHeight;
            MemoryMatch.cardWidth = spriteWidth;
            MemoryMatch.cardHeight = spriteHeight;
//        } else {
//            MemoryMatch.debugLog("setImageSheet: card sprites " + spriteSheetAsset + " already loaded.");
        }
        return MemoryMatch.imageSheetImage != null;
    },

    showBackgroundImage: function (canvas) {
        // This method will scale the background image to fit the current stage.
        var bgImage = new createjs.Bitmap(MemoryMatch.backgroundImage),
            xScale,
            yScale,
            infoToDisplay;

        if (MemoryMatch.backgroundImage != null) {
            if (MemoryMatch.backgroundImage.width > canvas.width) {
                xScale = canvas.width / MemoryMatch.backgroundImage.width;
            } else {
                xScale = MemoryMatch.backgroundImage.width / canvas.width;
            }
            if (MemoryMatch.backgroundImage.height > canvas.height) {
                yScale = canvas.height / MemoryMatch.backgroundImage.height;
            } else {
                yScale = MemoryMatch.backgroundImage.height / canvas.height;
            }
            bgImage.cache(0, 0, MemoryMatch.backgroundImage.width, MemoryMatch.backgroundImage.height);
            bgImage.alpha = 1;
            bgImage.scaleX = xScale;
            bgImage.scaleY = yScale;
            MemoryMatch.stage.addChild(bgImage);
            MemoryMatch.stageUpdated = true;
        } else {
            infoToDisplay = new MemoryMatch.InfoPopup(MemoryMatch.stage, true, {title: "LOAD ERROR", message: 'Could not load game files, please check your internet connection.', messageFontSize: 56, autoClose: false});
        }
    },

    setBoardSize: function (numRows, numColumns) {
        MemoryMatch.rows = numRows;
        MemoryMatch.columns = numColumns;
    },

    allAssetsLoaded: function () {
        var totalLoadTime = Date.now() - this.gameStartTime;

        this.assetLoader.removeAllEventListeners();
        if ( ! MemoryMatch.isDesiredOrientationWhenLoadStarted && MemoryMatch.isDesiredOrientation()) {
            // orientation changed while we were loading the game, we need to force a resize now.
            MemoryMatch.setCanvasSize(null);
        }
        if (totalLoadTime < this.minimumSplashScreenDisplayTime) {
            window.setTimeout(this.readyToStart.bind(this), this.minimumSplashScreenDisplayTime - totalLoadTime);
        } else {
            this.readyToStart();
        }
        if (this.secondaryAssetManifest != null && this.secondaryAssetManifest.length > 0) {
            this.beginLoadSecondaryAssets();
        }
    },

    readyToStart: function () {
        this.hideLoader();
        if ( ! this.gameWasInitialized) {
            this.initializeGame();
        } else {
            this.reinitializeGame();
        }
    },

    showLoader: function () {
        if (document.getElementById(this.loaderElement) != null) {
            document.getElementById(this.loaderElement).style.display = "block";
            document.getElementById(this.stageCanvasElement).style.display = "block";
            MemoryMatch.stage.visible = false;
        }
    },

    hideLoader: function () {
        if (document.getElementById(this.loaderElement) != null) {
            document.getElementById(this.loaderElement).style.display = "none";
            document.getElementById(this.stageCanvasElement).style.display = "block";
            if (MemoryMatch.stage != null) {
                MemoryMatch.stage.visible = true;
            }
        }
    },

    assetLoadError: function (event) {
        var item = event.item,
            error = event.error;

        if (item != null) {
            if (error == null) {
                error = "unknown error";
            } else {
                error = error.toString();
            }
            if (event.text != null) {
                error += " " + event.text;
            }
            if (item.ext == 'json' && item.id != null && item.src != null) {
                jQuery.getJSON(item.src, function(jsonObject) {
                    switch (item.id) {
                        case "guiSprites1json":
                            MemoryMatch.GameSetup.guiSpritesheet1Frames = jsonObject;
                            break;
                        case "guiSprites2json":
                            MemoryMatch.GameSetup.guiSpritesheet2Frames = jsonObject;
                            break;
                        case "guiSprites3json":
                            MemoryMatch.GameSetup.mapSpritesheetFrames = jsonObject;
                            break;
                        case "guiSprites4json":
                            MemoryMatch.GameSetup.shareIconsFrames = jsonObject;
                            break;
                        default:
                            break;
                    }
                });
            } else {
                MemoryMatch.debugLog("assetLoadError triggered on " + item.src + " (" + item.id + ") " + error);
            }
        }
    },

    assetLoadProgress: function (event) {
        var progressPercent = event.progress,
            progress = Math.floor(progressPercent * 100),
            progressText,
            canvas,
            context,
            gradient,
            loadingStrings,
            loadingStringIndex;

        if (document.getElementById("loaderProgress") != null && event.type == "progress") {

            // Draw a load bar. Starts at 20%, width is 60% of total width, Y center is 65% of total height
            canvas = document.getElementById(MemoryMatch.stageCanvasElement);
            if (canvas != null) {
                context = canvas.getContext('2d');
                context.save();
                context.beginPath();
                context.translate(MemoryMatch.stageWidth * 0.2, MemoryMatch.stageHeight * 0.65);

                // Draw progress frame:
                context.strokeStyle = jQuery('#loaderProgressFrameStroke').css("color");
                gradient = context.createLinearGradient(1, -1, 1, 28);
                gradient.addColorStop(0, jQuery('#loaderProgressFrameTop').css("color"));
                gradient.addColorStop(0.25, jQuery('#loaderProgressFrameMiddle').css("color"));
                gradient.addColorStop(1, jQuery('#loaderProgressFrameBottom').css("color"));
                context.fillStyle = gradient;
                context.moveTo(0, 0);
                context.fillRect(0, 0, MemoryMatch.stageWidth * 0.605, 28 * MemoryMatch.stageScaleFactor);
                context.stroke();

                // Draw progress bar:
                context.strokeStyle = jQuery('#loaderProgressStroke').css("color");
                gradient = context.createLinearGradient(1, -1, 1, 28);
                gradient.addColorStop(0, jQuery('#loaderProgressTop').css("color"));
                gradient.addColorStop(0.25, jQuery('#loaderProgressMiddle').css("color"));
                gradient.addColorStop(1, jQuery('#loaderProgressBottom').css("color"));
                context.fillStyle = gradient;
                context.moveTo(0, 0);
                context.fillRect(0, 0, progressPercent * (MemoryMatch.stageWidth * 0.605), 28 * MemoryMatch.stageScaleFactor);
                context.stroke();

                context.restore();
            }
            loadingStrings = MemoryMatch.GameSetup.GUIStrings.loadingMessages;
            if (progress >= 100) {
                progressText = loadingStrings[3];
            } else {
                if (progress > 80) {
                    loadingStringIndex = 2;
                } else if (progress > 50) {
                    loadingStringIndex = 1;
                } else {
                    loadingStringIndex = 0;
                }
                progressText = loadingStrings[loadingStringIndex] + " " + progress + "%";
            }
            document.getElementById("loaderProgress").innerText = progressText;
        }
    },

    beginLoadSecondaryAssets: function () {
        var assetLoader = MemoryMatch.assetLoader,
            secondaryAssetManifest = MemoryMatch.secondaryAssetManifest;

        if (secondaryAssetManifest.length > 0) {
            assetLoader.addEventListener("complete", MemoryMatch.secondaryAssetsLoaded.bind(MemoryMatch));
            assetLoader.addEventListener("progress", MemoryMatch.secondaryAssetLoadProgress);
            assetLoader.addEventListener("error", MemoryMatch.secondaryAssetLoadError);
            assetLoader.setMaxConnections(1);
            assetLoader.loadManifest(secondaryAssetManifest);
            MemoryMatch.secondaryAssetManifest = null;
            MemoryMatch.secondaryAssetLoaderProgress = 0;
        }
    },

    secondaryAssetLoadProgress: function (event) {
        var progressPercent = event.progress,
            progress = Math.floor(progressPercent * 100);
        MemoryMatch.secondaryAssetLoaderProgress = progress;
//        MemoryMatch.debugLog("Secondary progress " + progress.toString());
    },

    secondaryAssetLoadError: function (event) {
        var item = event.item,
            error = event.error;

        if (item != null) {
            if (error == null) {
                error = "unknown error";
            }
        }
        MemoryMatch.debugLog("SecondaryAsset load error " + item.src + " (" + item.id + ") " + error);
    },

    secondaryAssetsLoaded: function () {
        var assetLoader = MemoryMatch.assetLoader;
        assetLoader.removeAllEventListeners();
        MemoryMatch.secondaryAssetLoaderProgress = -1;
//        MemoryMatch.debugLog("Secondary load complete!");
    },

    buildBoard: function () {
        // Determine the board layout.
        var distanceBetweenCards = MemoryMatch.cardMargin * 2.0,
            halfCardWidth = MemoryMatch.cardWidth * 0.5,
            halfCardHeight = MemoryMatch.cardHeight * 0.5,
            centerOfBoardX = (MemoryMatch.playAreaWidth * 0.5),
            centerOfBoardY = (MemoryMatch.playAreaHeight * 0.54), // a little extra to account for the HUD
            totalWidthNeeded = ((MemoryMatch.cardWidth + distanceBetweenCards) * MemoryMatch.columns),
            totalHeightNeeded = ((MemoryMatch.cardHeight + distanceBetweenCards) * MemoryMatch.rows),
//            totalWidthNeeded = (column * (MemoryMatch.cardWidth + distanceBetweenCards)) + MemoryMatch.cardWidth;
//            totalHeightNeeded = (row * (MemoryMatch.cardHeight + distanceBetweenCards)) + MemoryMatch.cardHeight;
            numberOfCards = 0,
            spriteData,
            gameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame),
            guiMatchCountLabel = null,
            allCardsShuffled,
            startCardFlipTime = 0,
            cardIndex,
            cardAnimator = null,
            cardValue,
            row,
            column,
            card,
            boardScale,
            boardScaleSmallReduction,
            startCount,
            startMatchCounter = -1;

        // Build a deck of cards based on the type of game we are simulating then shuffle the deck
        MemoryMatch.allCardsOnBoard = [];

        // scale the board based on how many cards are showing. Assumes symmetry.
        MemoryMatch.boardContainer.scaleX = 1.0;
        MemoryMatch.boardContainer.scaleY = 1.0;
        switch (MemoryMatch.gameType) {
            case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
                numberOfCards = (MemoryMatch.rows * MemoryMatch.columns) * 0.5;
                allCardsShuffled = MemoryMatch.shuffleConcentrationDeck(numberOfCards + 1, MemoryMatch.numCardsAvailable); // one extra for the card back
                MemoryMatch.gameMatchCount = numberOfCards;
                startMatchCounter = MemoryMatch.getRandomNumberBetween(0, MemoryMatch.rows * MemoryMatch.columns - 1);
                break;
            case MemoryMatch.GAMEPLAYTYPE.CHAINS:
            case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                numberOfCards = (MemoryMatch.rows * MemoryMatch.columns) * 0.5;
                allCardsShuffled = MemoryMatch.shuffleConcentrationDeck(numberOfCards + 1, MemoryMatch.numCardsAvailable); // one extra for the card back
                MemoryMatch.gameMatchCount = numberOfCards;
                if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.NEMESIS) {
                    startMatchCounter = MemoryMatch.getRandomNumberBetween(0, MemoryMatch.rows * MemoryMatch.columns - 1);
                }
                centerOfBoardX *= 0.9; // need to shift left a bit to accommodate the right side GUI sprites
                break;
            case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                if (MemoryMatch.gameMatchCount < 1) {
                    startCount = gameData.startMatchCount;
                    if (startCount == null || startCount < 1) {
                        startCount = 1;
                    }
                    MemoryMatch.gameMatchCount = startCount + MemoryMatch.gameNumber - 1;
                }
                numberOfCards = MemoryMatch.rows * MemoryMatch.columns;
                MemoryMatch.simonBag = MemoryMatch.shuffleUniqueDeck(0, numberOfCards - 1); // indexes of items in allCardsOnBoard, not the card values
                allCardsShuffled = MemoryMatch.shuffleAllCardsUniqueDeck(MemoryMatch.rows, MemoryMatch.columns, MemoryMatch.numCardsAvailable);
                centerOfBoardX *= 0.9; // need to shift left a bit to accommodate the right side target card
                break;
            case MemoryMatch.GAMEPLAYTYPE.PATTERN:
                startCount = gameData.startMatchCount;
                if (startCount == null || startCount < 1) {
                    startCount = 5;
                }
                numberOfCards = startCount + MemoryMatch.gameNumber - 1;
                allCardsShuffled = MemoryMatch.shufflePatternDeck(MemoryMatch.rows, MemoryMatch.columns, numberOfCards, MemoryMatch.numCardsAvailable);
                MemoryMatch.gameMatchCount = numberOfCards;
                guiMatchCountLabel = 'Streak';
                break;
            case MemoryMatch.GAMEPLAYTYPE.SIMON:
                numberOfCards = MemoryMatch.rows * MemoryMatch.columns;
                allCardsShuffled = MemoryMatch.shuffleAllCardsUniqueDeck(MemoryMatch.rows, MemoryMatch.columns, MemoryMatch.numCardsAvailable);
                MemoryMatch.simonBag = MemoryMatch.makeShuffledBag(99, 0, numberOfCards - 1, 2); // indexes of items in allCardsOnBoard, not the card values
                MemoryMatch.gameMatchCount = 99;
                MemoryMatch.simonPlaybackIndex = 0;
                MemoryMatch.simonUserIndex = 0;
                guiMatchCountLabel = 'Streak';
                break;
            case MemoryMatch.GAMEPLAYTYPE.MONTE:
                if (MemoryMatch.monteNumberOfMoves == 0) {
                    if (gameData.shuffleCount == null || gameData.shuffleCount < 1) {
                        gameData.shuffleCount = 5;
                    }
                    MemoryMatch.monteNumberOfMoves = gameData.shuffleCount;
                } else {
                    MemoryMatch.monteNumberOfMoves ++;
                }
                if (gameData.cardAdvance != null && MemoryMatch.gameNumber >= gameData.cardAdvance) {
                    MemoryMatch.columns = gameData.advanceToColumns;
                    totalWidthNeeded = ((MemoryMatch.cardWidth + distanceBetweenCards) * MemoryMatch.columns);
                }
                allCardsShuffled = MemoryMatch.makeMonteDeck(MemoryMatch.rows, MemoryMatch.columns, MemoryMatch.numCardsAvailable);
                MemoryMatch.gameMatchCount = 1;
                guiMatchCountLabel = 'Streak';
                MemoryMatch.playShuffleMusic(true);
                break;
            case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                MemoryMatch.gameMatchCount = 1;
                MemoryMatch.simonUserIndex = 0;
                allCardsShuffled = MemoryMatch.makeEyeSpyDeck(); // SPECIAL CASE! If allCardsShuffled then no more boards, player wins!
                // makeEyeSpyDeck computes new values for rows/cols, need to determine new play area dimensions
                halfCardWidth = MemoryMatch.cardWidth * 0.5;
                halfCardHeight = MemoryMatch.cardHeight * 0.5;
                totalWidthNeeded = ((MemoryMatch.cardWidth + distanceBetweenCards) * MemoryMatch.columns);
                totalHeightNeeded = ((MemoryMatch.cardHeight + distanceBetweenCards) * (MemoryMatch.rows + 1));
                guiMatchCountLabel = 'Streak';
                break;
            default:
                numberOfCards = MemoryMatch.rows * MemoryMatch.columns;
                allCardsShuffled = MemoryMatch.shuffleAllCardsUniqueDeck(MemoryMatch.rows, MemoryMatch.columns, MemoryMatch.numCardsAvailable);
                MemoryMatch.gameMatchCount = numberOfCards;
                break;
        }
        if (allCardsShuffled == null) {
            // Player Wins (special case for EYESPY after we showed all possible boards). Instead of showing a new board, show the Game Results popup
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
            MemoryMatch.playerBeatChallenge = true;
            MemoryMatch.levelCleanUp();
            MemoryMatch.gameCompleteUpdateUserStats();
            MemoryMatch.levelResults();
        } else {
            spriteData = new createjs.SpriteSheet({
                "images": [MemoryMatch.imageSheetImage],
                "frames": {"regX": 0, "regY": 0, "width": MemoryMatch.cardWidth, "height": MemoryMatch.cardHeight, "count": 0}
            });

            // deal the cards on to the board
            cardIndex = 0;
            for (row = 0; row < MemoryMatch.rows; row ++) {
                for (column = 0; column < MemoryMatch.columns; column ++) {
                    card = MemoryMatch.makeCard(cardIndex, allCardsShuffled[cardIndex], spriteData);
                    if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.EYESPY) {
                        card.setTransform(column * (MemoryMatch.cardWidth + distanceBetweenCards), (row + 1) * (MemoryMatch.cardHeight + distanceBetweenCards));
                    } else {
                        card.setTransform(column * (MemoryMatch.cardWidth + distanceBetweenCards), row * (MemoryMatch.cardHeight + distanceBetweenCards));
                    }
                    MemoryMatch.boardContainer.addChild(card);
                    MemoryMatch.allCardsOnBoard.push(card);
                    cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(card, startCardFlipTime + (150 * cardIndex), 0, false, card.showCard, null);
                    cardAnimator.showAtBegin = true;
                    if (cardIndex == startMatchCounter) {
                        card.setMatchCounter(Math.ceil((MemoryMatch.rows * MemoryMatch.columns) * 0.5) + 1); // Match counter is determined by how many possible matches are on the board
                    }
                    cardIndex ++;
                }
            }
            // Scale the board based on how many rows/columns are showing so it fits the play area given the size of the cards.
            boardScaleSmallReduction = MemoryMatch.cardScaleFactor < 0.5 ? 0.08 : 0;
            if (MemoryMatch.rows > 4 || MemoryMatch.columns > 8) {
                boardScale = 0.52 - boardScaleSmallReduction;
            } else if (MemoryMatch.rows > 3 || MemoryMatch.columns > 6) {
                boardScale = 0.64 - boardScaleSmallReduction;
            } else if (MemoryMatch.rows > 2 || MemoryMatch.columns > 4) {
                boardScale = 0.86 - boardScaleSmallReduction;
            } else {
                boardScale = 1.0;
            }
            boardScale = Math.floor(boardScale * 100) * 0.01;
            MemoryMatch.boardContainer.setTransform(centerOfBoardX, centerOfBoardY, boardScale, boardScale, 0, 0, 0, totalWidthNeeded * 0.5 - halfCardWidth, totalHeightNeeded * 0.5 - halfCardHeight);

            // perform post board setup tasks
            switch (MemoryMatch.gameType) {
                case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                    // make a target card
                    cardValue = MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[0]].value;
                    MemoryMatch.cardSelected = MemoryMatch.makeCard(cardIndex, cardValue, spriteData);
                    MemoryMatch.cardSelected.setTransform(MemoryMatch.columns * (MemoryMatch.cardWidth + distanceBetweenCards) + distanceBetweenCards, ((MemoryMatch.rows * (MemoryMatch.cardHeight + distanceBetweenCards)) * 0.5) - (MemoryMatch.cardHeight * 0.5));
                    MemoryMatch.boardContainer.addChild(MemoryMatch.cardSelected);
                    cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, startCardFlipTime + (150 * cardIndex), 0, false, MemoryMatch.cardSelected.showCard, null);
                    cardAnimator.showAtBegin = true;
                    break;
                case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                    // make a target card
                    cardValue = MemoryMatch.eyeSpyTargetCardValue;
                    if (MemoryMatch.cardSelected == null) {
                        MemoryMatch.cardSelected = MemoryMatch.makeCard(cardIndex, cardValue, spriteData);
                        MemoryMatch.cardSelected.setTransform((totalWidthNeeded - MemoryMatch.cardWidth) * 0.5, 0);
                        MemoryMatch.boardContainer.addChild(MemoryMatch.cardSelected);
                    } else {
                        MemoryMatch.cardSelected.setValue(cardValue);
                        MemoryMatch.cardSelected.x = (totalWidthNeeded - MemoryMatch.cardWidth) * 0.5;
                    }
                    cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, startCardFlipTime + (150 * cardIndex), 0, false, MemoryMatch.cardSelected.showCard, null);
                    cardAnimator.showAtBegin = true;
                    break;
                case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                    MemoryMatch.Nemesis.layoutNemesisPath(MemoryMatch.stage);
                    break;
                case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                    MemoryMatch.chainCount = [0];
                    MemoryMatch.layoutChainsPath();
                    break;
                default:
                    break;
            }
            MemoryMatch.GameGUI.setMatchCountLabel(guiMatchCountLabel);
            MemoryMatch.stageUpdated = true;
        }
    },

    shuffleConcentrationDeck: function (numberOfCards, numberOfCardsAvailable) {
        // make a deck with two of each card
        var allCardsAvailable = [],
            allCardsSelected = [],
            i;

        // make a deck of all available cards, then shuffle it
        for (i = 1; i < numberOfCardsAvailable; i ++) {
            allCardsAvailable.push(i);
        }
        allCardsAvailable = MemoryMatch.shuffleArray(allCardsAvailable);
        for (i = 1; i < numberOfCards; i ++) {
            // we need two of every card, 0 is the card back
            allCardsSelected.push(allCardsAvailable[i]);
            allCardsSelected.push(allCardsAvailable[i]);
        }
        return MemoryMatch.shuffleArray(allCardsSelected);
    },

    shufflePatternDeck: function (rows, columns, numberOfCorrectCards, numberOfCardsAvailable) {
        // Make a deck with only 2 cards - correct card, bad card
        var allCards = [],
            i,
            goodCard = MemoryMatch.getRandomNumberBetween(1, numberOfCardsAvailable),
            badCard = MemoryMatch.getRandomNumberBetweenButNot(1, numberOfCardsAvailable, goodCard);
        MemoryMatch.cardTargetValue = goodCard;

        for (i = 0; i < rows * columns; i ++) {
            if (allCards.length < numberOfCorrectCards) {
                allCards.push(goodCard);
            } else {
                allCards.push(badCard);
            }
        }
        return MemoryMatch.shuffleArray(allCards);
    },

    shuffleUniqueDeck: function (startValue, endValue) {
        // Make a deck with each number occurring only once, then shuffle it
        var allItems = [],
            i;

        for (i = startValue; i <= endValue; i ++) {
            allItems.push(i);
        }
        return MemoryMatch.shuffleArray(allItems);
    },

    shuffleAllCardsUniqueDeck: function (rows, columns, numberOfCardsAvailable) {
        // Make a deck with each card occurring only once
        // Remember 0 is the card back
        var allCards = [],
            i;
        numberOfCardsAvailable = Math.max(numberOfCardsAvailable, rows * columns);

        for (i = 1; i <= numberOfCardsAvailable; i ++) {
            allCards.push(i);
        }
        return MemoryMatch.shuffleArray(allCards);
    },

    makeMonteDeck: function (rows, columns, numberOfCardsAvailable) {
        // Make a deck with only 2 cards, the target card and all other cards the same
        // For best results use an odd number of cards 3 (1x3), 5 (1x5), 9 (3x3) work best
        var allCards = [],
            i,
            numberOfCards = rows * columns,
            medianIndex,
            goodCard = MemoryMatch.getRandomNumberBetween(1, numberOfCardsAvailable),
            badCard = MemoryMatch.getRandomNumberBetweenButNot(1, numberOfCardsAvailable, goodCard);
        MemoryMatch.cardTargetValue = goodCard;

        for (i = 1; i <= numberOfCards; i ++) {
            allCards.push(badCard);
        }
        if (numberOfCards % 2 == 0) {
            medianIndex = numberOfCards * 0.5;
        } else {
            medianIndex = (numberOfCards + 1) * 0.5;
        }
        allCards[medianIndex - 1] = goodCard;
        return allCards;
    },

    makeEyeSpyDeck: function () {
        var imageGroups,
            thisGameData,
            difficulty,
            gameData = null,
            allCards = null,
            shuffledCards = null,
            cardAssetId,
            cardSize,
            i,
            eyeSpyIndex,
            foundUnplayedData,
            playerWins,
            searchPass,
            randomBadCards = [],
            randomIndex;

        if (MemoryMatch.eyeSpyImageGroups == null) {
            MemoryMatch.eyeSpyImageGroups = MemoryMatch.buildRandomEyeSpyDataArray();
        }
        difficulty = MemoryMatch.getEyeSpyDifficultyForCurrentGame();
        playerWins = false;

        if (MemoryMatch.eyeSpyImageGroups != null) {
            // make sure difficulty will index a valid array index
            imageGroups = MemoryMatch.eyeSpyImageGroups[difficulty];
            if (imageGroups == null) {
                imageGroups = MemoryMatch.eyeSpyImageGroups[MemoryMatch.eyeSpyImageGroups.length - 1];
            }
            if (imageGroups != null) {
                // loop through the possibilities and find a random index that was not previously played
                eyeSpyIndex = MemoryMatch.getRandomNumberBetween(0, imageGroups.length - 1);
                foundUnplayedData = false;
                searchPass = 0;
                while ( ! foundUnplayedData && searchPass < 2) {
                    gameData = imageGroups[eyeSpyIndex];
                    if ( ! gameData.played) {
                        foundUnplayedData = true;
                    } else {
                        eyeSpyIndex ++;
                        if (eyeSpyIndex >= imageGroups.length) {
                            eyeSpyIndex = 0;
                            searchPass ++;
                        }
                    }
                }
                if ( ! foundUnplayedData && difficulty == 4) { // User played all available combinations, this player beat the game
                    playerWins = true;
//                    MemoryMatch.debugLog("Game " + MemoryMatch.gameNumber + " Difficulty " + difficulty + " index " + eyeSpyIndex + " PLAYER WINS");
                } else if ( ! foundUnplayedData) { // Some type of data error
                    eyeSpyIndex = imageGroups.length - 1;
                    gameData = imageGroups[eyeSpyIndex];
                }
            }
            if ( ! playerWins) {
//                MemoryMatch.debugLog("Game " + MemoryMatch.gameNumber + " Difficulty " + difficulty + " index " + eyeSpyIndex + " set " + gameData.sprites + " target " + gameData.targetCard + " played? " + (foundUnplayedData ? "NO" : "YES"));
                if (gameData !== null && gameData.matchCard !== null && gameData.badCards !== null && gameData.badCardCount !== null) {
                    gameData.played = true;
                    allCards = [gameData.matchCard];
                    for (i = 0; i < gameData.badCards.length; i ++) {
                        randomBadCards.push(gameData.badCards[i]);
                    }
                    for (i = 0; i < gameData.badCardCount; i ++) {
                        randomIndex = MemoryMatch.getRandomNumberBetween(0, randomBadCards.length - 1);
                        allCards.push(randomBadCards[randomIndex]);
                        randomBadCards.splice(randomIndex, 1);
                    }
                    MemoryMatch.rows = 1;
                    MemoryMatch.columns = allCards.length;
                    thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
                    if (thisGameData.cardSprites != null) {
                        cardAssetId = MemoryMatch.getSpriteAssetId(gameData.sprites);
                    } else {
                        cardAssetId = "cards1";
                    }
                    cardSize = MemoryMatch.getCardSize(thisGameData);
                    MemoryMatch.setImageSheet(cardAssetId, cardSize.width, cardSize.height);
                    shuffledCards = MemoryMatch.shuffleArray(allCards);
                    MemoryMatch.eyeSpyTargetCardValue = gameData.targetCard;
                    MemoryMatch.eyeSpyMatchCardValue = gameData.matchCard;
                }
            }
        }
        return shuffledCards;
    },

    buildRandomEyeSpyDataArray: function () {
        // create a fresh array of the EyeSpy possibilities, arranged by difficulty
        var imageGroups = MemoryMatch.getEyeSpyImageGroups(),
            i,
            eyeSpyDataArray,
            imageGroupData;

        if (imageGroups != null) {
            // organize items by difficulty and set the item to unplayed (so we can track which ones the player has seen)
            eyeSpyDataArray = [];
            for (i = 0; i < imageGroups.length; i ++) {
                imageGroupData = imageGroups[i];
                imageGroupData.played = false;
                if (eyeSpyDataArray[imageGroupData.difficulty] == null) {
                    eyeSpyDataArray[imageGroupData.difficulty] = [];
                }
                eyeSpyDataArray[imageGroupData.difficulty].push(imageGroupData);
            }
        }
        return eyeSpyDataArray;
    },

    getEyeSpyDifficultyForCurrentGame: function () {
        // set difficulty level based on how many games played to this point
        var difficulty,
            gameNumber = MemoryMatch.gameNumber;

        if (gameNumber < 3) { // 2 of diff 1
            difficulty = 1;
        } else if (gameNumber < 6) { // 3 of diff 2
            difficulty = 2;
        } else if (gameNumber <= 9) { // 4 of diff 3
            difficulty = 3;
        } else {
            difficulty = 4; // 6 of diff 4
        }
        return difficulty;
    },

    shuffleArray: function (arrayToShuffle) {
        var cardsToShuffle = arrayToShuffle.length - 1,
            allCardsShuffled = [],
            randomCardIndex,
            i;

        for (i = 0; i < cardsToShuffle; i ++) {
            randomCardIndex = MemoryMatch.getRandomNumberBetween(0, arrayToShuffle.length - 1);
            allCardsShuffled.push(arrayToShuffle[randomCardIndex]);
            arrayToShuffle.splice(randomCardIndex, 1);
        }
        allCardsShuffled.push(arrayToShuffle[0]); // should be the only remaining item
        return allCardsShuffled;
    },

    makeShuffledBag: function (numberOfItems, startValue, endValue, maxConsecutiveAllowed) {
        // build a "bag" of random values starting at startValue and no larger than endValue
        var i,
            shuffledArray = [],
            nextValue = -1,
            lastUsedValue = -1,
            lastUsedValueCount = 1,
            avoidInfiniteLoop = 0;

        if (maxConsecutiveAllowed == null) {
            maxConsecutiveAllowed = 0;
        }
        for (i = 0; i < numberOfItems; i ++) {
            nextValue = MemoryMatch.getRandomNumberBetween(startValue, endValue);
            if (nextValue == lastUsedValue && maxConsecutiveAllowed > 0) {
                lastUsedValueCount ++;
                if (lastUsedValueCount > maxConsecutiveAllowed) {
                    while (nextValue == lastUsedValue && avoidInfiniteLoop < 100) {
                        nextValue = MemoryMatch.getRandomNumberBetween(startValue, endValue);
                        avoidInfiniteLoop ++;
                    }
                    lastUsedValueCount = 1;
                }
            } else {
                lastUsedValueCount = 1;
            }
            shuffledArray.push(nextValue);
            lastUsedValue = nextValue;
        }
        return shuffledArray;
    },

    layoutChainsPath: function () {
        var spriteFrames = MemoryMatch.GameSetup.guiSpritesheet2Frames,
            spriteData = new createjs.SpriteSheet(spriteFrames),
            numberOfTiles = MemoryMatch.levelTolerance, // how many misses allowed == # of tiles
            tileFrame = "chainCardSlot1",
            tileSize = MemoryMatch.getSpriteFrameSize(spriteFrames, tileFrame),
            tileGap = 0,
            tileHeight,
            tileSpriteSource = new createjs.Sprite(spriteData, tileFrame),
            tileNumberSource = new createjs.Text("1", MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColor),
            i,
            tileSprite,
            tileText,
            totalHeightRequired = numberOfTiles * (tileSize.height + tileGap);

        if (MemoryMatch.chainsGroupDisplayObject == null) {
            MemoryMatch.chainsGroupDisplayObject = new createjs.Container();
            MemoryMatch.stage.addChild(MemoryMatch.chainsGroupDisplayObject);
        } else {
            MemoryMatch.chainsGroupDisplayObject.removeAllChildren();
        }

        tileSpriteSource.framerate = 1;
        tileNumberSource.textAlign = 'center';
        tileNumberSource.textBaseline = 'middle';
        tileHeight = tileSize.height; // the first tile is the tallest, use that for reference since all the other tiles are different heights!
        tileGap = tileHeight * 0.25;
        for (i = 0; i < numberOfTiles; i ++) {
            tileSprite = tileSpriteSource.clone();
            tileText = tileNumberSource.clone();
            switch (i) {
                case 0:
                    tileFrame = "chainCardSlot1";
                    break;
                case 1:
                    tileFrame = "chainCardSlot2";
                    break;
                default:
                    tileFrame = "chainCardSlot3";
                    break;
            }
            tileSprite.gotoAndStop(tileFrame);
            tileSprite.name = "chainstile" + i;
            tileSize = MemoryMatch.getSpriteFrameSize(spriteFrames, tileFrame);
            tileSprite.setTransform(tileSize.width * -0.5, (tileHeight + tileGap) * i, 1, 1, 0, 0, 0, 0, 0);
            tileSprite.width = tileSize.width;
            tileSprite.height = tileSize.height;
            tileText.name = "chainstext" + i;
            tileText.text = (i + 1).toString();
            tileText.setTransform(0, tileSprite.y + (tileSize.height * 0.5), 1, 1, 0, 0, 0, 0, 0);
            MemoryMatch.chainsGroupDisplayObject.addChild(tileSprite);
            MemoryMatch.chainsGroupDisplayObject.addChild(tileText);
        }
        MemoryMatch.chainsGroupDisplayObject.setTransform(MemoryMatch.stageWidth - (tileSize.width * 0.8), (MemoryMatch.stageHeight - totalHeightRequired) * 0.5, 1, 1, 0, 0, 0, 0, 0);
        MemoryMatch.stageUpdated = true;
    },

    updateChainCount: function (isMatch) {
        // Manage an array that tracks each chain. This just makes it so much easier to know the number of matches made at any time in the game.
        if (MemoryMatch.chainCount == null) {
            MemoryMatch.chainCount = [];
        }
        if (isMatch) {
            if (MemoryMatch.chainCount.length < 1) {
                MemoryMatch.chainCount.push(0);
            }
            MemoryMatch.chainCount[MemoryMatch.chainCount.length - 1] ++;
        } else {
            MemoryMatch.chainCount.push(0);
        }
    },

    showChainsMatches: function () {
        // display the match summary for the chains game.
        var chains = MemoryMatch.chainCount,
            spriteFrames = MemoryMatch.GameSetup.guiSpritesheet2Frames,
            i,
            m,
            x = 0,
            y = 0,
            offset = 0,
            matchCount,
            spriteData = new createjs.SpriteSheet(spriteFrames),
            cardFrame = "chainCard",
            cardSize = MemoryMatch.getSpriteFrameSize(spriteFrames, cardFrame),
            cardSpriteName,
            cardSprite,
            tileSprite,
            totalMatchCounter = 0,
            cardSpriteSource = new createjs.Sprite(spriteData, cardFrame),
            animator,
            startAnimationDelay = 250,
            animationDelay;

        if (chains.length > 0) {
            for (i = 0; i < chains.length; i ++) {
                matchCount = chains[i];
                offset = 0;
                tileSprite = MemoryMatch.chainsGroupDisplayObject.getChildByName("chainstile" + i);
                if (tileSprite != null) {
                    x = tileSprite.x + (tileSprite.width - cardSize.width) * 0.5;
                    y = tileSprite.y + (tileSprite.height - cardSize.height) * 0.5;
                    for (m = 0; m < matchCount; m ++) {
                        totalMatchCounter ++;
                        cardSpriteName = "chaincard" + totalMatchCounter;
                        cardSprite = MemoryMatch.chainsGroupDisplayObject.getChildByName(cardSpriteName);
                        if (cardSprite == null) {
                            cardSprite = cardSpriteSource.clone();
                            cardSprite.name = cardSpriteName;
                            MemoryMatch.chainsGroupDisplayObject.addChild(cardSprite);
                            cardSprite.visible = false;
                            animationDelay = startAnimationDelay + (100 * m);
                            animator = MemoryMatch.AnimationHandler.addToAnimationQueue(cardSprite, startAnimationDelay + (100 * m), 0, false, null, null);
                            animator.showAtBegin = true;
                            MemoryMatch.triggerSoundFx("soundCardDeal", {delay: animationDelay});
                        } else {
                            cardSprite.visible = true;
                        }
                        cardSprite.setTransform(x + offset, y - offset);
                        offset += 4 * MemoryMatch.stageScaleFactor;
                    }
                }
            }
        }
    },

    removeChainsSprites: function () {
        if (MemoryMatch.chainsGroupDisplayObject != null) {
            MemoryMatch.chainsGroupDisplayObject.removeAllChildren();
            MemoryMatch.stage.removeChild(MemoryMatch.chainsGroupDisplayObject);
            MemoryMatch.chainsGroupDisplayObject = null;
            MemoryMatch.stageUpdated = true;
        }
    },

    updateGameTimers: function () {
        // if a game is in progress then check if timers need to be changed
        var timeNow = Date.now(),
            referenceTime;

        if (MemoryMatch.gameStartTime > 0) {
            if (MemoryMatch.gameEndTime > 0) {
                referenceTime = MemoryMatch.gameEndTime;
            } else {
                referenceTime = timeNow;
            }
            if (MemoryMatch.nextTimerUpdateTime < referenceTime) {
                MemoryMatch.GameGUI.updateGameTimerDisplay(timeNow - MemoryMatch.gameStartTime);
                MemoryMatch.nextTimerUpdateTime = timeNow + 1000;
            }
        } else {
            MemoryMatch.GameGUI.updateGameTimerDisplay(null);
        }
    },

    updateScoreDisplay: function (matchScore) {
        MemoryMatch.gameScore += matchScore;
        MemoryMatch.totalScore += matchScore;
        MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
    },

    updateScoreForMatch: function () {
        // when a match is made update the score based on current scoring parameters
        if (MemoryMatch.isChallengeGame) {
            MemoryMatch.updateScoreDisplay(MemoryMatch.gameNumber * 100);
        } else {
            MemoryMatch.updateScoreDisplay((MemoryMatch.gameLevel * 100) + ((MemoryMatch.consecutiveMatchCount - 1) * 100));
        }
    },

    updateScoreForSimon: function () {
        // when a match is made update the score based on Simon scoring parameters
        MemoryMatch.updateScoreDisplay(40 + (MemoryMatch.gameNumber * 10));
    },

    updateScoreForSimonGameAdvance: function () {
        // when a match is made update the score based on Simon scoring parameters
        MemoryMatch.updateScoreDisplay(100 * MemoryMatch.gameNumber);
        if (MemoryMatch.gameNumber > 15) {
            MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.MOZART);
        }
        MemoryMatch.awardChallengeStreakMilestone();
    },

    checkBoardIsReadyForPlay: function () {
        // check all cards for the level are visible
        var numberOfCardsInLevel,
            showCardCountdownTimer = false,
            timerShowTime,
            cardShowTime,
            animator;

        if (MemoryMatch.isGamePaused()) {
            MemoryMatch.debugLog("checkBoardIsReadyForPlay but game is PAUSED gameState=" + MemoryMatch.gameState + " and playState=" + MemoryMatch.gamePlayState);
            return;
        }
        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.BOARD_SETUP && MemoryMatch.gameState == MemoryMatch.GAMESTATE.PLAY) {
            numberOfCardsInLevel = MemoryMatch.rows * MemoryMatch.columns;
            if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.HAYSTACK || MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.EYESPY) {
                numberOfCardsInLevel ++; // include the target card
            }
            MemoryMatch.numberOfCardsShowing ++;
            cardShowTime = MemoryMatch.cardShowTime + (MemoryMatch.cardFlipTime * 1000);
            if (MemoryMatch.numberOfCardsShowing >= numberOfCardsInLevel) {
                switch (MemoryMatch.gameType) {
                    case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
                    case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                        MemoryMatch.gameStartTime = Date.now();
                        MemoryMatch.nextTimerUpdateTime = 0;
                        MemoryMatch.gameEndTime = 0;
                        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                        break;
                    case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                        // we now want to briefly show all cards
                        MemoryMatch.showAllCards(true);
                        showCardCountdownTimer = true;
                        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], cardShowTime, 0, false, null, MemoryMatch.onShowAllCardsWaitComplete);
                        animator.tag = MemoryMatch.BOARD_ANIMATION_TAG;
                        break;
                    case MemoryMatch.GAMEPLAYTYPE.PATTERN:
                        // we now want to briefly show the cards in the pattern
                        MemoryMatch.gameStartTime = Date.now();
                        MemoryMatch.nextTimerUpdateTime = 0;
                        MemoryMatch.gameEndTime = 0;
                        MemoryMatch.showAllPatternCards(true);
                        showCardCountdownTimer = true;
                        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], cardShowTime, 0, false, null, MemoryMatch.onShowCardsWaitComplete);
                        animator.tag = MemoryMatch.BOARD_ANIMATION_TAG;
                        break;
                    case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                        // we now want to briefly show all cards
                        MemoryMatch.showAllCards(true);
                        showCardCountdownTimer = true;
                        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], cardShowTime, 0, false, null, MemoryMatch.onShowAllCardsWaitComplete);
                        animator.tag = MemoryMatch.BOARD_ANIMATION_TAG;
                        break;
                    case MemoryMatch.GAMEPLAYTYPE.SIMON:
                        // we now want to show all cards
                        MemoryMatch.showAllCards(true);
                        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], 2000, 0, false, null, MemoryMatch.onShowAllCardsWaitComplete);
                        animator.tag = MemoryMatch.BOARD_ANIMATION_TAG;
                        break;
                    case MemoryMatch.GAMEPLAYTYPE.MONTE:
                        // we now want to briefly show all cards
                        MemoryMatch.showAllCards(true);
                        showCardCountdownTimer = true;
                        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], cardShowTime, 0, false, null, MemoryMatch.onShowAllCardsMonteWaitComplete);
                        animator.tag = MemoryMatch.BOARD_ANIMATION_TAG;
                        break;
                    case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                        // show the target card
                        MemoryMatch.cardSelected.flip();
                        showCardCountdownTimer = true;
                        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, cardShowTime, 0, false, null, MemoryMatch.onShowTargetCardWaitComplete);
                        animator.tag = MemoryMatch.BOARD_ANIMATION_TAG;
                        MemoryMatch.gameStartTime = Date.now();
                        MemoryMatch.nextTimerUpdateTime = 0;
                        MemoryMatch.gameEndTime = 0;
                        break;
                    default:
                        break;
                }
                if (showCardCountdownTimer) {
                    timerShowTime = Math.floor(MemoryMatch.cardShowTime / 1000);
                    if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.MONTE) {
                        timerShowTime += 2;
                    }
                    MemoryMatch.GameGUI.showTimerCountdown('Study', timerShowTime);
                    MemoryMatch.GameGUI.startTimerCountdown();
                }
            }
        } else {
            MemoryMatch.debugLog("checkBoardIsReadyForPlay OUT OF SYNC! gameState=" + MemoryMatch.gameState + " and playState=" + MemoryMatch.gamePlayState);
        }
    },

    onCardHighlight: function (evt) {
        evt.target.highlight();
    },

    onCardUnhighlight: function (evt) {
        evt.target.unhighlight();
    },

    onCardClicked: function (evt) {
        var cardSelected = evt.target.parent;

        if (cardSelected != null) {
            if ( ! cardSelected.isEnabled) {
                return;
            }
            if (cardSelected.cardSelectedHandler != null) {
                cardSelected.cardSelectedHandler();
            }
        }
        switch (MemoryMatch.gameType) {
            case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
            case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                MemoryMatch.onCardClickedConcentration(cardSelected);
                break;
            case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                MemoryMatch.onCardClickedChains(cardSelected);
                break;
            case MemoryMatch.GAMEPLAYTYPE.PATTERN:
                MemoryMatch.onCardClickedPattern(cardSelected);
                break;
            case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                MemoryMatch.onCardClickedHaystack(cardSelected);
                break;
            case MemoryMatch.GAMEPLAYTYPE.SIMON:
                MemoryMatch.onCardClickedSimon(cardSelected);
                break;
            case MemoryMatch.GAMEPLAYTYPE.MONTE:
                MemoryMatch.onCardClickedMonte(cardSelected);
                break;
            case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                MemoryMatch.onCardClickedEyeSpy(cardSelected);
                break;
            default:
                break;
        }
    },

    onCardClickedConcentration: function (secondCardSelected) {
        // this method handles CONCENTRATION and NEMESIS
        var earnedAchievement,
            isMatch = false,
            isMiss = false;

        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return;
        }
        if (secondCardSelected.state != MemoryMatch.CARDSTATE.DOWN) {
            return; // do not allow clicking a card that is not down
        }
        if (MemoryMatch.cardSelected == null) {
            MemoryMatch.cardSelected = secondCardSelected;
            MemoryMatch.cardSelected.select();
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
        } else if (MemoryMatch.cardSelected.cardNum != secondCardSelected.cardNum) {
            if (MemoryMatch.cardSelected.value == secondCardSelected.value) {
                secondCardSelected.select();
                isMatch = true;
                earnedAchievement = MemoryMatch.cardsMatch(MemoryMatch.cardSelected, secondCardSelected);
                if ( ! earnedAchievement) {
                    MemoryMatch.triggerSoundFx("soundCorrect", {delay: 0});
                }

                // unselect both and remove cards
                MemoryMatch.cardSelected.removeCard(MemoryMatch.onCardRemoveComplete);
                secondCardSelected.removeCard(MemoryMatch.onCardRemoveCompleteLastCard);
                MemoryMatch.cardSelected = null;

                if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.NEMESIS) {
                    MemoryMatch.Nemesis.awakeNemesisCharacter();
                }
                if ((MemoryMatch.matchCount < MemoryMatch.gameMatchCount)) {
                    MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                }
            } else {
                isMiss = true;
                MemoryMatch.cardsDoNotMatch();
                MemoryMatch.triggerSoundFx("soundMiss", {delay: 0});

                // unselect the first card then unflip it after a delay
                MemoryMatch.cardSelected.unselect();
                MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, 400, 0, false, null, MemoryMatch.onCardMissWaitComplete);

                // make the second card the selected card
                MemoryMatch.cardSelected = secondCardSelected;
                MemoryMatch.cardSelected.select();

                if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.NEMESIS) {
                    MemoryMatch.Nemesis.moveNemesisCharacter();
                }
            }
        } else {
            // turning back the first card counts as a miss
            isMiss = true;
            if (MemoryMatch.moveCountDown > 0) {
                MemoryMatch.moveCountDown --;
            }
            MemoryMatch.missCount ++;
            MemoryMatch.consecutiveMatchCount = 0;
            MemoryMatch.GameGUI.updateComboMultiplier(0);
            MemoryMatch.cardSelected.flipBack();
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
            MemoryMatch.cardSelected = null;
            MemoryMatch.updateMatchCountDisplay();
        }
        if (isMiss) {
            MemoryMatch.updateAllActiveMatchCounters();
        }
    },

    onCardClickedChains: function (secondCardSelected) {
        var isMiss = false;

        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return;
        }
        if (secondCardSelected.state != MemoryMatch.CARDSTATE.DOWN) {
            return; // do not allow clicking a card that is not down
        }
        if (MemoryMatch.cardSelected == null) {
            MemoryMatch.cardSelected = secondCardSelected;
            MemoryMatch.cardSelected.flip();
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
        } else if (MemoryMatch.cardSelected.cardNum != secondCardSelected.cardNum) {
            if (MemoryMatch.cardSelected.value == secondCardSelected.value) {
                secondCardSelected.flip();
                MemoryMatch.cardsMatch(MemoryMatch.cardSelected, secondCardSelected);
                MemoryMatch.cardSelected = null;
                MemoryMatch.updateChainCount(true);
                if ((MemoryMatch.matchCount >= MemoryMatch.gameMatchCount)) {
                    MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                    MemoryMatch.triggerSoundFx("soundCorrect", {delay: 0});
                    MemoryMatch.gameEndTime = Date.now();
                    MemoryMatch.removeAllCards(MemoryMatch.gameCompleteRemoveCardThenAdvance); // user completed the game, but wait for cards to dissolve before advancing
                    MemoryMatch.showChainsMatches();
                } else {
                    MemoryMatch.triggerSoundFx("soundCorrectLess", {delay: 0});
                    MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                }
            } else {
                secondCardSelected.flip();
                isMiss = true;
                MemoryMatch.updateChainCount(false);
                MemoryMatch.showChainsMatches();
                MemoryMatch.cardsDoNotMatch();
                MemoryMatch.triggerSoundFx("soundMiss", {delay: 0});
                // unselect both cards then unflip after a delay
                MemoryMatch.cardSelected.unselect();
                MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, 400, 0, false, null, MemoryMatch.onCardMissWaitComplete);
                MemoryMatch.AnimationHandler.addToAnimationQueue(secondCardSelected, 400, 0, false, null, MemoryMatch.onCardMissWaitCompleteChains);
                MemoryMatch.cardSelected = null;
            }
        }
        if (isMiss) {
            MemoryMatch.updateAllActiveMatchCounters();
        }
    },

    onCardClickedPattern: function (cardSelected) {
        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return;
        }
        if (cardSelected.state != MemoryMatch.CARDSTATE.DOWN) {
            return; // do not allow clicking a card that is not down
        }

        // is this a target card check the card value, 1=hit, 2=miss
        // if a miss? flip it back
        // if a hit, check if game over
        cardSelected.select();
        if (cardSelected.value == MemoryMatch.cardTargetValue || MemoryMatch.cheatChallengeNoMiss) {
            MemoryMatch.cardsMatch(cardSelected, null);
            if (MemoryMatch.matchCount >= MemoryMatch.gameMatchCount) {
                MemoryMatch.gameEndTime = Date.now();
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                MemoryMatch.triggerSoundFx("soundCorrect", {delay: 0});
                MemoryMatch.GameGUI.updateMatchCountDisplay(MemoryMatch.gameNumber);
                MemoryMatch.removeAllCards(MemoryMatch.gameCompleteRemoveCardThenAdvance); // user completed the game, but wait for cards to dissolve before advancing
                MemoryMatch.awardChallengeStreakMilestone();
            } else {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
            }
        } else {
            MemoryMatch.cardsDoNotMatch();
            MemoryMatch.triggerSoundFx("soundMiss", {delay: 0});
            if (MemoryMatch.moveCountDown > 0 || MemoryMatch.levelTolerance == 0) {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
            } else {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.LOSE; // Player lost, but we need to wait for the card to finish flipping
            }
            // unselect this card then unflip it after a delay
            cardSelected.unselect();
            MemoryMatch.AnimationHandler.addToAnimationQueue(cardSelected, 1000, 0, false, null, MemoryMatch.onCardMissWaitComplete);
        }
    },

    onCardClickedHaystack: function (cardSelected) {
        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return; // we are not ready for clicks yet
        }
        if (cardSelected == MemoryMatch.cardSelected) {
            return; // do not allow clicking on the target card
        }
        if (cardSelected.state != MemoryMatch.CARDSTATE.DOWN) {
            return; // do not allow clicking a card that is not down
        }
        cardSelected.select();
        if (cardSelected.value == MemoryMatch.cardSelected.value) {
            MemoryMatch.cardsMatch(cardSelected, null);
            MemoryMatch.triggerSoundFx("soundCorrect", {delay: 0});
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
            MemoryMatch.AnimationHandler.addToAnimationQueue(cardSelected, 500, 0, false, null, MemoryMatch.onCardFlipBackWaitComplete);
            MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, 500, 0, false, null, MemoryMatch.onCardFlipBackWaitCompleteTargetCard);
        } else {
            MemoryMatch.cardsDoNotMatch();
            MemoryMatch.triggerSoundFx("soundMiss", {delay: 0});
            if (MemoryMatch.matchCount >= MemoryMatch.gameMatchCount) {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.LOSE;
            } else {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
            }
            // unselect this card then unflip it after a delay
            cardSelected.unselect();
            MemoryMatch.AnimationHandler.addToAnimationQueue(cardSelected, 1000, 0, false, null, MemoryMatch.onCardMissWaitComplete);
        }
    },

    onCardClickedSimon: function (cardClicked) {
        // state of the simon game when we wait for the user to tap in the sequence
        var globalCardPoint,
            thisGameData;

        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return; // we are not ready for clicks yet
        }
        cardClicked.unselect();
        cardClicked.specialSelect(1, false);
        MemoryMatch.playNote(cardClicked.cardNum + 1);
        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD) {
            if (cardClicked.value == MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[MemoryMatch.simonUserIndex]].value || MemoryMatch.cheatChallengeNoMiss) {
                MemoryMatch.lastMatchTime = Date.now();
                if (MemoryMatch.simonUserIndex >= MemoryMatch.simonPlaybackIndex) {
                    MemoryMatch.simonUserIndex = 0;
                    MemoryMatch.simonPlaybackIndex ++;
                    MemoryMatch.gameNumber ++;
                    MemoryMatch.GameGUI.updateLevelDisplay(MemoryMatch.gameLevel, MemoryMatch.gameNumber);
                    MemoryMatch.updateMatchCountDisplay();
                    MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.PLAY_WAIT;
                    MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[MemoryMatch.simonUserIndex]], 2000, 0, false, null, MemoryMatch.simonPlayback);
                    MemoryMatch.triggerSoundFx("soundCorrectLess", {delay: 200});
                    MemoryMatch.updateScoreForSimonGameAdvance();
                    globalCardPoint = MemoryMatch.boardContainer.localToGlobal(cardClicked.x, cardClicked.y);
                    MemoryMatch.matchEffectsStars(globalCardPoint.x, globalCardPoint.y, MemoryMatch.simonPlaybackIndex);
                    thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
                    if (MemoryMatch.simonPlaybackIndex >= thisGameData.games) { // user beat the challenge!
                        MemoryMatch.gameEndTime = Date.now();
                        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                        MemoryMatch.playerBeatChallenge = true;
                        MemoryMatch.removeAllCards(MemoryMatch.gameCompleteNextGameOrLevel);
                    }
                } else {
                    MemoryMatch.simonUserIndex ++;
                    MemoryMatch.updateScoreForSimon();
                }
            } else {
                MemoryMatch.missCount ++;
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.LOSE;
                MemoryMatch.gameEndTime = Date.now();
                MemoryMatch.triggerSoundFx("soundMiss", {delay: 800});
                MemoryMatch.triggerSoundFx("soundMiss", {delay: 1200});
                MemoryMatch.removeAllCards(MemoryMatch.gameCompleteNextGameOrLevel);
            }
        }
    },

    onCardClickedMonte: function (cardSelected) {
        var globalCardPoint,
            priorState = MemoryMatch.gamePlayState,
            cardAnimator,
            i,
            card;

        if (priorState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && priorState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return;
        }
        if (cardSelected.state != MemoryMatch.CARDSTATE.DOWN) {
            return; // do not allow clicking a card that is not down
        }
        cardSelected.select();
        if (cardSelected.value == MemoryMatch.cardTargetValue || MemoryMatch.cheatChallengeNoMiss) {
            MemoryMatch.cardsMatch(cardSelected, null);
            MemoryMatch.gamePlayState = priorState;
            MemoryMatch.gameEndTime = Date.now();
            MemoryMatch.triggerSoundFx("soundCorrect", {delay: 0});
            globalCardPoint = MemoryMatch.boardContainer.localToGlobal(cardSelected.x, cardSelected.y);
            MemoryMatch.matchEffectsStars(globalCardPoint.x, globalCardPoint.y, 1);
            MemoryMatch.GameGUI.updateMatchCountDisplay(MemoryMatch.gameNumber);
            MemoryMatch.removeAllCards(MemoryMatch.gameCompleteNextGameOrLevel); // user completed the game, but wait for cards to dissolve before advancing
            MemoryMatch.awardChallengeStreakMilestone();
        } else {
            MemoryMatch.cardsDoNotMatch();
            MemoryMatch.triggerSoundFx("soundMiss", {delay: 0});
            // unselect card then unflip after a delay
            MemoryMatch.AnimationHandler.addToAnimationQueue(cardSelected, 400, 0, false, null, MemoryMatch.onCardMissWaitComplete);
            if ( ! (MemoryMatch.moveCountDown > 0 || MemoryMatch.levelTolerance == 0)) { // game over? show target card
                for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                    card = MemoryMatch.allCardsOnBoard[i];
                    if (card.value == MemoryMatch.cardTargetValue && card.state == MemoryMatch.CARDSTATE.DOWN) {
                        MemoryMatch.AnimationHandler.addToAnimationQueue(card, 400, 0, false, null, card.select.bind(card));
                        break;
                    }
                }
            }
        }
    },

    onCardClickedEyeSpy: function (cardSelected) {
        var globalCardPoint,
            matchCardValue;

        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD) {
            return;
        }
        if (cardSelected.state != MemoryMatch.CARDSTATE.UP) {
            return; // do not allow clicking a card that is not up
        }
        matchCardValue = MemoryMatch.eyeSpyMatchCardValue;
        if (cardSelected.value == matchCardValue || MemoryMatch.cheatChallengeNoMiss) {
            MemoryMatch.cardsMatch(cardSelected, null);
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
            MemoryMatch.gameEndTime = Date.now();
            MemoryMatch.cardSelected.flip(); // Show user the card briefly before moving on
            MemoryMatch.triggerSoundFx("soundCorrect", {delay: 0});
            globalCardPoint = MemoryMatch.boardContainer.localToGlobal(cardSelected.x, cardSelected.y);
            MemoryMatch.matchEffectsStars(globalCardPoint.x, globalCardPoint.y, 1);
            MemoryMatch.GameGUI.updateMatchCountDisplay(MemoryMatch.gameNumber);
            MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, 1200, 0, false, null, MemoryMatch.onCardFlipCompleteEyeSpy);
            MemoryMatch.awardChallengeStreakMilestone();
        } else {
            MemoryMatch.cardsDoNotMatch();
            MemoryMatch.triggerSoundFx("soundMiss", {delay: 0});
            // unselect card then unflip after a delay
            MemoryMatch.AnimationHandler.addToAnimationQueue(cardSelected, 400, 0, false, null, MemoryMatch.onCardMissWaitComplete);
            if (MemoryMatch.moveCountDown == 0) {
                MemoryMatch.cardSelected.flip(); // Show user the card briefly before moving on
            }
        }
    },

    cardsMatch: function (firstCard, secondCard) {

        // perform variables & state updates when cards match.
        // Return true if an achievement was earned on this match.

        var matchTime = Date.now(),
            midpoint,
            totalMatchesEver,
            totalCombosEver,
            userDataObject,
            earnedAchievement = false;

        if (matchTime - MemoryMatch.lastMatchTime < 1600 && MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.PATTERN) {
            earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.FASTMATCH);
        }
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CARDS_MATCH;
        MemoryMatch.lastMatchTime = matchTime;
        MemoryMatch.matchCount ++;
        MemoryMatch.levelMatchCounter ++;
        MemoryMatch.consecutiveMatchCount ++;
        if ( ! MemoryMatch.isChallengeGame && MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.CHAINS && MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.HAYSTACK) {
            if (MemoryMatch.consecutiveMatchCount > 1) {
                MemoryMatch.numberOfCombos ++;
                if (MemoryMatch.consecutiveMatchCount == 4) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.TRIPLECOMBO) | earnedAchievement;
                } else if (MemoryMatch.consecutiveMatchCount == 5) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.QUADBO) | earnedAchievement;
                }
                if (MemoryMatch.numberOfCombos == 5) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.FIVECOMBOS) | earnedAchievement;
                }
                if (matchTime - MemoryMatch.lastMatchTime < 1600) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.FASTCOMBO) | earnedAchievement;
                }
            }
            MemoryMatch.GameGUI.updateComboMultiplier(MemoryMatch.consecutiveMatchCount);
        }
        // Making a match counts as a "Move" - or not?
//        if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.CONCENTRATION) {
//            if (MemoryMatch.moveCountDown > 0) {
//                MemoryMatch.moveCountDown --;
//            }
//        }
        MemoryMatch.testForCardMatchCounterHit(firstCard, secondCard);
        if ( ! MemoryMatch.isChallengeGame) {
            MemoryMatch.updateMatchCountDisplay();
        }
        MemoryMatch.updateScoreForMatch();

        // Each time a match is made determine if certain achievements based on card matching have been attained

        userDataObject = this.UserData.getUserDataObject();
        if (userDataObject != null && MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.PATTERN) {
            totalMatchesEver = (userDataObject['totalMatchCount'] | 0) + MemoryMatch.matchCount;
            totalCombosEver = (userDataObject['totalCombos'] | 0) + MemoryMatch.numberOfCombos;
            if (totalMatchesEver == 50) {
                earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.FIFTYMATCHES) | earnedAchievement;
            } else if (totalMatchesEver == 100) {
                earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.ONEHUNDREDMATCHES) | earnedAchievement;
            } else if (totalMatchesEver == 250) {
                earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.TWOFIFTYMATCHES) | earnedAchievement;
            }
            if (MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.CHAINS) {
                if (totalCombosEver == 25) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.TWENTYFIVECOMBOS) | earnedAchievement;
                } else if (totalCombosEver == 50) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.FIFTYCOMBOS) | earnedAchievement;
                }
            }
        }
        switch (MemoryMatch.gameType) {
            case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
            case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                if (MemoryMatch.gameMatchCount - MemoryMatch.matchCount > 0) { // not valid for the last match
                    if (firstCard.seenCount == 1 && secondCard.seenCount == 0) {
                        MemoryMatch.luckyGuessCount ++;
                        if ( ! MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.CLAIRVOYANT)) {
                            earnedAchievement = true;
                            midpoint = MemoryMatch.getMidpointBetween(MemoryMatch.boardContainer.localToGlobal(firstCard.x, firstCard.y), MemoryMatch.boardContainer.localToGlobal(secondCard.x, secondCard.y));
                            MemoryMatch.showInfoMessage({title: "Psychic!", points: 250, message: 'Match without revealing either card!', x: midpoint.x, y: midpoint.y, sound: 'soundAchievement'});
                        }
                    } else if (secondCard.seenCount == 0) {
                        MemoryMatch.luckyGuessCount ++;
                        if ( ! MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.LUCKYGUESS)) {
                            earnedAchievement = true;
                            midpoint = MemoryMatch.getMidpointBetween(MemoryMatch.boardContainer.localToGlobal(firstCard.x, firstCard.y), MemoryMatch.boardContainer.localToGlobal(secondCard.x, secondCard.y));
                            MemoryMatch.showInfoMessage({title: "Lucky guess!", points: 150, message: 'You never saw that 2nd card!', x: midpoint.x, y: midpoint.y, sound: 'soundAchievement'});
                        }
                    }
                }
                break;
            case MemoryMatch.GAMEPLAYTYPE.MONTE:
                if (MemoryMatch.gameNumber == 10) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.MONTE) | earnedAchievement;
                }
                break;
            case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                if (MemoryMatch.gameNumber > 14) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.EAGLEEYE) | earnedAchievement;
                }
                 break;
            case MemoryMatch.GAMEPLAYTYPE.PATTERN:
                if (MemoryMatch.matchCount >= MemoryMatch.gameMatchCount && MemoryMatch.gameNumber == 10) {
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.PICASSO) | earnedAchievement;
                }
                break;
            default:
                break;
        }
        return earnedAchievement;
    },

    cardsDoNotMatch: function () {
        // perform variables & state updates when cards do not match
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CARDS_NO_MATCH;
        if (MemoryMatch.moveCountDown > 0) {
            MemoryMatch.moveCountDown --;
        }
        MemoryMatch.missCount ++;
        MemoryMatch.consecutiveMatchCount = 0;
        MemoryMatch.GameGUI.updateComboMultiplier(0);
        if ( ! MemoryMatch.isChallengeGame) {
            MemoryMatch.updateMatchCountDisplay();
        }
    },

    updateMatchCountDisplay: function () {
        var newValue;

        if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.SIMON) {
            newValue = MemoryMatch.simonPlaybackIndex;
        } else if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.PATTERN || MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.MONTE || MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.EYESPY) {
            newValue = MemoryMatch.gameNumber - 1;
        } else {
            if (MemoryMatch.moveCountDown >= 0) {
                newValue = MemoryMatch.moveCountDown;
            } else {
                newValue = MemoryMatch.missCount;
            }
        }
        MemoryMatch.GameGUI.updateMatchCountDisplay(newValue);
    },

    awardChallengeStreakMilestone: function () {

        // Determine if the player has crossed the streak milestone. Note in this case the gameNumber has not yet been
        // incremented so we need to credit the player with one more as she just completed a board.

        var streakMilestoneValue = 5, // TODO: This number may be game dependent
            streakValue,
            awarded = false;

        if (MemoryMatch.isChallengeGame && MemoryMatch.gamePlayState != MemoryMatch.GAMESTATE.LOSE) {
            if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.SIMON) {
                streakValue = MemoryMatch.simonPlaybackIndex;
            } else if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.PATTERN || MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.MONTE || MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.EYESPY) {
                streakValue = MemoryMatch.gameNumber;
            }
            if (streakValue > 0 && streakValue % streakMilestoneValue == 0) {
                awarded = true;
                window.setTimeout(MemoryMatch.showChallengeStreakMilestone.bind(MemoryMatch), 1000);
            }
            if ( ! awarded && MemoryMatch.challengeAdvanceStreak == streakValue && MemoryMatch.challengeAdvanceStreak != streakMilestoneValue) {
                // player beat the challenge but it was not at a milestone
                awarded = true;
                window.setTimeout(MemoryMatch.showChallengeStreakMilestoneNoPoints.bind(MemoryMatch), 1000);
            }
        }
    },

    showChallengeStreakMilestone: function () {
        var bonusPoints = 500;
        MemoryMatch.triggerSoundFx("soundBonus");
        MemoryMatch.GameGUI.flashMatchCountDisplay(true, 6);
        MemoryMatch.updateScoreDisplay(bonusPoints);
        MemoryMatch.showScoreBalloon(bonusPoints, {
            x: MemoryMatch.stageWidth * 0.8,
            y: MemoryMatch.stageHeight * 0.94
        });
    },

    showChallengeStreakMilestoneNoPoints: function () {
        MemoryMatch.triggerSoundFx("soundBonus");
        MemoryMatch.GameGUI.flashMatchCountDisplay(true, 6);
    },

    matchEffects: function (x, y, level) {
        var selectAnEffect = Math.random() * 3;
        if (selectAnEffect <= 1) {
            MemoryMatch.matchEffectsBurst(x, y);
            if (level % 6 == 0) {
                MemoryMatch.matchEffectsSplatter(x, y);
            }
        } else if (selectAnEffect <= 2) {
            MemoryMatch.matchEffectsSplatter(x, y);
            if (level % 6 == 0) {
                MemoryMatch.matchEffectsBurst(x, y);
            }
        } else {
            MemoryMatch.matchEffectsSparkler(x, y);
            if (level % 6 == 0) {
                MemoryMatch.matchEffectsSplatter(x, y);
            }
        }
    },

    matchEffectsBurst: function (x, y) {
        MemoryMatch.AnimationHandler.startBurstParticles(Math.random() * 100 + 80, x, y);
    },

    matchEffectsSplatter: function (x, y) {
        MemoryMatch.AnimationHandler.startSplatterParticles(Math.random() * 100 + 80, x, y);
    },

    matchEffectsSparkler: function (x, y) {
        MemoryMatch.AnimationHandler.startSparklerParticles(Math.random() * 100 + 80, x, y);
    },

    matchEffectsStars: function (x, y, level) {
        MemoryMatch.AnimationHandler.startSplatterStars(Math.random() * 40 + 40, x, y);
    },

    onCardRemoveComplete: function (card) {
        card.state = MemoryMatch.CARDSTATE.REMOVED;
    },

    onCardRemoveCompleteLastCard: function (card) {
        card.state = MemoryMatch.CARDSTATE.REMOVED;
        if ((MemoryMatch.matchCount >= MemoryMatch.gameMatchCount)) {
            if (MemoryMatch.testIfAnyCardIsState(MemoryMatch.CARDSTATE.UP)) { // make sure no other cards will also report the game has ended, if so wait for them to complete flipping
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
            } else {
                MemoryMatch.gameComplete(MemoryMatch.GAMEPLAYSTATE.WIN); // user completed the game
            }
        } else {
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
        }
    },

    onCardRemoveCompleteAndDelete: function (card) {
        MemoryMatch.removeCardFromBoard(card);
    },

    onCardMissWaitComplete: function (card) {
        card.flipBack();
        if (MemoryMatch.moveCountDown > 0 || MemoryMatch.levelTolerance == 0) {
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
        } else {
            MemoryMatch.gameComplete(MemoryMatch.GAMEPLAYSTATE.LOSE); // user lost game due to too many misses
        }
    },

    onCardMissWaitCompleteChains: function (card) {
        MemoryMatch.removeAllMatchedCards(null);
        MemoryMatch.onCardMissWaitComplete(card);
    },

    onCardFlipCompleteEyeSpy: function (card) {
        card.state = MemoryMatch.CARDSTATE.UP;
        card.flipBack();
        MemoryMatch.removeAllCards(MemoryMatch.gameCompleteNextGameOrLevel); // user completed the game, but wait for cards to dissolve before advancing
    },

    onCardFlipBackWaitComplete: function (card) {
        var gameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);

        card.flipBack();
        if (MemoryMatch.moveCountDown > 0 || MemoryMatch.levelTolerance == 0) {
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_SECOND_CARD;
            if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.HAYSTACK && gameData.removeMatches == 1) {
                card.removeCard(MemoryMatch.onCardRemoveComplete);
            }
        } else {
            MemoryMatch.gameComplete(MemoryMatch.GAMEPLAYSTATE.LOSE); // user lost game
        }
    },

    onCardFlipBackWaitCompleteTargetCard: function (card) {
        card.flipBack();
        if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.HAYSTACK) {
            if (MemoryMatch.matchCount >= MemoryMatch.gameMatchCount) {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                MemoryMatch.gameEndTime = Date.now();
                MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, 500, 0, false, null, MemoryMatch.onHaystackBoardComplete); // user completed the game, but wait for cards to dissolve before advancing
            } else {
                MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.cardSelected, 500, 0, false, null, MemoryMatch.onHaystackNextTargetCard);
            }
        }
    },

    onShowCardsWaitComplete: function (card) {
        if (MemoryMatch.gamePaused || MemoryMatch.gameState != MemoryMatch.GAMESTATE.PLAY) {
            return;
        }
        // if any cards are still flipping we need to defer this
        if (MemoryMatch.testIfAnyCardIsState(MemoryMatch.CARDSTATE.FLIPPING)) {
            MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], 250, 0, false, null, MemoryMatch.onShowCardsWaitComplete);
        } else {
            MemoryMatch.showAllPatternCards(false);
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
            MemoryMatch.GameGUI.hideTimerCountdown();
        }
    },

    onShowAllCardsWaitComplete: function (card) {
        // Some games begin by showing the user some cards. After a timer expires
        // we need to turn the cards over and begin the game.
        var hideTimerCountDown = true;

        if (MemoryMatch.gamePaused || MemoryMatch.gameState != MemoryMatch.GAMESTATE.PLAY || MemoryMatch.allCardsOnBoard == null || MemoryMatch.allCardsOnBoard.length == 0) {
            return;
        }
        switch (MemoryMatch.gameType) {
            case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                // show the target card
                MemoryMatch.showAllCards(false);
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                MemoryMatch.cardSelected.flip();
                MemoryMatch.gameStartTime = Date.now();
                MemoryMatch.gameEndTime = 0;
                break;
            case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                MemoryMatch.showAllCards(false);
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                MemoryMatch.gameStartTime = Date.now();
                MemoryMatch.gameEndTime = 0;
                break;
            case MemoryMatch.GAMEPLAYTYPE.SIMON:
                // start the call/response play cycle
                MemoryMatch.simonPlayback();
                break;
            case MemoryMatch.GAMEPLAYTYPE.MONTE:
                // show the target card just a little longer...
                MemoryMatch.showAllCards(false);
                MemoryMatch.monteShuffle();
                hideTimerCountDown = false;
                break;
            case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                // Let user pick a card...
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                break;
            default:
                break;
        }
        if (hideTimerCountDown) {
            MemoryMatch.GameGUI.hideTimerCountdown();
        }
    },

    onShowAllCardsMonteWaitComplete: function (card) {
        // the first phase of Monte shows all the cards. Then all the invalid cards flip over leaving
        // the good card showing for just a bit longer. Then the good card flips over and then
        // we start the shuffle animation.
        var i;

        if (MemoryMatch.gamePaused || MemoryMatch.gameState != MemoryMatch.GAMESTATE.PLAY) {
            return;
        }
        if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.MONTE) { // show the target card just a little longer
            // flip all cards except the target card
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (card.state == MemoryMatch.CARDSTATE.UP && card.value == 2) {
                    card.unselect();
                    card.flipBack();
                } else if (card.state == MemoryMatch.CARDSTATE.UP && card.value == 1) {
                    card.highlight();
                }
            }
            MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], MemoryMatch.cardShowTime, 0, false, null, MemoryMatch.onShowAllCardsWaitComplete);
        }
    },

    onShowTargetCardWaitComplete: function (card) {
        if (MemoryMatch.gamePaused || MemoryMatch.gameState != MemoryMatch.GAMESTATE.PLAY) {
            return;
        }
        card.unselect();
        card.state = MemoryMatch.CARDSTATE.UP;
        card.flipBack();
        MemoryMatch.showAllCards(true);
        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
        MemoryMatch.GameGUI.hideTimerCountdown();
    },

    showAllPatternCards: function (showFlag) {
        // flip all pattern cards for a glimpse at the pattern
        var i,
            card;

        for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
            card = MemoryMatch.allCardsOnBoard[i];
            if (showFlag && card.value == MemoryMatch.cardTargetValue && card.state == MemoryMatch.CARDSTATE.DOWN) {
                card.select();
            } else if ( ! showFlag && card.value == MemoryMatch.cardTargetValue && card.state == MemoryMatch.CARDSTATE.UP){
                card.unselect();
                card.flipBack();
            }
        }
    },

    showAllCards: function (showFlag) {
        // flip all cards for the player to remember
        var i,
            card;

        if (MemoryMatch.allCardsOnBoard != null) {
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (showFlag && card.state == MemoryMatch.CARDSTATE.DOWN) {
                    card.flip();
                } else if ( ! showFlag && card.state == MemoryMatch.CARDSTATE.UP){
                    card.unselect();
                    card.flipBack();
                }
            }
        }
    },

    turnBackAllCards: function () {
        // flip all cards so they are all face down
        var i,
            card;

        if (MemoryMatch.allCardsOnBoard != null && MemoryMatch.allCardsOnBoard.length > 0) {
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (card.state == MemoryMatch.CARDSTATE.UP) {
                    if (MemoryMatch.gameType != MemoryMatch.GAMEPLAYTYPE.HAYSTACK) {
                        card.restoreFlag = true;
                    }
                    card.flipBack();
                } else if (card.state == MemoryMatch.CARDSTATE.FLIPPING) {
                    card.restoreFlag = false;
                    card.forceDown();
                    MemoryMatch.AnimationHandler.removeActor(card);
                } else {
                    card.restoreFlag = false;
                }
            }
        }
    },

    restoreAllCards: function () {
        // flip any card that should be restored
        var i,
            card;

        if (MemoryMatch.allCardsOnBoard != null && MemoryMatch.allCardsOnBoard.length > 0) {
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (card.state == MemoryMatch.CARDSTATE.DOWN && card.restoreFlag) {
                    card.restoreFlag = false;
                    card.flip();
                } else if (card.state == MemoryMatch.CARDSTATE.FLIPPING) {
                    card.forceDown();
                }
            }
        }
    },

    testIfAnyCardIsState: function (cardStateToCheck) {

        // see if any card on the board is in the requested state

        var i,
            atLeastOneCardMatchesState = false,
            card;

        if (MemoryMatch.allCardsOnBoard != null && MemoryMatch.allCardsOnBoard.length > 0) {
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (card.state == cardStateToCheck) {
                    atLeastOneCardMatchesState = true;
                    break;
                }
            }
        }
        return atLeastOneCardMatchesState;
    },

    removeAllCards: function (callMeWhenComplete) {
        var i,
            card;

        if (MemoryMatch.allCardsOnBoard != null && MemoryMatch.allCardsOnBoard.length > 0) {
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (card.state != MemoryMatch.CARDSTATE.REMOVED) {
                    if (callMeWhenComplete != null) {
                        card.removeCard(callMeWhenComplete);
                        callMeWhenComplete = null; // make sure we only call this once, callMeWhenComplete is responsible for deleting card from stage
                    } else {
                        card.removeCard(MemoryMatch.onCardRemoveCompleteAndDelete);
                    }
                } else {
                    MemoryMatch.removeCardFromBoard(card);
                }
            }
            MemoryMatch.allCardsOnBoard = null;
        }
        if (MemoryMatch.cardSelected != null && MemoryMatch.cardSelected.state != MemoryMatch.CARDSTATE.REMOVED) {
            if (callMeWhenComplete != null) {
                MemoryMatch.cardSelected.removeCard(callMeWhenComplete);
                callMeWhenComplete = null; // make sure we only call this once, callMeWhenComplete is responsible for deleting card from stage
            } else {
                MemoryMatch.cardSelected.removeCard(MemoryMatch.onCardRemoveCompleteAndDelete);
            }
            MemoryMatch.cardSelected = null;
        }
        if (callMeWhenComplete != null) { // make sure callMeWhenComplete is called even if no cards are to be removed
            callMeWhenComplete();
        }
    },

    removeAllMatchedCards: function (callMeWhenComplete) {
        var i,
            j,
            card,
            matchedCard,
            cardsToRemove;

        if (MemoryMatch.allCardsOnBoard != null && MemoryMatch.allCardsOnBoard.length > 0) {
            cardsToRemove = [];
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                if (card.state == MemoryMatch.CARDSTATE.UP) {
                    for (j = 0; j < MemoryMatch.allCardsOnBoard.length; j ++) {
                        matchedCard = MemoryMatch.allCardsOnBoard[j];
                        if (matchedCard.state == MemoryMatch.CARDSTATE.UP && matchedCard != card && matchedCard.value == card.value) {
                            cardsToRemove.push(i);
                            cardsToRemove.push(j);
                            card.removeCard(MemoryMatch.onCardRemoveCompleteAndDelete);
                            matchedCard.removeCard(MemoryMatch.onCardRemoveCompleteAndDelete);
                        }
                    }
                }
            }
            if (cardsToRemove.length > 0) {
                cardsToRemove.sort(function(a, b) {return a-b});
                for (i = cardsToRemove.length - 1; i >= 0; i --) {
                    MemoryMatch.allCardsOnBoard.splice(cardsToRemove[i], 1);
                }
            }
        }
        if (callMeWhenComplete != null) {
            callMeWhenComplete();
        }
    },

    clearBoard: function () {
        var i;

        if (MemoryMatch.boardContainer != null && MemoryMatch.boardContainer.getNumChildren() > 0) {
            for (i = MemoryMatch.boardContainer.getNumChildren(); i >= 0; i --) {
                MemoryMatch.boardContainer.removeChildAt(i);
            }
        }
    },

    logBoardState: function (whoCalledMe) {
        // This debug function will show the status of cards in the allCardsOnBoard array
        // and what cards are on the stage, in case the two get out of sync.
        var i,
            aCardIsActive,
            card;

        if (MemoryMatch.allCardsOnBoard != null && MemoryMatch.allCardsOnBoard.length > 0) {
            for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
                card = MemoryMatch.allCardsOnBoard[i];
                MemoryMatch.debugLog(whoCalledMe + ": allCardsOnBoard card info " + card.toString());
            }
        } else {
            MemoryMatch.debugLog(whoCalledMe + ": board is EMPTY");
        }
        // loop through all children on the stage and find any active cards
        aCardIsActive = false;
        for (i = 0; i < MemoryMatch.boardContainer.getNumChildren(); i ++) {
            card = MemoryMatch.boardContainer.getChildAt(i);
            if (card.state != null) {
                MemoryMatch.debugLog(whoCalledMe + ": boardContainer card info " + card.toString());
                aCardIsActive = true;
            }
        }
        if ( ! aCardIsActive) {
            MemoryMatch.debugLog(whoCalledMe + ": no cards are on the stage");
        }
    },

    onHaystackBoardComplete: function () {
        MemoryMatch.removeAllCards(MemoryMatch.gameCompleteRemoveCardThenAdvance);
    },

    onHaystackNextTargetCard: function () {
        var cardIndex = MemoryMatch.simonBag[MemoryMatch.matchCount],
            card = MemoryMatch.allCardsOnBoard[cardIndex],
            cardValue = card.value;
        MemoryMatch.cardSelected.setValue(cardValue);
        MemoryMatch.cardSelected.flip();
    },

    simonPlayback: function () {
        // state of the simon game when we playback the sequence
        var card;

        if (MemoryMatch.gamePaused || MemoryMatch.simonBag == null) {
            return;
        }
        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.PLAY_WAIT) {
            // first time in set everything up for the playback to start
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.PLAY_WAIT;
            MemoryMatch.simonUserIndex = 0;
            MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[MemoryMatch.simonUserIndex]], 500, 0, false, null, MemoryMatch.simonPlayback);
        } else {
            // Play each note until we reach the current index
            if (MemoryMatch.simonUserIndex <= MemoryMatch.simonPlaybackIndex) {
                if (MemoryMatch.simonUserIndex > 0) {
                    MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[MemoryMatch.simonUserIndex - 1]].unselect();
                }
                card = MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[MemoryMatch.simonUserIndex]];
                card.specialSelect(1, true);
                MemoryMatch.AnimationHandler.addToAnimationQueue(card, 500, 0, false, null, MemoryMatch.simonPlayback);
                MemoryMatch.playNote(card.cardNum + 1);
                MemoryMatch.simonUserIndex ++;
                if (MemoryMatch.gameStartTime == 0) {
                    MemoryMatch.gameStartTime = Date.now();
                    MemoryMatch.gameEndTime = 0;
                }
            } else {
                card = MemoryMatch.allCardsOnBoard[MemoryMatch.simonBag[MemoryMatch.simonUserIndex - 1]];
                card.unselect();
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                MemoryMatch.simonUserIndex = 0;
            }
        }
    },

    monteShuffle: function () {
        // Animation to shuffle the Monte cards.
        var i,
            firstCardIndex,
            secondCardIndex,
            thisGameData,
            firstCard,
            secondCard,
            halfTheDistance,
            yOffset,
            controlPoint,
            cardAnimator,
            numberOfPoints,
            animationDuration;

        if (MemoryMatch.gamePaused || MemoryMatch.allCardsOnBoard == null || MemoryMatch.allCardsOnBoard.length == 0) {
            return;
        }
        if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.PLAY_WAIT) {
            // first time in set everything up for the shuffle (game state should be BOARD_SETUP)
            // 1. build the animation sequence

            thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
            MemoryMatch.monteMoves = [];
            MemoryMatch.monteIndex = 0;
            // force target card as first shuffle
            firstCardIndex = Math.floor(MemoryMatch.allCardsOnBoard.length * 0.5);
            secondCardIndex = MemoryMatch.getRandomNumberBetweenButNot(0, MemoryMatch.allCardsOnBoard.length - 1, firstCardIndex);
            MemoryMatch.monteMoves.push([firstCardIndex, secondCardIndex]);
            for (i = 0; i < MemoryMatch.monteNumberOfMoves - 1; i ++) {
                firstCardIndex = MemoryMatch.getRandomNumberBetween(0, MemoryMatch.allCardsOnBoard.length - 1);
                secondCardIndex = MemoryMatch.getRandomNumberBetweenButNot(0, MemoryMatch.allCardsOnBoard.length - 1, firstCardIndex);
                MemoryMatch.monteMoves.push([firstCardIndex, secondCardIndex]);
            }
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.PLAY_WAIT;
            MemoryMatch.AnimationHandler.addToAnimationQueue(MemoryMatch.allCardsOnBoard[0], 500, 0, false, null, MemoryMatch.monteShuffle);
            MemoryMatch.GameGUI.hideTimerCountdown();
        } else {
            // Shuffle pairs of cards until we play out all the moves. Select 2 cards to shuffle. Move the first
            // card to the second, and the second card to the first.
            if (MemoryMatch.monteIndex < MemoryMatch.monteMoves.length) {
                firstCardIndex = MemoryMatch.monteMoves[MemoryMatch.monteIndex][0];
                secondCardIndex = MemoryMatch.monteMoves[MemoryMatch.monteIndex][1];
                firstCard = MemoryMatch.allCardsOnBoard[firstCardIndex];
                secondCard = MemoryMatch.allCardsOnBoard[secondCardIndex];
                animationDuration = 0.25;
                numberOfPoints = Math.ceil(animationDuration * MemoryMatch.fps);

                // move first card to second, and second to first
                halfTheDistance = (secondCard.x - firstCard.x) * 0.5;
                if (halfTheDistance < 0) {
                    yOffset = secondCard.y - 60;
                } else {
                    yOffset = secondCard.y + 60;
                }
                controlPoint = {x: firstCard.x + halfTheDistance, y: yOffset};

                cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(firstCard, 0, 0, false, null, null);
                cardAnimator.currentPointIndex = 0;
                cardAnimator.arrayOfPoints = MemoryMatch.makeBezierPointArray(firstCard, controlPoint, secondCard, numberOfPoints);
                cardAnimator.continueChain = false;
                cardAnimator.tickFunction = MemoryMatch.moveSpriteOnPath;

                cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(secondCard, 0, 0, false, null, null);
                cardAnimator.currentPointIndex = 0;
                cardAnimator.arrayOfPoints = MemoryMatch.makeBezierPointArray(secondCard, controlPoint, firstCard, numberOfPoints);
                cardAnimator.continueChain = true;
                cardAnimator.tickFunction = MemoryMatch.moveSpriteOnPath;
            } else { // we played all the shuffles, clean up and let the user find the card
                MemoryMatch.monteMoves = null;
                MemoryMatch.monteIndex = 0;
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.CHOOSE_FIRST_CARD;
                MemoryMatch.gameStartTime = Date.now();
                MemoryMatch.gameEndTime = 0;
                MemoryMatch.playShuffleMusic(false);
            }
        }
    },

    moveSpriteOnPath: function (cardAnimator) {
        var keepAnimating = true,
            card = cardAnimator.actor;

        if (card != null && cardAnimator.arrayOfPoints != null && cardAnimator.arrayOfPoints.length > 0 && cardAnimator.currentPointIndex < cardAnimator.arrayOfPoints.length) {
            card.x = cardAnimator.arrayOfPoints[cardAnimator.currentPointIndex].x;
            card.y = cardAnimator.arrayOfPoints[cardAnimator.currentPointIndex].y;
            cardAnimator.currentPointIndex ++;
            if (cardAnimator.currentPointIndex >= cardAnimator.arrayOfPoints.length) {
                keepAnimating = false;
                cardAnimator.arrayOfPoints = null;
                cardAnimator.currentPointIndex = 0;
                if (cardAnimator.continueChain) {
                    MemoryMatch.monteIndex ++;
                    MemoryMatch.AnimationHandler.addToAnimationQueue(card, 100, 0, false, null, MemoryMatch.monteShuffle);
                }
            }
        } else {
            keepAnimating = false;
        }
        MemoryMatch.stageUpdated = true;
        return keepAnimating;
    },

    makeLevelImageAssetName: function (levelNumber, imageNumber) {
        // generate the asset reference for image files for a given level. Assumes the images
        // were defined in the setup data using the same technique.

        return "image-l" + levelNumber + "-i" + imageNumber;
    },

    makeLevelCardDeckAssetName: function (levelNumber, imageNumber) {
        // generate the asset reference for card deck spritesheet for a given level. Assumes the images
        // were defined in the setup data using the same technique.

        return "cards-l" + levelNumber + "-i" + imageNumber;
    },

    gameCompleteTallyFinalScore: function () {
        var playerScore = MemoryMatch.gameScore,
            timeBonus = MemoryMatch.calculateTimeBonus(),
            movesRemainingBonus = MemoryMatch.calculateUnusedMovesBonus(),
            comboBonus = MemoryMatch.calculateComboBonus(),
            achievementBonus = MemoryMatch.calculateAchievementBonus(),
            totalBonusScore = timeBonus + movesRemainingBonus + comboBonus + achievementBonus;

        playerScore += totalBonusScore;
        MemoryMatch.totalScore += totalBonusScore;
        MemoryMatch.GameGUI.updateScoreDisplay(MemoryMatch.totalScore);
        return playerScore;
    },

    gameCompleteNextGameOrLevel: function () {
        var canUserAdvance = false,
            showLevelResults = true,
            finalScore,
            earnedAchievement = false,
            updateUserStats = false,
            gameNumber,
            thisGameData;

        if (MemoryMatch.isChallengeGame) {
            canUserAdvance = true;
        } else {
            canUserAdvance = MemoryMatch.canUserAdvance();
            updateUserStats = true;
        }
        if (canUserAdvance) {
            gameNumber = MemoryMatch.gameNumber;
            if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.LOSE) {
                // user finished a game but was in the lose state, in this case force a Results screen to appear. Clicking Next on that will determine what to do next.
                if (MemoryMatch.isChallengeGame) {
                    updateUserStats = true;
                }
                MemoryMatch.levelCleanUp();
            } else if (MemoryMatch.gameData != null) {
                if ( ! MemoryMatch.isChallengeGame && gameNumber >= MemoryMatch.numberOfGamesInLevel) {
                    // User beat the level, show a level results screen
                    MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                    MemoryMatch.levelCleanUp();
                } else if (MemoryMatch.isChallengeGame) {
                    thisGameData = MemoryMatch.getGameData(MemoryMatch.isChallengeGame);
                    if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.SIMON) {
                        gameNumber = MemoryMatch.simonPlaybackIndex;
                    }
                    if (gameNumber >= thisGameData.games) { // user beat the challenge!
                        MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                        MemoryMatch.playerBeatChallenge = true;
                        MemoryMatch.levelCleanUp();
                        updateUserStats = true;
                        showLevelResults = true;
                    } else {
                        showLevelResults = false;
                        MemoryMatch.gameNumber ++;
                        MemoryMatch.startNextGame();
                    }
                }
            }
        } else {
            // User did not beat this game and cannot unlock the next game (unless they already had unlocked it)
            if (MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.WIN && MemoryMatch.gamePlayState != MemoryMatch.GAMEPLAYSTATE.LOSE) {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.LOSE;
            }
            MemoryMatch.levelCleanUp();
        }
        if (updateUserStats) {
            earnedAchievement = MemoryMatch.gameCompleteUpdateUserStats();
            finalScore = MemoryMatch.gameCompleteTallyFinalScore();
        } else {
            finalScore = MemoryMatch.gameScore;
        }
        if (showLevelResults) {
            MemoryMatch.levelResults();
        }
        MemoryMatch.gameScore = finalScore; // update game score with bonus earned, but after we showed level results (because we do it there too)
        return earnedAchievement;
    },

    gameCompleteUpdateUserStats: function () {
        var earnedAchievement = false,
            starsEarned,
            finalScore,
            gameNumber,
            longestStreak,
            gameTime;

        if (MemoryMatch.isChallengeGame) {
            gameNumber = 99;
            longestStreak = MemoryMatch.gameNumber - 1;
        } else {
            gameNumber = MemoryMatch.gameNumber;
            longestStreak = 0;
        }
        gameTime = MemoryMatch.gameEndTime - MemoryMatch.gameStartTime;
        finalScore = MemoryMatch.gameCompleteTallyFinalScore();
        starsEarned = MemoryMatch.getGameStarsEarned();
        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            if (gameTime <= 5999 && ! MemoryMatch.isChallengeGame) { // finished game in 5 seconds or less
                earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.QUICKDRAW) | earnedAchievement;
            }
            if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.CHAINS) {
                if (MemoryMatch.missCount == 0) {
                    MemoryMatch.chainsStreakCount ++;
                    if (MemoryMatch.gameNumber >= MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].gameCount) { // is this the last chains game?
                        earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.CHAINTASTIC) | earnedAchievement;
                    }
                } else {
                    MemoryMatch.chainsStreakCount = 0;
                }
                if (MemoryMatch.chainsStreakCount > 2) { // three chains in a row without a miss?
                    earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.CHAINGANG) | earnedAchievement;
                }
            }
        }
        MemoryMatch.updateUserDataStatsForCompletedGamePlay(finalScore, MemoryMatch.matchCount, MemoryMatch.numberOfCombos, gameTime, MemoryMatch.luckyGuessCount);
        MemoryMatch.setGameUserData(MemoryMatch.gameLevel, gameNumber, finalScore, starsEarned, MemoryMatch.gameEndTime, longestStreak);
        if (starsEarned == 3 && MemoryMatch.userEarnedAllStars()) {
            earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.THREESTAR) | earnedAchievement;
        }
        if (MemoryMatch.isChallengeGame) {
            if (MemoryMatch.challengePassed()) {
                MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.WIN;
                if ( ! MemoryMatch.userBeatAllChallenges) {
                    MemoryMatch.userBeatAllChallenges = MemoryMatch.didUserBeatAllChallenges();
                    if (MemoryMatch.userBeatAllChallenges) {
                        MemoryMatch.userBeatAllChallengesFirstTime = true;
                        earnedAchievement = MemoryMatch.achievementEarned(MemoryMatch.ACHIEVEMENT.ACONTENDER) | earnedAchievement;
                    }
                }
            }
        }
        return earnedAchievement;
    },

    gameComplete: function (winOrLose) {
        if (MemoryMatch.gameEndTime == 0) {
            MemoryMatch.gameEndTime = Date.now();
        }
        MemoryMatch.gamePlayState = winOrLose;
        if (MemoryMatch.moveCountDown <= 0 && MemoryMatch.levelTolerance > 0) {
            // Player lost the game due to running out of moves, wait for the cards to dissolve before moving on
            MemoryMatch.removeAllCards(MemoryMatch.gameCompleteRemoveCardThenAdvance);
        } else {
            MemoryMatch.removeAllCards(null);
            MemoryMatch.gameCompleteNextGameOrLevel();
        }
    },

    gameCompleteRemoveCardThenAdvance: function (card) {
        if (MemoryMatch.gameEndTime == 0) {
            MemoryMatch.gameEndTime = Date.now();
        }
        MemoryMatch.removeCardFromBoard(card);
        MemoryMatch.gameCompleteNextGameOrLevel();
    },

    restartGameRemoveCardThenRestart: function (card) {
        MemoryMatch.removeCardFromBoard(card);
        window.setTimeout(MemoryMatch.replayLastGame.bind(MemoryMatch), 600); // need a delay to wait for the card fade-out animation to complete
    },

    restartChallengeGameRemoveCardThenReplay: function (card) {
        MemoryMatch.removeCardFromBoard(card);
        window.setTimeout(MemoryMatch.replayCurrentChallengeGame.bind(MemoryMatch), 600); // need a delay to wait for the card fade-out animation to complete
    },

    gameOver: function () {
        // point where the game is officially ended
        MemoryMatch.lastPlayedDate = Date.now();
        MemoryMatch.updateUserDataObject(null);
    },

    removeCardFromBoard: function (card) {
        if (card != null) {
            card.state = MemoryMatch.CARDSTATE.REMOVED;
            if (card == MemoryMatch.cardSelected) {
                MemoryMatch.cardSelected = null;
            }
            MemoryMatch.boardContainer.removeChild(card);
        }
    },

    updateAllActiveMatchCounters: function () {
        var i,
            card;

        for (i = 0; i < MemoryMatch.allCardsOnBoard.length; i ++) {
            card = MemoryMatch.allCardsOnBoard[i];
            if (card.matchCounter > 0) {
                card.updateMatchCounter();
            }
        }
    },

    testForCardMatchCounterHit: function (firstCard, secondCard) {
        var score = 0,
            card;

        if (firstCard != null && secondCard != null && (firstCard.matchCounter > 0 || secondCard.matchCounter > 0)) {
            if (firstCard.matchCounter > 0) {
                card = firstCard;
            } else {
                card = secondCard;
            }
            score = (firstCard.matchCounter | secondCard.matchCounter) * 100;
            MemoryMatch.updateScoreDisplay(score);
            MemoryMatch.showScoreBalloonOnCard(score, card);
            MemoryMatch.triggerSoundFx("soundAchievement", {delay: 100});
        }
        return score > 0;
    },

    showScoreBalloonOnCard: function (score, card) {
        var cardPoint = MemoryMatch.boardContainer.localToGlobal(card.x, card.y);
        return MemoryMatch.showScoreBalloon(score, cardPoint);
    },

    showScoreBalloon: function (score, cardPoint) {
        var animator,
            bounds,
            animationTime = 3,
            comboBonusText = new createjs.Text("+ " + score.toString(), MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColorAchievement);

        comboBonusText.textAlign = "center";
        bounds = comboBonusText.getBounds();
        comboBonusText.maxWidth = bounds.width;;
        comboBonusText.visible = true;
        comboBonusText.setTransform(cardPoint.x, cardPoint.y);
        if ( ! MemoryMatch.isTouchDevice) {
            comboBonusText.shadow = new createjs.Shadow("#000000", 2, 2, 10);
        }
        MemoryMatch.stage.addChild(comboBonusText);
        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(comboBonusText, 250, 0, true, null, null);
        animator.showAtBegin = true;
        animator.vAlpha = -1 / (animationTime * MemoryMatch.fps); // reduce alpha to 0 over time
        animator.endAlpha = 0;
        animator.killOnAlphaZero = true;
        animator.vY = -1 * (72 / MemoryMatch.fps) // move up 72px/s until alpha reaches 0
        animator.endXScale = animator.endYScale = 1.25;
        animator.vXScale = animator.vYScale = 0.5 / (animationTime * MemoryMatch.fps);
        return true;
    },

    showMessageBalloon: function (iconId, message, points, x, y) {
        var animator,
            bounds,
            startX,
            startY,
            width,
            height,
            animationTime = 3,
            groupDisplayObject = new createjs.Container(),
            iconSprite,
            iconSize,
            iconScale = 0.25,
            spriteData,
            messageText,
            pointsText;

        if (iconId != null && iconId.length > 0) {
            spriteData = new createjs.SpriteSheet(MemoryMatch.GameSetup.guiSpritesheet1Frames);
            iconSize = MemoryMatch.getSpriteFrameSize(MemoryMatch.GameSetup.guiSpritesheet1Frames, iconId);
            width = (iconSize.width * iconScale) + (16 * MemoryMatch.stageScaleFactor);
            height = iconSize.height * iconScale;
            iconSprite = new createjs.Sprite(spriteData, iconId);
            iconSprite.setTransform(0, height * 0.5, iconScale, iconScale, 0, 0, 0, 0, iconSize.height * 0.5);
            iconSprite.framerate = 1;
            iconSprite.name = "icon";
            groupDisplayObject.addChild(iconSprite);
        } else {
            width = 0;
            height = 0;
        }
        startX = 0;
        messageText = new createjs.Text(message, MemoryMatch.getScaledFontSize(64) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColorAchievement);
        messageText.textAlign = "left";
        if (height > 0) {
            messageText.textBaseline = "middle";
        }
        messageText.x = width;
        messageText.y = height * 0.5;
        bounds = messageText.getBounds();
        width += bounds.width;
        if (bounds.height > height) {
            height = bounds.height;
        }
        if (bounds.y < 0) {
            startY = bounds.y;
        } else {
            startY = 0;
        }
        messageText.maxWidth = bounds.width;
        messageText.visible = true;
        if ( ! MemoryMatch.isTouchDevice) {
            messageText.shadow = new createjs.Shadow("#000000", 2, 2, 10);
        }
        groupDisplayObject.addChild(messageText);
        if (points != null && points.length > 0) {
            pointsText = new createjs.Text(points, MemoryMatch.getScaledFontSize(72) + " " + MemoryMatch.GameSetup.guiBoldFontName, MemoryMatch.GameSetup.guiFontColorAchievement);
            pointsText.textAlign = "left";
            pointsText.x = (20 * MemoryMatch.stageScaleFactor) + width;
            bounds = pointsText.getBounds();
            width += (22 * MemoryMatch.stageScaleFactor) + bounds.width;
            if (bounds.height > height) {
                height = bounds.height;
            }
            pointsText.visible = true;
            if ( ! MemoryMatch.isTouchDevice) {
                pointsText.shadow = messageText.shadow;
            }
            groupDisplayObject.addChild(pointsText);
        }
        width += (12 * MemoryMatch.stageScaleFactor); // need to account for shadows
        height += (12 * MemoryMatch.stageScaleFactor);
        MemoryMatch.stage.addChild(groupDisplayObject);
        groupDisplayObject.setTransform(x, y, 1, 1, 0, 0, 0, width * 0.5, 0);
        groupDisplayObject.cache(startX, startY, width, height);
        animator = MemoryMatch.AnimationHandler.addToAnimationQueue(groupDisplayObject, 250, 0, true, null, null);
        animator.showAtBegin = true;
        animator.vAlpha = -1 / (animationTime * MemoryMatch.fps); // reduce alpha to 0 over time
        animator.endAlpha = 0;
        animator.killOnAlphaZero = true;
        animator.vY = -1 * (72 / MemoryMatch.fps) // move up 72px/s until alpha reaches 0
        animator.endXScale = animator.endYScale = 1.25;
        animator.vXScale = animator.vYScale = 0.5 / (animationTime * MemoryMatch.fps);
    },

    changeGameState: function (newState) {
        MemoryMatch.gamePriorState = MemoryMatch.gameState;
        MemoryMatch.gameState = newState;
        MemoryMatch.gameStateStartTime = Date.now();
    },

    returnToPriorGameState: function () {
        MemoryMatch.changeGameState(MemoryMatch.gamePriorState);
    },

    getNextGameNumber: function () {
        // determine what the next game number will be, and if at the end then return the challenge game id
        var currentGameNumber = MemoryMatch.gameNumber,
            nextGameNumber,
            levelData;

        if (MemoryMatch.isChallengeGame) {
            nextGameNumber = 1;
        } else {
            levelData = MemoryMatch.getLevelData(MemoryMatch.gameLevel);
            currentGameNumber ++;
            if (currentGameNumber > levelData.gameCount) {
                nextGameNumber = 99;
            } else {
                nextGameNumber = currentGameNumber;
            }
        }
        return nextGameNumber;
    },

    restoreLastSession: function () {
        // return true session was restored, false no session previously active
        return false;
    },

    restoreUsers: function () {
        // restore all the user data, and if none, initialize it
        var previousDataLoaded = this.UserData.load(),
            userDataObject;

        if ( ! previousDataLoaded) {
            this.initUserData();
        } else {
            this.UserData.setCurrentUser(this.userId);
            userDataObject = this.UserData.getUserDataObject();
            if (userDataObject != null) {
                this.audioMute = userDataObject['audioMute'] | false;
                this.userBeatAllChallenges = userDataObject['beatAllChallenges'] | false;
                this.lastPlayedDate = userDataObject['lastPlayedDate'];
                createjs.Sound.setMute(this.audioMute);
            }
        }
        // this.UserData.debug();
    },

    updateUserDataStatsForCompletedGamePlay: function (score, matchesEarned, combosEarned, timePlayed, luckyGuesses) {

        // this function updates the user's data for overall statistics. you should call it after the completion of a game.

        var userDataObject = this.UserData.getUserDataObject(),
            numberOfGamesPlayed,
            totalMatchCount,
            totalCombos,
            totalTimePlayed,
            luckyGuessCount,
            bestScore;

        if (userDataObject != null) {
            numberOfGamesPlayed = userDataObject['numberOfGamesPlayed'] | 0;
            totalMatchCount = userDataObject['totalMatchCount'] | 0;
            totalCombos = userDataObject['totalCombos'] | 0;
            totalTimePlayed = userDataObject['totalTimePlayed'] | 0;
            luckyGuessCount = userDataObject['luckyGuessCount'] | 0;
            bestScore = userDataObject['bestScore'] | 0;
            if (score > bestScore) {
                bestScore = score;
            }
            numberOfGamesPlayed ++;
            totalMatchCount += matchesEarned;
            totalCombos += combosEarned;
            luckyGuessCount += luckyGuesses;
            totalTimePlayed += timePlayed;
            userDataObject['numberOfGamesPlayed'] = numberOfGamesPlayed;
            userDataObject['luckyGuessCount'] = luckyGuessCount;
            userDataObject['totalMatchCount'] = totalMatchCount;
            userDataObject['totalCombos'] = totalCombos;
            userDataObject['totalTimePlayed'] = totalTimePlayed;
            userDataObject['bestScore'] = bestScore;
            if (this.lastPlayedDate != null) {
                userDataObject['lastPlayedDate'] = this.lastPlayedDate;
            }
            userDataObject['audioMute'] = this.audioMute;
            userDataObject['beatAllChallenges'] = this.userBeatAllChallenges;
            MemoryMatch.UserData.flush();
        }
    },

    initUserData: function () {
        // Create the first user and unlock first game for all levels
        MemoryMatch.UserData.addUser(1, '', '', '', true);
        MemoryMatch.resetUserData();
    },

    resetUserTotalScore: function () {
        // totalScore is the sum of all best level scores
        var totalScore = 0,
            levelNumber,
            levelScoreCollection,
            i;

        for (levelNumber = 1; levelNumber <= MemoryMatch.GameSetup.levels.length; levelNumber ++) {
            levelScoreCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");
            if (levelScoreCollection != null) {
                for (i = 0; i < levelScoreCollection.length; i ++) {
                    totalScore += levelScoreCollection[i].bestScore;
                }
            }
        }
        MemoryMatch.totalScore = totalScore;
        return totalScore;
    },

    unlockAllLevels: function () {
        var levelNumber,
            gameNumber,
            numberOfGamesInLevel;

        for (levelNumber = 1; levelNumber <= MemoryMatch.GameSetup.levels.length; levelNumber ++) {
            numberOfGamesInLevel = MemoryMatch.GameSetup.levels[levelNumber - 1].gameCount;
            for (gameNumber = 1; gameNumber <= numberOfGamesInLevel; gameNumber ++) {
                MemoryMatch.setGameUserData(levelNumber, gameNumber, 900 + Math.floor(Math.random() * 250), 3, Date.now(), 0);
            }
            MemoryMatch.setGameUserData(levelNumber, 99, 900 + Math.floor(Math.random() * 250), 3, Date.now(), 2);
        }
        MemoryMatch.UserData.flush();
    },

    resetUserData: function () {

        // Reset the user data to initial conditions. Current user will lose everything and start the game as if for the first time!

        var levelNumber,
            userDataObject = MemoryMatch.UserData.getUserDataObject(),
            unlockAllFirstLevels = MemoryMatch.GameSetup.unlockAllFirstLevels || false;

        for (levelNumber = 1; levelNumber <= MemoryMatch.GameSetup.levels.length; levelNumber ++) {
            if (unlockAllFirstLevels || ( ! unlockAllFirstLevels && levelNumber == 1)) {
                MemoryMatch.UserData.setLevelDataItem(levelNumber, "levelScoreCollection", [{gameId: 1, bestScore: 0, starsEarned: 0, lastPlayedDate: 0, playCount: 0}]);
            } else {
                MemoryMatch.UserData.setLevelDataItem(levelNumber, "levelScoreCollection", []);
            }
        }
        MemoryMatch.UserData.clearAllUserAchievements();
        MemoryMatch.UserData.clearAllUserTips();
        userDataObject['audioMute'] = this.audioMute; // keep the Audio setting
        userDataObject['beatAllChallenges'] = false;
        userDataObject['numberOfGamesPlayed'] = 0;
        userDataObject['luckyGuessCount'] = 0;
        userDataObject['totalMatchCount'] = 0;
        userDataObject['totalCombos'] = 0;
        userDataObject['totalTimePlayed'] = 0;
        userDataObject['bestScore'] = 0;
        userDataObject['lastPlayedDate'] = null;
        userDataObject['askBookmark'] = 0;
        MemoryMatch.UserData.flush();
    },

    updateUserDataObject: function (parametersObject) {
        // copy key/values from parameters to userDataObject and save it
        var updated = false,
            key,
            userDataObject = MemoryMatch.UserData.getUserDataObject();

        // if we are given specific parameters to update
        if (parametersObject != null) {
            for (key in parametersObject) {
                if (parametersObject.hasOwnProperty(key)) {
                    userDataObject[key] = parametersObject[key];
                    updated = true;
                }
            }
        } else { // otherwise save what we know we are supposed to be tracking
            userDataObject['audioMute'] = this.audioMute;
            userDataObject['beatAllChallenges'] = this.userBeatAllChallenges;
            updated = true;
        }
        if (updated) {
            MemoryMatch.UserData.flush();
        }
    },

    unlockNextGameForLevel: function (levelNumber, gameNumber) {
        // make sure the level/game score data is initialized.
        // if a record appears in this array then the game is unlocked.
        var i,
            unlocked = false,
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");

        for (i = 0; i < gameScoresCollection.length; i ++) {
            if (gameScoresCollection[i].gameId == gameNumber) {
                unlocked = true;
                break;
            }
        }
        if ( ! unlocked) {
            gameScoresCollection.push({gameId: gameNumber, bestScore: 0, starsEarned: 0, lastPlayedDate: 0, playCount: 0});
            unlocked = true;
            MemoryMatch.UserData.flush();
        }
        return unlocked;
    },

    setGameUserData: function (levelNumber, gameNumber, bestScore, starsEarned, lastPlayedDate, longestStreak) {
        var i,
            gameData,
            dataWasUpdated = false,
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");

        if (gameScoresCollection == null) {
            // this is the first game saved so initialize the collection
            gameScoresCollection = [{gameId: gameNumber, bestScore: bestScore, starsEarned: starsEarned, lastPlayedDate: lastPlayedDate, playCount: 1, longestStreak: longestStreak}];
            dataWasUpdated = MemoryMatch.UserData.setLevelDataItem(levelNumber, "levelScoreCollection", gameScoresCollection);
        } else {
            // find the item matching this gameNumber and update in place
            for (i = 0; i < gameScoresCollection.length; i ++) {
                gameData = gameScoresCollection[i];
                if (gameData.gameId == gameNumber) {
                    gameData.playCount ++;
                    if (bestScore > gameData.bestScore) { // only update if bested
                        gameData.bestScore = bestScore;
                    }
                    if (starsEarned > gameData.starsEarned) { // only update if bested
                        gameData.starsEarned = starsEarned;
                    }
                    if (gameData.longestStreak == null) {
                        gameData.longestStreak = 0;
                    }
                    if (longestStreak > gameData.longestStreak) { // only update if bested
                        gameData.longestStreak = longestStreak;
                    }
                    if (lastPlayedDate == null || lastPlayedDate == 0) {
                        gameData.lastPlayedDate = Date.now();
                    } else {
                        gameData.lastPlayedDate = lastPlayedDate;
                    }
                    dataWasUpdated = true;
                }
            }
            if ( ! dataWasUpdated) {
                gameScoresCollection.push({gameId: gameNumber, bestScore: bestScore, starsEarned: starsEarned, lastPlayedDate: lastPlayedDate, playCount: 1, longestStreak: longestStreak});
                dataWasUpdated = true;
            }
        }
        if (dataWasUpdated) {
            MemoryMatch.UserData.flush();
        }
        return dataWasUpdated;
    },

    getPriorScoreDataForGameNumber: function (gameNumber, gameScoresCollection) {
        var i,
            gameData = null;

        if (gameScoresCollection == null) {
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(MemoryMatch.gameLevel, "levelScoreCollection");
        }
        if (gameScoresCollection != null && gameScoresCollection.length > 0) {
            for (i = 0; i < gameScoresCollection.length; i ++) {
                if (gameScoresCollection[i].gameId == gameNumber) {
                    gameData = gameScoresCollection[i];
                    break;
                }
            }
        }
        return gameData;
    },

    getPriorBestScoreForGameNumber: function (gameLevel, gameNumber) {
        var i,
            priorBestScore = 0,
            gameScoresCollection;

        gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(gameLevel, "levelScoreCollection");
        if (gameScoresCollection != null && gameScoresCollection.length > 0) {
            for (i = 0; i < gameScoresCollection.length; i ++) {
                if (gameScoresCollection[i].gameId == gameNumber) {
                    priorBestScore = gameScoresCollection[i].bestScore;
                    break;
                }
            }
        }
        return priorBestScore;
    },

    getGameLevelNumberOffset: function (levelNumber) {
        // for a given level, determine the game number to offset to get a contiguous game counter across all levels
        var gameLevelIndex,
            startGameNumberOffset = 0;

        levelNumber --;
        for (gameLevelIndex = 0; gameLevelIndex < MemoryMatch.GameSetup.levels.length; gameLevelIndex ++) {
            if (levelNumber > gameLevelIndex) {
                startGameNumberOffset += MemoryMatch.GameSetup.levels[gameLevelIndex].gameCount + 1;
            } else {
                break;
            }
        }
        return startGameNumberOffset;
    },

    isChallengeGameUnlocked: function (levelNumber) {

        // The Challenge game is unlocked if player earned at least 1 stars on all games in the level

        var i,
            starsNeeded = 1,
            gamesWithTwoOrMoreStars = 0,
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");

        if (gameScoresCollection != null && gameScoresCollection.length > 0) {
            for (i = 0; i < gameScoresCollection.length; i ++) {
                if (gameScoresCollection[i].starsEarned >= starsNeeded) {
                    gamesWithTwoOrMoreStars ++;
                } else {
                    break;
                }
            }
        }
        return gamesWithTwoOrMoreStars >= MemoryMatch.getLevelData(levelNumber).gameCount;
    },

    determineLevelStars: function (levelNumber) {
        // Logic assumes 3 stars per game.
        // Must play all games in level to earn any level stars.
        // The number of stars earned in a level is determined from the stars earned in each individual game:
        // Beat the challenge game + half the games with 3 stars and at least 2 stars in each game = 3 stars

        var levelStars = 0,
            i,
            gamesWithThreeOrMoreStars = 0,
            gamesWithTwoOrMoreStars = 0,
            gamesWithOneOrMoreStars = 0,
            totalStarCount = 0,
            averageStars,
            gamesInLevel = MemoryMatch.getLevelData(levelNumber).gameCount,
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");

        if (gameScoresCollection.length >= gamesInLevel) {
            if (gameScoresCollection != null && gameScoresCollection.length > 0) {
                for (i = 0; i < gameScoresCollection.length; i ++) {
                    totalStarCount += gameScoresCollection[i].starsEarned;
                    if (gameScoresCollection[i].starsEarned > 2) {
                        gamesWithThreeOrMoreStars ++;
                    }
                    if (gameScoresCollection[i].starsEarned > 1) {
                        gamesWithTwoOrMoreStars ++;
                    }
                    if (gameScoresCollection[i].starsEarned > 0) {
                        gamesWithOneOrMoreStars ++;
                    }
                }
            }
            averageStars = totalStarCount / gamesInLevel;
            if (gamesWithThreeOrMoreStars >= (gamesInLevel * 0.5) && gamesWithTwoOrMoreStars >= gamesInLevel) {
                levelStars = 3;
            } else if (gamesWithTwoOrMoreStars >= (gamesInLevel * 0.5) && gamesWithOneOrMoreStars >= gamesInLevel) {
                levelStars = 2;
            } else if (averageStars >= 1.5) { // 9+ stars
                levelStars = 1;
            } else {
                levelStars = 0;
            }
        }
        return levelStars;
    },

    userEarnedAllStars: function () {

        // Logic assumes 3 stars per game.
        // Returns true if user earned all stars in all games (except Challenge games)

        var allStarsEarned = true,
            levelIndex,
            levelNumber,
            i,
            gamesInLevel,
            gameScoresCollection;

        for (levelIndex = 0; levelIndex < MemoryMatch.GameSetup.levels.length; levelIndex ++) {
            levelNumber = levelIndex + 1;
            gamesInLevel = MemoryMatch.getLevelData(levelNumber).gameCount;
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");
            if (gameScoresCollection.length >= gamesInLevel) { // make sure user played all games in level
                if (gameScoresCollection != null && gameScoresCollection.length > 0) {
                    for (i = 0; i < gameScoresCollection.length; i ++) {
                        if (gameScoresCollection[i].gameId < 99 && gameScoresCollection[i].starsEarned < 3) {
                            allStarsEarned = false;
                            break;
                        }
                    }
                }
            } else {
                allStarsEarned = false;
            }
            if ( ! allStarsEarned) {
                break;
            }
        }
        return allStarsEarned;
    },

    getGameStarsEarned: function () {
        var hasPriorData = MemoryMatch.getPriorScoreDataForGameNumber(MemoryMatch.gameNumber, null),
            gameStarsEarned = MemoryMatch.starsEarnedInCurrentGame();

        if (hasPriorData !== null && hasPriorData.starsEarned > gameStarsEarned) { // stars earned is the greater of current stars earned or previous stars earned
            gameStarsEarned = hasPriorData.starsEarned;
        }
        return gameStarsEarned;
    },

    getPriorGameStarsEarned: function () {
        var gameStarsEarned = 0,
            hasPriorData = MemoryMatch.getPriorScoreDataForGameNumber(MemoryMatch.gameNumber, null);

        if (hasPriorData && hasPriorData.starsEarned > 0) {
            gameStarsEarned = hasPriorData.starsEarned;
        }
        return gameStarsEarned;
    },

    calculateTimeBonus: function () {
        var totalGameTime,
            timeBonus = 0;

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            totalGameTime = MemoryMatch.gameEndTime - MemoryMatch.gameStartTime;
            timeBonus = (3000 * (MemoryMatch.rows * MemoryMatch.columns)) - totalGameTime;
            if (timeBonus > 0) {
                timeBonus = Math.max(100, Math.min(1000, Math.floor(timeBonus / 1000) * 100));
            } else {
                timeBonus = 0;
            }
        }
        return timeBonus;
    },

    calculateUnusedMovesBonus: function () {
        var bonus = 0;

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN && MemoryMatch.levelTolerance > 0) {
            bonus = (MemoryMatch.levelTolerance - MemoryMatch.missCount) * 100;
        }
        return bonus;
    },

    calculateComboBonus: function () {
        var bonus = 0;

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            bonus = MemoryMatch.numberOfCombos * 100;
        }
        return bonus;
    },

    calculateAchievementBonus: function () {
        var bonus = 0;

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            bonus = 0; // TODO: We ned to add up the values of the individual achievements earned in this level
        }
        return bonus;
    },

    canUserAdvance: function () {
        // User just completed a game, we need to verify they earned a score/stars to advance to the next game
        // They would automatically advance if they already unlocked the next game. Otherwise we need to
        // check their current results to see if the unlocked the next level.

        var canUserAdvance = false,
            hasPriorData = MemoryMatch.getPriorScoreDataForGameNumber(MemoryMatch.getNextGameNumber(), null);

        if (hasPriorData != null) {
            canUserAdvance = true; // user already has the next game unlocked
        } else if (MemoryMatch.isChallengeGame) {
            canUserAdvance = MemoryMatch.challengePassed(); // did user beat challenge?
        } else {
            canUserAdvance = MemoryMatch.getGameStarsEarned() > 0 && MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN; // did user beat the game?
            if ( ! canUserAdvance && (MemoryMatch.gameNumber == MemoryMatch.getLevelData(MemoryMatch.gameLevel).gameCount)) { // if last game in level can we get to Challenge Game now?
                canUserAdvance = MemoryMatch.isChallengeGameUnlocked(MemoryMatch.gameLevel)
            }
        }
        return canUserAdvance;
    },

    isGameUnlocked: function (gameNumber) {
        // Check if a specific game in the current level is unlocked

        var unlocked = false,
            hasPriorData = MemoryMatch.getPriorScoreDataForGameNumber(gameNumber, null);

        if (hasPriorData != null) {
            unlocked = true;
        }
        return unlocked;
    },

    convertLevelNumberToLevelAndGameNumber: function (levelNumber) {
        // Convert level number (e.g. 28) to level and game number (e.g. 4, 99)

        var i,
            levelStartOffset,
            matched,
            gameNumber;

        levelStartOffset = 0;
        matched = false;
        for (i = 0; i < MemoryMatch.GameSetup.levels.length; i ++) {
            gameNumber = MemoryMatch.GameSetup.levels[i].gameCount + 1;
            if (levelNumber <= levelStartOffset + gameNumber) {
                gameNumber = levelNumber - levelStartOffset;
                levelNumber = i + 1;
                if (gameNumber > MemoryMatch.GameSetup.levels[i].gameCount) {
                    gameNumber = 99; // the Challenge Game
                }
                matched = true;
                break;
            } else {
                levelStartOffset += gameNumber;
            }
        }
        if ( ! matched) {
            levelNumber = 1;
            gameNumber = 1;
        }
        return {levelNumber: levelNumber, gameNumber: gameNumber};
    },

    isLevelUnlocked: function (levelNumber, gameNumber) {
        // Check if a specific game in the current level is unlocked
        // if gameNumber is null then levelNumber is absolute value game number (level - 1 * numberOfLevels + levelNumber % number of games in level)
        // if gameNumber is provided then levelNumber and gameNumber as per standard game rules

        var unlocked = false,
            i,
            levelAndGameNumber,
            gameScoresCollection,
            gameData = null;

        if (gameNumber === undefined || gameNumber === null) {
            // convert levelNumber to levelNumber and gameNumber, e.g 28 to 4, 7
            levelAndGameNumber = MemoryMatch.convertLevelNumberToLevelAndGameNumber(levelNumber);
            levelNumber = levelAndGameNumber.levelNumber;
            gameNumber = levelAndGameNumber.gameNumber;
        }
        gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");
        if (gameScoresCollection != null && gameScoresCollection.length > 0) {
            for (i = 0; i < gameScoresCollection.length; i ++) {
                if (gameScoresCollection[i].gameId == gameNumber) {
                    gameData = gameScoresCollection[i];
                    break;
                }
            }
        }
        if (gameData != null) {
            unlocked = true;
        }
        return unlocked;
    },

    challengePassed: function () {
        return MemoryMatch.isChallengeGame && (MemoryMatch.gameNumber - 1) >= MemoryMatch.challengeAdvanceStreak;
    },

    didUserBeatChallenge: function (landNumber) {
        var i,
            challengePassed = false,
            gameScoresCollection,
            challengeAdvanceStreak;

        if (landNumber < 1) {
            landNumber = 1;
        } else if (landNumber > MemoryMatch.GameSetup.levels) {
            landNumber = MemoryMatch.GameSetup.levels;
        }
        gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(landNumber, "levelScoreCollection");
        challengeAdvanceStreak = MemoryMatch.GameSetup.levels[landNumber - 1].challengeAdvanceStreak;
        if (gameScoresCollection != null && gameScoresCollection.length > 0) {
            for (i = 0; i < gameScoresCollection.length; i ++) {
                if (gameScoresCollection[i].gameId == 99 && gameScoresCollection[i].longestStreak >= challengeAdvanceStreak) {
                    challengePassed = true;
                    break;
                }
            }
        }
        return challengePassed;
    },

    didUserBeatAllChallenges: function () {
        var challengesPassed = 0,
            i,
            levelIndex,
            levelNumber,
            challengeAdvanceStreak,
            gameScoresCollection;

        for (levelIndex = 0; levelIndex < MemoryMatch.GameSetup.levels.length; levelIndex ++) {
            levelNumber = levelIndex + 1;
            gameScoresCollection = MemoryMatch.UserData.getLevelDataItem(levelNumber, "levelScoreCollection");
            challengeAdvanceStreak = MemoryMatch.GameSetup.levels[levelIndex].challengeAdvanceStreak;
            if (gameScoresCollection != null && gameScoresCollection.length > 0) {
                for (i = 0; i < gameScoresCollection.length; i ++) {
                    if (gameScoresCollection[i].gameId == 99 && gameScoresCollection[i].longestStreak >= challengeAdvanceStreak) { // is challenge game and user beat it
                        challengesPassed ++;
                    }
                }
            }
        }
        return challengesPassed >= MemoryMatch.GameSetup.levels.length;
    },

    calculateLevelAccuracy: function () {
        var accuracy = 0,
            possibleMatches;

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            if (MemoryMatch.gameType == MemoryMatch.GAMEPLAYTYPE.HAYSTACK) {
                accuracy = Math.floor((1 - (MemoryMatch.missCount / MemoryMatch.levelTolerance)) * 100);
            } else {
                possibleMatches = (MemoryMatch.rows * MemoryMatch.columns) * 0.5;
                accuracy = Math.floor((possibleMatches / (MemoryMatch.matchCount + MemoryMatch.missCount)) * 100);
            }
        }
        return accuracy;
    },

    starsEarnedInCurrentGame: function () {
        // Determine the number of stars earned in the game just played based on parameters of that game type
        var starsEarned = 0,
            possibleMatches = 0,
            accuracy,
            gameLevel = MemoryMatch.gameNumber;

        if (MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            switch (MemoryMatch.gameType) {
                case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
                case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                    accuracy = MemoryMatch.calculateLevelAccuracy();
                    possibleMatches = (MemoryMatch.rows * MemoryMatch.columns) * 0.5;
                    if (possibleMatches < 7) {
                        if (accuracy >= 54) {
                            starsEarned = 3;
                        } else if (accuracy > 44) {
                            starsEarned = 2;
                        } else {
                            starsEarned = 1;
                        }
                    } else {
                        if (accuracy > 49) {
                            starsEarned = 3;
                        } else if (accuracy > 34) {
                            starsEarned = 2;
                        } else {
                            starsEarned = 1;
                        }
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                    possibleMatches = (MemoryMatch.rows * MemoryMatch.columns) * 0.5;
                    if (MemoryMatch.missCount < 1) {
                        starsEarned = 3;
                    } else if (possibleMatches > 4 && MemoryMatch.missCount < 2) {
                        starsEarned = 3;
                    } else if (possibleMatches > 5 && MemoryMatch.missCount < 4) {
                        starsEarned = 2;
                    } else if (possibleMatches > 4 && MemoryMatch.missCount < 3) {
                        starsEarned = 2;
                    } else if (possibleMatches > 3 && MemoryMatch.missCount < 2) {
                        starsEarned = 2;
                    } else {
                        starsEarned = 1;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                    possibleMatches = MemoryMatch.rows * MemoryMatch.columns;
                    if (possibleMatches > 6) {
                        if (MemoryMatch.missCount < 3) {
                            starsEarned = 3;
                        } else if (MemoryMatch.missCount < 4) {
                            starsEarned = 2;
                        } else {
                            starsEarned = 1;
                        }
                    } else if (possibleMatches > 4) {
                        if (MemoryMatch.missCount < 2) {
                            starsEarned = 3;
                        } else if (MemoryMatch.missCount < 3) {
                            starsEarned = 2;
                        } else {
                            starsEarned = 1;
                        }
                    } else {
                        if (MemoryMatch.missCount < 1) {
                            starsEarned = 3;
                        } else if (MemoryMatch.missCount < 2) {
                            starsEarned = 2;
                        } else {
                            starsEarned = 1;
                        }
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                case MemoryMatch.GAMEPLAYTYPE.MONTE:
                    if (gameLevel > 9) {
                        starsEarned = 3;
                    } else if (gameLevel > 5) {
                        starsEarned = 2;
                    } else if (gameLevel > 3) {
                        starsEarned = 1;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.SIMON:
                    gameLevel --;
                    if (gameLevel > 15) {
                        starsEarned = 3;
                    } else if (gameLevel > 9) {
                        starsEarned = 2;
                    } else if (gameLevel > 3) {
                        starsEarned = 1;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.PATTERN:
                    if (gameLevel > 10) {
                        starsEarned = 3;
                    } else if (gameLevel > 5) {
                        starsEarned = 2;
                    } else {
                        starsEarned = 1;
                    }
                    break;
                default:
                    break;
            }
        }
        return starsEarned;
    },


    hiFiveEarnedInCurrentGame: function () {
        // Determine a encouragement message for the game just played
        var message = '',
            possibleMatches,
            accuracy,
            gameLevel = MemoryMatch.gameNumber,
            wordsOfEncouragement = MemoryMatch.GameSetup.GUIStrings.wordsOfEncouragement,
            sampleWord = wordsOfEncouragement[Math.floor(Math.random() * wordsOfEncouragement.length)];

        if (MemoryMatch.isChallengeGame || MemoryMatch.gamePlayState == MemoryMatch.GAMEPLAYSTATE.WIN) {
            switch (MemoryMatch.gameType) {
                case MemoryMatch.GAMEPLAYTYPE.CONCENTRATION:
                case MemoryMatch.GAMEPLAYTYPE.NEMESIS:
                    accuracy = MemoryMatch.calculateLevelAccuracy();
                    if (accuracy > 49) {
                        message = sampleWord;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.CHAINS:
                    possibleMatches = (MemoryMatch.rows * MemoryMatch.columns) * 0.5;
                    if (MemoryMatch.missCount < 1) {
                        message = 'Perfect!';
                    } else if (possibleMatches > 3 && MemoryMatch.missCount < 2) {
                        message = sampleWord;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.HAYSTACK:
                    possibleMatches = MemoryMatch.rows * MemoryMatch.columns;
                    if (possibleMatches > 4) {
                        if (MemoryMatch.missCount < 2) {
                            message = sampleWord;
                        }
                    } else {
                        if (MemoryMatch.missCount < 1) {
                            message = 'Perfect!';
                        }
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.EYESPY:
                case MemoryMatch.GAMEPLAYTYPE.MONTE:
                    if (gameLevel > 7) {
                        message = sampleWord;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.SIMON:
                    gameLevel --;
                    if (gameLevel > 8) {
                        message = sampleWord;
                    }
                    break;
                case MemoryMatch.GAMEPLAYTYPE.PATTERN:
                    if (gameLevel > 6) {
                        message = sampleWord;
                    }
                    break;
                default:
                    break;
            }
        }
        return message;
    },

    showInfoMessage: function (parameters) {
        var standardParameters = {x: 0, y: 0, width: 900, height: 270, title: '', message: '', icon: 'iconCards', points: null, sound: '', callback: null},
            pointsText;

        if (parameters != null) {
            if (parameters.title != null) {
                standardParameters.title = parameters.title;
            }
            if (parameters.message != null) {
                standardParameters.message = parameters.message;
            }
            if (parameters.points != null) {
                if (parameters.points > 0) {
                    pointsText = "+" + parameters.points.toString();
                } else if (parameters.points < 0) {
                    pointsText = parameters.points.toString();
                }
                standardParameters.points = pointsText;
                MemoryMatch.updateScoreDisplay(parameters.points);
            }
            if (parameters.x != null) {
                standardParameters.x = parameters.x;
            } else {
                standardParameters.x = MemoryMatch.stageWidth * 0.8;
            }
            if (parameters.y != null) {
                standardParameters.y = parameters.y;
            } else {
                standardParameters.y = MemoryMatch.stageHeight * 0.9;
            }
            if (parameters.sound != null) {
                standardParameters.sound = parameters.sound;
            }
            if (parameters.callback != null) {
                standardParameters.callback = parameters.callback;
            }
            MemoryMatch.achievementDisplayQueue.push(standardParameters);
        }
    },

    achievementEarned: function (achievementId) {
        // call this to determine if the achievement is earned and initiate the GUI effects
        // Achievements are queued so we can handle multiple achievements earned at the same time
        var earned = false,
            alreadyEarned = MemoryMatch.didUserEarnAchievement(achievementId);

        if ( ! alreadyEarned) {
            earned = MemoryMatch.UserData.setUserAchievement(achievementId);
            if (earned) {
                MemoryMatch.UserData.flush();
            }
            MemoryMatch.achievementDisplayQueue.push(achievementId);
        }
        return ! alreadyEarned;
    },

    didUserEarnAchievement: function (achievementId) {
        return MemoryMatch.UserData.isUserAchievementSet(achievementId);
    },

    getUserAchievements: function () {
        return MemoryMatch.UserData.getUserAchievements();
    },

    processAchievementQueue: function () {
        var now,
            id,
            objectType,
            achievementInfo;
//        var objectToDisplay;

        if (MemoryMatch.achievementDisplayQueue.length > 0) {
            now = Date.now();
            if ((now - MemoryMatch.achievementDisplayTime) > 2000) {
                MemoryMatch.achievementDisplayTime = now;
                id = MemoryMatch.achievementDisplayQueue.splice(0, 1)[0];
                objectType = Object.prototype.toString.call(id); // is it an Array or is it a Number?
                if (objectType.indexOf('Number') >= 0) { // just Achievement Id, make a AchievementItem and show it
//                    objectToDisplay = new MemoryMatch.AchievementItem(MemoryMatch.stage, {achievementId: id, autoClose: true, icon: 'metal', sound: 'soundBonus', callback: null});
//                    if (objectToDisplay != null) {
//                        objectToDisplay.playSound();
//                    }
                    // get title
                    achievementInfo = MemoryMatch.getAchievementInfo(id);
                    if (achievementInfo != null) {
                        MemoryMatch.showMessageBalloon("metal", achievementInfo.name, null, MemoryMatch.stageWidth * 0.5, MemoryMatch.stageHeight * 0.96);
                        MemoryMatch.triggerSoundFx('soundAchievement', {delay: 350});
                    }
                } else { // Just show the message at location indicated
                    MemoryMatch.showMessageBalloon(null, id.title, id.points, id.x, id.y);
                    if (id.sound != null) {
                        MemoryMatch.triggerSoundFx(id.sound, {delay: 100});
                    }
                }
            }
        }
    },

    onEnterFrame: function (event) {
        var deltaTime = createjs.Ticker.getInterval();
        if ( ! this.gamePaused) { // do not do these things if the game is paused
            this.updateGameTimers();
            this.processAchievementQueue();
            this.showFrameRate();
        }
        if (this.runAnimations || ! this.gamePaused || this.gamePausePending) {
            this.AnimationHandler.onEnterFrame(event, deltaTime); // only process the animations if the game is not paused
        }
        if (this.stageUpdated) { // only if another process indicated a stage update is required should we call update()
            this.stage.update(event);
            this.stageUpdated = false;
        }
    },

    showFrameRate: function () {
        var measuredFPS,
            frameRateDebugText;

        if (this.debugMode) {
            measuredFPS = 'FPS: ' + Math.floor(createjs.Ticker.getMeasuredFPS()).toString() + ' (expect ' + this.fps.toString() +  '); Tick time: ' + Math.floor(createjs.Ticker.getMeasuredTickTime());
            if (this.frameRateDebugText == null) {
                frameRateDebugText = new createjs.Text(measuredFPS, MemoryMatch.getScaledFontSize(36) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColorBonus);
                frameRateDebugText.textAlign = "left";
                frameRateDebugText.x = this.stageWidth * 0.02;
                frameRateDebugText.y = this.stageHeight * 0.96;
                frameRateDebugText.maxWidth = this.stageWidth;
                frameRateDebugText.name = 'debugText';
                this.stage.addChild(frameRateDebugText);
                this.frameRateDebugText = frameRateDebugText;
            } else {
                this.frameRateDebugText.text = measuredFPS;
            }
        }
    },

    //====================================================================================
    //
    // the following functions are our typical game helper functions generic to all games
    // TODO: Consider moving all these methods to a Util object
    //
    //====================================================================================

    debugLog: function (message) {
        var logMessage = [],
            i,
            numberOfArgs = arguments.length;

        if (numberOfArgs > 1) {
            logMessage.push(message);
            for (i = 1; i < numberOfArgs; i ++) {
                logMessage.push(arguments[i]);
            }
            message = logMessage.join(' ');
        }
        if (MemoryMatch.debugMode && MemoryMatch.messageField != null) {
            MemoryMatch.messageField.text = message;
        }
        if (MemoryMatch.debugMode) {
            try {
                console.log(message);
            } catch (e) {
                // no way to handle a failed console log?
            }
        }
    },

    hasHTML5LocalStorage: function () {
        // Determine if this device supports local storage
        var hasSupport = false,
            storage,
            testKey;

        try {
            hasSupport = 'localStorage' in window && window['localStorage'] !== null;
            if (hasSupport) { // even if "supported" make sure we can write and read from it
                storage = window.localStorage;
                testKey = 'MemoryMatch';
                storage.setItem(testKey, '1');
                storage.removeItem(testKey);
            }
        } catch (e) {
            hasSupport = false;
        }
        return hasSupport;
    },

    isValidEmail: function (email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    },

    isAppBookmarked: function () {
        var isBookmarked = ("standalone" in window.navigator) && window.navigator.standalone;
        return isBookmarked;
    },

    isDeviceiOS: function () {
        return ['iPad', 'iPhone', 'iPod'].indexOf(navigator.platform) >= 0;
    },

    getVendorPrefix: function () {

        // Return a prefix for the browser we are currently running on based on the document.hidden property being available.

        var prefixes = ['moz', 'ms', 'o', 'webkit'],
            i,
            testPrefix,
            result = null;

        if ( ! 'hidden' in document) {
            // Loop through all the possible prefixes we know to check
            for (i = 0; i < prefixes.length; i++) {
                testPrefix = prefixes[i] + 'Hidden';
                if (testPrefix in document) {
                    result = prefixes[i];
                    break;
                }
            }
        }
        return result;
    },

    isDocumentHidden: function () {
        var hiddenProperty,
            vendorPrefix = MemoryMatch.getVendorPrefix();

        if (vendorPrefix != null) {
            hiddenProperty = vendorPrefix + 'Hidden';
        } else {
            hiddenProperty = 'hidden';
        }
        return document[hiddenProperty];
    },

    getVisibilityChangeEvent: function () {
        var visibilityChangeEvent,
            vendorPrefix = MemoryMatch.getVendorPrefix();

        if (vendorPrefix != null) {
            visibilityChangeEvent = vendorPrefix + 'visibilitychange';
        } else {
            visibilityChangeEvent = 'visibilitychange';
        }
        return visibilityChangeEvent;
    },

    saveObjectWithKey: function (key, object) {
        // save object is local storage
        if (MemoryMatch.hasHTML5LocalStorage() && key != null && object != null) {
            window.localStorage[key] = JSON.stringify(object);
        }
    },

    loadObjectWithKey: function (key) {
        // save object is local storage
        var jsonData,
            object = null;

        if (MemoryMatch.hasHTML5LocalStorage() && key != null) {
            jsonData = window.localStorage[key];
            if (jsonData != null) {
                object = JSON.parse(jsonData);
            }
        }
        return object;
    },

    getGameKey: function (key) {
        var result = MemoryMatch.GameSetup.clientId + "." + MemoryMatch.GameSetup.gameName;
        if (key != null) {
            result += "." + key;
        }
        return result;
    },

    getAchievementInfo: function (achievementId) {
        var achievements = MemoryMatch.GameSetup.achievements,
            achievementInfo = null,
            itemFound = false,
            i;

        for (i = 0; i < achievements.length; i ++ ) {
            achievementInfo = achievements[i];
            if (achievementInfo.id == achievementId) {
                itemFound = true;
                break;
            }
            achievementInfo = null;
        }
        return achievementInfo;
    },

    getRandomNumberBetween: function (bottom, top) {
        return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
    },

    getRandomNumberBetweenButNot: function (bottom, top, notThisOne) {
        var newValue = notThisOne,
            tryCounter = 0;

        while (notThisOne == newValue && tryCounter < 50) {
            newValue = MemoryMatch.getRandomNumberBetween(bottom, top);
            tryCounter ++;
        }
        return newValue;
    },

    /**
     * Return a random value from 0 to the number of provided entries (-1) given a set of probabilities.
     * Provide a set of probabilities in any order order. Example:
     * [10, 40, 50]
     * For this set, 0 is returned 10% of the time, 1 is returned 40% of the time, and 2 is returned 50% of the time.
     *
     */
    getRandomValueFromProbabilitySet: function (arrayOfProbabilities) {

        var total = 0,
            randomSample,
            value,
            i;

        // Make a sum of the total possible range of values
        for (i = 0; i < arrayOfProbabilities.length; i ++) {
            total += arrayOfProbabilities[i];
        }
        randomSample = Math.random() * total;

        // Go through the probabilities and find where our random sample falls
        value = -1;
        for (i = 0; i < arrayOfProbabilities.length; i ++) {
            if (randomSample < arrayOfProbabilities[i]) {
                value = i;
                break;
            } else {
                randomSample -= arrayOfProbabilities[i];
            }
        }
        if (value < 0) {
            value = arrayOfProbabilities.length - 1;
        }
        return value;
    },

    /**
     * @description Replace key:value pairs into a string. This provides a template-like formatting using {key} string replacement.
     * @method tokenReplace
     * @param {sourceString} string that contains %TOKEN% to be replaced if matched by a params object key.
     * @param {Object} The replacement object, which contains <pre>{KEY1:"value", KEY2: "value", ...}</pre> properties.
     * @return {String} A string with all replaced string values. Note that values defined in the source string
     * that are not found in the replacement object will remain with %TOKEN%.
     **/
    tokenReplace: function(sourceString, params) {
        var key,
            result = sourceString;

        for (key in params) {
            if (params.hasOwnProperty(key)) {
                result = result.replace(new RegExp("%" + key + "%", "ig"), params[key]);
            }
        }
        return result;
    },

    replaceChar: function (str, char) {
        // this should be a String extension
        // String.prototype.replaceChar
        var pos = str.indexOf(char);
        if (pos > 0) {
            return str.substr(0, pos) + str.substr(pos + 1);
        } else if (pos == 0) {
            return str.substr(1);
        } else {
            return str;
        }
    },

    formatTimeAsString: function (sourceTimeInMilliseconds, showLeadingMinutes, showLeadingHours) {
        // return time in format sss, mm:ss, or h:mm:ss
        var seconds,
            minutes,
            hours,
            timeAsString = '';

        if (sourceTimeInMilliseconds == null) {
            sourceTimeInMilliseconds = 0;
        }
        if (showLeadingMinutes == null) {
            showLeadingMinutes = false;
        }
        if (showLeadingHours == null) {
            showLeadingHours = false;
        }
        if (sourceTimeInMilliseconds > 1000) {
            seconds = Math.floor(sourceTimeInMilliseconds / 1000) % 60;
        } else {
            seconds = 0;
        }
        if (sourceTimeInMilliseconds > 60000) {
            minutes = Math.floor(sourceTimeInMilliseconds / 60000) % 60;
        } else {
            minutes = 0;
        }
        if (sourceTimeInMilliseconds > 3600000) {
            hours = Math.floor(sourceTimeInMilliseconds / 3600000);
        } else {
            hours = 0;
        }
        if (hours > 0 || showLeadingHours) {
            timeAsString = hours.toString() + ":";
        }
        if (minutes > 0 || timeAsString.length > 0 || showLeadingMinutes) {
            if ((timeAsString.length > 0 && minutes < 10) && ! (showLeadingMinutes && minutes == 0)) {
                timeAsString += "0";
            }
            timeAsString += minutes.toString() + ":";
        }
        if (seconds > 0 || timeAsString.length > 0) {
            if (timeAsString.length > 0 && seconds < 10) {
                timeAsString += "0";
            }
            timeAsString += seconds.toString();
        }
        return timeAsString;
    },

    formatNumberWithGroups: function (value) {
        var valueAsString = value.toString(),
            isNegative = value < 0,
            i;

        // Add commas to 3-digit groups
        if (isNegative) {
            valueAsString = valueAsString.substring(1, valueAsString.length);
        }
        if (valueAsString.length > 3) {
            for (i = valueAsString.length - 3; i >= 1; i -= 3) {
                valueAsString = valueAsString.substring(0, i) + "," + valueAsString.substring(i, valueAsString.length);
            }
        }
        if (isNegative) {
            valueAsString = '-' + valueAsString;
        }
        return valueAsString;
    },

    htmlColorStringToColorArray: function (htmlColorValue) {
        var hexCharacters = "0123456789ABCDEF",
            result = [0, 0, 0],
            i,
            colorIndex = 0;

        if (htmlColorValue.charAt(0) == "#") {
            htmlColorValue = htmlColorValue.slice(1);
        }
        htmlColorValue = htmlColorValue.toUpperCase();
        if (htmlColorValue.length == 3) {
            for (i = 0; i < 3; i ++) {
                result[colorIndex ++] = hexCharacters.indexOf(htmlColorValue.charAt(i));
            }
        } else if (htmlColorValue.length == 6) {
            for (i = 0; i < 6; i += 2) {
                result[colorIndex ++] = (hexCharacters.indexOf(htmlColorValue.charAt(i)) * 16) + hexCharacters.indexOf(htmlColorValue.charAt(i + 1));
            }
        }
        return result;
    },

    queryStringToObject: function (queryString) {
        // convert a string "token=value&token=value..." into a key/value array
        // Will skip over anything before the first ? if it is found in the string

        var i,
            numberOfParts,
            keyValuePair,
            propertyObject = {},
            parts = queryString.replace(/.*?[\?]/, "");

        parts = parts.split('&');
        numberOfParts = parts.length;
        for (i = 0; i < numberOfParts; i ++) {
            if (parts[i] !== null && parts[i].length > 0) {
                keyValuePair = parts[i].split('=');
                propertyObject[decodeURIComponent(keyValuePair[0])] = decodeURIComponent(keyValuePair[1]);
            }
        }
        return propertyObject;
    },

    getQueryStringValue: function (key) {
        var queryDict = {},
            value = null;

        location.search.substr(1).split("&").forEach(function(item) {
            var itemValue = item.split("=");
            queryDict[itemValue[0]] = itemValue[1];
        });
        if (queryDict[key] != null) {
            value = queryDict[key];
        }
        return value;
    },

    setPlatform: function () {
        MemoryMatch.platform = navigator.platform;
        MemoryMatch.locale = navigator.language;
        MemoryMatch.isNativeBuild = document.location.protocol == 'file:';
        if (Modernizr != null && Modernizr.touch != null) {
            MemoryMatch.isTouchDevice = Modernizr.touch;
        } else {
            MemoryMatch.isTouchDevice = false;
        }
    },

    isBrowserDetect: function (whichBrowser) {
        var userAgent = navigator.userAgent.toLowerCase(),
            regX,
            is;

        regX = new RegExp(whichBrowser.toLowerCase());
        is = regX.test(userAgent);
        return is;
    },

    getSpriteFrameSize: function (spriteSheet, spriteFrame) {
        var spriteWidth = 0,
            spriteHeight = 0;

        if (spriteSheet !== null && spriteSheet.frames !== null && spriteFrame !== null && spriteFrame.length > 0) {
            if (spriteSheet.animations[spriteFrame] == null) {
                MemoryMatch.debugLog("getSpriteFrameSize: No spritesheet data for " + spriteFrame);
            } else {
                spriteWidth = spriteSheet.frames[spriteSheet.animations[spriteFrame][0]][2];
                spriteHeight = spriteSheet.frames[spriteSheet.animations[spriteFrame][0]][3];
            }
        }
        return {width: spriteWidth, height: spriteHeight};
    },

    getSpriteFrameWidth: function (spriteSheet, spriteFrame) {
        var spriteWidth = 0;

        if (spriteSheet !== null && spriteSheet.frames !== null && spriteFrame !== null && spriteFrame.length > 0) {
            if (spriteSheet.animations[spriteFrame] == null) {
                MemoryMatch.debugLog("getSpriteFrameWidth: No spritesheet data for " + spriteFrame);
            } else {
                spriteWidth = spriteSheet.frames[spriteSheet.animations[spriteFrame][0]][2];
            }
        }
        return spriteWidth;
    },

    getSpriteFrameHeight: function (spriteSheet, spriteFrame) {
        var spriteHeight = 0;

        if (spriteSheet !== null && spriteSheet.frames !== null && spriteFrame !== null && spriteFrame.length > 0) {
            if (spriteSheet.animations[spriteFrame] == null) {
                MemoryMatch.debugLog("getSpriteFrameHeight: No spritesheet data for " + spriteFrame);
            } else {
                spriteHeight = spriteSheet.frames[spriteSheet.animations[spriteFrame][0]][3];
            }
        }
        return spriteHeight;
    },

    makeBezierPointArray: function (startPoint, controlPoint, endPoint, numberOfPoints) {
        // Build an array of points following a Bezier curve
        // b = ((1-t)*(1-t)) * p0 + 2*(1-t)*t*p1 + (t*t)*p2 where t ranges from 0 to 1.

        var arrayOfPointsOnTheCurve = [],
            t, t1, t1s, ts, tt12,
            cx,
            cy,
            last,
            prev,
//            angle,
            tIncrement = 1 / numberOfPoints;

        t = 0;
        while (t <= 1) {
            t1 = 1 - t;
            t1s = t1 * t1;
            ts = t * t;
            tt12 = 2 * t * t1;
            cx = t1s * startPoint.x + tt12 * controlPoint.x + ts * endPoint.x;
            cy = t1s * startPoint.y + tt12 * controlPoint.y + ts * endPoint.y;
            arrayOfPointsOnTheCurve.push({x: cx, y: cy});
            t += tIncrement;
        }
        last = arrayOfPointsOnTheCurve.length - 1;
        prev = arrayOfPointsOnTheCurve.length - 2;
//        angle = Math.atan2(arrayOfPointsOnTheCurve[last].y - arrayOfPointsOnTheCurve[prev].y, arrayOfPointsOnTheCurve[last].x - arrayOfPointsOnTheCurve[prev].x);
        return arrayOfPointsOnTheCurve;
    },

    getMidpointBetween: function (objectA, objectB) {
        return {x: objectA.x + Math.round((objectB.x - objectA.x) * 0.5), y: objectA.y + Math.round((objectB.y - objectA.y) * 0.5)};
    },

    //====================================================================================
    //
    // makeCard returns an object-like card entity to handle all properties and methods
    // of our cards. A card is a createjs.Container.
    //
    //====================================================================================

    makeCard: function (cardNumber, cardValue, spriteData) {
        var cardMatchCounterPositionIndex = MemoryMatch.GameSetup.cardMatchCounterPosition,
            cardMatchCounterPosition,
            cardHighlight,
            cardBackSprite,
            cardFrontSprite,
            cardMatchCounter,
            cardMatchCounterBg,
            cardMatchCounterBgSize,
            cardMatchColor,
            guiSpriteFrames = MemoryMatch.GameSetup.guiSpritesheet1Frames,
            guiSpriteData = new createjs.SpriteSheet(guiSpriteFrames),
            cardBorderWidth = MemoryMatch.cardMargin * 2.0,
            card = new createjs.Container();

        card.SPRITEINDEX = {
            SPRITE_HIGHLIGHT:    0,
            SPRITE_CARDBACK:     1,
            SPRITE_MATCHBG:      2,
            SPRITE_MATCHCOUNTER: 3,
            SPRITE_CARDFACE:     4,
            SPRITE_SPECIALFX:    5
        };

        // layer 0 is the card highlight to indicate the card is selected
        cardHighlight = card.addChild(new createjs.Shape());
        cardHighlight.graphics.beginFill("#FF0").drawRoundRect(MemoryMatch.cardMargin * -1.0, MemoryMatch.cardMargin * -1.0, MemoryMatch.cardWidth + cardBorderWidth, MemoryMatch.cardHeight + cardBorderWidth, 8);
        cardHighlight.alpha = 0.0;
        cardHighlight.visible = false;

        // layer 1 is the card back
        cardBackSprite = new createjs.Sprite(spriteData, 0);
        card.addChild(cardBackSprite);
        cardBackSprite.gotoAndStop(0);
        cardBackSprite.visible = false;

        // layer 2 & 3 is the card match counter
        cardMatchCounterBg = new createjs.Sprite(guiSpriteData, 'cardCounter');
        card.addChild(cardMatchCounterBg);
        cardMatchCounterBg.visible = false;
        cardMatchCounterBgSize = MemoryMatch.getSpriteFrameSize(guiSpriteFrames, 'cardCounter');

        cardMatchColor = MemoryMatch.GameSetup.levels[MemoryMatch.gameLevel - 1].primaryColor;
        if (cardMatchColor == null) {
            cardMatchColor = MemoryMatch.GameSetup.cardMatchCounterColor;
        }
        if (cardMatchColor == null) {
            cardMatchColor = '#00FF00';
        }
        cardMatchCounter = new createjs.Text("", MemoryMatch.getScaledFontSize(MemoryMatch.GameSetup.cardMatchCounterSize) + " " + MemoryMatch.GameSetup.cardMatchCounterFont, cardMatchColor);
        cardMatchCounter.textAlign = 'center';
        if (cardMatchCounterPositionIndex === null) {
            cardMatchCounterPositionIndex = 4;
        }
        switch (cardMatchCounterPositionIndex) {
            case 1: // top-left
                cardMatchCounterPosition = {x: MemoryMatch.cardHeight * 0.16, y: MemoryMatch.cardHeight * 0.28};
                cardMatchCounter.textAlign = "left";
                cardMatchCounterBg.setTransform(0, 0, 1, 1, 0, 0, 0, 0, 0);
                break;
            case 2: // top-right
                cardMatchCounterPosition = {x: MemoryMatch.cardHeight * 0.84, y: MemoryMatch.cardHeight * 0.28};
                cardMatchCounter.textAlign = "right";
                cardMatchCounterBg.setTransform(MemoryMatch.cardWidth, 0, 1, 1, 0, 0, 0, cardMatchCounterBgSize.width, 0);
                break;
            case 4: // bottom-left
                cardMatchCounterPosition = {x: MemoryMatch.cardHeight * 0.16, y: MemoryMatch.cardHeight * 0.72};
                cardMatchCounter.textAlign = "left";
                cardMatchCounterBg.setTransform(0, MemoryMatch.cardHeight, 1, 1, 0, 0, 0, 0, cardMatchCounterBgSize.height);
                break;
            case 3: // bottom-right
            default:
                cardMatchCounterPosition = {x: MemoryMatch.cardHeight * 0.84, y: MemoryMatch.cardHeight * 0.72};
                cardMatchCounter.textAlign = "right";
                cardMatchCounterBg.setTransform(MemoryMatch.cardWidth, MemoryMatch.cardHeight, 1, 1, 0, 0, 0, cardMatchCounterBgSize.width, cardMatchCounterBgSize.height);
                break;
        }
        cardMatchCounter.x = cardMatchCounterPosition.x; // Place counter in lower right corner of card
        cardMatchCounter.y = cardMatchCounterPosition.y;
        cardMatchCounter.maxWidth = 86 * MemoryMatch.stageScaleFactor; // allow 2 digits at scale
        card.addChild(cardMatchCounter);
        cardMatchCounter.visible = false;

        // layer 4 is the card face
        cardFrontSprite = new createjs.Sprite(spriteData, 0);
        card.addChild(cardFrontSprite);
        cardFrontSprite.gotoAndStop(cardValue);
        cardFrontSprite.visible = false;

        card.bounds = new createjs.Rectangle(MemoryMatch.cardMargin * -1.0, MemoryMatch.cardMargin * -1.0, MemoryMatch.cardWidth + cardBorderWidth, MemoryMatch.cardHeight + cardBorderWidth);
        card.cardNum = cardNumber;
        card.name = "Card" + cardValue;
        card.value = cardValue;
        card.isSelected = false;
        card.isEnabled = true;    // Allow cards to be non-interactive when isEnabled is false user cannot select the card
        card.seenCount = 0;
        card.restoreFlag = false; // indicates a card flip state was saved to be later restored
        card.isPattern = false;  // for Pattern Match game
        card.sequenceNumber = 0; // for Simon game
        card.state = MemoryMatch.CARDSTATE.NOTREADY; // trace the state of the card: 0=Down, 1=Up, 2=Removed, 9=not ready
        card.matchCounter = 0;
        card.cardSelectedHandler = null;
        card.on("click", MemoryMatch.onCardClicked, MemoryMatch);
        card.on("rollover", this.onCardHighlight, this);
        card.on("rollout", this.onCardUnhighlight, this);
        card.cursor = "pointer";
        card.regX = (MemoryMatch.cardWidth + cardBorderWidth) * 0.5;
        card.regY = (MemoryMatch.cardHeight + cardBorderWidth) * 0.5;
        card.cache(card.bounds.x, card.bounds.y, card.bounds.width, card.bounds.height, 1);

        card.setValue = function (cardValue) {
            // reset this card to the requested value
            var cardFace = this.getChildAt(this.SPRITEINDEX.SPRITE_CARDFACE);
            this.value = cardValue;
            cardFace.gotoAndStop(cardValue);
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.kill = function () {
            cardBackSprite = null;
            cardFrontSprite = null;
            card.bounds = null;
            card.removeAllChildren();
            card.removeAllEventListeners();
            card = null;
            guiSpriteFrames = null;
            guiSpriteData = null;
        };

        card.toggleFace = function () {
            var cardBack = this.getChildAt(this.SPRITEINDEX.SPRITE_CARDBACK),
                cardFace = this.getChildAt(this.SPRITEINDEX.SPRITE_CARDFACE),
                showingMatchCounter = false;

            if (cardBack.visible && ! cardFace.visible) {
                cardBack.visible = false;
                cardFace.visible = true;
            } else {
                cardBack.visible = true;
                cardFace.visible = false;
                if (this.matchCount > 0) {
                    showingMatchCounter = true;
                }
            }
            this.showMatchCounter(showingMatchCounter);
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.highlight = function () {
            var cardHighlight;

            if (this.isEnabled && ! this.isSelected) {
                cardHighlight = this.getChildAt(this.SPRITEINDEX.SPRITE_HIGHLIGHT);
                cardHighlight.alpha = 0.5;
                this.updateCache();
                MemoryMatch.stageUpdated = true;
            }
        };

        card.unhighlight = function () {
            var cardHighlight;

            if (this.isEnabled && ! this.isSelected) {
                cardHighlight = this.getChildAt(this.SPRITEINDEX.SPRITE_HIGHLIGHT);
                cardHighlight.alpha = 0.0;
                this.updateCache();
                MemoryMatch.stageUpdated = true;
            }
        };

        card.preSelect = function () {
            var cardHighlight;

            if ( ! this.isSelected) {
                cardHighlight = this.getChildAt(this.SPRITEINDEX.SPRITE_HIGHLIGHT);
                cardHighlight.alpha = 0.8;
                this.updateCache();
                MemoryMatch.stageUpdated = true;
            }
        };

        card.select = function () {
            var cardHighlight = this.getChildAt(this.SPRITEINDEX.SPRITE_HIGHLIGHT);
            cardHighlight.alpha = 0.8;
            this.isSelected = true;
            this.flip();
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.specialSelect = function (cardSelectType, showHighlight) {
            var centerX = MemoryMatch.cardWidth * 0.5,
                centerY = MemoryMatch.cardHeight * 0.5,
                cardHighlight = this.getChildAt(this.SPRITEINDEX.SPRITE_HIGHLIGHT),
                shapeFx,
                duration,
                cardAnimator;

            if (showHighlight) {
                this.isSelected = true;
                cardHighlight.alpha = 0.8;
            }
            if (cardSelectType == 1) {
                centerX = MemoryMatch.cardWidth * 0.5;
                centerY = MemoryMatch.cardHeight * 0.5;
                shapeFx = this.addChild(new createjs.Shape()); // TODO: Must be at layer SPRITEINDEX.SPRITE_SPECIALFX
                shapeFx.graphics.setStrokeStyle(4, "round").beginStroke("#FFFFFF").drawCircle(0, 0, 5).drawCircle(0, 0, 10);
                shapeFx.setTransform(centerX, centerY, 1, 1);
                shapeFx.alpha = 0.6;
                shapeFx.mask = cardHighlight;
                duration = 0.25; // animation should take 250 milliseconds
                shapeFx.dScaleX = 1 + (5.0 / (duration * MemoryMatch.fps));
                shapeFx.dAlpha = 0.9 - 0.95 / (duration * MemoryMatch.fps);
                cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(this, 0, 0, false, null, null);
                cardAnimator.tickFunction = this.updateSelect;
            }
            if (showHighlight || cardSelectType == 1) {
                this.updateCache();
                MemoryMatch.stageUpdated = true;
            }
        };

        card.updateSelect = function (cardAnimator) {
            var keepAnimating = true,
                shapeFx,
                newScale,
                newAlpha,
                card = cardAnimator.actor;

            if (card != null) {
                shapeFx = card.getChildAt(card.SPRITEINDEX.SPRITE_SPECIALFX);
                if (shapeFx != null) {
                    newScale = shapeFx.scaleX * shapeFx.dScaleX;
                    shapeFx.scaleX = newScale;
                    shapeFx.scaleY = newScale;
                    newAlpha = shapeFx.alpha * shapeFx.dAlpha;
                    shapeFx.alpha = newAlpha;
                    if (newAlpha < 0.05) {
                        keepAnimating = false;
                        card.removeChildAt(card.SPRITEINDEX.SPRITE_SPECIALFX);
                    }
                }
                card.updateCache();
                MemoryMatch.stageUpdated = true;
            }
            return keepAnimating;
        };

        card.flip = function () {
            var endSkew = 90,
                cardAnimator;

            if (MemoryMatch.gamePaused && ! MemoryMatch.showingDemo) {
                return;
            }
            // begin card flip animation
            this.isEnabled = false;
            this.state = MemoryMatch.CARDSTATE.FLIPPING;
            this.skewY = 0;
            cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(this, 0, 0, false, null, this.flipAnimationPhaseTwo);
            if (cardAnimator != null) {
                cardAnimator.vYSkew = endSkew / MemoryMatch.cardFlipDx;
                cardAnimator.endYSkew = endSkew;
            }
            MemoryMatch.triggerSoundFx("soundCardFlip");
        };

        card.showMatchCounter = function (showFlag) {
            var matchCounter = card.getChildAt(card.SPRITEINDEX.SPRITE_MATCHCOUNTER),
                matchCounterBg = card.getChildAt(card.SPRITEINDEX.SPRITE_MATCHBG);

            if (matchCounter != null && matchCounterBg != null) {
                if (showFlag == null) {
                    showFlag = true;
                }
                matchCounterBg.visible = showFlag;
                matchCounter.visible = showFlag;
            }
            MemoryMatch.stageUpdated = true;
        };

        card.flipAnimationPhaseTwo = function (card) {
            var cardAnimator,
                cardImage = card.getChildAt(card.SPRITEINDEX.SPRITE_CARDFACE),
                endSkew = -90;

            card.state = MemoryMatch.CARDSTATE.FLIPPING;
            card.skewY = 90;
            cardImage.visible = true;
            card.seenCount ++;
            if (card.matchCounter > 0) {
                card.showMatchCounter(false);
            }
            if (MemoryMatch.gamePaused) {
                card.flipAnimationComplete(card);
            } else {
                cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(card, 0, 0, false, null, card.flipAnimationComplete);
                if (cardAnimator != null) {
                    cardAnimator.vYSkew = endSkew / MemoryMatch.cardFlipDx;
                    cardAnimator.endYSkew = 0;
                }
            }
            card.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.unflipAnimationPhaseTwo = function (card) {
            var cardBack = card.getChildAt(card.SPRITEINDEX.SPRITE_CARDBACK),
                cardImage = card.getChildAt(card.SPRITEINDEX.SPRITE_CARDFACE),
                endSkew = -90,
                cardAnimator;

            cardBack.visible = true;
            cardImage.visible = false;
            card.state = MemoryMatch.CARDSTATE.FLIPPING;
            card.skewY = 90;
            if (card.matchCounter > 0) {
                card.showMatchCounter(true);
            }
            if (MemoryMatch.gamePaused) {
                card.flipAnimationComplete(card);
            } else {
                cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(card, 0, 0, false, null, card.flipAnimationComplete);
                if (cardAnimator != null) {
                    cardAnimator.vYSkew = endSkew / MemoryMatch.cardFlipDx;
                    cardAnimator.endYSkew = 0;
                }
            }
            card.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.flipAnimationComplete = function (card) {
            var cardFace = card.getChildAt(card.SPRITEINDEX.SPRITE_CARDFACE);

            card.skewY = 0;
            if (cardFace.visible) {
                card.state = MemoryMatch.CARDSTATE.UP;
            } else {
                card.state = MemoryMatch.CARDSTATE.DOWN;
            }
            card.isEnabled = true;
            card.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.unselect = function () {
            var cardHighlight = this.getChildAt(card.SPRITEINDEX.SPRITE_HIGHLIGHT);

            this.isSelected = false;
            cardHighlight.alpha = 0.0;
            cardHighlight.scaleX = 1.0;
            cardHighlight.scaleY = 1.0;
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.flipBack = function () {
            var endSkew = 90,
                cardAnimator;

            if (MemoryMatch.gamePaused && ! MemoryMatch.showingDemo) {
                return;
            }
            // If this card is currently flipping we need to cancel that
            if (this.state == MemoryMatch.CARDSTATE.FLIPPING) {
                MemoryMatch.AnimationHandler.removeActor(this);
                this.skewY = 0;
            }
            // begin card flip animation
            this.isEnabled = false;
            this.state = MemoryMatch.CARDSTATE.FLIPPING;
            this.unselect();
            cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(this, 0, 0, false, null, this.unflipAnimationPhaseTwo);
            if (cardAnimator != null) {
                cardAnimator.vYSkew = endSkew / MemoryMatch.cardFlipDx;
                cardAnimator.endYSkew = endSkew;
            }
        };

        card.forceDown = function () {
            var cardFace = card.getChildAt(card.SPRITEINDEX.SPRITE_CARDFACE),
                cardBack = card.getChildAt(card.SPRITEINDEX.SPRITE_CARDBACK);
            cardFace.visible = false;
            cardBack.visible = true;
            card.skewY = 0;
            card.state = MemoryMatch.CARDSTATE.DOWN;
            card.updateCache();
            card.isEnabled = true;
            MemoryMatch.stageUpdated = true;
        };

        card.showCard = function (cardToShow) {
            var cardBackSprite = cardToShow.actor.getChildAt(card.SPRITEINDEX.SPRITE_CARDBACK);

            if (MemoryMatch.gamePaused && ! MemoryMatch.showingDemo) {
                return;
            }
            MemoryMatch.triggerSoundFx("soundCardDeal");
            cardBackSprite.visible = true;
            cardToShow.actor.showMatchCounter(cardToShow.actor.matchCounter > 0);
            cardToShow.actor.regX = MemoryMatch.cardWidth * 0.5;
            cardToShow.actor.regY = MemoryMatch.cardHeight * 0.5;
            cardToShow.actor.state = MemoryMatch.CARDSTATE.DOWN;
            MemoryMatch.checkBoardIsReadyForPlay();
            cardToShow.actor.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.showCardDemo = function () {
            var cardBackSprite = this.getChildAt(card.SPRITEINDEX.SPRITE_CARDBACK);

            cardBackSprite.visible = true;
            this.showMatchCounter(this.matchCounter > 0);
            this.regX = MemoryMatch.cardWidth * 0.5;
            this.regY = MemoryMatch.cardHeight * 0.5;
            this.state = MemoryMatch.CARDSTATE.DOWN;
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.removeCard = function (callMeWhenComplete) {
            var cardAnimator,
                cardHighlight = this.getChildAt(this.SPRITEINDEX.SPRITE_HIGHLIGHT);

            this.isSelected = false;
            this.matchCount = 0;
            this.state = MemoryMatch.CARDSTATE.REMOVED;
            this.cardSelectedHandler = null;
            cardHighlight.alpha = 0.0;
            cardHighlight.scaleX = 1.0;
            cardHighlight.scaleY = 1.0;
            this.updateCache();
            MemoryMatch.stageUpdated = true;

            // begin card fade animation
            cardAnimator = MemoryMatch.AnimationHandler.addToAnimationQueue(this, 500, 0, false, null, callMeWhenComplete);
            if (cardAnimator != null) {
                cardAnimator.vAlpha = -0.05;
                cardAnimator.endAlpha = 0;
            }
        };

        card.setMatchCounter = function (startValue) {
            var matchCounter = this.getChildAt(card.SPRITEINDEX.SPRITE_MATCHCOUNTER),
                showingMatchCounter = false;

            this.matchCounter = startValue;
            if (this.matchCounter > 0) {
                matchCounter.text = this.matchCounter.toString();
                showingMatchCounter = this.state == MemoryMatch.CARDSTATE.DOWN;
            } else {
                matchCounter.text = "";
            }
            this.showMatchCounter(showingMatchCounter);
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.updateMatchCounter = function () {
            var matchCounter = this.getChildAt(card.SPRITEINDEX.SPRITE_MATCHCOUNTER),
                showingMatchCounter = false;

            if (this.matchCounter > 0) {
                this.matchCounter --;
                if (this.matchCounter > 0) {
                    matchCounter.text = this.matchCounter.toString();
                    showingMatchCounter = true;
                } else {
                    matchCounter.text = "";
                }
            }
            this.showMatchCounter(showingMatchCounter);
            this.updateCache();
            MemoryMatch.stageUpdated = true;
        };

        card.toString = function () {
            return "CardNum=" + this.cardNum + "; Name=" + this.name + "; Value=" + this.value + "; State=" + this.state + "; Selected=" + (this.isSelected ? "YES" : "NO") + "; Seen=" + this.seenCount + "; MatchCount=" + this.matchCounter.toString();
        };

        return card;
    },

    //====================================================================================
    //
    // Startup code and HTML5 interface functions
    //
    //====================================================================================

    showOrientationMessage: function (showFlag) {

        // we detected the device is not in the orientation we want, prompt the user to rotate the device

        var backgroundGroup,
            groupName = 'orientationMessage',
            backgroundCover,
            icon,
            iconImageAsset,
            textMessage,
            canvas,
            stageWidth,
            stageHeight,
            backgroundColor;

        backgroundGroup = MemoryMatch.stage.getChildByName(groupName);
        if (showFlag) {
            if (backgroundGroup != null) {
                return;
            }
            canvas = MemoryMatch.stage.canvas;
            stageWidth = canvas.width;
            stageHeight = canvas.height;
            backgroundColor = MemoryMatch.GameSetup.achievementBackgroundColor;

            backgroundGroup = new createjs.Container();
            backgroundGroup.name = groupName;

            backgroundCover = new createjs.Shape();
            backgroundCover.graphics.beginFill(backgroundColor).drawRect(0, 0, stageWidth, stageHeight);
            backgroundCover.alpha = 1;
            backgroundCover.addEventListener("click", this.onClickIgnore);
            backgroundGroup.addChild(backgroundCover);

            textMessage = new createjs.Text(MemoryMatch.GameSetup.GUIStrings.orientationMessage, MemoryMatch.getScaledFontSize(56) + " " + MemoryMatch.GameSetup.guiMediumFontName, MemoryMatch.GameSetup.guiFontColor);
            textMessage.textAlign = "center";
            textMessage.x = stageWidth * 0.5;
            textMessage.y = stageHeight * 0.5;
            textMessage.lineWidth = stageWidth * 0.9;
            textMessage.maxWidth = stageWidth * 0.9;
            textMessage.lineHeight = textMessage.getMeasuredLineHeight() * 1.5;
            backgroundGroup.addChild(textMessage);

            iconImageAsset = MemoryMatch.assetLoader.getResult("orientationIcon");
            icon = new createjs.Bitmap(iconImageAsset);
            icon.setTransform(stageWidth * 0.5, (stageHeight - iconImageAsset.height) * 0.5, 1, 1, 0, 0, 0, iconImageAsset.width * 0.5, iconImageAsset.height * 0.5);
            backgroundGroup.addChild(icon);

            MemoryMatch.stage.addChild(backgroundGroup);
        } else {
            if (backgroundGroup != null) {
                backgroundGroup.removeAllChildren();
                MemoryMatch.stage.removeChild(backgroundGroup);
            }
        }
    },

    onClickIgnore: function (event) {
    },

    stageSizeChanged: function (event) {
        // if a game is in progress you need to reload the assets and redraw

        var priorAssetPostfix = MemoryMatch.assetFileNamePostfix;

        MemoryMatch.debugLog("stageSizeChanged while in state " + MemoryMatch.gameState);
        MemoryMatch.closeAllPopups();
        MemoryMatch.setCanvasSize(null);
        if (MemoryMatch.assetFileNamePostfix != priorAssetPostfix) { // Oh-boy! The size changed and our current assets won't fit. Need to reload everything!
            MemoryMatch.goToHomeScreen();
            MemoryMatch.AnimationHandler.clearAllParticles();
            MemoryMatch.AnimationHandler.clearAllAnimations();
            MemoryMatch.MainMenu.killScreen();
            MemoryMatch.GameGUI.destroy();
            MemoryMatch.stage.removeAllChildren();
            MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.LOADING);
            MemoryMatch.gamePlayState = MemoryMatch.GAMEPLAYSTATE.IDLE;
            MemoryMatch.stage.update(); // render these updates now as the render loop will be paused
            MemoryMatch.showLoader();
            MemoryMatch.loadAllAssets(true);
        } else {
            if (MemoryMatch.isDesiredOrientation()) {
                MemoryMatch.showOrientationMessage(false);
                if (MemoryMatch.gameState == MemoryMatch.GAMESTATE.LOADING) {
                    MemoryMatch.showMenuScreen();
                }
            } else {
                MemoryMatch.showOrientationMessage(true);
            }
        }
    },

    setCanvasSize: function (canvas) {
        // here we are going to set the stage resolution based on our current device display area
        // this game is always landscape orientation. Also important the aspect ratio of every entry must be the same.
        // this logic assumes the game canvas is inside a container <div> and is placed relative to that container
        var supportedResolutions = [
                {width: 2048, height: 1536, scaleFactor: 1, cardScaleFactor: 1, assetPostfix: "100", cardsPostfix: "100"},
                {width: 1024, height: 768, scaleFactor: 0.5, cardScaleFactor: 0.5, assetPostfix: "50", cardsPostfix: "50"},
                {width: 480, height: 360, scaleFactor: 0.24, cardScaleFactor: 0.25, assetPostfix: "24", cardsPostfix: "26"}],
            currentWidth = window.innerWidth,
            currentHeight = window.innerHeight,
            windowAspectRatio = currentWidth / currentHeight,
            resolutionIndex = -1,
            containerDiv = document.getElementById(MemoryMatch.canvasContainerElement), // the container <div>
            i;

        if (canvas == null) {
            canvas = document.getElementById(MemoryMatch.stageCanvasElement);
        }
        // match current stage resolution to the best fit resolution we can support
        for (i = 0; i < supportedResolutions.length; i ++) {
            // compare currentWidth and currentHeight against supportedResolutions[i].width/height within some tolerance (75%)
            // if smaller then try next resolution and scale down
            if (currentWidth >= Math.ceil(supportedResolutions[i].width * 0.6) && currentHeight >= Math.ceil(supportedResolutions[i].height * 0.6)) {
                resolutionIndex = i;
                break;
            }
        }
        if (resolutionIndex == -1) { // if nothing matches then use smallest resolution
            resolutionIndex = supportedResolutions.length - 1;
        }
        // remember what we decided so our graphics placement logic can do the right thing
        MemoryMatch.assetFileNamePostfix = supportedResolutions[resolutionIndex].assetPostfix;
        MemoryMatch.cardsFileNamePostfix = supportedResolutions[resolutionIndex].cardsPostfix;
        MemoryMatch.stageAspectRatio = supportedResolutions[resolutionIndex].width / supportedResolutions[resolutionIndex].height;
        MemoryMatch.stageScaleFactor = supportedResolutions[resolutionIndex].scaleFactor;
        MemoryMatch.cardScaleFactor = supportedResolutions[resolutionIndex].cardScaleFactor;
        MemoryMatch.stageWidth = supportedResolutions[resolutionIndex].width;
        MemoryMatch.stageHeight = supportedResolutions[resolutionIndex].height;
        canvas.width = MemoryMatch.stageWidth;
        canvas.height = MemoryMatch.stageHeight;

        //if (MemoryMatch.isIFrame() || ! MemoryMatch.isTouchDevice) {
            // Let CSS scale and center the containing <div> based on the the best fit of our game stage relative
            // to the maximum available screen space
            if (windowAspectRatio > MemoryMatch.stageAspectRatio) { // window width is too wide relative to desired game width
                currentWidth = Math.floor(currentHeight * MemoryMatch.stageAspectRatio);
            } else { // window height is too high relative to desired game height
                currentHeight = Math.floor(currentWidth / MemoryMatch.stageAspectRatio);
            }
        //} else {
        //    // if we are on the iphone/ipad UIWebView, don't allow the canvas to be larger than what we allow
        //    currentWidth = supportedResolutions[resolutionIndex].width;
        //    currentHeight = supportedResolutions[resolutionIndex].height;
        //}
        containerDiv.style.width = currentWidth + 'px';
        containerDiv.style.height = currentHeight + 'px';
        containerDiv.style.marginTop = (currentHeight * -0.5) + 'px';
        containerDiv.style.marginLeft = (currentWidth * -0.5) + 'px';
        MemoryMatch.cssScaledWidth = currentWidth;
        MemoryMatch.cssScaledHeight = currentHeight;
        MemoryMatch.debugLog("setCanvasSize: (" + MemoryMatch.stageWidth + ", " + MemoryMatch.stageHeight +  "), CSS scale: (" + currentWidth + ", " + currentHeight + "), prefix: " + MemoryMatch.assetFileNamePostfix +  ", aspect: " + MemoryMatch.stageAspectRatio +  ", scale: " + MemoryMatch.stageScaleFactor);
    },

    isPortrait: function () {
        return (window.innerWidth / window.innerHeight) < 1.0;
    },

    isLandscape: function () {
        return (window.innerWidth / window.innerHeight) >= 1.0;
    },

    isIFrame: function () {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    },

    isDesiredOrientation: function () {
        var orientationRequired = MemoryMatch.GameSetup.orientation,
            correctOrientation = false;

        if ( ! MemoryMatch.isTouchDevice) {
            correctOrientation = true;
        } else if (orientationRequired == undefined || orientationRequired == null || orientationRequired == '') {
            correctOrientation = true;
        } else {
            orientationRequired = orientationRequired.toLowerCase();
            correctOrientation = (orientationRequired == 'landscape' && MemoryMatch.isLandscape()) || (orientationRequired == 'portrait' && MemoryMatch.isPortrait());
        }
        return correctOrientation;
    },

    shouldAskUserToBookmarkApp: function () {
        var isAppBookmarked = MemoryMatch.isAppBookmarked(),
            isStandAloneApp = ! MemoryMatch.isIFrame(),
            isNativeApp = MemoryMatch.isNativeBuild,
            isIosDevice = MemoryMatch.isDeviceiOS(),
            userDataObject = this.UserData.getUserDataObject(),
            askedUserToBookmark = userDataObject['askBookmark'] | 0,
            shouldAsk = false,
            isAdShowing = MemoryMatch.isAdShowing();

        if (isIosDevice && isStandAloneApp && ! isNativeApp && ! isAppBookmarked && askedUserToBookmark < 5 && ! isAdShowing) {
            askedUserToBookmark ++;
            userDataObject['askBookmark'] = askedUserToBookmark;
            this.UserData.flush();
            shouldAsk = true;
        }
        return shouldAsk;
    },

    captureDebugInformation: function () {
        var debugData = '',
            canvas = document.getElementById(this.stageCanvasElement);

        debugData += '<div class="debug">';
        debugData += '<p>Stage: (' + MemoryMatch.stageWidth + ',' + MemoryMatch.stageHeight + '); Canvas:  (' + canvas.width + ',' + canvas.height + '); CSS: (' + MemoryMatch.cssScaledWidth + ',' + MemoryMatch.cssScaledHeight + '); Scale factor: ' + MemoryMatch.stageScaleFactor + '; Aspect Ratio: ' + MemoryMatch.stageAspectRatio + '</p>';
        debugData += '<p>CSS scale width: ' + (MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledWidth / MemoryMatch.stageWidth)) + ', CSS scale height: ' + (MemoryMatch.stageScaleFactor * (MemoryMatch.cssScaledHeight / MemoryMatch.stageHeight)) + '</p>';
        debugData += '</div>';
        return debugData;
    },

    getAppInfo: function () {
        return MemoryMatch.GameSetup.gameTitle + " version " + MemoryMatch.GameVersion + " on " + MemoryMatch.platform + " " + MemoryMatch.locale + (MemoryMatch.isTouchDevice ? ", Touch" : ", Mouse") + (MemoryMatch.isIFrame() ? ', iframe' : ', standalone') + (MemoryMatch.isNativeBuild ? ', Native' : ', Web') + ", scale:" + MemoryMatch.stageScaleFactor;
    },

    onVisibilityChange: function (event) {
        var isHidden = MemoryMatch.isDocumentHidden();
//        MemoryMatch.debugLog("onVisibilityChange: hidden? " + (isHidden ? 'YES' : 'NO'));
        MemoryMatch.onPauseGame(isHidden);
    },

    makeResolutionBasedFileNameFromFileName: function (filename, isCards) {
        // to support more efficient asset loading, we make asset sets based on target resolution, then load
        // the assets needed to support that resolution. This function makes the file name corresponding to the
        // assets we need, to allow the code to reference the asset files independent of target resolution.

        var assetFileNameResolutionPostfix,
            sourceFileNameParts,
            fileExtension,
            newFileName,
            i;

        if (isCards == null) {
            isCards = false;
        }
        if (MemoryMatch.assetFileNamePostfix != "") {
            newFileName = "";
            sourceFileNameParts = filename.split(".");
            fileExtension = sourceFileNameParts[sourceFileNameParts.length - 1];
            if (isCards) {
                assetFileNameResolutionPostfix = '-' + MemoryMatch.cardsFileNamePostfix;
            } else {
                assetFileNameResolutionPostfix = '-' + MemoryMatch.assetFileNamePostfix;
            }
            if (sourceFileNameParts.length > 2) {
                for (i = 0; i < sourceFileNameParts.length - 1; i ++) {
                    newFileName += (i > 0 ? "." : "") + sourceFileNameParts[i];
                }
                newFileName += assetFileNameResolutionPostfix + "." + fileExtension;
            } else if (sourceFileNameParts.length == 2) {
                newFileName = sourceFileNameParts[0] + assetFileNameResolutionPostfix + "." + fileExtension;
            } else {
                newFileName = sourceFileNameParts[0] + assetFileNameResolutionPostfix;
            }
        } else {
            newFileName = filename;
        }
        return newFileName;
    },

    makeResolutionBasedJsonFileFromFileName: function (filename) {
        // following makeResolutionBasedFileNameFromFileName(), make a json file to match the spritesheet

        var assetFileNameResolutionPostfix,
            sourceFileNameParts,
            newFileName,
            i;

        if (MemoryMatch.assetFileNamePostfix != "") {
            newFileName = "";
            sourceFileNameParts = filename.split(".");
            assetFileNameResolutionPostfix = '-' + MemoryMatch.assetFileNamePostfix;
            if (sourceFileNameParts.length > 2) {
                for (i = 0; i < sourceFileNameParts.length - 1; i ++) {
                    newFileName += (i > 0 ? "." : "") + sourceFileNameParts[i];
                }
                newFileName += assetFileNameResolutionPostfix + ".json";
            } else {
                newFileName = sourceFileNameParts[0] + assetFileNameResolutionPostfix + ".json";
            }
        } else {
            newFileName = filename;
        }
        return newFileName;
    },

    getSpriteAssetId: function (cardSetIndex) {
        var cardAssetId;

        if (MemoryMatch.isChallengeGame) {
            cardAssetId = 'cards' + MemoryMatch.challengeGameId.toString() + '-' + cardSetIndex;
        } else {
            cardAssetId = 'cards' + MemoryMatch.gameId.toString() + '-' + cardSetIndex;
        }
        return cardAssetId;
    },

    getCardSize: function (gameData) {
        var cardWidth,
            cardHeight;

        if (gameData.cardWidth == null || gameData.cardWidth < 1) {
            cardWidth = MemoryMatch.GameSetup.cardWidth;
        } else {
            cardWidth = gameData.cardWidth;
        }
        cardWidth = Math.ceil(cardWidth * MemoryMatch.cardScaleFactor);
        if (gameData.cardHeight == null || gameData.cardHeight < 1) {
            cardHeight = MemoryMatch.GameSetup.cardHeight;
        } else {
            cardHeight = gameData.cardHeight;
        }
        cardHeight = Math.ceil(cardHeight * MemoryMatch.cardScaleFactor);
        return {width: cardWidth, height: cardHeight};
    },

    qualifiedFolder: function (folderName) {
        var resultName = '';

        if (folderName != null) {
            if (folderName.substr(folderName.length - 1) != '/') {
                resultName = folderName + '/';
            } else {
                resultName = folderName;
            }
        }
        return resultName;
    },

    getScaledFontSize: function (requestedSizeAt100Percent) {
        return Math.floor(requestedSizeAt100Percent * MemoryMatch.cardScaleFactor) + "px";
    },

    isFullScreenAvailable: function () {
        return window.screenfull !== false;
    },

    goFullScreen: function () {
        if (window.screenfull !== false) {
            window.screenfull.toggle(document.getElementById(MemoryMatch.canvasContainerElement));
        }
    },

    logCacheEvent: function (e) {

        // Checking index.appcache, log every event to the console

        var online,
            status,
            type,
            message,
            cache = window.applicationCache;

        if (cache != null) {
            online = navigator.onLine ? 'yes' : 'no';
            status = MemoryMatch.cacheStatusValues[cache.status];
            type = e.type;
            message = 'online: ' + online;
            message += ', event: ' + type;
            message += ', status: ' + status;
            if (type == 'error' && navigator.onLine) {
                message += ' There was an unknown error, check index.appcache.';
            }
            MemoryMatch.debugLog('logCacheEvent: ' + message);
            if (status == 'updateready') {
                try {
                    cache.swapCache();
                } catch (e) {
                    MemoryMatch.debugLog("Error with swapCache()");
                }
                MemoryMatch.setCanvasSize(null); // Force a reload of the game assets
            }
        }
    },

    enginesisCallBack: function (enginesisResponse) {
        if (enginesisResponse != null && enginesisResponse.fn != null) {
            switch (enginesisResponse.fn) {
                case "SessionBegin":
                    break;
                default:
                    break;
            }
        }
    },

    loadAllAssets: function (reloadFlag) {

        // assetManifest array defines all the assets we require to load before the game starts.
        // We are loading everything required by the game before we start. This way a user can "deep-link"
        // to any level and we don't have to worry about those assets being ready.
        // Note some assets are based on resolution, which could change.

        var soundAssetName,
            gameLevelIndex,
            gameData,
            imageArray,
            imageIndex,
            assetLoader,
            assetsFolder = MemoryMatch.qualifiedFolder(MemoryMatch.GameSetup.assetsFolder),
            guiSpritesArray,
            i,
            useXHR,
            objectType,
            assetManifest = [
                {src:MemoryMatch.makeResolutionBasedFileNameFromFileName(assetsFolder + MemoryMatch.GameSetup.backgroundImage), id:"background"},
                {src:MemoryMatch.makeResolutionBasedFileNameFromFileName(assetsFolder + MemoryMatch.GameSetup.popupBackground), id:"popup-bg"},
                {src:MemoryMatch.makeResolutionBasedFileNameFromFileName(assetsFolder + MemoryMatch.GameSetup.orientationIcon), id:"orientationIcon"},
                {src:assetsFolder + MemoryMatch.GameSetup.particleSprite, id:"particles"}
            ],
            secondaryAssetManifest = [],
            chosenManifest = null;

        guiSpritesArray = MemoryMatch.GameSetup.guiSprites;
        if (guiSpritesArray != null && guiSpritesArray.length > 0) {
            for (i = 0; i < guiSpritesArray.length; i ++) {
                assetManifest.push({src:MemoryMatch.makeResolutionBasedFileNameFromFileName(assetsFolder + guiSpritesArray[i]), id: "guiSprites" + (i + 1)});
                assetManifest.push({src:MemoryMatch.makeResolutionBasedJsonFileFromFileName(assetsFolder + guiSpritesArray[i]), id: "guiSprites" + (i + 1) + "json"});
            }
        }
        // Load any Map specific images
        if (MemoryMatch.GameSetup.mapImages != null) {
            for (i = 0; i < MemoryMatch.GameSetup.mapImages.length; i ++) {
                assetManifest.push({src:MemoryMatch.makeResolutionBasedFileNameFromFileName(assetsFolder + MemoryMatch.GameSetup.mapImages[i]), id:"mapImage" + i.toString()});
            }
        }
        // All level based assets are under GameSetup.levels
        for (gameLevelIndex = 0; gameLevelIndex < MemoryMatch.GameSetup.games.length; gameLevelIndex ++) {
            gameData = MemoryMatch.GameSetup.games[gameLevelIndex];
            if (gameData.cardSprites != null) {
                objectType = Object.prototype.toString.call(gameData.cardSprites); // is it an Array or is it a String?
                if (objectType.indexOf('String') >= 0) { // just a single card sprite reference
                    gameData.numberOfCardSets = 1;
                    assetManifest.push({
                        src: "assets/" + MemoryMatch.makeResolutionBasedFileNameFromFileName(gameData.cardSprites, true),
                        id: 'cards' + gameData.gameId.toString() + '-0'
                    });
                } else {
                    gameData.numberOfCardSets = gameData.cardSprites.length;
                    chosenManifest = assetManifest;
                    for (i = 0; i < gameData.numberOfCardSets; i++) {
                        chosenManifest.push({
                            src: "assets/" + MemoryMatch.makeResolutionBasedFileNameFromFileName(gameData.cardSprites[i], true),
                            id: 'cards' + gameData.gameId.toString() + '-' + i.toString()
                        });
                        // First time through add the asset to load immediately. All remaining assets set to load later.
                        chosenManifest = secondaryAssetManifest;
                    }
                }
            }
            if (gameData.images != null) {

                // If images property exists, it is an array of image objects {image:x, cardSprites: y}.
                // To reference them later, use makeLevelImageAssetName() and makeLevelCardDeckAssetName().
                // We are going to load only the first asset immediately, then all the other assets after the game begins.

                imageArray = gameData.images;
                for (imageIndex = 0; imageIndex < imageArray.length; imageIndex ++) {
                    if (imageArray[imageIndex].image != null && imageArray[imageIndex].image.length > 0) {
                        assetManifest.push({
                            src: assetsFolder + MemoryMatch.makeResolutionBasedFileNameFromFileName(imageArray[imageIndex].image),
                            id: MemoryMatch.makeLevelImageAssetName(gameData.gameId, imageIndex)
                        });
                    }
                    if (imageArray[imageIndex].cardSprites != null && imageArray[imageIndex].cardSprites.length > 0) {
                        assetManifest.push({
                            src: assetsFolder + MemoryMatch.makeResolutionBasedFileNameFromFileName(imageArray[imageIndex].cardSprites, true),
                            id: MemoryMatch.makeLevelCardDeckAssetName(gameData.gameId, imageIndex)
                        });
                    }
                }
            }
        }
        useXHR = ! MemoryMatch.isNativeBuild; // useXHR must be true for builds that get assets over http:, but false for assets from file:
        assetLoader = new createjs.LoadQueue(useXHR, "", "anonymous");
        if ( ! reloadFlag) { // these assets are not resolution dependent and only need to be loaded once
            // All sounds are located in the structure GameSetup.Sounds
            for (soundAssetName in MemoryMatch.GameSetup.Sounds) {
                if (MemoryMatch.GameSetup.Sounds.hasOwnProperty(soundAssetName)) {
                    assetManifest.push({src: assetsFolder + MemoryMatch.GameSetup.Sounds[soundAssetName], id: soundAssetName});
                }
            }
            assetLoader.installPlugin(createjs.Sound);
            if ( ! createjs.Sound.initializeDefaultPlugins()) {
                MemoryMatch.debugLog("CreateJS.Sound error cannot init");
            }
            if (createjs.Sound.BrowserDetect.isIOS || createjs.Sound.BrowserDetect.isAndroid) {
                MemoryMatch.debugLog("CreateJS.Sound error iOS or Android issues!");
            }
            createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
            createjs.Sound.alternateExtensions = ["mp3"];
        }
        MemoryMatch.assetLoader = assetLoader;
        assetLoader.addEventListener("complete", MemoryMatch.allAssetsLoaded.bind(MemoryMatch));
        assetLoader.addEventListener("progress", MemoryMatch.assetLoadProgress);
        assetLoader.addEventListener("error", MemoryMatch.assetLoadError);
        assetLoader.setMaxConnections(4);
        assetLoader.loadManifest(assetManifest);
        if (secondaryAssetManifest.length > 0) {
            MemoryMatch.secondaryAssetManifest = secondaryAssetManifest;
        }
    },

    determineIfItTimeToShowAdPopup: function (callMeWhenComplete) {
        var showAd = false;

        // Always call this function when it may be time to display an ad. This function will
        // make the determination if an ad should be displayed or not. If so,
        // show the ad div and reload it.

        if (MemoryMatch.adModel.showAds) {
            if (MemoryMatch.GameSetup.adShowPreroll && ! MemoryMatch.adModel.showedPreroll) {
                MemoryMatch.adModel.showedPreroll = true;
                showAd = true;
            } else if (MemoryMatch.GameSetup.adInterstitalGameCounter > 0) {
                MemoryMatch.adModel.interstitalCounter ++;
                showAd = (MemoryMatch.adModel.interstitalCounter % MemoryMatch.GameSetup.adInterstitalGameCounter == 0);
            }
        }
        if (showAd) {
            if (callMeWhenComplete === undefined || callMeWhenComplete == null) {
                callMeWhenComplete = MemoryMatch.onAdClosed.bind(MemoryMatch);
            }
            MemoryMatch.changeGameState(MemoryMatch.GAMESTATE.SHOWAD);
            MemoryMatch.adModel.adDisplayCounter ++;
            MemoryMatch.AdPopup.setup(MemoryMatch.stage, {title: "Advertisement", callback: callMeWhenComplete, closeButton: true});
            MemoryMatch.AdPopup.buildScreen(true);
            MemoryMatch.adIsShowing = true;
        }
        return showAd;
    },

    onCloseAdPopup: function () {
        MemoryMatch.adIsShowing = false;
        MemoryMatch.returnToPriorGameState();
        if (MemoryMatch.isTouchDevice && MemoryMatch.mainMenuViewCount < 2) {
            MemoryMatch.playBackgroundMusic();
        }
    },

    isAdShowing: function () {
        return MemoryMatch.AdPopup.isShowing();
    },

    onAdClosed: function (event) {
//        MemoryMatch.debugLog("onAdClosed returning game state ");
        MemoryMatch.adIsShowing = false;
        MemoryMatch.returnToPriorGameState();
        if (MemoryMatch.gameState == MemoryMatch.GAMESTATE.MENU && MemoryMatch.adModel.adDisplayCounter == 1 && MemoryMatch.shouldAskUserToBookmarkApp()) {
            MemoryMatch.MainMenu.showBookmarkAppPrompt();
        }
    }
};

function onGooglePlusLoaded () {
    if (enginesisSession != null && enginesisSession.ShareHelper != null) {
        enginesisSession.ShareHelper.onGooglePlusLoaded(null);
    }
};

//====================================================================================
// initApp is called from the page load. This is the entry point. When assets are loaded
// we call MemoryMatch.allAssetsLoaded
//====================================================================================
function initApp() {
    var startUpInfo;
    MemoryMatch.setPlatform();
    startUpInfo = "Loading " + MemoryMatch.getAppInfo();
    if (MemoryMatch.debugMode) {
        MemoryMatch.debugLog(startUpInfo);
    } else {
        console.log(startUpInfo);
    }

    // Listeners for all possible cache events

    var cache = window.applicationCache;
    if (cache != null) {
        cache.addEventListener('cached', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('checking', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('downloading', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('error', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('noupdate', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('obsolete', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('progress', MemoryMatch.logCacheEvent, false);
        cache.addEventListener('updateready', MemoryMatch.logCacheEvent, false);
    }
    if (document.getElementById(MemoryMatch.loaderElement) != null) {
        // show canvas under loader so we can implement a loadbar until we get everything setup for EaselJS to take over
        document.getElementById(MemoryMatch.loaderElement).style.display = "block";
        document.getElementById(MemoryMatch.stageCanvasElement).style.display = "block";
    }

    // Determine canvas size, it will determine which assets need to be loaded
    MemoryMatch.isDesiredOrientationWhenLoadStarted = MemoryMatch.isDesiredOrientation();
    MemoryMatch.setCanvasSize(null);
    MemoryMatch.loadAllAssets(false);

    //runTests(); // run unit tests
}

if ('applicationCache' in window && window['applicationCache'] !== null) {
    window.applicationCache.onerror = function(e) {
        MemoryMatch.debugLog("Application cache error " + e.toString());
    };
}