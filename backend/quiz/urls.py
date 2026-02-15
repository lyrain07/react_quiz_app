from django.urls import path
from . import views

urlpatterns = [
    path('scores/', views.quiz_scores, name='quiz_scores'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
]