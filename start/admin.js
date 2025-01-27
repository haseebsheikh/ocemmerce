const Route = use('Route')

Route.group( () => {

  Route.route('login', 'Admin/AuthController.login' , ['GET', 'POST']).as('admin.login');
  Route.route('forgot-password','Admin/AuthController.forgotPassword',['GET','POST']).as('admin.forgot-password');

}).prefix('admin').middleware(['redirectIfAuthenticate','AdminGlobalData']);

 Route.group( () => {

  Route.get('dashboard','Admin/DashboardController.index').as('admin.dashboard');
  Route.route('profile','Admin/AuthController.profile',['GET','POST']).as('admin.profile');
  Route.route('change-password','Admin/AuthController.changePassword',['GET','POST']).as('admin.change-password');
  Route.get('logout','Admin/AuthController.logout').as('admin.logout');

  Route.route('application-setting','Admin/ApplicationSetting.index',['GET','POST']).as('admin.application-setting');

  Route.route('category/edit/:slug','Admin/CategoryController.edit',['GET','POST']).as('admin.category-edit');
  Route.get('categories/ajax-listing','Admin/CategoryController.ajaxListing').as('admin.category.ajaxlisting');
  Route.get('categories','Admin/CategoryController.index').as('admin.category');
  Route.delete('categories','Admin/CategoryController.index').as('admin.category');
  Route.delete('categories/delete-record','Admin/CategoryController.delete').as('admin.category.delete');
  Route.route('category/create','Admin/CategoryController.create', ['GET','POST']).as('admin.category.create');


  Route.get('faq/ajax-listing','Admin/FaqController.ajaxListing').as('admin.faq.ajaxlisting');
  Route.post('faq/update','Admin/FaqController.update').as('faq.update');
  Route.resource('faq','Admin/FaqController').except(['update']);

  Route.get('content/ajax-listing','Admin/ContentController.ajaxListing').as('admin.content.ajaxlisting');
  Route.post('content/update','Admin/ContentController.update').as('content.update');
  Route.resource('content','Admin/ContentController');

  Route.get('chat','Admin/ChatController.index').as('chat.index');

}).prefix('admin').middleware(['AdminAuthenticate','AdminGlobalData'])
