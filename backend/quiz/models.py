from django.db import models
from django.contrib.auth.models import User

class QuizScore(models.Model):
    """
    This model stores quiz results
    Each time someone finishes a quiz, we save:
    - their name
    - score (correct answers)
    - wrong (incorrect answers)
    - difficulty level
    - when they played
    """
    player_name = models.CharField(max_length=100)
    score = models.IntegerField()
    wrong = models.IntegerField()
    difficulty = models.CharField(max_length=20, default='easy')
    created_at = models.DateTimeField(auto_now_add=True)
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.player_name} - Score: {self.score}"
    
    class Meta:
        ordering = ['-score']  # Highest scores first

# Player Profile
class PlayerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_games = models.IntegerField(default=0)
    best_score = models.IntegerField(default=0)
    total_correct = models.IntegerField(default=0)
    total_wrong = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def average_score(self):
        if self.total_games == 0:
            return 0
        scores = QuizScore.objects.filter(user=self.user)
        total = sum([s.score for s in scores])
        return round(total / self.total_games, 2)
    
    @property
    def accuracy(self):
        total = self.total_correct + self.total_wrong
        if total == 0:
            return 0
        return round((self.total_correct / total) * 100, 2)