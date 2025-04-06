#include <stdio.h>
#include <string.h>
int main() {
    char str[100];
    int i, j, length, counter;
    printf("Enter a string (no spaces): ");
    scanf("%s", str);
    length = strlen(str);
    for (i = 0; i < length; i++) {
        if (str[i] == '\0') {
            continue;
        }
        counter = 1;
        for (j = i + 1; j < length; j++) {
            if (str[i] == str[j]) {
                counter++;
                str[j] = '\0';
            }
        }
        if (str[i] != '\0') {
            printf("'%c' occurs %d times\n", str[i], counter);
        }
    }
}