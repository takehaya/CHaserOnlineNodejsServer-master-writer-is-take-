/****************************************************/
/*													*/
/*	CHaserOnlineClient009Proxy						*/
/*	�N���p�����[�^������							*/
/*													*/
/*	Date	2013.4.11								*/
/*	Date	2014.3.5								*/
/*													*/
/*	jsessionid�̎w��̎d���ɒ��ӂ���				*/
/*													*/
/****************************************************/

//�N���p�����[�^�̏���
//	./CHaserOnlineClient009-2Proxy.o �^�[�Q�b�gurl [-x �v���L�V�A�h���X:�v���L�V�|�[�g -u ���[�UID -p �p�X���[�h -r ���[���ԍ�]
//	�p�����[�^�̏��ԁA�L���͔C�ӂł悢

int send_cmd(char *command, char *param, char *returnCode);
int returnCode2int(char *returnCode, int *returnNumber);
int Init(int argc, char **argv, char *ProxyAddress, int ProxyPort);

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <netinet/in.h>
#include <sys/param.h>
#include <sys/uio.h>
#include <unistd.h>

#define BUF_LEN 512                      /* �o�b�t�@�̃T�C�Y */
#define MAX_KEYWORD	30					/*�L�[���[�h�̍ő吔*/

struct sockaddr_in server;           /* �\�P�b�g���������߂̍\���� */

char host[BUF_LEN] = "localhost";    /* �ڑ�����z�X�g�� */
char path[BUF_LEN] = "/";            /* �v������p�X */
unsigned short port = 0;             /* �ڑ�����|�[�g�ԍ� */


	


