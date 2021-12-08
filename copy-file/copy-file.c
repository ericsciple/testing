#define _GNU_SOURCE
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <assert.h>

#define DATA "Hello, world.\n"

static void create_file(const char *path)
{
  int fd;
  
  assert((fd = open(path, O_WRONLY | O_CREAT | O_EXCL, 0100644)) >= 0);
  assert(write(fd, DATA, sizeof(DATA)) == sizeof(DATA));
  close(fd);
}

static void copy(const char *src_path, const char *dst_path)
{
  int src_fd, dst_fd;
  struct stat st;
  size_t i, remain;

  assert((src_fd = open(src_path, O_RDONLY)) >= 0);
  assert((dst_fd = open(dst_path, O_WRONLY | O_CREAT | O_EXCL, 0100644)) >= 0);

  assert(fstat(src_fd, &st) == 0);
  assert(st.st_size == sizeof(DATA));
  
  printf("Copying %s -> %s:\n", src_path, dst_path);
  for (i = 0, remain = st.st_size; i < 1000 && remain > 0; i++)
  {
    ssize_t copied = copy_file_range(src_fd, NULL, dst_fd, NULL, remain, 0);
    assert(copied >= 0 && copied <= remain);

    remain -= copied;
    
    printf(" [loop %04zu]: copied: %zu, remaining: %zu\n", i, copied, remain);
    fflush(stdout);
  }

  close(src_fd);
  close(dst_fd);
  
  assert(remain == 0);
}

/* This is the root filesystem which is an overlay mount */
#define OVERLAY "/opt/hostedtoolcache/"

/* This is a folder in a separate volume mount */
#define VOLUME "/runner/_work/calculator/calculator/sendfile/"

int main()
{
  create_file(VOLUME "one");

  copy(VOLUME "one", OVERLAY "two");
  copy(OVERLAY "two", VOLUME "three");

  return 0;
}
