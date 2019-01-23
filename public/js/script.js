$(document).ready(function(){
    var socket = io();
    AFK_Kicker.init();
    $('#name-input').focus();
    let name = '';
    let nameroom = '';
    let id = 100;
    let hup_i = 0;
    let w = $('#hand2').width();
    console.log(w)
    let wm = [];
    let cards = [];
    //проверка имени -----------------------------------------------------------------------
    function send_name() {
        name = $('#name-input').val();
        if (name && name.length <= 10) {
            socket.emit('new', {name:name});
                $('#name-prompt-overlay').fadeOut(500);
                $('#canvas').focus();

        } else {
            window.alert('Your name cannot be blank or over 20 characters.');
        }
        $('#yr-name').html('').append('<h4 class="m-0 p-1">'+name+'</h4>')

        return false;
    }
    //---------------------------------------------------------------------------------------

    //функция выхода из комнаты--------------------------------------------------------------
    function quit_room() {
        socket.emit('disconnect-room');
        $("#a"+id).removeAttr('disabled','disabled')
        $("#quit").attr('disabled','disabled')
        $("#quit").css("display", "none")
        $("#canvas").css({"background": "url(/images/FON.png)", "background-position": "center"})
        $("#ready").css("display", "none")
        $("#ready").attr('disabled','disabled')
        $('#ready').removeClass('btn-success');
        $('#deck').html('');
        $('#hand1').html('');
        $('#hand2').html('');
        $('#move').html('');
        $('#cover').html('');
        $('#hangup').html('');
        $('#yr-name').toggleClass('disp');
        $('#nt-yr-name').html('')
        id = 100;
    }
    //---------------------------------------------------------------------------------------

    //проверка имени комнаты-----------------------------------------------------------------
        function send_roomname(){
            nameroom = $('#RoomName').val()
            if (nameroom.length <= 10 && nameroom){
                socket.emit('create-room', {roomname: nameroom});
            } else {
                window.alert('Your room name cannot be blank or over 10 characters.');
            }
            $('#NewRoom').modal('hide');
            $('#RoomName').val('')
            return false;
        }
    //---------------------------------------------------------------------------------------

    //расстановка карт-----------------------------------------------------------------------
    function placing(hl){
        let wm1 = [];
        if (hl % 2 === 1){
            wm1[((hl-1)/2)] = 0;
            if ((hl*120) > w){
                for (i=0;i<((hl-1)/2);++i){
                    wm1[(((hl-1)/2)+1+i)] = -((hl*120-w)/(hl-1))*(i+1);
                    wm1[(((hl-1)/2)-1-i)] = ((hl*120-w)/(hl-1))*(i+1)
                }
            } else if ((hl*120) <= w){
                for (i=0;i<((hl-1)/2);++i){
                    wm1[(((hl-1)/2)+1+i)] = -30*(i+1);
                    wm1[(((hl-1)/2)-1-i)] = 30*(i+1)
                }
            }
        } else if (hl % 2 === 0){
                if ((hl*120) > w){
                    for (i=0;i<(hl/2);++i) {
                        wm1[((hl/2)+i)] = -((hl*120-w)/(hl-1))*(i+1)+(((hl*120-w)/(hl-1)))/2;
                        wm1[((hl/2)-1-i)] = ((hl*120-w)/(hl-1))*(i+1)-(((hl*120-w)/(hl-1)))/2
                    }
                } else if ((hl*120) < w){
                    for (i=0;i<(hl/2);++i){
                        wm1[((hl/2)+i)] = -30*(i+1)+15;
                        wm1[((hl/2)-1-i)] = 30*(i+1)-15;
                    }
                }
        }
        console.log(wm1)
        return wm1
    }

    //---------------------------------------------------------------------------------------
    $('#name-form').submit(send_name);
    $('#name-submit').click(send_name);

    $('#crroom').click(function () {
        $('#NewRoom').modal('show');
        $('#RoomName').focus();
    });
    $('#nameroom-form').submit(send_roomname);
    $('#create').click(send_roomname);

    //добавление и отрисовка новой созданной комнаты в список--------------------------------
    socket.on('add-room', function (data) {
        $('#room').append(
        '<button type="button" class="rooms list-group-item list-group-item-action d-flex justify-content-between align-items-center" ' +
            'id="a'+data.roomid+'">'+data.roomname+'<span class="badge badge-primary badge-pill" id="pl'+data.roomid+'">0</span> ' +
            '</button>')
    });
    //---------------------------------------------------------------------------------------
    $("#room").on("click", ".rooms", function() {
        if (id !== 100){
            socket.emit('disconnect-room')
            $("#a"+id).removeAttr('disabled','disabled')
            $('#deck').html('');
            $('#hand1').html('');
            $('#hand2').html('');
            $('#game').html('');
            $('#hangup').html('');
        }
        id = $(this).attr("id");
        id = id.substr(1);
        $("#a"+id).attr('disabled','disabled')
        $("#quit").removeAttr('disabled','disabled').css("display", "block")

        $("#ready").css("display", "block").removeAttr('disabled','disabled')

        console.log(id)
        socket.emit('connect-room', {id: +id});
    })

    setInterval(function() {
        AFK_Kicker.check();
        if (id !== 100){
            $("#a"+id).attr('disabled','disabled')
        }
    }, 1000);

//room

    //состояния комнат--------------------------------------------------------------------------------
    socket.on('full-room', function (data) {
        $("#a"+data.id).attr('disabled','disabled')

    });
    socket.on('not-full-room', function (data) {
        $("#a"+data.id).removeAttr('disabled','disabled')
    });
    socket.on('conn', function(data){
        $("#pl"+data.id).text(data.n)
    })
    //-----------------------------------------------------------------------------------------------

    $('#quit').click(quit_room);

    socket.on('nt-yr-name', function (data) {
        $('#nt-yr-name').html('').append('<h4 class="m-0 p-1">'+data.name+'</h4>').toggleClass('disp')

    })

    socket.on('nt-yr-name1', function (data) {
        $('#nt-yr-name').html('')

    })

    socket.on('load-table', function () {
        $("#canvas").css({"background": "url(/images/fon6.jpg)", "background-position": "center", "background-size": "auto 110%"})//, "background-position": "center"}
        $("#deck").append('<img src="/images/backblue.svg" ' +
            'class="align-self-center dc" id="deck1" height="168" width="120" style="z-index:5;left: 10px">');
        $('#yr-name').toggleClass('disp')

    })
    $('#ready').click(function () {
        $('#ready').toggleClass('btn-success');
        $('#yr-name').toggleClass('text-light').toggleClass('text-success');
        socket.emit('ready')

    })

    socket.on('im-ready', function () {
        $('#nt-yr-name').toggleClass('text-light').toggleClass('text-success');
    })
    socket.on('i-ready', function () {
        $('#yr-name').toggleClass('text-light').toggleClass('text-success');
    })

    var i = 0;
    socket.on('game-start', function (data) {
        $("#ready").attr('disabled','disabled')
        console.log(data.koz)
        $('#deck1').css("left","45px")
        $("#deck").append('<img src="/images/'+data.koz+'.svg" ' +
            'class=" align-self-center" id="trcard" height="168" width="120" style="z-index:4;left: -34px;">');
        $('#deck').append('<img src="/images/'+data.koz1+'.svg" ' +
                        'class=" align-self-center" id="trcard1" height="55" width="55" style="z-index:3;left: -140px;">')

        wm = placing(data.hand1.length);
        cards = data.hand1;
        for (i = 0; i< data.hand1.length; ++i){
            $("#hand2").append('<img src="/images/'+data.hand1[i]+'.svg" ' +
                'class="h2card" id="c'+data.hand1[i]+'" height="168" width="120" style="left: '+wm[i]+'px;bottom: -80px;z-index:'+(i+1)+';">')
        }

        wm = placing(data.hand2);
        for (i = 0; i< data.hand2; ++i){
            $("#hand1").append('<img src="/images/backblue.svg" ' +
                'class="h1card" height="168" width="120" style="left: '+wm[i]+'px;top: -80px;z-index:'+(i+1)+';">')
        }
    })
    socket.on('next-step',function (data) {
        $('#hand1').html('')
        $('#hand2').html('')
        $('#move').html('')
        $('#cover').html('')
        wm = placing(data.hand1.length);
        cards = data.hand1;
        for (i = 0; i< data.hand1.length; ++i){

            $("#hand2").append('<img src="/images/'+data.hand1[i]+'.svg" ' +
                'class="h2card" id="c'+data.hand1[i]+'" height="168" width="120" style="left: '+wm[i]+'px;bottom: -80px;z-index:'+(i+1)+';">')
        }
        wm = placing(data.hand2);
        for (i = 0; i< data.hand2; ++i){
            $("#hand1").append('<img src="/images/backblue.svg" ' +
                'class="h1card" height="168" width="120" style="left: '+wm[i]+'px;top: -80px;z-index:'+(i+1)+';">')
        }
    })

    socket.on('end-btn',function () {
        $('#end').toggleClass('disp');
    })
    $('#end').click(function () {

        $('#end').toggleClass('disp');
        socket.emit('end')
    })


    socket.on('take-btn',function () {
        $('#take').toggleClass('disp');
    })

    $('#take').click(function () {

        $('#take').toggleClass('disp');
        socket.emit('take')
    })

    socket.on('ready-to-take', function (data) {
        $("#c"+data.got).off("click");
        $("#c"+data.got).on("click", function(){
            var nameimg = $(this).attr('id');
            nameimg = nameimg.substr(1);

            nameimg = +nameimg;
            $('#c'+nameimg).remove();
            cards.splice(cards.indexOf(nameimg), 1);
            $('#hand2').html('');
            wm = placing(cards.length);
            for (i=0;i<cards.length;++i){
                $("#hand2").append('<img src="/images/'+cards[i]+'.svg" ' +
                    'class="h2card" id="c'+cards[i]+'" height="168" width="120" style="left: '+wm[i]+'px;bottom: -80px;z-index:'+(i+1)+';">')
            }

            socket.emit('more-card', {card: +nameimg})
        });

    })

    socket.on('hangup', function () {

        $('#hangup').html('');
            $("#hangup").append('<img src="/images/backblue.svg" ' +
                'class="hupcard align-self-center" height="168" width="120" >')


    })

    socket.on('lose', function () {

        $('#hand1').html('');
        $('#hand2').html('');
        $('#move').html('');
        $('#cover').html('');
        $('#hangup').html('');
        $("#deck").html('').append('<img src="/images/backblue.svg" ' +
            'class="align-self-center dc" id="deck1" height="168" width="120" style="z-index:5;left: 10px">');
        alert('U r lose!');
        socket.emit('ready')
        $("#ready").removeAttr('disabled','disabled').toggleClass('btn-success');

    })

    socket.on('win', function () {
        $('#hand1').html('');
        $('#hand2').html('');
        $('#move').html('');
        $('#cover').html('');
        $('#hangup').html('');
        $("#deck").html('').append('<img src="/images/backblue.svg" ' +
            'class="align-self-center dc" id="deck1" height="168" width="120" style="z-index:5;left: 10px">');
        alert('U r win!');
        socket.emit('ready')
        $("#ready").removeAttr('disabled','disabled').toggleClass('btn-success');
        // quit_room()
    })
    socket.on('u-turn',function (data) {
        $("#c"+data.got).off("click");
        $("#c"+data.got).on("click", function(){
            var nameimg = $(this).attr('id');
            nameimg = nameimg.substr(1);
            nameimg = +nameimg;
            $('#c'+nameimg).remove();
            cards.splice(cards.indexOf(nameimg), 1);
            $('#hand2').html('');
            wm = placing(cards.length);
            for (i=0;i<cards.length;++i){
                $("#hand2").append('<img src="/images/'+cards[i]+'.svg" ' +
                     'class="h2card" id="c'+cards[i]+'" height="168" width="120" style="left: '+wm[i]+'px;bottom: -80px;z-index:'+(i+1)+';">')
            }
            socket.emit('step', {card: nameimg})
        });
    })

    socket.on('nu-turn', function (data) {
        // $('.turn').attr('disabled','disabled')
        $("#c"+data.got).off("click");
    })

    socket.on('move',function (data) {
        $("#move").append('<img src="/images/'+data.card+'.svg" ' +
            'class="move" height="168" width="120" style="left: 10px;top: 10px;z-index: 2;">')

    })
    socket.on('cover',function (data) {
        $("#cover").append('<img src="/images/'+data.card+'.svg" ' +
            'class="cover" height="168" width="120" style="left: 10px;top: 10px;z-index: 2; transform: rotate(40deg)">')

    })

    socket.on('hand1', function (data) {
        let m = 0;
        $('#hand1').html('');
        wm = placing(data.hand);
        console.log('h1 - '+wm);
        for (m = 0; m< data.hand; ++m){
            $("#hand1").append('<img src="/images/backblue.svg" ' +
                'class="h1card" height="168" width="120" style="left: '+wm[m]+'px;top: -80px;z-index:'+(m+1)+';">')
        }
    })

    socket.on('hand2', function (data) {
        cards.splice(cards.indexOf(data.card), 1);
        $('#hand2').html('');
        wm = placing(cards);
        for (i=0;i<cards.length;++i){
            $("#hand2").append('<img src="/images/'+cards[i]+'.svg" ' +
                'class="h1card" height="168" width="120" style="left: '+wm[i]+'px;top: -80px;z-index:'+(i+1)+';">')
        }
    })

    socket.on('no-deck', function () {
        $('#deck1').remove()
        $('#trcard').css("left","0px")
        $('#trcard1').css("left","-20px")
    })

    socket.on('no-tr', function () {
        $('#deck1').remove()
        $('#trcard').remove()
        $('#trcard1').css("left","0px")

    })

});