var dojoConfig = {
  isDebug: true,
  deps: ['app/main'],
  packages: [{
    name: 'app',
    location: location.pathname.replace(new RegExp(/\/[^\/]+$/), '') + '/app'
  }]
};