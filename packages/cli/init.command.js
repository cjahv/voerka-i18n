
/**
 * 初始化指定项目的语言包
 */


const path = require("path")
const fs = require("fs")
const { t } = require("./i18nProxy")
const createLogger = require("logsets")
const logger = createLogger() 
const { installPackage } = require("@voerkai18n/utils")
const artTemplate = require("art-template")

function getLanguageList(langs,defaultLanguage){
    try{
        const available_languages = require("./available_languages")
        if(defaultLanguage in available_languages){
            return langs.map(lng=>{
                const langIndex = available_languages[defaultLanguage].findIndex(l=>l.name===lng)
                if(langIndex > -1 ){
                    return {
                        name:lng,
                        title:available_languages[defaultLanguage][langIndex].title 
                    }
                }else{                    
                    return {
                        name:lng,
                        title:lng 
                    }
                }                
            })   
        }else{
            return langs.map(lng=>({name:lng,title:lng}))
        }        
    }catch(e){
        return langs.map(lng=>({name:lng,title:lng}))
    }
}


module.exports = function(srcPath,{moduleType='cjs',isTypeScript,debug = true,languages=["zh","en"],defaultLanguage="zh",activeLanguage="zh",reset=false}={}){
    let settings = {}
    let tasks = logger.tasklist("初始化VoerkaI18n工程")
    const  langFolderName = "languages"
    // 查找当前项目的语言包类型路径
    const lngPath = path.join(srcPath,langFolderName)

    // 语言文件夹名称
    try{
        tasks.add("创建语言包文件夹")

        if(!fs.existsSync(lngPath)){
            fs.mkdirSync(lngPath)
            if(debug) logger.log(t("创建语言包文件夹: {}"),lngPath)
        }    
        tasks.complete()
    }catch(e){
        tasks.error(e.message)
    }
    
    // 创建settings.json文件
    try{
        tasks.add("生成语言配置文件settings.json")
        const settingsFile = path.join(lngPath,"settings.json")
        if(fs.existsSync(settingsFile) && !reset){
            if(debug) logger.log(t("语言配置文件{}文件已存在，跳过创建。\n使用{}可以重新覆盖创建"),settingsFile,"-r")
            tasks.skip()
            return 
        }
        settings = {
            languages:getLanguageList(languages,defaultLanguage),
            defaultLanguage,
            activeLanguage,
            namespaces:{}
        }    
        // 写入配置文件
        fs.writeFileSync(settingsFile,JSON.stringify(settings,null,4))
        tasks.complete()
    }catch(e){
        tasks.error(e.message)
    }    
    
    // 生成一个语言初始化文件,该文件在执行extract/compile前提供访问t函数的能力
    try{
        tasks.add("初始化语言上下文")
        const templateContext = {
            moduleType
        }
        const entryContent = artTemplate(path.join(__dirname,"templates",`init-entry.${isTypeScript ? 'ts' : 'js'}`), templateContext )
        fs.writeFileSync(path.join(lngPath,`index.${isTypeScript ? 'ts' : 'js'}`),entryContent)
        tasks.complete()
    }catch(e){
        tasks.error(e.message)
    } 

    try{
        tasks.add(t("安装运行时依赖@voerkai18n/runtime"))
        installPackage('@voerkai18n/runtime')
        tasks.complete()
    }catch(e){
        tasks.error(e.message)
        console.error(e.stack)
    } 
        
    if(debug) {
        logger.log(t("生成语言配置文件:{}"),"./languages/settings.json")
        logger.log(t("拟支持的语言：{}"),settings.languages.map(l=>l.name).join(","))
        logger.log(t("已安装运行时:{}"),'@voerkai18n/runtime')
        logger.log(t("初始化成功,下一步："))
        logger.log(t(" - 编辑{}确定拟支持的语言种类等参数"),"languages/settings.json")
        logger.log(t(" - 运行<{}>扫描提取要翻译的文本"),"voerkai18n extract")
        logger.log(t(" - 运行<{}>编译语言包"),"voerkai18n compile")
    } 
} 