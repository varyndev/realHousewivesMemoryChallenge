/**
 * Created by user on 7/14/14.
 */

function runTests() {
    // Use this method to perform all unit tests

    // return; // tests are off for now.

    var testNum = 0,
        testData,
        a,
        ri,
        i;

    testNum ++;
    testData = MemoryMatch.queryStringToObject('http://www.xyz.com/test.php?test=1&value=2&reg=this+is+a+test&grip=supercalofraga');
    MemoryMatch.debugLog("Test", testNum, "Expect:", '{"test":"1","value":"2","reg":"this+is+a+test","grip":"supercalofraga"}');
    MemoryMatch.debugLog("Test", testNum, "Result:", JSON.stringify(testData));

    testNum ++;
    testData = MemoryMatch.tokenReplace("This is %TEST% on object %OBJ% for real.", {TEST: "a test", OBJ: "my object"});
    MemoryMatch.debugLog("Test", testNum, "Expect:", 'This is a test on object my object for real.');
    MemoryMatch.debugLog("Test", testNum, "Result:", testData);

    testNum ++;
    ri = MemoryMatch.getRandomNumberBetweenButNot(1,3,2);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{%d} number between 1 and 3 but not 2');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);

    testNum ++;
    a = MemoryMatch.shuffleAllCardsUniqueDeck(1, 8, 8);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{%a} array of 8 numbers, no duplicates');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));

    testNum ++;
    a = MemoryMatch.makeMonteDeck(1, 3, 3);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[2,1,2]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));
    a = MemoryMatch.makeMonteDeck(1, 5, 5);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[2,2,1,2,2]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));
    a = MemoryMatch.makeMonteDeck(3, 3, 9);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[2,2,2,2,1,2,2,2,2]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));

    testNum ++;
    a = MemoryMatch.makeShuffledBag(150, 1, 4, 3);
    MemoryMatch.debugLog("Test " + testNum + " makeShuffledBag Expect: " + '[array of 150 items 1-4 no more than 3 repeat]');
    MemoryMatch.debugLog("Test " + testNum + " makeShuffledBag Result: " + JSON.stringify(a));

    testNum ++;
    for (i=0; i < 10; i ++) {
        a = MemoryMatch.shuffleUniqueDeck(i, i + 12);
        MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{%a} array of 13 numbers, ' + i + '-' + (i+12) + ', no duplicates');
        MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));
    }

    testNum ++;
    testData = MemoryMatch.makeResolutionBasedFileNameFromFileName("file1.jpg");
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'file1-50.jpg');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);
    testData = MemoryMatch.makeResolutionBasedFileNameFromFileName("file");
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'file-50');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);
    testData = MemoryMatch.makeResolutionBasedFileNameFromFileName("file.file.file.png");
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'file.file.file-50.png');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);
    testData = MemoryMatch.makeResolutionBasedJsonFileFromFileName("file.png");
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'file-50.json');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);

    // Validate our Min/Max logic
    testNum ++;
    i = 0;
    testData = Math.min(i || 1, 10);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '1');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);
    i = null;
    testData = Math.min(i || 1, 10);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '1');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);
    i = 7;
    testData = Math.min(i || 1, 10);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '7');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);
    i = 99;
    testData = Math.min(i || 1, 10);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '10');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + testData);

    // Achievements unit tests
    testNum ++;
    MemoryMatch.restoreUsers();
    testData = MemoryMatch.achievementEarned(5);
    i = MemoryMatch.achievementEarned(7);
    ri = MemoryMatch.achievementEarned(19);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[true,true,true]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify([testData,i,ri]));
    testNum ++;
    testData = MemoryMatch.didUserEarnAchievement(5);
    i = MemoryMatch.didUserEarnAchievement(19);
    ri = MemoryMatch.didUserEarnAchievement(20);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[true,true,false]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify([testData,i,ri]));
    testNum ++;
    a = MemoryMatch.getUserAchievements();
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[5,7,19]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));

    testNum ++;
    a = MemoryMatch.getVendorPrefix();
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '<string> or null');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + a);
    a = MemoryMatch.isDocumentHidden();
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'false');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));
    a = MemoryMatch.getVisibilityChangeEvent();
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'visibilitychange (or vendor prefix)');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + a);

    testNum ++;
    ri = MemoryMatch.getQueryStringValue('level');
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '2');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);

    testNum ++;
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(1);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:1,gameNumber:1}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(7);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:1,gameNumber:99}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(10);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:2,gameNumber:3}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(13);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:2,gameNumber:6}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(14);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:2,gameNumber:99}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(28);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:4,gameNumber:99}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    ri = MemoryMatch.convertLevelNumberToLevelAndGameNumber(78);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '{levelNumber:4,gameNumber:99}');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));

    testNum ++;
    a = MemoryMatch.UserData.setUserTipSeen(3);
    ri = MemoryMatch.UserData.getUserTips();
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + '[false,false,true]');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(ri));
    a = MemoryMatch.UserData.isUserTipSeen(3);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'true');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));
    a = MemoryMatch.UserData.isUserTipSeen(2);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'false');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));
    a = MemoryMatch.UserData.isUserTipSeen(1);
    MemoryMatch.debugLog("Test " + testNum + " Expect: " + 'false');
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(a));

    testNum ++;
    ri = MemoryMatch.formatNumberWithGroups(900);
    MemoryMatch.debugLog("Test " + testNum + " Expect: 900");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(-900);
    MemoryMatch.debugLog("Test " + testNum + " Expect: -900");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(900900900900);
    MemoryMatch.debugLog("Test " + testNum + " Expect: 900,900,900,900");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(-900900900900);
    MemoryMatch.debugLog("Test " + testNum + " Expect: -900,900,900,900");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(9009);
    MemoryMatch.debugLog("Test " + testNum + " Expect: 9,009");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(-9009);
    MemoryMatch.debugLog("Test " + testNum + " Expect: -9,009");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(90909);
    MemoryMatch.debugLog("Test " + testNum + " Expect: 90,909");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);
    ri = MemoryMatch.formatNumberWithGroups(-90909);
    MemoryMatch.debugLog("Test " + testNum + " Expect: -90,909");
    MemoryMatch.debugLog("Test " + testNum + " Result: " + ri);

    testNum ++;
    MemoryMatch.debugLog("Test " + testNum + " Expect array with 3 values: [10%,40%,50%]");
    a = [10,40,50];
    testData = [];
    for (i = 0; i < 1000; i ++) {
        ri = MemoryMatch.getRandomValueFromProbabilitySet(a);
        if (testData[ri] == null) {
            testData[ri] = 1;
        } else {
            testData[ri] ++;
        }
    }
    MemoryMatch.debugLog("Test " + testNum + " Result: " + JSON.stringify(testData));
}

