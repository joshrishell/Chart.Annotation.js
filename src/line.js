// Line Annotation implementation
module.exports = function(Chart) {
	var horizontalKeyword = 'horizontal';
	var verticalKeyword = 'vertical';

	var LineAnnotation = Chart.Element.extend({

		draw: function(ctx) {
			var view = this._view;

			// Canvas setup
			ctx.lineWidth = view.borderWidth;
			ctx.strokeStyle = view.borderColor;

			if (view.borderSetDash) {
				ctx.setLineDash(view.borderSetDash);
			}
			// Draw
			ctx.beginPath();
			ctx.moveTo(view.x1, view.y1);
			ctx.lineTo(view.x2, view.y2);
			ctx.stroke();
			ctx.setLineDash([]);
		}
	});

	function lineUpdate(obj, options, chartInstance) {
		var model = obj._model = obj._model || {};

		var scale = chartInstance.scales[options.scaleID];
		var scaleMax = chartInstance.scales[options.maxScaleID];
		var pixel = scale ? scale.getPixelForValue(options.value) : NaN;
		var pixelMax = scale ? scaleMax.getPixelForValue(options.maxValue) : NaN;
		var chartArea = chartInstance.chartArea;

		if (!isNaN(pixel)) {
			if (options.mode == horizontalKeyword) {
				model.x1 = chartArea.left;
				model.x2 = pixelMax || chartArea.right;
				model.y1 = model.y2 = pixel;
			} else {
				model.y1 = pixelMax || chartArea.top;
				model.y2 = chartArea.bottom;
				model.x1 = model.x2 = pixel;
			}
		}

		model.borderColor = options.borderColor;
		model.borderWidth = options.borderWidth;
		model.borderSetDash = options.borderSetDash;
	}


	return {
		Constructor: LineAnnotation,
		update: lineUpdate
	};
};
