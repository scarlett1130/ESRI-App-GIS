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
    "esri/layers/FeatureLayer",
    "esri/tasks/GeometryService",
    "esri/toolbars/draw",
    "dojo/dom-construct",
    "dojo/keys",
    "dojo/parser",
    "dojo/_base/array",
    "dojo/i18n!esri/nls/jsapi",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/TabContainer",    
    "dojo/domReady!"
], function (
    esriConfig, Map, SnappingManager, LayerList, Legend, Editor,
    Search,WidgetDemo,Editor,
    FeatureLayer, GeometryService,
    Draw, domConstruct,keys, parser, arrayUtils, i18n
) {

        parser.parse();
        var map = new Map("map", {
            basemap: "topo",
            center: [-73.78, 6.95],
            zoom: 12
        });
        /*var aux=dojo.byId("aux");
        var aux1=dijit.byId("aux");     
        console.log(aux);
        console.log(aux1);*/
       
        //snapping is enabled for this sample - change the tooltip to reflect this
        // i18n.toolbars.draw.start += "<br/>Press <b>CTRL</b> to enable snapping";
        // i18n.toolbars.draw.addPoint += "<br/>Press <b>CTRL</b> to enable snapping";

        //This sample requires a proxy page to handle communications with the ArcGIS Server services. You will need to
        //replace the url below with the location of a proxy on your machine. See the 'Using the proxy page' help topic
        //for details on setting up a proxy page.
       

        

        // map.on("layers-add-result", initEditing);

        var operationsPointLayer_facilidad = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/0", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"]
        });
        var operationsPointLayer_medidoresp = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/1", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"]
        });
        var operationsPointLayer_pozos = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/2", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"]
        });
        var operationsPointLayer_tanques = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/3", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"]
        });
        var operationsPolygonLayer_contrato = new FeatureLayer("https://services9.arcgis.com/mUzsVrpsS8a8ZBgW/ArcGIS/rest/services/Datos/FeatureServer/4", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"]
        });

        map.addLayers([
            operationsPolygonLayer_contrato,
            operationsPointLayer_pozos,
            operationsPointLayer_tanques,
            operationsPointLayer_medidoresp,
            operationsPointLayer_facilidad
        ]);
        // map.infoWindow.resize(400, 300);

        var layerList = new LayerList({
            map: map,
            removeUnderscores: true,
            showLegend: true,
            showOpacitySlider: true,
            showSubLayers: true
        }, "layerList");
        layerList.startup();

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
        var editor= new Editor(
            {
                map: map 
            },"editorDiv"
        );
        editor.startup();
       /* aux1.watch("selectedChildWidget", function(name, oval, nval){
            if(nval.title!=='Editor')
            {
                editor.destroy();
                editor=null;
                alert("hola");
            }
            else
            {
                domConstruct.create("div", { id: "editorDiv", innerHTML: "" }, "templatePickerPane");
                var editor= new Editor(
                    {
                        map: map 
                    },"editorDiv"
                );
                editor.startup();
                // map.on("layers-add-result", initEditing);
            }
            console.log("selected child changed from ", oval, " to ", nval);
        });*/
        function initEditing(event) {
            var featureLayerInfos = arrayUtils.map(event.layers, function (layer) {
                return {
                    "featureLayer": layer.layer
                };
            });

            var settings = {
                map: map,
                layerInfos: featureLayerInfos
            };
            var params = {
                settings: settings
            };
            editorWidget = new Editor(params, 'editorDiv');
            editorWidget.startup();

            //snapping defaults to Cmd key in Mac & Ctrl in PC.
            //specify "snapKey" option only if you want a different key combination for snapping
            map.enableSnapping();
        }
    });