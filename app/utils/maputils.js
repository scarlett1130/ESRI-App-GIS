define([
    "esri/map",    
], function(Map) {
    var map= new Map("map", {
        basemap: "topo",
        center: [-73.78, 6.95],
        zoom: 12
    });
    return map;    
});