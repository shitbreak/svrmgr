/**
 * Created by shenzhengyi on 2016/3/30.
 */
var rpc = require('rpc/GaiaRPC.js');
var Fiber = require('fibers');
var rpcapi = {};
var master_module = {};
var server = undefined;
var agents = {};
rpcapi.echo = function(res,args)
{
    res.send(0,args);
}
rpcapi.regAgent = function(res,port)
{
    var ip = res._conn._socket.remoteAddress;
    var arr = ip.split(":")
    if(arr && arr.length != 0)
        ip = arr[arr.length-1];

    var agentInfo = {};
    agentInfo.hostName = ip;
    agentInfo.agentProcs = [];
    agentInfo.conn=rpc.getClient(rpc.genEP(ip,port));
    agents[ip]=agentInfo;
    res.send(0);
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



function getAgent(hostName)
{
    return agents[hostName];
}

master_module.startNewProc = function(hostName,execFile,options)
{
    var agent = getAgent(hostName);
    if(!agent || !agent.conn)
        return false;
    var ret = agent.conn.callsync('startProc',execFile,options);
    if(ret && ret[0] == 0)
        return true;
    return false;
}

master_module.getProclist = function(hostName)
{
    var agent = getAgent(hostName)
    if(!agent || !agent.conn)
        return undefined;
    var ret = agent.conn.callsync('getProcMap');
    if(ret &&ret[0] == 0)
        return ret[1];
    return undefined;
}
master_module.killProc = function(hostName,pid)
{
    var agent = getAgent(hostName)
    if(!agent || !agent.conn)
        return false;
    var ret = agent.conn.callsync('killProc',pid);
    if(ret &&ret[0] == 0)
        return true;
    return false;
}

master_module.closeProc = function(hostName,pid)
{
    var agent = getAgent(hostName)
    if(!agent || !agent.conn)
        return false;
    var ret = agent.conn.callsync('closeProc',pid);
    if(ret &&ret[0] == 0)
        return true;
    return false;
}


master_module.listen = function(port)
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

module.exports = master_module;