from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include(("automates_app.urls", "automates_app"), "automates_app"))
] + static(settings.STATIC_URL)
