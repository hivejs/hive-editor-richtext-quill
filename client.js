var Quill = require('quill')
  , bindEditor = require('./bindingQuill.js')
  , vdom = require('virtual-dom')
  , h = vdom.h

const COLORS = ["rgb(0, 0, 0)", "rgb(230, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 138, 0)", "rgb(0, 102, 204)", "rgb(153, 51, 255)", "rgb(255, 255, 255)", "rgb(250, 204, 204)", "rgb(255, 235, 204)", "rgb(255, 255, 204)", "rgb(204, 232, 204)", "rgb(204, 224, 245)", "rgb(235, 214, 255)", "rgb(187, 187, 187)", "rgb(240, 102, 102)", "rgb(255, 194, 102)", "rgb(255, 255, 102)", "rgb(102, 185, 102)", "rgb(102, 163, 224)", "rgb(194, 133, 255)", "rgb(136, 136, 136)", "rgb(161, 0, 0)", "rgb(178, 107, 0)", "rgb(178, 178, 0)", "rgb(0, 97, 0)", "rgb(0, 71, 178)", "rgb(107, 36, 178)", "rgb(68, 68, 68)", "rgb(92, 0, 0)", "rgb(102, 61, 0)", "rgb(102, 102, 0)", "rgb(0, 55, 0)", "rgb(0, 41, 102)", "rgb(61, 20, 102)"]

module.exports = setup
module.exports.consumes = ['ui', 'settings', 'editor']
module.exports.provides = []
function setup(plugin, imports, register) {
  var editor = imports.editor
    , ui = imports.ui
    , settings = imports.settings

  // Load theme
  var link = document.createElement('link')
  link.href = ui.baseURL+'/static/quill/dist/quill.snow.css'
  link.rel = 'stylesheet'
  document.head.appendChild(link)

  editor.registerEditor('Quill', 'richtext', 'A rich-text editor'
  , function(el) {

    // Create toolbar
    var toolbar = vdom.create(h('div.Editor__toolbar', [
      h('span.ql-format-group', [
        h('select.ql-size',{title: 'Size'}, [
	  h('option', {value:"10px"},'Small'),
	  h('option', {value:"13px"},'Normal'),
	  h('option', {value:"18px"},'Large'),
	  h('option', {value:"32px"},'Huge')
	])
      , h('select.ql-font', {title: 'Font'}, [
	  h('option', {value:"sans-serif"},'Sans-serif'),
	  h('option', {value:"serif"},'Serif'),
	  h('option', {value:"monospace"},'monospace')
	])
      ])
    , h('span.ql-format-group', [
        h("span.ql-format-button.ql-bold", {title: 'Bold'}),
        h("span.ql-format-button.ql-italic", {title: 'Italic'}),
        h("span.ql-format-button.ql-underline", {title: 'Underline'}),
        h("span.ql-format-button.ql-strikethrough", {title: 'Strikethrough'}),
        h("span.ql-format-button.ql-link", {title: 'Link'})
      ])
    , h('span.ql-format-group', [
        h('select.ql-color', {title:'Text color'},
	  COLORS.map(color => h('option', {value:color, label:color}))),
        h('select.ql-background', {title:'Background color'},
	  COLORS.map(color => h('option', {value:color, label:color})))
      ])
    , h('span.ql-format-group', [
        h("span.ql-format-button.ql-bullet", {title: 'Bulleted list'}),
        h("span.ql-format-button.ql-list", {title: 'Ordered list'}),
        h('select.ql-align', {title: 'Alignment'}, [
	  h('option', {value:"left", label:'Left'}),
	  h('option', {value:"center", label:'Center'}),
	  h('option', {value:"right", label:'Right'}),
	  h('option', {value:"justify", label: 'Justify'})
	])
      ])
    ]))
    toolbar.style['display'] = 'none' // Don't display until the content is loaded
    el.appendChild(toolbar)

    // Create content
    var content = document.createElement('div')
    content.setAttribute('class', 'Editor__content')
    content.style['display'] = 'none' // Don't display until the content is loaded
    el.appendChild(content)

    var quill
    return new Promise(function(resolve) {
      quill = new Quill(content, {
        modules: {
	  toolbar: { container: toolbar }
        }
      , theme: 'snow'
      , 'link-tooltip': true
      })
      resolve()
    })
    .then(() => {
      // bind editor
      var doc = bindEditor(quill)
      doc.once('editableInitialized', () => {
	// on init: Maximize editor + display toolbar
	el.style['height'] = '100%'
	content.style['overflow-y'] = 'scroll'
	content.style['padding'] = '5px'
	toolbar.style['display'] = 'block'
	content.style['display'] = 'block'
      })

      return Promise.resolve(doc)
    })
  })
  register()
}

const config = {
  // The toolbar groups arrangement, optimized for two toolbar rows.
  toolbarGroups: [
    { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
    { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
    { name: 'links' },
    { name: 'insert' },
    { name: 'forms' },
    { name: 'tools' },
    { name: 'document',     groups: [ 'mode', 'document', 'doctools' ] },
    { name: 'others' },
    '/',
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
    { name: 'styles' },
    { name: 'colors' },
    { name: 'about' }
  ]

  // Remove some buttons provided by the standard plugins, which are
  // not needed in the Standard(s) toolbar.
, removeButtons: 'Underline,Subscript,Superscript'

  // Set the most common block elements.
, format_tags: 'p;h1;h2;h3;pre'

  // Simplify the dialog windows.
, removeDialogTabs: 'image:advanced;link:advanced'

  // disable loading of additional config files
, customConfig: ''
}
