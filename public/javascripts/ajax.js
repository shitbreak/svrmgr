/**
 * Created by shenzhengyi on 2016/3/30.
 */

var server_addr = "http://localhost:10001/users";

var selectLi = undefined;
var sendMsg = function(method,callback,args)
{
    $.post(server_addr, {action: method, args: JSON.stringify(args)}, function (data, status)
    {
        if (status != 'success')
            return;//TODO give a warning msg
        callback(data);
    });
}

var log = function (content, type)
{
    var p = $("<pre class='text-left' style='white-space: pre-wrap;word-break: break-all'> </pre>");
    $("#div_log").append(p);
    var flag = "INFO";
    if (!type || type == 1)
    {
        flag = "INFO "
        p.addClass("text-info");
    }
    else if (type == 2)
    {
        flag = "WARN "
        p.addClass("text-warning");
    }
    else
    {
        flag = "ERROR";
        p.addClass("text-danger");
    }
    var date = new Date();
    var timeStr = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    p.text("[" + flag + "] "+timeStr +": "  + content);
}

var formatRegExp = /%[sdj%]/g;
var format = function(f) {
    if (typeof f !== 'string') {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]));
        }
        return objects.join(' ');
    }

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
        if (x === '%%') return '%';
        if (i >= len) return x;
        switch (x) {
            case '%s': return String(args[i++]);
            case '%d': return Number(args[i++]);
            case '%j': return JSON.stringify(args[i++]);
            default:
                return x;
        }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
        if (x === null || typeof x !== 'object') {
            str += ' ' + x;
        } else {
            str += ' ' + inspect(x);
        }
    }
    return str;
};

function onSelectItem(item)
{
    var data = $(item).attr('data');
    var info = JSON.parse(data);
    $("#splmenu_ret").attr("value",info.desc+"("+info.exec+")");
    $("#splmenu_ret").attr("exec",info.exec);
    var formContainer = $("#form_input_proc_option");
    formContainer.empty();
    for(var i in info.argv)
    {
        var form = $("<div class='form-group'>"+
            "<label for='xxx' class='control-label'>Message:</label>"+
            "<input type='text' class='form-control' id='xxx'></div>");
        form.find("label").text(i+"("+info.argv[i]+")");
        form.find("input").attr("optionKey",i);
        formContainer.append(form);
    }
}
var onClickStartNewProc = function()
{
    var action =$("#splmenu_ret").attr("value");
    if(!action || action == "")
    {
        alert("xx");
        return;
    }
    var formContainer = $("#form_input_proc_option");
    var children = formContainer.children();

    var option = {};
    for(var i = 0;i<children.length;i++)
    {
        var child = $(children[i]).find("input");
        var val = child.val();
        if (!val || val == "")
        {
            alert("xx");
            return;
        }
        option[child.attr("optionKey")] = val;
    }
    startNewProc($("#splmenu_ret").attr("exec"),option);
}

var startNewProc = function(execFile,option)
{
    var hostName = selectLi.find('text').text();
    var argv ={"hostName":hostName,"execFile":execFile,"argv":option};
   sendMsg("startNewProc",function(data){
       if(data.result == 0)
           log("start process ok,this is info:"+JSON.stringify(argv));
       else
           log("start process failed,this is info:"+JSON.stringify(argv),3);

       $('#modal-container-start-new-proc').modal('toggle');
       refreshSelectServer();
   },argv);
}

var btnOperaClick = function (item)
{
    var btn = $(item);
    var info = JSON.parse(btn.parent().attr("data"));
    var hostName = selectLi.find('text').text();
    info.hostName = hostName;
    if (btn.attr("id") == 'btn_close')
        closeProc(info);
    else if (btn.attr("id") == 'btn_kill')
        killProc(info);
}
var closeProc = function (info)
{
    sendMsg("closeProc", function (data)
    {
        if (data.result == 0)
        {
            log("closeProcess ok,this is info:" + JSON.stringify(info));
            refreshSelectServer();
        }

    }, {"pid": info.pid,"hostName":info.hostName});
}
var killProc = function(info)
{
    sendMsg("killProc",function(data)
    {
        if (data.result == 0)
        {
            log("killProc ok,this is info:" + JSON.stringify(info));
            refreshSelectServer();
        }
    },{"pid":info.pid,"hostName":info.hostName});
}

//初始化可以开启的进程选择器
var initSplist = function ()
{
    sendMsg("getSplist",function(data)
    {
        var menu = $("#splmenu");
        for (var i in data)
        {
            var info = data[i];
            var a = $("<a role='menuitem' tabindex='-1' href='#' " +
                "onclick='javascripts:onSelectItem(this);return false;'></a>");
            var li = $("<li role='presentation'></li>");
            a.text(info.desc+"("+info.exec+")");
            a.attr('data',JSON.stringify(info));
            li.append(a);
            menu.append(li);
        }

        log("init proc list ok");
    });
}

var updateInfo = function(hostName)
{
    var tableColor = ['active','success','warning','danger','info']
   sendMsg("getProclist",function(data)
   {
       data.fields.opera = "Opera";
       var menu = $("#tb_proc_list");
       var head = menu.children("thead").children('tr');
       var body = menu.children("tbody");
       var foot = menu.children("tfoot");
       var btnGroupOpera = $("#btn_group_close");

       head.empty();
       body.empty();
       foot.empty();

       btnGroupOpera.show();
       for(var i in data.fields)
       {
           var th = $("<th></th>");
           th.text(data.fields[i]);
           head.append(th);
       }

       for(var i in data.data)
       {
           var info = data.data[i];
           var tr = $("<tr></tr>");
           tr.addClass(tableColor[parseInt(i%tableColor.length)]);
           for(var i in data.fields)
           {
               var td = $("<td></td>");
               tr.append(td);
               if(i == "opera")
               {
                   btnGroupOpera.attr("data",JSON.stringify(info));
                   td.append(btnGroupOpera.clone());
               }

               else
                   td.text(info[i]);
           }
           body.append(tr);
       }
       btnGroupOpera.hide();
       $('#head_info').text("INFO(" + hostName + ")");
       selectLi.find("span").text(data.data.length);
       var divider = $("<hr/>");
       foot.append(divider);

   },{"hostName":hostName});
}

var refreshSelectServer = function()
{
    if(!selectLi)
        return;
    var hostName = selectLi.find('text').text();
    updateInfo(hostName);
}
var onSelectServer = function(item)
{
    if(selectLi)
        selectLi.removeClass('panel-success');
    selectLi = $(item);
    selectLi.addClass('panel-success');
    var hostName = selectLi.find('text').text();
    updateInfo(hostName);
    log("change host to: "+hostName);
}

var initServerlist = function()
{
   sendMsg("getServerlist",function(data)
   {
       var menu = $("#pl_server_list");
       var tmp = $("#pl_server_list_ele");
       for(var i in data)
       {
           var info  = data[i];
           var li = tmp.clone();
           li.attr("id","ele_"+info.hostName);
           li.find("span").text(info.procNum);
           li.find("text").text(info.hostName);
           menu.append(li);
       }
       tmp.remove();

       log("init server list ok");
       //直接继续初始化第一个服务器的信息
       onSelectServer(menu.children("div").get(0));
   })
}

var registerHandles = function()
{
    $('#modal-container-start-new-proc').on('show.bs.modal',function(e)
    {
        $("#splmenu_ret").attr("value","");
        $("#form_input_proc_option").empty();
    });
}

$(document).ready(function(){
    registerHandles();
    initSplist();
    initServerlist();
});


