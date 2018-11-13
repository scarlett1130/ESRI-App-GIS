var editor = null;
define([
    "esri/config",
    "esri/map",
    "esri/SnappingManager",
    "esri/dijit/LayerList",
    "esri/dijit/Legend",
    "esri/dijit/editing/Editor",
    "extras/Search",
    'app/widgets/WidgetDemo/widget',
    'app/widgets/editor/widget',
    'app/widgets/identificar/widget',
    'app/utils/maputils',
    'app/utils/popupMedidores',
    'app/utils/popupContratos',
    'app/utils/popupFacilidades',
    'app/utils/popupPozos',
    'app/utils/popupTanques',
    "esri/layers/FeatureLayer",
    "esri/dijit/Scalebar",
    "esri/toolbars/draw",
    "dojo/dom-construct",
    "dojo/keys",
    'dojo/on',
    "dojo/parser",
    'dojo/_base/lang',
    "dojo/_base/array",
    "dojo/i18n!esri/nls/jsapi",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",
    "dojo/domReady!"
], function (
    esriConfig, Map, SnappingManager, LayerList, Legend, Editor,
    Search, WidgetDemo, Editor, identificar, maputils, popupMedidores,
    popupContratos, popupFacilidades, popupPozos, popupTanques,
    FeatureLayer, Scalebar,
    Draw, domConstruct, keys, on, parser, lang, arrayUtils, i18n
) {

        parser.parse();
        var map = maputils; 
        var tabEditor = dijit.byId("editor");
        tabEditor.watch("selectedChildWidget", lang.hitch(this, function (name, oval, nval) {
            if (nval.title !== 'Editor') {
                if (dojo.byId("editorDiv")) {
                    this.editor.template.destroy();
                    this.editor.destroy();
                    this.editor = null;
                }
            }
            else {
                domConstruct.create("div", { id: "editorDiv", innerHTML: "" }, "templatePickerPane");
                editor = new Editor(
                    {
                        map: map
                    }, "editorDiv"
                );
                editor.startup();
            }

        }));

        var operationsPointLayer_facilidad = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/0", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            infoTemplate: popupFacilidades

        });
        var operationsPointLayer_medidoresp = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/1", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            infoTemplate: popupMedidores            
        });
        var operationsPointLayer_pozos = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/2", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            infoTemplate: popupPozos
        });
        var operationsPointLayer_tanques = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/3", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            infoTemplate: popupTanques
        });
        var operationsPolygonLayer_contrato = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/4", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            infoTemplate: popupContratos
        });

        map.addLayers([
            operationsPolygonLayer_contrato,
            operationsPointLayer_pozos,
            operationsPointLayer_tanques,
            operationsPointLayer_medidoresp,
            operationsPointLayer_facilidad
        ]);        
        var layerList = new LayerList({
            map: map,        
            removeUnderscores: true,           
            showOpacitySlider: true,
            showSubLayers: true
        }, "layerList");
        layerList.startup();
        on(layerList, 'load', function (evt) {            
            for(var i=0;i<evt.detail.widget.layers.length;i++)
            {
                if( evt.detail.widget.layers[i].id==='layer0')
                {
                    evt.detail.widget.layers.splice(i, 1 );                   
                }              
            }
            for(var i=0;i<evt.detail.widget._loadedLayers.length;i++)
            {
                if(evt.detail.widget._loadedLayers[i].layerInfo.id==='layer0')
                {
                    evt.detail.widget._loadedLayers.splice(i, 1 );
                                        
                }              
            } 
            evt.detail.widget.refresh();  
        })
        var scalebar = new Scalebar({
            map: map,
            scalebarStyle:"ruler",
            scalebarUnit:"metric"
          });
        var legend = new Legend({
            map: map

        }, "legend");
        legend.startup();

        var search = new Search({
            map: map
        }, "search");
        search.startup();
        var demoWidget = new WidgetDemo({
            map: map,
            url: 'http://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized/FeatureServer/0'
        }, 'demo');
        demoWidget.startup();
        editor = new Editor(
            {
                map: map
            }, "editorDiv"
        );
        editor.startup();
        /*var identi=new identificar({
            map:map,
            url:"http://localhost:6080/arcgis/rest/services/Capas/capasEdicion/MapServer"
        },"identificar");
        identi.startup();  */
    });