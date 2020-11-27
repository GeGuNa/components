COMPONENT('monthlycalendar', 'parent:auto;margin:0;firstday:0;noborder:0;selectable:1;morebutton:+{{ count }} more', function(self, config, cls) {

	var cls2 = '.' + cls;
	var eventsbinder = {};
	var isready = false;
	var timeout;
	var container;
	var current;
	var dates;
	var datacontainer;
	var tmpresize;
	var events = [];
	var eventssingle = [];
	var eventsmore = {};

	self.readonly();

	self.make = function() {
		self.aclass(cls);
		self.on('resize2', self.resize);

		var builder = [];
		var days = [];
		var rowcount = -1;

		for (var i = 0; i < 42; i++) {

			var day = (config.firstday + i) % 7;
			var classes = [];

			if (i % 7 === 0) {
				rowcount++;
				classes.push(cls + '-0');
			}

			if ((i + 1) % 7 === 0)
				classes.push(cls + '-6');

			if (day === 0 || day === 6)
				classes.push(cls + '-weekend');

			if (i < 7)
				classes.push(cls + '-fistrow');

			if (i > 34)
				classes.push(cls + '-lastrow');

			var offset = rowcount + 'x' + (i % 7);
			builder.push('<div data-index="{1}" data-day="{2}"{3} data-offset="{4}"><div class="{0}-day"></div><div class="{0}-events"></div></div>'.format(cls, i, day, classes.length ? (' class="' + classes.join(' ') + '"') : '', offset));
		}

		if (config.noborder)
			self.aclass(cls + '-noborder');

		for (var i = 0; i < 7; i++) {
			var dayindex = (config.firstday + i) % 7;
			days.push('<div>' + DAYS[dayindex].substring(0, 3) + '</div>');
		}

		self.html('<div class="{0}-data"></div><div class="{0}-header">{2}</div><div class="{0}-days">{1}</div>'.format(cls, builder.join(''), days.join('')));
		container = self.find(cls2 + '-days');
		datacontainer = self.find(cls2 + '-data');
		self.resizeforce();

		self.event('click', cls2 + '-event', function(e) {

			var el = $(this);
			var selected = cls + '-selected';

			// Contains events
			if (el.hclass(cls + '-event-more')) {
				config.eventmore && self.SEEX(config.eventmore, el.attrd('date').parseDate('yyyyMMdd'), el, e);
				return;
			}

			if (el.hclass(selected)) {
				el.rclass(selected);
				datacontainer.find('.' + selected).rclass(selected);
				config.select && self.SEEX(config.select, null, el, e);
				return;
			}

			var id = el.attrd('id');

			self.find('.' + selected).rclass(selected);
			self.find(cls2 + '-event[data-id="{0}"]'.format(id)).aclass(selected);
			config.select && self.SEEX(config.select, events.findItem('id', id), el, e);

			e.stopPropagation();
			e.preventDefault();
		});

		container.on('mousedown', '[data-index]', function(e) {
			if (config.selectable) {
				eventsbinder.mdown.call(this, e);
				eventsbinder.on();
				e.preventDefault();
			}
		});
	};

	eventsbinder.on = function() {
		if (!eventsbinder.is) {
			eventsbinder.is = true;
			container.on('mousemove', '[data-index]', eventsbinder.mmove);
			container.on('leave', eventsbinder.mup);
			self.element.on('mouseup', eventsbinder.mup).on('leave', eventsbinder.mup);
		}
	};

	eventsbinder.off = function() {
		if (eventsbinder.is) {
			eventsbinder.is = false;
			container.off('mousemove', '[data-index]', eventsbinder.mmove);
			container.off('leave', eventsbinder.mup);
			self.element.off('mouseup', eventsbinder.mup).off('leave', eventsbinder.mup);
		}
	};

	eventsbinder.mdown = function() {
		eventsbinder.endcache = null;
		eventsbinder.beg = $(this);
		eventsbinder.begindex = eventsbinder.endindex = +eventsbinder.beg.attrd('index');
	};

	eventsbinder.mmove = function() {
		var t = this;
		if (eventsbinder.endcache !== t) {
			eventsbinder.endcache = t;
			eventsbinder.end = $(t);
			eventsbinder.endindex = +eventsbinder.end.attrd('index');
			for (var i = 0; i < container[0].children.length; i++) {
				var div = container[0].children[i];
				var index = +div.getAttribute('data-index');
				var beg = 0;
				var end = 0;
				if (eventsbinder.endindex > eventsbinder.begindex) {
					beg = eventsbinder.begindex;
					end = eventsbinder.endindex;
				} else {
					beg = eventsbinder.endindex;
					end = eventsbinder.begindex;
				}
				if (index >= beg && index <= end)
					div.classList.add(cls + '-hover');
				else
					div.classList.remove(cls + '-hover');
			}
		}
	};

	eventsbinder.mup = function() {
		container.find(cls2 + '-hover').rclass(cls + '-hover');
		eventsbinder.off();
		var begel = container[0].children[eventsbinder.begindex];
		var beg = begel.getAttribute('data-date').parseDate('yyyy-MM-dd');
		var endel = container[0].children[eventsbinder.endindex];
		var end = endel.getAttribute('data-date').parseDate('yyyy-MM-dd');
		var data = { beg: beg, end: end };
		config.create && self.EXEC(config.create, data, $(begel), $(endel));
	};

	self.redraw = function(date) {

		var tmp = date.format('yyyyMMdd');
		if (current === tmp)
			return;

		current = tmp;

		var beg = new Date(date.getTime());
		var end = new Date(date.getFullYear(), date.getMonth(), 0);
		var today = function(dt) {
			return dt.getMonth() === NOW.getMonth() && dt.getFullYear() === NOW.getFullYear() && dt.getDate() === NOW.getDate();
		};

		beg.setDate(1);

		var days = end.getDate();
		var first = beg.getDay();
		var diff;
		var dt;

		dates = [];

		for (var i = 0; i < days - 1; i++) {
			dt = beg.add(i + ' days');
			dates.push({ date: dt, type: 'current', today: today(dt), number: +dt.format('yyyyMMdd') });
		}

		if (first !== config.firstday) {
			diff = 7 - Math.abs(config.firstday - first);
			for (var i = 0; i < diff; i++) {
				dt = beg.add('-' + (i + 1) + ' days');
				dates.unshift({ date: dt, type: 'prev', today: today(dt), number: +dt.format('yyyyMMdd') });
			}
		}

		diff = 42 - dates.length;
		if (diff > 0) {
			end = new Date().add('1 month');
			end.setDate(1);
			for (var i = 0; i < diff; i++) {
				dt = end.add(i + ' days');
				dates.push({ date: dt, type: 'next', today: today(dt), number: +dt.format('yyyyMMdd') });
			}
		}

		var dom = container[0];
		var rowindex = 0;

		for (var i = 0; i < dom.children.length; i++) {

			var div = dom.children[i];
			var item = dates[i];
			var el = $(div.children[0]);
			var classes = [];
			el.html((i % 7 ? '' : ('<span>' + item.date.format('ww') + '</span>')) + (item.today ? '<b>' : '') + item.date.format('d') + (item.today ? '</b>' : '') + (item.date.getDate() === 1 ? (' ' + MONTHS[item.date.getMonth()].substring(0, 3)) : ''));

			if (i % 7 === 0)
				rowindex++;

			item.row = rowindex - 1;
			item.col = i % 7;

			if (item.today)
				classes.push(cls + '-day-today');

			if (item.type === 'prev')
				classes.push(cls + '-day-prev');
			else if (item.type === 'next')
				classes.push(cls + '-day-next');

			var parent = el.parent();
			parent.rclass2('-day-');
			parent.attrd('date', item.date.format('yyyy-MM-dd'));

			if (classes.length)
				parent.aclass(classes.join(' '));

			item.element = div.children[1];
		}

		if (config.rebind) {
			var meta = {};
			meta.dates = dates;
			meta.date = date;
			self.SEEX(config.rebind, meta);
		}

		isready = true;

	};

	self.resize = function() {
		timeout && clearTimeout(timeout);
		timeout = setTimeout(self.resizeforce, 200);
	};

	self.resizeforce = function() {

		var parent = self.parent(config.parent);
		var h = parent.height() - config.margin - (self.find(cls2 + '-header').height() || 30); // 30 is a default height of header

		var m = config['margin' + WIDTH()];
		if (m)
			h -= m;

		if (config.topoffset)
			h -= self.element.offset().top;

		if (config.topposition)
			h -= self.element.position().top;

		container.css('height', h);

		var resizekey = container.width() + 'x' + h;
		if (tmpresize === resizekey)
			return;

		tmpresize = resizekey;
		h = (container.height() / 6).floor(3); // 30 = header;
		var off = self.element.offset();
		var elements = container.find('> div');
		var cache = {};

		for (var i = 0; i < elements.length; i++)
			cache[elements[i].getAttribute('data-offset')] = $(elements[i]);

		datacontainer.find(cls2 + '-event').each(function() {
			var el = $(this);
			var arr = el.attrd('offset').split('x');
			// 0:row, 1:begcol, 2:endcol, 3:plusleft, 4:pluswidth, 5:top

			var plusleft = +arr[3];
			var pluswidth = +arr[4];
			var plus = +arr[5];
			var beg = cache[arr[0] + 'x' + arr[1]];
			var end = cache[arr[0] + 'x' + arr[2]];
			var begoff = beg.offset();
			var endoff = end.offset();

			el.css({ top: (((+arr[0]) * h) + plus) + 60, left: (begoff.left - off.left) + plusleft, width: (endoff.left - begoff.left) + end.width() + pluswidth });
		});

	};

	self.unselect = function() {
		var c = cls + '-selected';
		var el = self.find('.' + c);
		if (el.length) {
			el.rclass(c);
			config.select && self.SEEX(config.select, null, el);
		}
	};

	self.setter = function(value) {
		self.redraw(value || NOW);

		if (eventssingle.length) {

			var tmp = eventssingle;
			self.clear();

			for (var i = 0; i < tmp.length; i++)
				self.addevent(tmp[i]);


		} else if (events && events.length)
			self.addevents(events);

	};

	var colorize = function(value) {
		var hash = HASH(value, true);
		var color = '#';
		for (var i = 0; i < 3; i++) {
			var value = (hash >> (i * 8)) & 0xFF;
			color += ('00' + value.toString(16)).substr(-2);
		}
		return color;
	};

	var occupancycache;
	var occupancyarray = function(rowindex, max) {

		var row = occupancycache[rowindex] = [];

		for (var i = 0; i < 7; i++) {
			var arr = [];
			for (var j = 0; j < max; j++)
				arr.push(0);
			row.push(arr);
		}

		return row;
	};

	var occupancy = function(index, row, item, begday, endday, max) {

		var count = 0;
		var countindex = 0;

		var occupied = occupancycache[index];
		if (occupied == null)
			occupied = occupancycache[index] = occupancyarray(index, max);

		var is = false;

		// Max. events in the block
		for (var j = 0; j < max; j++) {

			is = true;

			for (var i = begday.col; i <= endday.col; i++) {
				var isoccupied = occupied[i][j];
				if (isoccupied) {
					countindex = j + 1;
					count++;
					is = false;
					break;
				}
			}

			if (is)
				break;

		}

		for (var i = begday.col; i <= endday.col; i++)
			occupied[i][countindex] = 1;

		return count;
	};

	self.addevents = function(items) {

		if (!isready) {
			setTimeout(self.addevents, 100, items);
			return;
		}

		self.clear();

		occupancycache = [];
		events = items;
		tmpresize = container.width() + 'x' + container.height();

		var filter = [];
		var date = current.parseDate('yyyyMMdd');
		var dtbeg = new Date(date.getFullYear(), date.getMonth() - 1, 1);
		var rows = [];
		var h = (container.height() / 6).floor(3);
		var hitem = 15;
		var maxlimit = {};
		var counter = {};

		for (var i = 0; i < items.length; i++) {

			var item = items[i];
			var beg = item.beg || item.dtbeg;
			var end = item.end || item.dtend || beg;

			if (beg < dtbeg && end < dtbeg)
				continue;

			var obj = {};
			obj.id = item.id;
			obj.html = item.html || item.name;
			obj.beg = +(item.beg || item.dtbeg).format('yyyyMMdd');
			obj.end = +end.format('yyyyMMdd');
			obj.days = obj.end - obj.beg;
			obj.color = item.color;
			obj.icon = item.icon;
			obj.background = item.background;
			filter.push(obj);
		}

		filter.quicksort('days_desc,beg');

		var arr = [];
		var tmp = 0;
		for (var i = 0; i < dates.length; i++) {
			var item = dates[i];

			if (item.row !== tmp) {
				rows.push(arr);
				arr = [];
				tmp = item.row;
			}

			arr.push(dates[i]);
			item.element.innerHTML = '';
		}

		rows.push(arr);

		var off = self.element.offset();
		var tmp;

		for (var i = 0; i < filter.length; i++) {

			var item = filter[i];

			for (var j = 0; j < rows.length; j++) {

				var row = rows[j];
				var beg = row[0].number;
				var end = row[6].number;
				var begday = null;
				var endday = null;

				if (item.beg > end || item.end < beg)
					continue;

				for (var a = 0; a < row.length; a++) {
					var day = row[a];

					if (!begday && item.beg <= day.number)
						begday = day;

					if (item.end >= day.number)
						endday = day;
				}

				if (!begday || !endday)
					continue;

				var key = j + 'x' + begday.col;
				var plusoffset = (30 + (hitem * 2));
				var count = occupancy(j, row, item, begday, endday, Math.ceil((h - plusoffset) / hitem));
				var top = count * hitem;
				var plus = top;
				var pluswidth = 0;
				var plusleft = 0;
				var begdayel = $(begday.element);
				var enddayel = $(endday.element);
				var begoff = begdayel.offset();
				var endoff = enddayel.offset();
				var can = ((hitem * count) + plusoffset) < h;
				var html = item.html;

				if (!can) {
					if (maxlimit[key]) {
						maxlimit[key]++;
						continue;
					}
					else {
						maxlimit[key] = 1;
						html = '';
					}
				}

				for (var a = begday.col; a <= endday.col; a++) {
					key = j + 'x' + a;
					if (counter[key]) {
						counter[key].count = count;
						counter[key].total++;
					} else
						counter[key] = { count: count, total: 1 };
				}

				var el = $('<div class="{0}-event{2}">{1}</div>'.format(cls, html, can ? '' : (' ' + cls + '-event-more')));

				if (item.beg === begday.number) {
					plusleft = 5;
					el.aclass(cls + '-event-first');
				}

				if (item.end === endday.number) {
					pluswidth = -5;

					if (plusleft)
						pluswidth *= 2;

					el.aclass(cls + '-event-last');
				}

				if (plusleft && !pluswidth)
					pluswidth -= plusleft;

				if (!can)
					el.attrd('date', begday.number);

				el.attrd('id', item.id);
				el.attrd('offset', begday.row + 'x' + begday.col + 'x' + endday.col + 'x' + plusleft + 'x' + pluswidth + 'x' + top);

				var css = {};

				css.top = ((begday.row * h) + plus) + 60;
				css.left = (begoff.left - off.left) + plusleft;
				css.width = (endoff.left - begoff.left) + enddayel.width() + pluswidth;

				if (can) {
					if (item.background || item.beg !== item.end) {
						css['background-color'] = item.color || colorize(item.html);
					} else {
						el.aclass(cls + '-transparent');
						el.html('<i class="{0}" style="color:{1}"></i>'.format(item.icon || 'fa fa-circle', item.color || colorize(item.html)) + item.html);
					}
				}

				el.css(css);
				datacontainer.append(el);
			}
		}

		var morebutton = Tangular.compile(config.morebutton);

		datacontainer.find(cls2 + '-event-more').each(function() {
			var el = $(this);
			var offset = el.attrd('offset').split('x');
			var key = offset[0] + 'x' + offset[1];
			el.html(morebutton({ count: counter[key].total - counter[key].count }));
		});
	};

	self.addevent = function(item) {

		var h = (container.height() / 6).floor(3);
		var hitem = 15;
		var plusoffset = (30 + (hitem * 2));

		events.push(item);
		eventssingle.push(item);

		var number = +item.date.format('yyyyMMdd');
		for (var j = 0; j < dates.length; j++) {
			var date = dates[j];
			if (number === date.number) {

				var parent = $(date.element);
				var can = ((hitem * parent[0].children.length) + plusoffset) < h;

				if (can) {
					var name = item.html || item.name;
					var builder = $('<div class="{0}-event {0}-event-first {0}-event-last" data-id="{1}">{2}</div>'.format(cls, item.id, item.is && item.row === date.row ? '' : name));
					item.row = date.row;
					item.is = true;
					var css = {};

					if (item.background) {
						css['background-color'] = item.color || colorize(name);
						builder.css(css);
					} else {
						builder.aclass(cls + '-transparent');
						builder.html('<i class="{0}" style="color:{1}"></i>'.format(item.icon || 'fa fa-circle', item.color || colorize(name)) + name);
					}

					parent.append(builder);
				} else {
					var key = date.number + '';
					if (parent.find(cls2 + '-event-more').length) {
						eventsmore[key]++;
					} else {
						eventsmore[key] = 1;
						parent.append('<div class="{0}-event {0}-event-more" data-date="{1}"></div>'.format(cls, date.number));
					}
				}
			}
		}

		var morebutton = Tangular.compile(config.morebutton);

		self.find(cls2 + '-event-more').each(function() {
			var el = $(this);
			var key = el.attrd('date');
			var val = eventsmore[key];
			if (val != null)
				el.html(morebutton({ count: val }));
		});

	};

	self.clear = function() {
		eventssingle = [];
		events = [];
		eventsmore = {};
		self.find(cls2 + '-event').remove();
	};

});