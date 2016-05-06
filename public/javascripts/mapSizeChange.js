var baseFontSize = 23;
var baseWidth = 30; 
var baseHeight = 30;


$('.mapSizeChangeArea').on('click', function() {

	if(baseFontSize >= 8) {

		if($(this).data('size') == 'smaller') {
			console.log('in')

			baseFontSize -= 3;
			baseWidth -= 3;
			baseHeight -= 3;
		}
	}		

	if($(this).data('size') == 'larger') {

		baseFontSize += 3;
		baseWidth += 3;
		baseHeight += 3;
	}

	reDraw();
});

function reDraw() {
	$('.base').attr('style', 'font-size:' + baseFontSize + 'px;width:' + baseWidth + 'px;height:' + baseHeight + 'px;');
}