import sketch from 'sketch'
import {sortElements, populateInstancesOfHolder, interpretLayer, interpretSymbolInstance, checkforTextChildren, checkName, addElement} from './shared.js'

const elements = [];

export default function() {

  const doc = sketch.getSelectedDocument()
  const page = doc.selectedPage
  const selectedLayers = doc.selectedLayers
  const selectedCount = selectedLayers.length

  for (var artboard of page.layers) {
  	populateInstancesOfHolder(artboard);
  }

  var object = {};
  elements.sort(sortElements);

  for (var i = 0; i < elements.length; i++)
  {
  		var element = elements[i];
  		addElement(object, element);
  }

  exportCSV(object);
}

function exportCSV(object) {
	var csv = [];
	csv[0] = [];
	csv[1] = [];

	for (var child in object)
	{
		csv[0].push('"' + child + '"');
		csv[1].push('"' + object[child] + '"');
	}

	csv[0] = csv[0].join(',');
	csv[1] = csv[1].join(',');
	
	var csvString = csv.join('\n');

	var savePanel = NSSavePanel.savePanel()
    savePanel.allowedFileTypes = ["csv"]
    savePanel.nameFieldStringValue = "master_copy"

	var file = NSString.stringWithString(csvString);

    // Launching alert
    var result = savePanel.runModal()
    if (result == NSFileHandlingPanelOKButton) {
        file.writeToFile_atomically_encoding_error(savePanel.URL().path(),
                                                     true, NSUTF8StringEncoding, null)

	    var alertMessage = "Master Copy CSV saved to: " + savePanel.URL().path();
	    sketch.UI.message(alertMessage);
    }
}