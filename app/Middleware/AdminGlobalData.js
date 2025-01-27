'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const { baseUrl, storageUrl } = use("App/Helpers/Index.js");
const Env = use('Env');
const ApplicationSetting = use('App/Models/ApplicationSetting');
class AdminGlobalData {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ view }, next) {
    // call next to advance the request
    let applicationSetting = await ApplicationSetting.getApplicationSetting({identifier:'application_setting'});
    view.share({
      applicationSetting: applicationSetting,
      currentYear: new Date().getFullYear(),
      storageUrl: (url) => storageUrl(url)

    })
    await next()
  }
}

module.exports = AdminGlobalData
