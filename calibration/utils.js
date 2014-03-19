

function setDuration (numHours, numMinutes, numSeconds){

	var ts = new Date();

	var minutes = (ts.getMinutes()-numMinutes) >0 ? (ts.getMinutes()-numMinutes) : 0
	var seconds = (ts.getSeconds()-numSeconds) >0 ? (ts.getSeconds()-numSeconds) : 0
	var hours 	= (ts.getHours()-numHours) >0 ? (ts.getHours()-numHours) : 0

	//FIXME: Get rid off the -1 from getDate and -2 from hours
	timestamp = ts.getFullYear()+"-"+(ts.getMonth()+1)+"-"+(ts.getDate())+" "+hours+":"+ minutes	+":"+seconds;
	// timestamp = ts.getFullYear()+"-"+(ts.getMonth()+1)+"-"+(ts.getDate()-2)+" "+(13)+":"+ minutes	+":"+seconds;
	return timestamp
}

function parseData(data){
	var nodes = new Array();
	var links = new Array();

	//TODO: Implement the 'Listeners' in DB. These will be the RPi routers running Airckrack-ng
	nodes.push({'name' : "Listener", 'power': 1, 'kind': "Listener"});

	for (var i = 0; i < data.length; i++) {

		var node = JSON.parse(data[i])

		//Renaming BSSID to name as thats what D3 force stuff expects
		var n = {'name' : $.trim(node.BSSID), 'power': node.power, 'kind': node.kind};
		nodes.push(n);
		link = {'source' : 0, 'target': i, 'power':node.power};
		links.push(link);

	};

	calibration.data = {'nodes' : nodes, 'links': links}
}


function parseDataWithChildren(data){
	var nodes = new Array();
	// var links = new Array();

	var associated = new Array();

	//TODO: Implement the 'Listeners' in DB. These will be the RPi routers running Airckrack-ng

	nodes.push({'name' : "Listener", 'power': 1, 'kind': "Listener", 'weight': 0});
	nodes[0].children = new Array();

	for (var i = 0; i < data.length-20; i++) {

		var node = JSON.parse(data[i])

		if(node.kind == "Client"){
			var AP = node.AP.split("|");
			ap = $.trim(AP[0]);

			if(!  (ap === "(not associated)") ){
				associated.push(node);
				continue;
			}


		}

		//Renaming BSSID to name as thats what D3 force stuff expects
		var n = {'name' : $.trim(node.BSSID), 'power': node.power, 'kind': node.kind};
		nodes[0].children.push(n);


	};

	for(var j=0; j<nodes.length; j++){

		if(nodes[j].kind == "Client"){
			continue;
		}

		for(var i=0; i< associated.length; i++){

			var AP = associated[i].AP.split("|");
			var ap = $.trim(AP[0]);
			// console.log(nodes[j].name + " : "+ ap);
			if(nodes[j].name === ap){

					var node = associated[i];
					var n = {'name' : $.trim(node.BSSID), 'power': node.power, 'kind': node.kind};

					if(nodes[j].hasOwnProperty("children")){
							nodes[j].children.push(n);
					}
					else{
						nodes[j].children = new Array();
						nodes[j].children.push(n);
					}

					// console.log( "Adding node : " + n.name +" to " + nodes[j].name  );
					// console.log(nodes[j]);
			}

		}
	}

	calibration.data = {'nodes' : nodes}
}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return node.size;
  }

  root.size = recurse(root);
	console.log(nodes);
  return nodes;
}

var scale = d3.scale.pow()
	.domain([0,-128])
	.range([100,250]);

var colors = d3.scale.category20c();

function childrenColor(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}