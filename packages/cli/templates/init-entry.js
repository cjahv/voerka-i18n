/**
 * 初始化入口
 * 
 * 本文件仅供在执行voerkai18n extract&compile前提供t函数引用
 * 
 */
{{if moduleType === "esm"}}
import runtime from "@voerkai18n/runtime"
const { translate,VoerkaI18nScope  } = runtime
{{else}}
const { translate,i18nScope  } =  require("@voerkai18n/runtime")
{{/if}} 
 

// 语言作用域
const scope = new VoerkaI18nScope({
    id          : "{{scopeId}}",                    // 当前作用域的id，自动取当前工程的package.json的name
    debug       : false,                            // 是否在控制台输出高度信息
    default     : {},                  // 默认语言包
    messages    : {},                   // 当前语言包
    idMap       : {},                       // 消息id映射列表    
    formatters,                                     // 扩展自定义格式化器    
    loaders     : {}                                        // 语言包加载器
}) 
// 翻译函数
const scopedTtranslate = translate.bind(scope) 
{{if moduleType === "esm"}}
export { 
    scopedTtranslate as t, 
    scope as i18nScope
}
{{else}}
module.exports.t = scopedTtranslate
module.exports.i18nScope = scope 
{{/if}}
