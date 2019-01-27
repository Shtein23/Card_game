// Зависимости
var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('port', 5000);
// app.use('/static', express.static(__dirname + '/static'));
const publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

// Маршруты
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});


// Запуск сервера
server.listen(5000, function() {
    console.log('Запускаю сервер на порте 5000');
});
// Обработчик веб-сокетов
io.on('connection', function(socket) {
});
const deck = [61, 62, 63, 64, 71, 72, 73, 74, 81, 82, 83, 84, 91, 92, 93, 94, 101, 102, 103, 104, 111, 112, 113, 114, 121, 122, 123, 124, 131, 132, 133, 134, 141, 142, 143, 144];
var sh_deck = []
let kozr = [];
var players = {};
var rooms = [];
var roomid = 0;


function distr(h1,h2,deck,turn) {

    while (((h1.length < 6) || (h2.length < 6)) && (deck.length > 0)){

        if (turn === 1){
            if ((h2.length < 6) && (deck.length > 0)) {
                h2.push(deck[0]);
                deck.splice(0, 1);
            }
            if ((h1.length < 6) && (deck.length > 0)) {
                h1.push(deck[0]);
                deck.splice(0, 1);
            }
        }
        if ((turn === 2) || (turn === 0)){
            if ((h1.length < 6) && (deck.length > 0)) {
                h1.push(deck[0]);
                deck.splice(0, 1);
            }
            if ((h2.length < 6) && (deck.length > 0)) {
                h2.push(deck[0]);
                deck.splice(0, 1);
            }
        }
    }
return [h1,h2,deck]
}

