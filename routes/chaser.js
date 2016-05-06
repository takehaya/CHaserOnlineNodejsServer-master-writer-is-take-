var express = require('express');
var fs = require('fs');
var router = express.Router();

var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/maps');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({storage: storage});

// configファイルの読み込み (ルールの読み込み)
var config = require('./config.js');

// System Version
var version = '2016/05/04';

// couchdbに接続
var nano = require('nano')('http://127.0.0.1:5984');
var users = nano.use('users');
var rooms = nano.use('rooms');
var chSessions = nano.use('chaser-server-sessions');
var jsessionids = nano.use('jsessionids');

var loginCheck = function(req, res, next) {

	console.log('loginCheck. bellow is id');
	console.log(req.session.user);

	if(req.session.user) {
		console.log('success loginCheck with sessionID');
		next();
	}
	else {
		console.log('faild loginCheck with sessionID. redirect /CHaserOnline003/user/');
		res.redirect('/CHaserOnline003/node/user/');
	}
};

// socket.io用のhttpサーバを立ち上げる
var app2 = require('http').createServer();
var io = require('socket.io')(app2);

app2.listen(3000);

// データベース作成
nano.db.get('users', function(err, body) {
	if(err) {
		console.log('couchdb: users is not exitst.')

		nano.db.create('users', function(err2, results) {
			if(!err2) {
				console.log('success to create db users. so, you need to restart this server');
			}
			else {
				console.log('faild to create db users. maybe you need install couchdb on your computer');
			}
		});
	}
});

nano.db.get('rooms', function(err, body) {
	if(err) {
		console.log('couchdb: rooms is not exitst.')

		nano.db.create('rooms', function(err2, results) {
			if(!err2) {
				console.log('success to create db rooms. so, you need to restart this server');
			}
			else {
				console.log('faild to create db rooms. maybe you need install couchdb on your computer');
			}
		});
	}
});

nano.db.get('chaser-server-sessions', function(err, body) {
	if(err) {
		console.log('couchdb: chaser-server-sessions is not exitst.')

		nano.db.create('chaser-server-sessions', function(err2, results) {
			if(!err2) {
				console.log('success to create db chaser-server-sessions. so, you need to restart this server');
			}
			else {
				console.log('faild to create db chaser-server-sessions. maybe you need install couchdb on your computer');
			}
		});
	}
});

nano.db.get('jsessionids', function(err, body) {
	if(err) {
		console.log('couchdb: jsessionids is not exitst.')

		nano.db.create('jsessionids', function(err2, results) {
			if(!err2) {
				console.log('success to create db jsessionids. so, you need to restart this server');
			}
			else {
				console.log('faild to create db jsessionids. maybe you need install couchdb on your computer');
			}
		});
	}
});


/* Index */

// ホーム画面
router.get('/', function(req, res, next) {
	res.render('CHaserOnline003');
});

router.get('/server/', function(req, res, next) {
	res.render('server');
});

router.get('/serverSocket/', function(req, res, next) {
	var os = require('os');
	console.log(getLocalAddress());

	function getLocalAddress() {
	    var ifacesObj = {}
	    ifacesObj.ipv4 = [];
	    ifacesObj.ipv6 = [];
	    var interfaces = os.networkInterfaces();

	    for (var dev in interfaces) {
	        interfaces[dev].forEach(function(details){
	            if (!details.internal){
	                switch(details.family){
	                    case "IPv4":
	                        ifacesObj.ipv4.push({name:dev, address:details.address});
	                    break;
	                    case "IPv6":
	                        ifacesObj.ipv6.push({name:dev, address:details.address})
	                    break;
	                }
	            }
	        });
	    }
	    return ifacesObj;
	};

	res.render('serverSocket', {'ip': getLocalAddress().ipv4[0].address});
});

// room情報のダウンロード
router.get('/serverSocket/:roomId', function(req, res, next) {

	rooms.get(req.params.roomId, function(err, body) {
		console.log('return room data as response ');
		res.send(body);
	});
});

/* Create */

// ユーザー作成画面
router.get('/createUser', function(req, res, next) {
	res.render('createUser');
});

// ユーザー作成
router.post('/createUser', function(req, res, next) {

	console.log(req.body);

	// insert new account data
	users.insert({user: req.body.user, password: req.body.pass}, req.body.user, function(err, body) {
		if(!err) {
			console.log(body);
			res.redirect('/CHaserOnline003/');
		}
		else {
			res.send('err!');
		}
	});
});

// ルーム作成画面
router.get('/createRoom', function(req, res, next) {

	// マップファイルの一覧取得
	fs.readdir('./public/maps/', function(err, mapFiles) {

		console.log('mapFiles: ルーム作成時に選択できるマップ');
		console.log(mapFiles);

		res.render('createRoom', { version: version, maps: mapFiles, results: req.query });
	});
});

// ルーム作成
router.post('/createRoom', function(req, res, next) {

	// ルーム作成処理

	// needs
	// ルーム全削除
	// TODO: post, delete, putのajax化

	// output request body
	console.log('req.body');
	console.log(req.body);

	// リクエストされたマップを読み込む
	var basedMap = JSON.parse(fs.readFileSync('./public/maps/' + req.body.map, 'utf8'));

	// ルーム作成に必要なデータを定義
	var roomData = {
		"basedMap": basedMap,
		"playerPosition": basedMap.startPosition,
		"turn": req.body.turn,
		"map": basedMap.map,
		"players": 0,
		"playerInfo": {},
		"playerStatus": {},
		"playerPoint": {},
		"log": {}
	};

	// 現在存在しているルーム一覧を取得 for increment id
	rooms.list(function(err, body) {
		if(!err) {

			// idの定義
			var id = 0;

			if(body.rows == ''){
				// ルームが存在しない場合のid
				id = 1;
			}
			else{
				// TODO:このやり方だとルームを削除した時にエラーが出るためmax+1にする必要あり
				// ルームが存在する場合のid
				id = Object.keys(body.rows).length + 1;
			}

			roomData['_id'] = id.toString();

			console.log('roomData');
			console.log(roomData);

			rooms.insert(roomData, function(err, body) {
				if(!err) {
					console.log('results of insert new room');
					console.log(body);

					res.send({'results': true, 'id': body.id});
				}
				else{
					res.send('<h1>Error when insert docs</h1>');
				}
			});

		}
		else{
			res.send('<h1>Error on CouchDB<h1>');
		}
	});
});

// マップ作成画面
router.get('/createMap', function(req, res, next) {
	res.render('createMap');
});

// マップ作成
router.post('/uploadMap', upload.single('map'),function(req, res, next) {
	// マップ作成処理

	res.render('uploadMapResults');
});

// ルール作成画面
router.get('/createRule', function(req, res, next) {

	jsessionids.insert({user: 'fnit'}, function(err, body) {
		if(!err) {
			console.log(body);

			// inserted id を使用してdoc 取得
			jsessionids.get(body.id, function(err2, results) {
				if(!err2) {
					console.log(results);
				}
				else {
					console.log(err2);
				}
			});
		}
		else {
			console.log(err);
		}
	});

	res.render('createRule');
});

