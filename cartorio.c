#include <stdio.h> // biblioteca de comunicação com o usuário
#include <stdlib.h> //  biblioteca de alocação de espaço em memória, usada por conta do banco de dados tambem 
#include <locale.h> // biblioteca de alocações de texto por região
#include <string.h> // biblioteca responsável por cuidar das string


int registro() // funçcao responsável por cadastrar os usuários no sistema
{
	// inicio  criação de variáveis/strings
	char arquivo[99];
    char cpf[99];
    char nome[99];
    char sobrenome[99];
    char cargo[99];
    // fim  criação de variáveis/strings
    
    // CPF //
    printf("Digite o CPF a ser cadastrado:"); //coletando informação do usuário
    scanf("%s", cpf); // %s refere-se a string
    
    strcpy(arquivo, cpf); // Responsável por copiar os valores das string
    
    FILE *file; // cria o arquivo no banco de dados
    
    file = fopen(arquivo, "w"); // cria o arquivo
    fprintf (file, cpf); // Salvo o valor da variável
    fclose(file); // Fecha o arquivo
    
    file = fopen(arquivo, "a");
    fprintf (file, ",");
    fclose(file);
    
    // NOME //
    printf("Digite o nome a ser cadastrado:"); 
    scanf("%s",nome);
    
    file = fopen(arquivo,"a");
    fprintf(file, nome);
	fclose(file);
	
	file = fopen(arquivo, "a");
    fprintf (file, ",");
    fclose(file);
    
    // SOBRENOME //
    printf("Digite o sobrenome a ser cadastrado:"); 
    scanf("%s",sobrenome);
    
    file = fopen(arquivo,"a");
    fprintf(file, sobrenome);
	fclose(file);
	
	file = fopen(arquivo, "a");
    fprintf (file, ",");
    fclose(file);
    
    // CARGO //
    printf("Digite o cargo a ser cadastrado:"); 
    scanf("%s", cargo);
    
    file = fopen(arquivo,"a");
    fprintf(file, cargo);
	fclose(file);
    
    system("pause");
	
}

int consulta()
{
    setlocale (LC_ALL,"Portuguese"); // Definindo a linguagem
     
    char cpf[99];
    char conteudo[999];
   
    
    printf("Digite o CPF a ser consultado: ");
    scanf("%s", cpf);
    
    FILE *file;
    file = fopen(cpf, "r");
    
    if(file == NULL)
	{
		printf("Não foi possível abrir o arquivo, não localizado!\n");
	}
    
    while(fgets(conteudo, 999, file) != NULL)
    {
    	printf("\nEssas são as informações do usuário:",conteudo);
    	printf("%s", conteudo);
    	printf("\n\n");
	}
	
	system("pause");

    
    
}

int deletar()
{
   char cpf [99];
   
   printf("Digite o CPF do usuário a ser deletado: ");
   scanf("%s", cpf);
   
   remove(cpf);
   
   FILE *file;
   file = fopen(cpf,"r");
   
   if( file == NULL)
   {
   	 printf("O usuário não se encontra no sistema! \n");
   	 system ("pause");
   	 
   }
   
}


int main ()
{
	
    int opcao=0; // Definindo as variáveis
    int laco=1;
    
    for(laco=1;laco=1;)
    {
       
       system("cls");

	  setlocale (LC_ALL,"Portuguese"); // Definindo a linguagem
	
	  printf("###Cártorio da EBAC###\n\n"); // Inicio do menu
   	  printf("Escolha a opção desejada do menu\n\n");
	  printf("\t1 - Registrar nomes\n");
	  printf("\t2 - Consultar nomes\n");
	  printf("\t3 - Deletar nomes\n\n\n");
	  printf("Opção: ");// Fim do menu
	
	  scanf("%d", &opcao); // Armazenando a escolha do usuário
	
	  system("cls"); // responsável por limpar a tela
	  
	  switch(opcao) // inicio da seleção do menu
	  { 
	   	case 1:
	    registro(); // chamada de funções
    	break;
    	
    	case 2:
    	consulta();
    	break;
    	
    	case 3:
    	deletar();
    	break;
    	
    	
    	default:
    	printf("Essa opção não está disponível!\n");
	 	system("pause");
	 	break;
    	
	  }  
	  		
	  
	}  // Fim da seleção
	
    
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
}

