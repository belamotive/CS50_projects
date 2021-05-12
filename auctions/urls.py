from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("closed", views.closed, name="closed"),
    path("watching", views.watching, name="watching"),
    path("listing/<str:listing_id>", views.listing, name="listing"),
    path("watchlist/<str:listing_id>", views.watchlist, name="watchlist"),
    path("bid/<str:listing_id>", views.bid, name="bid"),
    path("close/<str:listing_id>", views.close, name="close"),
    path("comment/<str:listing_id>", views.comment, name="comment"),
    path("category/<str:category>", views.category, name="category"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("newlisting", views.newlisting, name="newlisting")
]
