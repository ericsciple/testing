#define _GNU_SOURCE
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <assert.h>

static void copy(const char *src_path, const char *dst_path)
{
  int src_fd, dst_fd;
  struct stat st;
  size_t i, remain;

  assert((src_fd = open(src_path, O_RDONLY)) >= 0);
  assert((dst_fd = open(dst_path, O_WRONLY | O_CREAT | O_EXCL, 0100644)) >= 0);
  assert(fstat(src_fd, &st) == 0);
  
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

int main(int argc, char *argv[])
{
  if (argc != 3)
  {
    printf("Expected exactly two arguments: sourceFile destFile");
    return 1;
  }

  copy(argv[1], argv[2]);
  return 0;
}
