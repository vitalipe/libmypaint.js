#include <stdio.h>
#include <emscripten.h>
#include "libmypaint/libmypaint.c"
#include "proxy-surface.c"




static ProxySurface* surface;
static MyPaintBrush* brush;


void new_brush() {
	if (brush != NULL)
		mypaint_brush_unref(brush);

	brush = mypaint_brush_new();
}

void set_brush_base_value(char* setting_name, double base_value) {
	MyPaintBrushSetting setting_id = mypaint_brush_setting_from_cname(setting_name);
	mypaint_brush_set_base_value(brush, setting_id, base_value);
}


void set_brush_mapping_n(char* setting_name, char* input_name, int number_of_mapping_points) {
	MyPaintBrushSetting setting_id = mypaint_brush_setting_from_cname(setting_name);
	MyPaintBrushInput input_id = mypaint_brush_input_from_cname(input_name);

	mypaint_brush_set_mapping_n(brush, setting_id, input_id, number_of_mapping_points);
}


void set_brush_mapping_point(char* setting_name, char* input_name, int index, float x, float y) {
	MyPaintBrushSetting setting_id = mypaint_brush_setting_from_cname(setting_name);
	MyPaintBrushInput input_id = mypaint_brush_input_from_cname(input_name);

	mypaint_brush_set_mapping_point(brush, setting_id, input_id, index, x, y);
}


void new_stroke() {
	mypaint_brush_reset(brush);
}

void stroke_at(float x, float y, float pressure, float xtilt, float ytilt, double dtime) {
	mypaint_brush_stroke_to(brush, (MyPaintSurface*) surface, x, y, pressure, xtilt, ytilt, dtime);
}

void init(DrawDabFunctionCallback  draw_dab_cb, GetColorFunctionCallback get_color_cb) {
	surface = proxy_surface_new(draw_dab_cb, get_color_cb);
	brush = mypaint_brush_new();
}
