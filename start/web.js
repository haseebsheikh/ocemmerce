const Route = use('Route');

Route.on('/').render('welcome')
Route.get('deep-link','HomeController.deepLink');
Route.get('file/get/:path','Api/GeneralController.getFile');
Route.on('encrypt-data').render('encrypt-data')
Route.get('user/verify-email/:email','UserController.verifyEmail');
Route.get('user/reset-password/:resetpasstoken','UserController.resetPassword');
Route.get('content/:slug','HomeController.getContent');
Route.get('faq','HomeController.getFaq');
Route.post('user/reset-password','UserController.resetPasswordSubmit');
Route.get('braintree/dropin','HomeController.brainTreeDropIN');
