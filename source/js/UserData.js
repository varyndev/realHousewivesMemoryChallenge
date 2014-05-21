/**
 * UserData.js
 *
 * This object manages the user data. Data is organized by a user id and it is
 * a structured object for a specific game instance. This helps separate the API
 * interface from the actual data organization.
 *
 * Features:
 *   userDataObject: an object of key/value pairs held on behalf of the userId.
 *   levelDataArray: an array of level data, the index being the level number (-1) the data being an object.
 *   userAchievements: an array or earned achievements
 */

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
        userDataObject = this.getById(userId);
        if (userDataObject == null) {
            userDataObject = {userId: userId, userName: userName, password: password, email: email, ageCheck: ageCheck, userDataObject: {}, levelDataArray: [], userAchievements: []};
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
        var userDataObject = this.getById(userId);

        if (userDataObject == null) {
            userDataObject = this.addUser(userId, userName, password, email, ageCheck);
        } else {
            userDataObject.userName = userName;
            userDataObject.password = password;
            userDataObject.email = email;
            userDataObject.ageCheck = ageCheck;
            this.dataUpdatedFlag = true;
        }
        return userDataObject;
    },

    deleteUser: function (userId) {
        var i;
        var userExists = false;
        var userDataObject;

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
        var i;
        var userDataObject;
        var returnThisData = null;

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
        var i;
        var userDataObject;
        var returnThisData = null;

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

    count: function () {
        return this.userDataCollection.length;
    },

    setCurrentUser: function (userId) {
        this.currentUser = this.getById(userId);
        return this.currentUser;
    },

    getCurrentUser: function () {
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
        var gameSaveJson;
        var wasLoaded = false;

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
