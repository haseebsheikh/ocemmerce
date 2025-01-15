'use strict';

const Controller   = require("../Controller");
const User         = use('App/Models/User');
const Notification = use('App/Models/Notification');
const Antl         = use('Antl');

class NotificationController extends Controller
{
    constructor()
    {
        super();
        this.resource = "Notification"; //this is your resource name
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async index({request,response})
    {
        this.request  = request;
        this.response = response;
        let records   = await Notification.getNotifications(request);
        this.sendResponse(
          200,
          Antl.formatMessage('messages.success_listing_message'),
          records
      );
      return;
    }

    async sendNotification({request})
    {
        let params = request.all();
        let actor  = request.user();
        let target = await User.query()
                                .select('users.*','uat.device_type','uat.device_token')
                               .innerJoin('user_api_tokens AS uat','uat.user_id','users.id')
                               .where('users.id', params.target_id)
                               .fetch();
        target = target.toJSON();
        let notification_data = {
            actor: actor,
            target: target,
            module: 'users',
            module_id: actor.id,
            module_slug: actor.slug,
            reference_id:null,
            reference_module: null,
            reference_slug: null,
            title: 'AdonisJS',
            message: 'Testing push notification',
            redirect_link: null,
            badge:0,
        }
        let custom_data = {
            record_id: actor.id,
            redirect_link: null,
            identifier: 'add_user'
        }
        let record = await Notification.sendPushNotification('add_user',notification_data,custom_data);
        return record;
    }

    async update({ request, response, params }) {
        
        this.request  = request;
        this.response = response;
        let unique_id = params.id;
        let record = await Notification.updateNotification(request.user(), unique_id);
    
        this.__is_paginate = false;
        this.__collection = false;
    
        this.sendResponse(
            200,
            Antl.formatMessage('messages.success_listing_message'),
            record,
        );
        return;
    }

    async getNotificationCount({ request, response }) {
        this.request  = request;
        this.response = response;
        let records = await Notification.getBadge(request.user().id);
        let totalbadge = { total_badge: records };

        this.__is_paginate = false;
        this.__collection = false;

        this.sendResponse(
            200,
            Antl.formatMessage('messages.success_listing_message'),
            totalbadge,
        );
        return;
    }  
}
module.exports = NotificationController
