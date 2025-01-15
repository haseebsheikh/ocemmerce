'use strict'

const Controller = require("./Controller");

class SocketController extends Controller
{
    static async test(actor_user,payload)
    {
        console.log('actor_user',actor_user);
        console.log('payload',payload);
        return 'testing';
    }

}
module.exports = SocketController
