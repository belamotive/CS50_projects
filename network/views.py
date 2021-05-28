import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import Likes, User, Posts, Followers
    

def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


def posts(request, which):

    if request.method != "GET":
        return JsonResponse({"error": "GET method required."}, status=400)

    if which == "all":
        posts = Posts.objects.order_by("-date").all()
    else:
        posts = Posts.objects.order_by("-date").filter(user=which)
    
    return JsonResponse([post.serialize() for post in posts], safe=False)


@csrf_exempt
@login_required
def createpost(request):
    # Creating a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    # Collect data from request and store in variable
    data = json.loads(request.body)
    post = data.get("post", "")

    # Check if post has content
    if post == "":
        return JsonResponse({"error": "Post has no content."}, status=400)

    # Save new post to database
    p = Posts(
        user = request.user,
        post=post
    )
    p.save()

    return JsonResponse({"success": "Post sent successfully."}, status=201)


@csrf_exempt
@login_required
def updatepost(request, post_id):
    if request.method == "PUT":

        update = json.loads(request.body)
        post = update.get("post", "")

        if post == "":
            return JsonResponse({"error": "Post has no content."}, status=400)

        p = Posts.objects.get(pk=post_id)

        if p.user.id != request.user.id:
            return JsonResponse({"error": "Something fishy. You are not the author of this post."}, status=400)
        else:
            p.post = post
            p.save()

            return JsonResponse({"success": "Post updated successfully."}, status=201)
        
    if request.method == "GET":
        posts = Posts.objects.filter(pk=post_id)
        print(posts)

        return JsonResponse([post.serialize() for post in posts], safe=False)


@csrf_exempt
def like(request, post_id):

    post = Posts.objects.get(id=post_id)

    if request.method == "POST":
        # Make sure user is logged in
        if request.user.is_authenticated:
            user = User.objects.get(id=request.user.id)
            data = json.loads(request.body)
            islike = data.get("liked", "")

            if islike == False:
                liked = Likes.objects.filter(post=post.id, user=user.id)

                liked.delete()

                return JsonResponse({"success": "Post unliked successfully."}, status=201)

            else:
                l = Likes(user=user, post=post, liked=islike)

                l.save()

                return JsonResponse({"success": "Post liked successfully."}, status=201)
        
        else:
            return JsonResponse({"error": "Users need to log in to like posts."}, status=400)

    
    if request.method == "GET":
        if request.user.is_authenticated:
            user = User.objects.get(id=request.user.id)
            likedposts = Likes.objects.filter(post=post.id)

            userliked = Likes.objects.filter(post=post.id, user=user)

            if userliked.exists():
                userliked = True
            else:
                userliked = False

            return JsonResponse({"likes": [liked.serialize() for liked in likedposts], "userliked": userliked}, safe=False)

        else:
            likedposts = Likes.objects.filter(post=post.id)
            
            if likedposts.exists() == False:
                return JsonResponse({"likes": ["nolikes"], "userliked": "login"}, safe=False)
            else:
                return JsonResponse({"likes": [liked.serialize() for liked in likedposts], "userliked": "login"}, safe=False)


@csrf_exempt
@login_required
def follow(request, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    following = User.objects.get(id=user_id)
    user = User.objects.get(id=request.user.id)

    f = Followers(user=user, following=following)
    f.save()

    return JsonResponse({"success": "Follow saved successfully."}, status=201)


@csrf_exempt
@login_required
def unfollow(request, user_id):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    following = User.objects.get(id=user_id)
    user = User.objects.get(id=request.user.id)

    f = Followers.objects.get(user=user, following=following).delete()

    return JsonResponse({"success": "Follow deleted successfully."}, status=201)


def profile(request, user_id):

    if request.method == "GET":

        if request.user.is_authenticated:
            user = User.objects.get(pk=request.user.id)
            profile = User.objects.filter(id=user_id)
            followers = Followers.objects.filter(following=user_id)
            following = Followers.objects.filter(user=user_id)
            isfollowing = Followers.objects.filter(user=user, following=user_id)

            # Check if current user follows user profile
            if isfollowing.count() > 0:
                isfollowing = True
            else:
                isfollowing = False

            return JsonResponse({"user": [data.serialize() for data in profile], "followers": [follower.serialize() for follower in followers], "following": [follower.serialize() for follower in following], "isfollowing": isfollowing}, safe=False)
        
        else:
            profile = User.objects.filter(id=user_id)
            followers = Followers.objects.filter(following=user_id)
            following = Followers.objects.filter(user=user_id)
            isfollowing = "login"
            
            return JsonResponse({"user": [data.serialize() for data in profile], "followers": [follower.serialize() for follower in followers], "following": [follower.serialize() for follower in following], "isfollowing": isfollowing}, safe=False)


@login_required
def following(request):

    if request.method == "GET":

        user = User.objects.get(id=request.user.id)

        usersfollowing = User.objects.filter(following__user=user)
        posts = Posts.objects.order_by("-date").filter(user__in=usersfollowing)

        return JsonResponse([post.serialize() for post in posts], safe=False)