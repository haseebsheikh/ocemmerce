'use strict'

const { validateAll, rule } = use("Validator");
const Controller = require("./Controller");
const User = use("App/Models/User");
const _    = use('lodash');
const Antl = use("Antl");
const Encryption = use('Encryption');
const { momentNow } = use('App/Helpers/Index.js');
const moment = use('moment');

class UserController extends Controller
{
    async verifyEmail({session, response, params})
    {
        let email = decodeURIComponent(params.email);
            email = email.replace('|','/');
            email = Encryption.decrypt(email);
        let user  = await User.getUserByEmail(email);
        if( !_.isEmpty(user) ){
            await User.updateUser(
                {email:user.email},
                {is_email_verify:'1', email_verify_at: new Date() }
              );
            session.flash({ success: 'Your account has been verified successfully.' })
        } else {
            session.flash({ error: 'Invalid request' })
        }
        return response.redirect('/')
    }

    async resetPassword({params, view, session,response})
    {
        let resetPasswordToken = params.resetpasstoken;
        let getResetPassReq    = await User.getResetPassReq(resetPasswordToken);
        //check reset password link
        if( _.isEmpty(getResetPassReq) ){
            session.flash({ error: Antl.formatMessage('messages.invalid_req_pass_link') })
            response.redirect('/');
            return;
        }
        let expiry_link_date = moment(getResetPassReq.created_at).add(1, 'hours');
        //check expiry
        if( moment().unix() > moment(expiry_link_date).unix()  ){
          session.flash({ error: Antl.formatMessage('messages.req_pass_link_expired') })
          response.redirect('/');
          return;
        }
        //delete all api token
        await User.deleteApiToken(getResetPassReq.id);

        getResetPassReq.currentRequestToken = resetPasswordToken
        return view.render('reset-password',{ user: Encryption.encrypt(getResetPassReq) });
    }

    async resetPasswordSubmit({request,response,session})
    {
        const rules = {
          new_password: [
              'required',
              rule('regex',/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,150}$/)
          ],
          confirm_password: 'required|same:new_password'
        }
        const validation = await validateAll(request.all(), rules)
        if (validation.fails()) {
            session.flash({errors:validation.messages()})
            return response.redirect('back')
        }
        await User.updateResetPassword(request.all());
        session.flash({ success: 'Password has been updated successfully.'})
        return response.redirect('/');
    }

}
module.exports = UserController
