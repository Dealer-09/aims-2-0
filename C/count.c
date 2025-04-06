#include<stdio.h>
#include<ctype.h>
int main()
{
    char str[100];
    int vowel=0,consonant=0,i;
    printf("Enetr a string:");
    scanf("%s",&str);
    for(int i=0;str[i]!='\0';i++)
    {
        char ch=tolower(str[i]);
        if(isalpha(ch))
        {
            if(ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u')
            vowel++;
            else
            consonant++;
        }
    }
    printf("No of vowels = %d\nNo of Consonant=%d,vowel,consonant");
}