/*******************************************************************************
 ******************************************************************************/

angular.module('app').controller('FellowshipCtrl', function ($scope, PostApiSvc, FellowshipDataSvc, $routeParams, FellowshipApiSvc, $http, $upload) {

	console.log('FellowshipCtrl has been called');

	//include FellowshipDataSvc which captures all data needed for Fellowship widgets
	$scope.FellowshipDataSvc = FellowshipDataSvc;
	$scope.FellowshipDataSvc.initialize($routeParams.id);
	//default banner image
	$scope.FellowshipDataSvc.fellowship.bannerImage = 'h9wvhxsfi0prxrg0nipr';
	$scope.FellowshipDataSvc.fellowship.logoImage = 'h9wvhxsfi0prxrg0nipr';

	$scope.posts = [];
	//query post data here
	$scope.posts = PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id});
	$scope.selectedPost;
	$scope.selectedPostType = '';

	$scope.imagePrefix = 'https://res.cloudinary.com/ocfc/image/upload/';

	//console.log('chk $scope.posts array from FellowshipCtrl');
	//console.log($scope.posts);

	//Set default value for imagePopup
	$scope.imagePopup = {selectedPost: {
		postBy: {profileImg: ''},
		imageIds: [
			{id: ''}
		]
	}, isPopupOpen: false};

	$scope.$watch('imagePopup.isPopupOpen', function (newVal, oldVal) {
		console.log(newVal);
	});

	$scope.dropdown = [
		{
			"text": "Edit",
			"click": "editPost()"
		},
		{
			"text": "Delete",
			"click": "deletePost()"
		}
	];

	$scope.logoDropDown = [
		{
			"text": "Delete This Photo",
			"click": "deleteFellowshipImage('logo')"
		}
	];

	$http.get("/cloudinarySigned?type=fullSizeImg").success(function (data) {
		$scope.cloudinarySignedParams = data;
	});

	$scope.editFellowshipImage = function ($files, type) {
		console.log('editBannerImage within FellowshipCtrl has been triggered');
		var file = $files[0];//allow 1 image upload only
		console.log('for loop has been triggered');
		$scope.upload = $upload.upload({
			url: "https://api.cloudinary.com/v1_1/" + $.cloudinary.config().cloud_name + "/upload",
			data: $scope.cloudinarySignedParams,
			file: file
		}).progress(function (e) {
			console.log('progress method is being called');
			$scope.progress = Math.round((e.loaded * 100.0) / e.total);
			console.log('chk $scope.progress');
			console.log($scope.progress);
			if ($scope.progress == 100) {
				console.log('$scope.progress==100 IF statement has been called');
				setTimeout(function () {
					$scope.progress = 0;
				}, 10000);
				console.log('chk $scope.upload');
				console.log($scope.upload);
			}
			$scope.$apply();
		}).success(function (data, status, headers, config) {
			console.log('chk success data obj of editBannerImage within FellowshipCtrl');
			console.log(data);
			$scope.$apply();

			//update fellowship image
			console.log('updateFellowshipImage has been called');
			///api/fellowships/:id
			//update certain fields
			var fellowship = new FellowshipApiSvc();

			if (type === 'banner') {
				console.log('type equates to banner');

				fellowship.bannerImage = data.public_id;

				FellowshipApiSvc.update(
					{id: $routeParams.id}
					, fellowship, function () {
						console.log('front-end updateFellowshipImage from FellowshipCtrl has completed');
						//bind latest data onto $scope.FellowshipDataSvc.fellowship
						$scope.FellowshipDataSvc.fellowship.bannerImage = fellowship.bannerImage;
						console.log('chk fellowship obj');
						console.log(fellowship);
					}
				);

			} else {
				console.log('type equates to logo');
				fellowship.logoImage = data.public_id;

				FellowshipApiSvc.update(
					{id: $routeParams.id}
					, fellowship, function () {
						console.log('front-end updateFellowshipImage from FellowshipCtrl has completed');
						//bind latest data onto $scope.FellowshipDataSvc.fellowship
						$scope.FellowshipDataSvc.fellowship.logoImage = fellowship.logoImage;
						console.log('chk fellowship obj');
						console.log(fellowship);
					}
				);
			}

		});
	};

	$scope.deleteFellowshipImage = function (type) {
		console.log('deleteBannerImage has been called');
		var fellowship = new FellowshipApiSvc();
		//default image
		if (type === 'banner') {
			console.log('type equates to banner');
			fellowship.bannerImage = 'h9wvhxsfi0prxrg0nipr';

			FellowshipApiSvc.update(
				{id: $routeParams.id}
				, fellowship, function () {
					console.log('front-end removeFellowshipImage from FellowshipCtrl has completed');
					$scope.FellowshipDataSvc.fellowship.bannerImage = fellowship.bannerImage;
					console.log('chk fellowship obj');
					console.log(fellowship);
				}
			);
		} else {
			console.log('type equates to logo');
			fellowship.logoImage = 'h9wvhxsfi0prxrg0nipr';

			FellowshipApiSvc.update(
				{id: $routeParams.id}
				, fellowship, function () {
					console.log('front-end removeFellowshipImage from FellowshipCtrl has completed');
					$scope.FellowshipDataSvc.fellowship.logoImage = fellowship.logoImage;
					console.log('chk fellowship obj');
					console.log(fellowship);
				}
			);
		}
	};

	$scope.selectPostType = function (type) {
		$scope.selectedPostType = type;

	};

});

