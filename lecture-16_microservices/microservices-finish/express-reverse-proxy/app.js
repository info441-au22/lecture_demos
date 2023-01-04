import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import request from 'request'
import httpProxyMiddleware from 'http-proxy-middleware'
const createProxyMiddleware = httpProxyMiddleware.createProxyMiddleware

import usersRouter from './routes/users.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/users', usersRouter);

app.use('/api/double', createProxyMiddleware({target: 'http://localhost:4000'}))

const servers = ['http://localhost:6001', "http://localhost:6002"]
let cur_server_index = 0

app.use('/api/square', (req, res) => {
    try {
        // increment the server index by 1, but make sure it is in the range
        cur_server_index = (cur_server_index + 1) % servers.length

        // forward the request to the microservice
        req.pipe(request({url: servers[cur_server_index] + req.originalUrl})).pipe(res)
    } catch(err) {
        console.log("err in /api/square:" + err)
        res.status(500).json({status: "error", error: err})
    }
})

app.use('/*', createProxyMiddleware({target: 'http://localhost:5000'}))

export default app;
