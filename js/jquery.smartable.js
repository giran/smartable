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
			templateList: null,
			pagination: true,
			templatePaginationPath: "includes/pagination.html",
			paginationWrapper: false,
			params: null,
			prevLabel: 'Prev',
			nextLabel: 'Next'
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
			$(this.options.templateList).tmpl(list).appendTo(appendTo);			
		},

		getLastPage: function() {
			return Math.round(this.data.total / this.options.maxResults);
		},

		createPagination: function() {
			$(this.options.paginationWrapper).empty();
			var paginationTemplate = null;
			var prevLabel = this.options.prevLabel;
			var nextLabel = this.options.nextLabel;
			
			$.ajax({
				url : this.options.templatePaginationPath,
				method : 'GET',
				async : false,
				dataType : 'HTML',
				error : function (error) {
					$.error("Pagination template not found");
				},
				success : function (_template) {
					paginationTemplate = _template;
				}
			});
			
			var totalPages = 1;
			if (this.data.total > this.options.maxResults) {
				totalPages = this.getLastPage();
			}

			var paginationArray = new Array();
			if (this.options.page != 1) {
				paginationArray.push({'label' : prevLabel, 'action' : '$("'+this.element.selector+'").smartable("prevPage")', 'style' : ''});
			} else {
				paginationArray.push({'label' : prevLabel, 'action' : '', 'style' : 'disabled'});
			}

			for (var i = 1; i <= totalPages; i++) {
				if (i == this.options.page) {
					paginationArray.push({'label' : this.options.page, 'action' : '', 'style' : 'disabled'});
				} else {
					paginationArray.push({'label' : i, 'action' : '$("'+this.element.selector+'").smartable("gotoPage", '+ i +')', 'style' : ''});
				}
			}

			if (this.options.page < totalPages) {
				paginationArray.push({'label' : nextLabel, 'action' : '$("'+this.element.selector+'").smartable("nextPage")', 'style' : ''});	
			} else {
				paginationArray.push({'label' : nextLabel, 'action' : '', 'style' : 'disabled'});	
			}

			$.tmpl(paginationTemplate, paginationArray).appendTo($.smartable.options.paginationWrapper);
		},

		getData : function() {			
			$.ajax({
				url: this.options.url,
				type: this.options.method,
				dataType: this.options.dataType,
				params: this.options.params,
				success: function(data) {
					if (data) {
						$.smartable.data = data;
						if ($.isArray(data.list)) {
							$.smartable.processTemplate(data.list);
						}
						if ($.smartable.options.pagination) {
							$.smartable.createPagination();
						}
					}
				},
				error: function (error) {
					$.error(error);
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
		},

		nextPage : function() {	
			if (this.options.page < this.getLastPage()) {
				this.options.page++;
				this.refresh();			
			} else {
				$.error("You're already on the last page.")
			}	
		},

		prevPage: function() {
			if (this.options.page > 1) {
				this.options.page--;
				this.refresh();
			} else {
				$.error("You're already on the first page.");
			}
		},

		gotoPage: function(page) {
			if (this.options.page != page) {
				if (page > 0 && page <= this.getLastPage()) {
					this.options.page = page;
					this.refresh();
				} else {
					$.error(page + " is not a valid page.")
				}
			}
		}
	});

	$.smartable = new Smartable();
	$.smartable.options = null;
	$.smartable.element = null;
	$.smartable.data = null;
	$.smartable.selector = null;

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
		},
		nextPage: function() {
			$.smartable.nextPage();	
		},
		prevPage: function() {
			$.smartable.prevPage();	
		},
		gotoPage: function(page) {
			$.smartable.gotoPage(page);
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