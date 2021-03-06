
//give colors to constant value 
const color1 = '#000000' ;//'#e0e2e5';
const color2 = '#ffffff' ;//'#00ff00';
const color3 ='#0000ff' ;//'#0000ff';
const meremsgkacolor = '#af1d1d' ;
const teremsgkacolor = '#c66e01';


var socket = io();


var timeout;
var partner_id , partner_username , partner_avatar , my_id;
var audio = new Audio('static/sounds/notif.mp3');

$("#messages").scrollTop($("#messages")[0].scrollHeight);
$('#partnername').html(" ");
$('#partnerimg').attr("src"," ");
$('#m').css("pointer-events","none");
$('#m').css("background",color1);
$('form button').css("pointer-events","none");
$('form button').css("background",color1);
$('#messages').append('<div class="partner"><br>refresh if you are not connected to anyone in a minute. </div>');

/////////////////////////////////////////////

// for showing partner is typing or not 
function timeoutFunction() {
    socket.emit('typing', false);
}

function isTyping(){
    socket.emit('typing',true);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 1000);        
}
////////////////////////////////////////////////////////
socket.on('typing', function(data) {
    if (data) {
        $("#istyping").css("visibility","visible")      // call function to show typing
    } else {
        $("#istyping").css("visibility","hidden")       // call function to stop typing
    }
});


function submitForm(){
    var msg = $('#m').emojioneArea()[0].emojioneArea.getText().trim();
    if(msg!=''){
        socket.emit('chat message', {msg: msg, target: partner_id});
    }
    $('#m').val('');
    $('div.emojionearea-editor').text('');
    return false;
}

socket.on('init',function (data) {
    socket.username=data.username;
    socket.avatar=data.avatar;
    my_id = data.my_id;
    $('#myname').html(socket.username);
    $('#myimg').attr("src",socket.avatar);
});

socket.on('chat message mine',function(msg){
    var output_msg = emojione.shortnameToImage(msg) ;
    var newData = '<div class="me" style="display:none">'+output_msg+'</div>';
    $(newData).appendTo($('#messages')).slideDown(speed=200,callback = function(){
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });
    $('#messages .me').css('background',meremsgkacolor);
});


socket.on('chat message partner', function (msg) {
    audio.play();
    var output_msg = emojione.shortnameToImage(msg);        
    var newData = '<div class="partner" style="display:none">'+output_msg+'</div>';
    $(newData).appendTo($('#messages')).slideDown(speed=200,callback = function(){
        $("#messages").scrollTop($("#messages")[0].scrollHeight);
    });
    $('#messages .partner').css('background',teremsgkacolor);

});

socket.on('disconnecting now', function (msg) {
    $('#messages').append('<div class="partner">'+msg+"</div>");
    $("#messages").scrollTop($("#messages")[0].scrollHeight);
    $('#partnername').html(" ");
    $('#partnerimg').attr("src"," ");
    $('#m').css("pointer-events","none");
    $('#m').css("background",color1);
    $('form button').css("pointer-events","none");
    $('form button').css("background",color1);
    $('#m').attr("placeholder","");
});

socket.on('partner', function (partner_data) {
    if(partner_id==null){
        $('#messages').append("<div>"+'Connected to '+partner_data.username+"</div>");
        $('#partnername').html(partner_data.username);
        $('#partnerimg').attr("src",partner_data.avatar);
        $('#m').css("pointer-events","auto");
        $('#m').css("background",color2);
        $('form button').css("pointer-events","auto");
        $('form button').css("background",color3);
        partner_id = partner_data.id;
        partner_username=partner_data.username;
        partner_avatar=partner_data.avatar;
        $('#m').attr("placeholder","Type to send a message");
        $('div.emojionearea-editor').attr("placeholder","Type to send a message");
        socket.emit('partner',{target:partner_id,
            data:{id:socket.id,
                username:socket.username,
                avatar:socket.avatar}});
    }
});

$(document).ready(function() {        
    $("#m").emojioneArea({
        saveEmojisAs: 'shortname',
        events: {
            keyup: function(editor, event) {
                if (event.which == 13) {
                    $('form').submit();
                } else 
                {
                    isTyping();
                }
            }
        }
    });
});
