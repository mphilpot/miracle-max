function SitemapCtrl($scope, $http, $rootScope) {

  $scope.data = {
    path: '',
  };

  $http.get('pages', $scope)
        .success(function(data) {
          $scope.pages = data;
          console.log(data);
        })
        .error(function(data) {
          // Display butter bar
        });

  $scope.deletePage = function(page) {
    if (window.confirm("delete page " + page.path + " ?")) {
      console.log('delte page %s', page.path);
      $http.post('delete', {path: page.path})
        .success(function(data) {
          $scope.pages = data;
          $rootScope.$broadcast('success', 'Successfully deleted the page ' + page.path)
        })
        .error(function(data) {
          $rootScope.$broadcast('error', 'Error deleting the page. \n' + data)
        });
    }
  }

  $scope.submit = function() {
    console.log($scope.data)

    if ($scope.data.path.indexOf('/') != 0) {
      $scope.data.path = '/' + $scope.data.path;
    }

    $http.post('create', $scope.data)
        .success(function(data) {
          $scope.pages = data;
          $rootScope.$broadcast('success', 'You created page ' + $scope.data.path);
          $scope.data.path = '';
        })
        .error(function(data) {
          $rootScope.$broadcast('error', 'Creating the page. \n' + data)
        });
  };
};

function NavbarCtrl($scope, $http, $rootScope) {
  $scope.publish = function() {
    $http.get('/_sitemap/export', $scope)
        .success(function(data) {
          $rootScope.$broadcast('success', 'Successfully published the site.');
        })
        .error(function(e) {
          $rootScope.$broadcast('error', 'Error publishing the site.\n' + e);
        });
  }
}

function NotificationCtrl($scope, $rootScope) {
  // $rootScope.$broadcast('handleBroadcast');
  $scope.$on('notification', function(event, obj) {
    $scope.style = 'alert';
    $scope.message = obj;
    $('#notification').show();
  })

  $scope.$on('success', function(event, obj) {
    $scope.style = 'alert alert-success';
    $scope.message = obj;
    $('#notification').show();
  })

  $scope.$on('error', function(event, obj) {
    $scope.style = 'alert alert-error';
    $scope.message = obj;
    $('#notification').show();
  })

  $scope.$on('clear', function() {
    $('#notification').hide();
  });

  $scope.close = function() {
    $('#notification').hide();
  }
}

function displayError(err) {
  $('#notification').html(err).show();
}

function displayNotification(msg) {
  $('#notification').html(msg).show();
}
