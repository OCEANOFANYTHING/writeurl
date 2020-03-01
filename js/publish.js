import { xhr } from './lib.js';

class PublishState {
    constructor(time) {
        this.time = time || null;
    }

    update(ops) {
        if (ops.length > 0) {
            this.time = ops[ops.length - 1].after; 
        }
	}

    copy() {
        return new PublishState(this.time);
    }
}

class PublishEditor  {
    constructor(editor_id, doc, publish_state) {
        this.editor_id = editor_id;
        this.doc = doc;
        this.msg = document.createElement('div');
        this.set_time(publish_state.time);
    }

	set_time(new_time) {
		this.time = new_time;
		this.msg.textContent = !new_time ? 'Not published' : 'Published at ' + new Date(new_time);
	}

	get_time() {
		return this.time;
	}

	add_external_ops(ops, _set_location) {
        for (const op of ops) {
            if ('editor_class' in op && op.editor_class === 'publish') {
				this.set_time(op.after);
            }
        }
	}

	publish(callback) {
        const html = nbe.doc.html(nbe.dynamic.doc);
		const body = {
			type : 'publish',
			id : this.doc.ids.id,
			write : this.doc.ids.write,
			html,
		};
			
		xhr('POST', nbe.config.publish_url, {}, JSON.stringify(body), 0, response => {
			const msg = JSON.parse(response);
			if (msg == 'published') {
				const op = {
					editor_class : 'publish',
					before : this.time,
					after : Date.now()
				};
				this.set_time(op.after);
				this.doc.add_ops(this.editor_id, [op]);
				callback(msg);
			}
		}, function () {}, function () {
			callback(null);
		});
	}
}

const publish_css = '/* Line styles */\n\n.wu-line, .wu-line > span {\n	line-height : 160%;\n}\n\n.wu-line.wu-right {\n	text-align : right;\n}\n\n.wu-line.wu-center {\n	text-align : center;\n}\n\n.wu-line.wu-justify {\n	text-align : justify;\n}\n\n/* Line spacing */\n\n.wu-line_spacing_05, .wu-line_spacing_05 > span {\n	line-height : 50%;\n}\n\n.wu-line_spacing_06, .wu-line_spacing_06 > span {\n	line-height : 60%;\n}\n\n.wu-line_spacing_07, .wu-line_spacing_07 > span {\n	line-height : 70%;\n}\n\n.wu-line_spacing_08, .wu-line_spacing_08 > span {\n	line-height : 80%;\n}\n\n.wu-line_spacing_09, .wu-line_spacing_09 > span {\n	line-height : 90%;\n}\n\n.wu-line_spacing_10, .wu-line_spacing_10 > span {\n	line-height : 100%;\n}\n\n.wu-line_spacing_11, .wu-line_spacing_11 > span {\n	line-height : 110%;\n}\n\n.wu-line_spacing_12, .wu-line_spacing_12 > span {\n	line-height : 120%;\n}\n\n.wu-line_spacing_13, .wu-line_spacing_13 > span {\n	line-height : 130%;\n}\n\n.wu-line_spacing_14, .wu-line_spacing_14 > span {\n	line-height : 140%;\n}\n\n.wu-line_spacing_15, .wu-line_spacing_15 > span {\n	line-height : 150%;\n}\n\n.wu-line_spacing_16, .wu-line_spacing_16 > span {\n	line-height : 160%;\n}\n\n.wu-line_spacing_17, .wu-line_spacing_17 > span {\n	line-height : 170%;\n}\n\n.wu-line_spacing_18, .wu-line_spacing_18 > span {\n	line-height : 180%;\n}\n\n.wu-line_spacing_19, .wu-line_spacing_19 > span {\n	line-height : 190%;\n}\n\n.wu-line_spacing_20, .wu-line_spacing_20 > span {\n	line-height : 200%;\n}\n\n/* Lists */\n\n.wu-disc, .wu-square {\n	display : list-item;\n	list-style : inside;\n}\n\n.wu-lower-alpha, .wu-lower-roman , .wu-lower-roman, .wu-upper-alpha, .wu-upper-roman {\n	display : block;\n}\n\n.wu-disc {\n	list-style-type : disc;\n}\n\n.wu-lower-alpha:before {\n	counter-increment : item;\n	content : counter(item, lower-alpha) ". "\n}\n\n.wu-lower-roman:before {\n	counter-increment : item;\n	content : counter(item, lower-roman) ". "\n}\n\n.wu-square {\n	list-style-type : square;\n}\n\n.wu-upper-alpha:before {\n	counter-increment : item;\n	content : counter(item, upper-alpha) ". "\n}\n\n.wu-upper-roman:before {\n	counter-increment : item;\n	content : counter(item, upper-roman) ". "\n}\n\n.wu-ordered {\n	display : block;\n}\n\n.wu-ordered:before {\n	counter-increment : item;\n	content : counter(item) ". "\n}\n\n.wu-reset-counter {\n	counter-reset : item;\n}\n\n/* Heading */\n\n.wu-line.wu-heading1, .wu-line.wu-heading1 span {\n	display: block;\n	padding-top: 4px;\n	padding-bottom: 4px;\n	font-size: 135%;\n}\n\n.wu-line.wu-heading2, .wu-line.wu-heading2 span {\n	display: block;\n	padding-top: 4px;\n	padding-bottom: 4px;\n	font-size: 130%;\n}\n\n.wu-line.wu-heading3, .wu-line.wu-heading3 span {\n	display: block;\n	padding-top: 4px;\n	padding-bottom: 4px;\n	font-size: 125%;\n}\n\n.wu-line.wu-heading4, .wu-line.wu-heading4 span {\n	display: block;\n	padding-top: 4px;\n	padding-bottom: 4px;\n	font-size: 120%;\n}\n\n.wu-line.wu-heading5, .wu-line.wu-heading5 span {\n	display: block;\n	padding-top: 4px;\n	padding-bottom: 4px;\n	font-size: 115%;\n}\n\n.wu-line.wu-heading6, .wu-line.wu-heading6 span {\n	display: block;\n	padding-top: 4px;\n	padding-bottom: 4px;\n	font-size: 110%;\n}\n\n.wu-line.wu-heading1 span, .wu-line.wu-heading2 span, .wu-line.wu-heading3 span, .wu-line.wu-heading4 span, .wu-line.wu-heading5 span, .wu-line.wu-heading6 span {\n	display : inline-block;\n}\n\n/* Text styles */\n\n.wu-text.wu-bold {\n	font-weight : bold;\n}\n\n.wu-text.wu-underline {\n	text-decoration : underline;\n}\n\n.wu-text.wu-italic {\n	font-style : italic;\n}\n\n.wu-text.wu-strikethrough {\n	text-decoration : line-through;\n}\nbody {\n	margin : 0;\n}\n\ndiv.editor {\n	white-space : pre-wrap;\n	word-wrap : break-word;\n	font-size : 16px;\n	font-family : Arial;\n	line-height : 120%;\n	line-height : 160%;\n	padding : 30px 50px;\n}\n\ndiv.editor span {\n	font-size : 16px;\n	font-family : Arial;\n}\n';

export {
    PublishState, 
    PublishEditor,
    publish_css,
 };
