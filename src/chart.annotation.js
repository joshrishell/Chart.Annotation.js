// Get the chart variable
var Chart = require('chart.js');
Chart = typeof(Chart) === 'function' ? Chart : window.Chart;
var helpers = Chart.helpers;
var isArray = helpers.isArray;

var horizontalKeyword = 'horizontal';
var verticalKeyword=  'vertica';

// Take the zoom namespace of Chart
Chart.Annotation = Chart.Annotation || {};

// Default options if none are provided
var defaultOptions = Chart.Annotation.defaults = {
	annotations: [] // default to no annotations
};

var LineAnnotation = Chart.Element.extend({

	draw: function(ctx) {
		var view = this._view;

		// Canvas setup
		ctx.lineWidth = view.borderWidth;
		ctx.strokeStyle = view.borderColor;

		// Draw
		ctx.beginPath();
		ctx.moveTo(view.x1, view.y1);
		ctx.lineTo(view.x2, view.y2);
		ctx.stroke();
	}
});

function lineUpdate(obj, options, chartInstance) {
	var model = obj._model = obj._model || {};

	var scale = chartInstance.scales[options.scaleID];
	var pixel = scale ? scale.getPixelForValue(options.value) : NaN;
	var chartArea = chartInstance.chartArea;

	if (!isNaN(pixel)) {
		if (options.mode == horizontalKeyword) {
			model.x1 = chartArea.left;
			model.x2 = chartArea.right;
			model.y1 = model.y2 = pixel;
		} else {
			model.y1 = chartArea.top;
			model.y2 = chartArea.bottom;
			model.x1 = model.x2 = pixel;
		}
	}

	model.borderColor = options.borderColor;
	model.borderWidth = options.borderWidth;
}

// Map of all types
var annotationTypes = Chart.Annotation.annotationTypes = {
	line: LineAnnotation
};

// Map of all update functions
var updateFunctions = Chart.Annotation.updateFunctions = {
	line: lineUpdate,
};

// Chartjs Zoom Plugin
var AnnotationPlugin = Chart.PluginBase.extend({
	beforeInit: function(chartInstance) {
		var options = chartInstance.options;
		options.annotation = helpers.configMerge(options.annotation, Chart.Annotation.defaults);

		var annotationConfigs = options.annotation.annotations;
		if (isArray(annotationConfigs)) {
			var annotationObjects = chartInstance._annotationObjects = [];

			annotationConfigs.forEach(function(configuration, i) {
				var Constructor = annotationTypes[configuration.type];
				if (Constructor) {
					annotationObjects.push(new Constructor({
						_index: i
					}));
				}
			});
		}
	},
	afterScaleUpdate: function(chartInstance) {
		// Once scales are ready, update 
		var annotationObjects = chartInstance._annotationObjects;
		var annotationOpts = chartInstance.options.annotation;

		if (isArray(annotationObjects)) {
			annotationObjects.forEach(function(annotationObject, i) {
				var opts = annotationOpts.annotations[annotationObject._index];
				var updateFunction = updateFunctions[opts.type];

				if (updateFunction) {
					updateFunction(annotationObject, opts, chartInstance);
				}
			});
		}
	},

	afterDraw: function(chartInstance, easingDecimal) {
		// If we have annotations, draw them
		var annotationObjects = chartInstance._annotationObjects;
		if (isArray(annotationObjects)) {
			var ctx = chartInstance.chart.ctx;

			annotationObjects.forEach(function(obj) {
				obj.transition(easingDecimal).draw(ctx);
			});
		}
	}
});

Chart.pluginService.register(new AnnotationPlugin());