// ルール作成
router.post('/createRule', function(req, res, next) {
	// ルール作成処理
});


/* View */

// ユーザー一覧画面
router.get('/userView', function(req, res, next) {

	users.list(function(err, body) {

		console.log(body);

		if(!err) {
			res.render('userView', {userList: body.rows});
		}
		else{
			res.send('err!');
		}
	});
});

// マップ一覧画面
router.get('/viewMap', function(req, res, next) {

	// マップファイルの一覧取得
	fs.readdir('./public/maps/', function(err, files) {

		console.log('files');
		console.log(files);

		res.render('viewMap', {'files': files});
	});
});

// ajax用のAPI
router.get('/viewMap/index', function(req, res, next) {
	// マップファイルの一覧取得
	fs.readdir('./public/maps/', function(err, files) {

		console.log('files');
		console.log(files);

		res.send({'mapList': files});
	});
});

router.post('/uploadMap', function(req, res, next) {
	var target_path, tmp_path;
	console.dir(req.files);
	tmp_path = req.files.thumbnail.path;
	target_path = './public/maps/' + req.files.thumbnail.originalname;

	fs.rename(tmp_path, target_path, function(err) {
    	fs.unlink(tmp_path, function() {
			res.redirect('/viewMap');
		});
	});
});

// ルーム一覧画面
router.get('/viewRoom', function(req, res, next) {
	// RoomNumber=画面を出力する
	rooms.list(function(err, body) {
		if(!err) {

			var roomList = '';

			body.rows.forEach(function(doc){
				roomList += doc.id + ',';
			});

			res.render('viewRoom', {roomList: roomList});
		}
	});
});

router.get('/viewRoom/:id', function(req, res, next) {

	var id = req.params.id;
	rooms.get(id, function(err, room) {
		res.send(room);
	})
});

// ルール一覧画面
router.get('/viewRule', function(req, res, next) {
	chSessions.list(function(err, body) {
	if(!err) {
		console.log(body);
		console.log(body.rows[0]);

	}
	else {
		console.log(err);
	}
	});
});

/* Update */

// ユーザー更新画面
router.get('/updateUser', function(req, res, next) {


	res.render('updateUser');
});

// ユーザー更新処理
router.put('/updateUser', function(req, res, next) {

});

// マップ更新画面
router.get('/updateMap', function(req, res, next) {
	res.render('updateMap');
});

// マップ更新処理
router.put('/updateMap', function(req, res, next) {

});

// ルーム更新画面
router.get('/updateRoom', function(req, res, next) {
	res.render('updateRoom');
});

// ルーム更新処理
router.put('/updateRoom', function(req, res, next) {
	res.send('fnit');

});

// ルール更新画面
router.get('/updateRule', function(req, res, next) {


});

// ルール更新処理
router.put('/updateRule', function(req, res, next) {

});

/* Delete */

// ユーザー削除画面
router.get('/deleteUser', function(req, res, next) {
	res.render('deleteUser');
});

// ユーザー削除処理
router.post('/deleteUser', function(req, res, next) {
	console.log(req.body)

});

// マップ削除画面
router.get('/deleteMap', function(req, res, next) {
	// マップファイルの一覧取得
	fs.readdir('./public/maps/', function(err, files) {

		console.log('files');
		console.log(files);

		res.render('deleteMap', {'files': files});
	});
});

// マップ削除処理
router.post('/deleteMap', function(req, res, next) {
	console.log('fnit');
	console.log(req.body)

	fs.unlink('./public/maps/' + req.body.mapName, function(err) {
		if(err) {
			res.send(err);
		}
		else {
			res.redirect('/CHaserOnline003/deleteMap');
		}
	});

});

// ルーム削除画面
router.get('/deleteRoom', function(req, res, next) {
	res.render('deleteRoom');
});

// ルーム削除処理
router.delete('/deleteRoom', function(req, res, next) {

});

// ルール削除画面
router.get('/deleteRule', function(req, res, next) {
	res.render('deleteRule');
});

// ルール削除処理
router.delete('/deleteRule', function(req, res, next) {

});


/* CHaser */

// ユーザーログイン画面 for client
router.get('/user', function(req, res, next) {
	res.render('user');
});

// ユーザーログイン画面 for brower
router.get('/node/user', function(req, res, next) {

	if(req.session.user) {
		// すでにlogin済み... So redirectUserCheck
		res.redirect('/CHaserOnline003/node/user/UserCheck');
	}
	else {
		res.render('nodeUser');
	}
});

// ユーザーログイン画面 for browser gui command
router.get('/gui/user', function(req, res, next) {

	if(req.session.user) {
		// すでにlogin済み... So redirectUserCheck
		res.redirect('/CHaserOnline003/gui/user/UserCheck');
	}
	else {
		res.render('guiUser');
	}

});

// ログイン and ルーム選択画面 for C client
router.get('/user/UserCheck', function(req, res, next) {

	console.log('userCheckだにゃ for C client')

	// ユーザーが存在するかどうか確認
	// ユーザーが存在すれば、利用可能ルーム番号を出力
	// ユーザーが存在しなければuser.ejsをレンダー

	// ログイン処理

	console.log('req.query');
	console.log(req.query);

	console.log('req.cookies');
	console.log(req.cookies);

	users.get(req.query.user, function(err, body) {
		// ユーザーが存在
		if(!err) {
			// パスワードの一致
			if(body.password !== undefined && req.query.pass !== undefined && body.password === req.query.pass) {
				console.log('success login');

				// jsessionにidを登録
				jsessionids.insert({user: req.query.user}, function(err, insertResults) {
					if(!err) {
						// jsessionidに登録完了 so return it
						res.append('Set-Cookie', 'JSESSIONID=' + insertResults.id + '; Path=/CHaserOnline003/; HttpOnly');

						// 利用可能ルーム番号の取得
						rooms.list(function(err, roomNumberResults) {
							if(!err) {

								var roomList = '';

								roomNumberResults.rows.forEach(function(doc){
									roomList += doc.id + ',';
								});

								res.render('roomNumber', {roomList: roomList});
							}
						});
					}
				});
			}
			// パスワードの不一致
			else {
				console.log('wrong password')
				res.redirect('/CHaserOnline003/user/');
			}
		}
		// ユーザーが存在しない
		else {
			console.log('user is not exitst')
			res.redirect('/CHaserOnline003/user/');
		}
	});
});

