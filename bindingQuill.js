var gulf = require('gulf')
  , richtextOT = require('rich-text')
richtextOT.type.serialize = JSON.stringify
richtextOT.type.deserialize = JSON.parse

module.exports = function(quill) {
  var doc = new gulf.EditableDocument(new gulf.MemoryAdapter, richtextOT.type)
  doc.quill = quill
  doc._setContents = function(contents, cb) {
    quill.setContents(contents)
    cb()
  }
  doc._change = function(changes, cb) {
    quill.updateContents(changes)
    cb()
  }
  doc._collectChanges = function(cb){cb()}

  quill.on('text-change', function(changes, source) {
    if (source !== 'user') return
    doc.update(changes)
  })
  return doc
}
