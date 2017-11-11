'use strict';

const fs = require('fs');
const uglifyjs = require('uglify-js');

const process = require('process');
const wul_home = process.env['WUL_HOME'];

if (!wul_home) {
	console.log('WUL_HOME must be set in the environment');
	process.exit(1);
}

const html_dir = wul_home + '/html';
const css_dir = wul_home + '/css';
const js_dir = wul_home + '/build/debug/browser';
const img_dir = wul_home + '/img';
const build_dir = wul_home + '/build/release/browser';

const obfuscate = function (content) {



	var script, obfuscated_script, ast;

	script = content.toString();

	ast = uglifyjs.parser.parse(script); // parse code and get the initial AST
	ast = uglifyjs.uglify.ast_mangle(ast); // get a new AST with mangled names
	ast = uglifyjs.uglify.ast_squeeze(ast); // get an AST with compression optimizations
	obfuscated_script = uglifyjs.uglify.gen_code(ast); // compressed code here

	return new Buffer(obfuscated_script);
};

const read_index_html = function () {
	return fs.readFileSync(html_dir +  '/index.html', 'utf8');
};

const parse_index_html = function (text) {
	var parts, lines, current, i, line;

	lines = text.split('\n');

	parts = {first : [], css : [], middle : [], js : [], last : []};
	current = 'first';
	for (i = 0; i < lines.length; i++) {
		line = lines[i];
		if (/link rel/.test(line)) {
			parts.css.push(line);
			current = 'middle';
		} else if (/script src/.test(line)) {
			parts.js.push(line);
			current = 'last';
		} else {
			parts[current].push(line);
		}
	}

	return parts;
};

const read_css_files = function (parts) {
	var files;

	files = [];
	parts.css.forEach(function (line) {
		var name;

		name = line.match(/\/([^.]+\.css)/)[1];
		files.push(fs.readFileSync(wul_home + '/' + name, 'utf8'));
	});

	parts.css = ['<style type="text/css">'].concat(files).concat(['</style>']).join('\n');
};

const read_js_files = function (parts) {
	var files;

	files = [];
	parts.js.forEach(function (line) {
		var name;

		name = line.match(/\/(js\/[^.]+\.js)/)[1];
		if (name !== 'js/site/last.js') {
			files.push(fs.readFileSync(js_dir + '/' + name, 'utf8'));
		}
	});

	parts.js = files;
};

const process_js = function (parts) {
	var scripts, all, obfuscated;

	scripts = [];
	parts.js.forEach(function (script) {
		scripts.push(script.replace(/^.*'use strict'.*\n/, ''));
	});

	all = ['\'use strict\';\n'].concat(scripts).join('\n');
	//obfuscated = obfuscate(all).toString();
	obfuscated = all;

	parts.js = obfuscated;
};

const build_html = function (parts) {
	var html_head, html_css, html_middle, html_js, html_last;

	html_head = parts.first.join('\n').replace('<html lang="en"', '<html lang="en" manifest="/manifest.appcache"');
	html_css = '\t<link rel="stylesheet" href="/style.css" type="text/css">';
	html_middle = parts.middle.join('\n');
	html_js = [
		'<script src="/script.js"></script>',
		'<script src="/last.js"></script>'
	].join('\n');
	html_last = parts.last.filter(function (line) {
		return line !== '';
	}).join('\n');

	return html_head + '\n' + html_css + '\n' + html_middle + '\n' + html_js + '\n' + html_last;
};

const write_css = function (css) {
	fs.writeFileSync(build_dir + '/style.css', css);
};

const write_js = function (js) {
	fs.writeFileSync(build_dir + '/script.js', js);
};

const copy_last = function () {
	fs.writeFileSync(build_dir + '/last.js', fs.readFileSync(js_dir + '/js/site/last.js'));
};

const write_html = function (html) {
	fs.writeFileSync(build_dir + '/index.html', html);
};

const write_manifest = function () {
	var imgs, others, manifest;

	imgs = fs.readdirSync(img_dir).map(function (filename) {
		return '/img/' + filename;
	});

	others = [
		'/style.css',
		'/script.js',
		'/last.js'
	];

	manifest = 'CACHE MANIFEST\n# ' + new Date().toUTCString() + '\n\nCACHE:\n/index.html\n' + imgs.join('\n') + '\n' + others.join('\n') + '\n\nFALLBACK:\n/ /\n\nNETWORK:\n/publish/\n*\n';

	fs.writeFileSync(build_dir + '/manifest.appcache', manifest);
};

const build = function () {
	var text, parts, html;

	text = read_index_html();
	parts = parse_index_html(text);
	read_css_files(parts);
	write_css(parts.css);
	read_js_files(parts);
	process_js(parts);
	write_js(parts.js);
	copy_last();
	html = build_html(parts);
	write_html(html);
	write_manifest();
};

build();