// ログイン and ルーム選択画面
router.get('/node/user/UserCheck', function(req, res, next) {

	console.log('userCheckだにゃ')

	// ユーザーが存在するかどうか確認
	// ユーザーが存在すれば、利用可能ルーム番号を出力
	// ユーザーが存在しなければuser.ejsをレンダー

	if(req.session.user) {
		// すでにlogin済み... So render roomNumber

		// 利用可能ルーム番号の取得
		rooms.list(function(err, body) {
			if(!err) {

				var roomList = '';

				body.rows.forEach(function(doc){
					roomList += doc.id + ',';
				});

				res.render('roomNumber', {roomList: roomList, err: req.query.err});
			}
		});
	}

	else {
		// ログイン処理

		console.log('req.query.user');
		console.log(req.query.user);

		users.get(req.query.user, function(err, body) {
			// ユーザーが存在
			if(!err) {

				// パスワードの一致
				if(body.password !== undefined && req.query.pass !== undefined && body.password === req.query.pass) {
					console.log('success login');

					// sessionにidを登録
					req.session.user = req.query.user;

					// 利用可能ルーム番号の取得
					rooms.list(function(err, body) {
						if(!err) {

							var roomList = '';

							body.rows.forEach(function(doc){
								roomList += doc.id + ',';
							});

							res.render('roomNumber', {roomList: roomList, err: req.query.err});
						}
					});
				}
				// パスワードの不一致
				else {
					console.log('wrong password')
					res.redirect('/CHaserOnline003/user/');
				}
			}
			// ユーザーが存在しない
			else {
				console.log('user is not exitst')
				res.redirect('/CHaserOnline003/user/');
			}
		});
	}
});

// ログイン and ルーム選択画面
router.get('/node/user/UserCheck', function(req, res, next) {

	console.log('userCheckだにゃ')

	// ユーザーが存在するかどうか確認
	// ユーザーが存在すれば、利用可能ルーム番号を出力
	// ユーザーが存在しなければuser.ejsをレンダー

	if(req.session.user) {
		// すでにlogin済み... So render roomNumber

		// 利用可能ルーム番号の取得
		rooms.list(function(err, body) {
			if(!err) {

				var roomList = '';

				body.rows.forEach(function(doc){
					roomList += doc.id + ',';
				});

				res.render('guiRoomNumber', {roomList: roomList, err: req.query.err});
			}
		});
	}

	else {
		// ログイン処理

		console.log('req.query.user');
		console.log(req.query.user);

		users.get(req.query.user, function(err, body) {
			// ユーザーが存在
			if(!err) {

				// パスワードの一致
				if(body.password !== undefined && req.query.pass !== undefined && body.password === req.query.pass) {
					console.log('success login');

					// sessionにidを登録
					req.session.user = req.query.user;

					// 利用可能ルーム番号の取得
					rooms.list(function(err, body) {
						if(!err) {

							var roomList = '';

							body.rows.forEach(function(doc){
								roomList += doc.id + ',';
							});

							res.render('guiRoomNumber', {roomList: roomList, err: req.query.err});
						}
					});
				}
				// パスワードの不一致
				else {
					console.log('wrong password')
					res.redirect('/CHaserOnline003/gui/user/');
				}
			}
			// ユーザーが存在しない
			else {
				console.log('user is not exitst')
				res.redirect('/CHaserOnline003/gui/user/');
			}
		});
	}
});


