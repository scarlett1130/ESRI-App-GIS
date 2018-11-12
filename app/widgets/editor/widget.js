define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/topic',
  'dojo/dom',
  'dojo/Evented',
  'dijit/form/Button',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./widget.html',
  'dojo/text!./config.json',
  "esri/config",
  "esri/map",
  "esri/SnappingManager",
  "esri/dijit/editing/Editor",
  "esri/dijit/editing/TemplatePicker",
  "esri/layers/FeatureLayer",
  "esri/tasks/GeometryService",
  "esri/toolbars/draw",
  "dojo/keys",
  "dojo/parser",
  "dojo/_base/array",
  "dojo/i18n!esri/nls/jsapi",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dojo/domReady!",
  'xstyle/css!./css/style.css'
], function (
  declare, lang, topic, dom, Evented, dojoBtn,
  _WidgetBase, _TemplatedMixin, templateString,
  config, esriConfig, Map, SnappingManager, Editor,TemplatePicker, FeatureLayer, GeometryService,
  Draw, keys, parser, arrayUtils, i18n
) {

    var hitch = lang.hitch;

    return declare([_WidgetBase, _TemplatedMixin, Evented], {

      templateString: templateString,
      config: JSON.parse(config),
      map: null,
      baseClass: 'widget-editor',

      postCreate: function () {
        this.inherited(arguments);
        this.map = this.get('map');
        i18n.toolbars.draw.start += "<br/>Press <b>CTRL</b> to enable snapping";
        i18n.toolbars.draw.addPoint += "<br/>Press <b>CTRL</b> to enable snapping";
        esriConfig.defaults.io.proxyUrl = "/proxy/";
        esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
        this.initEditing();
        this.map.infoWindow.resize(400, 300);
      },
      startup: function () {
        this.inherited(arguments);
        //console.log('demoWidget');
      },
      _crearBoton: function (prop, parent, click) {
        var boton = new dojoBtn({ label: prop });
        boton.startup();
        boton.placeAt(parent);
        boton.on("click", click);
      },
      initEditing: function (event) {
        var featureLayerInfos1 = arrayUtils.map(Object.keys(this.map._layers), hitch(this, function (layer) {
          if (layer.includes("graphicsLayer")) {
            return {
              "featureLayer": this.map._layers[layer]
            };
          }
        }));
        var templateLayers1 = arrayUtils.map(Object.keys(this.map._layers), hitch(this, function (layer) {
          if (layer.includes("graphicsLayer")) {
            return this.map._layers[layer]
          }
        })); 
        var templateLayers = [];
        for (var i = 0; i < templateLayers1.length; i++) {
          if (templateLayers1[i]) {
            templateLayers.push(templateLayers1[i]);
          }

        }      
        var templatePicker = new TemplatePicker({
          featureLayers: templateLayers,
          grouping: false,
          rows: 6,
          columns: "auto",
          useLegend:false,  
          style: "height: 100%"       
        }, "editorDivPanel");
        templatePicker.startup();

        var featureLayerInfos = [];
        for (var i = 0; i < featureLayerInfos1.length; i++) {
          if (featureLayerInfos1[i]) {
            featureLayerInfos.push(featureLayerInfos1[i]);
          }

        }
        var settings = {
          map: this.map,
          templatePicker: templatePicker,
          layerInfos: featureLayerInfos
        };
        var params = {
          settings: settings
        };
        editorWidget = new Editor(params);
        editorWidget.startup();
        this.map.enableSnapping();
      }
    });

  });
