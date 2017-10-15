#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <zf_log/zf_log.h>
#include <writeurl/server.h>

void wurl_server_init(struct wurl_server *server, const struct wurl_server_config *config)
{
        zf_log_set_output_level(config->log_level);
        ZF_LOGI("The Writeurl server is initialized with log level = %i", config->log_level);

        server->hostname = strdup(config->hostname);
        server->servname = strdup(config->servname);

        pthread_mutex_init(&server->mutex, NULL);
        server->stopped = false;
}

void wurl_server_free(struct wurl_server *server)
{
        ZF_LOGI("The Writeurl server stops listening and is freed");
        for (int i = 0; i < server->nsocks; ++i) {
                int fd = server->socks[i].fd;
                ZF_LOGD("Closing listening socket, fd = %i", fd);
                close(fd);
        }
        free(server->hostname);
        free(server->servname);

        pthread_mutex_destroy(&server->mutex);
}

int wurl_server_listen(struct wurl_server *server)
{
        server->nsocks = wurl_net_listen(server->hostname, server->servname, &server->socks);
        ZF_LOGI("The Writeurl server listens on %i sockets", server->nsocks);

        return server->nsocks;
}

void wurl_server_start(struct wurl_server *server)
{
        ZF_LOGI("The Writeurl server starts the event loop");

        while (true) {
                bool stopped = false;
                pthread_mutex_lock(&server->mutex);
                stopped = server->stopped;
                pthread_mutex_unlock(&server->mutex);
                if (stopped) {
                        ZF_LOGI("The event loop is terminating");
                        return;
                }
                ZF_LOGD("Iteration of the event loop");
                sleep(10);
        }
}

void wurl_server_stop(struct wurl_server *server)
{
        ZF_LOGI("The Writeurl server stops the event loop");
        pthread_mutex_lock(&server->mutex);
        server->stopped = true;
        pthread_mutex_unlock(&server->mutex);
}
