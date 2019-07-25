import sketch from 'sketch'

const elements = [];

export default function() {

  const doc = sketch.getSelectedDocument()
  const page = doc.selectedPage
  const selectedLayers = doc.selectedLayers
  const selectedCount = selectedLayers.length

  var warnings = [];
  var idCounts = {};

  for (var artboard of page.layers) {
  	populateInstancesOfHolder(artboard, warnings, idCounts);
  }

  for (var id in idCounts)
  {
  	if (idCounts[id] > 1) warnings.push(idCounts[id] + " instances found with id '" + id + "'");
  }

  if (warnings.length > 1) createPanel(warnings.join('\n'));
  else if (warnings.length > 0) createPanel(warnings.join('\n'));
  else sketch.UI.message("No warnings found, you're all set!");
}

function populateInstancesOfHolder(holder, warnings, idCounts) {

	for (var layer of holder.layers) {
  		if (layer.type == "Group") populateInstancesOfHolder(layer, warnings, idCounts);
  		else if (layer.type == "Text") interpretTextLayer(layer, warnings, idCounts);
  		else if (layer.type == "SymbolInstance") interpretSymbolInstance(layer, warnings, idCounts);
  	}
}

function interpretTextLayer(layer,warnings,idCounts) {
	checkName(layer,warnings, idCounts);
}

function interpretSymbolInstance(layer,warnings,idCounts) {
	if (checkforTextChildren(layer)) {
		checkName(layer,warnings, idCounts);
	}
}

function checkforTextChildren(instance) {
	var hasText = false;

    for (var layer of instance.master.layers){
        if (layer.type == "SymbolInstance") hasText = hasText | checkforTextChildren(layer);
        else if (layer.type == "Text") hasText = true;
    }

	return hasText;
}

function checkName(layer,warnings,idCounts) {
	var type = layer.type;
	var name = layer.name;

	if (!idCounts[name]) idCounts[name] = 1;
	else idCounts[name]++;

	if (!RegExp('\{\w*\s*\S*.*\?\}').test(layer.name)) {
		
		while (layer.type != "Artboard") {
			layer = layer.parent;
			name = layer.name + '.' + name;
		}

		warnings.push(type + " layer containing text found without proper naming: " + name);
		return false;
	}

	return true;
}

function createPanel(text = '', panelWidth = 800, panelHeight = 600) {

  // Create the panel and set its appearance
  var panel = NSPanel.alloc().init();
  panel.setFrame_display(NSMakeRect(0, 0, panelWidth, panelHeight), true);
  panel.setStyleMask(NSTexturedBackgroundWindowMask | NSTitledWindowMask | NSClosableWindowMask | NSFullSizeContentViewWindowMask);
  //panel.setBackgroundColor(NSColor.whiteColor());

  // Set the panel's title and title bar appearance
  panel.title = "Localization Warnings";
  panel.titlebarAppearsTransparent = true;

  // Center and focus the panel
  panel.center();
  panel.makeKeyAndOrderFront(null);
  panel.setLevel(NSFloatingWindowLevel);

  // Make the plugin's code stick around (since it's a floating panel)
  COScript.currentCOScript().setShouldKeepAround_(true);

  // Hide the Minimize and Zoom button
  panel.standardWindowButton(NSWindowMiniaturizeButton).setHidden(true);
  panel.standardWindowButton(NSWindowZoomButton).setHidden(true);

  // Create the blurred background
  var vibrancy = NSVisualEffectView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight));
  vibrancy.setAppearance(NSAppearance.appearanceNamed(NSAppearanceNameAccessibilityHighContrastVibrantDark));
  vibrancy.setBlendingMode(NSVisualEffectBlendingModeBehindWindow);

  // Add it to the panel
  panel.contentView().addSubview(vibrancy);

  // Add text
  var label = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, 1000000));
  label.string = text
  label.editable = false
  label.borderd = false
  label.bezeled = false
  label.drawsBackground = false
  label.setAlignment(0)

  var scrollView = NSScrollView.alloc().initWithFrame(NSMakeRect(0, 0, panelWidth, panelHeight - 45));
  scrollView.documentView = label;
  scrollView.hasVerticalScroller = true;
  scrollView.drawsBackground = false;

    panel.contentView().addSubview(scrollView)


  // Create an NSThread dictionary with a specific identifier
  var threadDictionary = NSThread.mainThread().threadDictionary();
  var identifier = "mediamonks.symboltools.floatingpanel";

  // If there's already a panel, prevent the plugin from running
  if (threadDictionary[identifier]) return;

  // After creating the panel, store a reference to it
  threadDictionary[identifier] = panel;

  var closeButton = panel.standardWindowButton(NSWindowCloseButton);

  // Assign a function to the Close button
  closeButton.setCOSJSTargetFunction(function(sender) {
    panel.close();

    // Remove the reference to the panel
    threadDictionary.removeObjectForKey(identifier);

    // Stop the plugin
    COScript.currentCOScript().setShouldKeepAround_(false);
  });
}