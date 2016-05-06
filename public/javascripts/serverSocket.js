function main(ip) {

	var socket = io('http://' + ip + ':3000/');

	var roomNumber = getQueryString().roomNumber;

	socket.emit('joinRoom', {'roomNumber': roomNumber});

	socket.on('room', function(data) {
		console.log('on room');
		console.log(data);

		updateInfo(data);
		viewMap(data);
		viewLog(data.log);
	});
}

function updateInfo(room) {

	$('.mapNameArea').empty();
	$('.mapNameArea').append(room.basedMap.mapName);

	$('.mapAuthorArea').empty();
	$('.mapAuthorArea').append(room.basedMap.mapAuthor);

	$('.mapDescriptionArea').empty();
	$('.mapDescriptionArea').append(room.basedMap.mapDescription);

	$('.mapSizeXArea').empty();
	$('.mapSizeXArea').append(room.basedMap.mapSize.x);

	$('.mapSizeYArea').empty();
	$('.mapSizeYArea').append(room.basedMap.mapSize.y);

	$('.mapInfoArea').empty();
	$('.mapInfoArea').append(JSON.stringify(room.basedMap.mapInfo));

	$('.turnArea').empty();
	$('.turnArea').append(room.turn);

	$('.playerInfoArea').empty();
	$('.playerInfoArea').append(JSON.stringify(room.playerInfo));

	$('.playerPositionArea').empty();
	$('.playerPositionArea').append(JSON.stringify(room.playerPosition));

	$('.playerStatusArea').empty();
	$('.playerStatusArea').append(JSON.stringify(room.playerStatus));

	$('.playerPointArea').empty();

	var playerPointCode = '';

	Object.keys(room.playerPoint).forEach(function(cn) {
		playerPointCode += '<h4>' + cn + '</h4>';

		Object.keys(room.playerPoint[cn]).forEach(function(po) {
			playerPointCode += '<div>';
			playerPointCode += '<strong>' + po + ' : '  + '</strong>';
			playerPointCode += JSON.stringify(room.playerPoint[cn][po]);
			playerPointCode += '</div>';
		});
	});

	console.log(playerPointCode);

	$('.playerPointArea').append(playerPointCode);
}

function viewMap(room) {

	var actionClient;

	var action = '';

	var loop = {};

	var lightArea = [];

	if(room.log[room.turn] != undefined) {
		actionClient = Object.keys(room.log[room.turn])[0];

		Object.keys(room.log[room.turn][actionClient]).forEach(function(key) {
			action = room.log[room.turn][actionClient][key].action;
		});

		if(action != '#') {
			if(action != 'gr') {
				loop = afterActionMethod[action].return;
			}
			else {
				loop = { "x1": -1, "y1": -1, "x2": 1, "y2": 1 };
			}
		}	

		for(var i = loop.y1; i <= loop.y2; i++) {
			for(var j = loop.x1; j <= loop.x2; j++) {
				lightArea.push({'y': room.playerPosition[actionClient].y + i, 'x': room.playerPosition[actionClient].x + j});
			}
		}
	}	


	var code = '';

	for(var i = 0; i < room.basedMap.mapSize.y; i++){

		code += '<div class="mapRow">';

		for(var j = 0; j < room.basedMap.mapSize.x; j++) {

			var mapCel = room.map[i][j];

			// クライアントがいるかどうか調べる
			var clientFlag = false;
			var who = '';

			Object.keys(room.playerPosition).forEach(function(key) {
				if(room.playerPosition[key].y == i && room.playerPosition[key].x == j) {

					clientFlag = true;
					who = key;
				}
			});

			// ここでハイライトのクラスを追加

			var lightFlag = false;

			for(var k = 0; k < lightArea.length; k++) {
				if(lightArea[k].y == i && lightArea[k].x == j) {
					lightFlag = true;
				}
			}

			code += '<div data-y="' + i + '" data-x="' + j + '">'; 

			code += '<div style="font-size:' + baseFontSize + 'px;width:' + baseWidth + 'px;height:' + baseHeight + 'px;" class="base ';

			if(lightFlag) {
				code = code + 'light' + actionClient + ' '; 
			}

			if(clientFlag) {
				code += clientReName[who] + '">';
				code += who;
			}
			else {
				code +=  className[mapCel] + '">';
				code += '<i class="fa fa-' + iconName[mapCel] + '"></i>';
			}

			code += '</div></div>';
		}
		code += '</div>';
	}

	$('.mapArea').empty();

	$('.mapArea').append(code);
}

