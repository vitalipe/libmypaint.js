#include <stdio.h>
#include <emscripten.h>
#include "libmypaint/libmypaint.c"
#include "proxy-surface.c"




static ProxySurface surface;


void register_callbacks(DrawDabFunctionCallback  draw_dab_cb, GetColorFunctionCallback get_color_cb) {
	float r, g, b, a;

    proxy_surface_init(&surface, draw_dab_cb, get_color_cb);

	// call for simple testing
	surface.parent.get_color((MyPaintSurface*) &surface, 100, 200, 42, &r, &g, &b, &a);
	//draw_dab_cb(100,200,0.1,100,200,100,1,1,0,1,0.1,1,1);

	printf("got RGBA(%f, %f, %f, %f) \n", r,g,b,a);
}


int main() {

}
