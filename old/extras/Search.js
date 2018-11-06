define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dojo/_base/lang'
], function (declare, _WidgetBase, _TemplatedMixin, lang) {
    return declare([_WidgetBase, _TemplatedMixin], {
        baseClass: "jofre-widget-search",
        templateString: '\x3cdiv\x3eThis is a very simple widget. \x3cinput type\x3d"button" value\x3d"Get Map Id" data-dojo-attach-event\x3d"click:_getMapId"\x3e.\x3c/div\x3e',
        postCreate: function () {
            this.inherited(arguments);
            console.log('Search::postCreate');
        },
        startup: function () {
            this.inherited(arguments);
            console.log('Search::startup');
        },
        _getMapId: function () {
            alert(this.map.id);
        }
    });
});
