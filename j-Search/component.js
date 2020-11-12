COMPONENT('search', 'class:hidden;delay:50;attribute:data-search;splitwords:1', function(self, config, cls) {

	self.readonly();

	self.make = function() {
		config.datasource && self.datasource(config.datasource, function() {
			self.refresh();
		});
	};

	self.search = function() {

		var value = self.get();
		var elements = self.find(config.selector);
		var length = elements.length;

		if (!value) {
			elements.rclass(config.class);
			self.rclass2(cls + '-');
			config.exec && self.SEEX(config.exec, { hidden: 0, count: length, total: length, search: '', is: false });
			return;
		}

		var search = value.toSearch();
		var count = 0;
		var hidden = 0;

		if (config.splitwords)
			search = search.split(' ');

		self.aclass(cls + '-used');

		for (var i = 0; i < length; i++) {

			var el = elements.eq(i);
			var val = (el.attr(config.attribute) || '').toSearch();
			var is = false;

			if (search instanceof Array) {
				for (var j = 0; j < search.length; j++) {
					if (val.indexOf(search[j]) === -1) {
						is = true;
						break;
					}
				}
			} else
				is = val.indexOf(search) === -1;

			el.tclass(config.class, is);

			if (is)
				hidden++;
			else
				count++;
		}

		self.tclass(cls + '-empty', !count);
		config.exec && self.SEEX(config.exec, { total: length, hidden: hidden, count: count, search: search, is: true });
	};

	self.setter = function(value) {
		if (!config.selector || !config.attribute || value == null)
			return;
		setTimeout2('search' + self.ID, self.search, config.delay);
	};
});