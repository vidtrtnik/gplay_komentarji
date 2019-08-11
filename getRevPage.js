var gplay = require('google-play-scraper');
var fs = require('fs');
var mkdirp = require('mkdirp');

function getReviews(id, p, s) {
    return new Promise(function (resolve, reject) {
        gplay.reviews({
            appId: id,
            page: p,
            sort: s,
            throttle: 10
        }).then(function (res) {
            resolve(res);
        });
    });
}
var categoriesT = ['GAME_ACTION', 'GAME_SPORTS', 'GAME_RACING'];
var collectionsT = ['TOP_FREE', 'TOP_PAID'];

var appid = "";
var page = -1;
var catInd = -1;
var colInd = -1;

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        appid = val;
    }

    if (index == 3) {
        page = val;
    }

    if (categoriesT.indexOf(val) > -1) {
        catInd = categoriesT.indexOf(val);
    }
    if (collectionsT.indexOf(val) > -1) {
        colInd = collectionsT.indexOf(val);
    }
});

if (page < 0 || page === undefined) {
    console.log("NAPAKA: NAPACNI ARGUMENTI");
    return -1;
}

var reviewsObj = [];

// DOBI TOP N APLIKACIJ
getReviews(appid, page, gplay.sort.HELPFULNESS)
    .then(function (res) {
        for (var i = 0; i < res.length; i++) {
            var rev = res[i];

            var revId = rev['id'];
            var revScore = rev['score'];
            var revText = rev['text'];
            revText = revText.replace(/[^a-zA-Z0-9.,--:+?()&%$#! ]+/ig, '');

            var newRev = {};
            newRev['appId'] = appid;
            newRev['revId'] = revId;
            newRev['revScore'] = revScore;
            newRev['revText'] = revText;

            reviewsObj.push(newRev);
        }

        if (reviewsObj.length < 1 || page > 2) {
            console.log("END_OF_PAGES");
        }


        var folder = './apps/' + categoriesT[catInd] + '/' + collectionsT[colInd] + '/' + appid;
        var fname = folder + '/' + page + '.JSON'; // + '_' + title + '.JSON'
        //console.log("---------------------------------------------------------------------------------------------------")
        //console.log(fname);
        mkdirp(folder);
        fs.writeFile(fname, JSON.stringify(reviewsObj), function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
