/**
 * hive.js
 * Copyright (C) 2013-2016 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Mozilla Public License version 2
 * as published by the Mozilla Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the Mozilla Public License
 * along with this program.  If not, see <https://www.mozilla.org/en-US/MPL/2.0/>.
 */
var Quill = require('quill')
  , bindEditor = require('./bindingQuill.js')
  , jsonParse = require('json-stream')
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
  , function(el, onClose) {

    // Create toolbar
    var toolbar = vdom.create(TOOLBAR)
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
      quill.multiCursor = quill.addModule('multi-cursor', {
        timeout: 10000
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

  editor.onLoad(setupCursors)

  function setupCursors(editableDoc, broadcast, onClose) {
    if (ui.store.getState().editor.editor !== 'Quill') return
    var stream = broadcast.createDuplexStream(new Buffer('cursors-quill'))
    editableDoc.on('init', () => {
     editableDoc.quill.on('selection-change', (range) => {
       if (range) { 
	 stream.write(JSON.stringify({cursor: range.start})+'\n')
       }else {
	 stream.write(JSON.stringify({cursor: null})+'\n')
       }
     })
      
      // render others' cursors
      stream
      .pipe(jsonParse())
      .on('data', (broadcastCursors) => {
	var state = ui.store.getState()
	for (var userId in broadcastCursors) {
	  if (null === broadcastCursors[userId]) return
	  var user = state.presence.users[userId]
	  editableDoc.quill.multiCursor
	  .setCursor(userId, broadcastCursors[userId]
	  , user.attributes.name, user.attributes.color)
	}
      }) 
    })
  }

  register()
}

const TOOLBAR = h('div.Editor__toolbar', [
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
])
