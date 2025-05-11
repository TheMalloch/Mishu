#include <stdio.h>

int fun_compteur(){
    static int num = 16;
    if(num++ < 20){
        printf("%d\n",num);
        fun_compteur();        
        printf("%d\n",num);
    }
    return num;
}
int sort_array(){
    int array[7] = {1,5,3,2,0,6};
    int i=0;
    if(array[i]!=i){
        printf("%d\n",array[i]);
        i++;
    }else{
        i++;
    }
}

int wtf(){
    int a = (1,2,3);
    printf('a=%d\n',a);
    return 0;
}
int xinit(){
    int arr[10] = { [2 ... 7] = 99, [8] = 42};
    for(int i=0; i<10; i++)
        printf("arr[%d] = %d\n",i,arr[i]);
    return 0;
    
}

int main(){
    //fun();
    //sort_array();
    //wtf();
    xinit();
    return 0;
}