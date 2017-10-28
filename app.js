const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
// 上面三行代码是导入我们所需的三个模块
// 下面的代码,我将会用最简单的js代码书写,会显得比较low,请见谅!
/*
 * http://www.meisupic.com/topic.php?topic_id=1
 * http://www.meisupic.com/topic.php?topic_id=5
 * http://www.meisupic.com/topic.php?topic_id=20
 * 分析上面的代码,可将代码分成两部分,
 * http://www.meisupic.com/topic.php? 与 topic_id=1
 * 由于我们不知道这个网址具体有多少个子页面,所以我们可以去
 * http://www.meisupic.com/topic.php上将他全部的子页面爬取下来
 * 再次进行抓取
 */
// 主站地址
let Url = 'http://www.meisupic.com/topic.php'
// request 负责请求
request({url : Url}, function (err, res, body) {
    if (err) {
        console.log(err)
    } else {
/*
 *  cheerio模块负责html的解析,有兴趣的可以直接在上面打印body,这里只需要把
 *  返回的body load进去就可以进行解析了.
 *  cheerio的用法很简单,和JQuery一样,使用时只需要使用jq的语法就可以解析html了
 */   
        let $ = cheerio.load(body)
        let href = $('.album_page .glide .slide dl a')
/*
 *  简单的使用方法是 $('class名称'),只需要定位到网页中你需要的元素即可
 *  上面的代码是将dl下所有的a标签全部选出来,放到一个叫href的数组里
 */       
        for(let i = 0; i<href.length;i++){                  //这里是对href这个数组做简单的循环简历,js大牛们请自行修改,教学会使用最简单的
            let picUrl = href[i].attribs.href               //这里是选出a标签中的href属性
            let reUrl ='http://www.meisupic.com/' +picUrl   //你可以在这里将picUrl打印出来,它并不是完整的url,所以我们要做拼接
/*
 *  此处做了简单的header伪装,但header伪装还有很多参数我没有写上,比如说有些网址是有防盗链的,那我们就要伪造一个referer来破解防盗链
 */               
            request({
                url:reUrl,
                method: 'GET',
                headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36'}
            }, function (err, response, body) {
                let $ = cheerio.load(body)
                let pichref = $('.imgList .imgItem a img')
                let picname = $('.ui_cover dl')
                for(let j=0;j<pichref.length;j++){
                   let downpichref = pichref[j].attribs['data-original']
                   let downpicname = picname[j].attribs.title
                   save(downpicname, downpichref)
/*  以下代码是调用下载程序的,不建议调用,会给网站造成很多流量浪费.
                   downloadImg(downpichref, downpicname, function () {
                    console.log(downpicname + 'upload 完成');
                });

 */
                }
            })
        }
    }
})
/*
 *  下面的代码是使用fs去保存文本,我并没有真正的去下载这些图片,
 *  考虑到版权以及下载图片会增加花瓣网站的流量,
 *  我只是简单的将链接保存在了一个csv文件里
 *  还可以使用mongoose链接上mongoDB,存数据库里.
 *  那如果我们要下载要怎么写呢?可以用pipe通道,或者是使用专用的下载模块去下载,
 *  毕竟node的模块这么多
 */
let k = 0
function save(x, y) {
    let line;
    name = x;
    src = y;
    line = `${name.replace(/\n/g, '')},${src}`;
    fs.appendFile('./data/url.csv', `${line}\n`, 'utf8', (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('已成功爬取'+ k + '条')
            k = k + 1
        }
        
    });

}
/*
 *  此处为保存url的代码,只需要在上面的函数中调用就可以了
 */   

function downloadImg(url, filename, callback) {
    var stream = fs.createWriteStream('./images/' + filename);
    request({url:url}).on('error',function(){
        console.log('done no');
    }).pipe(stream).on('close', callback);
/*
 *  这段是下载function的代码
 *  有兴趣的可以自己研究
 */   
}


/*
 *  代码没有使用es6,7的新特性,有兴趣的朋友可以自己修改代码,只要原理清楚就可以了
 *  后期会推出node爬虫更详细的教程,我会将此代码开源到github,大家一定去我的github看看,
 *  记得给个start,别问为什么,你会懂的!
 */   