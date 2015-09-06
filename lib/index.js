var Hoek = require('hoek')
var Nsq = require('nsqjs')
var Joi = require('joi')

var internals = {}

internals.defaults = {
  nsqdHost: '127.0.0.1',
  nsqdPort: 4150,
  writerOptions: {}
}

internals.schema = Joi.object({
  nsqdHost: Joi.string().required(),
  nsqdPort: Joi.number().required(),
  writerOptions: Joi.object()
})

exports.register = function(server, options, next) {

  var settings = Hoek.applyToDefaults(internals.defaults, options)
  Joi.assert(settings, internals.schema, 'Invalid nsq configuration')

  var writer = new Nsq.Writer(settings.nsqdHost, settings.nsqdPort, settings.writerOptions)

  writer.connect()

  server.expose('nsq', Nsq)

  server.ext('onPreStop', function(_server, _next) {

    server.log(['nsq'], 'closing writer connection to ' + writer.nsqdHost + ' on port ' + writer.nsqdPort)

    writer.close()

    _next()
  })

  writer.on('ready', function () {

    server.log(['nsq'], 'nsq writer is connected to ' + writer.nsqdHost + ' on port ' + writer.nsqdPort)

    server.expose('writer', writer)

    return next()
  })

}

exports.register.attributes = {
  pkg: require('../package.json')
}
