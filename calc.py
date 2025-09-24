def add(a , b):
    result = a+b
    return result
def subtract(a, b):
    result = a-b
    return result
def multiply(a, b ):
    result = a*b
    return result
def divide(a, b):
    result = a/b
    return result

def calculator():
    output = 0
    continue_yes = True

    num1 = int(input("what your first num: "))

    while continue_yes:
        print("+, -, *, /")
        operation = input("pick an operation: ")

        num2 = int(input("what's your second num: "))



        if operation == "+":
            output = add(num1, num2)
            print(output)
        elif operation == "-":
            output = subtract(num1, num2)
            print(output)
        elif operation == "*":
            output = multiply(num1, num2)
            print(output)
        elif operation == "/":
            output = divide(num1, num2)
            print(output)
        else:
            print("invalid operation")

        condition_check = input("do you want to continue (y/n): ").lower()
        if condition_check == "y":
            check2 = input(f"do you want to continue with {output}. If yes type y, otherwise n for new number: ").lower()
            if check2 == "y":
                num1 = output
            elif check2 == "n":
                print("\n"*20 )
                calculator()
            else:
                print("invalid input")
        else:
            continue_yes = False
            print("you exit the calculation")

calculator()