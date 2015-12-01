#ifndef PROXY_SURFACE_H
#define PROXY_SURFACE_H



struct _ProxySurface;
typedef struct _ProxySurface ProxySurface;

typedef void (*GetColorFunctionCallback) (
	float x, float y, float radius,
	float * color_r, float * color_g,
	float * color_b, float * color_a
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


void proxy_surface_init(
	ProxySurface* self,
	DrawDabFunctionCallback draw_dab_cb,
	GetColorFunctionCallback get_color_cb
);



struct _ProxySurface {
	MyPaintSurface parent;

	/* private */
	GetColorFunctionCallback get_color_cb;
	DrawDabFunctionCallback draw_dab_cb;
};


#endif // PROXY_SURFACE_H
