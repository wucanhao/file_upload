module.exports=function CALLJSON(url,data,sucess,error){
    $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(data),
        contentType:'application/json;charset=utf-8',
        dataType: 'json',
        success: function(data){
            if(sucess!=undefined){
                sucess(data);
            }
        },
        error:function (data) {
            if(error!=undefined){
                error(data);
            }
        }
    })
}
function CALL(url,data,sucess,error){
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        contentType:'application/x-www-form-urlen',
        dataType: 'json',
        success: function(data){
            if(sucess!='undefined'){
                sucess(data);
            }
        },
        error:function (data) {
            if(error!='undefined'){
                error(data);
            }
        }
    })
}