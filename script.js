var svgContainer,
	axisLength = 550,
	axisMaxValue = 400,
	startPoint = {
		x: 50,
		y: 600
	},
	linesCount = 4,
	scale = 1,
	syntaxTree;

var colors = [
	"red", 
 	"brown",
 	"blue", 
 	"purple", 
 	"yellow", 
 	"orange", 
 	"gray", 
 	"green", 
 	"crimson", 
 	"lavender"	
 	];
 var lines = [];

function onLoad (){

	svgContainer = d3.select("div")
	.append("svg")                   
	.attr("width", 650)
	.attr("height", 650);

	scale = getScale();

	drawCoordinateAxes(axisLength, {x0: 50, y0: 600}, scale);		
	syntaxTree = buildSyntaxTree();
}

function check() {
	lines = [];
	for(var i = 0; i < linesCount; i++) {
		var input_string = document.getElementById("L" + (i + 1)).value;
		console.log(input_string);
		var line_array = [];
		var line_strings = input_string.split(';');

		line_strings.forEach(l_str => {
			var point_array = [];
			var point_strings = l_str.split(' ');

			point_strings.forEach(p_str => {
				var coordinate_array = [];
				var coordinate_strings = p_str.split(',');

				coordinate_strings.forEach(c_str => coordinate_array.push(parseInt(c_str)));
				point_array.push({
					x: coordinate_array[0],
					y: coordinate_array[1]
				});
			});
			line_array.push(point_array);
		});

		lines.push(line_array);
	}
	console.log(lines);
	drawLetter();
	var result = checkLetter(syntaxTree, "any", "any");
	if(!!(result)) {
		alert("Letter N");
		return;
	}
	alert("Unknown letter");
}

function isAbove(point1, point2) {
	if(point1.y >= point2.y) {
		return true;
	}
	else {
		return false;
	}
}

function isLeft(point1, point2) {
	if(point1.x <= point2.x) {
		return true;
	} else {
		return false;
	}
}

function isBelow(point1, point2) {
	if(point1.y <= point2.y) {
		return true;
	} else {
		return false;
	}
}

function checkLetter(head, requiredX, requiredY){
	if(head.value && head.value.length && (typeof head.value[0] === "function")) {
		var temp_required_lx = "any",
		    temp_required_ly = "any",
		    temp_required_rx = "any",
		    temp_required_ry = "any";
		head.value.forEach(f => {
			switch(f) {
				case isBelow: 
				temp_required_ly = "max";
				temp_required_ry = "max";
				break
				case isAbove: 
				temp_required_ly = "min";
				temp_required_ry = "max";
				break
				case isLeft: 
				temp_required_lx = "max";
				temp_required_rx = "min";
				if(head.value[0] === isAbove){
					temp_required_ry = "min";
				} else {
					temp_required_ry = "max";
				}
				break;
			}
		});
		var temp_result = true;
		var left_result = checkLetter(head.left, temp_required_lx, temp_required_ly);
		var right_result = checkLetter(head.right, temp_required_rx, temp_required_ry);
		if(!!(left_result) && !!(right_result)) {
			head.value.forEach( f => {
				temp_result = temp_result && !!(f(left_result, right_result));
			});

			if(temp_result) {
				var result = {};
				switch(requiredX) {
					case "max" : result.x = getMaxPointsX(left_result, right_result);
					break;
					case "min" : result.x = getMinPointsX(left_result, right_result);
					break;
					case "any" : result.x = getAnyPointsX(left_result, right_result);
					break;
				}
				switch(requiredY) {
					case "max" : result.y = getMaxPointsY(left_result, right_result);
					break;
					case "min" : result.y = getMinPointsY(left_result, right_result);
					break;
					case "any" : result.y = getAnyPointsY(left_result, right_result);
					break;
				}
				return result;
			} else {
				return null;
			}
		} else {
			return null
		}
	} else {
		var result = {};
		switch(requiredX) {
			case "max" : result.x = getMaxPointsX(lines[head.value[0]][head.value[1]][0], lines[head.value[0]][head.value[1]][1]);
			break;
			case "min" : result.x = getMinPointsX(lines[head.value[0]][head.value[1]][0], lines[head.value[0]][head.value[1]][1]);
			break;
			case "any" : result.x = getAnyPointsX(lines[head.value[0]][head.value[1]][0], lines[head.value[0]][head.value[1]][1]);
		}
		switch(requiredY) {
			case "max" : result.y = getMaxPointsY(lines[head.value[0]][head.value[1]][0], lines[head.value[0]][head.value[1]][1]);
			break;
			case "min" : result.y = getMinPointsY(lines[head.value[0]][head.value[1]][0], lines[head.value[0]][head.value[1]][1]);
			break;
			case "any" : result.y = getAnyPointsY(lines[head.value[0]][head.value[1]][0], lines[head.value[0]][head.value[1]][1]);
		}
		return result;
	}
}

