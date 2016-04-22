var path = require('path')
  , richtextOT = require('rich-text')

richtextOT.type.serialize = JSON.stringify
richtextOT.type.deserialize = JSON.parse

module.exports = setup
module.exports.consumes = ['ui', 'ot', 'importexport', 'sync', 'orm']

function setup(plugin, imports, register) {
  var ui = imports.ui
  var ot = imports.ot
  var importexport = imports.importexport
  var sync = imports.sync
  var orm = imports.orm

  ui.registerModule(path.join(__dirname, 'client.js'))
  ui.registerStaticDir(path.resolve(__dirname+'/../quill/dist/'))

  ot.registerOTType('richtext', richtextOT.type)
/*
  importexport.registerExportProvider('text/html', 'text/html'
  , function*(document, snapshot) {
    return vdomToHtml(JSON.parse(snapshot.contents))
  })

  importexport.registerImportProvider('text/html', 'text/html'
  , function*(document, user, data) {

    var sanitizedHtml = sanitizeHtml(data, {
      allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img' ]
    , allowedAttributes: {
        a: [ 'href', 'name', 'target' ]
      , img: [ 'src' ]
      }
    })
    var importedTree = domOT.create('<div>'+sanitizedHtml+'</div>')

    // get gulf doc and prepare changes

    var gulfDoc = yield sync.getDocument(document.id)
    if(!gulfDoc.initialized) {
      yield function(cb) {
        gulfDoc.once('init', cb)
      }
    }

    var root = gulfDoc.content
      , insertPath = [root.childNodes.length]
      , changes = [new domOT.Move(null, insertPath, domOT.serialize(importedTree))]

    var snapshot = yield orm.collections.snapshot
    .findOne({id: document.latestSnapshot})

    // commit changes
    yield function(cb) {
      gulfDoc.receiveEdit(JSON.stringify({
        cs: JSON.stringify(changes)
      , parent: snapshot.id
      , user: user
      }), null, cb)
    }
  })
*/
  register()
}
