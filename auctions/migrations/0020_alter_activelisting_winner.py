# Generated by Django 3.2.2 on 2021-05-12 08:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0019_activelisting_winner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activelisting',
            name='winner',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE, related_name='userwon', to=settings.AUTH_USER_MODEL),
        ),
    ]