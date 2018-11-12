define([
    'esri/dijit/PopupTemplate'  
  ], function(
    PopupTemplate,
    Medidor
  ) {
      var popup= new PopupTemplate({
        "title": "Contrato",
        "fieldInfos": [
          {
            "fieldName": "CONTRATO_N",
            "label": "Número de contrato:",
            "visible": true,          
          }, {
            "fieldName": "ID_CONTRATO",
            "label": "Identificador de contrato:",
            "visible": true          
          }         
        ]
      });
      return popup;
  });