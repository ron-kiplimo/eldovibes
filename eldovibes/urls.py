from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from directory.views import register, payment_callback
from django.conf import settings
from django.conf.urls.static import static
from . import views


def debug_password_reset(request, *args, **kwargs):
    print(f"CSRF token from POST: {request.POST.get('csrfmiddlewaretoken')}")
    print(f"CSRF token from cookies: {request.COOKIES.get('csrftoken')}")
    return auth_views.PasswordResetView.as_view(template_name='password_reset.html')(request, *args, **kwargs)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('directory.urls')),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', register, name='register'),
    path('password_reset/', debug_password_reset, name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='password_reset_done.html'), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'), name='password_reset_complete'),
    path('payment/callback/', payment_callback, name='payment_callback'),
    path('dashboard/', views.escort_dashboard, name='escort_dashboard'),
    # other urls...


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)