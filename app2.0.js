const rp = require('request-promise')
const cheerio = require('cheerio');
const requestM = require('request');
const fs = require('fs');
let j =0
let picUrl = []
let picName = []

for(let i= 0;i<76;i++){
    let Url = 'http://www.meisupic.com/topic.php?topic_id='
    let reurl = Url + i
    // console.log(reurl)
    request(reurl)
}
// 只处理请求
function request(url){
    rp(url)
    .then(function (htmlString) {
        j++
        // console.log('正确'+j + url)
        htmlParse(htmlString)
    })
    .catch(function (err) {
        j++
        // console.log('错误' + j)
        request(url)
    })
}

// 负责解析
function htmlParse(body) {
    let $ = cheerio.load(body)
    let pichref = $('.imgList .imgItem a img')
    let picname = $('.ui_cover dl')
    twojiexi(pichref,picname)
}

function twojiexi(aurl, aname){
    for(let i = 0; i < aurl.length; i++) {
        let downpichref = aurl[j].attribs['data-original']
        let downpicname = aname[j].attribs.title
        picUrl.push(downpichref)
        console.log('解析到的url数量'+ picUrl.length)
        picName.push(downpicname)
    }
}

// 负责下载

// let l=0
// function downloadImg() {
//     let url = picUrl.pop()
//     console.log('9900'+url)
//     let filename = picName.pop()
//     let referer = {'Referer': 'http://www.mzitu.com/103478'};
//     var stream = fs.createWriteStream('./images/' + filename);

//     requestM({url:url, headers: referer}).on('error',function(){
//         console.log('done no');
//     }).pipe(stream).on('close',function(){
//         l++
//         console.log(l + '张已完成')
//         if(picName.length>0){
//             downloadImg()
//         } else{
//             console.log('全部完成')
//         }
        
//     })
// }
// setTimeout(downloadImg,3000)


let k = 0
function save() {
    if(picUrl.length>0){
        let line;
        name = picUrl.pop();
        src = picName.pop();
        line = `${name.replace(/\n/g, '')},${src}`;
        fs.appendFile('./data/url.csv', `${line}\n`, 'utf8', (err) => {
            if (err) {
                console.log(err)
            } else {
                console.log('已成功爬取'+ k + '条')
                k = k + 1
                save()
            }
            
        });
    } else{
        console.log('已经完成全部,请到data目录下的url.csv内查看')
    }
    

}
setTimeout(save,5000)