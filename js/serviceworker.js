const CACHE_NAME = 'writeurl-cache-v1';

const urlstocache = [
    '/',
    '/embed/index.html',
    '/index.html',
    '/favicon.ico',
    '/publish/faq',
    '/css/style.css',
    '/css/embed.css',
    '/css/publish.css',
    '/js/first.js',
    '/js/config.js',
    '/js/lib/clone.js',
    '/js/lib/xhr.js',
    '/js/lib/rnd_string.js',
    '/js/lib/partial_copy.js',
    '/js/lib/get_attributes.js',
    '/js/lib/set_attributes.js',
    '/js/lib/new_id.js',
    '/js/lib/valid_email.js',
    '/js/lib/share_emails.js',
    '/js/lib/file_upload.js',
    '/js/lib/save_as.js',
    '/js/doc/create.js',
    '/js/doc/editors.js',
    '/js/doc/local_storage.js',
    '/js/doc/merge.js',
    '/js/doc/html.js',
    '/js/doc/comm.js',
    '/js/doc/ws.js',
    '/js/doc/state_init.js',
    '/js/doc/state_copy.js',
    '/js/doc/state_update.js',
    '/js/doc/state_serialize.js',
    '/js/doc/state_deserialize.js',
    '/js/state/initial.js',
    '/js/state/init.js',
    '/js/state/clean.js',
    '/js/state/update.js',
    '/js/state/element.js',
    '/js/state/mutate_element.js',
    '/js/state/formats.js',
    '/js/state/line_font_size.js',
    '/js/state/reset_counter.js',
    '/js/state/copy_text_format.js',
    '/js/state/copy_line_format.js',
    '/js/state/line_val_merge.js',
    '/js/state/cmp_value_format.js',
    '/js/state/cmp_text_format.js',
    '/js/state/set_format.js',
    '/js/state/line_classes.js',
    '/js/state/invert_ops.js',
    '/js/state/invert_oploc.js',
    '/js/state/left_margin.js',
    '/js/state/serialize.js',
    '/js/state/deserialize.js',
    '/js/state/state_copy.js',
    '/js/location.js',
    '/js/ops/append.js',
    '/js/ops/insert_before.js',
    '/js/ops/insert_after.js',
    '/js/ops/remove.js',
    '/js/ops/text.js',
    '/js/ops/link.js',
    '/js/ops/line.js',
    '/js/ops/root.js',
    '/js/ops/modified.js',
    '/js/events/add_event_listeners.js',
    '/js/events/observer.js',
    '/js/events/subtree.js',
    '/js/trigger.js',
    '/js/editor/create.js',
    '/js/editor/undo.js',
    '/js/notify/inputs.js',
    '/js/notify/left_margin.js',
    '/js/paste/clipboard.js',
    '/js/paste/insertion.js',
    '/js/paste/traverse.js',
    '/js/paste/div.js',
    '/js/paste/span.js',
    '/js/paste/link.js',
    '/js/paste/img.js',
    '/js/paste/text.js',
    '/js/paste/br.js',
    '/js/paste/remaining.js',
    '/js/browser.js',
    '/js/inputs/color_menu.js',
    '/js/inputs/input.js',
    '/js/inputs/button.js',
    '/js/inputs/bold.js',
    '/js/inputs/italic.js',
    '/js/inputs/underline.js',
    '/js/inputs/strikethrough.js',
    '/js/inputs/color.js',
    '/js/inputs/background_color.js',
    '/js/inputs/vertical_align.js',
    '/js/inputs/left_margin.js',
    '/js/inputs/undo.js',
    '/js/inputs/drop_down.js',
    '/js/inputs/heading.js',
    '/js/inputs/font_family.js',
    '/js/inputs/font_size.js',
    '/js/inputs/text_align.js',
    '/js/inputs/line_spacing.js',
    '/js/inputs/list.js',
    '/js/inputs/special_characters.js',
    '/js/inputs/insert_link.js',
    '/js/inputs/edit_link.js',
    '/js/inputs/insert_image.js',
    '/js/inputs/edit_image.js',
    '/js/title.js',
    '/js/publish.js',
    '/js/css/publish.js',
    '/js/last.js',
    '/img/ampersand.svg',
    '/img/bolt.svg',
    '/img/denied.svg',
    '/img/fork.svg',	
    '/img/home.svg',
    '/img/nyckelpiga.jpg',
    '/img/redo.svg',
    '/img/undo.svg',
    '/img/bg_button.png',
    '/img/cloud.svg',
    '/img/down.svg',
    '/img/furley_bg.png',
    '/img/image.svg',
    '/img/pen_alt2.svg',
    '/img/secure.svg',
    '/img/bg_frontpage.png',
    '/img/collaborative.svg',
    '/img/export.svg',
    '/img/history.svg',
    '/img/link.svg',
    '/img/plus.svg',
    '/img/text_editor.svg',
];

//const version = 9;

self.addEventListener('install', event => {
    //console.log('service worker install', version);
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlstocache);
        })
    );
});

self.addEventListener('activate', event => {
    //console.log('activate ', version);
    event.waitUntil(
        caches.keys().then(keys => { return Promise.all(
            keys.map(key => {
                if (key != CACHE_NAME) {
                    //console.log('delete cache', key);
                    return caches.delete(key);
                }
            }));}
    ).then(() => {
      //console.log('V2 now ready to handle fetches!');
    }));
});

self.addEventListener('fetch', event => {
    //console.log('service worker fetch event', version);
    event.respondWith(caches.match(event.request).then(response => {
        if (response) {
            return  response;
        }
        //console.log('No cache for ', event.request.url);
        return caches.match('/');
    }));
});
