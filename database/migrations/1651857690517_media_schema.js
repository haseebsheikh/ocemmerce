'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MediaSchema extends Schema {
  up () {
    this.create('media', (table) => {
      table.increments()
      table.string('module',100).notNullable()
      table.integer('module_id').notNullable()
      table.string('filename',200).notNullable()
      table.string('original_name',200).notNullable()
      table.text('file_url').notNullable()
      table.string('file_url_blur',200).notNullable()
      table.text('thumbnail_url').nullable()
      table.string('mime_type')
      table.string('file_type')
      table.string('driver',50).notNullable().defaultTo('local')
      table.enu('media_type',['public','private']).notNullable().defaultTo('public');
      table.text('meta').nullable()
      table.timestamps()
      table.timestamp('deleted_at').nullable()
    })
  }

  down () {
    this.drop('media')
  }
}

module.exports = MediaSchema
