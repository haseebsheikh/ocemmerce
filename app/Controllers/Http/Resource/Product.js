'use strict'

const _ = use('lodash');
const {baseUrl,storageUrl} = use("App/Helpers/Index.js");

class Product
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
          slug: record.slug,
          title: record.title,
          price: record.price,
          category_id: record.category_id,
          image_url: image_url,
          status:record.status,
          created_at: record.created_at
      }
  }

}
module.exports = Product;
