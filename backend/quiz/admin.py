from django.contrib import admin
from .models import QuizScore, PlayerProfile

@admin.register(QuizScore)
class QuizScoreAdmin(admin.ModelAdmin):
    list_display = ['player_name', 'score', 'wrong', 'difficulty', 'user', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['player_name', 'user__username']

@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_games', 'best_score', 'average_score', 'accuracy']
    search_fields = ['user__username']