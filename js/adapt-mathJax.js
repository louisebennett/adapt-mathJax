define([ "core/js/adapt" ], function(Adapt) {

	function loadScript(scriptObject, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');

		script.type = scriptObject.type || 'text/javascript';

		if (scriptObject.src) {
			script.src = scriptObject.src;
		}

		if (scriptObject.text) {
			script.text = scriptObject.text;
		}

		if (callback) {
			// Then bind the event to the callback function.
			// There are several events for cross browser compatibility.
			script.onreadystatechange = callback;
			script.onload = callback;
		}

		// Append the <script> tag.
		head.appendChild(script);
	}

	function setUpMathJax() {
		Adapt.wait ? Adapt.wait.begin() : Adapt.trigger("plugin:beginWait");

		var config = Adapt.config.get("_mathJax");
		var inlineConfig = config ? config._inlineConfig : {
				"extensions": [ "tex2jax.js" ],
				"jax": [ "input/TeX", "output/HTML-CSS" ]
		};
		var src = config ? config._src : "//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_HTMLorMML";

		loadScript({ 
			type: "text/x-mathjax-config",
			text: "MathJax.Hub.Config(" + JSON.stringify(inlineConfig) + ");"
		});

		loadScript({ src: 'assets/mathJaxInit.js' }, function() {
			loadScript({ src: src }, function() {
				Adapt.wait ? Adapt.wait.end() : Adapt.trigger("plugin:endWait");
			});
		});
	}

	function onProcessMath() {
		$(".loading").show();
	}

	function onEndProcess() {
		Adapt.trigger("device:resize");
		$(".loading").hide();
	}

	function onViewReady(view) {
		$(".loading").show();

		function checkForMathJax() {
			if (!window.MathJax || !window.MathJax.Hub) {
				window.setTimeout(checkForMathJax, 200);
			} else {
				var Hub = window.MathJax.Hub;
				window.MathJax.Ajax.config.path["a11y"] = "//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/extensions/a11y";
				Hub.Config({
				  extensions: [ "[a11y]/collapsible.js", "[a11y]/auto-collapse.js", "[a11y]/explorer.js", "[a11y]/semantic-enrich.js", "[a11y]/mathjax-sre.js"],
				  menuSettings: {
				    collapsible: false,
				    autocollapse: false,
				    explorer: true,
						semanticEnrich: true,
						mathjaxSre: true,
				  }
				});
				Hub.Queue([ "Typeset", Hub, view.el ]);
			}
		}

		checkForMathJax();
	}

	function onPopupOpened($element) {
		var Hub = window.MathJax.Hub;

		if ($element) $element = $element[0];

		Hub.Queue([ "Typeset", Hub, $element ]);
	}

	Adapt.once("app:dataReady", setUpMathJax).on({
		"mathJax:processMath": onProcessMath,
		"mathJax:endProcess": onEndProcess,
		"menuView:ready pageView:ready": onViewReady,
		"popup:opened": onPopupOpened
	});

});
