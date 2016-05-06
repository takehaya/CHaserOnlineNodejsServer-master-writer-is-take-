// ルールを定義

// 動作得点の定義 : 各コマンド実行時の得点の加減についての規定
var walkPoint = -2;
var searchPoint = -5;
var lookPoint = -10;
var putPoint = -100;
var putAndWalkPoint = -102;
var keimaPoint = -1;
var breakPoint = -1;
var breakwalkPoint = -2;
var lookwalkPoint = -6;

var actionPoint = {
	"wr": { "id": 1, "point": walkPoint, "shortName": "wr" },
	"wl": { "id": 2, "point": walkPoint, "shortName": "wl" },
	"wu": { "id": 3, "point": walkPoint, "shortName": "wu" },
	"wd": { "id": 4, "point": walkPoint, "shortName": "wd" },
	"sr": { "id": 5, "point": searchPoint, "shortName": "sr" },
	"sl": { "id": 6, "point": searchPoint, "shortName": "sl" },
	"su": { "id": 7, "point": searchPoint, "shortName": "su" },
	"sd": { "id": 8, "point": searchPoint, "shortName": "sd" },
	"lr": { "id": 9, "point": lookPoint, "shortName": "lr" },
	"ll": { "id": 10, "point": lookPoint, "shortName": "ll" },
	"lu": { "id": 11, "point": lookPoint, "shortName": "lu" },
	"ld": { "id": 12, "point": lookPoint, "shortName": "ld" },
	"pr2": { "id": 13, "point": putPoint, "shortName": "pr2" },
	"pl2": { "id": 14, "point": putPoint, "shortName": "pl2" },
	"pu2": { "id": 15, "point": putPoint, "shortName": "pu2" },
	"pd2": { "id": 16, "point": putPoint, "shortName": "pd2" },
	"pr2wl": { "id": 17, "point": putAndWalkPoint, "shortName": "pr2wl" },
	"pl2wr": { "id": 18, "point": putAndWalkPoint, "shortName": "pl2wr" },
	"pu2wd": { "id": 19, "point": putAndWalkPoint, "shortName": "pu2wd" },
	"pd2wu": { "id": 20, "point": putAndWalkPoint, "shortName": "pd2wu" },
	"pru2wld": { "id": 21, "point": putAndWalkPoint, "shortName": "pru2wld" },
	"plu2wrd": { "id": 22, "point": putAndWalkPoint, "shortName": "plu2wrd" },
	"prd2wlu": { "id": 23, "point": putAndWalkPoint, "shortName": "prd2wlu" },
	"pld2wru": { "id": 24, "point": putAndWalkPoint, "shortName": "pld2wru" },
	"keiru": { "id": 25, "point": keimaPoint, "shortName": "keiru" },
	"keilu": { "id": 26, "point": keimaPoint, "shortName": "keilu" },
	"keird": { "id": 27, "point": keimaPoint, "shortName": "keird" },
	"keild": { "id": 28, "point": keimaPoint, "shortName": "keild" },

	//newcomands addtion for 2016chasers
	"pr0": { "id": 29, "point": breakPoint, "shortName": "pr0" },
	"pl0": { "id": 30, "point": breakPoint, "shortName": "pl0" },
	"pu0": { "id": 31, "point": breakPoint, "shortName": "pu0" },
	"pd0": { "id": 32, "point": breakPoint, "shortName": "pd0" },
	"pu0wd": { "id": 33, "point": breakwalkPoint, "shortName": "pu0wd" },
	"pd0wu": { "id": 34, "point": breakwalkPoint, "shortName": "pd0wu" },
	"pl0wr": { "id": 35, "point": breakwalkPoint, "shortName": "pl0wr" },
	"pr0wl": { "id": 36, "point": breakwalkPoint, "shortName": "pr0wl" },
	"pru0wld": { "id": 37, "point": breakwalkPoint, "shortName": "pru0wld" },
	"plu0wrd": { "id": 38, "point": breakwalkPoint, "shortName": "plu0wrd" },
	"prd0wlu": { "id": 39, "point": breakwalkPoint, "shortName": "prd0wlu" },
	"pld0wru": { "id": 40, "point": breakwalkPoint, "shortName": "pld0wru" },
	"du": { "id": 41, "point": lookwalkPoint, "shortName": "du" },
	"dd": { "id": 42, "point": lookwalkPoint, "shortName": "dd" },
	"dl": { "id": 43, "point": lookwalkPoint, "shortName": "dl" },
	"dr": { "id": 44, "point": lookwalkPoint, "shortName": "dr" }
};

// コマンドが表す内容 (wuコマンドはy座標を-1するなどの規定)
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

// アイテム得点の一覧(現在いるセルの得点)
var itemPoint = {
	"-1": {
		"name": "nothing",
		"point": -300
	},
	"0": {
		"name": "blank",
		"point": -9
	},
	"1": {
		"name": "Target",
		"point": 50
	},
	"2": {
		"name": "block",
		"point": -20
	},
	"3": {
		"name": "item",
		"point": 10
	},
	"20": {
		"name": "warpr10",
		"point": -1
	},
	"21": {
		"name": "warpl10",
		"point": -1
	},
	"22": {
		"name": "warpu10",
		"point": -1
	},
	"23": {
		"name": "warpd10",
		"point": -1
	},
	"30": {
		"name": "warpr5",
		"point": -1
	},
	"31": {
		"name": "warpl5",
		"point": -1
	},
	"32": {
		"name": "warpu5",
		"point": -1
	},
	"33": {
		"name": "warpd5",
		"point": -1
	},
	"1000": {
		"name": "Client001",
		"point": 0
	},
	"2000": {
		"name": "Client002",
		"point": 0
	},
	"3000": {
		"name": "Client003",
		"point": 0
	},
	"4000": {
		"name": "Client004",
		"point": 0
	},
	"5000": {
		"name": "Client005",
		"point": 0
	},
	"6000": {
		"name": "Client006",
		"point": 0
	},
	"7000": {
		"name": "Client007",
		"point": 0
	},
	"8000": {
		"name": "Client008",
		"point": 0
	},

	"5": {
		"name": "Fossilr",
		"point": 150
	},
	"6": {
		"name": "Fossill",
		"point": 150
	},
	"7": {
		"name": "Fossilu",
		"point": 150
	},
	"8": {
		"name": "Fossild",
		"point": 150
	}
};

