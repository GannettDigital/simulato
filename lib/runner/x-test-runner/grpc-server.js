'use strict';

const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader")
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

const server = new grpc.Server();


console.log(routeguide);