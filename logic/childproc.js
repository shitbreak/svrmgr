/**
 * Created by shenzhengyi on 2016/3/31.
 */
var Fiber = require('fibers');
var spawn = require('child_process').spawn;

var cpmap = {};

function ChildProc(app)
{
    this.app = app;
}

ChildProc.Create = function(cmd,argv)
{
    var app = spawn(cmd,argv,{stdio:[null,null,null,'ipc']});
    var fiber = Fiber.current;
    if(app.pid == 0)
        return undefined;
    var cp = new ChildProc(app);
    cp.fiber = fiber;
    cp.cmd = cmd;
    cp.argv = argv;
    cp.killed = false;
    app.on('error',function(data){cp.onError(data);});
    app.on('exit',function(data){cp.onExit(data)});
    app.on('close',function(data){cp.onClose(data)});
    app.on('disconnect',function(data){cp.onDisconnect(data)});
    app.on('message',function(data){cp.onMessage(data)});
    Fiber.yield();
    cpmap[app.pid] = cp;
    console.log(argv.toString()+"(pid：%d） is created",app.pid);
    return cp;
}
ChildProc.GetCPMap = function() {return cpmap;}
ChildProc.Remove = function (pid)
{
    if(cpmap.hasOwnProperty(pid))
        delete cpmap[pid];
}
ChildProc.Close = function (pid)
{
    var cp = cpmap[pid];
    if (cp)
    {
        cp.app.kill('SIGTERM');
        console.log(cp.argv.toString()+"(pid：%d） is closed",pid);
        return true;
    }
    return false;
}
ChildProc.Kill = function (pid)
{
    var cp = cpmap[pid];
    if (cp)
    {
        cp.app.kill('SIGKILL');
        console.log(cp.argv.toString()+"(pid：%d） is killed",pid);
        return true;
    }
    return false;
}

ChildProc.prototype.onError = function (data)
{
    console.log("onError:" + data + this.argv.toString());
    //发生错误直接杀掉
    ChildProc.Kill(this.app.pid);
}
ChildProc.prototype.onExit = function (data)
{
    ChildProc.Remove(this.app.pid);
    console.log('onExit:' + data + "("+this.argv.toString()+")");
}
ChildProc.prototype.onClose = function (data)
{
    ChildProc.Remove(this.app.pid);
    console.log('onClose:' + data + "("+this.argv.toString()+")");
}
ChildProc.prototype.onDisconnect = function (data)
{
    ChildProc.Remove(this.app.pid);
    console.log('onDisconnect:' + data + "("+this.argv.toString()+")");
}
ChildProc.prototype.onMessage = function(data)
{
    if(data.toString() == "ok")
    {
        this.fiber.run();
        return;
    }
}
ChildProc.prototype.sendMsg = function(data)
{
   this.childProc.send(data);
}
module.exports = ChildProc;