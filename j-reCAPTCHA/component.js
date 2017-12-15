COMPONENT('recaptcha', function(self, config) {

	self.getter = null;

	self.validate = function(value) {
		return config.disabled || !config.required ? true : (value && value.length > 300);
	};

	self.make = function() {
		WAIT(function() {
			return !!window.grecaptcha;
		}, function(err, again) {
			if (err)
				return again(100);
			grecaptcha.render(self.element.get(0), { sitekey: config.key, theme: config.theme || 'light', callback: function(response) {
				self.set(response);
				self.change(true);
			}});
		});
	};
});