function viewLog(log) {

	console.log(log);

	var code = '';

	Object.keys(log).forEach(function(turn) {

		code += '<div class="turns">';

		code += '<div class="turnHeading">' + turn + '</div>';

		Object.keys(log[turn]).forEach(function(client) {

			code += '<div class="turnClientArea ' + client + '">';

			code += '<div class="turnClientHeading ' + client + '">' + client + '</div>';

			code += '<ul>'

			Object.keys(log[turn][client]).forEach(function(command) {
				code += '<li><span class="turnAction">' + log[turn][client][command].action + '</span>: <span class="turnReturnCode">' + log[turn][client][command].returnCode + '</span></li>';
			})

			code += '</ul>';

			code += '</div>';
		});
		code += '</div>';
	});


	$('.logArea').empty();
	$('.logArea').append(code);
}

function getQueryString()
{
    var result = {};
    if( 1 < window.location.search.length )
    {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = window.location.search.substring( 1 );

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split( '&' );

        for( var i = 0; i < parameters.length; i++ )
        {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[ i ].split( '=' );

            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );

            // パラメータ名をキーとして連想配列に追加する
            result[ paramName ] = paramValue;
        }
    }
    return result;
}

var className = {
	'0': 'nothing',
	'1': 'target',
	'2': 'block',
	'3': 'item',
	'20': 'warp20',
	'21': 'warp21',
	'22': 'warp22',
	'23': 'warp23',
	'30': 'warp30',
	'31': 'warp31',
	'32': 'warp32',
	'33': 'warp33',	
	'1000': 'client1000',
	'2000': 'client2000',
	'3000': 'client3000',
	'4000': 'client4000',
	'5000': 'client5000',
	'6000': 'client6000',
	'7000': 'client7000',
	'8000': 'client8000',
    '5': 'Fossilr',
	'6': 'Fossill',
	'7': 'Fossilu',
	'8': 'Fossild'
};

var iconName = {
	'0': 'square-o',
	'1': 'star',
	'2': 'square',
	'3': 'heart',
	'20': 'angle-double-right',
	'21': 'angle-double-left',
	'22': 'angle-double-up',
	'23': 'angle-double-down',
	'30': 'angle-right',
	'31': 'angle-left',
	'32': 'angle-up',
	'33': 'angle-down',
	'1000': 'C',
	'2000': 'H',
	'3000': 'a',
	'4000': 's',
	'5000': 'e',
	'6000': 'r',
	'7000': 'O',
	'8000': 'n',
    '5': 'asterisk',
	'6': 'asterisk',
	'7': 'asterisk',
	'8': 'asterisk'
};

var clientReName = {
	'C': 'client1000',
	'H': 'client2000',
	'a': 'client3000',
	's': 'client4000',
	'e': 'client5000',
	'r': 'client6000',
	'O': 'client7000',
	'n': 'client8000'
};

// localに保存
$('#export').on('click', function() {

	var btn = $(this).button('loading');

	var roomNumber = getQueryString().roomNumber;

	$.ajax({
		url: '/CHaserOnline003/serverSocket/' + roomNumber,
		type: 'get',
		success: function(data, textStatus) {

			if(data != '') {
				setBlobUrl('download', data);
			}
			else {
				console.log('No data!');
			}

			btn.button('reset');
		},
		error: function(err) {
			console.log(err);
		}
    });
});

function setBlobUrl(id, content) {

	console.log(content);

	$('#' + id).fadeOut('fast');

	var blob = new Blob([JSON.stringify(content)], { "type": "application/json"});

	// aタグのhref属性にblobオブジェクトを設定し、リンクを生成
	window.URL = window.URL || window.webkitURL;

	var daTe = new Date();

	var now = daTe.getFullYear().toString() + (daTe.getMonth() + 1).toString() + daTe.getDay().toString() + daTe.getDate().toString();

	var time = daTe.getHours().toString() + '.' + daTe.getMinutes().toString() + '.' + daTe.getSeconds().toString();

	var fileName = 'room' + content['_id'].toString() + ' at ' + now + ' ' + time + ".json";

	$('#' + id).attr('href', window.URL.createObjectURL(blob));
	$('#' + id).attr('download', fileName);

	$('#' + id).fadeIn('fast');
}

