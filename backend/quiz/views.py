from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import QuizScore, PlayerProfile


@api_view(['GET', 'POST'])
def quiz_scores(request):
    if request.method == 'GET':
        # Get all scores from database
        scores = QuizScore.objects.all()[:10]  # Top 10 only
        
        # Convert to JSON format
        data = []
        for score in scores:
            data.append({
                'id': score.id,
                'player_name': score.player_name,
                'score': score.score,
                'wrong': score.wrong,
                'difficulty': score.difficulty,
                'created_at': score.created_at
            })
        
        return Response(data)
    
    elif request.method == 'POST':
        # Save new score
        player_name = request.data.get('player_name')
        score = request.data.get('score')
        wrong = request.data.get('wrong')
        difficulty = request.data.get('difficulty')

        # get user if logged in
        user = request.user if request.user.is_authenticated else None
        
        # Create database entry
        new_score = QuizScore.objects.create(
            player_name=player_name,
            score=score,
            wrong=wrong,
            difficulty=difficulty,
            user = user
        )

        # Update user profile stats
        if user:
            profile, created = PlayerProfile.objects.get_or_create(user=user)
            profile.total_games += 1
            profile.total_correct += score
            profile.total_wrong += wrong
            if score > profile.best_score:
                profile.best_score = score
            profile.save()
        
        return Response({
            'message': 'Score saved!',
            'id': new_score.id
        })

# Authentication Endpoints
@api_view(['POST'])
def register(request):
    # """
    # Register new user
    # POST: {
    #     "username": "john",
    #     "email": "john@example.com",
    #     "password": "securepass123"
    # }
    # """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Validation
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if username exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    # Create profile
    PlayerProfile.objects.create(user=user)
    
    # Create token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'message': 'User created successfully!',
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    # """
    # Login user
    # POST: {
    #     "username": "john",
    #     "password": "securepass123"
    # }
    # """
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Authenticate
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    # Get profile
    profile, created = PlayerProfile.objects.get_or_create(user=user)
    
    return Response({
        'message': 'Login successful!',
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'total_games': profile.total_games,
            'best_score': profile.best_score,
            'average_score': profile.average_score,
            'accuracy': profile.accuracy
        }
    })


@api_view(['POST'])
def logout(request):
    """
    Logout user (delete token)
    Requires: Authorization: Token <token_key>
    """
    if request.user.is_authenticated:
        # Delete the user's token
        Token.objects.filter(user=request.user).delete()
        return Response({'message': 'Logged out successfully!'})
    
    return Response(
        {'error': 'Not authenticated'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile
    Requires: Authorization: Token <token_key>
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    profile, created = PlayerProfile.objects.get_or_create(user=request.user)
    
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'total_games': profile.total_games,
        'best_score': profile.best_score,
        'average_score': profile.average_score,
        'accuracy': profile.accuracy,
        'total_correct': profile.total_correct,
        'total_wrong': profile.total_wrong
    })