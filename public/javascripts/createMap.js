var mapData = [];
var startPosition = {};
var clipBorad = 0;
var mouse = false;

$(function() {
	// inititalize
	viewMap();
	viewPlayers();
});

$('body').mousedown(function() {
	console.log('mousedown');
	mouse = true;
});

$('body').mouseup(function() {
	console.log('mouseup');
	mouse = false;
})

// アイテムをコピー
$(document).on('click', '.itemArea div div div', function() {
	var num = $(this).data('num');

	console.log(num);

	clipBorad = num;

	selectedItem(num);
});

// アイテムをコピー
$(document).on('click', '.itemArea i', function() {
	var num = $(this).data('num');

	console.log(num);

	clipBorad = num;

	selectedItem(num);
});

// アイテムを設置
$(document).on('click', '.mapArea .mapRow div div', function() {
	putItem(this);
});

// アイテムを設置
$(document).on('mouseenter', '.mapArea .mapRow div div', function() {
	if(mouse) {
		putItem(this);
	}
});

function putItem(elm) {

	var parent = $(elm).parent();

	var mapCel = clipBorad;

	var initFlag = false;

	var oldPosition = startPosition[iconName[mapCel]];

	var code = '';

	code += '<div class="base ' + className[mapCel] + '">';

	if(1000 <= mapCel) {
		// Clientを置く場合
		code += iconName[mapCel];

		// これまでのstartPostionを消す
		if(oldPosition != undefined) {
			if(mapData[oldPosition.y][oldPosition.x] == mapCel) {
				mapData[oldPosition.y][oldPosition.x] = 0;
			}
		}

		// 新しいデータに上書きする
		startPosition[iconName[mapCel]] = {'y': parent.data('y'), 'x': parent.data('x'), 'elm': elm};

		initFlag = true;
	}
	else {
		/*
		if(oldPosition != undefined) {
			if(mapData[oldPosition.y][oldPosition.x] >= 1000) {
				// アイテムを置く前の場所がクライアント
				startPosition[mapData[oldPosition.y][oldPosition.x]] = {};
			}
		}
		*/

		code += '<i class="fa fa-' + iconName[mapCel] + '"></i>';
	}

	code += '</div>';

	// コードをappend

	parent.empty();

	parent.append(code);

	// mapdataに追加
	mapData[parent.data('y')][parent.data('x')] = mapCel;

	if(initFlag){
		console.log('ini');
		viewMap();
	}
}

function selectedItem(mapCel) {

	var code = '';

	if(1000 <= mapCel) {
		// Clientを置く場合

		code += '<div class="base ' + className[mapCel] + '" data-num="' + mapCel + '">';

		code += iconName[mapCel];
	}
	else {
		code += '<div class="base ' + className[mapCel] + '">';

		code += '<i class="fa fa-' + iconName[mapCel] + '" data-num="' + mapCel + '"></i>';
	}

	code += '</div>';

	$(".selectedItem").empty();
	$(".selectedItem").append(code);
}

// Change MapSize
$('#mapSizeY').change(function() {
	viewMap();
});

$('#mapSizeX').change(function() {
	viewMap();
});

// Change Player number
$('#players').change(function() {
	viewPlayers();
});

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
    '5': 'Fossilr',
	'6': 'Fossill',
	'7': 'Fossilu',
	'8': 'Fossild',
	'1000': 'client1000',
	'2000': 'client2000',
	'3000': 'client3000',
	'4000': 'client4000',
	'5000': 'client5000',
	'6000': 'client6000',
	'7000': 'client7000',
	'8000': 'client8000'    
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
    '5': 'asterisk',
	'6': 'asterisk',
	'7': 'asterisk',
	'8': 'asterisk',
	'1000': 'C',
	'2000': 'H',
	'3000': 'a',
	'4000': 's',
	'5000': 'e',
	'6000': 'r',
	'7000': 'O',
	'8000': 'n'  
};

function viewPlayers() {

	var code = '';

	if($('#players').val() <= 0) {
		$('#players').val(1);
	}

	if($('#players').val() >= 9) {
		$('#players').val(8);
	}

	for(var i = 1; i <= $('#players').val(); i++) {

		if(1 <= i && i <= 8) {

			var clientName = i.toString() + "000";

			code += '<div class="base ' + className[clientName] + '" data-num="' + i.toString() + "000" + '">';

			code += iconName[clientName];

			code += '</div>';
		}
	}
	$('.clientArea').empty();

	$('.clientArea').append(code);
}

