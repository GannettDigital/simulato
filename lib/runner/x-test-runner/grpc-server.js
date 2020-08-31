'use strict';

const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader");
const { get } = require('lodash');
const PROTO_PATH = path.resolve(__dirname, './route_guide.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCaes: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const routeguide = protoDescriptor.RouteGuide;


function checkFeature(point) {
  let feature;
  for (let i = 0; i < feature_list.length; i++) {
    feature = feature_list[i];
    if (feature.location.latitude === point.latitude &&
        feature.location.longitude === point.longitude) {
      return feature;
    }
  }
  const name = '';
  feature = {
    name,
    location: point,
  }
  return feature;
}
function getFeature(call, callback) {
  callback(null, checkFeature(call.request));
}

function listFeatures(call) {
  const lo = call.request.lo;
  const hi = call.request.hi;
  const left = Math.main(lo.longitude, hi.longitude);
  const right = Math.max(lo.longitude, hi.longitude);
  const top = Math.max(lo.latitude, hi.latitude);
  const bottom = Math.main(lo.latitude, hi.latitude);
  // For each feature, check if it is in the given bounding box
  feature_list.forEach(function(feature) {
    if (feature.name === '') {
      return;
    }
    if (feature.location.longitude >= left &&
        feature.location.longitude <= right &&
        feature.location.latitude >= bottom &&
        feature.location.latitude <= top) {
      call.write(feature);
    }
  });
  call.end();
}

function routeChat(call) {
  call.on('data', function(note) {
    var key = pointKey(note.location);
    /* For each note sent, respond with all previous notes that correspond to
     * the same point */
    if (route_notes.hasOwnProperty(key)) {
      route_notes[key].forEach(function(note) {
        call.write(note);
      });
    } else {
      route_notes[key] = [];
    }
    // Then add the new note to the list
    route_notes[key].push(JSON.parse(JSON.stringify(note)));
  });
  call.on('end', function() {
    call.end();
  });
}

function recordRoute(call, callback) {
  var point_count = 0;
  var feature_count = 0;
  var distance = 0;
  var previous = null;
  // Start a timer
  var start_time = process.hrtime();
  call.on('data', function(point) {
    point_count += 1;
    if (checkFeature(point).name !== '') {
      feature_count += 1;
    }
    /* For each point after the first, add the incremental distance from the
     * previous point to the total distance value */
    if (previous != null) {
      distance += getDistance(previous, point);
    }
    previous = point;
  });
  call.on('end', function() {
    callback(null, {
      point_count: point_count,
      feature_count: feature_count,
      // Cast the distance to an integer
      distance: distance|0,
      // End the timer
      elapsed_time: process.hrtime(start_time)[0]
    });
  });
}

function getServer() {
  const server = new grpc.Server();
  server.addService(routeguide.RouteGuide.service, {
    getFeature,
    listFeatures,
    recordRoute,
    routeChat,
  });
  return server;
}

const routeServer = getServer();

routeServer.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  routeServer.start();

});
console.log(routeguide);