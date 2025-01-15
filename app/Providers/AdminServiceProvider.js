'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class AdminServiceProvider extends ServiceProvider {

  register () {
    // register bindings
  }

  boot () {

    const View    = this.app.use('Adonis/Src/View')
    View.global('currentTime', function () {
      return new Date().getTime()
    })
  }
}

module.exports = AdminServiceProvider
