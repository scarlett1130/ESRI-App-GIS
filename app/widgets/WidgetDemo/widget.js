define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/topic',
  'dojo/dom',
  'dojo/Evented',
  'dijit/form/Button',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/layers/FeatureLayer',
  'dojo/text!./widget.html',
  'dojo/text!./config.json',
  'xstyle/css!./css/style.css'
], function (
  declare, lang, topic, dom, Evented,dojoBtn,
  _WidgetBase, _TemplatedMixin,
  FeatureLayer,
  templateString,
  config
) {

    var hitch = lang.hitch;

    return declare([_WidgetBase, _TemplatedMixin, Evented], {

      templateString: templateString,
      config: JSON.parse(config),

      baseClass: 'widget-demo',

      postCreate: function () {
        this.inherited(arguments);
        aux = dojo.byId("prueba").innerHTML = "<h1>"+this.config.mensaje+"</h1>";
        var url = this.get('url');
        var map = this.get('map');
        this._crearBoton('pruebabtn','prueba',hitch(this,function(){console.log(map)}));      
      },
      startup: function () {
        this.inherited(arguments);
        console.log('demoWidget');
    },
      _crearBoton: function (prop, parent, click) {
        var boton = new dojoBtn({ label: prop });
        boton.startup();
        boton.placeAt(parent);
        boton.on("click", click);
      }
    });

  });
