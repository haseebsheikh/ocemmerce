'use strict'

const { first } = require("@adonisjs/lucid/src/Lucid/Model");
const { isEmpty } = require("lodash");
const RestModel  = use('./RestModel');
const moment     = use('moment');
const Hash       = use('Hash');
const Encryption = use('Encryption');
const _          = use('lodash');
const Env        = use('Env');
const Database   = use('Database')
const Request    = use('Adonis/Src/Request')
const Config     = use('Config')
const {strSlug, rand, sendMail, baseUrl, momentNow, randomString, getBlurHash} = use("App/Helpers/Index.js");
const jwt     = use('jsonwebtoken');

class User extends RestModel
{
    static get table()
    {
      return "users";
    }

    static get createdAtColumn () {
      return 'created_at';
    }

    static get updatedAtColumn () {
      return 'updated_at';
    }

    static softdelete()
    {
        return true;
    }

    static getFields()
    {
        return [
           'user_group_id','user_type','name','username','slug','email','mobile_no','password','image_url','is_notification',
           'blur_image','is_mobile_verify','mobile_verify_at','is_email_verify','email_verify_at','platform_type',
           'platform_id','status','country','city','state','zipcode','address','latitude','longitude','online_status',
           'mobile_otp','email_otp','created_at','updated_at','deleted_at'
        ];
    }

    static get hidden ()
    {
      return []
    }

    static showColumns()
    {
        return ['*'];
    }

    userGroup()
    {
        return this.belongsTo('App/Models/UserGroup','user_group_id','id')
    }

    static async adminAuth(email)
    {
        let query = await this.query().with('userGroup').where('email',email).where('user_type','admin').first();
        return _.isEmpty(query) ? [] : query.toJSON();
    }

    static async generateSlug(slug)
    {
        let query = await this.query().where('slug',slug).getCount();
        return query == 0 || query == null ? slug : slug + query + rand(111,999);
    }

    static generateApiToken(email)
    {
        let jwt_options = {
            algorithm: 'HS256',
            expiresIn: Config.get('constants.JWT_EXPIRY'),
            issuer: Config.get('constants.CLIENT_ID'),
            subject: Config.get('constants.CLIENT_ID'),
            jwtid: email
        }
        var token = jwt.sign({ email:email }, Config.get('constants.JWT_SECRET'), jwt_options);
        return token;
    }

    static async updateApiToken(request,record_id)
    {
        let request_params = request.all();
        let api_token = this.generateApiToken(request_params.email);
        await Database.table('user_api_tokens').insert({
            user_id: record_id,
            api_token: api_token,
            device_type: request_params.device_type,
            device_token: request_params.device_token,
            platform_type: _.isEmpty(request_params.platform_type) ? 'custom' : request_params.platform_type,
            platform_id: _.isEmpty(request_params.platform_id) ? null : request_params.platform_id,
            ip_address: request.ip(),
            user_agent: request.header('User-Agent'),
            created_at: new Date()
        })
        return api_token;
    }

    static async getUserByApiToken(api_token)
    {
        let query = await this.query()
                              .select('users.*','uat.api_token','uat.device_type','uat.device_token')
                              .innerJoin('user_api_tokens AS uat','uat.user_id','users.id')
                              .whereNull('users.deleted_at')
                              .whereNull('uat.deleted_at')
                              .where('uat.api_token',api_token)
                              .first();
        return _.isEmpty(query) ? [] : query.toJSON();
    }

    static async getUserByEmail(email)
    {
        let query = await this.query().where('email',email).whereNull('deleted_at').first();
        return !_.isEmpty(query) ? query : {};
    }

    static async updateUser(condition,data)
    {
        await this.query().where(condition).update(data);
        return true;
    }

