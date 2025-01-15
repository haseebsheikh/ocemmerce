'use strict'

const { validateAll, rule } = use("Validator");
const RestController = require("../RestController");
const User = use("App/Models/User");
const _    = use('lodash');
const Antl = use("Antl");
const Hash = use('Hash');
const Encryption = use('Encryption');
const Env   = use('Env');
const { fileValidation } = use('App/Helpers/Index.js');
const SMS = use('App/Libraries/Sms/Index.js');
const Request    = use('Adonis/Src/Request')

class UserController extends RestController
{
    constructor()
    {
        super('User');
        this.resource = "User";
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async validation(action, id = 0)
    {
        let validator = [];
        let rules;
        switch (action) {
            case "store":
              rules = {
                name: 'required|min:2|max:50',
                email: 'required|email|unique:users,email',
                mobile_no: [
                    'required',
                    rule('regex',/^(\+?\d{1,3}[-])\d{9,11}$/)
                ],
                mobile_no: "unique:users,mobile_no",
                password: [
                    'required',
                    rule('regex',/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,150}$/)
                ],
                device_type:'required|in:ios,android,web',
                device_token:'required',
              }
              validator = await validateAll(this.request.all(), rules)
              break;
            case "update":
                rules = {
                  name: 'min:2|max:50',
                  device_type:'in:ios,android,web',
                }
                validator = await validateAll(this.request.all(), rules);
                break;
        }
        return validator;
    }

    async beforeIndexLoadModel()
    {
        this.resource = "PublicUser";
    }

    async afterIndexLoadModel()
    {

    }

    async beforeStoreLoadModel()
    {

        if( Env.get('OTP_VERIFICATION') == 1 && Env.get('OPT_SENDBOX') == 0 )
        {
            let params = this.request.all();
            var response = await SMS.instance().sendOTP(params.mobile_no);
            if( response.code != 200 ){
                this.__is_error = true;
                return this.sendError(
                    Antl.formatMessage('messages.validation_msg'),
                    { message: response.message },
                    400
                );
            }
        }
    }

    async afterStoreLoadModel(record)
    {

    }

    async beforeShowLoadModel()
    {
        let user = this.request.user();
        if( user.slug != this.params.id ){
          this.resource = "PublicUser";
        }

    }

    async afterShowLoadModel(record)
    {

    }

    async beforeUpdateLoadModel()
    {
        //check the user is updating their own profile
        if( this.params.id != this.request.user().slug ){
            this.__is_error = true;
            return this.sendError(
                Antl.formatMessage('messages.validation_msg'),
                { message: Antl.formatMessage('messages.invalid_user_id') },
                400
            );
        }
        //image validation
        if( !_.isEmpty(this.request.file('image_url')) )
        {
            let fileValidate = fileValidation(this.request.file('image_url'),6000000);
            if ( fileValidate.error ) {
                this.__is_error = true;
                return this.sendError(
                    Antl.formatMessage('messages.validation_msg'),
                    { message: fileValidate.message },
                    400
                );
            }
        }

    }

    async afterUpdateLoadModel(record)
    {

    }

    async beforeDestoryLoadModel()
    {

    }

    async afterDestoryLoadModel()
    {

    }

    async verifyCode({request,response})
    {
        this.request  = request;
        this.response = response;

        let rules = {
            "code" : 'required|number|max:5',
        }
        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        let params = request.all();
        let user   = request.user();
        //check sendbox is disbale
        if(Env.get('OPT_SENDBOX') == 0){
            var response = await SMS.instance().verifyOTP(user,params.code);
            if( response.code != 200 ){
                return this.sendError(
                    Antl.formatMessage('messages.validation_msg'),
                    { message: response.message },
                    400
                );
            }
        }
        let update_param = {
            mobile_otp:null,
            is_mobile_verify: true,
            mobile_verify_at: new Date(),
        }
        await User.updateUser({slug:user.slug},update_param);

        user.is_mobile_verify = update_param.is_mobile_verify;
        user.mobile_verify_at = update_param.mobile_verify_at;

        this.__is_paginate = false;
        this.sendResponse(
            200,
            Antl.formatMessage('messages.verified_2fa_code'),
            user
        );
        return;
    }

    async resendCode({request,response})
    {
        this.request  = request;
        this.response = response;

        let user = request.user();
        if( user.is_mobile_verify ){
            return this.sendError(
                Antl.formatMessage('messages.validation_msg'),
                { message: Antl.formatMessage('messages.verified_2fa_account') },
                400
            );
        }
        if(Env.get('OPT_SENDBOX') == 0){
            var response = await SMS.instance().sendOTP(user.mobile_no);
            if( response.code != 200 ){
                return this.sendError(
                    Antl.formatMessage('messages.validation_msg'),
                    { message: response.message },
                    400
                );
            }
            if( Env.get('SMS_GATEWAY') == 'Telesign' ){
                let mobile_otp = this.request.mobileOtp() + '|' + new Date();
                await User.updateUser({slug:user.slug},{mobile_otp:mobile_otp});
            }
        }
        this.__is_paginate = false;
        this.sendResponse(
            200,
            Antl.formatMessage('messages.send_2fa_code'),
            []
        );
        return;
    }

