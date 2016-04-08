/**
 * Created by shenzhengyi on 2016/3/31.
 */
process.on('message',function(data){
    console.log('got msg:'+data);
})
var tick = function()
{
   process.send("tick");
};
setInterval(tick,1000);
process.send("ok");
