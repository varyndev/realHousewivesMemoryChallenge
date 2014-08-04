/**
 * UserData.js
 *
 * This object manages the user data. Data is organized by a user id and it is
 * a structured object for a specific game instance. This helps separate the API
 * interface from the actual data organization.
 *
 * Features:
 *   userDataObject: an object of key/value pairs held on behalf of the userId.
 *      .userId = internal, unique, id of the user
 *      .userName = name assigned to the user
 *      .password = users password to access the data record
 *      .email = users email address
 *      .ageCheck = true indicates use is over 13, false otherwise
 *      .. the app will add additional data items to this object e.g. userDataObject['myItem'] = myValue;
 *   levelDataArray: an array of level data, the index being the level number (- 1, e.g. level 1 is index 0) the data being an object.
 *   userAchievements: an array of earned achievements
 *   userTips: an array of seen/unseen tips, each item is a flag (true=seen, false=unseen) indexed by tipId - 1 (e.g. tip # 1 is index 0)
 */
MemoryMatch = MemoryMatch || {};

MemoryMatch.UserData = {
    userDataCollection: null,
    currentUser: null,
    dataUpdatedFlag: false,
    dataLoadedFromStorage: false,
    dataLoadedFromServer: false,

    addUser: function (userId, userName, password, email, ageCheck) {
        var userDataObject;

        if (this.userDataCollection == null) {
            this.userDataCollection = [];
        }
        if (userId == null || userId < 1) {
            userId = this.getNextUserId();
        }
        userDataObject = this.getById(userId);
        if (userDataObject == null) {
            userDataObject = {userId: userId, userName: userName, password: password, email: email, ageCheck: ageCheck, userDataObject: {}, levelDataArray: [], userAchievements: [], userTips: []};
            this.userDataCollection.push(userDataObject);
            this.dataUpdatedFlag = true;
        } else {
            userDataObject.userName = userName;
            userDataObject.password = password;
            userDataObject.email = email;
            userDataObject.ageCheck = ageCheck;
            this.dataUpdatedFlag = true;
        }
        this.sync();
        if (this.currentUser == null) {
            this.currentUser = userDataObject;
        }
        return userDataObject;
    },

    updateUser: function (userId, userName, password, email, ageCheck) {
        var userDataObject;

        if (userId == undefined || userId == null || userId < 1) {
            userId = this.getCurrentUserId();
        }
        userDataObject = this.getById(userId);
        if (userDataObject == null) {
            if (userName == null) {
                userName = '';
            }
            if (password == null) {
                password = '';
            }
            if (email == null) {
                email = '';
            }
            if (ageCheck == null) {
                ageCheck = false;
            }
            userDataObject = this.addUser(userId, userName, password, email, ageCheck);
        } else {
            if (userName != null) {
                userDataObject.userName = userName;
            }
            if (password != null) {
                userDataObject.password = password;
            }
            if (email != null) {
                userDataObject.email = email;
            }
            if (ageCheck != null) {
                userDataObject.ageCheck = ageCheck;
            }
            this.dataUpdatedFlag = true;
        }
        return userDataObject;
    },

    deleteUser: function (userId) {
        var i,
            userExists = false,
            userDataObject;

        if (this.currentUser === userDataObject) {
            this.currentUser = null;
        }
        if (this.userDataCollection !== null && this.userDataCollection.length > 0 && userId !== null) {
            for (i = 0; i < this.userDataCollection.length; i ++) {
                userDataObject = this.userDataCollection[i];
                if (userId === userDataObject.userId) {
                    userExists = true;
                    if (this.currentUser == userDataObject) {
                        this.currentUser = null;
                    }
                    break;
                }
            }
            if (userExists) {
                this.userDataCollection.splice(i, 1);
                this.dataUpdatedFlag = true;
            }
        }
        return userExists;
    },

    getById: function (userId) {
        var i,
            userDataObject,
            returnThisData = null;

        if (userId == undefined || userId == null || userId < 1) {
            userId = this.getCurrentUserId();
        }
        if (this.userDataCollection != null && this.userDataCollection.length > 0 && userId != null) {
            for (i = 0; i < this.userDataCollection.length; i ++) {
                userDataObject = this.userDataCollection[i];
                if (userId == userDataObject.userId) {
                    returnThisData = userDataObject;
                    break;
                }
            }
        }
        return returnThisData;
    },

    getByName: function (userName) {
        var i,
            userDataObject,
            returnThisData = null;

        if (this.userDataCollection != null && this.userDataCollection.length > 0 && userName != null) {
            for (i = 0; i < this.userDataCollection.length; i ++) {
                userDataObject = this.userDataCollection[i];
                if (userName == userDataObject.userName) {
                    returnThisData = userDataObject;
                    break;
                }
            }
        }
        return returnThisData;
    },

    getNextUserId: function () {
        var i,
            userId = 0,
            userDataObject;

        if (this.userDataCollection != null && this.userDataCollection.length > 0) {
            for (i = 0; i < this.userDataCollection.length; i ++) {
                userDataObject = this.userDataCollection[i];
                if (userId < userDataObject.userId) {
                    userId = userDataObject.userId;
                }
            }
        }
        return ++ userId;
    },

    count: function () {
        return this.userDataCollection.length;
    },

    setCurrentUser: function (userId) {
        this.currentUser = this.getById(userId);
        return this.currentUser;
    },

    getCurrentUserId: function () {
        if (this.currentUser === null) {
            this.setCurrentUser(1);
        }
        return this.currentUser.userId;
    },

    setUserDataObject: function (userDataObject) {
        if (this.currentUser != null) {
            this.currentUser.userDataObject = userDataObject;
            this.dataUpdatedFlag = true;
        }
        return userDataObject;
    },

    getUserDataObject: function () {
        var userDataObject = null;
        if (this.currentUser !== null) {
            userDataObject = this.currentUser.userDataObject;
            if (userDataObject === null) {
                userDataObject = {};
            } else if (userDataObject.userAchievements !== null && ! Array.isArray(userDataObject.userAchievements)) {
                // Deal with legacy setting this to an object instead of an array
                userDataObject.userAchievements = [];
                userDataObject.userTips = [];
            }
        }
        return userDataObject;
    },

    setUserDataItem: function (itemKey, itemValue) {
        var wasSet = false;
        if (this.currentUser !== null && this.currentUser.userDataObject !== null) {
            this.currentUser.userDataObject[itemKey] = itemValue;
            wasSet = true;
            this.dataUpdatedFlag = true;
        }
        return wasSet;
    },

    getUserDataItem: function (itemKey) {
        var itemValue = null;
        if (this.currentUser != null && this.currentUser.userDataObject != null) {
            itemValue = this.currentUser.userDataObject[itemKey];
        }
        return itemValue;
    },

    setLevelDataObject: function (levelNumber, levelDataObject) {
        if (this.currentUser != null && this.currentUser.levelDataArray != null && levelNumber > 0) {
            this.currentUser.levelDataArray[levelNumber - 1] = levelDataObject;
            this.dataUpdatedFlag = true;
        }
        return levelDataObject;
    },

    getLevelDataObject: function (levelNumber) {
        var levelDataObject = null;
        if (this.currentUser != null && this.currentUser.levelDataArray != null && levelNumber > 0) {
            levelDataObject = this.currentUser.levelDataArray[levelNumber - 1];
        }
        return levelDataObject;
    },

    setLevelDataItem: function (levelNumber, itemId, itemData) {
        var wasSet = false;
        if (this.currentUser != null && this.currentUser.levelDataArray != null && levelNumber > 0) {
            if (this.currentUser.levelDataArray[levelNumber - 1] == null) {
                this.currentUser.levelDataArray[levelNumber - 1] = {};
            }
            this.currentUser.levelDataArray[levelNumber - 1][itemId] = itemData;
            wasSet = true;
            this.dataUpdatedFlag = true;
        }
        return wasSet;
    },

    getLevelDataItem: function (levelNumber, itemId) {
        var itemData = null;
        if (this.currentUser !== null && this.currentUser.levelDataArray !== null && levelNumber > 0 && this.currentUser.levelDataArray[levelNumber - 1] !== null) {
            itemData = this.currentUser.levelDataArray[levelNumber - 1][itemId];
        }
        return itemData;
    },

    setUserAchievementArray: function (achievementArray) {
        if (this.currentUser !== null) {
            this.currentUser.userAchievements = achievementArray;
            this.dataUpdatedFlag = true;
        }
        return achievementObject;
    },

    setUserAchievement: function (achievementId) {
        var wasSet = false;
        if (this.currentUser !== null && this.currentUser.userAchievements !== null) {
            if (this.currentUser.userAchievements !== null && ! Array.isArray(this.currentUser.userAchievements)) {
                // Deal with legacy setting this to an object instead of an array
                this.currentUser.userAchievements = [];
            }
            this.currentUser.userAchievements.push(achievementId);
            wasSet = true;
            this.dataUpdatedFlag = true;
        }
        return wasSet;
    },

    isUserAchievementSet: function (achievementId) {
        var wasSet = false;
        if (this.currentUser !== null && this.currentUser.userAchievements !== null) {
            if (this.currentUser.userAchievements !== null && ! Array.isArray(this.currentUser.userAchievements)) {
                // Deal with legacy setting this to an object instead of an array
                this.currentUser.userAchievements = [];
            }
            wasSet = this.currentUser.userAchievements.indexOf(achievementId) !== -1;
        }
        return wasSet;
    },

    getUserAchievements: function () {
        if (this.currentUser.userAchievements !== null && ! Array.isArray(this.currentUser.userAchievements)) {
            // Deal with legacy setting this to an object instead of an array
            this.currentUser.userAchievements = [];
        }
        return this.currentUser.userAchievements;
    },

    clearAllUserAchievements: function () {
        this.currentUser.userAchievements = [];
        return this.currentUser.userAchievements;
    },

    setUserTipSeen: function (tipId) {
        var wasSet = false,
            tipIndex = tipId - 1,
            i,
            userTipsArray;

        if (tipIndex < 0) {
            tipIndex = 0;
        }
        if (this.currentUser !== null && this.currentUser.userTips !== null) {
            if (this.currentUser.userTips !== null && ! Array.isArray(this.currentUser.userTips)) {
                this.currentUser.userTips = [];
            }
            userTipsArray = this.currentUser.userTips;
            userTipsArray[tipIndex] = true;
            // Here we make sure there are no gaps in the array
            for (i = 0; i < userTipsArray.length; i ++) {
                if (userTipsArray[i] === undefined) {
                    userTipsArray[i] = false;
                }
            }
            wasSet = true;
            this.dataUpdatedFlag = true;
        }
        return wasSet;
    },

    isUserTipSeen: function (tipId) {
        var wasSeen = false,
            tipIndex = tipId - 1;

        if (this.currentUser !== null && this.currentUser.userTips !== null) {
            if (this.currentUser.userTips !== null && ! Array.isArray(this.currentUser.userTips)) {
                this.currentUser.userTips = [];
            }
            wasSeen = this.currentUser.userTips[tipIndex];
            if (wasSeen === undefined) {
                wasSeen = false;
            }
        }
        return wasSeen;
    },

    getUserTips: function () {
        if (this.currentUser.userTips !== null && ! Array.isArray(this.currentUser.userTips)) {
            this.currentUser.userTips = [];
        }
        return this.currentUser.userTips;
    },

    clearAllUserTips: function () {
        this.currentUser.userTips = [];
        return this.currentUser.userTips;
    },

    sync: function () {
        // synchronize the data with the local storage and the server if connected
        var gameSaveJson;

        if (MemoryMatch.hasHTML5LocalStorage()) {
            gameSaveJson = JSON.stringify(this.userDataCollection);
            window.localStorage[MemoryMatch.getGameKey('userData')] = gameSaveJson;
            this.dataUpdatedFlag = false;
        }
    },

    load: function () {
        // load the data from local storage or the server if connected
        var gameSaveJson,
            wasLoaded = false;

        if (MemoryMatch.hasHTML5LocalStorage()) {
            gameSaveJson = window.localStorage[MemoryMatch.getGameKey('userData')];
            if (gameSaveJson != null && gameSaveJson != "null") {
                this.userDataCollection = JSON.parse(gameSaveJson);
                this.dataUpdatedFlag = false;
                wasLoaded = true;
            }
        }
        return wasLoaded;
    },

    flush: function () {
        // this.debug();
        this.dataUpdatedFlag = true;
        this.sync();
    },

    debug: function () {
        MemoryMatch.debugLog(JSON.stringify(this.userDataCollection));
    }
};
