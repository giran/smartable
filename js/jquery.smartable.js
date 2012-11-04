/**
 * jQuery Smartable - https://github.com/giran/smartable
 * --------------------------------------------------------------------------
 *
 * Licensed under The MIT License
 * 
 * @version     0.1
 * @since       02.11.2012
 * @author      Makoto Hashimoto and Rafael Peruggia
 * @link        https://github.com/giran/smartable
 * @twitter     http://twitter.com/makotovh
 * @license     http://www.opensource.org/licenses/mit-license.php MIT 
 * @package     jQuery Plugins
 */

(function ($) {

	function Smartable() {
		this.defaults = {
			debug: false,
			url: false, //ajax url
			method: 'GET', // data sending method
			dataType: 'json',
			page: 1,
			maxResults: 10,
			template: null,
			params: null
		}
	}

	$.extend(Smartable.prototype, {
		setDefaults : function (settings) {
			this.defaults = $.extend({}, this.defaults, settings);
			return this;
		},

		processTemplate: function(list) {
			var appendTo = this.element;
			if (this.element.is("table")) {
				appendTo = this.element.find('tbody');
			}
			appendTo.empty();
			$(this.options.template).tmpl(list).appendTo(appendTo);
		},

		getData : function() {
			$.ajax({
				url: this.options.url,
				type: this.options.method,
				dataType: this.options.dataType,
				params: this.options.params,
				success: function(data) {
					if (data) {
						if ($.isArray(data.list)) {
							$.smartable.processTemplate(data.list);
						}
					}
				},
				error: function (error) {
					alert(error);
				}
			});
		},

		setData: function(list) {
			this.processTemplate(list);
		},

		init : function(element, settings) {
			this.options = $.extend({}, this.defaults, settings);
			this.element = element;
			this.getData();
		},

		refresh: function() {
			this.getData();
		}
	});

	$.smartable = new Smartable();
	$.smartable.options = null;
	$.smartable.element = null;

	var methods = {
		init :  function(settings) {
			$.smartable.init($(this), settings);
			return this;
		},
		refresh: function() {
			$.smartable.refresh();
		},
		setData: function(list) {
			$.smartable.setData(list);
		}
	};

	$.fn.smartable = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist!');
		}
	};
})(jQuery);