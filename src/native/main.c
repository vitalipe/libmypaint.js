#include "libmypaint/libmypaint.c"
#include <stdio.h>
#include <emscripten.h>


typedef void (*GetColorFunctionCallback) (
							float x, float y, float radius,
                            float * color_r, float * color_g, float * color_b, float * color_a
                        );

typedef int (*DrawDabFunctionCallback) (
                       		float x, float y,
                       		float radius,
                       		float color_r, float color_g, float color_b,
	                       	float opaque, float hardness,
    	                   	float alpha_eraser,
        	               	float aspect_ratio, float angle,
            	           	float lock_alpha,
                	       	float colorize
                       );


void register_callbacks(DrawDabFunctionCallback  draw_dab_cb, GetColorFunctionCallback get_color_cb) {
	float r, g, b, a;

	// call for simple testing
	get_color_cb(100, 200, 42, &r, &g, &b, &a);
	draw_dab_cb(100,200,0.1,100,200,100,1,1,0,1,0.1,1,1);

	printf("got RGBA(%f, %f, %f, %f) \n", r,g,b,a);
}


int main() {
 

  printf("hello! \n");

}
