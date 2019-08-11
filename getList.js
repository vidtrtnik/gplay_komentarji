var gplay = require('google-play-scraper');
var fs = require('fs');
var mkdirp = require('mkdirp')

function getList(cat, col, n)
{
  return new Promise(function(resolve, reject) {
    gplay.list({
        category: cat,
        collection: col,
        num: n,
        fullDetail: true,
        throttle: 10
      }).then(function(res){
        resolve(res);
      })
  })
}

var categoriesT = ['GAME_ACTION', 'GAME_SPORTS', 'GAME_RACING'];
var collectionsT = ['TOP_FREE', 'TOP_PAID'];
var categories = [gplay.category.GAME_ACTION, gplay.category.GAME_SPORTS, gplay.category.GAME_RACING];
var collections = [gplay.collection.TOP_FREE, gplay.collection.TOP_PAID];
var N = 3;

catInd = -1;
colInd = -1;

process.argv.forEach(function (val, index, array) {
  if(categoriesT.indexOf(val) > -1)
  {
    catInd = categoriesT.indexOf(val);
  }
  if(collectionsT.indexOf(val) > -1)
  {
    colInd = collectionsT.indexOf(val)
  }
});

if(catInd == -1 || colInd == -1)
{
  console.log("NAPAKA: NAPACNI ARGUMENTI");
  return;
}

// DOBI TOP N APLIKACIJ
getList(categories[catInd], collections[colInd], N)
    .then(function(list){
      for(var i=0; i < list.length; i++)
      {
        var obj = list[i];
        var appId = obj['appId'];
        var title = obj['title'];
        var icon = obj['icon'];
        var score = obj['score'];
        var screenshots = obj['screenshots']
        var version = obj['version'];

        var numOfReviews = obj['reviews'];
        var pages = numOfReviews;
        //var pages = Math.floor(numOfReviews / 40); // 40 rev per page

        var newObj = {};
        newObj['appId'] = appId;
        newObj['title'] = title;
        newObj['icon'] = icon;
        newObj['score'] = score;
        newObj['pages'] = pages;
        newObj['screenshots'] = screenshots;
        newObj['version'] = version;

        var folder = './apps/' + categoriesT[catInd] + '/' + collectionsT[colInd] + '/' + appId;
        var fname = folder + '/' + 'INFO.JSON'; // + '_' + title + '.JSON'
        //console.log("---------------------------------------------------------------------------------------------------")
        console.log(fname);
        mkdirp(folder);
        //console.log(newObj);
        fs.writeFile(fname, JSON.stringify(newObj), function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    });
