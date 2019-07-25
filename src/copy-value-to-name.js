import sketch from 'sketch'

const elements = [];

export default function() {

  const doc = sketch.getSelectedDocument()
  const page = doc.selectedPage
  const selectedLayers = doc.selectedLayers
  const selectedCount = selectedLayers.length

  for (var artboard of page.layers) {
  	populateInstancesOfHolder(artboard);
  }

  for (var i = 0; i < elements.length; i++)
  {
  		var element = elements[i];
  		renameTextLayer(element);
  }

  var alertMessage = elements.length + "Text Layers renamed";
  sketch.UI.message(alertMessage);
}

function populateInstancesOfHolder(holder) {
	if (holder.layers) {
		for (var layer of holder.layers) {
	  		if (layer.type == "Group") populateInstancesOfHolder(layer);
	  		else if (layer.type == "Text") addTextLayer(layer, elements);
	  		else if (layer.type == "SymbolInstance") interpretSymbolInstance(layer);
	  		}
	  }
}

function addTextLayer(layer) {
	elements.push(layer);
}

function renameTextLayer(layer) {
	layer.name = layer.text;
}

function interpretSymbolInstance(layer) {
	if (checkforTextChildren(layer)) {
		addTextLayer(layer);
	}
}

function checkforTextChildren(instance) {
	var hasText = false;

	if (instance.layers) {
	    for (var layer of instance.layers){
	        if (layer.type == "SymbolInstance" || layer.type == "Group") hasText = hasText | checkforTextChildren(layer);
	        else if (layer.type == "Text") hasText = true;
	    }
	}

	return hasText;
}