    async login({request,response})
    {
        this.request  = request;
        this.response = response;

        let rules = {
           "email" : 'required|email',
           "password": 'required',
           "device_type": "required|in:web,ios,android",
           "device_token": "required"
        }
        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        let params = this.request.all();
        let user = await User.getUserByEmail(params.email);

        if( _.isEmpty(user) )
          return this.sendError(
              Antl.formatMessage('messages.validation_msg'),
              { message: Antl.formatMessage('messages.invalid_user') },
              400
          );
        if( !await Hash.verify( params.password , user.password) )
          return this.sendError(
              Antl.formatMessage('messages.validation_msg'),
              { message: Antl.formatMessage('messages.invalid_user') },
              400
          );
        if( !user.status )
          return this.sendError(
              Antl.formatMessage('messages.validation_msg'),
              { message: Antl.formatMessage('messages.account_disabled') },
              400
          );
        if( !user.is_email_verify )
          return this.sendError(
              Antl.formatMessage('messages.validation_msg'),
              { message: Antl.formatMessage('messages.unverified_email') },
              400
          );

        let api_token = await User.updateApiToken(request,user.id);
        //merge api token in adonis request
        Request.macro('apiToken', function() {
            return api_token;
        })

        this.__is_paginate = false;
        await this.sendResponse(
            200,
            Antl.formatMessage('messages.login_success'),
            user
          );
        return;
    }

    async socialLogin({request,response})
    {
        this.request  = request;
        this.response = response;

        let rules = {
            "name" : 'min:2|max:50',
            "email" : 'email|max:50',
            "platform_id": "required|max:255",
            "platform_type":"required|in:facebook,google,apple",
            "device_type":"required|in:web,android,ios",
            "device_token":"required",
            "image_url":"url"

        }
        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        let user = await User.socialLogin(request);

        this.__is_paginate = false;
        await this.sendResponse(
            200,
            Antl.formatMessage('messages.login_success'),
            user
          );
        return;
    }

    async forgotPassword({request,response})
    {
        this.request = request;
        this.response = response;

        let rules = {
            "email" : 'required|email',
        }
        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        let params = request.all();
        //get user by email
        let user = await User.getUserByEmail(params.email);
        if( _.isEmpty(user) )
            return this.sendError(
                Antl.formatMessage('messages.validation_msg'),
                { message: Antl.formatMessage('messages.email_not_exist') },
                400
            );

        User.forgotPassword(user).then( () => {} );

        this.__is_paginate = false;
        this.sendResponse(
          200,
            Antl.formatMessage('messages.forgot_pass_msg'),
            []
        );
        return;
    }

    async changePassword({request,response})
    {
        this.request  = request;
        this.response = response;
        //validation rules
        let rules = {
            "current_password" : 'required',
            "new_password" : [
                'required',
                rule('regex',/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,150}$/)
            ],
            "confirm_password" : 'required|same:new_password',
        }
        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        let user   = this.request.user();
        let params = this.request.all();
        //check old password
        let checkCurrentPass = await Hash.verify(params.current_password,user.password)
        if( !checkCurrentPass )
            return this.sendError(
                Antl.formatMessage('messages.validation_msg'),
                { message: Antl.formatMessage('messages.invalid_current_password') },
                400
            );
         //check current and old password
        if( params.current_password == params.new_password )
            return this.sendError(
                Antl.formatMessage('messages.validation_msg'),
                { message: Antl.formatMessage('messages.password_same_error') },
                400
            );
        //update new password
        let update_params = {
            password: await Hash.make(params.new_password)
        }
        //update user
        await User.updateUser({email:user.email},update_params);
        //remove all api token except current api token
        await User.removeApiTokenExceptCurrentToken(user.id,this.request.authorization());

        this.__is_paginate = false;
        this.sendResponse(
            200,
            Antl.formatMessage('messages.update_password_msg'),
            user
        );
        return;
    }

    async userNotification({request,response}){
        this.request  = request;
        this.response = response;
        let slug = request.params.slug;
        
        //validation rules
        let rules = {
            "is_notification": 'required|in:1,0'
        }

        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        await  User.updateNotification(request.all(),slug);

        let user = await User.getUserbySlug(slug);

        this.__is_paginate = false;
        this.sendResponse(
            200,
            "Notification has been updated",
            user
        );

        return;
        
    }

    async userLogout({request,response})
    {
        this.request  = request;
        this.response = response;
        //validation rules
        let rules = {
            "device_type": 'required|in:ios,android,web',
            "device_token":'required'
        }
        let validator = await validateAll(request.all(), rules);
        let validation_error = this.validateRequestParams(validator);
        if( this.__is_error )
            return validation_error;

        let params = this.request.all();
        await User.removeDeviceToken(this.request.user().id,params);

        this.__is_paginate = false;
        this.sendResponse(
            200,
            Antl.formatMessage('messages.logout_msg'),
            []
        );
        return;
    }

}
module.exports = UserController
