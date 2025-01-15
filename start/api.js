const Route = use('Route');

Route.group(() => {

  Route.post('generate-video-thumb','Api/GeneralController.generateVideoThumbnail');
  Route.post('user/forgot-password','Api/UserController.forgotPassword').middleware('throttle:5,3600'); //a day
  Route.post('user/login','Api/UserController.login').middleware('throttle:5,86400');
  Route.post('user/social-login','Api/UserController.socialLogin').middleware('throttle:5,86400');
  Route.resource('user', 'Api/UserController')
    .except(['destroy'])
    .middleware(new Map([
      [['index','show', 'update'], ['apiAuth']]
    ]))

}).prefix('api').middleware(['checkApiToken'])

Route.group(() => {

  Route.post('user/resend/code','Api/UserController.resendCode').middleware('throttle:5,86400'); //a day
  Route.post('user/verify/code','Api/UserController.verifyCode').middleware('throttle:5,86400'); //a day
  Route.post('user/change-password','Api/UserController.changePassword'); //a day
  Route.post('user/notification/:slug','Api/UserController.userNotification');
  Route.post('user/logout','Api/UserController.userLogout');

  Route.get('notification','Api/NotificationController.index');
  Route.put('notification/:id','Api/NotificationController.update');
  Route.get('notification/get-count','Api/NotificationController.getNotificationCount');
  Route.post('send-notification','Api/NotificationController.sendNotification');

  Route.post('gateway/customer','Api/GatewayController.createCustomer');

}).prefix('api').middleware(['checkApiToken','apiAuth'])
