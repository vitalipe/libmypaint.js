#include "proxy-surface.h"




static int proxy_surface_draw_dab(MyPaintSurface* self,
    float x, float y,
    float radius,
    float color_r, float color_g, float color_b,
    float opaque, float hardness,
    float alpha_eraser,
    float aspect_ratio, float angle,
    float lock_alpha,
    float colorize)
{
    ProxySurface* surface = (ProxySurface*) self;

    return surface->draw_dab_cb(x,y,radius,color_r,color_g,color_b,
        opaque,hardness,alpha_eraser,aspect_ratio, angle, lock_alpha, colorize);
}

static void proxy_surface_get_color(
    MyPaintSurface* self,
    float x, float y, float radius,
    float* color_r,float* color_g,float* color_b, float* color_a)
{
    ProxySurface* surface = (ProxySurface*) self;
    surface->get_color_cb(x, y, radius, color_r, color_g, color_b, color_a);
}




ProxySurface* proxy_surface_new(
    DrawDabFunctionCallback draw_dab_cb,
    GetColorFunctionCallback get_color_cb)
{
    ProxySurface* self = (ProxySurface*) malloc(sizeof(ProxySurface));
    mypaint_surface_init(&(self->parent));

    self->parent.draw_dab = proxy_surface_draw_dab;
    self->parent.get_color = proxy_surface_get_color;

    self->draw_dab_cb = draw_dab_cb;
    self->get_color_cb = get_color_cb;

    return self;
}