// from config.js
var afterActionMethod = {
	// walk
	"wr": {
		"id": 1,
		"move": { "x": 1, "y": 0 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"wl": {
		"id": 2,
		"move": { "x": -1, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"wu": {
		"id": 3,
		"move": { "x": 0, "y": -1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"wd": {
		"id": 4,
		"move": { "x": 0, "y": 1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},

	// look
	"lr": {
		"id": 5,
		"move": { "x": 0, "y": 0 }, // コマンドによる移動
		"return": { "x1": 1, "y1": -1, "x2": 3, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"ll": {
		"id": 6,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -3, "y1": -1, "x2": -1, "y2": 1 }
	},
	"lu": {
		"id": 7,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -3, "x2": 1, "y2": -1 }
	},
	"ld": {
		"id": 8,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": 1, "x2": 1, "y2": 3 }
	},

	// search
	"sr": {
		"id": 9,
		"move": { "x": 0, "y": 0 }, // コマンドによる移動
		"return": { "x1": 1, "y1": 0, "x2": 9, "y2": 0 }	// コマンドの返り値の範囲 use for文
	},
	"sl": {
		"id": 10,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -9, "y1": 0, "x2": -1, "y2": 0 }
	},
	"su": {
		"id": 11,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": 0, "y1": -9, "x2": 0, "y2": -1 }
	},
	"sd": {
		"id": 12,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": 0, "y1": 1, "x2": 0, "y2": 9 }
	},

	// put
	"pr2": {
		"id": 13,
		"move": { "x": 0, "y": 0 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"pl2": {
		"id": 14,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pu2": {
		"id": 15,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pd2": {
		"id": 16,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},

	// put and walk
	"pr2wl": {
		"id": 17,
		"move": { "x": -1, "y": 0 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"pl2wr": {
		"id": 18,
		"move": { "x": 1, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pu2wd": {
		"id": 19,
		"move": { "x": 0, "y": 1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pd2wu": {
		"id": 20,
		"move": { "x": 0, "y": -1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pru2wld": {
		"id": 21,
		"move": { "x": -1, "y": 1 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"plu2wrd": {
		"id": 22,
		"move": { "x": 1, "y": 1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"prd2wlu": {
		"move": { "x": -1, "y": -1 },
		"id": 23,
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pld2wru": {
		"id": 24,
		"move": { "x": 1, "y": -1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},

	// keima
	"keiru": {
		"id": 25,
		"move": { "x": 1, "y": -2 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"keilu": {
		"id": 26,
		"move": { "x": -1, "y": -2 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"keird": {
		"id": 27,
		"move": { "x": 1, "y": 2 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"keild": {
		"id": 28,
		"move": { "x": -1, "y": 2 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
    
    //NEWCOMANDs!!
//TODO::ReturnCode is Write.
	// break
	"pr0": {
		"id": 29,
		"move": { "x": 0, "y": 0 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"pl0": {
		"id": 30,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pu0": {
		"id": 31,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pd0": {
		"id": 32,
		"move": { "x": 0, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},

	// breakwalk
	"pu0wd": {
		"id": 33,
		"move": { "x": 0, "y": 1 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }	// コマンドの返り値の範囲 use for文
	},
	"pd0wu": {
		"id": 34,
		"move": { "x": 0, "y": -1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pl0wr": {
		"id": 35,
		"move": { "x": 1, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pr0wl": {
		"id": 36,
		"move": { "x": -1, "y": 0 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pru0wld": {
		"id": 37,
		"move": { "x": -1, "y": 1 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }// コマンドの返り値の範囲 use for文
	},
	"plu0wrd": {
		"id": 38,
		"move": { "x": 1, "y": 1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"prd0wlu": {
		"id": 39,
		"move": { "x": -1, "y": -1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},
	"pld0wru": {
		"id": 40,
		"move": { "x": 1, "y": -1 },
		"return": { "x1": -1, "y1": -1, "x2": 1, "y2": 1 }
	},

	// lookdo
	"du": {
		"id": 42,
		"move": { "x": 0, "y": -1 }, // コマンドによる移動
		"return": { "x1": -1, "y1": -3, "x2": 1, "y2": -1 }	// コマンドの返り値の範囲 use for文
	},
	"dd": {
		"id": 43,
		"move": { "x": 0, "y": 1 },
		"return": { "x1": -1, "y1": 1, "x2": 1, "y2": 3 }
	},
	"dl": {
		"id": 44,
		"move": { "x": -1, "y": 0 },
		"return": { "x1": -3, "y1": -1, "x2": -1, "y2": 1 }
	},
	"dr": {
		"id": 45,
		"move": { "x": 1, "y": 0 },
		"return": { "x1": 1, "y1": -1, "x2": 3, "y2": 1 }
	}
};