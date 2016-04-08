/**
 * Created by shenzhengyi on 2016/3/30.
 */
module.exports = {
    datacacaheserver:{exec:"datacacheserver.js",PRL:0,desc:"数据缓存服务器",argv:{"-p":"侦听端口"}},
    dsdataserver:{exec:"dsdataserver.js",PRL:1,desc:"ds数据服务器",argv:{"-p":"侦听端口"}},
    app:{exec:"app.js",desc:"前端服务器",PRL:2,argv:{"-p":"侦听端口"}},
    ds_agent_server:{exec:"ds_agent_server.js",PRL:3,desc:"ds服务器代理",
        argv:{"-i":"唯一id","-h":"外网ip","-p":"侦听端口","-b":"ds分配起始端口","-e":"ds分配结束端口"}},
    gmserver:{exec:"gmserver.js",PRL:4,desc:"gm服务器",argv:{"-p":"侦听端口"}},
    logserver:{exec:"logserver.js",PRL:5,desc:"日志服务器",argv:{"-p":"侦听端口"}}
}