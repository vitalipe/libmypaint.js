#include "libmypaint/libmypaint.c"
#include <stdio.h>
#include <emscripten.h>



int ping(int id) {
	printf("%s %d \n", "test", id);
	return 42;
}


int main() {
 

  printf("hello! \n");

}
