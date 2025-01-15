'use strict'

const _ = use('lodash');
const UserResource = use('./User.js');
const {baseUrl} = use("App/Helpers/Index.js");

class Notification
{
  static async initResponse(data,request)
  {
      if( _.isEmpty(data) )
        return [];

      let response;
      if( Array.isArray(data) ){
        response = []
        for(var i=0; i < data.length; i++)
        {
          response.push( await this.jsonSchema(data[i],request));
        }
      } else {
        response = await this.jsonSchema(data,request)
      }
      return response;
  }

  static async jsonSchema(record,request)
  {
      let UserObj = await UserResource.initResponse(record.actor, request)
      return {
          id: record._id,
          unique_id: record.unique_id,
          identifier: record.identifier,
          actor_id: record.actor_id,
          actor_type: record.actor_type,
          actor: UserObj,
          module: record.module,
          module_id: record.module_id,
          reference_module: record.reference_module,
          reference_id: record.reference_id,
          title: record.title,
          message: record.message,
          web_redirect_link: record.web_redirect_link,
          created_at: record.created_at
      }
  }

}
module.exports = Notification;
