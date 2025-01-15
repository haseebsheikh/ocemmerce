const Env = use('Env');
const Antl = use('Antl')
const HttpClient = use('App/Libraries/HttpRequest/Index.js')

class FCM
{
    sendPush(device_tokens,device_type,title,message,badge,redirect_link,custom_data)
    {
        if( device_type == 'ios' ){
            return this.sendIosPushNotification(device_tokens,device_type,title,message,badge,redirect_link,custom_data);
        } else {
          return this.sendAndroidPushNotification(device_tokens,device_type,title,message,badge,redirect_link,custom_data);
        }
    }

    sendIosPushNotification(device_tokens,device_type,title,message,badge,redirect_link,custom_data)
    {
        let notification_data = {
          registration_ids: device_tokens,
          notification: {
            title: title,
            text: message,
            body: message,
            sound: 'default',
            badge: badge,
            custom_data: custom_data,
            user_badge: badge,
          }
        }
        this.sendCurl(notification_data);
        return true;
    }

    sendAndroidPushNotification(device_tokens,device_type,title,message,badge,redirect_link,custom_data)
    {
        let notification_data = {
          registration_ids: device_tokens,
          notification: {
            title: title,
            body: message,
            sound: 'default',
            badge: badge,
            priority: 'high'
          },
          data: {
              message: {
                title: title,
                body: message,
                sound: 'default'
              },
              user_badge: badge,
              custom_data: custom_data,
              priority: 'high'
          }
        }
        this.sendCurl(notification_data);
        return true;
    }

    sendCurl(notification_data)
    {
        let headers = {
          'Authorization': 'Bearer ' + Env.get('NOTIFICATION_KEY'),
          'Content-Type': 'application/json',
          'charset': 'utf-8'
        }
        HttpClient.makeRequest('post',Env.get('NOTIFICATION_URL'),notification_data,headers)
          .then( (res) => {
              console.log('push notification',res);
          });
        return true;
    }
}
module.exports = FCM;
