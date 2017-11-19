'use strict';

const fs = require('fs');
const http = require('http');
const url = require('url');
const vhost = require('vhost');
const express = require('express');
const yaml = require('js-yaml');
const make_store = require('./operations-router/mod_store.js');
const make_operations_handler = require('./operations-router/router.js');
const make_form_handler = require('./xhr/form_handler.js');
const make_logger = require('./logger.js');
const make_express_pino = require('express-pino-logger');

const app = express();
const server = http.createServer(app);

function  print_usage() {
	const node_cmd = process.argv[0];
	const writeurl_server = process.argv[1];
	console.error('Usage:', node_cmd, writeurl_server, 'config-path');
}

if (process.argv.length != 3) {
	print_usage();
	process.exit(1);
}

let config;

try {
	const config_path = process.argv[2];
	const config_content = fs.readFileSync(config_path);
	config = yaml.safeLoad(config_content);
} catch (e) {
	console.error('The config file does not exists or is not a valid yaml file');
	process.exit(1);
}


const app_state = {
	port: config.port,
	doc_dir: config.doc_dir,
	release_build_dir: config.release_build_dir,
	debug_build_dir: config.debug_build_dir,
	store: make_store(config.doc_dir),
	publish_dir: config.publish_dir,
	logger: make_logger(config)
};

app_state.logger.info({config: config}, 'Writeurl server started');

const operations_handler = make_operations_handler(app_state);
const form_handler = make_form_handler(app_state);
const express_pino = make_express_pino(app_state.logger);

app.use(express_pino);

app.use(function (_req, res, next) {
	res.setHeader('X-Powered-By', 'Writeurl server');
	next();
});

server.on('upgrade', (req, socket, head) => {
	const path = url.parse(req.url).pathname;
	if (path == '/operations') {
		operations_handler(req, socket, head);
	} else {
		socket.destroy();
	}
});

app.post('*', form_handler);


// static files

const debug_host = 'debug.writeurl.localhost';

const options = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['html', 'index.html'],
	fallthrough: true,
	index: 'index.html',
	maxAge: 0,
	redirect: false,
	setHeaders: null
};

app.use('/publish', express.static(app_state.publish_dir, options));

app.use(vhost(debug_host, express.static(app_state.debug_build_dir, options)));
app.use(vhost(debug_host, (_req, res, _next) => {
	res.sendFile(app_state.debug_build_dir + '/html/index.html');
}));

// static files for other virtual hosts shared with Writeurl.
for (const host of config.hosts) {
	app.use(vhost(host.virtual_host, express.static(host.public)));
	app_state.logger.info({host: host}, 'virtual host');
}

// release_host and anything else.
// const release_host = 'release.writeurl.localhost';
app.use(express.static(app_state.release_build_dir, options));
app.use((_req, res, _next) => {
	res.sendFile(app_state.release_build_dir + '/index.html');
});

server.listen(app_state.port, () => {
	app_state.logger.info({port: app_state.port}, 'Writeurl server is listening');
});
