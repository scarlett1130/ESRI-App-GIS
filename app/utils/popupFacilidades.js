define([
    'esri/dijit/PopupTemplate',   
  ], function(
    PopupTemplate,
    Medidor
  ) {
      var popup= new PopupTemplate({
        "title": "Facilidad",
        "fieldInfos": [
          {
            "fieldName": "FACILIDAD",
            "label": "Facilidad:",
            "visible": true               
          }, {
            "fieldName": "ID_FACILIDAD",
            "label": "Identificador Facilidad:",
            "visible": true
          },    
          {
            "fieldName": "contrato",
            "label": "Contrato:",
            "visible": true,          
          }     
        ]
      });
      return popup;
  });