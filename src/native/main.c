#include <stdio.h>
#include <emscripten.h>
#include "libmypaint/libmypaint.c"
#include "proxy-surface.c"




static ProxySurface* surface;
static MyPaintBrush* brush;


void new_stroke() {
	mypaint_brush_reset(brush);
}

void stroke_at(float x, float y, double dtime) {
	mypaint_brush_stroke_to(brush, (MyPaintSurface*) surface, x, y, 1, 0, 0, dtime);
}

void init(DrawDabFunctionCallback  draw_dab_cb, GetColorFunctionCallback get_color_cb) {
	surface = proxy_surface_new(draw_dab_cb, get_color_cb);
	brush = mypaint_brush_new();

	// set dummy brush data for now...
	mypaint_brush_from_defaults(brush);
	mypaint_brush_set_base_value(brush, MYPAINT_BRUSH_SETTING_COLOR_H, 1.0);
	mypaint_brush_set_base_value(brush, MYPAINT_BRUSH_SETTING_COLOR_S, 0.5);
	mypaint_brush_set_base_value(brush, MYPAINT_BRUSH_SETTING_COLOR_V, 0.4);
}
