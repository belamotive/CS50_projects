from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

CATEGORY = (
        ("arm", "Armor"),
        ("wea", "Weapon"),
        ("ite", "Item"),
        ("alc", "Alchemy")
    )

class User(AbstractUser):
    pass

class AuctionListings(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listedby")
    listingimageurl = models.URLField(blank=True)
    category = models.CharField(max_length=3, choices=CATEGORY)
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=128)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    listed = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.user}"

class Bids(models.Model):
    listing = models.ForeignKey(AuctionListings, on_delete=models.CASCADE, related_name="listingbided")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userbidded")
    bid = models.DecimalField(max_digits=6, decimal_places=2)
    bidded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} bid on: {self.listing} ${self.bid} at {self.bidded}"

class Comment(models.Model):
    listing = models.ForeignKey(AuctionListings, on_delete=models.CASCADE, related_name="listingcommented")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="usercommented")
    comment = models.CharField(max_length=128)
    commented = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} commented on {self.listing}: {self.comment}"
    
class WatchList(models.Model):
    listing = models.ForeignKey(AuctionListings, on_delete=models.CASCADE, related_name="listingwatch")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userwatching")

class ActiveListing(models.Model):
    listing = models.ForeignKey(AuctionListings, on_delete=models.CASCADE, related_name="listingactive")
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"Active? {self.active} - {self.listing}" 

class AuctionWon(models.Model):
    listing = models.ForeignKey(AuctionListings, on_delete=models.CASCADE, related_name="listingwon")
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="userwon")

    def __str__(self):
        return f"{self.listing} won by: {self.winner}"