define([
    'esri/dijit/PopupTemplate'   
  ], function(
    PopupTemplate,
    Medidor
  ) {
      var popup= new PopupTemplate({
        "title": "Pozo",
        "fieldInfos": [
          {
            "fieldName": "pozo",
            "label": "Pozo:",
            "visible": true
          }, {
            "fieldName": "id_pozo",
            "label": "Identificador Pozo:",
            "visible": true
          },     
           {
            "fieldName": "facilidad",
            "label": "Facilidad:",
            "visible": true          
          },
          {
            "fieldName": "contrato_1",
            "label": "Contrato:",
            "visible": true,          
          },      
        ]
      });
      return popup;
  });