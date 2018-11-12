define([
  'dojo/_base/declare',
  "dojo/_base/array",
  'dojo/_base/lang',
  'dojo/topic',
  'dojo/dom',
  'dojo/Evented',
  'dijit/form/Button',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  "dojo/text!./templates/Medidor.html",
  'dojo/text!./widget.html',
  'dojo/text!./config.json',

  "esri/tasks/IdentifyParameters",
  "esri/tasks/IdentifyTask",
  "esri/InfoTemplate",


  'xstyle/css!./css/style.css'
], function (
  declare,arrayUtils, lang, topic, dom, Evented,dojoBtn,
  _WidgetBase, _TemplatedMixin,
  Medidor,
  templateString,config,
  IdentifyParameters,IdentifyTask,InfoTemplate  
) {   

    return declare([_WidgetBase, _TemplatedMixin, Evented], {

      templateString: templateString,
      config: JSON.parse(config),

      baseClass: 'widget-identificar',
      map:null,
      identifyTask:null,

      postCreate: function () {
        this.inherited(arguments);       
        var url = this.get('url');
        this.identifyTask = new IdentifyTask(url);
        this.map = this.get('map');
        this._mapClickHandler = this.map.on("click", lang.hitch(this, this._onMapClick));              
      },
      startup: function () {
        this.inherited(arguments);        
        console.log('demoWidget');
    },
    _onMapClick: function (event) {
      var params = new IdentifyParameters(),
        defResults;
      params.geometry = event.mapPoint;
      params.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
      params.mapExtent = this.map.extent;
      params.returnGeometry = true;
      params.width = this.map.width;
      params.height= this.map.height;
      params.spatialReference = this.map.spatialReference;
      params.tolerance = 3;

      this.map.graphics.clear();
      defResults = this.identifyTask.execute(params).addCallback(lang.hitch(this, this._onIdentifyComplete));
      this.map.infoWindow.setFeatures([defResults]);
        this.map.infoWindow.show(event.mapPoint);
    },

    _onIdentifyComplete: function (results) {

      return arrayUtils.map(results, function (result) {
        var feature = result.feature,
          title = result.layerName,
          content;

        switch(title) {
          case "prueba.sde.MEDIDORESP":
            content = Medidor;
            break;
          case "Census Block Group":
            content = BlockGroupTemplate;
            break;
          case "Detailed Counties":
            content = CountyTemplate;
            break;
          case "states":
            content = StateTemplate;
            break;
          default:
            content = "${*}";
        }

        feature.infoTemplate = new InfoTemplate(title, content);

        return feature;
      });
    }
     
    });

  });