int main(int argc, char *argv[]){
	
	int	i;
	int	RoomNumber = -1;
	char command[20];
	char param[BUF_LEN];
	char buff[10];
	char ProxyAddress[256];
	int  ProxyPort;
	char UserName[20];
	char PassWord[20];
	char ReturnCode[BUF_LEN];
	int  returnNumber[10];
	char *pivo;
	int  count;
	int  mode=5;

	strcpy(ProxyAddress, "");	//������
	

	/*-----------------------
	 �p�����[�^�̓ǂݍ���
	 * 2013.4.3
	 ------------------------*/
	i = 2;
	while(argv[i] != NULL){
		if(argv[i][0] == '-'){	//�p�����[�^�w��q��������
			switch(argv[i][1]){
				case	'x':	//�v���L�V�A�h���X:�v���L�V�|�[�g
					i++;
					pivo = strchr(argv[i], ':');	//�A�h���X�ƃ|�[�g��؂藣��
					*pivo = '\0';
					strcpy(ProxyAddress, argv[i]);
					ProxyPort = atoi((char *)(++pivo));
					break;
					
				case	'u':	//���[�UID
					i++;
					strcpy(UserName, argv[i]);
					break;
					
				case	'p':	//�p�X���[�h
					i++;
					strcpy(PassWord, argv[i]);
					break;
					
				case	'r':	//���[���ԍ�
					i++;
					RoomNumber = atoi(argv[i]);
					break;
					
				default:
					break;
			}
		}
		
		i++;
	}

	/*-----------------------
		�l�b�g���[�N�ڑ�
	-------------------------*/
	if(Init(argc, argv, ProxyAddress, ProxyPort)!=0){
		return -1;
	}

	/*-----------------------
	���[�U���ƃp�X���[�h���Z�b�g����
	-------------------------*/
	do{
		if(strcmp(UserName, "")==0){	//���[�U���p�����[�^���Ȃ����
			printf("UserName=");
			scanf("%s",UserName);
		}
		strcpy(param, "user=");
		strcat(param, UserName);
		if(strcmp(PassWord, "")==0){	//�p�X���[�h�p�����[�^���Ȃ����
			printf("PassWord=");
			scanf("%s",PassWord);
		}
		strcat(param, "&pass=");
		strcat(param, PassWord);
		send_cmd("UserCheck", param, ReturnCode);
		if(strcmp(ReturnCode, "roomNumber=")==0){		//���[�U�����󂯕t����ꂽ��
		}
		else{
		}
	}while(strcmp(ReturnCode, "roomNumber=")!=0);		//���[�U�����󂯕t������܂Ń��[�v

	/*--------------------
	���[���ԍ����w�肷��
	--------------------*/
	do{
		if(RoomNumber < 0){	//���[���ԍ��p�����[�^���Ȃ����
			printf("RoomNumber=");
			scanf("%d",&RoomNumber);
		}
		printf("RoomNumber=%d\n", RoomNumber);
		strcpy(param, "roomNumber=");
		sprintf(buff, "%d", RoomNumber);
		strcat(param, buff);
		send_cmd("RoomNumberCheck", param, ReturnCode);
	}while(strcmp(ReturnCode, "command1=")!=0);	//���[���ԍ����󂯕t������܂Ń��[�v

	while(1){
		/*-----------------------
		GetReady�𔭍s����
		-------------------------*/
		do{
			printf("\n\n\ndeb191 GetReady\n");	//�f�o�b�O�p	���̍s���폜����ƃZ�O�����g�G���[�ɂȂ�

			send_cmd("GetReadyCheck", "command1=gr", ReturnCode);
			if(strchr(ReturnCode, ',')!=NULL){		//GetReady���󂯕t����ꂽ��
			}
			else{
				if(strcmp(ReturnCode, "user=")==0){
					break;
				}
			}
		}while(strchr(ReturnCode, ',')==NULL);	//GetReady���󂯕t������܂Ń��[�v
		count = returnCode2int(ReturnCode, returnNumber);

		/*-----------------------
		Action�𔭍s����
		-------------------------*/
		do{
			strcpy(param, "command2=");
			if(returnNumber[5]==2){		//�������E���u���b�N��������
				mode = 7;				//����
			}
			else{
				mode = 5;					//�E��
			}
			switch(mode){
				case 1:
					strcat(param, "wu");
					break;
					
				case 3:
					strcat(param, "wl");
					break;
					
				case 5:
					strcat(param, "wr");
					break;
					
				case 7:
					strcat(param, "wd");
					break;
					
				default:
					strcat(param, "wr");
			}
			send_cmd("CommandCheck", param, ReturnCode);
		}while(strchr(ReturnCode, ',')==NULL&&strcmp(ReturnCode, "user=")!=0);	//Action���󂯕t������܂Ń��[�v

		/*-----------------------
		#�𔭍s����
		-------------------------*/
		i = 0;
		do{			
			send_cmd("EndCommandCheck", "command3=%23", ReturnCode);
			if(strcmp(ReturnCode, "command1=")==0){		//#���󂯕t����ꂽ��
			}
			else if(strcmp(ReturnCode, "user=")==0
					||i++>5){		//�Q�[���I����������
				printf("GameSet\n");
			
				return 0;	//�Q�[���I��
			}
			else{
			}
		}while(strcmp(ReturnCode, "command1=")!=0&&strcmp(ReturnCode, "user=")!=0);
	}

}



