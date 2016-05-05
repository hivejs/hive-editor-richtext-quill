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
