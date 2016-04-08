/**
 * Created by shenzhengyi on 2016/3/30.
 */
var child = require('child_process').spawn('node',['child.js'],{stdio:[null,null,null,'ipc']});
child.on('message',function(data){
   console.log("message:"+data.toString());
});
child.on('error',function(data){
   console.log('error:'+data);
});
child.on('close',function(data){
   console.log('close:'+data.toString());
});
child.on('disconnect',function(data){
   console.log('disconnet:'+data.toString());
});

//child.stdout.on('data',function(data){
//   console.log('app stdout:'+data.toString());
//});
console.log("app start,%d",child.pid);

var tick = function()
{
   child.send("tick");
};
setInterval(tick,1000);