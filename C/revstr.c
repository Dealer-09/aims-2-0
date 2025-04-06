#include <stdio.h>
#include <string.h>

int main() {
    char str[100], rev[100];
    printf("Enter a string: ");
    scanf("%s", str);  
    int len = strlen(str);
    for (int i = len - 1, j = 0; i >= 0; i--, j++) {
        rev[j] = str[i];
    }
    rev[len] = '\0';
    printf("Reversed string is: %s\n", rev);
}