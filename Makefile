WUL_HOME ?= ${realpath .}
BUILD_DIR ?= ${WUL_HOME}/build/release

${BUILD_DIR}:
	mkdir -p ${BUILD_DIR}

EXTERNAL := ${WUL_HOME}/external

# Browser build

BROWSER_BUILD_DIR := ${WUL_HOME}/build/browser

${BROWSER_BUILD_DIR}:
	mkdir -p ${BROWSER_BUILD_DIR}

.PHONY browser: ${BROWSER_BUILD_DIR}
	cp ${WUL_HOME}/html/robots.txt ${BROWSER_BUILD_DIR}/robots.txt
	cp ${WUL_HOME}/html/faq.html ${BROWSER_BUILD_DIR}/faq.html
	cp ${WUL_HOME}/html/googleb63512ae7494e695.html ${BROWSER_BUILD_DIR}/googleb63512ae7494e695.html




# C server

CPPFLAGS := -MMD -MP
CFLAGS := -std=c11 -Wall -Wextra -pedantic -Wunreachable-code \
	-Wno-nested-anon-types -fno-elide-constructors -pthread \
	-Wno-unused-parameter

# zf_log

ZF_LOG_DIR := ${EXTERNAL}/zf_log/zf_log
ZF_LOG_SRC := ${ZF_LOG_DIR}/zf_log.c
ZF_LOG_BUILD_DIR := ${BUILD_DIR}/zf_log
ZF_LOG_OBJ := ${ZF_LOG_BUILD_DIR}/zf_log.o
ZF_LOG_DEPS := ${ZF_LOG_OBJ:.o=.d}
ZF_LOG_CPPFLAGS := -I${EXTERNAL}/zf_log ${CPPFLAGS}

${ZF_LOG_BUILD_DIR}:
	mkdir -p ${ZF_LOG_BUILD_DIR}

${ZF_LOG_OBJ}: ${ZF_LOG_SRC} | ${ZF_LOG_BUILD_DIR}
	${CC} ${ZF_LOG_CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

# wul objects

WUL_SRC_DIR := ${WUL_HOME}/src/wul
WUL_SRCS := ${shell find ${WUL_SRC_DIR} -name '*.c'}
WUL_BUILD_DIR := ${BUILD_DIR}/wul
WUL_OBJS := ${WUL_SRCS:${WUL_SRC_DIR}/%.c=${WUL_BUILD_DIR}/%.o}
WUL_DEPS := ${WUL_OBJS:.o=.d}
WUL_CPPFLAGS := -I${WUL_HOME}/src ${ZF_LOG_CPPFLAGS}

${WUL_BUILD_DIR}:
	mkdir -p ${WUL_BUILD_DIR}

${WUL_OBJS}: | ${WUL_BUILD_DIR}

${WUL_BUILD_DIR}/%.o: ${WUL_SRC_DIR}/%.c
	${CC} ${WUL_CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

# libwriteurl

LIB_WRITEURL := ${BUILD_DIR}/libwriteurl.a

${LIB_WRITEURL}: ${WUL_OBJS} ${ZF_LOG_OBJ} | ${BUILD_DIR}
	${AR} -rcs $@ ${WUL_OBJS} ${ZF_LOG_OBJ}

# Writeurl server

SERVER := ${BUILD_DIR}/writeurl
SERVER_SRC := ${WUL_HOME}/src/main.c
SERVER_BUILD_DIR := ${BUILD_DIR}/server
SERVER_OBJ := ${SERVER_BUILD_DIR}/main.o
SERVER_DEPS := ${SERVER_OBJ:.o=.d}
SERVER_CPPFLAGS := ${WUL_CPPFLAGS}
SERVER_LDFLAGS := ${EXTRA_LDFLAGS}

${SERVER_BUILD_DIR}:
	mkdir -p ${SERVER_BUILD_DIR}

${SERVER_OBJ}: ${SERVER_SRC} | ${SERVER_BUILD_DIR}
	${CC} ${SERVER_CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c ${SERVER_SRC} -o ${SERVER_OBJ}

${SERVER}: ${SERVER_OBJ} ${LIB_WRITEURL} | ${BUILD_DIR}
	${CC} ${SERVER_LDFLAGS} $^ -o $@

# Tests

TEST_BUILD_DIR ?= ${BUILD_DIR}/test
TEST_MAIN ?= ${TEST_BUILD_DIR}/main
TEST_SRC_DIR := ${WUL_HOME}/test

TEST_SRCS := ${shell find ${TEST_SRC_DIR} -name '*.c'}
TEST_OBJS := ${TEST_SRCS:${TEST_SRC_DIR}/%.c=${TEST_BUILD_DIR}/%.o}
TEST_DEPS := ${TEST_OBJS:.o=.d}
TEST_CPPFLAGS := -I${TEST_SRC_DIR} ${WUL_CPPFLAGS}
TEST_LDFLAGS := ${EXTRA_LDFLAGS}

${TEST_BUILD_DIR}:
	mkdir -p ${TEST_BUILD_DIR}

${TEST_OBJS}: | ${TEST_BUILD_DIR}

${TEST_BUILD_DIR}/%.o: ${TEST_SRC_DIR}/%.c
	${CC} ${TEST_CPPFLAGS} ${CFLAGS} ${EXTRA_CFLAGS} -c $< -o $@

${TEST_MAIN}: ${TEST_OBJS} ${LIB_WRITEURL}
	${CC} ${TEST_LDFLAGS} ${TEST_OBJS} ${LIB_WRITEURL} -o $@

.PHONY: libwriteurl
libwriteurl: ${LIB_WRITEURL}

.PHONY: writeurl
writeurl: ${SERVER}

.PHONY: test
test: ${SERVER} ${TEST_MAIN}
	${TEST_MAIN}

.PHONY: objects
objects: ${OBJS}

.PHONY: clean
clean:
	${RM} -r ${WUL_HOME}/build

all: test

-include ${ZF_LOG_DEPS}
-include $(WUL_DEPS)
-include ${WRITEURL_SERVER_DEPS}
-include ${TEST_DEPS}

print-%  : ; @echo $* = $($*)
