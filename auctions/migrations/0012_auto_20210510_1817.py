# Generated by Django 3.2.2 on 2021-05-10 18:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0011_alter_auctionlistings_price'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='category',
            name='listingid',
        ),
        migrations.AddField(
            model_name='category',
            name='user',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='listedby', to='auctions.auctionlistings'),
            preserve_default=False,
        ),
    ]
