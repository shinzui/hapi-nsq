var Hapi = require('hapi')
var Lab = require('lab')
var Code = require('code')
var Plugin = require('../lib/index')

var lab = exports.lab = Lab.script()
var expect = Code.expect
var describe = lab.describe
var it = lab.test

it('registers the plugin', function(done) {

  var server = new Hapi.Server()

  server.register({ register: Plugin }, function(err) {
    expect(err).to.not.exist()
    done()
  })
})

it('exposes an nsq writer that is connected to the nsqd server', function(done) {
  var server = new Hapi.Server()
  server.connection()

  server.register({ register: Plugin, options: {} }, function(err) {
    expect(server.plugins['hapi-nsq'].writer.ready).to.be.true()
    done()
  })

})

it('closes the nsq connection when the server is stopped', function(done) {
  var server = new Hapi.Server()
  server.connection()

  server.register({ register: Plugin, options: {} }, function(err) {

    var writer = server.plugins['hapi-nsq'].writer
    writer.on('closed', function() {
      done()
    })

    server.root.stop({ timeout: 1000 }, function() { })
  })

})
