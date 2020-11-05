## j-Markdown

This component contains only Markdown parser.

__Markdown settings__:

```javascript
var opt = {};
var text = 'YOUR_MARKDOWN_STRING';

console.log(text.markdown(opt));
```

- `opt.wrap = true` wraps the output with `<div class="markdown">YOUR_MARKDOWN</div>`
- `opt.linetag = 'p'` a default new line tag
- `opt.ul = true` enables unordered/ordered lists
- `opt.code = true` enables custom codes
- `opt.images = true` enables images
- `opt.links = true` enables links
- `opt.formatting = true` enables basic text formatting
- `opt.icons = true` enables Font-Awesome icons via `:home:` or `:cog:`
- `opt.tables = true` enables tables
- `opt.br = true` enables new lines via `<br>`
- `opt.emptynewline = true` empty lines will be rendered as empty lines
- `opt.headlines = true` enables headlines
- `opt.hr = true` enables page breaks
- `opt.blockquotes = true` enables blockquotes `< blockqote`
- `opt.custom = function(line) { return line; }` a custom parser for each processed line
- `opt.sections = true` enables sections `> section`
- `opt.footnotes = true` enables footnotes `#1: foot note description` and usage in links `[link](#1)`
- `opt.urlify = true` converts URL addresses to links
- `opt.keywords = true` parses keywords in the form `{keyword}(type)`
- `opt.noredraw = true` skips redrawing of code/video/section/block parts (default: `false`)

__Good to know__:

- images will be with `img-responsive` class
- images with `![+Image description](URL)` will be formatted as an inline image
- images with `![-Image description](URL)` will be rendered as an inline image with class `gallery` instead of `img-responsive`
- all links are with `_target="_blank"` attribute
- markdown registers `FUNC.markdownredraw(jQuery_selector, [markdown_options])` for prerendering of Markdown dynamic elements like code highlight, videos or charts
- secret section is defined like code with syntax `secret`
- class `markdown-small` can decrease font sizes

__Toggleable section:__

```html
::: Name of section
Another markdown content
:::
```

### Author

- Peter Širka <petersirka@gmail.com>

### License

- [License](https://www.totaljs.com/license/)
