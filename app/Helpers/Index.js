'use strict'

const moment = require("moment");
const Env    = use('Env');
const Mail   = use('Mail');
const Antl   = use('Antl');
const _      = use('lodash');
const Drive    = use('Drive');
const CryptoJS = use("crypto-js");
const jwt      = use('jsonwebtoken');
const Database = use('Database');

const strSlug = (string) => {
    return string
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[-]+/g, "-")
        .replace(/[^\w-]+/g, "");
    return string;
}

const kebabCase = (string) => {
  return string.split('').map((letter, idx) => {
    return letter.toUpperCase() === letter
     ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
     : letter;
  }).join('');
}

const baseUrl = (path = '/') => {
  return Env.get('APP_URL') + '/' + path;
}

const storageUrl = (path) => {
  return Env.get('FILESYSTEM') == 's3' ? Drive.getUrl(path) : baseUrl(`/file/get/${encodeURIComponent(path)}`);
}

const randomString = (length = 8) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const rand = ( min, max ) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const sendMail = async (email_view_path,to,subject,params) => {
  await Mail.send(email_view_path, params, (message) => {
    message
      .to(to)
      .from(Env.get('MAIL_FROM'),Env.get('MAIL_FROM_NAME'))
      .subject(subject)
  })
}

const momentNow = () => {
  return moment.utc().format();
}

const fileValidation = (file,sizeInKB = '2000000', extensions=['png','jpg','jpeg']) => {
    let data = {
        error:false
    };
    if( file.size > sizeInKB ){
        data.error   = true;
        data.message = Antl.formatMessage('messages.file_size_validation')
    }
    if( !extensions.includes(file.extname) ){
        data.error   = true;
        data.message = Antl.formatMessage('messages.file_ext_validation')
    }
    if( !_.isEmpty(file.error) ){
        data.error   = true;
        data.message = file.error;
    }
    return data;
}

const checkAuthorization = async ( BearerToken ) => {

  let res;
  let jwt_data;

  if( _.isEmpty(BearerToken) ){
    res = {
        code: 401,
        message: 'Invalid Authorization',
        data:{}
    }
    return res;
  }
  let authorization = BearerToken.replace('Bearer ','');
  //decrypt AES Data
  try{
    var key         = CryptoJS.enc.Utf8.parse(Env.get('AES_SECRET'));
    var iv          = CryptoJS.enc.Utf8.parse(Env.get('AES_IV'));
    var bytes       = CryptoJS.AES.decrypt(authorization,key, {iv:iv} );
    var base64Token = bytes.toString(CryptoJS.enc.Utf8);
  } catch (err){
        res = {
            code: 401,
            message: Antl.formatMessage('messages.invalid_authorized_header'),
            data:{}
        }
        return res;
  }
  //decode base64 token
  authorization   = Buffer.from(base64Token, 'base64').toString('ascii')
  //verify jwt
  try{
    jwt_data = await jwt.verify(authorization, Env.get('JWT_SECRET'))
  } catch(err){
      res = {
          code: 401,
          message: err.message,
          data:{}
      }
      return res;
  }
  let user = await Database.table('users').where('email',jwt_data.email).first();
  return {
    code:200,
    message: 'User has been authorized successfully',
    data: user
  };
}

module.exports = {
  baseUrl,
  strSlug,
  kebabCase,
  randomString,
  sendMail,
  momentNow,
  rand,
  fileValidation,
  storageUrl,
  checkAuthorization
}
