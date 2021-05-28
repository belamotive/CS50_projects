
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    # API Routs
    path("post", views.createpost, name="createpost"),
    path("posts/<str:which>", views.posts, name="posts"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("follow/<int:user_id>", views.follow, name="follow"),
    path("unfollow/<int:user_id>", views.unfollow, name="unfollow"),
    path("following", views.following, name="following"),
    path("updatepost/<int:post_id>", views.updatepost, name="updatepost"),
    path("likepost/<int:post_id>", views.like, name="like")
]