int send_cmd(char *command, char *param, char *returnCode){
    char buf[BUF_LEN];					//�T�[�o�ԓ�
    char WebBuf[BUF_LEN*10];
    int s;                               /* �\�P�b�g�̂��߂̃t�@�C���f�B�X�N���v�^ */
    char send_buf[BUF_LEN];              /* �T�[�o�ɑ��� HTTP �v���g�R���p�o�b�t�@ */

    static char SessionID[100];					//�Z�b�V����ID
    char *SessionIDstart;				//�Z�b�V����ID�L���J�n�ʒu
    char *SessionIDend;					//�Z�b�V����ID�L���I���ʒu
	int	 SessionIDlength;				//�Z�b�V����ID�̒���

	char ReturnBuf[BUF_LEN];
	char *ReturnBufStart;
	char *ReturnBufEnd;
	int  ReturnBufLength;

	char keyword[MAX_KEYWORD][30]=
		{
			"user=", "<input",
			"command1=", "<input",
			"GetReady ReturnCode=", "\n",
			"command2=", "<input",
			"Action ReturnCode=", "\n",
			"command3=", "<input",
			"roomNumber=", "<input"
		};
		
	
	int  i;

	returnCode[0] = '\0';
	
	/* �\�P�b�g���� */
    if ( ( s = socket(AF_INET, SOCK_STREAM, 0) ) < 0 ){
		fprintf(stderr, "���P�b�g�̐����Ɏ��s���܂����B\n");	//�J�^�J�i�́u���v�̓��[�j���O���o��
        return 1;
    }
    
    /* �T�[�o�ɐڑ� */
    if ( connect(s, (struct sockaddr *)&server, sizeof(server)) == -1 ){
        fprintf(stderr, "connect �Ɏ��s���܂����B\n");
        return 1;
    }

    /* HTTP �v���g�R������ & �T�[�o�ɑ��M */
	if(strcmp(SessionID, "")==0){
		sprintf(send_buf, 
			"GET http://%s/CHaserOnline003/user/%s?%s HTTP/1.1\r\n",
			host, command, param);
	}
	else{
		sprintf(send_buf, 
			"GET http://%s/CHaserOnline003/user/%s;jsessionid=%s?%s HTTP/1.1\r\n",
			host, command, SessionID, param);
	}
	
	printf("send_buf=%s\n", send_buf);
	
	write(s, send_buf, strlen(send_buf));
    sprintf(send_buf, "Host: %s:%d\r\n", host, port);
    write(s, send_buf, strlen(send_buf));
    sprintf(send_buf, "\r\n");
    write(s, send_buf, strlen(send_buf));

	/* ���Ƃ͎�M���āA�\�����邾�� */
        int read_size;
        read_size = read(s, buf, BUF_LEN);
        if ( read_size > 0 ){
			//write(1, buf, read_size);
			printf("%s", buf);

			//�T�[�o�ԓ�����Z�b�V�����h�c�����o��
			SessionIDstart = strstr(buf, "JSESSIONID=");
			if(SessionIDstart != NULL){
				SessionIDend = strchr(SessionIDstart, ';');
				if(SessionIDend != NULL){
					SessionIDlength = SessionIDend - SessionIDstart - 11; 
					strncpy(SessionID, SessionIDstart+11, SessionIDlength);
					SessionID[SessionIDlength] = '\0';	//������I�[�̕␳
				}
				else{
				}
			}
			else{
			}
			strcpy(WebBuf, buf);

			do{
				read_size = read(s, buf, BUF_LEN);
				//write(1, buf, read_size);
				printf("%s", buf);
				strcat(WebBuf, buf);
			}while(read_size >= BUF_LEN);
			printf("len(WebBuf)=%d\n", strlen(WebBuf));
			
			for(i = 0; i<=MAX_KEYWORD; i=i+2){
				if(keyword[i][0]=='\0'){
					break;
				}
				//�T�[�o�ԓ�����ReturnCode�����o��
				ReturnBufStart = strstr(WebBuf, keyword[i]);
				if(ReturnBufStart != NULL){
					ReturnBufEnd = strstr(ReturnBufStart, keyword[i+1]);
					if(ReturnBufEnd != NULL){
						ReturnBufLength = ReturnBufEnd - ReturnBufStart - strlen(keyword[i]); 
						if(ReturnBufLength == 0){
							strcpy(ReturnBuf, keyword[i]);
						}
						else{
							strncpy(ReturnBuf, ReturnBufStart+strlen(keyword[i]), ReturnBufLength);
							ReturnBuf[ReturnBufLength] = '\0';	//������I�[�̕␳
						}
						strcpy(returnCode, ReturnBuf);
						i = MAX_KEYWORD + 1;
						
						printf("command=%s\n", command);
						printf("ReturnCode=%s\n", returnCode);
						
						close(s);
						return 0;
					}
				}
			}
		}
	/* ��n�� */
    close(s);
	return 0;
}


    
int returnCode2int(char *returnCode, int *returnNumber){
	int	 i=0;
	char *buf;
	int  count = 0;
	
	buf = strtok(returnCode, ",");
	if(buf != NULL){
		count++;
		returnNumber[i] = atoi(buf);
		for(i=1; i<9; i++){
			buf = strtok(NULL, ",");
			if(buf != NULL){
				count++;
				returnNumber[i] = atoi(buf);
			}
			else{
				break;
			}
		}
		return count;
	}
	else{
		return -1;
	}
}

