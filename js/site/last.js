import { TryingToConnect, display_url_error } from './display_message.js';

'use strict';

(function () {
	const ids = nbe.config.parse_pathname(window.location.pathname);

	nbe.site.display_feedback();

	if (ids.prefix === 'new') {
		window.location = nbe.config.new_url();
	} else if ((ids.prefix !== 'text'  && ids.prefix !== 'scroller') || ids.id === null || ids.read === null || (ids.new_doc && ids.write === null)) {
        window.history.replaceState('', '', nbe.config.home_pathname);
		document.getElementById('frontpage').style.display = 'inline';
		nbe.site.display_demo();
		nbe.site.supported_front();
	} else {
		if (ids.new_doc) {
			window.history.replaceState('', '', nbe.config.write_pathname(ids));
		}

		const trying_to_connect = new TryingToConnect();
		trying_to_connect.on();
        let status_panel;
		if (ids.write !== null) {
			status_panel = nbe.site.status_panel(ids);
		}

		document.getElementById('home').target = '_blank';
		document.getElementById('faq').target = '_blank';

		const callback_status = function (key, value) {
            console.log(key, value);
			if (key === 'doc') {
				trying_to_connect.off();
				if (value === 'exist') {
					doc.comm.notify();
					nbe.site.display_editor(doc);
					if (ids.write !== null) {
						status_panel.display(document.getElementById('panel'));
					}
				} else if (value === 'noexist') {
					nbe.site.doc_noexist(doc);
				}
			} else if (key === 'password') {
				if (value === 'wrong password') {
                    display_url_error();
				}
			} else if (key === 'network' || key === 'nunsaved') {
				if (ids.write !== null) {
					status_panel.set_status(key, value);
				}
			}
		};

		const doc = nbe.doc.create(ids, nbe.config.local_storage, nbe.config.ws_url, callback_status);
		nbe.dynamic.doc = doc;

		if (doc.server_status !== 'unknown') {
			callback_status('doc', 'exist');
		}
	}

    // Register the service worker for offline caching.
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            //navigator.serviceWorker.register('/serviceworker.js');
        });
    }
}());
