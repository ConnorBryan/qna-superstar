 Q&A Superstar
 ======
 
## Purpose
* Simplify the process of transcribing Q&As on Reactiflux.

## How to Use
1. Create a file named '.env' in the root directory.
2. Follow the pattern in **.env.template** to add the following information:

* **BOT_TOKEN**: This is the token retrieved from https://discordapp.com/developers/applications/me/(id) under the 'Bot' section.  
* **CHANNEL_ID**: This is the ID of the channel the Q&A session took place in. Right click channel => Copy ID.  
* **INITIAL\_MESSAGE_ID**: This is the ID of the message directly preceding the first Q&A question. Right click message => Copy ID.  
* **FINAL\_MESSAGE_ID**: This is the ID of the message directly following the final Q&A answer. Right click message => Copy ID.  
* **RESPONDER**: This is the username (without the pound sign and four numbers) of the person answering questions. (e.g. connor#5456 is connor).  

3. Execute the command **yarn start**.

If everything was done correctly, a new file will exist in the root directory titled 'q&a.txt', formatted to contain relevant information to the session.