// アイテムを取得した後の自分の座標 for mainly wrap
var afterItemMethod = {
	"-1": {
		"name": "Out",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0	// 地形の変化
	},
	"0": {
		"name": "blank",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"1": {
		"name": "Target",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"2": {
		"name": "block",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"3": {
		"name": "item",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 2
	},
	"20": {
		"name": "warpr10",
		"move": { "x": 10, "y": 0 },
		"changeCurrent": 0
	},
	"21": {
		"name": "warpl10",
		"move": { "x": -10, "y": 0 },
		"changeCurrent": 0
	},
	"22": {
		"name": "warpu10",
		"move": { "x": 0, "y": -10 },
		"changeCurrent": 0
	},
	"23": {
		"name": "warpd10",
		"move": { "x": 0, "y": 10 },
		"changeCurrent": 0
	},
	"30": {
		"name": "warpr5",
		"move": { "x": 5, "y": 0 },
		"changeCurrent": 0
	},
	"31": {
		"name": "warpl5",
		"move": { "x": -5, "y": 0 },
		"changeCurrent": 0
	},
	"32": {
		"name": "warpu5",
		"move": { "x": 0, "y": -5 },
		"changeCurrent": 0
	},
	"33": {
		"name": "warpd5",
		"move": { "x": 0, "y": 5 },
		"changeCurrent": 0
	},
	"1000": {
		"name": "Client001",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"2000": {
		"name": "Client002",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"3000": {
		"name": "Client003",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"4000": {
		"name": "Client004",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"5000": {
		"name": "Client005",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"6000": {
		"name": "Client006",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"7000": {
		"name": "Client007",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"8000": {
		"name": "Client008",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},

	"5": {
		"name": "Fossilr",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0	// 地形の変化
	},
	"6": {
		"name": "Fossill",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"7": {
		"name": "Fossilu",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	},
	"8": {
		"name": "Fossild",
		"move": { "x": 0, "y": 0 },
		"changeCurrent": 0
	}
};

// プットにより獲得できる点数
var getPoint = 10;
// プットにより与えるダメージ
var damage = 10;

var block = 2;

// break動作処理
var breakAction = {
	"pr0": {
		"target":{ "x": 1, "y": 0 }
	},
	"pl0": {
		"target":{ "x": -1, "y": 0 }
	},
	"pu0": {
		"target":{ "x": 0, "y": -1 }
	},
	"pd0": {
		"target":{ "x": 0, "y": 1 }
	},

	// breakwalk
	"pu0wd": {
		"target":{ "x": 0, "y": 1 }
	},
	"pd0wu": {
		"target":{ "x": 0, "y": -1 }
	},
	"pl0wr": {
		"target":{ "x": -1, "y": 0 }
	},
	"pr0wl": {
		"target":{ "x": 1, "y": 0 }
	},
	"pru0wld": {
		"target":{ "x": 1, "y": -1 }
	},
	"plu0wrd": {
		"target":{ "x": -1, "y": -1 }
	},
	"prd0wlu": {
		"target":{ "x": 1, "y": 1 }
	},
	"pld0wru": {
		"target":{ "x": -1, "y": 1 }
	}
};


// Put動作処理
var putAction = {
	"pu2": {
		"target": { "x": 0, "y": -1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pl2": {
		"target": { "x": -1, "y": 0 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pr2": {
		"target": { "x": 1, "y": 0 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pd2": {
		"target": { "x": 0, "y": 1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pr2wl": {
		"target": { "x": 1, "y": 0 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pl2wr": {
		"target": { "x": -1, "y": 0 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pu2wd": {
		"target": { "x": 0, "y": -1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pd2wu": {
		"target": { "x": 0, "y": 1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pru2wld": {
		"target": { "x": 1, "y": -1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"plu2wrd": {
		"target": { "x": -1, "y": -1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"prd2wlu": {
		"target": { "x": 1, "y": 1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	},
	"pld2wru": {
		"target": { "x": -1, "y": 1 },
		"putCharactor": block,
		"getPoint": getPoint,
		"damage": damage
	}
};

// putによって獲得するポイント and 与えるダメージ
var putPoint = {
	"damage": function(base, turn) {

		// 与えるダメージは基礎点 × 残りターン数
		return base * turn;
	},
	"getPoint": function(base, turn) {

		// もらえるポイントは基礎点 × 残りターン数
		return base * turn;
	}
};

// 試合時に使用されるルールの定義
var config = {
	"actionPoint": actionPoint,	// 動作得点の定義,
	"afterActionMethod": afterActionMethod,	// コマンドが表す内容 (wuコマンドはy座標を-1するなどの規定)
	"itemPoint": itemPoint,	// アイテム得点の一覧(現在いるセルの得点)
	"afterItemMethod": afterItemMethod,	// アイテムを取得した後の自分の座標
	"putAction": putAction,	// Put動作処理 (プットによるダメージと方向)
	"putPoint": putPoint	// putによって獲得するポイント and 与えるダメージ
};

module.exports = config;
