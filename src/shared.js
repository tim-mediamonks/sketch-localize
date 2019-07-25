import sketch from 'sketch'
const elements = [];

export function sortElements( a, b ) {
	if ( a.type > b.type ){
		return -1;
	}
	else if ( a.type < b.type ){
		return 1;
	}
	else {
		if ( a.name < b.name ){
			return -1;
		}
		else if ( a.name > b.name ){
			return 1;
		}
		return 0;
	}
}

export function populateInstancesOfHolder(holder) {
	if (holder.layers) {
		for (var layer of holder.layers) {
	  		if (layer.type == "Group") populateInstancesOfHolder(layer);
	  		else if (layer.type == "Text" || layer.type == "ShapePath") interpretLayer(layer);
	  		else if (layer.type == "SymbolInstance") interpretSymbolInstance(layer);
	  	}
	  }
}

export function interpretLayer(layer) {
	if (checkName(layer))
		elements.push(layer);
}

export function interpretSymbolInstance(layer) {
	if (checkforTextChildren(layer.master)) {
		if (checkName(layer))
			elements.push(layer);
	}
}

export function checkforTextChildren(instance) {
	var hasText = false;

	if (instance.layers) {
	    for (var layer of instance.layers){
	        if (layer.type == "SymbolInstance" || layer.type == "Group") hasText = hasText | checkforTextChildren(layer);
	        else if (layer.type == "Text") hasText = true;
	    }
	}

	return hasText;
}

export function checkName(layer) {
	if (!RegExp('\{\w*\s*\S*.*\?\}').test(layer.name)) {
		var type = layer.type;
		var name = layer.name;

		while (layer.type != "Artboard") {
			layer = layer.parent;
			name = layer.name + '.' + name;
		}

		sketch.UI.message(type + " layer found without proper naming: " + name);
		return false;
	}

	return true;
}

export function addElement(object, layer) {
	if (layer.type == "Text") {
		object[layer.name.split('?')[0].split('{')[1]] = layer.text;
	}
	else if (layer.type == "ShapePath") {
		object[layer.name.split('?')[0].split('{')[1]] = "";
	}
	else if (layer.type == "SymbolInstance") {
		var value = '';

		for (var override of layer.overrides) {
			if (override.property == "stringValue") {
				value = override.value;
				object[layer.name.split('?')[0].split('{')[1] + "_" + override.affectedLayer.name] = value;
			}
		}
	}
}