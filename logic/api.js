/**
 * Created by shenzhengyi on 2016/3/30.
 */
'use strict'
require('fibers/future');
var splist = require("../config/server_proc_list.js");


var api = {};

api.getSplist = function(res,args)
{
    res.send(splist);
}

api.getServerlist = function(res,args)
{
    var list = [];
    for(var i = 0; i < 3;i++)
    {
        var obj = {};
        obj.hostName = "127.0.0."+(i+1);
        obj.procNum  = i+3;
        obj.note = "new machine";
        list.push(obj);
    }
    res.send(list);
}

api.getProclist = function(res,args)
{
    var obj = {data:[],fields:{}};
    var ret = master.getProclist(args.hostName);
    if(ret)
    {

        obj.fields = {pid:"PID",execFile:"ExecFile",option:"Argv"};
        obj.data = ret;
        res.send(obj);
    }
    else
    {
        res.send(obj);
    }
}

api.startNewProc = function(res,args)
{
    var ret = master.startNewProc(args.hostName,args.execFile,args.argv);
    if(ret)
        res.send({"result":0});
    else
        res.send({"result":1});
}
api.closeProc = function(res,args)
{
    var ret = master.closeProc(args.hostName,args.pid);
    if(ret)
        res.send({"result":0});
    else
        res.send({"result":1});
}
api.killProc = function(res,args)
{
    var ret = master.killProc(args.hostName,args.pid);
    if(ret)
        res.send({"result":0});
    else
        res.send({"result":1});
}

api.getConfig = function (res, args)
{
    var ret = master.getConfig(args.hostName);
    if (ret)
        res.send({"result": 0, data: ret});
    else
        res.send({"result": 1});
}

api.saveConfig = function (res, args)
{
    var ret = master.saveConfig(args.hostName, args.config);
    if (ret)
        res.send({"result": 0});
    else
        res.send({"result": 1});
}

for(var key in api)
{
    var func = api[key];
    if(typeof func == 'function')
    {
        api[key] = func.future();
    }
}
module.exports = api;