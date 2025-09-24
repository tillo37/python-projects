import random

chosen_num = random.randrange(1,100)

print("Welcome to 'Guess the Number' Game.")

game_level = input("Choose difficulty level. Type 'easy' or 'hard': ").lower()
attempts = 0
if game_level == 'easy':
    attempts = 10
elif game_level == 'hard':
    attempts = 5
else:
    print("Invalid input")

game_over = False
while attempts > 0:

    while not game_over:
        print(f"You have {attempts} attempts remaining to guess the number.")
        user_num = int(input("Make a guess: "))

        if user_num == chosen_num:
            print(f"You got it! The answer was {chosen_num}.")
            game_over = True
        elif user_num < chosen_num:
            difference = chosen_num - user_num
            if difference >= 10:
                print("Too low.\nGuess again.")
            else:
                print("You are almost here. Try a bit higher numbers.")
        elif user_num > chosen_num:
            difference = user_num - chosen_num
            if difference >= 10:
                print("Too high.\nGuess again.")
            else:
                print("You are almost here. Try a bit lower numbers.")

        attempts-=1