define([
    'esri/dijit/PopupTemplate'   
  ], function(
    PopupTemplate,
    Medidor
  ) {
      var popup= new PopupTemplate({
        "title": "Tanque",
        "fieldInfos": [
          {
            "fieldName": "tanque",
            "label": "Tanque:",
            "visible": true,          
          }, {
            "fieldName": "id_tanque",
            "label": "Identificador Tanque:",
            "visible": true          
          }, {
            "fieldName": "id_facilidad",
            "label": "Identificador Facilidad:",
            "visible": true
          }        
        ]
      });
      return popup;
  });