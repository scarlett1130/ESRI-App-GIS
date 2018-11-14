var dojoConfig = {
  isDebug: true,
  deps: ['app/main'],
  packages: [{
    name: 'app',
    location: location.pathname.replace(new RegExp(/\/[^\/]+$/), '') + '/app'
  },
  {
    name: "extras",
    location: location.href.replace('index.html', '') + "/extras"
  }]
};