'use strict'

const _ = use('lodash');
const {baseUrl,storageUrl} = use("App/Helpers/Index.js");

class User
{
  constructor()
  {
      this.headers = {};
  }

  static async initResponse(data,request)
  {
      if( _.isEmpty(data) )
        return [];

      this.headers = request.headers();
      let response;
      if( Array.isArray(data) ){
        response = []
        for(var i=0; i < data.length; i++)
        {
          response.push( this.jsonSchema(data[i],request));
        }
      } else {
        response = this.jsonSchema(data,request)
      }
      return response;
  }

  static jsonSchema(record,request)
  {
      let image_url  = null;
      let blur_image = null;
      let api_token  = _.isEmpty(this.headers.authorization)
                      ? Buffer.from(request.apiToken()).toString('base64')
                      : Buffer.from(request.authorization()).toString('base64');

      if( record.image_url != null && record.image_url != '' ){
          if( record.image_url.startsWith('http') ){
            image_url = record.image_url
          } else {
            image_url = storageUrl(record.image_url);
          }
          blur_image = record.blur_image;
      } else {
        image_url = baseUrl('images/user-placeholder.jpg')
        blur_image = 'L5Mj]zRj00%M00WB4nt7_3t7~qRj';
      }
      return {
          id: record.id,
          name: record.name,
          username: record.username,
          slug: record.slug,
          email: record.email,
          mobile_no: record.mobile_no,
          api_token: api_token,
          image_url: image_url,
          blur_image: blur_image,
          is_mobile_verify:record.is_mobile_verify,
          is_email_verify:record.is_email_verify,
          is_notification: record.is_notification,
          platform_type:record.platform_type,
          status:record.status,
          created_at: record.created_at
      }
  }

}
module.exports = User;