    static async forgotPassword(record)
    {
        let resetPasswordToken = encodeURI(record.id + '|' + moment().valueOf());
        await Database.table('reset_passwords').insert({
            email: record.email,
            token: resetPasswordToken,
            created_at: new Date()
        })
        //send reset password email
        let mail_params = {
            name: record.name,
            link: baseUrl() + 'user/reset-password/' + resetPasswordToken,
            app_name: Env.get('APP_NAME')
        }
        sendMail('emails.forgot-password',record.email,'Reset Password',mail_params)
        return true;
    }

    static async getResetPassReq(reset_password_token)
    {
        let query = await this.query()
                              .select('rp.*')
                              .innerJoin('reset_passwords AS rp','rp.email','users.email')
                              .where('rp.token',reset_password_token)
                              .first();
        return query;
    }

    static async updateResetPassword(params)
    {
        let resetPassword = Encryption.decrypt(params.token);
        let new_password = await Hash.make(params.new_password)
        await Database.table('users').where('email',resetPassword.email).update({
            password: new_password
        })
        await Database.table('reset_passwords').where('email',resetPassword.email).delete();
        return true;
    }

    static async removeDeviceToken(user_id,params)
    {
        await Database.table('user_api_tokens')
                      .where('user_id',user_id)
                      .where('device_token',params.device_token)
                      .delete();
        return true;
    }

    static async socialLogin(request)
    {
        let user;
        let socialUser;
        let params = request.all();

        socialUser = await this.getUserByPlatformID(params.platform_type,params.platform_id);
        if( _.isEmpty(socialUser) ){
          if( !_.isEmpty(params.email) ){
              socialUser = await this.getUserByEmail(params.email);
          }
        }

        //add new user
        if( _.isEmpty(socialUser) ){
            //generate api token
            let api_token = this.generateApiToken(params.email,request.header('token'));
            Request.macro('apiToken', function() {
                return api_token;
            })
            //save user
            let password = randomString(8);
            let username      = await this.generateSlug(strSlug(params.name));
            user = await this.create({
                  name: params.name,
                  user_group_id: 2,
                  user_type: 'user',
                  email: params.email,
                  image_url: _.isEmpty(params.image_url) ? null : params.image_url,
                  password:await Hash.make(password),
                  username: username,
                  slug: username,
                  is_email_verify:true,
                  email_verify_at: new Date(),
                  platform_type: params.platform_type,
                  platform_id: params.platform_id,
                  created_at: new Date()
            });
            //save api token
            await Database.table('user_api_tokens').insert({
                user_id: user.id,
                api_token: api_token,
                device_type: params.device_type,
                device_token: params.device_token,
                platform_type: params.platform_type,
                platform_id: params.platform_id,
                ip_address: request.ip(),
                user_agent: request.header('User-Agent'),
                created_at: new Date()
            })
        } else {
            let api_token = this.generateApiToken(socialUser.email,request.header('token'));
            Request.macro('apiToken', function() {
                return api_token;
            })
            //save api token
            await Database.table('user_api_tokens').insert({
                user_id: socialUser.id,
                api_token: api_token,
                device_type: params.device_type,
                device_token: params.device_token,
                platform_type: params.platform_type,
                platform_id: params.platform_id,
                ip_address: request.ip(),
                user_agent: request.header('User-Agent'),
                created_at: new Date()
            })
            user = socialUser;
        }
        return user;
    }

    static async getUserByPlatformID(platform_type,platform_id)
    {
        let query = await this.query()
                              .select('users.*')
                              .where('users.platform_type',platform_type)
                              .where('users.platform_id',platform_id)
                              .first();
        return query;
    }

    static async deleteApiToken(id)
    {
        await Database.table('user_api_tokens').where('user_id',id).delete();
        return true;
    }

    static async removeApiTokenExceptCurrentToken(user_id,api_token)
    {
        await Database.table('user_api_tokens')
                      .where('user_id',user_id)
                      .where('api_token','<>',api_token)
                      .delete()
        return true;
    }

    static async updateNotification(params,slug){
        let update_params = {
            is_notification: params.is_notification
        }
        await User.updateUser({slug:slug},update_params);
        
        return true;
    }
}
module.exports = User
