from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.fields.related import ForeignKey


class User(AbstractUser):
    pass

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username
        }

class Posts(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="postedby")
    post = models.CharField(max_length=256)
    likes = models.PositiveIntegerField(default=0)
    date = models.DateTimeField(auto_now_add=True)
    update = models.DateTimeField(auto_now=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user.id,
            "user": self.user.username,
            "post": self.post,
            "date": self.date.strftime("%b %d %Y, %I:%M %p"),
            "update": self.update.strftime("%b %d %Y, %I:%M %p")
        }


class Likes(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likedby")
    post = models.ForeignKey("Posts", on_delete=models.CASCADE, related_name="likedby")
    liked = models.BooleanField(default=0)

    def serialize(self):
        return {
            "user_id": self.user.id,
            "user": self.user.username,
            "post": self.post.id,
            "liked": self.liked
        }
        

class Followers(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="followersuser")
    following = models.ForeignKey("User", on_delete=models.CASCADE, related_name="following")

    def serialize(self):
        return {
            "user": self.user.id,
            "following": self.following.id
        }