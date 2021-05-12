from django import forms

CATEGORY = (
        ("arm", "Armor"),
        ("wea", "Weapon"),
        ("ite", "Item"),
        ("alc", "Alchemy")
    )

class AuctionListingsForm(forms.Form):
    title = forms.CharField(max_length=64)
    description = forms.CharField(max_length=128, widget=forms.Textarea(attrs={'rows':4, 'cols':15}))
    category = forms.ChoiceField(choices=CATEGORY)
    imageurl = forms.URLField(required=False)
    price = forms.DecimalField(max_digits=7, decimal_places=2)

    def __init__(self, *args, **kwargs):
        super(AuctionListingsForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs["class"] = "form-control mb-3"

class CommentForm(forms.Form):
    comment = forms.CharField(max_length=128, label=False, widget=forms.Textarea(attrs={'rows':4, 'cols':15}))

    def __init__(self, *args, **kwargs):
        super(CommentForm, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs["class"] = "form-control mb-3"