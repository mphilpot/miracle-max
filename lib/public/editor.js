function SitemapCtrl($scope, $http) {

  $scope.data = {
    path: '',
  };



  $http.get('pages', $scope)
        .success(function(data) {
          $scope.pages = data;
          console.log(data);
        })
        .error(function(data) {

        });

  $scope.deletePage = function(page) {
    if (window.confirm("delete page " + page.path + " ?")) {
      console.log('delte page %s', page.path);
      $http.post('delete', {path: page.path})
        .success(function(data) {
          // window.location = data.redirect;
          $scope.pages = data;
        })
        .error(function(data) {

        });
    }
  }

  $scope.submit = function() {
    console.log($scope.data)
    $http.post('create', $scope.data)
        .success(function(data) {
          // window.location = data.redirect;
          $scope.pages = data;
        })
        .error(function(data) {

        });
  };
}
