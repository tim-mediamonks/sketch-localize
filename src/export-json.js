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

  exportJSON(object);
}

function exportJSON(object) {
	
	var savePanel = NSSavePanel.savePanel()
    savePanel.allowedFileTypes = ["json"]
    savePanel.nameFieldStringValue = "master_copy"

    var file = NSString.stringWithString(JSON.stringify(object, null, "\t"));

    // Launching alert
    var result = savePanel.runModal()
    if (result == NSFileHandlingPanelOKButton) {
        file.writeToFile_atomically_encoding_error(savePanel.URL().path(),
                                                     true, NSUTF8StringEncoding, null)
        var alertMessage = "Master Copy JSON saved to: " + savePanel.URL().path();
	    sketch.UI.message(alertMessage);
    }
}