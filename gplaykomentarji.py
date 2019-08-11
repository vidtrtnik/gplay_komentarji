import subprocess
import urllib.request
import os
import json
import ast
import re

categories = ['GAME_ACTION', 'GAME_SPORTS', 'GAME_RACING'];
collections = ['TOP_FREE', 'TOP_PAID'];

words = ["controller", "control", "controls", "button", "buttons", "joystick", "keys", "movement", "interface", "layout", "touch"]

try:
    os.mkdir('./apps')
    os.mkdir('./apps/GAME_ACTION');
    os.mkdir('./apps/GAME_SPORTS');
    os.mkdir('./apps/GAME_RACING');
    os.mkdir('./apps/GAME_ACTION/TOP_FREE');
    os.mkdir('./apps/GAME_ACTION/TOP_PAID');
    os.mkdir('./apps/GAME_SPORTS/TOP_FREE');
    os.mkdir('./apps/GAME_SPORTS/TOP_PAID');
    os.mkdir('./apps/GAME_RACING/TOP_FREE');
    os.mkdir('./apps/GAME_RACING/TOP_PAID');
except:
    print('-');
    
filenames = []
globalScores = []

for cat in categories:
    for col in collections:
        print(cat + " --> " + col)
        p1 = subprocess.Popen(["node", "getList.js", cat, col], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        out1, err1 = p1.communicate()
        out1C = [s.strip() for s in out1.splitlines()]

        datoteke = []
        for s in out1C:
            datoteke.append(s.decode("utf-8"))

        print(datoteke)

        reviews = []
        for d in datoteke:
            with open(d) as f:
                info = json.load(f)

                appid = info['appId']
                title = info['title']
                pages = info['pages']
                score = info['score']
                screenshots = info['screenshots']

                print('Procesiranje: ' + d + "\t" + appid)
                lastPage = -1;
                for i in range(0, pages):
                    print('Stran ' + str(i) + ' od ' + str(pages))
                    p2 = subprocess.Popen(["node", "getRevPage.js", appid, str(i), cat, col], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                    out2, err2 = p2.communicate()

                    if 'END_OF_PAGES' in str(out2):
                        print('KONEC OPISOV PRI STRANI: ' + str(i))
                        lastPage = i
                        break

                for i in range(0, lastPage):
                    pagFN = './apps/' + cat + '/' + col + '/' + appid + '/' + str(i) + '.JSON'
                    with open(pagFN, encoding="utf8", errors='ignore') as revs:
                        content = revs.read().replace('\n', '')
                        jcontent = json.loads(content)
                        for j in jcontent:
                            reviews.append(json.dumps(j))
                            
                screenshotsPath = './apps/' + cat + '/' + col + '/' + appid + '/' + 'screenshots'
                try:
                    os.mkdir(screenshotsPath)
                except:
                    print('-')
                for i in range(0, len(screenshots)):
                    print('Prenos slike ' + str(i+1) + " od " + str(len(screenshots)))
                    scrUrl = screenshots[i]
                    urllib.request.urlretrieve(scrUrl, screenshotsPath + "/screenshot" + str(i) + ".jpg")
                    
                    
                globalScores.append(score)
                
            revFN = './apps/' + cat + '/' + col + '/' + appid + '/REVIEWS.JSON'
            with open(revFN, 'w', encoding="utf8", errors='ignore') as f:
                f.write("%s\n" % reviews)
                filenames.append(revFN)
                
# ------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------------------------

i=0
for filename in filenames:
    globalScore = globalScores[i]
    print(str(i))
    i+=1
    targets = []
    scores = []

    appid = filename.split('/')[len(filename.split('/'))-2]
    print(appid)

    with open(filename, encoding="utf8", errors='ignore') as content:
        with open(filename + ".UI.TXT", 'w', encoding="utf8", errors='ignore') as f:
            content = content.read().replace("\n", "")
            reviews = ast.literal_eval(content)
            for rev in reviews:
                jsonRev = json.loads(rev)

                for word in words:
                    if word in jsonRev['revText'].lower():
                        #print(word + "\t--->\t" + jsonRev['revText'] + "\t(SCORE: " + str(jsonRev['revScore']) + ")")
                        targets.append(jsonRev)
                        scores.append(jsonRev['revScore'])

                        f.write("%s\n" % jsonRev['revId'])
                        f.write("%s\n" % jsonRev['revText'])
                        f.write("%s\n" % jsonRev['revScore'])
                        f.write("%s\n\n\n" % "")
                        break
                
    score = 0
    for s in scores:
        score += s
    score = score / len(scores)
    print("-------------------------------------------------------------")
    print(appid + "\t--->\t" + str(score) + "\tGLOBAL SCORE: " + str(globalScore))