function shuffle1(arr,tr) {
    kozr = [];
    let arr2 = [];
    for (k = 0; k<arr.length ; k++){
        if ((arr[k] % 10) === (tr % 10)){
            kozr.push(arr[k]);
        } else {
            arr2.push(arr[k])
        }
    }
    arr = [];
    arr = arr2.sort(sIncrease);
    kozr = kozr.sort(sIncrease);
    arr = arr.concat(kozr)
    return(arr)
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function sIncrease(i, ii) { // По возрастанию
    if (i > ii)
        return 1;
    else if (i < ii)
        return -1;
    else
        return 0;
}

function whose_turn(side, sock1, sock2, hand1, hand2){
    if (side === 1){
        for (j = 0;j < hand2.length; ++j) {
            io.to(sock2).emit('nu-turn', {got: hand2[j]})
        }
        for (i = 0; i < hand1.length; ++i) {
            io.to(sock1).emit('u-turn', {got: hand1[i]})
        }
        io.to(sock1).emit('turn1')
        io.to(sock2).emit('turn2')
    } else if (side === 2) {
        for (i = 0; i < hand1.length; ++i) {
            io.to(sock1).emit('nu-turn', {got: hand1[i]})
        }
        for (j = 0; j < hand2.length; ++j) {
            io.to(sock2).emit('u-turn', {got: hand2[j]})
        }
        io.to(sock1).emit('turn2')
        io.to(sock2).emit('turn1')
    }
}

function check(card, hand, kozr) {
    let y_hand = [];
    for (k = 0; k < hand.length; ++k){

        if ((hand[k] % 10) === (card % 10)){
            if ((hand[k]/10^0) > (card/10^0)){
                y_hand.push(hand[k])
            }


        } else if ((hand[k] % 10) !== (card % 10)){
            if ((hand[k] % 10) === (kozr % 10)) {
                y_hand.push(hand[k])
            }

        }
    }
    return y_hand;
}

function check2(card, hand, move, cover) {
    let y_hand = [];
    for (k = 0; k < hand.length; ++k) {
        for (n = 0; n < move.length; ++n)
            if ((hand[k] - (hand[k] % 10)) === (move[n] - (move[n] % 10))) {
                y_hand.push(hand[k])
            }
        for (i = 0; i < cover.length; ++i) {
            if ((hand[k] - (hand[k] % 10)) === (cover[i] - (cover[i] % 10))) {
                y_hand.push(hand[k])
            }
        }
    }
    return y_hand;
}



io.on('connection', function(socket) {
    for (r = 0; r < rooms.length;++r){
        io.to(socket.id).emit('add-room', {roomname: rooms[r].name, roomid: r})
    }
    //коннект нового игрока
    socket.on('new', function (data) {
        players[socket.id] = {
            name: data.name,
            ready: 0,
            intable: 100
        };

    });
    // создание комнаты
    socket.on('create-room', function (data) {
        rooms[roomid] ={
            name: data.roomname,    //имя комнаты
            ch1: {
                ch1id: 0,           //сокет(идентификатор игрока)
                hand1: [],          //карты, находящиеся у данного игрока
                kozr1: []           //отдельно помещенные козырные карты и руки
            },
            ch2: {
                ch2id: 0,           //сокет(идентификатор игрока)
                hand2: [],          //карты, находящиеся у данного игрока
                kozr2: []           //отдельно помещенные козырные карты и руки
            },
            pl: 0,                  //количество игроков в комнате
            turn: 0,                //переменная, отвечающая за то, кто сейчас ходит
            game: {
                move: [],           //карты, которыми игрок сходит
                cover: []           //карты, которыми другой игрок побился
            },
            deck: {
                cards: [],          //колода карт
                //1-C,2-D,3-H,s-4
                trumpcard: 0        //так называемая козырная карта, по ней определяются козырь, она же пояляется под
                                    //колодой
            },
            hangup: [],             //карты, отправленные в биту
            state: 0,               //состояние комнаты, меняется при начале и оконуиниии игры
        };
        io.sockets.emit('add-room', {roomname: rooms[+roomid].name, roomid: +roomid});//отправка всем пользователям для
        //сообщения о создании новой комнаты, где у клиентов она появится в списке
        socket.emit('in-room',{room: +roomid})
        ++roomid;
    })

    // подключение к комнате
    socket.on('connect-room', function (data) {

        if ((rooms[data.id].ch1.ch1id === 0) && (rooms[data.id].ch2.ch2id !== socket.id)){
            rooms[data.id].ch1.ch1id = socket.id;
            rooms[data.id].pl += 1;
            players[socket.id].intable = +data.id;
            socket.emit('load-table');
            io.to(rooms[data.id].ch2.ch2id).emit('nt-yr-name', {name: players[rooms[data.id].ch1.ch1id].name});
            if (rooms[data.id].ch2.ch2id !== 0) {
                io.to(rooms[data.id].ch1.ch1id).emit('nt-yr-name', {name: players[rooms[data.id].ch2.ch2id].name})
                if (players[rooms[data.id].ch2.ch2id].ready === 1) {
                    socket.emit('im-ready')
                }
            }
        }
        if ((rooms[data.id].ch2.ch2id === 0) && (rooms[data.id].ch1.ch1id !== socket.id)){
            rooms[data.id].ch2.ch2id = socket.id;
            rooms[data.id].pl += 1;
            players[socket.id].intable = +data.id;
            socket.emit('load-table')

            io.to(rooms[data.id].ch1.ch1id).emit('nt-yr-name', {name: players[rooms[data.id].ch2.ch2id].name});
            if (rooms[data.id].ch1.ch1id !== 0){
                io.to(rooms[data.id].ch2.ch2id).emit('nt-yr-name', {name: players[rooms[data.id].ch1.ch1id].name})
                if (players[rooms[data.id].ch1.ch1id].ready === 1) {
                    socket.emit('im-ready')
                }
            }
        }
        if (rooms[data.id].pl === 2){
            rooms[data.id].state = 1;
        }
    });
    //дисконнект из комнаты
    socket.on('disconnect-room', function() {
        if (rooms[players[socket.id].intable].ch1.ch1id === socket.id) {

            if (rooms[players[socket.id].intable].pl === 2) {
                if (players[rooms[players[socket.id].intable].ch1.ch1id].ready === 1 && players[rooms[players[socket.id].intable].ch2.ch2id].ready === 1) {
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('win')
                    socket.emit('i-ready')
                    socket.emit('im-ready')
                }
            }

            if ((rooms[players[socket.id].intable].ch2.ch2id !== 0) && (players[rooms[players[socket.id].intable].ch2.ch2id].ready === 1)){
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('im-ready')
            }

            rooms[players[socket.id].intable].ch1.ch1id = 0;
            rooms[players[socket.id].intable].ch1.hand1 = [];
            rooms[players[socket.id].intable].pl -= 1;
            socket.broadcast.emit('not-full-room', {n: rooms[players[socket.id].intable].pl, id: players[socket.id].intable});
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('nt-yr-name1');

        }
        else if (rooms[players[socket.id].intable].ch2.ch2id === socket.id) {

            if (rooms[players[socket.id].intable].pl === 2) {
                if (players[rooms[players[socket.id].intable].ch1.ch1id].ready === 1 && players[rooms[players[socket.id].intable].ch2.ch2id].ready === 1) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('win')
                    socket.emit('i-ready')
                    socket.emit('im-ready')
                }
            }
            if ((rooms[players[socket.id].intable].ch1.ch1id !== 0) && (players[rooms[players[socket.id].intable].ch1.ch1id].ready === 1)){
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('im-ready')
            }
            rooms[players[socket.id].intable].ch2.ch2id = 0;
            rooms[players[socket.id].intable].ch2.hand2 = [];
            rooms[players[socket.id].intable].pl -= 1;
            socket.broadcast.emit('not-full-room', {n: rooms[players[socket.id].intable].pl, id: players[socket.id].intable});
            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nt-yr-name1');

        }
        rooms[players[socket.id].intable].deck.cards = [];
        rooms[players[socket.id].intable].deck.trumpcard = 0;
        rooms[players[socket.id].intable].state = 0;
        sh_deck = [];
        if (players[socket.id].ready === 1) {
            socket.emit('i-ready')
        }
        players[socket.id].ready = 0;
        // console.log(rooms);


    });
    //обработка нажатия кнопки "готов" и возможное начало игры
    socket.on('ready', function () {
        if(players[socket.id].ready === 1){
            players[socket.id].ready = 0;
        }else {
            players[socket.id].ready = 1;
        }

        if (socket.id === rooms[players[socket.id].intable].ch1.ch1id){
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('im-ready')
        } else if (socket.id === rooms[players[socket.id].intable].ch2.ch2id) {
            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('im-ready')
        }


        if (rooms[players[socket.id].intable].pl === 2)  {
            if (players[rooms[players[socket.id].intable].ch1.ch1id].ready === 1 && players[rooms[players[socket.id].intable].ch2.ch2id].ready === 1){


                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('im-ready')
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('im-ready')
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('i-ready')
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('i-ready')

                rooms[players[socket.id].intable].state = 2;
                sh_deck = JSON.parse(JSON.stringify(deck));
                sh_deck = shuffle(sh_deck);
                rooms[players[socket.id].intable].deck.cards =  sh_deck;
                rooms[players[socket.id].intable].deck.trumpcard = rooms[players[socket.id].intable].deck.cards[35];

                let hh = distr(
                    rooms[players[socket.id].intable].ch1.hand1,
                    rooms[players[socket.id].intable].ch2.hand2,
                    rooms[players[socket.id].intable].deck.cards,
                    rooms[players[socket.id].intable].turn);

                rooms[players[socket.id].intable].ch1.hand1 = hh[0];
                rooms[players[socket.id].intable].ch2.hand2 = hh[1];
                rooms[players[socket.id].intable].deck.cards = hh[2];

                if (rooms[players[socket.id].intable].deck.cards.length === 0) {
                    rooms[players[socket.id].intable].deck.trumpcard = 0;
                }


                rooms[players[socket.id].intable].ch1.hand1 = shuffle1(rooms[players[socket.id].intable].ch1.hand1,rooms[players[socket.id].intable].deck.trumpcard);
                rooms[players[socket.id].intable].ch1.kozr1 = kozr;
                rooms[players[socket.id].intable].ch2.hand2 = shuffle1(rooms[players[socket.id].intable].ch2.hand2,rooms[players[socket.id].intable].deck.trumpcard);
                rooms[players[socket.id].intable].ch2.kozr2 = kozr;

                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('game-start',{
                    hand1: rooms[players[socket.id].intable].ch1.hand1,
                    hand2: rooms[players[socket.id].intable].ch2.hand2.length,
                    koz:rooms[players[socket.id].intable].deck.trumpcard,
                    koz1: rooms[players[socket.id].intable].deck.trumpcard % 10,
                    n: rooms[players[socket.id].intable].deck.cards.length
                });
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('game-start',{
                    hand1: rooms[players[socket.id].intable].ch2.hand2,
                    hand2: rooms[players[socket.id].intable].ch1.hand1.length,
                    koz:rooms[players[socket.id].intable].deck.trumpcard,
                    koz1: rooms[players[socket.id].intable].deck.trumpcard % 10,
                    n: rooms[players[socket.id].intable].deck.cards.length
                });



                if (rooms[players[socket.id].intable].ch1.kozr1.length !== 0 && rooms[players[socket.id].intable].ch2.kozr2.length !== 0){
                    if (Math.min.apply(null, rooms[players[socket.id].intable].ch1.kozr1) <
                        Math.min.apply(null, rooms[players[socket.id].intable].ch2.kozr2)) {
                        rooms[players[socket.id].intable].turn = 1;
                        whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                            rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)
                    } else if (Math.min.apply(null, rooms[players[socket.id].intable].ch1.kozr1) >
                        Math.min.apply(null, rooms[players[socket.id].intable].ch2.kozr2)){
                        rooms[players[socket.id].intable].turn = 2;
                        whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                            rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)
                    }
                } else if (rooms[players[socket.id].intable].ch1.kozr1.length === 0 && rooms[players[socket.id].intable].ch2.kozr2.length !== 0) {
                    rooms[players[socket.id].intable].turn = 2;
                    whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                        rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)
                } else if (rooms[players[socket.id].intable].ch1.kozr1.length !== 0 && rooms[players[socket.id].intable].ch2.kozr2.length === 0) {
                    rooms[players[socket.id].intable].turn = 1;
                    whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                        rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)
                } else if (rooms[players[socket.id].intable].ch1.kozr1.length === 0 && rooms[players[socket.id].intable].ch2.kozr2.length === 0){
                    rooms[players[socket.id].intable].turn = Math.floor(Math.random() * (3 - 1)) + 1;
                    whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                        rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)
                }
            }
        }
    });

    //дисконнект с сервера(перезагрузка страницы, закрытие вкладки)
    socket.on('disconnect', function() {
        if (players[socket.id] && rooms[players[socket.id].intable]) {
            if (rooms[players[socket.id].intable].ch1.ch1id === socket.id) {
                if (rooms[players[socket.id].intable].pl === 2) {
                        if (rooms[players[socket.id].intable].state === 2) {
                            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('win')
                        }
                    }
                rooms[players[socket.id].intable].ch1.ch1id = 0;
                rooms[players[socket.id].intable].ch1.hand1 = [];
                rooms[players[socket.id].intable].pl -= 1;
                socket.broadcast.emit('not-full-room', {n: rooms[players[socket.id].intable].pl, id: players[socket.id].intable});
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('nt-yr-name1');
                players[socket.id].ready = 0;
            } else if (rooms[players[socket.id].intable].ch2.ch2id === socket.id && rooms[players[socket.id].intable]) {
                if (rooms[players[socket.id].intable].pl === 2) {
                        if (rooms[players[socket.id].intable].state === 2) {
                            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('win')
                    }
                }
                rooms[players[socket.id].intable].ch2.ch2id = 0;
                rooms[players[socket.id].intable].ch2.hand2 = [];
                rooms[players[socket.id].intable].pl -= 1;
                socket.broadcast.emit('not-full-room', {n: rooms[players[socket.id].intable].pl, id: players[socket.id].intable});
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nt-yr-name1');
                players[socket.id].ready = 0;
            }
            rooms[players[socket.id].intable].deck.cards = [];
            rooms[players[socket.id].intable].deck.trumpcard = 0;
            rooms[players[socket.id].intable].state = 0;
            sh_deck = [];
        }
        delete players[socket.id]
    });
    //обработка хода игрока
    socket.on('step', function (data) {
        let cd = data.card;
        let hj = rooms[players[socket.id].intable].turn;
        // io.to(socket.id).emit('hand2', {card: cd});

        if (hj === 1){ //если ходит пользователь со стула 1


            if ((rooms[players[socket.id].intable].ch1.ch1id === socket.id) && (rooms[players[socket.id].intable].game.move.length <6)){

                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('move',{card: cd});
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('move',{card: cd});
                rooms[players[socket.id].intable].ch1.hand1.splice(rooms[players[socket.id].intable].ch1.hand1.indexOf(cd), 1);
                    if ((cd % 10) === (rooms[players[socket.id].intable].deck.trumpcard % 10)){
                        rooms[players[socket.id].intable].ch1.kozr1.splice(rooms[players[socket.id].intable].ch1.kozr1.indexOf(cd), 1);
                    }
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('hand1',{hand: rooms[players[socket.id].intable].ch1.hand1.length});
                rooms[players[socket.id].intable].game.move.push(cd)

                let got = check(cd, rooms[players[socket.id].intable].ch2.hand2, rooms[players[socket.id].intable].deck.trumpcard);

                for (i = 0; i< got.length;++i){
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('u-turn', {got: got[i]});
                }
                for (j = 0; j < rooms[players[socket.id].intable].ch1.hand1.length; ++j) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch1.hand1[j]})
                }
                if ((rooms[players[socket.id].intable].ch1.hand1.length === 0) &&
                    (rooms[players[socket.id].intable].deck.cards.length === 0) &&
                    (rooms[players[socket.id].intable].ch2.hand2.length >= (rooms[players[socket.id].intable].game.move.length - rooms[players[socket.id].intable].game.cover.length))){
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('win');
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('lose')

                } else {

                    if ((rooms[players[socket.id].intable].game.move.length !== 0) && (rooms[players[socket.id].intable].game.cover.length !== 0)){
                        io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('end-btn')
                    }
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('take-btn')

                }





            } else if (rooms[players[socket.id].intable].ch2.ch2id === socket.id){//ходы от этого пользователя идут в cover


                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('cover',{card: cd});
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('cover',{card: cd});
                rooms[players[socket.id].intable].ch2.hand2.splice(rooms[players[socket.id].intable].ch2.hand2.indexOf(cd), 1);
                if ((cd % 10) === (rooms[players[socket.id].intable].deck.trumpcard % 10)){
                    rooms[players[socket.id].intable].ch1.kozr1.splice(rooms[players[socket.id].intable].ch2.kozr2.indexOf(cd), 1);
                }
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('hand1',{hand: rooms[players[socket.id].intable].ch2.hand2.length});
                rooms[players[socket.id].intable].game.cover.push(cd)


                let got1 = [];
                for (k = 0; k < rooms[players[socket.id].intable].ch1.hand1.length; ++k) {
                    for (n = 0; n < rooms[players[socket.id].intable].game.move.length; ++n){
                        if ((rooms[players[socket.id].intable].ch1.hand1[k]/10^0) === (rooms[players[socket.id].intable].game.move[n]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch1.hand1[k])
                        }
                    }
                    for (m = 0; m < rooms[players[socket.id].intable].game.cover.length; ++m) {
                        if ((rooms[players[socket.id].intable].ch1.hand1[k]/10^0) === (rooms[players[socket.id].intable].game.cover[m]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch1.hand1[k])
                        }
                    }
                }

                for (i = 0; i< got1.length;++i){
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('u-turn', {got: got1[i]});
                }
                for (j = 0; j < rooms[players[socket.id].intable].ch2.hand2.length; ++j) {
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch2.hand2[j]})
                }
                if ((rooms[players[socket.id].intable].ch2.hand2.length === 0) &&
                    (rooms[players[socket.id].intable].deck.cards.length === 0) &&
                    (rooms[players[socket.id].intable].ch2.hand2.length >= (rooms[players[socket.id].intable].game.move.length - rooms[players[socket.id].intable].game.cover.length))){
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('win');
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('lose')

                } else{
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('end-btn')
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('take-btn')
                }


            }


        } else if (hj === 2){ //если ходит пользователь со стула 2


            if ((rooms[players[socket.id].intable].ch2.ch2id === socket.id) && (rooms[players[socket.id].intable].game.move.length <6)){


                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('move',{card: cd});
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('move',{card: cd});
                rooms[players[socket.id].intable].ch2.hand2.splice(rooms[players[socket.id].intable].ch2.hand2.indexOf(cd), 1);
                if ((cd % 10) === (rooms[players[socket.id].intable].deck.trumpcard % 10)){
                    rooms[players[socket.id].intable].ch2.kozr2.splice(rooms[players[socket.id].intable].ch2.kozr2.indexOf(cd), 1);
                }
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('hand1',{hand: rooms[players[socket.id].intable].ch2.hand2.length});
                rooms[players[socket.id].intable].game.move.push(cd);

                let got = check(cd, rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].deck.trumpcard);


                for (i = 0; i< got.length;++i){
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('u-turn', {got: got[i]});
                }
                for (j = 0; j < rooms[players[socket.id].intable].ch2.hand2.length; ++j) {
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch2.hand2[j]})
                }

                if ((rooms[players[socket.id].intable].ch2.hand2.length === 0) &&
                    (rooms[players[socket.id].intable].deck.cards.length === 0) &&
                    (rooms[players[socket.id].intable].ch1.hand1.length > (rooms[players[socket.id].intable].game.move.length - rooms[players[socket.id].intable].game.cover.length))){
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('win');
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('lose')

                } else {

                    if ((rooms[players[socket.id].intable].game.move.length !== 0) && (rooms[players[socket.id].intable].game.cover.length !== 0)) {

                        io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('end-btn')
                    }
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('take-btn')
                }

            } else if (rooms[players[socket.id].intable].ch1.ch1id === socket.id){//ходы от этого пользователя идут в cover


                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('cover',{card: cd});
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('cover',{card: cd});
                rooms[players[socket.id].intable].ch1.hand1.splice(rooms[players[socket.id].intable].ch1.hand1.indexOf(cd), 1);
                if ((cd % 10) === (rooms[players[socket.id].intable].deck.trumpcard % 10)){
                    rooms[players[socket.id].intable].ch2.kozr2.splice(rooms[players[socket.id].intable].ch1.kozr1.indexOf(cd), 1);
                }
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('hand1',{hand: rooms[players[socket.id].intable].ch1.hand1.length});
                rooms[players[socket.id].intable].game.cover.push(cd)

                let got1 = [];
                for (k = 0; k < rooms[players[socket.id].intable].ch2.hand2.length; ++k) {
                    for (n = 0; n < rooms[players[socket.id].intable].game.move.length; ++n){
                        if ((rooms[players[socket.id].intable].ch2.hand2[k]/10^0) === (rooms[players[socket.id].intable].game.move[n]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch2.hand2[k])
                        }
                    }
                    for (m = 0; m < rooms[players[socket.id].intable].game.cover.length; ++m) {
                        if ((rooms[players[socket.id].intable].ch2.hand2[k]/10^0) === (rooms[players[socket.id].intable].game.cover[m]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch2.hand2[k])
                        }
                    }
                }
                for (i = 0; i< got1.length;++i){
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('u-turn', {got: got1[i]});
                }
                for (j = 0; j < rooms[players[socket.id].intable].ch1.hand1.length; ++j) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch1.hand1[j]})
                }
                if ((rooms[players[socket.id].intable].ch1.hand1.length === 0) &&
                    (rooms[players[socket.id].intable].deck.cards.length === 0) &&
                    (rooms[players[socket.id].intable].ch2.hand2.length >= (rooms[players[socket.id].intable].game.move.length - rooms[players[socket.id].intable].game.cover.length))){
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('win');
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('lose')

                } else {

                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('end-btn')
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('take-btn')
                }
            }

        }

    });
    //обработка события, если игрок решил взять карты
    socket.on('take', function () {
        if (socket.id === rooms[players[socket.id].intable].ch1.ch1id){
            let got1 = [];
            for (k = 0; k < rooms[players[socket.id].intable].ch2.hand2.length; ++k) {
                for (n = 0; n < rooms[players[socket.id].intable].game.move.length; ++n){
                    if ((rooms[players[socket.id].intable].ch2.hand2[k]/10^0) === (rooms[players[socket.id].intable].game.move[n]/10^0)) {
                        got1.push(rooms[players[socket.id].intable].ch2.hand2[k])
                    }
                }
                for (m = 0; m < rooms[players[socket.id].intable].game.cover.length; ++m) {
                    if ((rooms[players[socket.id].intable].ch2.hand2[k]/10^0) === (rooms[players[socket.id].intable].game.cover[m]/10^0)) {
                        got1.push(rooms[players[socket.id].intable].ch2.hand2[k])
                    }
                }
            }
            for (i = 0; i< got1.length;++i){
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('ready-to-take', {got: got1[i]});
            }
            for (j = 0; j < rooms[players[socket.id].intable].ch1.hand1.length; ++j) {
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch1.hand1[j]})
            }

            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('end-btn')

        } else if (socket.id === rooms[players[socket.id].intable].ch2.ch2id) {

            let got1 = [];
            for (k = 0; k < rooms[players[socket.id].intable].ch1.hand1.length; ++k) {
                for (n = 0; n < rooms[players[socket.id].intable].game.move.length; ++n){
                    if ((rooms[players[socket.id].intable].ch1.hand1[k]/10^0) === (rooms[players[socket.id].intable].game.move[n]/10^0)) {
                        got1.push(rooms[players[socket.id].intable].ch1.hand1[k])
                    }
                }
                for (m = 0; m < rooms[players[socket.id].intable].game.cover.length; ++m) {
                    // console.log(rooms[players[socket.id].intable].ch1.hand1[k]/10^0,' сравнить ранг с ',rooms[players[socket.id].intable].game.cover[m]/10^0);
                    if ((rooms[players[socket.id].intable].ch1.hand1[k]/10^0) === (rooms[players[socket.id].intable].game.cover[m]/10^0)) {
                        got1.push(rooms[players[socket.id].intable].ch1.hand1[k])
                    }
                }
            }

            for (i = 0; i< got1.length;++i){
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('ready-to-take', {got: got1[i]});
            }
            for (j = 0; j < rooms[players[socket.id].intable].ch2.hand2.length; ++j) {
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch2.hand2[j]})
            }

            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('end-btn')

        }



    });
    //возможность докинуть карты, если второй игрок берет карты
    socket.on('more-card', function (data) {
        let cd1 = data.card;
        // io.to(socket.id).emit('hand2', {card: cd1});
        if (socket.id === rooms[players[socket.id].intable].ch1.ch1id) {

            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('move',{card: cd1});
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('move',{card: cd1});
            rooms[players[socket.id].intable].ch1.hand1.splice(rooms[players[socket.id].intable].ch1.hand1.indexOf(cd1), 1);
            if ((cd1 % 10) === (rooms[players[socket.id].intable].deck.trumpcard % 10)){
                rooms[players[socket.id].intable].ch1.kozr1.splice(rooms[players[socket.id].intable].ch1.kozr1.indexOf(cd1), 1);
            }
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('hand1',{hand: rooms[players[socket.id].intable].ch1.hand1.length});
            rooms[players[socket.id].intable].game.move.push(cd1)

            if (rooms[players[socket.id].intable].game.move === 6) {

                i = 0;
                for (i=0;i<rooms[players[socket.id].intable].ch1.hand1;++i){

                    io.to(socket.id).emit('nu-turn', {got: rooms[players[socket.id].intable].ch1.hand1[i]})

                }


            } else {
                let got1 = [];
                for (k = 0; k < rooms[players[socket.id].intable].ch1.hand1.length; ++k) {
                    for (n = 0; n < rooms[players[socket.id].intable].game.move.length; ++n){
                        if ((rooms[players[socket.id].intable].ch1.hand1[k]/10^0) === (rooms[players[socket.id].intable].game.move[n]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch1.hand1[k])
                        }
                    }
                    for (m = 0; m < rooms[players[socket.id].intable].game.cover.length; ++m) {
                        // console.log(rooms[players[socket.id].intable].ch1.hand1[k]/10^0,' сравнить ранг с ',rooms[players[socket.id].intable].game.cover[m]/10^0);
                        if ((rooms[players[socket.id].intable].ch1.hand1[k]/10^0) === (rooms[players[socket.id].intable].game.cover[m]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch1.hand1[k])
                        }
                    }
                }
                for (i = 0; i< got1.length;++i){
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('ready-to-take', {got: got1[i]});
                }
                for (j = 0; j < rooms[players[socket.id].intable].ch1.hand1.length; ++j) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch1.hand1[j]})
                }
            }

        } else if (socket.id === rooms[players[socket.id].intable].ch2.ch2id) {

            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('move',{card: cd1});
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('move',{card: cd1});
            rooms[players[socket.id].intable].ch2.hand2.splice(rooms[players[socket.id].intable].ch2.hand2.indexOf(cd1), 1);
            if ((cd1 % 10) === (rooms[players[socket.id].intable].deck.trumpcard % 10)){
                rooms[players[socket.id].intable].ch2.kozr2.splice(rooms[players[socket.id].intable].ch2.kozr2.indexOf(cd1), 1);
            }
            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('hand1',{hand: rooms[players[socket.id].intable].ch2.hand2.length});
            rooms[players[socket.id].intable].game.move.push(cd1);

            if (rooms[players[socket.id].intable].game.move === 6) {

                i = 0;
                for (i=0;i<rooms[players[socket.id].intable].ch2.hand2;++i){

                    io.to(socket.id).emit('nu-turn', {got: rooms[players[socket.id].intable].ch2.hand2[i]})

                }

            }else {
                let got1 = [];
                for (k = 0; k < rooms[players[socket.id].intable].ch2.hand2.length; ++k) {
                    for (n = 0; n < rooms[players[socket.id].intable].game.move.length; ++n){
                        if ((rooms[players[socket.id].intable].ch2.hand2[k]/10^0) === (rooms[players[socket.id].intable].game.move[n]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch2.hand2[k])
                        }
                    }
                    for (m = 0; m < rooms[players[socket.id].intable].game.cover.length; ++m) {
                        if ((rooms[players[socket.id].intable].ch2.hand2[k]/10^0) === (rooms[players[socket.id].intable].game.cover[m]/10^0)) {
                            got1.push(rooms[players[socket.id].intable].ch2.hand2[k])
                        }
                    }
                }
                for (i = 0; i< got1.length;++i){
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('ready-to-take', {got: got1[i]});
                }
                for (j = 0; j < rooms[players[socket.id].intable].ch1.hand1.length; ++j) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('nu-turn',{got: rooms[players[socket.id].intable].ch1.hand1[j]})
                }
            }

        }


    });
    //конец хода игрока, передача хода другому игроку-------------------------------------------------------------------
    socket.on('end', function () {


        if (rooms[players[socket.id].intable].game.move.length === rooms[players[socket.id].intable].game.cover.length){


            rooms[players[socket.id].intable].hangup = rooms[players[socket.id].intable].hangup.concat(rooms[players[socket.id].intable].game.cover);
            rooms[players[socket.id].intable].hangup = rooms[players[socket.id].intable].hangup.concat(rooms[players[socket.id].intable].game.move);
            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('hangup', {hup: rooms[players[socket.id].intable].hangup.length})
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('hangup', {hup: rooms[players[socket.id].intable].hangup.length})

            rooms[players[socket.id].intable].game.move = [];
            rooms[players[socket.id].intable].game.cover = [];

            if (rooms[players[socket.id].intable].turn === 1){
                rooms[players[socket.id].intable].turn = 2;
            } else if (rooms[players[socket.id].intable].turn === 2){
                rooms[players[socket.id].intable].turn = 1;
            }

            let hh1 = distr(
                rooms[players[socket.id].intable].ch1.hand1,
                rooms[players[socket.id].intable].ch2.hand2,
                rooms[players[socket.id].intable].deck.cards,
                rooms[players[socket.id].intable].turn);

            // console.log('hh1 '+hh1);

            rooms[players[socket.id].intable].ch1.hand1 = hh1[0];
            rooms[players[socket.id].intable].ch2.hand2 = hh1[1];
            rooms[players[socket.id].intable].deck.cards = hh1[2];
            if (rooms[players[socket.id].intable].deck.cards.length === 1) {
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('no-deck');
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('no-deck');
            }
            if (rooms[players[socket.id].intable].deck.cards.length === 0) {
                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('no-tr', {koz1: rooms[players[socket.id].intable].deck.trumpcard % 10});
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('no-tr', {koz1: rooms[players[socket.id].intable].deck.trumpcard % 10});
            }
            rooms[players[socket.id].intable].ch1.hand1 = shuffle1(rooms[players[socket.id].intable].ch1.hand1,rooms[players[socket.id].intable].deck.trumpcard);
            rooms[players[socket.id].intable].ch1.kozr1 = kozr;
            rooms[players[socket.id].intable].ch2.hand2 = shuffle1(rooms[players[socket.id].intable].ch2.hand2,rooms[players[socket.id].intable].deck.trumpcard);
            rooms[players[socket.id].intable].ch2.kozr2 = kozr;

            io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('next-step',{
                hand1: rooms[players[socket.id].intable].ch1.hand1,
                hand2: rooms[players[socket.id].intable].ch2.hand2.length,
                n: rooms[players[socket.id].intable].deck.cards.length
            });
            io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('next-step',{
                hand1: rooms[players[socket.id].intable].ch2.hand2,
                hand2: rooms[players[socket.id].intable].ch1.hand1.length,
                n: rooms[players[socket.id].intable].deck.cards.length
            });

            whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)



        } else if (rooms[players[socket.id].intable].game.move.length !== rooms[players[socket.id].intable].game.cover.length) {

            if (rooms[players[socket.id].intable].turn === 1) {

                rooms[players[socket.id].intable].ch2.hand2 = rooms[players[socket.id].intable].ch2.hand2.concat(rooms[players[socket.id].intable].game.move);
                rooms[players[socket.id].intable].ch2.hand2 = rooms[players[socket.id].intable].ch2.hand2.concat(rooms[players[socket.id].intable].game.cover);
                rooms[players[socket.id].intable].game.move = [];
                rooms[players[socket.id].intable].game.cover = [];

                let hh1 = distr(
                    rooms[players[socket.id].intable].ch1.hand1,
                    rooms[players[socket.id].intable].ch2.hand2,
                    rooms[players[socket.id].intable].deck.cards,
                    rooms[players[socket.id].intable].turn);

                // console.log('hh1 '+hh1);

                rooms[players[socket.id].intable].ch1.hand1 = hh1[0];
                rooms[players[socket.id].intable].ch2.hand2 = hh1[1];
                rooms[players[socket.id].intable].deck.cards = hh1[2];
                rooms[players[socket.id].intable].ch1.hand1 = shuffle1(rooms[players[socket.id].intable].ch1.hand1,rooms[players[socket.id].intable].deck.trumpcard);
                rooms[players[socket.id].intable].ch1.kozr1 = kozr;
                rooms[players[socket.id].intable].ch2.hand2 = shuffle1(rooms[players[socket.id].intable].ch2.hand2,rooms[players[socket.id].intable].deck.trumpcard);
                rooms[players[socket.id].intable].ch2.kozr2 = kozr;

                if (rooms[players[socket.id].intable].deck.cards.length === 1) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('no-deck');
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('no-deck');
                }
                if (rooms[players[socket.id].intable].deck.cards.length === 0) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('no-tr', {koz1: rooms[players[socket.id].intable].deck.trumpcard % 10});
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('no-tr', {koz1: rooms[players[socket.id].intable].deck.trumpcard % 10});
                }

                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('next-step',{
                    hand1: rooms[players[socket.id].intable].ch1.hand1,
                    hand2: rooms[players[socket.id].intable].ch2.hand2.length,
                    n: rooms[players[socket.id].intable].deck.cards.length
                });
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('next-step',{
                    hand1: rooms[players[socket.id].intable].ch2.hand2,
                    hand2: rooms[players[socket.id].intable].ch1.hand1.length,
                    n: rooms[players[socket.id].intable].deck.cards.length
                });

                whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                    rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)


            } else if (rooms[players[socket.id].intable].turn === 2) {

                rooms[players[socket.id].intable].ch1.hand1 = rooms[players[socket.id].intable].ch1.hand1.concat(rooms[players[socket.id].intable].game.move);
                rooms[players[socket.id].intable].ch1.hand1 = rooms[players[socket.id].intable].ch1.hand1.concat(rooms[players[socket.id].intable].game.cover);
                rooms[players[socket.id].intable].game.move = [];
                rooms[players[socket.id].intable].game.cover = [];

                let hh1 = distr(
                    rooms[players[socket.id].intable].ch1.hand1,
                    rooms[players[socket.id].intable].ch2.hand2,
                    rooms[players[socket.id].intable].deck.cards,
                    rooms[players[socket.id].intable].turn);

                // console.log('hh1 '+hh1);

                rooms[players[socket.id].intable].ch1.hand1 = hh1[0];
                rooms[players[socket.id].intable].ch2.hand2 = hh1[1];
                rooms[players[socket.id].intable].deck.cards = hh1[2];
                rooms[players[socket.id].intable].ch1.hand1 = shuffle1(rooms[players[socket.id].intable].ch1.hand1,rooms[players[socket.id].intable].deck.trumpcard);
                rooms[players[socket.id].intable].ch1.kozr1 = kozr;
                rooms[players[socket.id].intable].ch2.hand2 = shuffle1(rooms[players[socket.id].intable].ch2.hand2,rooms[players[socket.id].intable].deck.trumpcard);
                rooms[players[socket.id].intable].ch2.kozr2 = kozr;

                if (rooms[players[socket.id].intable].deck.cards.length === 1) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('no-deck');
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('no-deck');
                }
                if (rooms[players[socket.id].intable].deck.cards.length === 0) {
                    io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('no-tr', {koz1: rooms[players[socket.id].intable].deck.trumpcard % 10});
                    io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('no-tr', {koz1: rooms[players[socket.id].intable].deck.trumpcard % 10});
                }

                io.to(rooms[players[socket.id].intable].ch1.ch1id).emit('next-step',{
                    hand1: rooms[players[socket.id].intable].ch1.hand1,
                    hand2: rooms[players[socket.id].intable].ch2.hand2.length,
                    n: rooms[players[socket.id].intable].deck.cards.length
                });
                io.to(rooms[players[socket.id].intable].ch2.ch2id).emit('next-step',{
                    hand1: rooms[players[socket.id].intable].ch2.hand2,
                    hand2: rooms[players[socket.id].intable].ch1.hand1.length,
                    n: rooms[players[socket.id].intable].deck.cards.length
                });

                whose_turn(rooms[players[socket.id].intable].turn, rooms[players[socket.id].intable].ch1.ch1id, rooms[players[socket.id].intable].ch2.ch2id,
                    rooms[players[socket.id].intable].ch1.hand1, rooms[players[socket.id].intable].ch2.hand2)
            }
        }
    })


});
//решение в лоб для отправки состояний комнат(количество игроков и блокировка входа в комнату, если мест нет)-----------
setInterval(function() {
    for (r = 0; r<rooms.length; ++r){
        if ( rooms[r].pl === 2) {
            io.sockets.emit('full-room', {id: r});
            io.sockets.emit('conn', {n: rooms[r].pl, id: r})
        }else if ( rooms[r].pl === 1) {
            // io.sockets.emit('not-full-room', {n: rooms[r].pl, id: r});
            io.sockets.emit('conn', {n: rooms[r].pl, id: r})
        }else if ( rooms[r].pl === 0) {
            io.sockets.emit('not-full-room', {id: r});
            io.sockets.emit('conn', {n: rooms[r].pl, id: r})
        }
    }
}, 1000 / 2);

