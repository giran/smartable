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
			debug:						false,
			url:						false, //ajax url
			method:						'GET', // data sending method
			dataType:					'json',
			page:						1,
			maxResults:					10,
			orderField:					null,
			orderType:					null,
			classOrderIconAsc:			"icon-chevron-up",
			classOrderIconDesc:			"icon-chevron-down",
			templateList:				null,
			targetList: 				null,
			pagination:					true,
			hidePaginationWithOnePage:	false,
			windowSizePagination:		5,
			paginationTemplate:			'<li class="{{= style}}"><a href="javaScript: void(0);" onclick="{{= action}}">{{= label}}</a></li>',
			paginationWrapper:			false,
			params:						{},
			prevLabel:					'Prev',
			prevClass:					'ant',
			nextLabel:					'Next',
			nextClass:					'prox',
			activeClass:				'active',
			noDataFoundMessage:			'No data found',
			before: 					function () {},
			error:						function (jqXHR, ajaxOptions, thrownError) { $.error(jqXHR); },
			success:					function (data) {  },
			finaly: 					function () {},
			autoload:					true,
			dataLoader:					null
		}
	}
	$.extend(Smartable.prototype, {
		setDefaults : function (settings) {
			this.defaults = $.extend({}, this.defaults, settings);
			return this;
		},
		getTargetList: function() {
			var appendTo = this.element;
			if (this.options.targetList) {
				appendTo = $(this.options.targetList);
			} else {
				if (this.element.is("table")) {
					appendTo = this.element.find('tbody');
				}
			}
			return appendTo;
		},
		processTemplate: function(list) {
			var appendTo = this.getTargetList();
			appendTo.empty();
			$(".noDataFound").remove();
			$(this.options.paginationWrapper).show();
			if (list.length > 0) {
				$(this.options.templateList).tmpl(list).appendTo(appendTo);
			} else {
				this.element.after("<div class='alert alert-info noDataFound'>"+ this.options.noDataFoundMessage  +"</div>");
				$(this.options.paginationWrapper).hide();
			}
		},
		getLastPage: function() {
			return Math.ceil(this.data.total / this.options.maxResults);
		},
		getParameters: function() {
			var parameters = $.param({
				"page" : this.options.page, 
				"maxResults" : this.options.maxResults, 
				"orderField" : this.options.orderField, 
				"orderType" : this.options.orderType
			});

			if (this.options.params) {
				parameters += '&' + $.param(this.options.params);
			}
			return parameters;
		},
		setParameter: function(parameterName, parameterValue) {
			eval("this.options.params." + parameterName + " = '" + parameterValue + "';");
		},
		createPagination: function() {
			$(this.options.paginationWrapper).empty();
			var paginationTemplate = this.options.paginationTemplate;
			var prevLabel = this.options.prevLabel;
			var prevClass = this.options.prevClass;
			var nextLabel = this.options.nextLabel;
			var nextClass = this.options.nextClass;
			var actualPage = this.options.page;
			var activeClass = this.options.activeClass;
			
			var totalPages = 1;
			if (this.data.total > this.options.maxResults) {
				totalPages = this.getLastPage();
			}

			if (this.options.hidePaginationWithOnePage && totalPages == 1) {
				return;
			}
			
			var windowSizePagination = Math.min(this.options.windowSizePagination, totalPages);
			var atBegining = (actualPage < (windowSizePagination));
			var atEnding = (actualPage >= (totalPages - 1));
			var needMorePages = (totalPages > (windowSizePagination + 2));

			var paginationArray = new Array();
			if (actualPage != 1) {
				paginationArray.push({'label' : prevLabel, 'action' : 'jQuery("'+this.element.selector+'").smartable("prevPage")', 'style' : prevClass});
				paginationArray.push({'label' : 1, 'action' : 'jQuery("'+this.element.selector+'").smartable("gotoPage", '+ 1 +')', 'style' : ''});
			} else {
				paginationArray.push({'label' : prevLabel, 'action' : '', 'style' : 'disabled ' + prevClass});
				paginationArray.push({'label' : actualPage, 'action' : '', 'style' : 'disabled ' + activeClass});
			}

			var startWindow = Math.max((actualPage - Math.floor(windowSizePagination / 2)), 2);
			var endWindow = Math.min((actualPage + (Math.ceil(windowSizePagination / 2) - 1)), (totalPages - 1));
			
			if (atBegining && needMorePages) {
				endWindow = (endWindow + (windowSizePagination - actualPage)) - 1;
			}

			if (atEnding && needMorePages) {
				startWindow = (startWindow - (2 - (totalPages - actualPage)));
			}

			if (!needMorePages) {
				startWindow = 2;
				endWindow = totalPages - 1;
			}

			if ((startWindow - 1) > 1) {
				paginationArray.push({'label' : '...', 'action' : '', 'style' : 'disabled'});		
			}

			for (var i = startWindow; i <= endWindow; i++) {
				if (i == actualPage) {
					paginationArray.push({'label' : actualPage, 'action' : '', 'style' : 'disabled ' + activeClass});
				} else {
					paginationArray.push({'label' : i, 'action' : 'jQuery("'+this.element.selector+'").smartable("gotoPage", '+ i +')', 'style' : ''});
				}
			}
			
			if ((totalPages - endWindow) > 1) {
				paginationArray.push({'label' : '...', 'action' : '', 'style' : 'disabled'});		
			}

			if (actualPage < totalPages) {
				if (totalPages > 1) {
					paginationArray.push({'label' : totalPages, 'action' : 'jQuery("'+this.element.selector+'").smartable("gotoPage", '+ totalPages +')', 'style' : ''});	
				}
				paginationArray.push({'label' : nextLabel, 'action' : 'jQuery("'+this.element.selector+'").smartable("nextPage")', 'style' : nextClass});
			} else {
				if (totalPages > 1) {
					paginationArray.push({'label' : actualPage, 'action' : '', 'style' : 'disabled ' + activeClass});
				}
				paginationArray.push({'label' : nextLabel, 'action' : '', 'style' : 'disabled ' + nextClass});
			}

			$.tmpl(paginationTemplate, paginationArray).appendTo($.smartable.options.paginationWrapper);
		},
		getData : function() {
			this.options.before();
			if ($.isFunction(this.options.dataLoader)) {
				this.options.dataLoader(this.options.page, this.options.maxResults, this.options.orderField, this.options.orderType, function (data) {
					$.smartable.successReturn(data);
				});
			} else {
				this.getDataAjax();
			}
			
		},
		successReturn: function (data) {
			if ($.smartable.options.success) {
				$.smartable.options.success(data);
			}
			$.smartable.setData(data);
			if ($.smartable.options.finaly) {
				$.smartable.options.finaly();
			}
		},
		getDataAjax: function() {
			$.ajax({
				url: this.options.url,
				type: this.options.method,
				dataType: this.options.dataType,
				data : this.getParameters(),
				success: function(data) {
					$.smartable.successReturn(data);
				},
				error: function(jqXHR, ajaxOptions, thrownError) {
					if ($.smartable.options.error) {
						$.smartable.options.error(jqXHR, ajaxOptions, thrownError);
					}
					if ($.smartable.options.finaly) {
						$.smartable.options.finaly();
					}
				}
			});
		},
		setData: function(data) {
			if (data) {
				this.data = data; 
				if (this.data.total > 0 && this.options.page > this.getLastPage()) {
					this.gotoLastPage();
				} else {
					if ($.isArray(data.list)) {
						this.processTemplate(data.list);
					}
					if (this.options.pagination) {
						this.createPagination();
					}
				}
			}
		},
		init : function(element, settings) {
			this.options = $.extend({}, this.defaults, settings);
			this.element = element;
			this.options.element = element;
			var iconAsc = this.options.classOrderIconAsc;
			var iconDesc = this.options.classOrderIconDesc;

			var iconArrow = ((this.options.orderType == "asc") ? iconAsc  : iconDesc);
			element.find("[data-orderField]").append("&nbsp;<i></i>");
			element.find("[data-orderField='"+ this.options.orderField +"']").addClass(this.options.orderType);
			element.find("[data-orderField='"+ this.options.orderField +"'] i").addClass(iconArrow);

			element.find("[data-orderField]").each(function (i, item) {
				$(item).click(function () {
					var orderField = $(this).attr('data-orderField');
					var orderType = 'asc';
					if (orderField == $.smartable.options.orderField && $.smartable.options.orderType == 'asc') {
						orderType = 'desc';
					} 
					$.smartable.changeOrder(orderField, orderType);
				})
			});

			if (this.options.autoload) {
				this.getData();
			}
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
		},
		gotoFirstPage: function() {
			this.gotoPage(1);
		},
		gotoLastPage: function() {
			this.gotoPage(this.getLastPage());
		},
		changeOrder: function(orderField, orderType) {
			this.options.orderField = orderField;
			this.options.orderType = orderType;
			var selectorColumn = "[data-orderField='"+ orderField +"']";
			var iconAsc = this.options.classOrderIconAsc;
			var iconDesc = this.options.classOrderIconDesc;
			var iconArrow = iconAsc;
			if (orderType == 'desc') {
				iconArrow = iconDesc;
			}
			$("[data-orderField]").removeClass('desc').removeClass('asc');
			$("[data-orderField] i").removeClass(iconDesc).removeClass(iconAsc);
			$(selectorColumn).addClass(orderType);
			$(selectorColumn).find("i").addClass(iconArrow);
			this.refresh();
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
		},
		changeOrder: function(orderField, orderType) {
			$.smartable.changeOrder(orderField, orderType);
		},
		setParameter: function(parameter) {
			var parameterName = null;
			var parameterValue = null;
			if ($.type(parameter) == 'object') {
				parameterName = parameter.attr('name');
				parameterValue = parameter.val();
			} else if (arguments.length == 2) {
				parameterName = arguments[0];
				parameterValue = arguments[1];
			} else {
				$.error("Invalid parameters");
			}
			$.smartable.setParameter(parameterName, parameterValue);
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