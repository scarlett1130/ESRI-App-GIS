var editor = null;
var layerList = null;
define([
    "esri/config",
    "esri/map",
    "esri/SnappingManager",
    "esri/dijit/LayerList",
    "esri/dijit/Legend",
    "esri/dijit/editing/Editor",
    'app/widgets/WidgetDemo/widget',
    'app/widgets/editor/widget',
    'app/widgets/identificar/widget',
    'app/widgets/Search/widget',
    'app/utils/maputils',
    'app/utils/popupMedidores',
    'app/utils/popupContratos',
    'app/utils/popupFacilidades',
    'app/utils/popupPozos',
    'app/utils/popupTanques',
    "esri/layers/FeatureLayer",
    "esri/dijit/Scalebar",
    "esri/dijit/HomeButton",
    "esri/dijit/BasemapGallery",
    "esri/toolbars/draw",
    "dojo/dom-construct",
    "dojo/keys",
    'dojo/on',
    "dojo/parser",
    'dojo/_base/lang',
    "dojo/_base/array",
    "dojo/i18n!esri/nls/jsapi",
    'dojo/text!./config.json',
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dojo/domReady!"
], function (
    esriConfig, Map, SnappingManager, LayerList, Legend, Editor,
    WidgetDemo, Editor, identificar, buscar, maputils, popupMedidores,
    popupContratos, popupFacilidades, popupPozos, popupTanques,
    FeatureLayer, Scalebar, HomeButton, BasemapGallery,
    Draw, domConstruct, keys, on, parser, lang, arrayUtils, i18n, config
) {

        parser.parse();
        var configCapas = JSON.parse(config);
        var map = maputils;
        var tabEditor = dijit.byId("editor");
        tabEditor.watch("selectedChildWidget", lang.hitch(this, function (name, oval, nval) {
            if (nval.title !== 'Editor') {
                if (dojo.byId("editorDiv")) {
                    this.editor.template.destroy();
                    this.editor.destroy();
                    this.editor = null;                    
                }
                // else if (nval.title !== 'Busqueda') {
                //     addLayers();
                //     //removerRelaciones();                
                // }
            }
            else {
                domConstruct.create("div", { id: "editorDiv", innerHTML: "" }, "templatePickerPane");
                this.editor = new Editor(
                    {
                        map: map
                    }, "editorDiv"
                );
                this.editor.startup();
            }

        }));
        addLayers();
        map.on("layer-add", lang.hitch(this, function () {
            var array = [];
            var layers = Object.keys(map._layers);
            for (var i = 0; i < layers.length; i++) {
                var layer = {};
                if (layers[i] !== 'layer0' && layers[i] !== 'map_graphics') {
                    layer["layer"] = map._layers[layers[i]];
                    if (map._layers[layers[i]].infoTemplate.info) {
                        layer["title"] = map._layers[layers[i]].infoTemplate.info.title;
                    }
                    else {
                        layer["title"] = map._layers[layers[i]].infoTemplate.title + " " + map._layers[layers[i]].id;
                    }
                    layer["visibility"] = true;
                    array.push(layer);
                }
            }
            if (this.layerList) {
                this.layerList.destroy();
                domConstruct.create("div", { id: "layerList", innerHTML: "" }, "layerListCon");
                this.layerList = new LayerList({
                    map: map,
                    layers: array,
                    removeUnderscores: true,
                    showOpacitySlider: true,
                    showSubLayers: true
                }, "layerList");
                this.layerList.startup();

            }
            else {
                this.layerList = new LayerList({
                    map: map,
                    layers: array,
                    removeUnderscores: true,
                    showOpacitySlider: true,
                    showSubLayers: true
                }, "layerList");
                this.layerList.startup();

            }
        }));
        var scalebar = new Scalebar({
            map: map,
            scalebarStyle: "ruler",
            scalebarUnit: "metric"
        });
        var home = new HomeButton({
            map: map
        }, "HomeButton");
        home.startup();
        var basemapGallery = new BasemapGallery({
            showArcGISBasemaps: true,
            map: map
        }, "basemapGallery");
        basemapGallery.startup();
        var legend = new Legend({
            map: map
        }, "legend");
        legend.startup();

        /*var search = new Search({
            map: map
        }, "search");
        search.startup();
        var demoWidget = new WidgetDemo({
            map: map,
            url: 'http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized/FeatureServer/0'
        }, 'demo');
        demoWidget.startup();*/
        editor = new Editor(
            {
                map: map
            }, "editorDiv"
        );
        editor.startup();
        var busca = new buscar({
            map: map,
            configCapas: configCapas
        }, "busqueda");
        busca.startup();
        /*var identi=new identificar({
            map:map,
            url:"http://localhost:6080/arcgis/rest/services/Capas/capasEdicion/MapServer"
        },"identificar");
        identi.startup();  */
        function addLayers() {
            var arrayLayers = [];
            var operationsPointLayer_facilidad = new FeatureLayer(configCapas.capaFacilidades.url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"],
                infoTemplate: popupFacilidades,
                id: configCapas.capaFacilidades.id

            });
            var operationsPointLayer_medidoresp = new FeatureLayer(configCapas.capaMedidores.url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"],
                infoTemplate: popupMedidores,
                id: configCapas.capaMedidores.id
            });
            var operationsPointLayer_pozos = new FeatureLayer(configCapas.capaPozos.url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"],
                infoTemplate: popupPozos,
                id: configCapas.capaPozos.id
            });
            var operationsPointLayer_tanques = new FeatureLayer(configCapas.capaTanques.url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"],
                infoTemplate: popupTanques,
                id: configCapas.capaTanques.id
            });
            var operationsPolygonLayer_contrato = new FeatureLayer(configCapas.capaContratos.url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"],
                infoTemplate: popupContratos,
                id: configCapas.capaContratos.id
            });
            arrayLayers.push(operationsPolygonLayer_contrato);            
            arrayLayers.push(operationsPointLayer_tanques);
            arrayLayers.push(operationsPointLayer_medidoresp);
            arrayLayers.push(operationsPointLayer_pozos);
            arrayLayers.push(operationsPointLayer_facilidad);
            
            for (var i = 0; i < arrayLayers.length; i++) {
                var layerTemp = map.getLayer(arrayLayers[i].id);
                if (layerTemp) {
                    map.removeLayer(layerTemp);
                }               
                map.addLayer(arrayLayers[i]);
            }
        }
        function removerRelaciones()
        {
            var layerIds=map.layerIds;
            for(var i=0;i<layerIds.length;i++)
            {
                var layer=map.getLayer(layerIds[i]);
                if(layer.infoTemplate.title)
                {
                    if(layer.infoTemplate.title==='Enlace')
                    {
                        map.removeLayer(layer);                        
                    }
                }
            }

        }
    });