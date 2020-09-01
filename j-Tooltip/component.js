COMPONENT('tooltip', function(self, config, cls) {

	var is = false;

	self.singleton();
	self.readonly();
	self.blind();
	self.nocompile && self.nocompile();

	self.make = function() {
		self.aclass(cls + ' hidden');
		self.on('scroll + resize', self.hide);
	};

	self.hide = function(force) {
		is && setTimeout2(self.ID, function() {
			self.aclass('hidden');
			self.rclass(cls + '-visible');
			is = false;
		}, force ? 1 : 200);
	};

	self.show = function(opt) {

		var tmp = opt.element ? opt.element instanceof jQuery ? opt.element[0] : opt.element.element ? opt.element.dom : opt.element : null;

		if (is && tmp && self.target === tmp) {
			self.hide();
			return;
		}

		clearTimeout2(self.ID);

		self.target = tmp;
		self.opt = opt;
		self.html('<div class="' + cls + '-body">' + opt.html + '</div>');

		var b = self.find('.' + cls + '-body');
		b.rclass2(cls + '-arrow-');
		b.aclass(cls + '-arrow-' + opt.align);

		var css = {};

		if (is) {
			css.left = 0;
			css.top = 0;
			self.element.css(css);
		} else {
			self.rclass('hidden');
			self.aclass(cls + '-visible', 100);
			is = true;
		}

		var target = $(opt.element);
		var w = self.width();
		var h = self.height();
		var offset = target.offset();

		switch (opt.align) {
			case 'left':
			case 'right':
				css.top = offset.top + (opt.center ? (h / 2 >> 0) : 0);
				css.left = opt.align === 'left' ? (offset.left - w - 10) : (offset.left + target.innerWidth() + 10);
				break;
			default:
				css.left = Math.ceil((offset.left - w / 2) + (target.innerWidth() / 2));
				css.top = opt.align === 'bottom' ? (offset.top + target.innerHeight() + 10) : (offset.top - h - 10);
				break;
		}

		if (opt.offsetX)
			css.left += opt.offsetX;

		if (opt.offsetY)
			css.top += opt.offsetY;

		opt.timeout && setTimeout2(self.ID, self.hide, opt.timeout - 200);
		self.element.css(css);
	};

});