io.sockets.on('connection', function(socket) {
	console.log('success connection')

	socket.on('joinRoom', function(data) {
		console.log('on joinRoom');
		console.log(data);

		socket.join('room' + data.roomNumber);

		rooms.get(data.roomNumber, function(err, body) {
			if(!err) {
				socket.emit('room', body);
			}
		})
	});


/* 試合進行 */

// 場外を判定する関数 場外であれば reutn -1, 場外でなければその地形の値
function filed(base, room) {

	if( (0 <= base.x) && (base.x <= room.basedMap.mapSize.x - 1) && (0 <= base.y && base.y <= room.basedMap.mapSize.y - 1) ) {
		// in Filed

		// Clientが存在するかどうか
		Object.keys(room.playerPosition).forEach(function(key) {
			if(room.playerPosition[key].x === base.x && room.playerPosition[key].y === base.y) {
				return room.playerInfo[key].id;
			}
 		});

		// Clientは存在しないのでその地形の情報をreturn
		return room.map[base.y][base.x];
	}
	else {
		// out of Filed
		return -1;
	}
}
// login query : /user/
// user=
// pass=

// setup query : /user/UserCheck?user=cool&pass=cool
// roomNumber=
// 利用可能ルーム番号= 18, 27, 28, 29, 85,

// first query : /user/RoomNumberCheck?roomNumber=18
// command1=

// second query :/user/GetReadyCheck?command1=gr
// GetReady ReturnCode=3,1,3,1,1000,1,1,0,1
// command2=

// third query : /user/CommandCheck?command2=wu
// Action ReturnCode=3,1,3,1,0,1
// command3=

// forth query : /user/EndCommandCheck?command3=%23
// command1=

// request: GET /user/RoomNumberCheck?roomNumber=27
// response: command1=

// C言語 client用のrouting
router.get('/user/:plain', function(req, res, next) {
  console.log('at /user/:plain');

	var plain = req.params.plain;

	var jsessionid = decodeURIComponent(plain.substr(plain.indexOf(';') + 1));

	var requestURI = plain.substr(0, plain.indexOf(';'));

	console.log('requestURI: ' + requestURI);

	// jsessionid=の文字を取り除く
	jsessionid = jsessionid.substr(jsessionid.indexOf('=') + 1);

console.log('jsessionid');
console.log(jsessionid);

console.log('requestURI');
console.log(requestURI);
	jsessionids.get(jsessionid, function(err, userSession) {

    console.log('userSession');
    console.log(userSession);

		// Routing for Client

		switch(requestURI) {

			case 'RoomNumberCheck' :
				RoomNumberCheck(req, res, userSession);
				break;

			case 'GetReadyCheck' :
				GetReadyCheck(req, res, userSession);
				break;

			case 'CommandCheck' :
				CommandCheck(req, res, userSession);
				break;

			case 'EndCommandCheck' :
				EndCommandCheck(req, res, userSession);
				break;
		}
	});
});
router.get('/node/user/RoomNumberCheck', loginCheck, function(req, res, next) {
	console.log('okok?');
    // roomが存在するかどうか確認
	// 存在すればそのユーザーはroomに参加したことになる
	// 試合に参加できればcommand1=を送信
 	//試合参加人数に達したら、coolにcommand2=の文字列と周囲の情報を送信する // その後、comannd2=の後に送られてくるコマンドをサーバーが実行。完了したらcommand3=の文字列と、コマンドの実行結果を送信
	// coolのcommand=3の#を受け取ったらcommand1=を送信し、hotにcommand2の文字列と周囲の情報を送信する

	// RoomNumberCheck

	// 利用可能ルーム番号の取得
	rooms.get(req.query.roomNumber, function(err, room) {
		if(!err) {
			// ルームは存在... so ユーザーをルームに参加させる
			// はじめに、playerInfoを参照し、現在ルームに参加しているプレイヤーを確認
			// 誰も参加していなかったら、そのプレイヤーをcoolとして登録
			// 同じようにして参加人数に達するまでhot...と登録していく
			// 最後のプレイやーの登録が完了し、試合が開始できるようになったらcoolユーザーのgrを受け付けるためにdbのstatusを変更し、GetReadyCheckにgetした時に, 周囲の情報とcommand2=が返されるようにする
			// つまり、coolだけにcommand2=を送信する
			// この切り替えはdbのなかのplayerStatusのようなkeyを作成し、次に受け付けるcommandを管理する
			// command2=は、周囲の情報とともに送信する。

			//console.log('exitst room');

			//console.log('room Info');
			//console.log(room);

			// 参加しているクライアントのarray
			var joinPlayers = Object.keys(room.playerInfo);

			// 手順
			// 1. その人はすでにroomに参加しているか
			// | true : command1を送信
			// | false: 2.そのroomは参加人数にすでに達していて参加できないか
			//			| true : 参加できないのでroomNumber=の画面を出力
			//			| false: 参加できるので、そのユーザーを試合に参加させ、command1を送信


			// 1 その人はすでにroomに参加しているか
			// room.playerInfoをforEachして、中のデータとsessionを照らし合わせる
			// もし存在すれば、command1=を送信してreturn

			var joinFlag = false;

			joinPlayers.forEach(function(key) {
				//if(room.playerInfo[key].user === req.session.user){
				if(room.playerInfo[key].user == req.session.user){
					if(req.session.user.clientName != undefined) {
						// すでにroomに参加済み... So, command1=を送信してreturn
						console.log('this user is already joined room');
						joinFlag = true;

					}
				}
			});

			// すでにroomに参加済み
			if(joinFlag === true) {
				res.render('nodeCommand1');
			}
			else {

				// 2. そのroomは参加人数にすでに達していて参加できないか
				if(joinPlayers.length >= room.basedMap.players) {
					// 参加できないので、roomNumber=の画面へredirect
					console.log('users cant join because of full room. So redirect roomSelect.');
					res.redirect('/CHaserOnline003/node/user/UserCheck');
				}
				else {
					// 8人対戦まで可能
					var clientName = ['C', 'H', 'a', 's', 'e', 'r', 'O', 'n'];
					var clientArrayFlag = [0, 0, 0, 0, 0, 0, 0, 0];
					var clientId = { 'C': 1000, 'H': 2000, 'a': 3000, 's': 4000, 'e': 5000, 'r': 6000, 'O': 7000, 'n': 8000 };

					joinPlayers.forEach(function(key) {
						for(var i = 0; i < room.basedMap.players; i++) {
							if(key == clientName[i]) {
								clientArrayFlag[i] = 1;
							}
						}
					});

					// 参加できるので、そのユーザーを試合に参加させ、command1=を送信
					for(var i = 0; i < clientName.length; i++) {

						if(clientArrayFlag[i] == 0) {

							// ルームの参加者一覧にこのユーザーを追加
							room.playerInfo[clientName[i]] = {};
							room.playerInfo[clientName[i]]["user"] = req.session.user;
							room.playerInfo[clientName[i]]["id"] = clientId[clientName[i]];
							// このユーザーのステータスを追加
							room.playerStatus[clientName[i]] = {"command": "gr"};
							room.playerStatus[clientName[i]]["active"] = false;

							room.playerPoint[clientName[i]] = {"sum": 0, "putPoint": 0, "damagePoint": 0, "actionPoint": 0, "itemPoint": 0, "count": {}, "putCount": {}};

							// roomのplayer人数をインクリメント
							room.players = Object.keys(room.playerInfo).length;

							// もし、現在の参加人数が規定の参加人数に達していたら
							if(room.players == room.basedMap.players) {
								// coolのgrを受け付ける
								room.playerStatus["C"].active = true;
								room.status = true;
							}

							rooms.insert(room, function(err, body) {
								if(!err) {
									console.log('user join room.')

									// userのsessionに現在参加中の試合のIDを保存する
									req.session.joinedRoom = room['_id'];
									req.session.clientName = clientName[i];

									res.render('nodeCommand1');
								}
								else {
									console.log('user cant join room because of update error');
									res.send('error when you join room');
								}
							});
							break;
						}
					}
				}
			}
		}
		else {
			console.log('not exitst room');

			// RoomNumber=画面を出力する
			rooms.list(function(err, body) {
				if(!err) {

					var roomList = '';

					body.rows.forEach(function(doc){
						roomList += doc.id + ',';
					});

					res.render('nodeRoomNumber', {roomList: roomList, err: 'notExist'});
				}
			});
		}
	});
});

var RoomNumberCheck = function (req, res, userSession) {

    // roomが存在するかどうか確認
	// 存在すればそのユーザーはroomに参加したことになる
	// 試合に参加できればcommand1=を送信
 	//試合参加人数に達したら、coolにcommand2=の文字列と周囲の情報を送信する // その後、comannd2=の後に送られてくるコマンドをサーバーが実行。完了したらcommand3=の文字列と、コマンドの実行結果を送信
	// coolのcommand=3の#を受け取ったらcommand1=を送信し、hotにcommand2の文字列と周囲の情報を送信する

	// RoomNumberCheck

	// 利用可能ルーム番号の取得
	rooms.get(req.query.roomNumber, function(err, room) {
		if(!err) {
			// ルームは存在... so ユーザーをルームに参加させる
			// はじめに、playerInfoを参照し、現在ルームに参加しているプレイヤーを確認
			// 誰も参加していなかったら、そのプレイヤーをcoolとして登録
			// 同じようにして参加人数に達するまでhot...と登録していく
			// 最後のプレイやーの登録が完了し、試合が開始できるようになったらcoolユーザーのgrを受け付けるためにdbのstatusを変更し、GetReadyCheckにgetした時に, 周囲の情報とcommand2=が返されるようにする
			// つまり、coolだけにcommand2=を送信する
			// この切り替えはdbのなかのplayerStatusのようなkeyを作成し、次に受け付けるcommandを管理する
			// command2=は、周囲の情報とともに送信する。

			//console.log('exitst room');

			//console.log('room Info');
			//console.log(room);

			// 参加しているクライアントのarray
			var joinPlayers = Object.keys(room.playerInfo);

			// 手順
			// 1. その人はすでにroomに参加しているか
			// | true : command1を送信
			// | false: 2.そのroomは参加人数にすでに達していて参加できないか
			//			| true : 参加できないのでroomNumber=の画面を出力
			//			| false: 参加できるので、そのユーザーを試合に参加させ、command1を送信


			// 1 その人はすでにroomに参加しているか
			// room.playerInfoをforEachして、中のデータとsessionを照らし合わせる
			// もし存在すれば、command1=を送信してreturn

			var joinFlag = false;

			joinPlayers.forEach(function(key) {
				if(room.playerInfo[key].user === userSession.user){
					if(userSession.clientName != undefined) {
						// すでにroomに参加済み... So, command1=を送信してreturn
						console.log('this user is already joined room');
						joinFlag = true;
					}
				}
			});

			// すでにroomに参加済み
			if(joinFlag === true) {
				res.render('command1');
			}
			else {

				// 2. そのroomは参加人数にすでに達していて参加できないか
				if(joinPlayers.length >= room.basedMap.players) {
					// 参加できないので、roomNumber=の画面へredirect
					console.log('users cant join because of full room. So redirect roomSelect.');
					res.redirect('/CHaserOnline003/user/UserCheck');
				}

				else {
					// 8人対戦まで可能
					var clientName = ['C', 'H', 'a', 's', 'e', 'r', 'O', 'n'];
					var clientArrayFlag = [0, 0, 0, 0, 0, 0, 0, 0];
					var clientId = { 'C': 1000, 'H': 2000, 'a': 3000, 's': 4000, 'e': 5000, 'r': 6000, 'O': 7000, 'n': 8000 };

					joinPlayers.forEach(function(key) {
						for(var i = 0; i < room.basedMap.players; i++) {
							if(key == clientName[i]) {
								clientArrayFlag[i] = 1;
							}
						}
					});

					// 参加できるので、そのユーザーを試合に参加させ、command1=を送信
					for(var i = 0; i < clientName.length; i++) {

							if(clientArrayFlag[i] == 0) {

							// ルームの参加者一覧にこのユーザーを追加
							room.playerInfo[clientName[i]] = {};
							//room.playerInfo[clientName[i]]["user"] = req.session.user;
							room.playerInfo[clientName[i]]["user"] = userSession.user;
							room.playerInfo[clientName[i]]["id"] = clientId[clientName[i]];
							// このユーザーのステータスを追加
							room.playerStatus[clientName[i]] = {"command": "gr"};
							room.playerStatus[clientName[i]]["active"] = false;

							room.playerPoint[clientName[i]] = {"sum": 0, "putPoint": 0, "damagePoint": 0, "actionPoint": 0, "itemPoint": 0, "count": {}, "putCount": {}};

							// roomのplayer人数をインクリメント
							room.players = Object.keys(room.playerInfo).length;

							// もし、現在の参加人数が規定の参加人数に達していたら
							if(room.players == room.basedMap.players) {
								// coolのgrを受け付ける
								room.playerStatus["C"].active = true;
								room.status = true;
							}

							rooms.insert(room, function(err, body) {
								if(!err) {
									console.log('user join room.')

									// userのsessionに現在参加中の試合のIDを保存する
									//req.session.joinedRoom = room['_id'];
									//req.session.clientName = clientName[i];
									userSession.joinedRoom = room['_id'];
									userSession.clientName = clientName[i];

									// session情報の保存
									jsessionids.insert(userSession, function(err, body) {

										jsessionids.get(body.id, function(err, body) {
											console.log('save ?');
											console.log(body);

										});

										if(!err) {
											res.render('command1');
										}
									});
								}
								else {
									console.log('user cant join room because of update error');
									res.send('error when you join room');
								}
							});
							break;
						}
					}
				}
			}
		}
		else {
			console.log('not exitst room');

			// RoomNumber=画面を出力する
			rooms.list(function(err, body) {
				if(!err) {

					var roomList = '';

					body.rows.forEach(function(doc){
						roomList += doc.id + ',';
					});

					res.render('roomNumber', {roomList: roomList, err: 'notExist'});
				}
			});
		}
	});
};



// request: GET /user/GetReadyCheck?command1=gr
// response: GetReady ReturnCode=1,1,1,1,0,1,1,1,1 command2=
var GetReadyCheck = function(req, res, userSession) {

	// grを受け付ける
	// 試合が始まるまでは何度もこのページにgetされるので、そのユーザーがすでに試合に参加しているのであれば、
	// command1=のページを再送信

	//console.log('userSession');
	//console.log(userSession);

	rooms.get(userSession.joinedRoom, function(err, room) {
		if(!err) {
			// 1. userのクライアント名を調べる e.g. C, H,..
			// 2. そのクライアントがactiveであれば、command2=とともに、周囲の情報を送付, not activeであればcommand1を送信
			//console.log('room');
			//console.log(room);
			//console.log('userSession');
			//console.log(userSession);
			//console.log('room.playerStatus');
			//console.log('room.turn : ' + room.turn);

			//console.log('userSession.clientName : ' + userSession.clientName);

			// 試合は始まっているかどうか
			if(room.status == true) {

				var clientName = userSession.clientName;

				console.log('command1 from match : ' + room['_id'] + ', user: ' + clientName);

				if(room.playerStatus[clientName].active == true){
					// このユーザーのターン

					// So. 周囲の情報を取得しsend
					var returnCode = '';

					for(var i = -1; i <= 1; i++) {
						for(var j = -1; j <= 1; j++) {
							var foucs = { "y": room.playerPosition[clientName].y + i, "x": room.playerPosition[clientName].x + j };
							// return code の場合場外は送信しない
							if(filed(foucs, room) !== -1) {

								// クライアントの座標と同じではなかったらfiled(foucs, room)をreturncode, 同じであればそのクライアントの番号
								var participants = Object.keys(room.playerPosition);

								var isClient = '';

								// ユーザーの数だけループ, そのユーザーがreturn codeの範囲にいればその値をreturn
								participants.forEach(function(otherClient) {
									if(room.playerPosition[otherClient].x == foucs.x && room.playerPosition[otherClient].y == foucs.y) {
										// if isClientがすでに入っていて、かつその値は相手ではなく自分だったら、その値をotherClientで更新
										// その値が相手だったら、更新しない
										// クライアントが空 or 前のクライアントは自分
										if(isClient == '' || isClient == clientName) {
											isClient = otherClient;
										}
									}
								});

								var clientId = { 'C': 1000, 'H': 2000, 'a': 3000, 's': 4000, 'e': 5000, 'r': 6000, 'O': 7000, 'n': 8000 };

								if(isClient != '') {
									returnCode = returnCode + clientId[isClient] + ',';
								}
								else {
									returnCode = returnCode + filed(foucs, room) + ',';
								}
							}
						}
					}

					// 末端の , を削除
					returnCode = returnCode.substr(0, returnCode.length - 1);

					// もし、returnCodeが何もなかったら
					if(returnCode == '') {
						// カンマを追加する
						returnCode = ',,,,,,,,,';
					}

					// playerStatusを変化させる
					if(room.playerStatus[clientName].command === 'gr') {
						room.playerStatus[clientName].command = 'action';
					}

					// ERR Cannot read property '200' of undefined if(room.log[room..turn] == undefined) { ... }

					// logを残す
					if(room.log[room.turn] == undefined) {
						room.log[room.turn] = {};
					}

					if(room.log[room.turn][clientName] == undefined) {
						room.log[room.turn][clientName] = {};
					}

					room.log[room.turn][clientName].command1 = { 'action': 'gr', 'returnCode': returnCode };

					rooms.insert(room, function(err, body) {
						if(!err) {
							console.log('This turn is yours. So I accept your gr and return mapInfo');
							res.render('command2', {returnCode: returnCode});

							socket.broadcast.to('room' + room['_id']).emit('room', room);
						}
					});
				}
				else {
					// ほかのユーザーのターン
					console.log('This turn is not this user\'s. So I reject your gr.');
					res.render('command1');
				}
			}
			else {

				/* 試合はまだ始まっていない */

				console.log('this match is not started');
				res.render('command1');
			}
		}
		else {
			console.log('you are not belongs to room. so I redirect you.');

			// RoomNumber=画面を出力する
			rooms.list(function(err, body) {
				if(!err) {

					var roomList = '';

					body.rows.forEach(function(doc){
						roomList += doc.id + ',';
					});

					res.render('roomNumber', {roomList: roomList, err: 'notExist'});
				}
			});
		}
	});
};

// request: GET /user/GetReadyCheck?command1=gr
// response: GetReady ReturnCode=1,1,1,1,0,1,1,1,1 command2=
router.get('/node/user/GetReadyCheck', loginCheck, function(req, res, next) {

	// grを受け付ける
	// 試合が始まるまでは何度もこのページにgetされるので、そのユーザーがすでに試合に参加しているのであれば、
	// command1=のページを再送信

	//console.log('req.session.joinedRoom');
	//console.log(req.session.joinedRoom);

	GetReadyCheck(req, res, req.session);
});

// request : GET /user/CommandCheck?command2=wu
// response: Action ReturnCode=3,1,3,1,1,1,1,0,1 command3=
var CommandCheck = function(req, res, userSession) {

	// command2=のあとに実際にwrなどのcommandが送信されてきたらconfigにそって、そのcommandを実行する
	// 具体的には、まずそのコマンドによってユーザーを移動させ、ポイントの加減算し、地形を変更する(commandに応じて)
	// 手順
	/*

		1.commandがput系の場合は, 移動する前にconfig.putActionを参照し、自分の座標を基準にtargetが示す方向にblockを置く。
		その際、ブロックをおいた場所に他のクライアントがいれば、自分にgetPoint×turn数を加算し、潰されたユーザーに
		damage×turn数を減算する。putの際に置かれるものはpuCharactorに格納されているが基本的に2のblockなので参照する必要性は薄い
		2.config.afterActionMethodを参照し, 自分の座標を移動させる。
		その際に、元いた自分の場所の地形の変化と、移動先の地形の効果も考慮する
		具体的には、移動先の地形のidをkeyとして、config.itemPointのポイントを自分の得点に加算し、
		config.afterItemMethodを同じく地形のidをkeyとして参照して、自分の座標に更に変化がないか(ワープ)の確認をし、
		changeCurrentでitemを取った後の地形を定義する
		warpを取った場合は、ワープは消滅し、かつ飛んだ先の地形効果を受ける。
		また、moveが終了した後は, afterActionMethodのreturnを参照し、ReturnCodeを用意する
		3.config.actionPointを参照し、commandによる自分の得点の加減算を行う
		4.すべての処理が終わったらActionのReturn Codeとcommand3=のhtmlファイルをレンダリングする

		注意: Actionを連続で送られてきたら、動作はしないがreturncodeだけは返す... So, ifの中に動作の処理 共通でreturn code 送信
	*/

	rooms.get(userSession.joinedRoom, function(err, room) {
		if(!err) {
			// 1. userのクライアント名を調べる e.g. C, H,..
			// 2. そのクライアントがactiveであれば、command2=とともに、周囲の情報を送付, not activeであればcommand1を送信

			//console.log(room.playerStatus);
			//console.log(room.playerPosition);
			//console.log('room.turn : ' + room.turn);
			//console.log('userSession.clientName : ' + userSession.clientName);

			var clientName = userSession.clientName;

			var command2 = req.query.command2;

			console.log('command2 from match : ' + room['_id'] + ', user: ' + clientName);
			console.log(command2);

			var command2Flag = false;

			// command2が不正な値ではないかcheck
			Object.keys(config.actionPoint).forEach(function(key) {
				if(key == command2) {
					command2Flag = true;
				}
			});

			// コマンド一覧の中に一致するコマンドが存在する
			if(command2Flag) {

				// このユーザーのターン
				if(room.playerStatus[clientName].active === true){

					var returnCode = '';

					// 現在のstatus: すでにgr済みかどうかを調べる
					if(room.playerStatus[clientName].command === 'action') {

            //20160504
            //breakAction系のやつ
            if (command2.substring(3, 4) === '0'||command2.substring(4, 5) === '0') {
              // 自分の座標
              var me = { "x": room.playerPosition[clientName].x, "y": room.playerPosition[clientName].y };
              // putする先の座標
              var tarGet = { 'y': me.y + config.breakAction[command2].target.y, 'x': me.x + config.breakAction[command2].target.x };
              room.map[tarGet.y][tarGet.x] = 0
            }
						// 1. commandがput系の場合は, 移動する前にconfig.putActionを参照し、自分の座標を基準にtargetが示す方向にblockを置く。
						// 判定: commandがput系 = 送られてくるcommand名の先頭文字がp
            else if(command2.substring(0, 1) === 'p') {

							// ブロックを置く先にクライアントがいるかどうか

							// 自分の座標
							var me = { "x": room.playerPosition[clientName].x, "y": room.playerPosition[clientName].y };
							// putする先の座標
							var tarGet = { 'y': me.y + config.putAction[command2].target.y, 'x': me.x + config.putAction[command2].target.x };

							/* same source 1 */
							var participants = Object.keys(room.playerPosition);

							// ユーザーの数だけループ, そのユーザーがputによって置かれるブロックと同じマスにいるかどうか判定
							participants.forEach(function(otherClient) {
								if(room.playerPosition[otherClient].x === tarGet.x && room.playerPosition[otherClient].y === tarGet.y) {
									// このユーザーはputによって潰された!
									// So, putしたユーザーのポイントを加算 and putされたユーザーのポイントを減算

									// baseとなるput点
									var getPointBase = config.putAction[command2].getPoint;
									var damageBase = config.putAction[command2].damage;

									// 現在の残りturn数
									var turn = room.turn;

									// 自分のポイントを増やす
									room.playerPoint[clientName].sum += config.putPoint.getPoint(getPointBase, turn);
									room.playerPoint[clientName].putPoint += config.putPoint.getPoint(getPointBase, turn);

									// 自分のputのカウント
									if(room.playerPoint[clientName].putCount.to != undefined) {
										room.playerPoint[clientName].putCount.to = room.playerPoint[clientName].putCount.to + 1;
									}
									else {
										room.playerPoint[clientName].putCount.to = 1;
									}

									// 相手のポイントを減らす
									room.playerPoint[otherClient].sum -= config.putPoint.damage(damageBase, turn);
									room.playerPoint[otherClient].damagePoint -= config.putPoint.damage(damageBase, turn);

									// 相手のputのカウント
									if(room.playerPoint[otherClient].putCount.from != undefined) {
										room.playerPoint[otherClient].putCount.from = room.playerPoint[otherClient].putCount.from + 1;
									}
									else {
										room.playerPoint[otherClient].putCount.from = 1;
									}
								}
							});
							/* end same source 1 */

							// putした場所がfiled内であればmapにblockを反映
							if(filed(tarGet, room) !== -1) {
								// in Filed

								// putした場所にブロックを置く
								room.map[tarGet.y][tarGet.x] = config.putAction[command2].putCharactor;
							}
						} //--- end put ---//

						// 自分の座標
						var me = { "x": room.playerPosition[clientName].x, "y": room.playerPosition[clientName].y };

						// 2.config.afterActionMethodを参照し, 自分の座標を移動させる。
						room.playerPosition[clientName].y += config.afterActionMethod[command2].move.y;
						room.playerPosition[clientName].x += config.afterActionMethod[command2].move.x;

						// 移動した自分の座標
						var movedMe = room.playerPosition[clientName];

						// 2.1.移動前の地形の変化
						if(filed(me, room) !== -1) {
							room.map[me.y][me.x] = config.afterItemMethod[filed(movedMe, room)].changeCurrent;

							// 08/03追加
							// アイテムを取ってブロックが生成された際、そのマスに相手がいた場合のput判定

							// もし、自分が元いた場所がブロックになっていて
							if(room.map[me.y][me.x] == 2) {
								// その場所に相手がいたのであれば、putしたことになる

								/* same source 1 */
								var participants = Object.keys(room.playerPosition);

								// ユーザーの数だけループ, そのユーザーがputによって置かれるブロックと同じマスにいるかどうか判定
								participants.forEach(function(otherClient) {
									if(room.playerPosition[otherClient].x === me.x && room.playerPosition[otherClient].y === me.y) {
										// このユーザーはputによって潰された!
										// So, putしたユーザーのポイントを加算 and putされたユーザーのポイントを減算

										// baseとなるput点
										var getPointBase = config.putAction['pu2'].getPoint;
										var damageBase = config.putAction['pu2'].damage;

										// 現在の残りturn数
										var turn = room.turn;

										// 自分のポイントを増やす
										room.playerPoint[clientName].sum += config.putPoint.getPoint(getPointBase, turn);
										room.playerPoint[clientName].putPoint += config.putPoint.getPoint(getPointBase, turn);

										// 自分のputのカウント
										if(room.playerPoint[clientName].putCount.to != undefined) {
											room.playerPoint[clientName].putCount.to = room.playerPoint[clientName].putCount.to + 1;
										}
										else {
											room.playerPoint[clientName].putCount.to = 1;
										}

										// 相手のポイントを減らす
										room.playerPoint[otherClient].sum -= config.putPoint.damage(damageBase, turn);
										room.playerPoint[otherClient].damagePoint -= config.putPoint.damage(damageBase, turn);

										// 相手のputのカウント
										if(room.playerPoint[otherClient].putCount.from != undefined) {
											room.playerPoint[otherClient].putCount.from = room.playerPoint[otherClient].putCount.from + 1;
										}
										else {
											room.playerPoint[otherClient].putCount.from = 1;
										}
									}
								});
							}
						}

						/* 2015 11 14 追加 */
						/*
							walkなどでアイテムをとった場合、アイテムをとったあとの周りの値ではなく、移動したあとでアイテムが消える前の値をぜんじょうけんのサーバーでは送っていたため、
							その処理の前にreturn Codeを用意する処理を移行。
							また, ワープをとった場合でも、ワープで移動する前の、かつワープの上の周りの値が必要なため、ここに移行した
							また、自分のactionのターンじゃなかった時のreturncodeが、ここにあると送られないため, 新規でelseを追加し、そのブロックの中にここと同じコード SameCode を追加した
							また、それによって、returnCode変数の宣言場所をブロックの外に避難させた

						*/
						/* Same Souce Code 20151114 */
						// So. 周囲の情報を取得しsend
						//var returnCode = '';

						var action = config.afterActionMethod[command2];

						for(var i = action.return.y1; i <= action.return.y2; i++) {
							for(var j = action.return.x1; j <= action.return.x2; j++) {
								var foucs = { "y": room.playerPosition[clientName].y + i, "x": room.playerPosition[clientName].x + j };
								// return code の場合場外は送信しない
								if(filed(foucs, room) !== -1) {

									// クライアントの座標と同じではなかったらfiled(foucs, room)をreturncode, 同じであればそのクライアントの番号
									var participants = Object.keys(room.playerPosition);

									var isClient = '';

									// ユーザーの数だけループ, そのユーザーがreturn codeの範囲にいればその値をreturn
									participants.forEach(function(otherClient) {

											if(room.playerPosition[otherClient].x == foucs.x && room.playerPosition[otherClient].y == foucs.y) {
												if(isClient == '' || isClient == clientName) {
													isClient = otherClient;
												}
											}
									});

									var clientId = { 'C': 1000, 'H': 2000, 'a': 3000, 's': 4000, 'e': 5000, 'r': 6000, 'O': 7000, 'n': 8000 };

									if(isClient != '') {
										// 2015 11 14 追加 : walk時に自分の座標を送信しない処理
										if(clientName == isClient) {
											returnCode = returnCode + filed(foucs, room) + ',';
										}
										else {
											returnCode = returnCode + clientId[isClient] + ',';
										}
										// 追加終了
									}
									else {
										returnCode = returnCode + filed(foucs, room) + ',';
									}
								}
							}
						}

						// 末端の , を削除
						returnCode = returnCode.substr(0, returnCode.length - 1);

						console.log('returnCode');
						console.log(returnCode);

						// もし、returnCodeが何もなかったら
						if(returnCode == '') {
							// カンマを追加する
							returnCode = ',,,,,,,,,';
						}
						/* Same Souce Code 20151114 End */

						/* 2015 11 14 追加 end*/

						/* 2015 11 14 ワープの前に移動しました */
						// 3.移動先の地形の効果 : 地形による得点の加減算( include アイテム・ターゲット取得処理)
						room.playerPoint[clientName].sum += config.itemPoint[filed(movedMe, room)].point;
						room.playerPoint[clientName].itemPoint += config.itemPoint[filed(movedMe, room)].point;
						/* 2015 11 14 ワープの前に移動しました end */

						// warpによる移動 : 移動した先の地形のアイテムのmoveを加算
						room.playerPosition[clientName].y += config.afterItemMethod[filed(movedMe, room)].move.y;
						room.playerPosition[clientName].x += config.afterItemMethod[filed(movedMe, room)].move.x;

						// warpによる移動も含めた自分の座標
						movedMe = room.playerPosition[clientName];

						// 動作のカウント
						if(room.playerPoint[clientName].count[filed(movedMe, room)] != undefined) {
							room.playerPoint[clientName].count[filed(movedMe, room)] = room.playerPoint[clientName].count[filed(movedMe, room)] + 1;
						}
						else {
							room.playerPoint[clientName].count[filed(movedMe, room)] = 1;
						}

						// 4.移動後の地形を0に変える
						if(filed(movedMe, room) !== -1) {
							room.map[movedMe.y][movedMe.x] = 0;
						}

						// config.actionPointを参照し、commandによる自分の得点の加減算を行う
						room.playerPoint[clientName].sum += config.actionPoint[command2].point;
						room.playerPoint[clientName].actionPoint += config.actionPoint[command2].point;
					} // ifに入らない場合はすでにaction済みなので、動作はせずそのcommandによるaction Return Codeだけ返す
					// 2015 11 14 追加
					else {

						/* Same Souce Code 20151114 */
						// So. 周囲の情報を取得しsend
						var action = config.afterActionMethod[command2];

						for(var i = action.return.y1; i <= action.return.y2; i++) {
							for(var j = action.return.x1; j <= action.return.x2; j++) {
								var foucs = { "y": room.playerPosition[clientName].y + i, "x": room.playerPosition[clientName].x + j };
								// return code の場合場外は送信しない
								if(filed(foucs, room) !== -1) {

									// クライアントの座標と同じではなかったらfiled(foucs, room)をreturncode, 同じであればそのクライアントの番号
									var participants = Object.keys(room.playerPosition);

									var isClient = '';

									// ユーザーの数だけループ, そのユーザーがreturn codeの範囲にいればその値をreturn
									participants.forEach(function(otherClient) {

											if(room.playerPosition[otherClient].x == foucs.x && room.playerPosition[otherClient].y == foucs.y) {
												if(isClient == '' || isClient == clientName) {
													isClient = otherClient;
												}
											}
									});

									var clientId = { 'C': 1000, 'H': 2000, 'a': 3000, 's': 4000, 'e': 5000, 'r': 6000, 'O': 7000, 'n': 8000 };

									if(isClient != '') {
										// 2015 11 14 追加 : walk時に自分の座標を送信しない処理
										if(clientName == isClient) {
											returnCode = returnCode + filed(foucs, room) + ',';
										}
										else {
											returnCode = returnCode + clientId[isClient] + ',';
										}
										// 追加終了
									}
									else {
										returnCode = returnCode + filed(foucs, room) + ',';
									}
								}
							}
						}

						// 末端の , を削除
						returnCode = returnCode.substr(0, returnCode.length - 1);

						console.log('returnCode');
						console.log(returnCode);

						// もし、returnCodeが何もなかったら
						if(returnCode == '') {
							// カンマを追加する
							returnCode = ',,,,,,,,,';
						}
						/* Same Souce Code 20151114 End */
					}
					// 2015 11 14 追加 終了

					// moveが終了した後は, afterActionMethodのreturnを参照し、ReturnCodeを用意する
					// すべての処理が終わったらActionのReturn Codeとcommand3=のhtmlファイルをレンダリングする


					// playerStatusを変化させる
					if(room.playerStatus[clientName].command === 'action') {
						room.playerStatus[clientName].command = '#';
					}

					// logを残す
					if(room.log[room.turn] == undefined) {
						room.log[room.turn] = {};
					}

					if(room.log[room.turn][clientName] == undefined) {
						room.log[room.turn][clientName] = {};
					}

					room.log[room.turn][clientName].command2 = { 'action': command2, 'returnCode': returnCode };

					rooms.insert(room, function(err, body) {
						if(!err) {
							console.log('This turn is yours. So I accept your action and return mapInfo');
							console.log('returnCode: ' + returnCode);
							res.render('command3', {returnCode: returnCode});

							socket.broadcast.to('room' + room['_id']).emit('room', room);
						}
					});
				}
				else {
					// ほかのユーザーのターン
					console.log('This turn is not this user\'s. So I reject your gr.');
					res.render('command1');
				}
			}
			else {
				console.log('but command name');
				res.send('But command Name. Pleace back and reinput command2');
			}
		}
	});
};

// request : GET /user/CommandCheck?command2=wu
// response: Action ReturnCode=3,1,3,1,1,1,1,0,1 command3=
router.get('/node/user/CommandCheck', loginCheck, function(req, res, next) {
	//console.log('req.session.joinedRoom');
	//console.log(req.session.joinedRoom);

	CommandCheck(req, res, req.session);
});

// request : GET /user/EndCommandCheck?command3=%23
// response: command1=
var EndCommandCheck = function(req, res, userSession) {

// #を受け付けたら、現在のactive userをfalseにし、
// 次のuserをtrueにする
// また、最後のユーザーの#であれば、turnを消費し、coolをアクティ

	rooms.get(userSession.joinedRoom, function(err, room) {
		if(!err) {
			// 1. userのクライアント名を調べる e.g. C, H,..
			// 2. そのクライアントがactiveであれば、command2=とともに、周囲の情報を送付, not activeであればcommand1を送信

			//console.log('room');
			//console.log(room);

			if(room.turn <= 1) {
				// 試合終了
				console.log('end match of id:'+ room['_id']);
				res.send('user');
			}
			else {

				var clientName = userSession.clientName;

				console.log('command3 from match : ' + room['_id'] + ', user: ' + clientName);

				// このユーザーのターン
				if(room.playerStatus[clientName].active === true) {

					// 現在のstatus: action済みかどうかを調べる
					if(room.playerStatus[clientName].command === '#') {
						// turn end

						// logを残す
						if(room.log[room.turn] == undefined) {
							room.log[room.turn] = {};
						}

						if(room.log[room.turn][clientName] == undefined) {
							room.log[room.turn][clientName] = {};
						}

						room.log[room.turn][clientName].command3 = { 'action': '#', 'returnCode': ''};

						// decrement turn
						room.turn = room.turn - 1;

						// このuserのactiveをfalseにする
						room.playerStatus[clientName].active = false;
						room.playerStatus[clientName].command = 'gr';

						// 次のユーザーのactiveをtrueにする
						var clientArray = ['C', 'H', 'a', 's', 'e', 'r', 'O', 'n'];

						// 現在のユーザーは最後のユーザー
						if(room.playerInfo[clientName].id / 1000 == room.players) {
							// So, coolをactiveにする
							room.playerStatus['C'].active = true;
							room.playerStatus['C'].command = 'gr';
						}
						else {
							// 次のユーザーをactiveにする
							room.playerStatus[clientArray[(room.playerInfo[clientName].id / 1000)]].active = true;
							room.playerStatus[clientArray[(room.playerInfo[clientName].id / 1000)]].command = 'gr';
						}

						rooms.insert(room, function(err, body) {
							if(!err) {
								console.log('This turn is yours. So I accept your # and turn change');
								res.render('command1');

								socket.broadcast.to('room' + room['_id']).emit('room', room);
							}
						});
					}
				}
				else {
					// ほかのユーザーのターン
					console.log('This turn is not this user\'s. So I reject your gr.');
					res.render('command1');
				}
			}
		}

		else {
			console.log('not exitst room');

			// RoomNumber=画面を出力する
			rooms.list(function(err, body) {
				if(!err) {

					var roomList = '';

					body.rows.forEach(function(doc){
						roomList += doc.id + ',';
					});

					res.render('roomNumber', {roomList: roomList, err: 'notExist'});
				}
			});
		}
	});
};

// request : GET /user/EndCommandCheck?command3=%23
// response: command1=
router.get('/node/user/EndCommandCheck', loginCheck, function(req, res, next) {

	//console.log('req.session.joinedRoom');
	//console.log(req.session.joinedRoom);

	EndCommandCheck(req, res, req.session);
});

});//--- end of io.sockets.on ---//

module.exports = router;
