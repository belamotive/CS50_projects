# Generated by Django 3.2.2 on 2021-05-12 08:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0020_alter_activelisting_winner'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activelisting',
            name='winner',
        ),
        migrations.CreateModel(
            name='AuctionWon',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('listing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='listingwon', to='auctions.auctionlistings')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='userwon', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
