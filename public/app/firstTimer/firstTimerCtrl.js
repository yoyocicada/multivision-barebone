
angular.module('app').controller('firstTimerCtrl', function ($timeout,$animate, $scope,$http,$routeParams,$rootScope, $upload, UserSvc, NotifierSvc, $location, AuthSvc) {
	$timeout(function() {
		return $animate.enabled(false, angular.element(".carousel"));
	});
	$scope.cloudinarySignedParams;
	$http.get("/cloudinarySigned?type=avatar").success(function(data){
		$scope.cloudinarySignedParams = data;
		console.log($.cloudinary.config());

	});
	$scope.onFileSelect = function($files) {
		var file = $files[0]; // we're not interested in multiple file uploads here
		$scope.upload = $upload.upload({
			url: "https://api.cloudinary.com/v1_1/" + $.cloudinary.config().cloud_name + "/upload",
			data: $scope.cloudinarySignedParams,
			file: file
		}).progress(function (e) {
			$scope.progress = Math.round((e.loaded * 100.0) / e.total);
			if($scope.progress==100){
				setTimeout(function(){
					$scope.progress = 0;
				},500);
			}
			$scope.$apply();
		}).success(function (data, status, headers, config) {
			console.log(data);
			$rootScope.photos = $rootScope.photos || [];
			data.context = {custom: {photo: $scope.title}};
			$scope.result = data;
			$rootScope.photos.push(data);
			$scope.backgroundImgPath = 'url('+data.url+')';
			$scope.$apply();
			//call and update image on user table
			$http.put('/api/users/update_profile_image',{profileImg:data.url}).success(function(){
				console.log('image updated');
			}).error(function(){
				console.log('image update failed');
			});
		});
	};
	//After user completes first timer setup,
	//he will not be redirected to this page again
	$scope.deleteUserFromValidation=function(){
		$http.delete('/api/activate').success(function(){
			console.log('user successfully deleted from Validation dataset');
			$location.url('/personal');
		}).error(function(){
			console.log('user removal failed');
		});
	};

});