int Init(int argc, char **argv, char *ProxyAddress, int ProxyPort)
{
    struct hostent *servhost;            /* �z�X�g���� IP �A�h���X���������߂̍\���� */
    struct servent *service;             /* �T�[�r�X (http �Ȃ�) ���������߂̍\���� */

	if ( argc > 1 ){                     /* URL���w�肳��Ă����� */
		char host_path[BUF_LEN];

		if ( strlen(argv[1]) > BUF_LEN-1 ){
            fprintf(stderr, "URL ���������܂��B\n");
            return 1;
        }
                                         /* http:// ����n�܂镶����� */
                                         /* sscanf ���������� */
                                         /* http:// �̌�ɉ��������񂪑��݂���Ȃ� */
        if ( strstr(argv[1], "http://") &&
             sscanf(argv[1], "http://%s", host_path) &&
             strcmp(argv[1], "http://" ) ){

            char *p;
            p = strchr(host_path, '/');  /* �z�X�g�ƃp�X�̋�؂� "/" �𒲂ׂ� */
            if ( p != NULL ){
                strcpy(path, p);        /* "/"�ȍ~�̕������ path �ɃR�s�[ */
                *p = '\0';
                strcpy(host, host_path); /* "/"���O�̕������ host �ɃR�s�[ */
            } else {                     /* "/"���Ȃ��Ȃ灁http://host �Ƃ��������Ȃ� */
                strcpy(host, host_path); /* ������S�̂� host �ɃR�s�[ */
            }

            p = strchr(host, ':');       /* �z�X�g���̕����� ":" ���܂܂�Ă����� */
            if ( p != NULL ){
                port = atoi(p+1);        /* �|�[�g�ԍ����擾 */
                if ( port <= 0 ){        /* �����łȂ� (atoi �����s) ���A0 �������� */
                    port = 80;         /* �|�[�g�ԍ��� 80 �Ɍ��ߑł� */
                }
                *p = '\0';
            }
        } else {
            fprintf(stderr, "URL �� http://host/path �̌`���Ŏw�肵�Ă��������B\n");
            return 1;
        }
    }

    printf("http://%s%s ���擾���܂��B\n\n", host, path);

	/* �z�X�g�̏��(IP�A�h���X�Ȃ�)���擾 */
	if(strcmp(ProxyAddress, "") == 0){
		servhost = gethostbyname(host);
		if ( servhost == NULL ){
			fprintf(stderr, "[%s] ���� IP �A�h���X�ւ̕ϊ��Ɏ��s���܂����B\n", host);
			return 0;
		}
	}
	else{
		servhost = gethostbyname(ProxyAddress);	//�v���L�V�̐ݒ�
		if ( servhost == NULL ){
			fprintf(stderr, "[%s] ���� IP �A�h���X�ւ̕ϊ��Ɏ��s���܂����B\n", ProxyAddress);
			return 0;
		}
	}

    bzero(&server, sizeof(server));            /* �\���̂��[���N���A */
	printf("[debug]bzero()\n");	//�f�o�b�O�p
	
    server.sin_family = AF_INET;

                                               /* IP�A�h���X�������\���̂��R�s�[ */
    bcopy(servhost->h_addr, &server.sin_addr, servhost->h_length);

	if(strcmp(ProxyAddress, "") == 0){
		if ( port != 0 ){                          /* �����Ń|�[�g�ԍ����w�肳��Ă����� */
			server.sin_port = htons(port);
		} else {                                   /* �����łȂ��Ȃ� getservbyname �Ń|�[�g�ԍ����擾 */
			service = getservbyname("http", "tcp");
			if ( service != NULL ){                /* ����������|�[�g�ԍ����R�s�[ */
				server.sin_port = service->s_port;
			} else {                               /* ���s������ 80 �ԂɌ��ߑł� */
				server.sin_port = htons(80);
			}
		}
	}
	else{
		server.sin_port = htons(ProxyPort);		//�v���L�V�̃|�[�g��ݒ肷��
	}
	
	return 0;
}

