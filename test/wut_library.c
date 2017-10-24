#include <stdlib.h>
#include <stdio.h>
#include <wut_library.h>

void wut_assert_init(struct wut_assert *as, char *file, int line)
{
	as->pass = true;
	as->file = file;
	as->line = line;
	as->reason = NULL;
}
void wut_assert_destroy(struct wut_assert *as)
{
	free(as->reason);
}

void wut_test_init(struct wut_test *test, char *name)
{
	test->name = name;
	test->assert = NULL;
	test->nassert = 0;
	test->nalloc = 0;
}

void wut_test_destroy(struct wut_test *test)
{
	for (size_t i = 0; i < test->nassert; ++i) {
		struct wut_assert *as = test->assert + i;
		wut_assert_destroy(as);
	}
	free(test->assert);
}

void wut_test_expand(struct wut_test *test)
{
	size_t nalloc = test->nalloc == 0 ? 1 : 2 * test->nalloc;
	test->assert = realloc(test->assert, nalloc * sizeof(*test->assert));
	test->nalloc = nalloc;
}

struct wut_assert *wut_test_new_assert(struct wut_test *test, char *file,
				       int line)
{
	if (test->nassert == test->nalloc)
		wut_test_expand(test);
	struct wut_assert *as = test->assert + test->nassert;
	wut_assert_init(as, file, line);
	++test->nassert;
	return as;
}

void wut_collect_init(struct wut_collect *col)
{
	printf("Start of test run\n");
	col->test = NULL;
	col->ntest = 0;
	col->nalloc = 0;
	col->nfail = 0;
}

void wut_collect_destroy(struct wut_collect *col)
{
	for (size_t i = 0; i < col->ntest; ++i) {
		struct wut_test *test = col->test + i;
		wut_test_destroy(test);
	}
	free(col->test);
}

void wut_collect_expand(struct wut_collect *col)
{
	size_t nalloc = col->nalloc == 0 ? 1 : 2 * col->nalloc;
	col->test = realloc(col->test, nalloc * sizeof(*col->test));
	col->nalloc = nalloc;
}

struct wut_test *wut_collect_new_test(struct wut_collect *col, char *name)
{
	printf("Start test: %s\n", name);
	if (col->ntest == col->nalloc)
		wut_collect_expand(col);
	struct wut_test *test = col->test + col->ntest;
	wut_test_init(test, name);
	++col->ntest;
	return test;
}

static void print_assert_failure(char *name, struct wut_assert *as)
{
	char *fmt = "Failure in test = %s, file = %s, line = %i, %s\n";
	printf(fmt, name, as->file, as->line,
	       as->reason ? as->reason : "false");
}

void wut_collect_test_done(struct wut_collect *col, struct wut_test *test)
{
	size_t fail = 0;
	for (size_t i = 0; i < test->nassert; ++i) {
		struct wut_assert *as = test->assert + i;
		if (!as->pass) {
			++fail;
			print_assert_failure(test->name, as);
		}
	}
	if (fail != 0)
		++col->nfail;
}

#define NORMAL "\x1b[0m"
#define RED "\x1B[31m"
#define GREEN "\x1B[32m"

void wut_collect_done(struct wut_collect *col)
{
	printf("End of test run\n");
	printf("Number of tests = %zu\n", col->ntest);
	printf("Number of failed tests = %zu\n", col->nfail);
	if (col->nfail == 0)
		printf("%sSuccess%s\n", GREEN, NORMAL);
	else
		printf("%sFailure%s\n", RED, NORMAL);
}

size_t wut_fun_run(struct wut_fun *funs, size_t nfun)
{
	struct wut_collect col;
	wut_collect_init(&col);

	for (size_t i = 0; i < nfun; ++i) {
		struct wut_fun *fun = funs + i;
		struct wut_test *test =
			wut_collect_new_test(&col, fun->name);
		fun->fun(test);
		wut_collect_test_done(&col, test);
	}

	size_t nfail = col.nfail;

	wut_collect_done(&col);
	wut_collect_destroy(&col);

	return nfail;
}
