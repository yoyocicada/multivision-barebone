/*******************************************************************************
 ******************************************************************************/
angular.module('app').controller('FellowshipCtrl', function ($scope, $location,PostApiSvc, FellowshipDataSvc, $routeParams, FellowshipApiSvc, $http, $upload,NotificationDataSvc,IdentitySvc,mySocket,CloudinaryDataSvc) {
	console.log('FellowshipCtrl has been called');
	//console.log(mySocket);
	$scope.entryTime = new Date();
	//include FellowshipDataSvc which captures all data needed for Fellowship widgets
	$scope.FellowshipDataSvc = FellowshipDataSvc;
	$scope.FellowshipDataSvc.initialize($routeParams.id);
	$scope.CloudinaryDataSvc=CloudinaryDataSvc;
	$scope.CloudinaryDataSvc.cloudinary();
	//default banner image
	$scope.FellowshipDataSvc.fellowship.bannerImage = 'logo-01_800px_1x_q2s8as';
	$scope.FellowshipDataSvc.fellowship.logoImage = '293817_10151098311011098_970711788_n_rdhuj7';

	$scope.posts = [];

	$scope.goto = function(subpage){
		$location.path('/fellowship/'+ $routeParams.id + '/' + subpage);
	};

	$scope.$watch('FellowshipDataSvc.fellowship', function(newValue){
		if(newValue){
			mySocket.on('fellowship'+newValue._id, function(data) {
				if(data.type==='newPost') {
					$scope.posts.unshift(data.post);
					return;
				}
				if(data.type==='removePost') {
					console.log("remove post");
					for (var i = 0; i < $scope.posts.length; i++) {
						console.log(data.postId);
						if ($scope.posts[i]._id === data.postId) {
							$scope.posts.splice(i, 1);
							console.log('chk index to be spliced/removed');
							console.log(i);
						}
					}
					return;
				}
				if(data.type==='updatePost') {
					console.log("update post");
					for (var i = 0; i < $scope.posts.length; i++) {
						console.log(data.postId);
						if ($scope.posts[i]._id === data.postId) {
							$scope.posts.splice(i, 1);
							console.log('chk index to be spliced/removed');
							console.log(i);
						}
					}
					return;
				}
				if(data.type==='newComment') {
					console.log("new comment");
					for (var i = 0; i < $scope.posts.length; i++) {
						console.log(data.postId);
						if ($scope.posts[i]._id === data.postId) {
							data.comment.new = true;
							$scope.posts[i].comments.push(data.comment);
							console.log('chk index to be spliced/removed');
							console.log(i);
						}
					}
					return;
				}
				if(data.type==='removeComment') {
					console.log("remove comment");
					for (var i = 0; i < $scope.posts.length; i++) {
						console.log(data.postId);
						if ($scope.posts[i]._id === data.postId) {

							console.log("post ---> "+ data.postId);
							for (var j = 0; j < $scope.posts[i].comments.length; j++) {
								console.log($scope.posts[i].comments[j]._id);
								if($scope.posts[i].comments[j]._id === data.commentId){
									$scope.posts[i].comments.splice(j, 1);
								}
							}
						}
					}
					return;
				}
			});
		}
	}, true);
	$scope.isLoading = true;
	$scope.isLoadingNext = false;

	$scope.viewNextPage=function(type){
		//console.log('front-end test viewNextPage function');
		//grab CreatedOn date from last element of posts array
		//query post data here
		var lastPostIndex=$scope.posts.length-1;
		var lastPostObj=$scope.posts[lastPostIndex];
		if(!lastPostObj){
			$scope.posts = PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id},function(){
				$scope.isLoading = false;
			});
			return;
		}
		$scope.isLoadingNext = true;
		if(type===''){
			//load and append next query onto post
			PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id,createdOn:lastPostObj.createdOn},function(posts){
				//console.log('entering callback of PostApiSvc.query');
				$scope.isLoadingNext = false;
				for(var i=0;i<posts.length;i++){
					$scope.posts.push(posts[i]);

				}
			});

		}else{
			//load and append next query onto post
			PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id,createdOn:lastPostObj.createdOn,postType:type},function(posts){
				//console.log('entering callback of PostApiSvc.query');
				$scope.isLoadingNext = false;
				for(var i=0;i<posts.length;i++){
					$scope.posts.push(posts[i]);

				}
			});
		}
	};

	$scope.posts = PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id},function(){
		$scope.isLoading=false;
	});

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
		//console.log('watch newVal on imagePopup.isPopupOpen');
		//console.log(newVal);
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

	$scope.editFellowshipImage = function ($files, type) {
		console.log('editBannerImage within FellowshipCtrl has been triggered');
		var file = $files[0];//allow 1 image upload only
		console.log('for loop has been triggered');
		$scope.upload = $upload.upload({
			url: "https://api.cloudinary.com/v1_1/" + $.cloudinary.config().cloud_name + "/upload",
			data: $scope.CloudinaryDataSvc.cloudinarySignedParams,
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
		console.log('chk selectedPostType');
		console.log($scope.selectedPostType);
		$scope.isLoading = true;
		if (type===''){
			$scope.posts = PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id},function(){
				$scope.isLoading = false;
				console.log('chk $scope.posts obj');
				console.log($scope.posts);

			});
		}else{
			$scope.posts = PostApiSvc.query({postUnderGroupType: 'fellowship', postUnderGroupId: $routeParams.id, postType:type},function(){
				console.log('chk $scope.posts obj');
				console.log($scope.posts);
				$scope.isLoading = false;
			});
		}

	};

});

