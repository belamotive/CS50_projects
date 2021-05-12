from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django import forms
from django.contrib.auth.models import User


from .models import ActiveListing, User, AuctionListings, WatchList, Bids, ActiveListing, AuctionWon, Comment
from .forms import AuctionListingsForm, CommentForm, CATEGORY


class newLinstingForm(forms.ModelForm):
    class Meta:
        model = AuctionListings
        exclude = ["user"]


def index(request):
    listings = AuctionListings.objects.filter(listingactive__active=True).order_by("-listed")
    title = "Active Listings"
    return render(request, "auctions/index.html", {
        "listings": listings,
        "title": title
    })


def category(request, category):
    listings = AuctionListings.objects.filter(category=category, listingactive__active=True).order_by("-listed")
    
    for c in range(len(CATEGORY)):
        if CATEGORY[c][0] == category:
            cat = CATEGORY[c][1]

    title = f"{cat} Listings"
    print(title)
    return render(request, "auctions/index.html", {
        "listings": listings,
        "title": title
    })


def closed(request):
    listings = AuctionListings.objects.filter(listingactive__active=False).order_by("-listed")
    title = "Closed Listings"
    return render(request, "auctions/index.html", {
        "listings": listings,
        "title": title
    })


def watching(request):
    listings = AuctionListings.objects.filter(listingwatch__user=request.user.id).order_by("-listed")
    title = "Watchlist"
    return render(request, "auctions/index.html", {
        "listings": listings,
        "title": title
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required
def newlisting(request):
    listingform = AuctionListingsForm()
    if request.method == "POST":
        userid = request.user.id
        listingForm = newLinstingForm(request.POST)

        # check if forms valid
        listingformValid = listingForm.is_valid()
        if listingformValid:
            # assign data to object
            listing = AuctionListings()
            listing.user_id = userid
            listing.listingimageurl = request.POST.get('imageurl')
            listing.category = request.POST.get('category')
            listing.title = request.POST.get('title')
            listing.description = request.POST.get('description')
            listing.price = request.POST.get('price')

            if not listing.listingimageurl:
                listing.listingimageurl = "https://thewitcher3.wiki.fextralife.com/file/The-Witcher-3/placeholder.jpg"
            
            # save changes
            listing.save()
            print(listing.id)
            active = ActiveListing()
            active.listing = listing
            active.save()
            return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))
        else:
            return HttpResponseRedirect(reverse("auctions/newlisting"))

    return render(request, "auctions/newlisting.html", {
        "listingForm": listingform
    })


def listing(request, listing_id):
    userid = request.user.id
    listing = AuctionListings.objects.get(pk=listing_id)
    if userid:
        bids = Bids.objects.filter(listing=listing_id).order_by("-bidded")
        watching = WatchList.objects.filter(listing=listing_id, user=userid)
        active = ActiveListing.objects.get(listing=listing_id)
        comments = Comment.objects.filter(listing=listing_id)
        commentform = CommentForm()
        winner = None
        if active.active == False:
            winner = AuctionWon.objects.get(listing=listing_id)
        return render(request, "auctions/listing.html", {
            "watching": watching,
            "listing": listing,
            "minbid": float(listing.price)+0.5,
            "bids": bids,
            "active": active.active,
            "winner": winner,
            "commentform": commentform,
            "comments": comments
        })
    else:
        return render(request, "auctions/listing.html", {
            "listing": listing
        })


def watchlist(request, listing_id):
    userid = request.user.id
    watching = WatchList.objects.filter(listing=listing_id, user=userid)
    if request.method == "POST":
        listing = AuctionListings.objects.get(pk=listing_id)
        user = User.objects.get(pk=userid)
        if not watching:
            watching = WatchList(listing=listing, user=user)
            watching.save()
            return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))
        else:
            watching.delete()
            return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))


@login_required
def bid(request, listing_id):
    userid = request.user.id
    if request.method == "POST":
        bid = float(request.POST.get('bid'))
        listing = AuctionListings.objects.get(pk=listing_id)
        user = User.objects.get(pk=userid)

        if bid + 1 <= listing.price:
            bidmessage = "Your Bid is too low."
            return render(request, "auctions/listing.html", {
            "listing": listing,
            "minbid": listing.price+0.5,
            "bidmessage": bidmessage
        })
        else:
            b = Bids(bid=bid, listing=listing, user=user)
            b.save()
            listing.price = bid
            listing.save()
            return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))


@login_required
def close(request, listing_id):
    userid = request.user.id
    if request.method == "POST":
        listing = AuctionListings.objects.get(pk=listing_id)

        if userid == listing.user_id:
            # save listing as False
            activelisting = ActiveListing.objects.get(listing=listing.id)
            activelisting.active = False
            activelisting.save()
            # save winner to auctionwon
            winningbid = Bids.objects.get(listing=listing.id, bid=listing.price)
            print(f"winningbid={winningbid}")
            user = User.objects.get(username=winningbid.user)
            print(f"winninguser={user}")
            
            a = AuctionWon(listing=listing, winner=user)
            a.save()
            
            return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))


@login_required
def comment(request, listing_id):
    userid = request.user.id
    if request.method == "POST":
        listing = AuctionListings.objects.get(pk=listing_id)
        user = User.objects.get(pk=userid)
        comment = request.POST.get("comment")

        c = Comment(listing=listing, user=user, comment=comment)
        c.save()

        return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))