function viewMap() {

	var code = '';

	for(var i = 0; i < $('#mapSizeY').val(); i++){

		code += '<div class="mapRow">';

		if(mapData[i] == undefined) {
			mapData[i] = [];
		}

		for(var j = 0; j < $('#mapSizeX').val(); j++) {

			if(mapData[i][j] == undefined) {
				mapData[i][j] = 0;
			}

			var mapCel = mapData[i][j];

			code += '<div data-y="' + i + '" data-x="' + j + '"><div class="base ' + className[mapCel] + '">';

			if(1000 <= mapCel) {
				code += iconName[mapCel];
			}
			else {
				code += '<i class="fa fa-' + iconName[mapCel] + '"></i>';
			}

			code += '</div></div>';
		}
		code += '</div>';
	}

	$('.mapArea').empty();

	$('.mapArea').append(code);
}

// localに保存
$('#export').on('click', function() {

	var btn = $(this).button('loading');

	var fileData = exportFileData();

	if(fileData != '') {
		setBlobUrl('download', fileData);
	}
	else {
		console.log('no client');
		alert('マップに配置されているクライアントの数がplayersと一致しません')
	}

	btn.button('reset');
});

$('#upload').on('click', function() {

	var fileData = exportFileData();

	// ajaxでfileDataを送信
});

function setBlobUrl(id, content) {

	$('#' + id).fadeOut('fast');

	var blob = new Blob([JSON.stringify(content)], { "type": "application/json"});

	// aタグのhref属性にblobオブジェクトを設定し、リンクを生成
	window.URL = window.URL || window.webkitURL;

	$('#' + id).attr('href', window.URL.createObjectURL(blob));
	$('#' + id).attr('download', content.mapName + ".json");

	$('#' + id).fadeIn('fast');
}

function exportFileData() {

	var data = {};

	data.mapName = $('#mapName').val();

	data.mapAuthor = $('#mapAuthor').val();

	data.mapDescription = $('#mapDescription').val();

	var mapSize = {"y": $('#mapSizeY').val(), "x": $('#mapSizeX').val()};

	data.mapSize = mapSize;

	var mapInfo = {};

	var map = [];

	for(var y = 0; y < mapSize.y; y++) {
		map[y] = [];
		for(var x = 0; x < mapSize.x; x++) {
			if(mapInfo[className[mapData[y][x]]] != undefined) {
				mapInfo[className[mapData[y][x]]]++;
			}
			else {
				mapInfo[className[mapData[y][x]]] = 1;
			}

			map[y][x] = mapData[y][x];
		}
	}

	data.mapInfo = mapInfo;

	data.map = map;

	data.players = $('#players').val();

	var stPosition = {};
	console.log(startPosition);

	for(var i = 1; i <= data.players; i++) {
		var clientName = iconName[i.toString() + "000"];
		console.log(clientName);
		if(startPosition[clientName] != undefined) {
			stPosition[clientName] = {'y': startPosition[clientName].y, 'x': startPosition[clientName].x};

			if(mapData[stPosition[clientName].y][stPosition[clientName].x] != i.toString() + "000") {
				// startPostionにクライアントは存在するが、実際にマップ上にはない
				console.log('startPostionにクライアントは存在するが、実際にマップ上にはない')
				return '';
			}
		}
		else {
			// clientが存在しない
			console.log('clientが存在しない');
			return '';
		}
	}

	// overFlowしているclientを検索
	console.log('ok?');
	console.log(data.players + 1)
	for(var j = parseInt(data.players) + 1; j <= 8; j++) {
		var clientName = iconName[j.toString() + "000"];
		if(startPosition[clientName] != undefined) {
			console.log(mapData[startPosition[clientName].y][startPosition[clientName].x] );
			if(mapData[startPosition[clientName].y][startPosition[clientName].x] == j.toString() + "000") {
				return '';
			}
		}
	}

	data.startPosition = stPosition;


	console.log(data);

	return data;
}

// mapImport
$('#files').change(function(data) {
	console.log('fnit');

	var file = data.target.files[0];

	var reader = new FileReader();

	// fileの読み込みが完了したら呼ばれる非同期の関数
	reader.onload = function(evt) {

		var map = evt.target.result;

		map = JSON.parse(map);

		if(window.confirm('インポートされたマップで現在のマップを上書きしてもよろしいですか?') == true) {

			console.log(map);

			$('#mapName').val(map.mapName);
			$('#mapAuthor').val(map.mapAuthor);
			$('#mapDescription').val(map.mapDescription);
			$('#mapSizeX').val(map.mapSize.x);
			$('#mapSizeY').val(map.mapSize.y);
			$('#players').val(map.players);

			mapData = map.map;
			startPosition = map.startPosition;

			viewMap();
			viewPlayers();
		}
	}

	reader.readAsText(file);
});
