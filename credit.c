#include <stdio.h>
#include <math.h>
#include <cs50.h>

int main(void)
{
    long cardNumber;
    
    // Prompt card number (lol)
    cardNumber = get_long("Number: ");
    
    int digitOne;
    int digitTwo;
    int digitSum = 0;
    
    if (cardNumber >= 340000000000000 && cardNumber <= 349999999999999)
    {
        cardNumber *= 10;
        for (int i = 0; i < 10; i++)
        {
            for (int d = 0; d < 1; d++)
            {
                cardNumber /= 10;
                digitOne = cardNumber % 10;
                //printf("AMERICAN EXPRESS: %li\n", cardNumber);
                //printf("digitOne: %i\n", digitOne);
            }
            cardNumber /= 10;
            digitTwo = cardNumber % 10 * 2;
            if (digitTwo >= 10)
            {
                digitTwo = digitTwo % 10 + 1;
                digitSum += digitTwo + digitOne;
            }
            else
            {
                digitSum += digitTwo + digitOne;
            }
            
            //printf("AMERICAN EXPRESS: %li\n", cardNumber);
            //printf("digitTwo: %i\n", digitTwo);
        }
        //printf("digitSum: %i\n", digitSum);
        if (digitSum % 10 == 0)
        {
            printf("AMEX\n");
        }
        else
        {
            printf("INVALID\n");
        }
        
    }
    else if (cardNumber >= 370000000000000 && cardNumber <= 379999999999999)
    {
        cardNumber *= 10;
        for (int i = 0; i < 10; i++)
        {
            for (int d = 0; d < 1; d++)
            {
                cardNumber /= 10;
                digitOne = cardNumber % 10;
                //printf("AMERICAN EXPRESS: %li\n", cardNumber);
                //printf("digitOne: %i\n", digitOne);
            }
            cardNumber /= 10;
            digitTwo = cardNumber % 10 * 2;
            if (digitTwo >= 10)
            {
                digitTwo = digitTwo % 10 + 1;
                digitSum += digitTwo + digitOne;
            }
            else
            {
                digitSum += digitTwo + digitOne;
            }
            
            //printf("AMERICAN EXPRESS: %li\n", cardNumber);
            //printf("digitTwo: %i\n", digitTwo);
        }
        //printf("digitSum: %i\n", digitSum);
        if (digitSum % 10 == 0)
        {
            printf("AMEX\n");
        }
        else
        {
            printf("INVALID\n");
        }
        
    }
    else if (cardNumber >= 5100000000000000 && cardNumber <= 5599999999999999)
    {
        cardNumber *= 10;
        for (int i = 0; i < 10; i++)
        {
            for (int d = 0; d < 1; d++)
            {
                cardNumber /= 10;
                digitOne = cardNumber % 10;
                //printf("MASTERCARD: %li\n", cardNumber);
                //printf("digitOne: %i\n", digitOne);
            }
            cardNumber /= 10;
            digitTwo = cardNumber % 10 * 2;
            if (digitTwo >= 10)
            {
                digitTwo = digitTwo % 10 + 1;
                digitSum += digitTwo + digitOne;
            }
            else
            {
                digitSum += digitTwo + digitOne;
            }
            
            //printf("MASTERCARD: %li\n", cardNumber);
            //printf("digitTwo: %i\n", digitTwo);
        }
        //printf("digitSum: %i\n", digitSum);
        if (digitSum % 10 == 0)
        {
            printf("MASTERCARD\n");
        }
        else
        {
            printf("INVALID\n");
        }
        
    }
    else if (cardNumber >= 4000000000000 && cardNumber < 5000000000000000)
    {
        cardNumber *= 10;
        for (int i = 0; i < 10; i++)
        {
            for (int d = 0; d < 1; d++)
            {
                cardNumber /= 10;
                digitOne = cardNumber % 10;
                //printf("VISA: %li\n", cardNumber);
                //printf("digitOne: %i\n", digitOne);
            }
            cardNumber /= 10;
            digitTwo = cardNumber % 10 * 2;
            if (digitTwo >= 10)
            {
                digitTwo = digitTwo % 10 + 1;
                digitSum += digitTwo + digitOne;
            }
            else
            {
                digitSum += digitTwo + digitOne;
            }
            
            //printf("VISA: %li\n", cardNumber);
            //printf("digitTwo: %i\n", digitTwo);
        }
        //printf("digitSum: %i\n", digitSum);
        if (digitSum % 10 == 0)
        {
            printf("VISA\n");
        }
        else
        {
            printf("INVALID\n");
        }
    }
    else
    {
        printf("INVALID\n");
    }
}