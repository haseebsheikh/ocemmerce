const httpServer = use('Server')
const { Server } = use('socket.io');
const { checkAuthorization } = use('App/Helpers/Index');
const SocketController = use('App/Controllers/Http/SocketController.js');
const io = new Server(httpServer.getInstance(), {
  cors: {
    origin: ['http://amritb.github.io','http://localhost:3333'],
    credentials: true,
    allowedHeaders: ["Authorization","token","user-token"],
    withCredentials: true
  }
});
const live_users = new Map()
//init variables
let user;

io.use( async (socket, next) => {
    let authorization = await checkAuthorization(socket.handshake.auth.Authorization)
    if( authorization.code != 200 ){
      next(new Error(authorization.message));
    }else{
      user = authorization.data;
      socket.join(`user_${user.id}`)
      live_users.set(user.id, user);
      next();
    }
  })
  .on('connection', function (socket) {

      console.log('socket',socket.id);

      socket.on('_testWithCB', async (payload,callback) => {
          if( live_users.has(payload.actor_id) == true ){
            let actor_user  = live_users.get(payload.actor_id);
            let chatMessage = await SocketController.test(actor_user,payload)
            console.log('chatMessage',chatMessage);
          }else{
             callback(new Error('Invalid actor id'));
          }
      })

  })
