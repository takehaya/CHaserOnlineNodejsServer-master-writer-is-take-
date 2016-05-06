$(function() {
	getMapInfo();
	$('#mapDownload').attr('href', '/maps/' + $('#mapList').val());
});

$('#mapList').change(function() {
	getMapInfo();
	$('#mapDownload').attr('href', '/maps/' + $('#mapList').val());
});

function getMapInfo() {
	$.ajax({
		url: '/maps/' + $('#mapList').val(),
		type: 'get',
		dataType: 'json',
		success: function(data, textStatus) {
		    console.log(data);
		    if(data != undefined) {
				updateInfo(data);
				viewMap(data);
		    }
		},
		error: function(err) {
		    console.log(err);
		}
	});
}

function updateInfo(room) {

	$('.mapNameArea').empty();
	$('.mapNameArea').append(room.mapName);

	$('.mapAuthorArea').empty();
	$('.mapAuthorArea').append(room.mapAuthor);

	$('.mapDescriptionArea').empty();
	$('.mapDescriptionArea').append(room.mapDescription);

	$('.mapSizeXArea').empty();
	$('.mapSizeXArea').append(room.mapSize.x);

	$('.mapSizeYArea').empty();
	$('.mapSizeYArea').append(room.mapSize.y);

	$('.mapInfoArea').empty();
	$('.mapInfoArea').append(JSON.stringify(room.mapInfo));

	$('.startPositionArea').empty();
	$('.startPositionArea').append(JSON.stringify(room.startPosition));
}

function viewMap(room) {

	var code = '';

	for(var i = 0; i < room.mapSize.y; i++){

		code += '<div class="mapRow">';

		for(var j = 0; j < room.mapSize.x; j++) {

			var mapCel = room.map[i][j];

			// クライアントがいるかどうか調べる
			var clientFlag = false;
			var who = '';

			Object.keys(room.startPosition).forEach(function(key) {
				if(room.startPosition[key].y == i && room.startPosition[key].x == j) {

					clientFlag = true;
					who = key;
				}
			});

			if(clientFlag) {
				code += '<div data-y="' + i + '" data-x="' + j + '"><div class="base ' + clientReName[who] + '">';
				code += who;
			}
			else {
				code += '<div data-y="' + i + '" data-x="' + j + '"><div class="base ' + className[mapCel] + '">';
				code += '<i class="fa fa-' + iconName[mapCel] + '"></i>';
			}

			code += '</div></div>';
		}
		code += '</div>';
	}

	$('.mapArea').empty();

	$('.mapArea').append(code);
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