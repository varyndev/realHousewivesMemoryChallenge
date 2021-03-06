// The GameSetup object defines all the optional parameters around an instance of the
// Memory Match game.

MemoryMatch.GameSetup = {
    clientId: "bravotv",
    gameName: "RealHousewivesMemoryChallenge",
    gameTitle: "The Real Housewives Memory Challenge",
    gameSubTitle: "A true Housewife never forgets, so test your recall skills with a ‘Real’ challenge. You might even earn the most sought after Bravo accessory, your very own ‘Real Housewives’ Award!",
    gameShortSubTitle: "A Real Housewife never forgets, so test your skills in the ultimate memory challenge.",
    gameId: 1084,
    siteId: 108,
    gameLink: 'http://www.bravotv.com/the-real-housewives-memory-challenge',
    gameShortLink: 'http://bravo.ly/XWN3ty',
    gameIcon: 'http://www.bravotv.com/media/games/real-housewives-memory-challenge/assets/icon.png',
    enginesisStage: '',
    developerKey: 'deaddaeddeaddaed',
    gameKey: 'e86cf3754cbd83700639e16eee0583c4',
    siteDomain: 'bravotv.com',
    twitterId: '@bravotv',
    socialHashTag: '#rhmc',
    facebookAppId: '477181735758491',
    googlePlusClientId: '972925239064-mgco9a8lvqu00tuf9pv3q9c385834h66.apps.googleusercontent.com',
    googleAnalyticsAccountId: 'UA-13133265-1',
    promoImage: 'http://www.bravotv.com/media/games/real-housewives-memory-challenge/assets/1200x900.png',
    orientation: "landscape",
    assetsFolder: "assets",
    backgroundImage: "background.jpg",
    popupBackground: "gamePopup.png",
    orientationIcon: "rotate-device.png",
    guiSprites: ["guiSpriteSheet1.png", "guiSpriteSheet2.png", "mapSpriteSheet.png", "shareicons.png"],
    particleSprite: "sparkle_21x23.png",
    guiBoldFontName: "SohoStd-BoldItalic",
    guiMediumFontName: "open_sanscondensed_light",
    guiFontColor: "#FFFFFF",
    guiFontColorBonus: "#2393a7",
    guiFontColorAchievement: "#2393a7",
    guiInfoColor: "#FFFFFF",
    guiAlertFontColor: "#FFFFFF",
    guiHUDMatchCountHeight: 0.7,
    guiHUDMatchCountOffset: 0.12,
    guiHUDMatchCountTopMargin: 0.5,
    adMinDisplaySeconds: 15,
    adShowPreroll: 1,
    adInterstitalGameCounter: 3,
    adInterstitalLevelCounter: 0,
    achievementBorderColor: '#58ddf5',
    achievementBackgroundColor: '#3bc7e4',
    achievementFontColorEarned: '#FFFFFF',
    achievementFontColorUnearned: '#606060',
    cardWidth: 384,
    cardHeight: 512,
    cardMatchCounterPosition: 4,
    cardMatchCounterFont: "SohoStd-BoldItalic",
    cardMatchCounterColor: "#0000CC",
    cardMatchCounterSize: 60,
    numberOfStars: 3,
    unlockAllFirstLevels: true,
    levelButtonAlign: "vertical",
    levels: [
        {gameId: 4,
            title: "Wife Pairing",
            gameCount: 6,
            challengeGameId: 3,
            challengeAdvanceStreak: 3,
            iconHUD: "iconHudLand1",
            iconPopup: "gameOverLand1",
            mapImage: "land1",
            mapPosition: {x: 300, y: 738},
            gemPosition: {x: 6, y: 380},
            tipId: 1,
            primaryColor: "#3bc7e4",
            secondaryColor: "#2393a7",
            liteColor: "#58ddf5"},
        {gameId: 5,
            title: "A Housewife Never Forgets",
            gameCount: 6,
            challengeGameId: 6,
            challengeAdvanceStreak: 5,
            iconHUD: "iconHudLand2",
            iconPopup: "gameOverLand2",
            mapImage: "land2",
            mapPosition: {x: 880, y: 1160},
            gemPosition: {x: 116, y: 380},
            tipId: 2,
            primaryColor: "#f27015",
            secondaryColor: "#ce5f12",
            liteColor: "#ff9b55"},
        {gameId: 2,
            title: "Housewives in a Haystack",
            gameCount: 6,
            challengeGameId: 8,
            challengeAdvanceStreak: 3,
            iconHUD: "iconHudLand3",
            iconPopup: "gameOverLand3",
            mapImage: "land3",
            mapPosition: {x: 1480, y: 1060},
            gemPosition: {x: 226, y: 380},
            tipId: 4,
            primaryColor: "#8e5fa5",
            secondaryColor: "#6b437f",
            liteColor: "#be81dc"},
        {gameId: 7,
            title: "A Race Against Wine",
            gameCount: 6,
            challengeGameId: 1,
            challengeAdvanceStreak: 5,
            iconHUD: "iconHudLand4",
            iconPopup: "gameOverLand4",
            mapImage: "land4",
            mapPosition: {x: 1580, y: 404},
            gemPosition: {x: 336, y: 380},
            tipId: 3,
            primaryColor: "#d2428d",
            secondaryColor: "#a93370",
            liteColor: "#f850a7"}],
    games: [
        {gameId: 1, gameType: 2, games:30, tolerance: 0, columns:2, rows:2,
            cardSprites: ["NY1.png", "NY2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"Repeat After Me",
            levelIntro: "Repeat After Me: I will play a pattern, when I am done you must repeat that pattern. Each turn one more is added. You need at least a streak of 5 to advance."
        },
        {gameId: 2, gameType: 4, games:6, tolerance: 3, columns:3, rows:3,
            cardSprites: ["NJ1.png", "NJ2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"Housewives in a Haystack",
            levelIntro: "Remember the cards and when it is your turn you are showed a card and you must remember where it was. You have a limited number of moves to find all the cards.",
            startMatchCount: 2,
            removeMatches: 1,
            cardShowTime: 5000,
            progression: [{tolerance: 2, matchCount: 3, columns:2, rows:2}, {tolerance: 2, matchCount: 3, columns:2, rows:2}, {tolerance: 4, matchCount: 5, columns:2, rows:3}, {tolerance: 3, matchCount: 5, columns:3, rows:2}, {tolerance: 3, matchCount: 5, columns:3, rows:2}, {tolerance: 4, matchCount: 8, columns:3, rows:3}]
        },
        {gameId: 3, gameType: 3, games:20, tolerance: 1, columns:7, rows:4,
            cardSprites: ["OC1.png", "OC2.png", "BH1.png", "BH2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"Pattern",
            levelIntro: "You are shown a pattern, you must select the cards in that pattern. You need at least a streak of 3 to advance.",
            startMatchCount: 4,
            cardShowTime: 1000,
            progression: [{tolerance: 1, columns:5, rows:3}, {tolerance: 1, columns:5, rows:3}, {tolerance: 1, columns:5, rows:4}, {tolerance: 1, columns:5, rows:4}, {tolerance: 1, columns:6, rows:4}, {tolerance: 1, columns:6, rows:4}, {tolerance: 1, columns:7, rows:4}]
        },
        {gameId: 4, gameType: 1, games:6, tolerance: 6, columns:4, rows:3,
            cardSprites: ["OC1.png", "OC2.png", "BH1.png", "BH2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"Wife Pairing ",
            levelIntro: "Classic memory match game. Each card has one match. Clear the board before you run out of moves.",
            progression: [{tolerance: 10, columns:4, rows:3}, {tolerance: 9, columns:4, rows:3}, {tolerance: 15, columns:4, rows:4}, {tolerance: 13, columns:4, rows:4}, {tolerance: 20, columns:5, rows:4}, {tolerance: 18, columns:5, rows:4}]
        },
        {gameId: 5, gameType: 5, games:6, tolerance: 3, columns:4, rows:2,
            cardSprites: ["ATL1.png", "ATL2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"A Housewife Never Forgets",
            levelIntro: "A twist on memory, you must pair all the cards in as few moves as you can. You only get a limited number of moves to pair all the cards.",
            progression: [{tolerance: 2, columns:4, rows:2}, {tolerance: 2, columns:4, rows:2}, {tolerance: 3, columns:5, rows:2}, {tolerance: 3, columns:5, rows:2}, {tolerance: 3, columns:4, rows:3}, {tolerance: 3, columns:4, rows:3}],
            cardShowTime: 5000
        },
        {gameId: 6, gameType: 6, games:20, tolerance: 1, columns:3, rows:1,
            cardSprites: ["ATL1.png", "ATL2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"Follow Your Card",
            levelIntro: "A shell game: you are shown a card, follow the cards as they are moved and when they stop, pick only that card. You must complete at least 5 to advance.",
            cardShowTime: 1000,
            shuffleCount: 4,
            cardAdvance: 5,
            advanceToColumns: 5
        },
        {gameId: 7, gameType: 7, games:6, tolerance: 5, columns:4, rows:2,
            cardSprites: ["NY1.png", "NY2.png"],
            cardWidth: 384,
            cardHeight: 512,
            numCards: 19,
            levelName:"A Race Against Wine",
            levelIntro: "Make matches to stop your nemesis from drinking all your wine! You miss, she drinks your wine. You match, you keep your wine. Now match!",
            progression: [{tolerance: 5, columns:4, rows:2}, {tolerance: 5, columns:4, rows:2}, {tolerance: 9, columns:4, rows:3}, {tolerance: 9, columns:4, rows:3}, {tolerance: 8, columns:4, rows:3}, {tolerance: 8, columns:4, rows:3}]
        },
        {gameId: 8, gameType: 8, games:15, tolerance: 1, columns:5, rows:1,
            levelName:"Parts vs. Whole",
            levelIntro: "You are shown a set of cards, only one is part of the target card. Pick the correct card to advance. You must complete 3 boards to advance.",
            cardSprites: ["NJ3.png"],
            cardWidth: 384,
            cardHeight: 512,
            cardShowTime: 1250,
            imageGroups:[
                {sprites: 0, difficulty: 1, targetCard: 1, matchCard: 7, badCardCount: 2, badCards: [11,12,13,14,17,18,19]},
                {sprites: 0, difficulty: 1, targetCard: 5, matchCard: 10, badCardCount: 2, badCards: [9,12,13,14,15]},
                {sprites: 0, difficulty: 1, targetCard: 5, matchCard: 16, badCardCount: 2, badCards: [9,12,13,14,15]},
                {sprites: 0, difficulty: 2, targetCard: 6, matchCard: 12, badCardCount: 2, badCards: [9,10,11,14,16,19]},
                {sprites: 0, difficulty: 2, targetCard: 1, matchCard: 16, badCardCount: 2, badCards: [11,12,13,14,17,18,19]},
                {sprites: 0, difficulty: 2, targetCard: 5, matchCard: 11, badCardCount: 2, badCards: [9,12,13,14,15]},
                {sprites: 0, difficulty: 3, targetCard: 2, matchCard: 8, badCardCount: 3, badCards: [7,11,14,15,16,19]},
                {sprites: 0, difficulty: 3, targetCard: 4, matchCard: 10, badCardCount: 3, badCards: [8,11,13,14,15,16,19]},
                {sprites: 0, difficulty: 3, targetCard: 2, matchCard: 9, badCardCount: 3, badCards: [7,11,14,15,16,19]},
                {sprites: 0, difficulty: 3, targetCard: 4, matchCard: 12, badCardCount: 3, badCards: [8,11,13,14,15,16,19]},
                {sprites: 0, difficulty: 3, targetCard: 4, matchCard: 9, badCardCount: 3, badCards: [8,11,13,14,15,16,19]},
                {sprites: 0, difficulty: 4, targetCard: 6, matchCard: 12, badCardCount: 4, badCards: [9,10,11,14,16,19]},
                {sprites: 0, difficulty: 4, targetCard: 4, matchCard: 7, badCardCount: 4, badCards: [8,11,13,14,15,16,19]},
                {sprites: 0, difficulty: 4, targetCard: 3, matchCard: 9, badCardCount: 4, badCards: [7,11,12,13,14,15,16,18]},
                {sprites: 0, difficulty: 4, targetCard: 3, matchCard: 10, badCardCount: 4, badCards: [7,11,12,13,14,15,16,18]},
                {sprites: 0, difficulty: 4, targetCard: 4, matchCard: 10, badCardCount: 4, badCards: [8,11,13,14,15,16,19]},
                {sprites: 0, difficulty: 4, targetCard: 2, matchCard: 9, badCardCount: 4, badCards: [7,11,13,14,15,16,19]}
            ]
        }
    ],
    Sounds: {
        soundCardDeal: "card-deal.ogg",
        soundCardFlip: "cardflip.ogg",
        soundCorrect: "correct.ogg",
        soundCorrectLess: "correct2.ogg",
        soundAchievement: "achievement.ogg",
        soundMiss: "miss.ogg",
        soundMissLess: "miss2.ogg",
        soundTap: "button-tap.ogg",
        soundIntro: "intro2.ogg",
        soundChallenge: "challenge.ogg",
        soundWin: "win.ogg",
        soundLose: "lose.ogg",
        soundBump: "bump.ogg",
        soundBonus: "bonus.ogg",
        soundMovesLow: "UhOh-2.ogg",
        soundMovesLast: "UhOh-4.ogg",
        soundShuffling: "MonteShuffle-3.ogg",
        note1: "note1.ogg",
        note2: "note2.ogg",
        note3: "note3.ogg",
        note4: "note4.ogg",
        note5: "note5.ogg",
        note6: "note6.ogg",
        note7: "note7.ogg",
        note8: "note8.ogg"
    },
    guiSpritesheet1Frames: null,
    guiSpritesheet2Frames: null,
    mapSpritesheetFrames: null,
    shareIconsFrames: null,
    particleFrames: {width:21, height:23, regX:10, regY:11},
    achievements: [
        {id: 1, name: "Fast Match", value: 50, icon: "fastmatch", description: "Make a match in less than 1 second."},
        {id: 2, name: "Fast Combo", value: 50, icon: "fastcombo", description: "Make a combo in less than 2 seconds."},
        {id: 3, name: "Triple Combo", value: 150, icon: "triplecombo", description: "Make three combos without a miss."},
        {id: 4, name: "Quad-bo", value: 250, icon: "quadbo", description: "Make four combos without a miss."},
        {id: 5, name: "Five Combos", value: 100, icon: "5combo", description: "Make five combos in one game."},
        {id: 6, name: "Fifty Combos", value: 250, icon: "50combo", description: "Make fifty combos."},
        {id: 7, name: "25 Combos", value: 100, icon: "25combo", description: "Make twenty five combos."},
        {id: 8, name: "50 Matches", value: 50, icon: "50match", description: "Make 50 matches."},
        {id: 9, name: "100 Matches", value: 150, icon: "100match", description: "Make 100 matches."},
        {id: 10, name: "250 Matches", value: 250, icon: "250match", description: "Make 250 matches."},
        {id: 11, name: "Lucky Guess", value: 50, icon: "luckyguess", description: "Make a match without seeing the second card."},
        {id: 12, name: "Clairvoyant", value: 250, icon: "clairvoyant", description: "Make a match without seeing either card."},
        {id: 13, name: "Chain Gang", value: 100, icon: "chaingang", description: "Complete three chain boards without a miss."},
        {id: 14, name: "Chaintastic", value: 250, icon: "chaintastic", description: "Complete last chain board without a miss."},
        {id: 15, name: "A Contender", value: 250, icon: "acontender", description: "Beat all 4 challenges."},
        {id: 16, name: "3-Star", value: 500, icon: "3star", description: "Earn 3 stars on all levels."},
        {id: 17, name: "Quick Draw", value: 100, icon: "quickdraw", description: "Complete a game in less than 5 seconds."},
        {id: 18, name: "Mozart", value: 275, icon: "mozart", description: "Score over 15 in simon game."},
        {id: 19, name: "Monte", value: 275, icon: "monte", description: "Beat 10 monte boards."},
        {id: 20, name: "Picasso", value: 275, icon: "picasso", description: "Beat 10 pattern boards."},
        {id: 21, name: "Eagle Eye", value: 275, icon: "eagleeye", description: "Beat 15 eyespy boards."}
    ],
    winState: {
        title: "Congratulations! You Win!",
        subtitle: "You completed the Real Housewives Memory Challenge! You\'re the hottest gamer in the country!",
        info: "Now try to go back and improve your scores, earn all the achievements, and earn 3 stars in every game! You can do it!"},
    tips: [[
            {id: 1, category: 'win', text: 'When the going gets tough, you just get stronger and stronger!'},
            {id: 2, category: 'win', text: 'You\'re the hottest gamer in the O.C.!'},
            {id: 3, category: 'win', text: 'You like to have fun, and you do play games (pretty well we might add)!'},
            {id: 17, category: 'tip', text: 'Life isn\'t always diamonds and roses, so don\'t give up!'},
            {id: 18, category: 'tip', text: 'In Beverly Hills, the higher you climb, the farther you fall. You\'ll get it next time!'},
            {id: 22, category: 'tip', text: 'Everyone loves a comeback story, especially starring you!'}
        ],
        [
            {id: 5, category: 'win', text: 'You know how to work it, and win games!'},
            {id: 6, category: 'win', text: 'You have arrived, and the spotlight is on you, honey!'},
            {id: 7, category: 'win', text: 'People are intimidated by your success.'},
            {id: 8, category: 'tip', text: 'Don\'t worry success is in your DNA. When one door closes, another one opens, so try again!'},
            {id: 20, category: 'tip', text: 'A true Southern belle knows her worth, and you\'re priceless, so give it another shot!'},
            {id: 26, category: 'tip', text: 'Don\'t worry so much about keeping up with the Joneses and give it another try!'}
        ],
        [
            {id: 13, category: 'win', text: 'You\'re a Jersey girl, no one can knock you down!'},
            {id: 14, category: 'win', text: 'Haters are gonna hate, but you just win, win, win!'},
            {id: 15, category: 'win', text: 'Life is short, you have no time for losing!'},
            {id: 21, category: 'tip', text: 'Life is about change, sometimes you just have to roll with the punches. Give it another shot!'},
            {id: 21, category: 'tip', text: 'When times get tough, you learn who your real friends are. Don\'t give up!'},
            {id: 22, category: 'tip', text: 'You\'ve faced your share of challenges, but you\'re tougher than you look, so try again!'}
        ],
        [
            {id: 9, category: 'win', text: 'Get the pinot ready, because it\'s turtle time! Congrats!'},
            {id: 10, category: 'win', text: 'You have a taste for winning, and winning has a taste for you!'},
            {id: 11, category: 'win', text: 'To some people, winning elegantly just comes naturally.'},
            {id: 12, category: 'tip', text: 'A true New Yorker never backs down, and you\'re no exception. Holla!'},
            {id: 24, category: 'tip', text: 'You may not be the sharpest tool in the shed, but you\'re pretty, so don\'t give up!'},
            {id: 25, category: 'tip', text: 'You\'re living the American dream, one mistake at a time... Try again!'}
        ]],
    mapImages: [],
    mapLevelPositions: [
        [{x:166, y:140}, {x:236, y:340}, {x:110, y:510}, {x:230, y:650}, {x:90, y:804}, {x:300, y:840}, {x:370, y:1020}],
        [{x:730, y:1280}, {x:854, y:1164}, {x:684, y:1032}, {x:572, y:836}, {x:756, y:840}, {x:892, y:964}, {x:1072, y:1048}],
        [{x:1280, y:1198}, {x:1418, y:1248}, {x:1428, y:1036}, {x:1544, y:928}, {x:1388, y:838}, {x:1388, y:628}, {x:1516, y:644}],
        [{x:1746, y:498}, {x:1720, y:270}, {x:1718, y:48}, {x:1548, y:114}, {x:1498, y:304}, {x:1328, y:316}, {x:1140, y:228}]
    ],
    mapLevelColor: "#FFFFFF",
    mapPathColor: 'rgba(102,102,102,0.5)',
    mapLogoPosition: {x: 1024, y:144},
    mapAwardPosition: {x: 1024, y:540},
    mapSpecialMarkers: [{x: 650, y: 1306, icon: 'planeRouteCa'}, {x: 1270, y: 1190, icon: 'planeRouteGa'}, {x: 1712, y: 662, icon: 'bridge'}],
    GUIStrings: {
        loadingMessages: ["We're loading...", "It's getting amazing!...", "Oh! This is looking good...", "Ready to play!"],
        wordsOfEncouragement: ['Amazing', 'Spectacular', 'Awesome', 'Sensational', 'Impressive', 'Inspiring', 'Magnificent', 'Wonderful'],
        bookmarkTitle: 'Did you know?',
        bookmarkMessage: 'For a better playing experience you can bookmark this app by tapping the Share icon then select Add to Home Screen.',
        shareEmailMessage: 'Matching game with something extra - come play %gamename%. I really enjoy this game, you will too!',
        shareStatusMessage: 'Matching game with something extra - Come play %gamename%. I really enjoy this game, you will too!',
        shareStatusShortMessage: 'Come play %gamename%. I really enjoy this game, you will too!',
        shareGameOverMessage: 'Oh yes! I just completed %gamename% with a score of %score%. Can you beat me?',
        shareGameOverShortMessage: 'I just completed %gamename% with a score of %score%. Can you beat me?',
        orientationMessage: 'This game is best played in landscape orientation.',
        creditsInfo: 'This game was made by JumpyDot using the EaselJS HTML5 framework.',
        creditsCredit: 'Dan Hart:  Game Design & Product Management\n\nJohn Foster:     Programming & Audio\n\nJulia Deter-Keren: Game Design & Art Direction\n\nRobert Prescott:     Quality Assurance',
        demoTextMatchLikeCards: 'Match like cards.',
        demoTextClearBoard: 'Clear the board before you run out of misses.',
        demoTextPlayQuick: 'Play quickly for extra points.',
        demoTextStudyBoard: 'Study the board to remember where all the pairs are located.',
        demoTextOnlyAFewSeconds: 'You have only a few seconds to study the board.',
        demoTextFindPairs: 'Find the pairs but you have only a few misses!',
        demoTextNemesisGoal: 'Each time you miss your Nemesis advances. Don\'t lose your cupcake!',
        demoTextRememberLocation: 'Remember the locations of the cards.',
        demoTextHaystackGoal: 'Locate the target card before you run out of misses.',
        sharePopupTitle: "Share %gamename% with your favorite social network:",
        emailErrorSender: 'Please provide your email address as the sender.',
        emailErrorTo: 'Please provide the email address of a recipient.',
        emailErrorFrom: 'Please provide a valid sender email address.',
        emailErrorToEmail: 'Please provide a valid email address of a recipient.',
        allLevelsUnlocked: 'You have unlocked all levels.',
        allLevelsLocked: 'You have reset all levels.'
    }
};