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
  'dojo/text!./widget.html',
  'dojo/text!./config.json',
  'xstyle/css!./css/style.css'
], function (
  declare, lang, topic, dom, Memory, Select, ComboBox, CheckBox, Evented, dojoBtn,
  _WidgetBase, _TemplatedMixin,
  FeatureLayer, LineSymbol, SimpleLineSymbol, Polyline, SpatialReference, UniqueValueRenderer, SimpleRenderer, Color, InfoTemplate, graphicsUtils, Query, QueryTask,
  templateString,
  config
) {

    var hitch = lang.hitch;

    return declare([_WidgetBase, _TemplatedMixin, Evented], {

      templateString: templateString,
      config: JSON.parse(config),

      baseClass: 'widget-search',
      map: null,
      jsonFacilidades: {},

      postCreate: function () {
        this.inherited(arguments);
        // aux = dojo.byId("contenidoSearch").innerHTML = "<h1>" + this.config.urlContrato + "</h1>";
        this.map = this.get('map');
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
        selectedItems = { facilidad: [], pozos: [], tanques: [], medidores: [] };
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
          this._consulta(this.config.urlFacilidades, ["facilidad", "id_facilidad"], "facilidad", "facilidad is not null and id_facilidad is not null and id_contrato=" + select.item.id_contrato, this._jsonFacilidades, false);
        }));
      },
      _jsonFacilidades: function (results) {
        dojo.byId("labelFacilidad").innerHTML = "<label>Seleccione la facilidad</label>";
        var jsonFacilidades = {};
        jsonFacilidades.facilidades = [];
        results.features.forEach(lang.hitch(this, function (elemento) {
          var jsonFacilidad = {};
          jsonFacilidad["nombre"] = elemento.attributes.facilidad;
          jsonFacilidad["id_facilidad"] = elemento.attributes.id_facilidad;
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
              this._consulta(this.config.urlPozos, ["pozo", "id_pozo"], "pozo", "pozo is not null and id_pozo is not null and id_facilidad=" + select.item.id_facilidad, this._jsonPozos, true);
              this._consulta(this.config.urlTanques, ["tanque", "id_tanque"], "tanque", "tanque is not null and id_tanque is not null and id_facilidad=" + select.item.id_facilidad, this._jsonTanques, true);
              this._consulta(this.config.urlMedidores, ["medidor", "id_medidor"], "medidor", "medidor is not null and id_medidor is not null and id_facilidad=" + select.item.id_facilidad, this._jsonMedidores, true);
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
        selectedItems.pozos = results;
        results.features.forEach(function (elemento) {
          var jsonPozo = {};
          jsonPozo["nombre"] = elemento.attributes.pozo;
          jsonPozo["id_pozo"] = elemento.attributes.id_pozo;
          jsonPozos.pozos.push(jsonPozo);
        });
        this._crearCombo(jsonPozos.pozos, "selectPozos", "selectPozos", "nombre");
        var select = dijit.byId('selectPozos');
        select.on('change', lang.hitch(this, function () {
          this._consulta(this.config.urlPozos, ["pozo", "id_pozo"], "pozo", "id_pozo=" + select.item.id_pozo, this._zoomFeatures, true);
        }));
      },
      _jsonTanques: function (results) {
        dojo.byId("labelTanques").innerHTML = "<label>Seleccione el taque</label>";
        var jsonTanques = {};
        jsonTanques.tanques = [];
        selectedItems.tanques = results;
        results.features.forEach(function (elemento) {
          var jsonTanque = {};
          jsonTanque["nombre"] = elemento.attributes.tanque;
          jsonTanque["id_tanque"] = elemento.attributes.id_tanque;
          jsonTanques.tanques.push(jsonTanque);
        });
        this._crearCombo(jsonTanques.tanques, "selectTanques", "selectTanques", "nombre");
        var select = dijit.byId('selectTanques');
        select.on('change', lang.hitch(this, function () {
          this._consulta(this.config.urlTanques, ["tanque", "id_tanque"], "tanque", "id_tanque=" + select.item.id_tanque, this._zoomFeatures, true);
        }));
      },
      _jsonMedidores: function (results) {
        dojo.byId("labelMedidores").innerHTML = "<label>Seleccione el medidor</label>";
        var jsonMedidores = {};
        jsonMedidores.medidores = [];
        selectedItems.medidores = results;
        results.features.forEach(function (elemento) {
          var jsonmedidor = {};
          jsonmedidor["nombre"] = elemento.attributes.medidor;
          jsonmedidor["id_medidor"] = elemento.attributes.id_medidor;
          jsonMedidores.medidores.push(jsonmedidor);
        });
        this._crearCombo(jsonMedidores.medidores, "selectMedidores", "selectMedidores", "nombre");
        var select = dijit.byId('selectMedidores');
        select.on('change', lang.hitch(this, function () {
          this._consulta(this.config.urlMedidores, ["medidor", "id_medidor"], "medidor", "id_medidor=" + select.item.id_medidor, this._zoomFeatures, true);
        }));
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

        if (results.fields.find(d => d.name == "id_facilidad")) {
          selectedItems.facilidad = results;
        }
      },
      _crearFeature: function (checked, b) {

        var nameLayer = b;
        var layerTemp = this.map.getLayer(nameLayer);

        if (layerTemp) {
          this.map.removeLayer(layerTemp)
        };

        if (checked) {
          var geometryType = 'esriGeometryPolyline';
          var localSpatialReference = new SpatialReference({ wkid: 4326 });


          var localColor = this.config.layers[nameLayer].color;
          var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color(localColor), 2);
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
          featureCollection.layerDefinition.fields.push(this._newFieldString("inicio", "Inicio", 50));
          featureCollection.layerDefinition.fields.push(this._newFieldString("fin", "Fin", 50));

          infoTemplate = new InfoTemplate("Enlace", "Inicio : ${inicio}<br/> Fin : ${fin}");

          var coordinates = selectedItems[nameLayer].features.map((currentValue) => {
            var t = [];
            t.push([selectedItems.facilidad.features[0].geometry.x, selectedItems.facilidad.features[0].geometry.y])
            t.push([currentValue.geometry.x, currentValue.geometry.y]);
            return t;
          }).reduce(
            (accumulator, currentValue) => {
              accumulator.push(currentValue);
              return accumulator;
            }
            , []
          );;

          var line = new Polyline(coordinates);

          var graphic = {
            'attributes': {
              "objectid": 1,
              "inicio": "uno",
              "fin": "dos"
            },
            'geometry': line
          }


          featureCollection.featureSet.features.push(graphic);

          featureLayerk = new FeatureLayer(featureCollection, {
            id: nameLayer,
            infoTemplate: infoTemplate
          });
          featureLayerk.attr("label", nameLayer);

          featureLayerk.setRenderer(renderer);
          this.map.addLayer(featureLayerk);

          var tempLayerList = dijit.byId('layerList');
          tempLayerList.refresh();
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
        if (typeof (checkBoxes) === 'undefined') {
          checkBoxes = Object.keys(layers).map(d => { return { name: d } });

          checkBoxes.forEach(lang.hitch(this, function (element) {
            dojo.byId(`lbl${element.name}`).innerText = element.name;
            var checkBox = new CheckBox({
              name: element.name,
              value: element.name,
              label: element.name,
              showLabel: false,
              checked: false,
              onChange: lang.hitch(this, function (ischecked) { this._crearFeature(ischecked, element.name) }),
            }, `cbox${element.name}`);
            checkBox.startup();
            element['dijit'] = checkBox;
          }));
        }
      }
    });
  });
