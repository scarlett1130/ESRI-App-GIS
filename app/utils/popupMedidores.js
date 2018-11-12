define([
    'esri/dijit/PopupTemplate'   
  ], function(
    PopupTemplate,
    Medidor
  ) {
      var popup= new PopupTemplate({
        "title": "Medidor",
        "fieldInfos": [
          {
            "fieldName": "medidor",
            "label": "Medidor:",
            "visible": true,          
          }, {
            "fieldName": "tipo_medidor",
            "label": "Tipo de Medidor:",
            "visible": true          
          }, {
            "fieldName": "id_medidor",
            "label": "Identificador Medidor:",
            "visible": true
          }, {
            "fieldName": "id_facilidad",
            "label": "Identificador facilidad:",
            "visible": true
          },           
        ]
      });
      popup.se
      return popup;
  });