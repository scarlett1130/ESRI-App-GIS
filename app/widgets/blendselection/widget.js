define([
  'dojo/_base/declare',
  'dojo/Evented',
  'dojo/topic',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./widget.html'
], function(
  declare, Evented, topic,
  _WidgetBase, _TemplatedMixin,
  templateString
) {

  return declare([_WidgetBase, _TemplatedMixin, Evented], {

    templateString: templateString,

    baseClass: 'blend-select',

    onChange: function(e) {
      var val = e.target.value;
      if (this.cboxNode.checked) {
      topic.publish('blend-select-update', val);
      } else {
        this.emit('blend-select-update', val);
      }
    }

  });

})
