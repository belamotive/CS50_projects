from django.contrib import admin
from .models import AuctionListings, Bids, Comment

# Register your models here.
admin.site.register(AuctionListings)
admin.site.register(Bids)
admin.site.register(Comment)