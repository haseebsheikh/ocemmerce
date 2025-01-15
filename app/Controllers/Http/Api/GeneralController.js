'use strict';

const Controller   = require("../Controller");
const { generateVideoThumb, baseUrl } = use('App/Helpers/Index.js');
const Drive    = use('Drive');

class GeneralController extends Controller
{
    constructor()
    {
        super();
        this.resource = "User"; //this is your resource name
        this.request; //adonis request obj
        this.response; //adonis response obj
        this.params = {}; // this is used for get parameters from url
    }

    async generateVideoThumbnail({request,response})
    {
        this.request  = request;
        this.response = response;

        let file      = request.file('file')
        var thumbnail = await generateVideoThumb(file.tmpPath,'videos');
            thumbnail = encodeURIComponent(thumbnail);


        this.__is_paginate = false;
        this.__collection  = false;

        this.sendResponse(
            200,
            'Video thumbnail has been generated successfully',
            { url: baseUrl('/file/get/' + thumbnail)  }
        );
        return;
    }

    async getFile({response,params})
    {
        let path = decodeURIComponent(params.path);
        const exists = await Drive.exists(path)
        if( exists ){
            let content = await Drive.get(path)
            return response.send(content);
        } else {
            return null;
        }
    }
}
module.exports = GeneralController