//////////////////////////////////////////////////

function getMaxPointsX(point1, point2) {
	if(point1.x >= point2.x) {
		return point1.x;
	}
	return point2.x;
}

function getMinPointsX(point1, point2) {
	if(point1.x <= point2.x) {
		return point1.x;
	}
	return point2.x;
}

function getAnyPointsX(point1, point2) {
	return point1.x;
}

function getMaxPointsY(point1, point2) {
	if(point1.y >= point2.y) {
		return point1.y;
	}
	return point2.y;
}

function getMinPointsY(point1, point2) {
	if(point1.y <= point2.y) {
		return point1.y;
	}
	return point2.y;
}

function getAnyPointsY(point1, point2) {
	return point1.y;
}

///////////////////////////////////////////////////

function buildSyntaxTree() {
	var tree = 
	{
		value : [isLeft],
		left : {
			value : [2, 0]
		},
		right : {
			value : [isLeft],
			left : {
				value : [isAbove],
				left : {
					value : [isAbove, isLeft],
					left : {
						value : [0, 0]
					},
					right : {
						value : [isAbove, isLeft],
						left : {
							value : [1, 0]
						},
						right : {
							value : [isBelow, isLeft],
							left : {
								value : [3, 0]
							},
							right : {
								value : [isBelow, isLeft],
								left : {
									value : [1, 2]
								},
								right : {
									value : [0, 2]
								}
							}
						}
					}
				},
				right : {
					value : [isBelow, isLeft],
					left : {
						value : [0, 1]
					},
					right : {
						value : [isBelow, isLeft],
						left : {
							value : [1, 1]
						},
						right : {
							value : [isAbove, isLeft],
							left : {
								value : [3, 1]
							},
							right : {
								value : [isAbove, isLeft],
								left : {
									value : [1, 3]
								},
								right : {
									value : [0, 3]
								}
							}
						}
					}
				}
			},
			"right" : {
				"value" : [2, 1]
			}
		}
	};
	console.log(tree);
	return tree;
}

//////////////////////DRAWING//////////////////////
function drawLetter() {
	lines.forEach(line_array => {
		line_array.forEach(line => {
			drawLine(line[0], line[1], "green", 2);
		})
	});
}

function getScale(){
	return axisLength/axisMaxValue;
}

function drawResults(message) {
	message = "empty input";
	d3.select("[id=result]").append("text")
	.text("Result: " + message);
}

function drawCoordinateAxes(length, startPoint, scale) {
	var xScale = d3.scaleLinear().domain([0, length/scale]).range([0, length]);
    var yScale = d3.scaleLinear().domain([0, length/scale]).range([length, 0]);
 	var xAxis = d3.axisBottom().scale(xScale);
 	var yAxis = d3.axisLeft().scale(yScale);

	
	var yAxisGroup = svgContainer
	.append("g")								 
	.attr('class', 'axis')
	.attr('transform', 'translate(' + startPoint.x0 + ',50)')
 	.call(yAxis);

	var xAxisGroup = svgContainer
	.append("g")
	.attr('class', 'axis')
	.attr('transform', 'translate(' + startPoint.x0 + ',' + startPoint.y0 + ')')
	.call(xAxis);
}

function drawPoints(functionResults, color) {
	functionResults.forEach((point) =>  {	
		//if (startPoint.y - (point.y * scale) < startPoint.y){
			drawPoint(point, color);
		//}			
	});
}

function drawPoint(point, color, size) {
	svgContainer.append("circle")
	.attr("cx", point.x * scale + startPoint.x)
	.attr("cy", startPoint.y - (point.y * scale)) 
	.attr("r", size || 1)
	.style("fill", color);
}

function drawLine(point1, point2, color, size) {	
	svgContainer.append("line")
    .attr("x1", point1.x * scale + startPoint.x)
    .attr("y1", startPoint.y - (point1.y * scale))
    .attr("x2", point2.x * scale + startPoint.x)
    .attr("y2",  startPoint.y - (point2.y * scale))
    .attr("stroke-width", size || 1)
    .attr("stroke", color|| "black");
}

/////////////////////////////////////////////////////////////
function randomInRange(min, max) {
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}