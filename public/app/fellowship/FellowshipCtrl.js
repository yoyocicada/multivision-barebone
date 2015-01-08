/*******************************************************************************
 ******************************************************************************/

angular.module('app').controller('FellowshipCtrl', function ($scope,PostSvc,FellowshipDataSvc,$routeParams) {

	//include FellowshipDataSvc which captures all data needed for Fellowship widgets
	//	console.log("controller  kdfj;lakdjfl;askdjf;aklsj");
	$scope.FellowshipDataSvc=FellowshipDataSvc;
	$scope.FellowshipDataSvc.initialize($routeParams.id);
	$scope.posts=[];


	//query post data here
	$scope.posts = PostSvc.query({postUnderGroupType:'fellowship',postUnderGroupId:$routeParams.id },function() {
			console.log('front-end $scope.posts has been called');
			console.log('chk $scope.posts');
			console.log($scope.posts);
		}
	);

});

