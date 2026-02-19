import factory
from accounts.factories import UserFactory
from notes.models import Category, Note


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category
        skip_postgeneration_save = True

    name = factory.Sequence(lambda n: f'Category {n}')
    color = '#EF9C66'
    user = factory.SubFactory(UserFactory)


class NoteFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Note
        skip_postgeneration_save = True

    title = factory.Sequence(lambda n: f'Note {n}')
    content = factory.Faker('paragraph')
    user = factory.SubFactory(UserFactory)
    category = factory.SubFactory(CategoryFactory, user=factory.SelfAttribute('..user'))
