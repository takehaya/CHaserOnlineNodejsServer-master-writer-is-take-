/****************************************************/
/*													*/
/*	CHaserOnlineClient009Proxy						*/
/*	起動パラメータをつける							*/
/*													*/
/*	Date	2013.4.11								*/
/*	Date	2014.3.5								*/
/*													*/
/*	jsessionidの指定の仕方に注意する				*/
/*													*/
/****************************************************/

//起動パラメータの書式
//	./CHaserOnlineClient009-2Proxy.o ターゲットurl [-x プロキシアドレス:プロキシポート -u ユーザID -p パスワード -r ルーム番号]
//	パラメータの順番、有無は任意でよい

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

#define BUF_LEN 512                      /* バッファのサイズ */
#define MAX_KEYWORD	30					/*キーワードの最大数*/

struct sockaddr_in server;           /* ソケットを扱うための構造体 */

char host[BUF_LEN] = "localhost";    /* 接続するホスト名 */
char path[BUF_LEN] = "/";            /* 要求するパス */
unsigned short port = 0;             /* 接続するポート番号 */


	


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

	strcpy(ProxyAddress, "");	//初期化
	

	/*-----------------------
	 パラメータの読み込み
	 * 2013.4.3
	 ------------------------*/
	i = 2;
	while(argv[i] != NULL){
		if(argv[i][0] == '-'){	//パラメータ指定子だったら
			switch(argv[i][1]){
				case	'x':	//プロキシアドレス:プロキシポート
					i++;
					pivo = strchr(argv[i], ':');	//アドレスとポートを切り離す
					*pivo = '\0';
					strcpy(ProxyAddress, argv[i]);
					ProxyPort = atoi((char *)(++pivo));
					break;
					
				case	'u':	//ユーザID
					i++;
					strcpy(UserName, argv[i]);
					break;
					
				case	'p':	//パスワード
					i++;
					strcpy(PassWord, argv[i]);
					break;
					
				case	'r':	//ルーム番号
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
		ネットワーク接続
	-------------------------*/
	if(Init(argc, argv, ProxyAddress, ProxyPort)!=0){
		return -1;
	}

	/*-----------------------
	ユーザ名とパスワードをセットする
	-------------------------*/
	do{
		if(strcmp(UserName, "")==0){	//ユーザ名パラメータがなければ
			printf("UserName=");
			scanf("%s",UserName);
		}
		strcpy(param, "user=");
		strcat(param, UserName);
		if(strcmp(PassWord, "")==0){	//パスワードパラメータがなければ
			printf("PassWord=");
			scanf("%s",PassWord);
		}
		strcat(param, "&pass=");
		strcat(param, PassWord);
		send_cmd("UserCheck", param, ReturnCode);
		if(strcmp(ReturnCode, "roomNumber=")==0){		//ユーザ名が受け付けられたら
		}
		else{
		}
	}while(strcmp(ReturnCode, "roomNumber=")!=0);		//ユーザ名が受け付けられるまでループ

	/*--------------------
	ルーム番号を指定する
	--------------------*/
	do{
		if(RoomNumber < 0){	//ルーム番号パラメータがなければ
			printf("RoomNumber=");
			scanf("%d",&RoomNumber);
		}
		printf("RoomNumber=%d\n", RoomNumber);
		strcpy(param, "roomNumber=");
		sprintf(buff, "%d", RoomNumber);
		strcat(param, buff);
		send_cmd("RoomNumberCheck", param, ReturnCode);
	}while(strcmp(ReturnCode, "command1=")!=0);	//ルーム番号が受け付けられるまでループ

	while(1){
		/*-----------------------
		GetReadyを発行する
		-------------------------*/
		do{
			printf("\n\n\ndeb191 GetReady\n");	//デバッグ用	この行を削除するとセグメントエラーになる

			send_cmd("GetReadyCheck", "command1=gr", ReturnCode);
			if(strchr(ReturnCode, ',')!=NULL){		//GetReadyが受け付けられたら
			}
			else{
				if(strcmp(ReturnCode, "user=")==0){
					break;
				}
			}
		}while(strchr(ReturnCode, ',')==NULL);	//GetReadyが受け付けられるまでループ
		count = returnCode2int(ReturnCode, returnNumber);

		/*-----------------------
		Actionを発行する
		-------------------------*/
		do{
			strcpy(param, "command2=");
			if(returnNumber[5]==2){		//もしも右がブロックだったら
				mode = 7;				//下へ
			}
			else{
				mode = 5;					//右へ
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
		}while(strchr(ReturnCode, ',')==NULL&&strcmp(ReturnCode, "user=")!=0);	//Actionが受け付けられるまでループ

		/*-----------------------
		#を発行する
		-------------------------*/
		i = 0;
		do{			
			send_cmd("EndCommandCheck", "command3=%23", ReturnCode);
			if(strcmp(ReturnCode, "command1=")==0){		//#が受け付けられたら
			}
			else if(strcmp(ReturnCode, "user=")==0
					||i++>5){		//ゲーム終了だったら
				printf("GameSet\n");
			
				return 0;	//ゲーム終了
			}
			else{
			}
		}while(strcmp(ReturnCode, "command1=")!=0&&strcmp(ReturnCode, "user=")!=0);
	}

}



int send_cmd(char *command, char *param, char *returnCode){
    char buf[BUF_LEN];					//サーバ返答
    char WebBuf[BUF_LEN*10];
    int s;                               /* ソケットのためのファイルディスクリプタ */
    char send_buf[BUF_LEN];              /* サーバに送る HTTP プロトコル用バッファ */

    static char SessionID[100];					//セッションID
    char *SessionIDstart;				//セッションID記入開始位置
    char *SessionIDend;					//セッションID記入終了位置
	int	 SessionIDlength;				//セッションIDの長さ

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
	
	/* ソケット生成 */
    if ( ( s = socket(AF_INET, SOCK_STREAM, 0) ) < 0 ){
		fprintf(stderr, "そケットの生成に失敗しました。\n");	//カタカナの「そ」はワーニングが出る
        return 1;
    }
    
    /* サーバに接続 */
    if ( connect(s, (struct sockaddr *)&server, sizeof(server)) == -1 ){
        fprintf(stderr, "connect に失敗しました。\n");
        return 1;
    }

    /* HTTP プロトコル生成 & サーバに送信 */
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

	/* あとは受信して、表示するだけ */
        int read_size;
        read_size = read(s, buf, BUF_LEN);
        if ( read_size > 0 ){
			//write(1, buf, read_size);
			printf("%s", buf);

			//サーバ返答からセッションＩＤを取り出す
			SessionIDstart = strstr(buf, "JSESSIONID=");
			if(SessionIDstart != NULL){
				SessionIDend = strchr(SessionIDstart, ';');
				if(SessionIDend != NULL){
					SessionIDlength = SessionIDend - SessionIDstart - 11; 
					strncpy(SessionID, SessionIDstart+11, SessionIDlength);
					SessionID[SessionIDlength] = '\0';	//文字列終端の補正
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
				//サーバ返答からReturnCodeを取り出す
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
							ReturnBuf[ReturnBufLength] = '\0';	//文字列終端の補正
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
	/* 後始末 */
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
    struct hostent *servhost;            /* ホスト名と IP アドレスを扱うための構造体 */
    struct servent *service;             /* サービス (http など) を扱うための構造体 */

	if ( argc > 1 ){                     /* URLが指定されていたら */
		char host_path[BUF_LEN];

		if ( strlen(argv[1]) > BUF_LEN-1 ){
            fprintf(stderr, "URL が長すぎます。\n");
            return 1;
        }
                                         /* http:// から始まる文字列で */
                                         /* sscanf が成功して */
                                         /* http:// の後に何か文字列が存在するなら */
        if ( strstr(argv[1], "http://") &&
             sscanf(argv[1], "http://%s", host_path) &&
             strcmp(argv[1], "http://" ) ){

            char *p;
            p = strchr(host_path, '/');  /* ホストとパスの区切り "/" を調べる */
            if ( p != NULL ){
                strcpy(path, p);        /* "/"以降の文字列を path にコピー */
                *p = '\0';
                strcpy(host, host_path); /* "/"より前の文字列を host にコピー */
            } else {                     /* "/"がないなら＝http://host という引数なら */
                strcpy(host, host_path); /* 文字列全体を host にコピー */
            }

            p = strchr(host, ':');       /* ホスト名の部分に ":" が含まれていたら */
            if ( p != NULL ){
                port = atoi(p+1);        /* ポート番号を取得 */
                if ( port <= 0 ){        /* 数字でない (atoi が失敗) か、0 だったら */
                    port = 80;         /* ポート番号は 80 に決め打ち */
                }
                *p = '\0';
            }
        } else {
            fprintf(stderr, "URL は http://host/path の形式で指定してください。\n");
            return 1;
        }
    }

    printf("http://%s%s を取得します。\n\n", host, path);

	/* ホストの情報(IPアドレスなど)を取得 */
	if(strcmp(ProxyAddress, "") == 0){
		servhost = gethostbyname(host);
		if ( servhost == NULL ){
			fprintf(stderr, "[%s] から IP アドレスへの変換に失敗しました。\n", host);
			return 0;
		}
	}
	else{
		servhost = gethostbyname(ProxyAddress);	//プロキシの設定
		if ( servhost == NULL ){
			fprintf(stderr, "[%s] から IP アドレスへの変換に失敗しました。\n", ProxyAddress);
			return 0;
		}
	}

    bzero(&server, sizeof(server));            /* 構造体をゼロクリア */
	printf("[debug]bzero()\n");	//デバッグ用
	
    server.sin_family = AF_INET;

                                               /* IPアドレスを示す構造体をコピー */
    bcopy(servhost->h_addr, &server.sin_addr, servhost->h_length);

	if(strcmp(ProxyAddress, "") == 0){
		if ( port != 0 ){                          /* 引数でポート番号が指定されていたら */
			server.sin_port = htons(port);
		} else {                                   /* そうでないなら getservbyname でポート番号を取得 */
			service = getservbyname("http", "tcp");
			if ( service != NULL ){                /* 成功したらポート番号をコピー */
				server.sin_port = service->s_port;
			} else {                               /* 失敗したら 80 番に決め打ち */
				server.sin_port = htons(80);
			}
		}
	}
	else{
		server.sin_port = htons(ProxyPort);		//プロキシのポートを設定する
	}
	
	return 0;
}

