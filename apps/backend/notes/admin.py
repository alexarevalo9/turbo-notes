from django.contrib import admin

from notes.models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ('name', 'color', 'user')
    list_filter = ('user',)
    search_fields = ('name', 'user__email')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):  # type: ignore[type-arg]
    list_display = ('title', 'category', 'user', 'updated_at')
    list_filter = ('category', 'user')
    search_fields = ('title', 'user__email')
