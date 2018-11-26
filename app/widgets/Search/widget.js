define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/topic',
  'dojo/dom',
  "dojo/store/Memory",
  "dijit/form/Select",
  "dijit/form/ComboBox",
  'dijit/form/CheckBox',
  'dojo/Evented',
  'dijit/form/Button',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'esri/layers/FeatureLayer',
  'esri/symbols/LineSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/geometry/Polyline',
  'esri/SpatialReference',
  'esri/renderers/SimpleRenderer',
  'esri/renderers/UniqueValueRenderer',
  'esri/Color',
  'esri/InfoTemplate',
  'esri/graphicsUtils',
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  'app/utils/popupMedidores',
  'app/utils/popupPozos',
  'app/utils/popupTanques',
  'dojo/text!./widget.html',
  'dojo/text!./config.json',
  'xstyle/css!./css/style.css'
], function (
  declare, lang, topic, dom, Memory, Select, ComboBox, CheckBox, Evented, dojoBtn,
  _WidgetBase, _TemplatedMixin,
  FeatureLayer, LineSymbol, SimpleLineSymbol, Polyline, SpatialReference, UniqueValueRenderer, SimpleRenderer, Color, InfoTemplate, graphicsUtils, Query, QueryTask,
  popupMedidores, popupPozos, popupTanques, templateString,
  config
) {

    var hitch = lang.hitch;

    return declare([_WidgetBase, _TemplatedMixin, Evented], {

      templateString: templateString,
      config: JSON.parse(config),

      baseClass: 'widget-search',
      map: null,
      configCapas: null,
      checkBoxes:null,
      jsonFacilidades: {},

      postCreate: function () {
        this.inherited(arguments);
        // aux = dojo.byId("contenidoSearch").innerHTML = "<h1>" + this.config.urlContrato + "</h1>";
        this.map = this.get('map');
        this.configCapas = this.get('configCapas')
        this._consulta(this.config.urlContrato, ["CONTRATO_N", "ID_CONTRATO"], "CONTRATO_N", "CONTRATO_N is not null and ID_CONTRATO is not null", this._jsonContratos, false);
      },
      startup: function () {
        this.inherited(arguments);
        console.log('demoWidget');
      },
      _consulta: function (url, campos, campoOrden, where, funcion, geometria) {
        var queryTask = new QueryTask(url);
        var query = new Query();
        query.outFields = campos;
        query.orderByFields = [campoOrden];
        query.where = where;
        query.returnGeometry = geometria;
        queryTask.execute(query, lang.hitch(this, funcion));
      },
      _jsonContratos: function (results) {
        var jsonContratos = {};
        selectedItems = { facilidad: [], pozo: [], tanque: [], medidor: [] };
        jsonContratos.contratos = [];
        results.features.forEach(function (elemento) {
          var jsonContrato = {};
          jsonContrato["nombre"] = elemento.attributes.CONTRATO_N;
          jsonContrato["id_contrato"] = elemento.attributes.ID_CONTRATO;
          jsonContratos.contratos.push(jsonContrato);
        });
        this._crearCombo(jsonContratos.contratos, "selectContratos", "selectContratos", "nombre");
        var select = dijit.byId('selectContratos');
        select.on('change', lang.hitch(this, function () {
          dojo.byId("labelFacilidad").innerHTML = "";
          document.getElementById("combosSearch").style.display = "none";
          document.getElementById("relaciones").style.display = "none";
          this._consulta(this.config.urlContrato, ["CONTRATO_N", "ID_CONTRATO"], "CONTRATO_N", "CONTRATO_N is not null and ID_CONTRATO is not null and id_contrato=" + select.item.id_contrato, this._zoomFeatures, true);
          this._consulta(this.config.urlFacilidades, ["facilidad", "id_facilidad"], "facilidad", "facilidad is not null and id_facilidad is not null and id_contrato=" + select.item.id_contrato, this._jsonFacilidades, true);
          this._agregarLayer(this.configCapas.capaMedidores.url, this.configCapas.capaMedidores.id, "1=1", popupMedidores);
          this._agregarLayer(this.configCapas.capaPozos.url, this.configCapas.capaPozos.id, "1=1", popupPozos);
          this._agregarLayer(this.configCapas.capaTanques.url, this.configCapas.capaTanques.id, "1=1", popupTanques);
        }));

      },
      _jsonFacilidades: function (results) {
        dojo.byId("labelFacilidad").innerHTML = "<label>Seleccione la facilidad</label>";
        var jsonFacilidades = {};
        jsonFacilidades.facilidades = [];
        results.features.forEach(lang.hitch(this, function (elemento) {
          var jsonFacilidad = {};
          jsonFacilidad["nombre"] = elemento.attributes.FACILIDAD;
          jsonFacilidad["id_facilidad"] = elemento.attributes.ID_FACILIDAD;
          jsonFacilidades.facilidades.push(jsonFacilidad);
        }));
        if (jsonFacilidades.facilidades.length > 0) {
          this._crearCombo(jsonFacilidades.facilidades, "selectFacilidades", "selectFacilidades", "nombre");
          document.getElementById("searchFacilidad").style.display = "block";
          var select = dijit.byId('selectFacilidades');
          select.on('change', lang.hitch(this, function () {
            dojo.byId("labelMedidores").innerHTML = "";
            dojo.byId("labelPozos").innerHTML = "";
            dojo.byId("labelTanques").innerHTML = "";
            if (select.item) {
              selectedItems.facilidad = select.item;
              this._consulta(this.config.urlFacilidades, ["facilidad", "id_facilidad"], "facilidad", "facilidad is not null and id_facilidad is not null and id_facilidad=" + select.item.id_facilidad, this._zoomFeatures, true);
              this._consulta(this.config.urlPozos, ["pozo", "id_pozo", "id_facilidad"], "pozo", "pozo is not null and id_pozo is not null and id_facilidad=" + select.item.id_facilidad, this._jsonPozos, true);
              this._consulta(this.config.urlTanques, ["tanque", "id_tanque", "id_facilidad"], "tanque", "tanque is not null and id_tanque is not null and id_facilidad=" + select.item.id_facilidad, this._jsonTanques, true);
              this._consulta(this.config.urlMedidores, ["medidor", "id_medidor", "id_facilidad", "tipo_medidor"], "medidor", "medidor is not null and id_medidor is not null and id_facilidad=" + select.item.id_facilidad, this._jsonMedidores, true);
              document.getElementById("combosSearch").style.display = "block";
              this._enableRelaciones(this.config.layers);
            }
          }));
        }
        else {
          dojo.byId("labelFacilidad").innerHTML = "<h3>No hay registros disponibles</h3>"
          document.getElementById("searchFacilidad").style.display = "none";
          document.getElementById("combosSearch").style.display = "none";
          document.getElementById("relaciones").style.display = "none";
        }
        /*this._crearSelect(jsonContratos.contratos, "contratos", "nombre", "selectContratos", "id_contrato");
        var comboContratos = dijit.byId("selectContratos-contratos");
        comboContratos.set("value", "00");*/
      },
      _jsonPozos: function (results) {
        dojo.byId("labelPozos").innerHTML = "<label>Seleccione el pozo</label>";
        var jsonPozos = {};
        jsonPozos.pozos = [];
        selectedItems.pozo = results;
        results.features.forEach(function (elemento) {
          var jsonPozo = {};
          jsonPozo["nombre"] = elemento.attributes.POZO;
          jsonPozo["id_pozo"] = elemento.attributes.ID_POZO;
          jsonPozos.pozos.push(jsonPozo);
        });
        this._crearCombo(jsonPozos.pozos, "selectPozos", "selectPozos", "nombre");
        var select = dijit.byId('selectPozos');
        select.on('change', lang.hitch(this, function () {
          this._consulta(this.config.urlPozos, ["pozo", "id_pozo"], "pozo", "id_pozo=" + select.item.id_pozo, this._zoomFeatures, true);
        }));
        this._agregarLayer(this.configCapas.capaPozos.url, this.configCapas.capaPozos.id, "pozo is not null and id_pozo is not null and id_facilidad=" + results.features[0].attributes.ID_FACILIDAD, popupPozos);
      },
      _jsonTanques: function (results) {
        dojo.byId("labelTanques").innerHTML = "<label>Seleccione el taque</label>";
        var jsonTanques = {};
        jsonTanques.tanques = [];
        selectedItems.tanque = results;
        results.features.forEach(function (elemento) {
          var jsonTanque = {};
          jsonTanque["nombre"] = elemento.attributes.TANQUE;
          jsonTanque["id_tanque"] = elemento.attributes.ID_TANQUE;
          jsonTanques.tanques.push(jsonTanque);
        });
        this._crearCombo(jsonTanques.tanques, "selectTanques", "selectTanques", "nombre");
        var select = dijit.byId('selectTanques');
        select.on('change', lang.hitch(this, function () {
          this._consulta(this.config.urlTanques, ["tanque", "id_tanque"], "tanque", "id_tanque=" + select.item.id_tanque, this._zoomFeatures, true);
        }));
        this._agregarLayer(this.configCapas.capaTanques.url, this.configCapas.capaTanques.id, "tanque is not null and id_tanque is not null and id_facilidad=" + results.features[0].attributes.ID_FACILIDAD, popupTanques);

      },
      _jsonMedidores: function (results) {
        dojo.byId("labelMedidores").innerHTML = "<label>Seleccione el medidor</label>";
        var jsonMedidores = {};
        jsonMedidores.medidores = [];
        selectedItems.medidor = results;
        results.features.forEach(function (elemento) {
          var jsonmedidor = {};
          jsonmedidor["nombre"] = elemento.attributes.MEDIDOR;
          jsonmedidor["id_medidor"] = elemento.attributes.ID_MEDIDOR;
          jsonMedidores.medidores.push(jsonmedidor);
        });
        this._crearCombo(jsonMedidores.medidores, "selectMedidores", "selectMedidores", "nombre");
        var select = dijit.byId('selectMedidores');
        select.on('change', lang.hitch(this, function () {
          this._consulta(this.config.urlMedidores, ["medidor", "id_medidor"], "medidor", "id_medidor=" + select.item.id_medidor, this._zoomFeatures, true);
        }));
        this._agregarLayer(this.configCapas.capaMedidores.url, this.configCapas.capaMedidores.id, "medidor is not null and id_medidor is not null and id_facilidad=" + results.features[0].attributes.ID_FACILIDAD, popupMedidores);
      },
      _crearSelect: function (array, nam, label, domId, clave) {
        var combo = dijit.byId(domId + "-" + nam);
        option = {
          value: "00",
          label: "Seleccione",
          selected: false
        };
        if (array !== undefined) {
          if (combo !== undefined) {
            dijit.byId(domId + "-" + nam).destroyRecursive(true);
            dojo.byId(domId).innerHTML = "";
            var Store = new Memory({
              idProperty: clave,
              data: array
            });
            var select = new Select({
              id: domId + "-" + nam,
              name: nam,
              store: Store,
              style: "width: 200px;",
              labelAttr: label,
              maxHeight: -1
            });
            select.addOption(option);
            select.startup();
            select.placeAt(domId);
          }
          else {
            var Store = new Memory({
              idProperty: clave,
              data: array
            });
            var select = new Select({
              id: domId + "-" + nam,
              name: nam,
              store: Store,
              style: "width: 200px;",
              labelAttr: label,
              maxHeight: -1
            });
            select.addOption(option);
            select.startup();
            select.placeAt(domId);
          }
        }
        else {
          dijit.byId(domId + "-" + nam).destroyRecursive(true);
          dojo.byId(domId).innerHTML = "";
        }

      },
      _crearCombo: function (arrDat, nam, domId, clave) {
        var combo = dijit.byId(domId);
        if (combo !== undefined) {
          var store = new Memory({
            data: arrDat
          });
          combo.store = store;
          combo.searchAttr = clave;
          combo.name = domId;
          combo.set("value", "Seleccione");
        }
        else {
          var store = new Memory({
            data: arrDat
          });
          var comboBox = new ComboBox({
            id: domId,
            name: nam,
            value: "Seleccione",
            store: store,
            searchAttr: clave,
            class: "prueba"
          }, domId).startup();
        }
      },
      _zoomFeatures: function (results) {
        if (results.features[0].geometry.type === 'point') {
          var mz = this.map.getMaxZoom();
          if (mz > -1) {
            this.map.centerAndZoom(results.features[0].geometry, mz - 2);
          } else {
            this.map.centerAndZoom(results.features[0].geometry, 0.25);
          }
        }
        else {
          var extentResultado = graphicsUtils.graphicsExtent(results.features);
          //extentResultado = extentResultado.expand(1);
          this.map.setExtent(extentResultado);
        }

        if (results.fields.find(d => d.name == "ID_FACILIDAD")) {
          selectedItems.facilidad = results;
        }
      },
      _crearFeature: function (checked, b) {

        var nameLayer = b.key;
        nameLayer=nameLayer.toLowerCase();
        var layerTemp = this.map.getLayer(nameLayer);

        if (layerTemp) {
          this.map.removeLayer(layerTemp)
        };

        if (checked) {
          var geometryType = 'esriGeometryPolyline';
          var localSpatialReference = new SpatialReference({ wkid: 4326 });


          var localColor = b.color;
          var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(localColor), 2);
          symbol.setMarker({
            style: "arrow",
            placement: "end"
          });
          var renderer = new SimpleRenderer(symbol);

          var featureCollection = {
            "layerDefinition": {
              "geometryType": geometryType,
              "objectIdField": "objectid",
              'spatialReference': localSpatialReference,
              'defaultVisibility': true,
              'fields': [
                {
                  "name": "objectid",
                  "type": "esriFieldTypeOID",
                  "alias": "objectid"
                }
              ]
            },
            "featureSet": {
              "features": [],
              "geometryType": geometryType
            }
          };
          featureCollection.layerDefinition.fields.push(this._newFieldString("origen", "Origen", 50));
          featureCollection.layerDefinition.fields.push(this._newFieldString("destino", "Destino", 50));

          infoTemplate = new InfoTemplate("Enlace", "Origen : ${origen}<br/> Destino : ${destino}");

          var coordinates = selectedItems[nameLayer].features.map((currentValue, index) => {
            var t = [];
            t.push([selectedItems.facilidad.features[0].geometry.x, selectedItems.facilidad.features[0].geometry.y])
            t.push([currentValue.geometry.x, currentValue.geometry.y]);

            var graphic = {
              'attributes': {
                "objectid": index,
                "origen": selectedItems.facilidad.features[0].attributes.FACILIDAD,
                "destino": currentValue.attributes[b.key]
              },
              'geometry': new Polyline(t)
            }

            return graphic;
          });




          featureCollection.featureSet.features = coordinates;

          featureLayerk = new FeatureLayer(featureCollection, {
            id: nameLayer,
            title: b.layerLabel,
            infoTemplate: infoTemplate
          });
          featureLayerk.attr("label", nameLayer);
          var extentResultado = graphicsUtils.graphicsExtent(featureCollection.featureSet.features);
          extentResultado = extentResultado.expand(2);
          this.map.setExtent(extentResultado);
          featureLayerk.setRenderer(renderer);
          this.map.addLayer(featureLayerk);
        }
      },
      _makeGeometry: function (checked) {
        // function (url, campos, campoOrden, where, funcion, geometria)
        // selectedItems = { facilidad: [], pozos: [], tanques: [], medidores: [] };
        var consulta = this.value;

        switch (consulta) {
          case 'facilidad':
            this._consulta(
              this.config.urlFacilidades,
              ["facilidad", "id_facilidad"],
              "facilidad",
              `facilidad is not null and id_facilidad=${selectedItems.facilidad.id_facilidad}`,
              (results) => { selectedItems.facilidad = results; },
              true
            );
            break;
          case 'pozos':
            this._consulta(
              this.config.urlPozos,
              ["pozo", "id_pozo"],
              "pozo",
              `pozo is not null and id_pozo is not null and id_facilidad= ${selectedItems.facilidad.id_facilidad}`,
              (results) => { selectedItems.pozos = results; },
              false
            );
            // this._crearFeature,
            break;
          case 'tanques':
            this._consulta(
              this.config.urlTanques,
              ["tanque", "id_tanque"],
              "tanque",
              `tanque is not null and id_tanque is not null and id_facilidad= ${selectedItems.facilidad.id_facilidad}`,
              (results) => { selectedItems.tanques = results; },
              true
            );
            break;
          case 'medidores':
            this._consulta(
              this.config.urlMedidores,
              ["medidor", "id_medidor"],
              "medidor",
              `medidor is not null and id_medidor is not null and id_facilidad=${selectedItems.facilidad.id_facilidad}`,
              (results) => { selectedItems.medidores = results; },
              true
            );
            break;
          default:
        }
      },
      _newFieldString: function (name, alias, length) {
        return {
          name: name,
          type: "esriFieldTypeString",
          alias: alias,
          length: length
        }
      },
      _enableRelaciones: function (layers) {
        document.getElementById("relaciones").style.display = "block";
        if (this.checkBoxes === null) {
          this.checkBoxes = Object.keys(layers).map((d) => { return layers[d] });
          this.checkBoxes.forEach(lang.hitch(this, function (element) {
            dojo.byId(`lbl${element.key}`).innerText = element.layerLabel;
            var checkBox = new CheckBox({
              name: element.key,
              value: element.key,
              label: element.layerLabel,
              showLabel: false,
              checked: false,
              onChange: lang.hitch(this, function (ischecked) { this._crearFeature(ischecked, element) }),
            }, `cbox${element.key}`);
            checkBox.startup();
            element['dijit'] = checkBox;
          }));
        }
      },
      _agregarLayer: function (url, id, where, popup) {
        var layerTemp = this.map.getLayer(id);
        if (layerTemp) {
          this.map.removeLayer(layerTemp);
        };
        var layer = new FeatureLayer(url, {
          mode: FeatureLayer.MODE_ONDEMAND,
          outFields: ["*"],
          infoTemplate: popup,
          id: id
        });
        layer.setDefinitionExpression(where);
        this.map.addLayer(layer);
      },
    });
  });
