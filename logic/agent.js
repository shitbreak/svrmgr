/**
 * Created by shenzhengyi on 2016/3/30.
 */
var rpc = require('rpc/GaiaRPC.js');
var Fiber = require('fibers');
var Future = require('fibers/future');
var childproc = require('./childproc.js');
var path = require('path');
var rpcapi = {};
var server = undefined;
var master = undefined;
var baseUrl = path.normalize('D:/shenzhengyi.dev/TrunkDm/GaiaWeb/DmGame');
var port = 10003;
var config = undefined;

rpcapi.echo = function(res,args)
{
    res.send(0,args);
}

rpcapi.startProc = function(res,file,option)
{
    process.chdir(baseUrl);
    var op = [];
    op.push(file);
    for(var i in option)
    {
        op.push(i);
        op.push(option[i]);
    }
    var cp = childproc.Create('node',op)
    if(cp)
        res.send(0);
    else
        res.send(1);
}

rpcapi.closeProc = function(res,pid)
{
    res.send(childproc.Close(pid));
}

rpcapi.killProc = function(res,pid)
{
    res.send(childproc.Kill(pid));
}

rpcapi.syncConfig = function (res, cfg)
{
    baseUrl = cfg.baseUrl;
    config = cfg;
    res.send(0);
}

rpcapi.getProcMap = function(res)
{
    var map = childproc.GetCPMap();
    var obj = [];
    for(var i in map)
    {
        var child = map[i];
        var info = {};
        info.pid = i;
        info.execFile = child.argv[0];
        info.option = "";
        for(var i = 1;i<child.argv.length;i++)
        {
            info.option += (child.argv[i] + " ");
        }
        obj.push(info);
    }
    res.send(0,obj);
}
rpcapi.allStart = function()
{

}
rpcapi.allKill = function()
{

}
rpcapi.allRestart = function()
{

}

rpcapi.updateConfig = function()
{

}

function bindMethod(method)
{
    var api = rpcapi[method];
    server.bind(method, function ()
    {
        var args = arguments;
        Fiber(function ()
        {
            try {
                api.apply(undefined, args);
            } catch (e) {
                console.log(e.stack);
                var res = args[0];
                res.send(-1);
            }
        }).run();
    });
}

var reg2master = function()
{
    var ret = master.callsync("regAgent",port);
    if(ret && ret[0] == 0)
        console.log("succeed to master");
    else
        console.error("failed to reg to master");
}.future();

var listen = function(port)
{
    if(server)
        return;
    server = rpc.createServer();
    for(var func in rpcapi)
    {
        bindMethod(func.toString());
    }
    server.start(port);
}

function main()
{
    master = rpc.getClient(rpc.genEP('127.0.0.1',10002));
    listen(port);
    console.log("agent is listening at 10003");
    reg2master();
}
main();