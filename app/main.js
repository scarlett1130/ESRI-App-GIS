var editor = null;
var layerList = null;
var search = null;
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
    "dojo/aspect",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dojox/layout/ExpandoPane",
    "dojo/domReady!"
], function (
    esriConfig, Map, SnappingManager, LayerList, Legend, Editor,
    WidgetDemo, Editor, identificar, buscar, maputils, popupMedidores,
    popupContratos, popupFacilidades, popupPozos, popupTanques,
    FeatureLayer, Scalebar, HomeButton, BasemapGallery,
    Draw, domConstruct, keys, on, parser, lang, arrayUtils, i18n, config, aspect
) {

        parser.parse();
        var configCapas = JSON.parse(config);
        var map = maputils;
        var tabEditor = dijit.byId("editor");
        tabEditor.watch("selectedChildWidget", lang.hitch(this, function (name, oval, nval) {
            switch (nval.title) {
                case "Edición":
                    domConstruct.create("div", { id: "editorDiv", innerHTML: "" }, "templatePickerPane");
                    this.editor = new Editor(
                        {
                            map: map
                        }, "editorDiv"
                    );
                    this.editor.startup();
                    break;
                case "Busqueda":
                    this.search.checkBoxes = null;
                    this.search.destroy();
                    domConstruct.create("div", { id: "busqueda", innerHTML: "" }, "busquedaPanel");
                    this.search = new buscar({
                        map: map,
                        configCapas: configCapas
                    }, "busqueda");
                    this.search.startup();
                    if (dojo.byId("editorDiv")) {
                        // this.editor.template.destroy();
                        this.editor.destroy();
                        this.editor = null;
                    }
                    break;
                case "Capas":
                    _addLayersList();
                    if (dojo.byId("editorDiv")) {
                        // this.editor.template.destroy();
                        this.editor.destroy();
                        this.editor = null;
                    }
                    break;
                default:
                    if (dojo.byId("editorDiv")) {
                        // this.editor.template.destroy();
                        this.editor.destroy();
                        this.editor = null;
                    }
                    break;
            }

        }));
        _addLayers();
        map.on("layer-add", lang.hitch(this, function () { _addLayersList() }));
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
        search = new buscar({
            map: map,
            configCapas: configCapas
        }, "busqueda");
        search.startup();
        /*var identi=new identificar({
            map:map,
            url:"http://localhost:6080/arcgis/rest/services/Capas/capasEdicion/MapServer"
        },"identificar");
        identi.startup();  */


        // resizePanel(200);
        var resizer = dojo.query("#resizer");
        var mainWindow = dijit.byId('mainWindow');
        var leftPanel = dijit.byId('editor');
        var splitter = mainWindow.getSplitter('leading');

        initResizer();

        function _addLayersList() {
            var array = [];
            var layers = Object.keys(map._layers);
            for (var i = 0; i < layers.length; i++) {
                var layer = {};
                if (!layers[i].includes("layer") && layers[i] !== 'map_graphics') {
                    layer["layer"] = map._layers[layers[i]];
                    if (!layer._basemapGalleryLayerType) {
                        if (map._layers[layers[i]].infoTemplate.info) {
                            layer["title"] = map._layers[layers[i]].infoTemplate.info.title;
                            layer["visibility"] = map._layers[layers[i]].visible;
                        }
                        else {
                            layer["title"] = map._layers[layers[i]].infoTemplate.title + " " + map._layers[layers[i]].id;
                            layer["visibility"] = map._layers[layers[i]].visible;
                        }
                    }
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

        }
        function _addLayers() {
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
        function removerRelaciones() {
            var layerIds = map.layerIds;
            for (var i = 0; i < layerIds.length; i++) {
                var layer = map.getLayer(layerIds[i]);
                if (layer.infoTemplate.title) {
                    if (layer.infoTemplate.title === 'Enlace') {
                        map.removeLayer(layer);
                    }
                }
            }

        }
        function initResizer() {
            var resizerHeight = 50;
            var splitterLeft = dojo.marginBox(splitter.domNode).l;
            var splitterWidth = dojo.marginBox(splitter.domNode).w;
            var splitterHeight = dojo.marginBox(splitter.domNode).h;

            dojo.style(resizer[0], "left", `${splitterLeft + splitterWidth}px`);
            dojo.style(resizer[0], "top", `${(splitterHeight - resizerHeight) / 2}px`);
            dojo.style(resizer[0], "height", `${resizerHeight}px`);

            on(resizer, 'click', resizePanel);

            aspect.after(splitter, "_startDrag", function (a, b) {
                dojo.style(resizer[0], "display", "none");
            });

            aspect.after(splitter, "_stopDrag", function (a, b) {
                var splitterLeft = dojo.marginBox(splitter.domNode).l;
                var splitterWidth = dojo.marginBox(splitter.domNode).w;
                dojo.style(resizer[0], "left", `${splitterLeft + splitterWidth}px`);
                dojo.style(resizer[0], "display", "inherit");
            });
        }
        function resizePanel(event) {
            var controlCssClass = 'closed';
            dojo.toggleClass(event.target, controlCssClass);
            var pWidth = (dojo.hasClass(event.target, controlCssClass)) ? 0 : 255;

            dojo.style(leftPanel.domNode, "width", `${pWidth}px`);
            mainWindow.resize();

            var splitterLeft = dojo.marginBox(splitter.domNode).l;
            var splitterWidth = dojo.marginBox(splitter.domNode).w;

            dojo.style(event.target, "left", `${splitterLeft + splitterWidth}px`);
        }
    });