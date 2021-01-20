COMPONENT('detail', 'datetimeformat:yyyy-MM-dd HH:mm;dateformat:yyyy-MM-dd;timeformat:HH:mm;defaultgroup:Default', function(self, config, cls) {

	var cls2 = '.' + cls;
	var types = {};
	var container;
	var mapping;

	self.make = function() {

		self.aclass(cls + ' ' + cls + '-style-' + (config.style || 1) + (config.small ? (' ' + cls + '-small') : ''));

		var scr = self.find('script');
		if (scr.length) {
			mapping = (new Function('return ' + scr.html().trim()))();
			for (var i = 0; i < mapping.length; i++) {
				var item = mapping[i];
				if (item.show)
					item.show = FN(item.show);
			}
		}

		self.html('<div class="{0}-container"></div>'.format(cls));
		container = self.find(cls2 + '-container');

		var keys = Object.keys(types);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			types[key].init && types[key].init();
		}
	};

	self.nocompile();
	self.bindvisible();

	self.mapvalue = function(item) {
		var val = item.path ? item.path.indexOf('.') === -1 ? item.value[item.path] : GET(item.path, item.value) : item.value;
		return val === false || val === true ? val : val == null || val === '' ? (item.empty || DEF.empty) : val;
	};

	self.register = function(name, init, render) {
		types[name] = {};
		types[name].init = init;
		types[name].render = render;
		init(self);
	};

	types.template = {};
	types.template.init = NOOP;
	types.template.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-template">{1}</div>'.format(cls, Tangular.render(item.template, { value: value, item: item.value })));
	};

	types.string = {};
	types.string.init = NOOP;
	types.string.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-string">{1}</div>'.format(cls, Thelpers.encode(value)));
	};

	types.password = {};
	types.password.init = function() {
		self.event('click', cls2 + '-password', function() {
			var el = $(this);
			var html = el.html();

			if (html.substring(0, DEF.empty.length) === DEF.empty) {
				// no value
				return;
			}

			var tmp = el.attrd('value');
			el.attrd('value', html);
			el.html(tmp);
		});
	};
	types.password.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-password" data-value="{1}">{2}</div>'.format(cls, Thelpers.encode(value), value ? '************' : DEF.empty));
	};

	types.number = {};
	types.number.init = NOOP;
	types.number.render = function(item, next) {
		var value = self.mapvalue(item);
		var format = item.format || config.numberformat;
		value = format ? value.format(format) : value;
		next('<div class="{0}-number">{1}</div>'.format(cls, Thelpers.encode(value + '')));
	};

	types.date = {};
	types.date.init = NOOP;
	types.date.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-date">{1}</div>'.format(cls, value ? value.format(item.format || config.dateformat) : ''));
	};

	types.bool = {};
	types.bool.init = NOOP;
	types.bool.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-bool{1}"><span><i class="fa fa-check"></i></span></div>'.format(cls, value ? ' checked' : ''));
	};

	types.list = {};
	types.list.init = NOOP;
	types.list.render = function(item, next) {
		var value = self.mapvalue(item);
		var template = '<div class="{0}-list"><span>{1}</span></div>';
		if (item.detail) {
			AJAX('GET ' + item.detail.format(encodeURIComponent(value)), function(response) {
				next(template.format(cls, response[item.dirkey || 'name'] || item.placeholder || DEF.empty));
			});
		} else {
			var arr = typeof(item.items) === 'string' ? GET(item.items) : item.items;
			var m = (arr || EMPTYARRAY).findValue(item.dirvalue || 'id', value, item.dirkey || 'name', item.placeholder || DEF.empty);
			next(template.format(cls, m));
		}
	};

	types.color = {};
	types.color.init = NOOP;
	types.color.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-color"><span><b{1}>&nbsp;</b></span></div>'.format(cls, value ? (' style="background-color:' + value + '"') : ''));
	};

	types.fontawesome = {};
	types.fontawesome.init = NOOP;
	types.fontawesome.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-fontawesome"><i class="{1}"></i></div>'.format(cls, value || ''));
	};

	types.emoji = {};
	types.emoji.init = NOOP;
	types.emoji.render = function(item, next) {
		var value = self.mapvalue(item);
		next('<div class="{0}-emoji">{1}</div>'.format(cls, value || DEF.empty));
	};

	self.render = function(item, index) {
		var type = types[item.type === 'boolean' ? 'bool' : item.type];
		var c = cls;

		var meta = { label: item.label || item.name };

		if (item.icon) {
			var tmp = item.icon;
			if (tmp.indexOf(' ') === -1)
				tmp = 'fa fa-' + tmp;
			meta.icon = '<i class="{0}"></i>'.format(tmp);
		} else
			meta.icon = '';

		var el = $('<div class="{2}-item{3}" data-index="{1}"><div class="{0}-key">{{ icon }}{{ label }}</div><div class="{0}-value">&nbsp;</div></div>'.format(cls, index, c, item.required ? (' ' + cls + '-required') : '').arg(meta));
		type.render(item, function(html) {
			if (item.note)
				html += '<div class="{0}-note">{1}</div>'.format(cls, item.note);
			el.find(cls2 + '-value').html(html);
		});

		return el;
	};

	self.setter = function(value) {

		if (!value)
			value = EMPTYARRAY;

		var raw;

		if (mapping && value && value !== EMPTYARRAY) {
			raw = value;
			for (var i = 0; i < mapping.length; i++) {
				var m = mapping[i];
				m.value = raw;
			}
			value = mapping;
		}

		container.empty();

		var groups = {};

		for (var i = 0; i < value.length; i++) {
			var item = value[i];
			if (raw && item.show && !item.show(raw))
				continue;

			var g = item.group || config.defaultgroup;
			if (!groups[g])
				groups[g] = { html: [] };
			groups[g].html.push(self.render(item, i));
		}

		var keys = Object.keys(groups);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var group = groups[key];
			var hash = 'g' + HASH(key).toString(36);
			var el = $(('<div class="{0}-group' + (key.length > 1 ? '' : ' {0}-group-nolabel') + '" data-id="{2}">' + (key.length > 1 ? '<label>{1}</label>' : '') + '<section></section></div>').format(cls, key, hash));
			var section = el.find('section');
			for (var j = 0; j < group.html.length; j++)
				section.append(group.html[j]);
			container.append(el);
		}

	};

});